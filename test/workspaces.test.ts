import { Template } from '@aws-cdk/assertions';
import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import { TodoappStack, TodoappStackProps } from '../lib/workspaces-stack';

test('main resource Created', () => {
    const stack = new cdk.Stack();

    const props: TodoappStackProps = {
        callbackUrls: ['local'],
        logoutUrls: ['local'],
        frontendUrls: ['local'],
        domainPrefix: 'test',
    }

    const testStack = new TodoappStack(stack, 'MyTestStack', props);

    const template = Template.fromStack(testStack);

    // メインのリソースの数をチェック

    template.resourceCountIs('AWS::Cognito::UserPool', 1);
    template.resourceCountIs('AWS::Cognito::UserPoolDomain', 1);
    template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
    template.resourceCountIs("AWS::DynamoDB::Table", 1);
    template.resourceCountIs("AWS::ApiGatewayV2::Api", 1);

    // Congnito Userpoolをチェック
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

    // opensearchのリソース
    template.hasResourceProperties("AWS::OpenSearchService::Domain", {
        "ClusterConfig": {
            "InstanceCount": 1,
            "DedicatedMasterEnabled": false,
            "InstanceType": "t3.small.search",
            "ZoneAwarenessEnabled": false
        },
        "CognitoOptions": {
            "Enabled": false
        },
        "DomainEndpointOptions": {
            "EnforceHTTPS": false,
            "TLSSecurityPolicy": "Policy-Min-TLS-1-0-2019-07"
        },
        "EBSOptions": {
            "EBSEnabled": true,
            "VolumeType": "gp2",
            "VolumeSize": 10
        },
        "EncryptionAtRestOptions": {
            "Enabled": false
        },
        "EngineVersion": "OpenSearch_1.0",
        "LogPublishingOptions": {},
        "NodeToNodeEncryptionOptions": {
            "Enabled": false
        }
    })

    // streaming
    template.hasResourceProperties("AWS::Lambda::Function", {
        "Environment": {
            "Variables": {
                "OS_DOMAIN": {
                    "Fn::GetAtt": [
                        "opensearch2F25E4C7",
                        "DomainEndpoint"
                    ]
                },
                "OS_INDEX": {
                    "Ref": "todoTableC937F2F9"
                },
                "PK": "userName",
                "SK": "todoId",
                "REGION": "ap-northeast-1",
                "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1"
            }
        },
        "Handler": "index.handler",
        "Runtime": "nodejs14.x"
    })

    // register
    template.hasResourceProperties("AWS::Lambda::Function", {
        "Environment": {
            "Variables": {
                "TODO_TABLE_NAME": {
                    "Ref": "todoTableC937F2F9"
                },
                "REGION": "ap-northeast-1",
                "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1"
            }
        },
        "Handler": "index.handler",
        "MemorySize": 128,
        "Runtime": "nodejs14.x",
        "Timeout": 10
    })

    // query
    template.hasResourceProperties("AWS::Lambda::Function", {
        "Environment": {
            "Variables": {
                "TODO_TABLE_NAME": {
                    "Ref": "todoTableC937F2F9"
                },
                "REGION": "ap-northeast-1",
                "OS_DOMAIN": {
                    "Fn::GetAtt": [
                        "opensearch2F25E4C7",
                        "DomainEndpoint"
                    ]
                },
                "OS_INDEX": {
                    "Ref": "todoTableC937F2F9"
                },
                "SK": "todoId",
                "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1"
            }
        },
        "Handler": "index.handler",
        "MemorySize": 128,
        "Runtime": "nodejs14.x",
        "Timeout": 10
    })

    // createIndex
    template.hasResourceProperties("AWS::Lambda::Function", {
        "Environment": {
            "Variables": {
                "TODO_TABLE_NAME": {
                    "Ref": "todoTableC937F2F9"
                },
                "REGION": "ap-northeast-1",
                "OS_DOMAIN": {
                    "Fn::GetAtt": [
                        "opensearch2F25E4C7",
                        "DomainEndpoint"
                    ]
                },
                "OS_INDEX": {
                    "Ref": "todoTableC937F2F9"
                },
                "SK": "todoId",
                "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1"
            }
        },
        "Handler": "index.handler",
        "MemorySize": 128,
        "Runtime": "nodejs14.x",
        "Timeout": 10
    })

    // deleteIndex
    template.hasResourceProperties("AWS::Lambda::Function", {
        "Environment": {
            "Variables": {
                "TODO_TABLE_NAME": {
                    "Ref": "todoTableC937F2F9"
                },
                "REGION": "ap-northeast-1",
                "OS_DOMAIN": {
                    "Fn::GetAtt": [
                        "opensearch2F25E4C7",
                        "DomainEndpoint"
                    ]
                },
                "OS_INDEX": "todoindex",
                "SK": "todoId",
                "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1"
            }
        },
        "Handler": "index.handler",
        "MemorySize": 128,
        "Runtime": "nodejs14.x",
        "Timeout": 30
    })

    // update
    template.hasResourceProperties("AWS::Lambda::Function", {
        "Environment": {
            "Variables": {
                "TODO_TABLE_NAME": {
                    "Ref": "todoTableC937F2F9"
                },
                "REGION": "ap-northeast-1",
                "OS_DOMAIN": {
                    "Fn::GetAtt": [
                        "opensearch2F25E4C7",
                        "DomainEndpoint"
                    ]
                },
                "OS_INDEX": {
                    "Ref": "todoTableC937F2F9"
                },
                "SK": "todoId",
                "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1"
            }
        },
        "Handler": "index.handler",
        "MemorySize": 128,
        "Runtime": "nodejs14.x",
        "Timeout": 30
    })

    // delete
    template.hasResourceProperties("AWS::Lambda::Function", {
        "Environment": {
            "Variables": {
                "TODO_TABLE_NAME": {
                    "Ref": "todoTableC937F2F9"
                },
                "REGION": "ap-northeast-1",
                "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1"
            }
        },
        "Handler": "index.handler",
        "MemorySize": 128,
        "Runtime": "nodejs14.x",
        "Timeout": 10
    })



    template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
        "CorsConfiguration": {
            "AllowHeaders": [
                "Authorization",
                "Content-Type"
            ],
            "AllowMethods": [
                "*"
            ],
            "AllowOrigins": [
                "local"
            ]
        },
        "Name": "Api",
        "ProtocolType": "HTTP"
    })

    template.hasResourceProperties("AWS::ApiGatewayV2::Authorizer", {
        "ApiId": {
            "Ref": "ApiF70053CD"
        },
        "AuthorizerType": "JWT",
        "Name": "user-pool-authorizer",
        "IdentitySource": [
            "$request.header.Authorization"
        ],
        "JwtConfiguration": {
            "Audience": [
                {
                    "Ref": "userPoolclient992D31C6"
                }
            ],
            "Issuer": {
                "Fn::Join": [
                    "",
                    [
                        "https://cognito-idp.",
                        {
                            "Ref": "AWS::Region"
                        },
                        ".amazonaws.com/",
                        {
                            "Ref": "userPoolDC9497E0"
                        }
                    ]
                ]
            }
        }
    })


});
