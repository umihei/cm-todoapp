#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TodoappAuthStack } from '../lib/workspaces-stack';

const app = new cdk.App();
const authStack = new TodoappAuthStack(app, 'TodoappAuthStack', {
  callbackUrls: ['http://localhost:3200/oauth2-redirect.html'],
  logoutUrls: ['http://localhost:3200/oauth2-redirect.html'],
  frontendUrls: ['http://localhost:3200'],
  // cdk deploy -c domainprefix=hogehoge の要領で，コンテキスト経由でドメイン名を渡す．
  domainPrefix: app.node.tryGetContext('domainprefix'),
});
