import * as Sqlite3 from "sqlite3";

export interface IDbService {
    getDbConnection(): Sqlite3.Database;
    getConfigTableExist(): boolean;
}