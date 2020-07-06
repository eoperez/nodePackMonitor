import * as Sqlite3 from "sqlite3";
import { IDbService, ICallback, IConfiguration, IDailyStats, IDeilyStatsResults, IPeakStats, IInfluxDbConfig  } from "../interfaces/IDbService.interface";
import * as Path from "path";
import * as Schedule from "node-schedule";
import * as Influx from "influx";
import { IQPIGSInfo } from "../interfaces/IPiPMonitorService.Interface";
import { ICellInfo } from "../interfaces/IBaterryMonitorService.interface";

export default class DbService implements IDbService{
    dbConnection: Sqlite3.Database;
    isConfigExist: boolean;
    influxConnection: Influx.InfluxDB;
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
        Schedule.scheduleJob('0 0 * * *',()=>{
            this.deleteDailyStats();
        });
    }

    setInfluxDb = (config: IInfluxDbConfig): void => {
        if(config.host && (typeof config != 'undefined')){
            const hostParts: Array<string> = config.host.split(':');
            config.host = hostParts[0];
            const port = hostParts[1];
            
            let influxOptions: Influx.ISingleHostConfig = {};
            // Stablish connection using caculated port or default
            if(port && (typeof port != 'undefined')){
                influxOptions.port = parseInt(port);
            } else {
                influxOptions.port = 8086;
            }

            influxOptions.host = config.host;
            // Use given db name or defult
            if(config.db){
                influxOptions.database = config.db;
            } else {
                influxOptions.database = 'SolarMonitoring';
            }
            if(config.user){
                influxOptions.username = config.user;
            }
            if(config.pwd){
                influxOptions.password = config.pwd;
            }
            influxOptions.schema = [
                {
                  measurement: 'batteryBank',
                  fields: { voltage: Influx.FieldType.FLOAT, temp: Influx.FieldType.FLOAT},
                  tags: ['cell']
                },
                {
                    measurement: 'inverterStats',
                    fields: {value: Influx.FieldType.FLOAT},
                    tags: ['source','measurement']
                }
            ];
            // Generate the connection.
            console.log('Attemp to connect to Influx with options:', influxOptions);
            this.influxConnection = new Influx.InfluxDB(influxOptions);
            // Check if DB Exists if not create a new one
            this.influxConnection.getDatabaseNames().then((dataBasesNames) =>{
                console.log('Connected to influx, databases found:', dataBasesNames);
                if(!dataBasesNames.includes(influxOptions.database)){
                    return this.influxConnection.createDatabase(influxOptions.database);
                }
            });
        } else {
            console.error('Influx host is required, config:', config);
        }
        
    }
    pushInfluxInverterStats = (QPIGS: IQPIGSInfo) :void => {
        for (let [source, measurementObj] of Object.entries(QPIGS)) {
            for (let [measurement, value] of Object.entries(measurementObj)) {
                if(typeof value === 'number'){
                    this.sendInfluxInverterStats(source, measurement, value);
                }
            }
        }
    }

    pushInfluxBatteryInfo = (cellInfo: ICellInfo): void => {
        console.log('cellInfo:', cellInfo);
    }

    sendInfluxInverterStats = (source: string, measurement: string, value: number) => {
        if(typeof this.influxConnection != 'undefined'){
            console.log('Sending data to influx, inverterStats:');
            this.influxConnection.writePoints([
                {
                  measurement: 'inverterStats',
                  tags: {
                    source: source,
                    measurement: measurement
                  },
                  fields: { 
                      value: value
                  }
                }
              ], {
                database: 'SolarMonitoring',
                precision: 's',
              })
              .catch(error => {
                console.error(`Error inverter stats information data to InfluxDB, error: ${error}`)
              });
        }
    }

    sendInfluxBatteryInfo = (cell: number, volts: number, temp: number) => {
        if(typeof this.influxConnection != 'undefined'){
            console.log('Sending data to influx, batteryBank:', cell, volts, temp);
            this.influxConnection.writePoints([
                {
                  measurement: 'batteryBank',
                  tags: {
                    cell: cell.toString()
                  },
                  fields: { 
                      voltage: volts, 
                      temp: temp}
                }
              ], {
                database: 'SolarMonitoring',
                precision: 's',
              })
              .catch(error => {
                console.error(`Error battery bank information data to InfluxDB, error: ${error}`)
              });
        }
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
            batteriesSeries,
            isPublicEnabled,
            subdomain,
            influxHost,
            influxUser,
            influxPassword,
            influxDb
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,[
            newConfig.monitorConfig.inverterPort,
            newConfig.monitorConfig.isBatteryMonitor,
            newConfig.monitorConfig.batteryMonitorPort,
            newConfig.systemConfig.inverterMode,
            newConfig.systemConfig.inverterPower,
            newConfig.systemConfig.pvModulesPower,
            newConfig.systemConfig.batteriesSeries,
            newConfig.integrationConfig.isPublicEnabled,
            newConfig.integrationConfig.subdomain,
            newConfig.integrationConfig.influxHost,
            newConfig.integrationConfig.influxUser,
            newConfig.integrationConfig.influxPassword,
            newConfig.integrationConfig.influxDb
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
            batteriesSeries INTEGER,
            isPublicEnabled INTEGER,
            subdomain TEXT,
            influxHost TEXT,
            influxUser TEXT,
            influxPassword TEXT,
            influxDb TEXT)`
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
                callback(error);
            }
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

    getPeakStats = (callback: ICallback) => {
        const peakStatsQuery = `SELECT 
                source, 
                measurement, 
                MAX(value) AS maxValue 
            FROM 
                dailyStats 
            GROUP BY
                source, measurement;
        
        `;
        this.dbConnection.all(peakStatsQuery,(error: Error, results: any) => {
            if(error){
                console.error(error);
                callback(error)
            }
            let peakStats: IPeakStats = {
                batteryPowerOut: 0,
                usage: 0,
                grid: 0,
                pvProduction: 0,
                pvCharging: 0
            }
            results.forEach((row: any, index: any, results: Array<any>) => {
                switch (row.measurement) {
                    case 'powerOut':
                        peakStats.batteryPowerOut = row.maxValue;
                        break;
                    case 'power':
                        if(row.source === 'grid'){
                            peakStats.grid = row.maxValue;
                        } else {
                            peakStats.usage = row.maxValue;
                        }
                        break;
                    case 'chargingPower':
                        peakStats.pvCharging = row.maxValue;
                        break;  
                    case 'powerForLoads':
                        peakStats.pvProduction = row.maxValue;
                        break;
                    default:
                        break;
                }
                if(index === results.length-1){
                    callback(null, peakStats);
                }
            });
        });
    }

    deleteDailyStats() {
        const deleteStat: string = `DELETE FROM dailyStats WHERE timestamp < date('now', 'start of day');`
        this.dbConnection.run(deleteStat, (runResults: Sqlite3.RunResult, error: Error) =>{
            if(error){
                console.error(error);
            } else {
                console.log('Records deleted', runResults.changes);
            }
        });
    }
}