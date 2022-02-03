
import { AccessOpenSearch } from '../infra/accessOpenSearch';

export const handler = async (event: any): Promise<any> => {

    await AccessOpenSearch.deleteIndex();

}