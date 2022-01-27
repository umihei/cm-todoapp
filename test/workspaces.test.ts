import { Template } from '@aws-cdk/assertions';
import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import { TodoappStack, TodoappStackProps } from '../lib/workspaces-stack';

test('cognito userpool Created', () => {
    const stack = new cdk.Stack();

    const props: TodoappStackProps = {
        callbackUrls: ['local'],
        logoutUrls: ['local'],
        frontendUrls: ['local'],
        domainPrefix: 'test',
    }

    const testStack = new TodoappStack(stack, 'MyTestStack', props);

    const template = Template.fromStack(testStack);

    template.resourceCountIs('AWS::Cognito::UserPool', 1);
    template.resourceCountIs('AWS::Cognito::UserPoolDomain', 1);
    template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
    template.resourceCountIs("AWS::DynamoDB::Table", 1);
    template.resourceCountIs("AWS::ApiGatewayV2::Api", 1);


    template.hasResourceProperties('AWS::Cognito::UserPool', {
        "AccountRecoverySetting": {
            "RecoveryMechanisms": [
                {
                    "Name": "verified_email",
                    "Priority": 1
                }
            ]
        },
        "AdminCreateUserConfig": {
            "AllowAdminCreateUserOnly": false
        },
        "AliasAttributes": [
            "email"
        ],
        "AutoVerifiedAttributes": [
            "email"
        ],
        "EmailVerificationMessage": "Please verify your email. your verification code is {####}",
        "EmailVerificationSubject": "Verify your email",
        "Schema": [
            {
                "Mutable": true,
                "Name": "email",
                "Required": true
            },
            {
                "Mutable": true,
                "Name": "phone_number",
                "Required": false
            }
        ],
        "SmsVerificationMessage": "your verification code is {####}",
        "UsernameConfiguration": {
            "CaseSensitive": true
        },
        "VerificationMessageTemplate": {
            "DefaultEmailOption": "CONFIRM_WITH_CODE",
            "EmailMessage": "Please verify your email. your verification code is {####}",
            "EmailSubject": "Verify your email",
            "SmsMessage": "your verification code is {####}"
        }
    })

    template.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
        "Domain": "test",
        "UserPoolId": {
            "Ref": "userPoolDC9497E0"
        }
    })

    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        "UserPoolId": {
            "Ref": "userPoolDC9497E0"
        },
        "AllowedOAuthFlows": [
            "code"
        ],
        "AllowedOAuthFlowsUserPoolClient": true,
        "AllowedOAuthScopes": [
            "email",
            "openid",
            "profile"
        ],
        "CallbackURLs": [
            "local"
        ],
        "LogoutURLs": [
            "local"
        ],
        "SupportedIdentityProviders": [
            "COGNITO"
        ]
    },
    )

    template.hasResourceProperties("AWS::DynamoDB::Table", {
        "KeySchema": [
            {
                "AttributeName": "userName",
                "KeyType": "HASH"
            },
            {
                "AttributeName": "todoId",
                "KeyType": "RANGE"
            }
        ],
        "AttributeDefinitions": [
            {
                "AttributeName": "userName",
                "AttributeType": "S"
            },
            {
                "AttributeName": "todoId",
                "AttributeType": "S"
            }
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    })



});
