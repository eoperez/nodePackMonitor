
export interface IPiPMonitorService {
    init(config: IPiPMonitorConfig): void;
}

export interface IPiPMonitorConfig {
    commPort: string;
}
export interface IQPIGSInfo {
    grid: IGrid;
    pv: IPv;
    consumption: IConsumption;
    battery: IBattery;
    inverter: IInverter;
}
interface IGrid {
    voltage: string;
    frequency: string;
    power: number;
    loadPercent: number // float from 0-1;
}

interface IConsumption {
    voltage: string;
    frequency: string;
    powerVa: string;
    activePower: string;
    loadPercent: number;  // float from 0-1;
    current: number;
}

interface IBattery {
    voltage: string;
    chargingCurrent: string;
    capacity: number; // float from 0-1
    voltageFromScc: string;
    dischargeCurrent: string;
    powerOut: number;
    powerIn: number;
}

interface IInverter {
    busVoltage: string;
    heatSinkTemperature: string;
    deviceStatus: iDeviceStatus;
}

interface IPv {
    currentBattery: string;
    voltage_1: string;
    chargingPower: string;
    diviveStatus: iDeviceStatus;
    powerForLoads: number;
    productionPercent: number;  // float from 0-1;
}

interface iDeviceStatus {
    chargingScc: string;
    chargingAC: string ;
    chargingSccAcc: string;
}