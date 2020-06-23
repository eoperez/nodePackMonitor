import * as Sqlite3 from "sqlite3";
import { IDbService  } from "../interfaces/IDbService.interface";
import * as Path from "path";
import * as Fs from "fs";

export default class DbService implements IDbService{
    dbConnection: Sqlite3.Database;
    isExistDb: boolean;
    constructor() {
        const dbLocation = Path.join(__dirname, 'monitoringApp.db');
        if (Fs.existsSync(dbLocation)) {
            this.isExistDb = true;
        } else {
            this.isExistDb = false;
        }
        this.dbConnection = new Sqlite3.Database(dbLocation, (error: Error) =>{
            if (error) {
                console.error(error.message);
            } else {
                console.log('Connected to database.');
            }
        });
    }

    getDbConnection = (): Sqlite3.Database => {
        return this.dbConnection;
    }

    getDbFileExist = (): boolean => {
        return this.isExistDb;
    }
}