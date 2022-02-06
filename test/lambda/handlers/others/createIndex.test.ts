process.env.OS_DOMAIN = 'local';
// indexはDynamoDBのテーブル名
process.env.OS_INDEX = 'local-index';
process.env.SK = 'todoId';

import { handler } from '../../../../lambda/infra/createOpenSearchIndex';
import { AccessOpenSearch } from '../../../../lambda/infra/accessOpenSearch';

// インフラをMock化して，入力が正しくインフラ層に渡っているか確かめる

jest.mock('../../../../lambda/infra/accessOpenSearch');

describe('createIndex test', (): void => {

    test('create index execute', async () => {

        // createIndexする処理をMock化
        const createIndexDocMock = (AccessOpenSearch.createIndex as jest.Mock).mockResolvedValue(null);

        const response = await handler({ test: 'test' });

        // OpenSearchのCreateIndexApi実行が１回だけであることをテスト
        expect(createIndexDocMock.mock.calls.length).toBe(1);

        // createIndexDocMockへ（１回目の呼び出しで）渡すパラメタが期待通りになっているかをテスト
        // 兼オブジェクト変換テスト
        expect(createIndexDocMock.mock.calls[0][0]).toEqual(undefined);
    })
}
)