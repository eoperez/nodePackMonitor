import * as Sqlite3 from "sqlite3";

export interface IDbService {
    getDbConnection(): Sqlite3.Database;
    getConfigurationExist(callback: ICallback): void;
}

export interface ICallback {
    (error: Error, results?: any): void;
}