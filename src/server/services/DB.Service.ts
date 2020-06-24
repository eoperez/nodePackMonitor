import * as Sqlite3 from "sqlite3";
import { IDbService, ICallback  } from "../interfaces/IDbService.interface";
import * as Path from "path";
import * as Fs from "fs";

export default class DbService implements IDbService{
    dbConnection: Sqlite3.Database;
    isConfigExist: boolean;
    constructor() {
        const dbLocation = Path.join(__dirname, 'monitoringApp.db');
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

    getConfigurationExist = (callback: ICallback) =>{
        this.dbConnection.get(`SELECT count(*) AS tableExist FROM sqlite_master WHERE type='table' AND name='configuration'`,(error: Error, row) => {
            if(error){
                callback(error);
            } else {
                if(!!row.tableExist) {
                    callback(null, false);
                } else {
                    callback(null, true);
                }
            }
        })
    }
}