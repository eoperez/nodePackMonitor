// import * as SerialPort from 'serialport';
SerialPort = require('serialport');

const QPIGS = [0X51,0X50,0X49,0X47,0X53,0XB7,0XA9,0X0D];
SerialPort.list().then((commPorts) => {
    console.log(commPorts);
});
const port = new SerialPort('/dev/tty.usbserial-AL065TDA', {baudRate: 2400});

const parser = port.pipe(new SerialPort.parsers.Readline({delimiter: '\r'}));

port.on('open', () => {
    console.log('Port open.')
    port.write([0X51,0X50,0X49,0X47,0X53,0XB7,0XA9,0X0D]);
});

parser.on('data', (data) => {
    if (data.length==109 && data.substring(0,1)=="(") {
        data=data.substring(1,data.length-2);
        console.log('Data:', data);
        const pipGPIGSValues = data.split(" ");
        decodeGPIGS(pipGPIGSValues);
    }
})

const decodeGPIGS = (arr)=> {
    const GPIGSValue = {
        grid: {
            voltage: arr[0],
            frequency: arr[1]
        },
        consumption: {
            voltage: arr[2],
            frequency: arr[3],
            powerVa: arr[4],
            activePower: arr[5],
            loadPercent: arr[6],
        },
        battery: {
            voltage: arr[8],
            chargingCurrent: arr[9],
            capacity: arr[10],
            voltageFromScc: arr[14],
            dischargeCurrent: arr[15]
        },
        inverter: {
            busVoltage: arr[7],
            heatSinkTemperature: arr[11],
            deviceStatus: arr[16]
        },
        pv: {
            currentBattery: arr[12],
            voltage_1: arr[13],
            chargingPower: arr[19]
        }
    }
    if (GPIGSValue.inverter.deviceStatus.length==8) {
        GPIGSValue.inverter.chargingScc = GPIGSValue.inverter.deviceStatus.substring(5,6);
        GPIGSValue.inverter.chargingAC = GPIGSValue.inverter.deviceStatus.substring(6,7);
        GPIGSValue.inverter.chargingSccAcc = GPIGSValue.inverter.deviceStatus.substring(7,8);
    }
    // Battery calculated info
    GPIGSValue.battery.powerOut = parseFloat(GPIGSValue.battery.voltage) * parseFloat(GPIGSValue.battery.dischargeCurrent);
    GPIGSValue.battery.powerIn = parseFloat(GPIGSValue.battery.voltageFromScc) * parseFloat(GPIGSValue.battery.chargingCurrent);
    // Consumption calculated info
    GPIGSValue.consumption.current = parseFloat(GPIGSValue.consumption.activePower)/parseFloat(GPIGSValue.consumption.voltage);
    // PV calculated info
    GPIGSValue.pv.powerForLoads = parseFloat(GPIGSValue.pv.chargingPower) - (parseFloat(GPIGSValue.pv.currentBattery) * parseFloat(GPIGSValue.battery.voltageFromScc));
    // Grid calculated info
    GPIGSValue.grid.power = parseFloat(GPIGSValue.consumption.activePower) - (GPIGSValue.battery.powerOut + GPIGSValue.pv.powerForLoads);

    console.log(GPIGSValue);
}