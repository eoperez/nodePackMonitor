import * as SocketIO from "socket.io";
import * as SerialPort from 'serialport';

import { IPiPMonitorService, IPiPMonitorConfig, IQPIGSInfo, PIPChartInfo } from "../interfaces/IPiPMonitorService.Interface";
import { IDbService } from "../interfaces/IDbService.interface";

export default class PiPMonitor implements IPiPMonitorService  {
    ioSocketServer: SocketIO.Server;
    QPIGSInfo: IQPIGSInfo;
    maxPVPower: number;
    maxPIPOutPower: number;
    dbService: IDbService;
    commPort: string;
    port: SerialPort;
    pipChartInfo: PIPChartInfo;

    constructor(ioServer: SocketIO.Server, dbService: IDbService){
        this.ioSocketServer = ioServer;
        this.dbService = dbService;
        this.maxPVPower = 5000;
        this.maxPIPOutPower = 5000;
        this.QPIGSInfo = {
            grid: {
                voltage: 0,
                frequency: 0,
                power: 0,
                loadPercent: 0
            },
            pv: {
                currentBattery: 0,
                voltage_1: 0,
                chargingPower: 0,
                powerForLoads: 0,
                productionPercent: 0
            },
            consumption: {
                voltage: 0,
                frequency: 0,
                powerVa: 0,
                activePower: 0,
                loadPercent: 0,
                current: 0
            },
            battery: {
                voltage: 0,
                chargingCurrent: 0,
                capacity: 0,
                voltageFromScc: 0,
                dischargeCurrent: 0,
                powerOut: 0,
                powerIn: 0
            },
            inverter: {
                busVoltage: 0,
                heatSinkTemperature: 0,
                deviceStatus: {
                    chargingAC: '',
                    chargingSccAcc: '',
                    chargingScc: ''
                }
            }
        }
        this.pipChartInfo = {
            pv: [[Date.now(),0]],
            grid: [[Date.now(),0]],
            battery: [[Date.now(),0]],
            load: [[Date.now(),0]]
        }
    }
    
    init = (config: IPiPMonitorConfig): void => {
        const QPIGS = [0X51,0X50,0X49,0X47,0X53,0XB7,0XA9,0X0D];
        // if is firstime (this.commPort undefined) or if incoming config port is different then we open the new port.
        if((typeof this.commPort === 'undefined') || (this.commPort != config.commPort)){
            if(typeof this.commPort !== 'undefined'){
                this.port.close((error: Error) => {
                    console.error('Error closing battery monitor port:', error);
                })
            }
            this.commPort = config.commPort;
            this.port = new SerialPort(config.commPort, {baudRate: 2400},(error: Error) => {
                if(error){
                    console.error('PIP Monitor error:', error);
                }
            });
            
        }
        const parser = this.port.pipe(new SerialPort.parsers.Readline({delimiter: '\r'}));
        this.maxPIPOutPower = config.maxPIPOutPower;
        this.maxPVPower = config.maxPVPower;

        this.port.on('open', () => {
            console.log('PIP Monitor CommPort Ready.');
            // for some reason PIP does not repond to first call, this should serve as wake up call
            this.port.write(QPIGS);
        });

        //Debug when a socket connection is stablished
        this.ioSocketServer.on('connection', (socket: SocketIO.Socket) => {
            console.log("Client connected to PIP monitor.");
        });
        // Send intitial QPIGSInfo to avoid error in front end
        this.ioSocketServer.sockets.emit('inverter', this.QPIGSInfo);

        setInterval(() => {
            this.port.write(QPIGS);
        }, 2000);

        parser.on('data', (data) => {
            if (data.length == 109 && data.substring(0,1)=="(") {
                data = data.substring(1, data.length-2);
                const inverterResponse: Array<string> = data.split(" ");
                this.decodeQPIGS(inverterResponse);
                this.ioSocketServer.sockets.emit('inverter', this.QPIGSInfo);
                this.ioSocketServer.sockets.emit('inverterChart', {
                    pv: this.pipChartInfo.pv.slice(0, 600),
                    grid: this.pipChartInfo.grid.slice(0, 600),
                    battery: this.pipChartInfo.battery.slice(0,600),
                    load: this.pipChartInfo.load.slice(0, 600)
                });

                //Get Daily Stats
                this.dbService.getDailyStats((error: Error, results)=>{
                    if(error){
                        console.error(error);
                    }
                    this.ioSocketServer.sockets.emit('dailyTotals', results);
                });
                // Get peak stats
                this.dbService.getPeakStats((error: Error, results) =>{
                    if(error){
                        console.error(error);
                    }
                    this.ioSocketServer.sockets.emit('peakStats', results);
                });
            } else {
                // console.error('Failing expected data length or staring string. PIP serial data:', data);
            }
        });
    }

    handleDailyStatsCallback = (error: Error, results?: any): void =>{
        if(error) {
            console.error(error);
        }
    }

    decodeQPIGS(inverterResponse: Array<string>): IQPIGSInfo {
        // Static info
        const decodeTime: number = Date.now();
        const deviceStatus = inverterResponse[16];
        this.QPIGSInfo.grid.voltage = parseInt(inverterResponse[0]);
        this.QPIGSInfo.grid.frequency = parseInt(inverterResponse[1]);
        this.QPIGSInfo.consumption.voltage = parseInt(inverterResponse[2]);
        this.QPIGSInfo.consumption.frequency = parseInt(inverterResponse[3]);
        this.QPIGSInfo.consumption.powerVa = parseInt(inverterResponse[4]);
        this.QPIGSInfo.consumption.activePower = parseInt(inverterResponse[5]);
        this.QPIGSInfo.consumption.loadPercent = parseInt(inverterResponse[6])/100;
        this.QPIGSInfo.battery.voltage = parseFloat(inverterResponse[8]);
        this.QPIGSInfo.battery.chargingCurrent = parseFloat(inverterResponse[9]);
        this.QPIGSInfo.battery.capacity = parseInt(inverterResponse[10])/100;
        this.QPIGSInfo.battery.voltageFromScc = parseFloat(inverterResponse[14]);
        this.QPIGSInfo.battery.dischargeCurrent = parseFloat(inverterResponse[15]);
        this.QPIGSInfo.inverter.busVoltage = parseFloat(inverterResponse[7]);
        this.QPIGSInfo.inverter.heatSinkTemperature = parseFloat(inverterResponse[11]);
        this.QPIGSInfo.pv.currentBattery = parseFloat(inverterResponse[12]);
        this.QPIGSInfo.pv.voltage_1 = parseFloat(inverterResponse[13]);
        this.QPIGSInfo.pv.chargingPower = parseInt(inverterResponse[19]);
        // Inverter calculated info
        if(deviceStatus.length == 8){
            this.QPIGSInfo.inverter.deviceStatus.chargingAC = deviceStatus.substring(5,6);
            this.QPIGSInfo.inverter.deviceStatus.chargingAC = deviceStatus.substring(6,7);
            this.QPIGSInfo.inverter.deviceStatus.chargingSccAcc = deviceStatus.substring(7,8);
        }
        // Battery calculated info
        this.QPIGSInfo.battery.powerOut = this.QPIGSInfo.battery.voltage * this.QPIGSInfo.battery.dischargeCurrent;
        this.QPIGSInfo.battery.powerIn = this.QPIGSInfo.battery.voltage * this.QPIGSInfo.battery.chargingCurrent;
        // Consumption calculated info
        this.QPIGSInfo.consumption.current = this.QPIGSInfo.consumption.activePower/this.QPIGSInfo.consumption.voltage;
        // PV calculated info
        this.QPIGSInfo.pv.productionPercent = this.QPIGSInfo.pv.chargingPower / this.maxPVPower;
        this.QPIGSInfo.pv.powerForLoads = this.QPIGSInfo.pv.chargingPower - (this.QPIGSInfo.pv.currentBattery * this.QPIGSInfo.battery.voltageFromScc);
        // Grid calculated info
        this.QPIGSInfo.grid.power = this.QPIGSInfo.consumption.activePower - (this.QPIGSInfo.battery.powerOut + this.QPIGSInfo.pv.powerForLoads);
        // don't allow negative values
        if(this.QPIGSInfo.grid.power < 0){
            this.QPIGSInfo.grid.power = 0;
        }
        this.QPIGSInfo.grid.loadPercent = this.QPIGSInfo.grid.power / this.maxPIPOutPower;
        // Push values
        this.pipChartInfo.pv.unshift([decodeTime, this.QPIGSInfo.pv.powerForLoads]);
        this.pipChartInfo.grid.unshift([decodeTime, this.QPIGSInfo.grid.power]);
        this.pipChartInfo.battery.unshift([decodeTime, this.QPIGSInfo.battery.powerOut]);
        this.pipChartInfo.load.unshift([decodeTime, this.QPIGSInfo.consumption.powerVa]);
        // Daily Stats
        this.dbService.recordDailyStat({source: 'grid', measurement: 'power', value: this.QPIGSInfo.grid.power}, this.handleDailyStatsCallback);
        this.dbService.recordDailyStat({source: 'consumption', measurement: 'power', value: this.QPIGSInfo.consumption.powerVa}, this.handleDailyStatsCallback);
        this.dbService.recordDailyStat({source: 'pv', measurement: 'chargingPower', value: this.QPIGSInfo.pv.chargingPower}, this.handleDailyStatsCallback);
        this.dbService.recordDailyStat({source: 'pv', measurement: 'powerForLoads', value: this.QPIGSInfo.pv.powerForLoads}, this.handleDailyStatsCallback);
        this.dbService.recordDailyStat({source: 'battery', measurement: 'powerOut', value: this.QPIGSInfo.battery.powerOut}, this.handleDailyStatsCallback);
        //console.log('Returning QPIGSInfo:', this.QPIGSInfo);
        this.dbService.pushInfluxInverterStats(this.QPIGSInfo);
        return this.QPIGSInfo;
    }
}