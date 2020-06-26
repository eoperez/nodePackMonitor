import * as Sqlite3 from "sqlite3";

export interface IDbService {
    getDbConnection(): Sqlite3.Database;
    getConfigurationExist(callback: ICallback): void;
    getLastConfiguration(callback: ICallback): void;
    saveConfiguration(configuration: IConfiguration, callback:ICallback): void
}

export interface ICallback {
    (error: Error, results?: any): void;
} 

export interface IConfiguration {
    monitorConfig: IMonitorConfig;
    systemConfig: ISystemConfig;
}

export interface IMonitorConfig {
    inverterPort: string;
    isBatteryMonitor: boolean;
    batteryMonitorPort: string;
}

export interface ISystemConfig {
    inverterMode: string;
    inverterPower: number;
    pvModulesPower: number;
    batteriesSeries: number;
}