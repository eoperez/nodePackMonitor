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
       gridVoltage: arr[0],
       gridFrequency: arr[1],
       acOutputVoltage: arr[2],
       acOutputFrequency: arr[3],
       acOutputPowerVa: arr[4],
       acOutputActivePower: arr[5],
       outputLoadPercent: arr[6],
       busVoltage: arr[7],
       batteryVoltage: arr[8],
       batteryCharging_current: arr[9],
       batteryCapacity: arr[10],
       inverterHeatSink_temperature: arr[11],
       pvInputCurrent_for_battery: arr[12],
       pvInputVoltage_1: arr[13],
       batteryVoltageFrom_scc: arr[14],
       batteryDischargeCurrent: arr[15],
       deviceStatus: arr[16]
    }
    if (GPIGSValue.deviceStatus.length==8) {
        GPIGSValue.chargingScc = GPIGSValue.deviceStatus.substring(5,6);
        GPIGSValue.chargingAC = GPIGSValue.deviceStatus.substring(6,7);
        GPIGSValue.chargingSccAcc = GPIGSValue.deviceStatus.substring(7,8);
    }
    console.log(GPIGSValue);
}