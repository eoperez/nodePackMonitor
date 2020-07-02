import * as Sqlite3 from "sqlite3";
import { IDbService, ICallback, IConfiguration, IDailyStats  } from "../interfaces/IDbService.interface";
import * as Path from "path";

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
        this.createConfigurationTable();
        this.createDailyStatsTable();
    }

    getDbConnection = (): Sqlite3.Database => {
        return this.dbConnection;
    }

    getLastConfiguration = (callback: ICallback): void => {
        const lastConfig = `SELECT * FROM configuration ORDER BY id DESC LIMIT 1;`;
        this.dbConnection.get(lastConfig,(error: Error, results)=>{
            if(error) {
                callback(error);
            } else {
                callback(null, results);
            }
        });
    }

    saveConfiguration = (newConfig: IConfiguration, callback: ICallback): void =>{
        this.dbConnection.run(`INSERT INTO configuration (
            inverterPort,
            isBatteryMonitor,
            batteryMonitorPort,
            inverterMode,
            inverterPower,
            pvModulesPower,
            batteriesSeries
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,[
            newConfig.monitorConfig.inverterPort,
            newConfig.monitorConfig.isBatteryMonitor,
            newConfig.monitorConfig.batteryMonitorPort,
            newConfig.systemConfig.inverterMode,
            newConfig.systemConfig.inverterPower,
            newConfig.systemConfig.pvModulesPower,
            newConfig.systemConfig.batteriesSeries
        ],(instance: Sqlite3.RunResult, error: Error)=>{
            callback(error, instance);
        });
    }
    recordDailyStat = (stat: IDailyStats, callback: ICallback): void =>{
        this.dbConnection.run(`INSERT INTO dailyStats (
            source,
            measurement,
            value
        )
        VALUES (?, ?, ?)`,[
            stat.source,
            stat.measurement,
            stat.value
        ],(instance: Sqlite3.RunResult, error: Error)=>{
            callback(error, instance);
        });
    }

    getConfigurationExist = (callback: ICallback): void =>{
        // if exist check if it has at least 1 record
        this.dbConnection.get('Select count(*) AS recordsCount from configuration', (error: Error, row) =>{
            // handle error
            if(error){
                callback(error);
            } else {
                if(row.recordsCount > 0) {
                    callback(null, false)
                } else {
                    callback(null, true)
                }
            }
        });
    }

    createConfigurationTable(): void {
        const createConfigTbl = `CREATE TABLE IF NOT EXISTS configuration (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inverterPort TEXT,
            isBatteryMonitor INTEGER,
            batteryMonitorPort TEXT,
            inverterMode TEXT,
            inverterPower INTEGER,
            pvModulesPower INTEGER,
            batteriesSeries INTEGER)`
        this.dbConnection.run(createConfigTbl);
    }

    createDailyStatsTable(): void{
        const createDailyStants = `CREATE TABLE IF NOT EXISTS dailyStats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT,
            measurement TEXT,
            value INTEGER,
            timestamp DATETIME DEFAULT (datetime('now','localtime')))`
        this.dbConnection.run(createDailyStants);
    }

    getDailyStat = (source: string, meassurament: string, callback: ICallback) => {
        const queryDailyStats = `SELECT AVG(value) AS avgConsumtion, strftime('%H', datetime(timestamp, 'localtime')) AS time 
            FROM dailyStats 
            WHERE source = 'power' 
            AND measurement = 'power' 
            GROUP BY strftime('%H', datetime(timestamp, 'localtime'));`
        this.dbConnection.all(queryDailyStats,(error: Error, results: any) => {
            console.log(results);
        })
    }

}