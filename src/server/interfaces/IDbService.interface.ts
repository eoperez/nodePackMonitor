import * as Sqlite3 from "sqlite3";

export interface IDbService {
    getDbConnection(): Sqlite3.Database;
    getConfigurationExist(callback: ICallback): void;
    getLastConfiguration(callback: ICallback): void;
    saveConfiguration(configuration: IConfiguration, callback:ICallback): void
    recordDailyStat(stat: IDailyStats, callback: ICallback): void;
    getDailyStats(callback: ICallback): void;
    getPeakStats(callback: ICallback): void;
}

export interface ICallback {
    (error: Error, results?: any): void;
} 

export interface IConfiguration {
    monitorConfig: IMonitorConfig;
    systemConfig: ISystemConfig;
    integrationConfig: IIntegrationConfiguration;
}
export interface IIntegrationConfiguration {
    isPublicEnabled: boolean;
    subdomain?: string;
    influxHost?: string;
    influxUser?: string;
    influxPassword?: string;
    influxDb?: string;
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

export interface IDailyStats {
    source: string;
    measurement: string;
    value?: number;
}

export interface IDeilyStatsResults {
    grid: number;
    pv: number;
    powerUsage: number;
    batteryUsage: number;
}

export interface IPeakStats {
    batteryPowerOut: number;
    usage: number;
    grid: number;
    pvProduction: number;
    pvCharging: number;
}