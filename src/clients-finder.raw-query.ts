/** Types generated for queries found in "src/clients-finder.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetAllClients' parameters type */
export type IGetAllClientsParams = void;

/** 'GetAllClients' return type */
export interface IGetAllClientsResult {
  enabled: boolean;
  id: string;
  name: string;
}

/** 'GetAllClients' query type */
export interface IGetAllClientsQuery {
  params: IGetAllClientsParams;
  result: IGetAllClientsResult;
}

const getAllClientsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT \"id\", \"name\", \"enabled\"\nFROM client\n  LEFT JOIN client_portal ON client_portal.\"clientId\" = client.id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "name", "enabled"
 * FROM client
 *   LEFT JOIN client_portal ON client_portal."clientId" = client.id
 * ```
 */
export const getAllClients = new PreparedQuery<IGetAllClientsParams,IGetAllClientsResult>(getAllClientsIR);


