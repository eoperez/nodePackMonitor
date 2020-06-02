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

port.on('data', (data) => {
    data=data.substring(1,data.length-2);
    console.log('Data:', data)
})