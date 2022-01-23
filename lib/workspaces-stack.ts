import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as apigw from '@aws-cdk/aws-apigatewayv2';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2/lib/http/route';
import * as intg from '@aws-cdk/aws-apigatewayv2-integrations';
import * as nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as authz from '@aws-cdk/aws-apigatewayv2-authorizers';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export interface TodoappAuthStackProps extends cdk.StackProps {
  callbackUrls: string[];
  logoutUrls: string[];
  frontendUrls: string[];
  domainPrefix: string;
}

export class TodoappAuthStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: TodoappAuthStackProps
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
    });

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
    httpApi.addRoutes({
      methods: [HttpMethod.GET, HttpMethod.POST],
      path: '/users/{username}/todos',
      integration: new intg.HttpLambdaIntegration(
        'protected-fn-integration',
        registerFn),
    });



    new cdk.CfnOutput(this, 'OutputApiUrl', { value: httpApi.url! });
    new cdk.CfnOutput(this, 'userPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'OutputDomainPrefix', { value: props.domainPrefix });
    new cdk.CfnOutput(this, 'OutputClientId', {
      value: userPoolClient.userPoolClientId,
    });
  }
}