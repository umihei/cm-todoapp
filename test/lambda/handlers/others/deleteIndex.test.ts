process.env.OS_DOMAIN = 'local';
// indexはDynamoDBのテーブル名
process.env.OS_INDEX = 'local-index';
process.env.SK = 'todoId';

import { handler } from '../../../../lambda/infra/deleteOpenSearchIndex';
import { AccessOpenSearch } from '../../../../lambda/infra/accessOpenSearch';

// インフラをMock化して，入力が正しくインフラ層に渡っているか確かめる

jest.mock('../../../../lambda/infra/accessOpenSearch');

describe('deleteIndex test', (): void => {

    test('delete index execute', async () => {

        // deleteIndexする処理をMock化
        const deleteIndexDocMock = (AccessOpenSearch.deleteIndex as jest.Mock).mockResolvedValue(null);

        const response = await handler({ test: 'test' });

        // OpenSearchのDeleteIndexApi実行が１回だけであることをテスト
        expect(deleteIndexDocMock.mock.calls.length).toBe(1);

        // deleteIndexDocMockへ（１回目の呼び出しで）渡すパラメタが期待通りになっているかをテスト
        // 兼オブジェクト変換テスト
        expect(deleteIndexDocMock.mock.calls[0][0]).toEqual(undefined);
    })
}
)