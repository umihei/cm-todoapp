# Todoアプリ

## アーキテクチャ

![アーキテクチャ](doc/asset/arch-todo.001.jpeg)

cognitoで認証，認可の機能を担い，Api GatewayとLambda，DynamoDBでRest Apiを構成する．日本語の部分一致検索にはOpenSearchを利用する．

## デプロイ方法

CDKを使ってデプロイする．

1. 依存関係のインストール
```
npm install
```
2. デプロイ
contextを使って，Cognitoのドメインプレフィックスを渡す．
適当な英数字を渡す（8iopk9jなど）.
```
cdk deploy -c domainprefix={your domain prefix}
```
(はじめてCDKを使う場合は，`cdk bootstrap`が必要)
3. デプロイ完了後，OpenSearchのIndexを作成するLambda関数（createIndex）を一回だけ実行する．

## APIのテスト方法
swagger uiのDockerイメージを立ち上げてAPIをテストを行う．
1. swagger-uiのDockerイメージの立ち上げ準備．`todoapp-swaggerui/.env`ファイルを編集する．
```
OAUTH_CLIENT_ID={your oauth clinet id}
DOMAIN_PREFIX={your domain prefix}
```
`todoapp-swaggerui/docs/openapi.yaml`を編集する．
7行目
```
- url: {your api gw endpoint}
```
15行目と16行目
```
authorizationUrl: 'https://{your domain prefix}.auth.ap-northeast-1.amazoncognito.com/oauth2/authorize'
tokenUrl: 'https://{your domain prefix}.auth.ap-northeast-1.amazoncognito.com/oauth2/token
```
2. Dockerイメージを立ち上げる
```
cd todoapp-swaggerui
docker-compose up
```
3. 画面右上の鍵のアイコンのAuthorizeをクリック
4. open id, tokenにチェックをいれ，Authorizeをクリック（Client Secrectは入力不要）
5. 遷移先のページで新しくアカウントを作成する
6. Try it outからAPIを実行する
