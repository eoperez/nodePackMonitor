import * as Sqlite3 from "sqlite3";
import { IQPIGSInfo } from "./IPiPMonitorService.Interface";
import { ICellInfo } from "./IBaterryMonitorService.interface";

export interface IDbService {
    getDbConnection(): Sqlite3.Database;
    getConfigurationExist(callback: ICallback): void;
    getLastConfiguration(callback: ICallback): void;
    saveConfiguration(configuration: IConfiguration, callback:ICallback): void
    recordDailyStat(stat: IDailyStats, callback: ICallback): void;
    getDailyStats(callback: ICallback): void;
    getPeakStats(callback: ICallback): void;
    setInfluxDb(config: IInfluxDbConfig): void;
    sendInfluxBatteryInfo(cell: number, volts: number, temp: number): void;
    sendInfluxInverterStats(source: string, measurement: string, value: number): void;
    pushInfluxInverterStats(QPIGS: IQPIGSInfo): void;
    pushInfluxBatteryInfo(cellInfo: ICellInfo): void;
}

export interface IInfluxDbConfig {
    host: string;
    user?: string;
    pwd?: string;
    db?: string;
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