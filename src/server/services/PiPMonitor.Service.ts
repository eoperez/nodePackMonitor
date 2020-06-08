import * as SocketIO from "socket.io";
import * as SerialPort from 'serialport';
import { IPiPMonitorService, IPiPMonitorConfig, IQPIGSInfo } from "../interfaces/IPiPMonitorService.Interface";

export default class PiPMonitor implements IPiPMonitorService  {
    ioSocketServer: SocketIO.Server;
    QPIGSInfo: IQPIGSInfo;

    constructor(ioServer: SocketIO.Server){
        this.ioSocketServer = ioServer;
        this.QPIGSInfo = {
            grid: {
                voltage: '...',
                frequency: '...',
                power: 0,
                loadPercent: 0
            },
            pv: {
                currentBattery: '...',
                voltage_1: '...',
                chargingPower: '...',
                powerForLoads: 0,
                productionPercent: 0
            },
            consumption: {
                voltage: '...',
                frequency: '...',
                powerVa: '...',
                activePower: '...',
                loadPercent: 0,
                current: 0
            },
            battery: {
                voltage: '...',
                chargingCurrent: '...',
                capacity: 0,
                voltageFromScc: '...',
                dischargeCurrent: '...',
                powerOut: 0,
                powerIn: 0
            },
            inverter: {
                busVoltage: '...',
                heatSinkTemperature: '...',
                deviceStatus: {
                    chargingAC: '',
                    chargingSccAcc: '',
                    chargingScc: ''
                }
            }
        }
    }
    
    init = (config: IPiPMonitorConfig): void => {
        const QPIGS = [0X51,0X50,0X49,0X47,0X53,0XB7,0XA9,0X0D];
        const port = new SerialPort(config.commPort, {baudRate: 2400});
        const parser = port.pipe(new SerialPort.parsers.Readline({delimiter: '\r'}));

        port.on('open', () => {
            console.log('PIP Monitor CommPort Ready.');
            // for some reason PIP does not repond to first call, this should serve as wake up call
            port.write(QPIGS);
        });

        //Debug when a socket connection is stablished
        this.ioSocketServer.on('connection', (socket: SocketIO.Socket) => {
            console.log("Client connected to PIP monitor.");
        });
        // Send intitial QPIGSInfo to avoid error in front end
        this.ioSocketServer.sockets.emit('inverter', this.QPIGSInfo);

        setInterval(() => {
            port.write(QPIGS);
        }, 2000);

        parser.on('data', (data) => {
            if (data.length == 109 && data.substring(0,1)=="(") {
                data = data.substring(1, data.length-2);
                console.log('Data:', data);
                const inverterResponse: Array<string> = data.split(" ");
                this.decodeQPIGS(inverterResponse);
                //emit bank information using socket service.
                console.log('emitting inverter info:', this.QPIGSInfo);
                this.ioSocketServer.sockets.emit('inverter', this.QPIGSInfo);
            }
        });
    }

    decodeQPIGS(inverterResponse: Array<string>): IQPIGSInfo {
        // Static info
        const deviceStatus = inverterResponse[16];
        this.QPIGSInfo.grid.voltage = inverterResponse[0];
        this.QPIGSInfo.grid.frequency = inverterResponse[1];
        this.QPIGSInfo.consumption.voltage = inverterResponse[2];
        this.QPIGSInfo.consumption.frequency = inverterResponse[3];
        this.QPIGSInfo.consumption.powerVa = inverterResponse[4];
        this.QPIGSInfo.consumption.activePower = inverterResponse[5];
        this.QPIGSInfo.consumption.loadPercent = parseInt(inverterResponse[6])/100;
        this.QPIGSInfo.battery.voltage = inverterResponse[8];
        this.QPIGSInfo.battery.chargingCurrent = inverterResponse[9];
        this.QPIGSInfo.battery.capacity = parseInt(inverterResponse[10])/100;
        this.QPIGSInfo.battery.voltageFromScc = inverterResponse[14];
        this.QPIGSInfo.battery.dischargeCurrent = inverterResponse[15];
        this.QPIGSInfo.inverter.busVoltage = inverterResponse[7];
        this.QPIGSInfo.inverter.heatSinkTemperature = inverterResponse[11];
        this.QPIGSInfo.pv.currentBattery = inverterResponse[12];
        this.QPIGSInfo.pv.voltage_1 = inverterResponse[13];
        this.QPIGSInfo.pv.chargingPower = inverterResponse[19];
        // Inverter calculated info
        if(deviceStatus.length == 8){
            this.QPIGSInfo.inverter.deviceStatus.chargingAC = deviceStatus.substring(5,6);
            this.QPIGSInfo.inverter.deviceStatus.chargingAC = deviceStatus.substring(6,7);
            this.QPIGSInfo.inverter.deviceStatus.chargingSccAcc = deviceStatus.substring(7,8);
        }
        // Battery calculated info
        this.QPIGSInfo.battery.powerOut = parseFloat(this.QPIGSInfo.battery.voltage) * parseFloat(this.QPIGSInfo.battery.dischargeCurrent);
        this.QPIGSInfo.battery.powerIn = parseFloat(this.QPIGSInfo.battery.voltageFromScc) * parseFloat(this.QPIGSInfo.battery.chargingCurrent);
        // Consumption calculated info
        this.QPIGSInfo.consumption.current = parseFloat(this.QPIGSInfo.consumption.activePower)/parseFloat(this.QPIGSInfo.consumption.voltage);
        // PV calculated info
        this.QPIGSInfo.pv.powerForLoads = parseFloat(this.QPIGSInfo.pv.chargingPower) - (parseFloat(this.QPIGSInfo.pv.currentBattery) * parseFloat(this.QPIGSInfo.battery.voltageFromScc));
        // Grid calculated info
        this.QPIGSInfo.grid.power = parseFloat(this.QPIGSInfo.consumption.activePower) - (this.QPIGSInfo.battery.powerOut + this.QPIGSInfo.pv.powerForLoads);
        console.log('Returning QPIGSInfo:', this.QPIGSInfo);
        return this.QPIGSInfo;
    }

}