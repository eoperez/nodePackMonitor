import * as Sqlite3 from "sqlite3";
import { IDbService, ICallback, IConfiguration, IDailyStats, IDeilyStatsResults  } from "../interfaces/IDbService.interface";
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

    getDailyStats = (callback: ICallback) => {
        const queryDailyStats = `SELECT
                strftime('%H', datetime(timestamp, 'localtime')) AS Hour,
                source,
                measurement,
                AVG(value) AS avgValue 
            from 
                dailyStats 
            GROUP BY
                source,
                measurement,
                strftime('%H', datetime(timestamp, 'localtime'));`
        this.dbConnection.all(queryDailyStats,(error: Error, results: any) => {
            if(error){
                console.error(error);
            }
            console.log(results);
            let dailyTotals: IDeilyStatsResults = {
                grid: 0,
                pv: 0,
                powerUsage: 0,
                batteryUsage: 0

            }
            results.forEach((row: any, index: any, results: Array<any>) => {
                switch (row.measurement) {
                    case 'power':
                            // power has 2 sources comsumtion and grid, update the right one.
                            if(row.source === 'grid') {
                                // calculate daily usage
                                dailyTotals.grid = (dailyTotals.grid + row.avgValue);
                            } else {
                                 // calculate daily usage
                                 dailyTotals.powerUsage = (dailyTotals.powerUsage + row.avgValue);
                            }
                        break;
                    case 'powerForLoads':
                         // calculate daily usage
                         dailyTotals.pv = (dailyTotals.pv + row.avgValue);
                        break;
                    case 'powerOut':
                         // calculate daily usage
                         dailyTotals.batteryUsage = (dailyTotals.batteryUsage + row.avgValue);
                        break;
                    default:
                        break;
                }
                if(index === results.length-1){
                    dailyTotals.grid = dailyTotals.grid/1000;
                    dailyTotals.powerUsage = dailyTotals.powerUsage/1000;
                    dailyTotals.pv = dailyTotals.pv/1000;
                    dailyTotals.batteryUsage = dailyTotals.batteryUsage/1000;
                    callback(null, dailyTotals);
                }
            });
        })
    }
}