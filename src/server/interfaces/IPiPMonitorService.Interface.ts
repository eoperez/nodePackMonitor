import { IDbService } from "./IDbService.interface";
export interface IPiPMonitorService {
    init(config: IPiPMonitorConfig): void;
}

export interface PIPChartInfo {
    pv: Array<[number, number]>;
    grid: Array<[number, number]>;
    battery: Array<[number, number]>;
    load: Array<[number, number]>;
}
export interface IPiPMonitorConfig {
    commPort: string;
    maxPVPower: number;
    maxPIPOutPower: number;
}
export interface IQPIGSInfo {
    grid: IGrid;
    pv: IPv;
    consumption: IConsumption;
    battery: IBattery;
    inverter: IInverter;
}
interface IGrid {
    voltage: number;
    frequency: number;
    power: number;
    loadPercent: number // float from 0-1;
}

interface IConsumption {
    voltage: number;
    frequency: number;
    powerVa: number;
    activePower: number;
    loadPercent: number;  // float from 0-1;
    current: number;
}

interface IBattery {
    voltage: number;
    chargingCurrent: number;
    capacity: number; // float from 0-1
    voltageFromScc: number;
    dischargeCurrent: number;
    powerOut: number;
    powerIn: number;
}

interface IInverter {
    busVoltage: number;
    heatSinkTemperature: number;
    deviceStatus: iDeviceStatus;
}

interface IPv {
    currentBattery: number
    voltage_1: number;
    chargingPower: number;
    powerForLoads: number;
    productionPercent: number;  // float from 0-1;
}

interface iDeviceStatus {
    chargingScc: string;
    chargingAC: string ;
    chargingSccAcc: string;
}