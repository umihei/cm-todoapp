import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as apigw from '@aws-cdk/aws-apigatewayv2';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2/lib/http/route';
import * as intg from '@aws-cdk/aws-apigatewayv2-integrations';
import * as nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as authz from '@aws-cdk/aws-apigatewayv2-authorizers';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as os from '@aws-cdk/aws-opensearchservice';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { RemovalPolicy } from '@aws-cdk/core';

export interface TodoappStackProps extends cdk.StackProps {
  callbackUrls: string[];
  logoutUrls: string[];
  frontendUrls: string[];
  domainPrefix: string;
}

export class TodoappStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: TodoappStackProps
  ) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, 'userPool', {
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email',
        emailBody: 'Please verify your email. your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: 'your verification code is {####}',
      },
      standardAttributes: {
        email: { required: true, mutable: true },
        phoneNumber: { required: false },
      },
      signInCaseSensitive: true,
      autoVerify: { email: true },
      signInAliases: { email: true, username: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    userPool.addDomain('domain', {
      cognitoDomain: { domainPrefix: props.domainPrefix },
    });
    const userPoolClient = userPool.addClient('client', {
      oAuth: {
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: props.callbackUrls,
        logoutUrls: props.logoutUrls,
        flows: { authorizationCodeGrant: true },
      },
    });

    const todoTable = new dynamodb.Table(this, 'todoTable', {
      partitionKey: { name: 'userName', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'todoId', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // opensearch service
    const osDomain = new os.Domain(this, 'opensearch', {
      version: os.EngineVersion.OPENSEARCH_1_0,
      capacity: {
        dataNodeInstanceType: 't3.small.search',
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    // dynamodb streaming reciever fn
    const streamingRecieverFn = new nodejs.NodejsFunction(this, 'streamingFn', {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: "lambda/handler/streamHandler.ts",
      environment: {
        OS_DOMAIN: osDomain.domainEndpoint,
        OS_INDEX: todoTable.tableName,
        PK: todoTable.schema().partitionKey.name,
        SK: todoTable.schema().sortKey!.name,
        REGION: 'ap-northeast-1',
      },
    })

    streamingRecieverFn.addEventSource(new DynamoEventSource(todoTable, {
      startingPosition: StartingPosition.TRIM_HORIZON
    }));

    osDomain.grantReadWrite(streamingRecieverFn);

    streamingRecieverFn.addToRolePolicy(new PolicyStatement({
      actions: ["es:*"],
      resources: ["*"],
    }))

    const registerFn = new nodejs.NodejsFunction(this, 'register', {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      entry: "lambda/handler/registerHandler.ts",
      environment: {
        TODO_TABLE_NAME: todoTable.tableName,
        REGION: 'ap-northeast-1',
      },
    });

    todoTable.grantReadWriteData(registerFn);

    const queryFn = new nodejs.NodejsFunction(this, 'query', {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      entry: "lambda/handler/queryHandler.ts",
      environment: {
        TODO_TABLE_NAME: todoTable.tableName,
        REGION: 'ap-northeast-1',
        OS_DOMAIN: osDomain.domainEndpoint,
        OS_INDEX: todoTable.tableName,
        SK: todoTable.schema().sortKey!.name,
      },
    });

    todoTable.grantReadWriteData(queryFn);

    osDomain.grantRead(queryFn);

    queryFn.addToRolePolicy(new PolicyStatement({
      actions: ["es:*"],
      resources: ["*"],
    }))

    const updateFn = new nodejs.NodejsFunction(this, 'update', {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      entry: "lambda/handler/updateHandler.ts",
      environment: {
        TODO_TABLE_NAME: todoTable.tableName,
        REGION: 'ap-northeast-1',
      },
    });

    todoTable.grantReadWriteData(updateFn);

    const deleteFn = new nodejs.NodejsFunction(this, 'delete', {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      entry: "lambda/handler/deleteHandler.ts",
      environment: {
        TODO_TABLE_NAME: todoTable.tableName,
        REGION: 'ap-northeast-1',
      },
    });

    todoTable.grantReadWriteData(deleteFn);

    const createIndexFn = new nodejs.NodejsFunction(this, 'createIndex', {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 128,
      entry: "lambda/infra/createOpenSearchIndex.ts",
      environment: {
        TODO_TABLE_NAME: todoTable.tableName,
        REGION: 'ap-northeast-1',
        OS_DOMAIN: osDomain.domainEndpoint,
        OS_INDEX: todoTable.tableName,
        SK: todoTable.schema().sortKey!.name,
      },
    });

    osDomain.grantRead(createIndexFn);

    createIndexFn.addToRolePolicy(new PolicyStatement({
      actions: ["es:*"],
      resources: ["*"],
    }))

    const deleteIndexFn = new nodejs.NodejsFunction(this, 'deleteIndex', {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 128,
      entry: "lambda/infra/deleteOpenSearchIndex.ts",
      environment: {
        TODO_TABLE_NAME: todoTable.tableName,
        REGION: 'ap-northeast-1',
        OS_DOMAIN: osDomain.domainEndpoint,
        OS_INDEX: 'todoindex',
        SK: todoTable.schema().sortKey!.name,
      },
    });

    osDomain.grantRead(deleteIndexFn);

    deleteIndexFn.addToRolePolicy(new PolicyStatement({
      actions: ["es:*"],
      resources: ["*"],
    }))

    const authorizer = new authz.HttpUserPoolAuthorizer(
      'user-pool-authorizer',
      userPool,
      {
        userPoolClients: [userPoolClient],
        identitySource: ['$request.header.Authorization'],
      });

    const httpApi = new apigw.HttpApi(this, 'Api', {
      defaultAuthorizer: authorizer,
      corsPreflight: {
        allowOrigins: props.frontendUrls,
        allowMethods: [apigw.CorsHttpMethod.ANY],
        allowHeaders: ['Authorization', 'Content-Type'],
      },
    });

    // path,methodとLambda関数を関連付ける

    httpApi.addRoutes({
      methods: [HttpMethod.POST],
      path: '/users/{username}/todos',
      integration: new intg.HttpLambdaIntegration(
        'protected-fn-integration',
        registerFn),
    });

    httpApi.addRoutes({
      methods: [HttpMethod.GET],
      path: '/users/{username}/todos',
      integration: new intg.HttpLambdaIntegration(
        'protected-fn-integration',
        queryFn),
    });

    httpApi.addRoutes({
      methods: [HttpMethod.PUT],
      path: '/users/{username}/todos/{todoid}',
      integration: new intg.HttpLambdaIntegration(
        'protected-fn-integration',
        updateFn),
    });

    httpApi.addRoutes({
      methods: [HttpMethod.DELETE],
      path: '/users/{username}/todos/{todoid}',
      integration: new intg.HttpLambdaIntegration(
        'protected-fn-integration',
        deleteFn),
    });


    new cdk.CfnOutput(this, 'OutputApiUrl', { value: httpApi.url! });
    new cdk.CfnOutput(this, 'userPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'OutputDomainPrefix', { value: props.domainPrefix });
    new cdk.CfnOutput(this, 'OutputClientId', {
      value: userPoolClient.userPoolClientId,
    });
  }
}