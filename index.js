// Software Configuration. 
//TODO: need to externalize this so I can save to a file

// Default Port
const defaultPort = '/dev/ttyS0' // PI Port using ttys0
// const defaultPort = '/dev/cu.SLAB_USBtoUART'; // Mac port

// Configuration
const configuration = {
  commPort: defaultPort,
  calibration: 517,
  voltageTolerance: 10,
  serverPort: 3030,
  sample: 40,
  availablePorts: []
}

console.log('default port: ', defaultPort);
console.log('configuration: ', configuration);

const Serialport = require('serialport');
const Readline = require('@serialport/parser-readline');
const ByteLength = require('@serialport/parser-byte-length')
const { crc8 } = require('crc');

/********************** MONITOR CODE ***************************** */
/* 
 Commands definitions
*/
const ADDRESS_BROADCAST = 0x0;
const REG_ADDRESS = 0x1;
const REG_VOLTAGE = 0x3;
const REG_TEMP = 0x4;
const PACKET_LENGTH = 4;

// Globals
let packNumbers = 0;

// Packet containing payload to assemble the request to monitors
let packet = {
  address: ADDRESS_BROADCAST, // Address of the monitor, use 0 for broadcast.
  reg: REG_ADDRESS, // command registry: supported by monitor: address registration = 1 (0x1), Voltage request = 3 (0x3) and temperature request = 4 (0x4)
  request: true, // true if is a request, false is a response.
  value: 4200, // value in will use 2 bytes
  write: true // if is a write (true) or read (false)
}

function debugAsBinary(number) {
  let binary = number.toString(2);
  binary = "00000000".substr(binary.length) + binary;
  console.log(binary);
}

/*
 4 byte packet structure (msb to lsb):
    address (7 bits)
    request=1/response=0 flag (1 bit)
    reg (7 bits)
    write=1/read=0 flag (1 bit)
    value (16 bits)
*/

// Encodes a packet into a array 
function encode(packet) {
  // return an array (buffer) with 4 bytes build as described above.
  return [
    (packet.address << 1) | (packet.request ? 1 : 0),
    (packet.reg << 1) | (packet.write ? 1 : 0),
    packet.value >> 8, // 8 bits 
    packet.value & 0xFF // rest of the 8 bits
  ]
}

// decodes buffer into a packet
function decode(buffer) {
  // return an packet object with data included in the buffer
  return {
    address: buffer[0] >> 1,
    request: buffer[0] & 1,
    reg: buffer[1] >> 1,
    write: buffer[1] & 1,
    value: (buffer[2] << 8) | buffer[3]
  }
}

/********************** SERIAL CODE ***************************** */

// Get a list of serial ports
Serialport.list().then((portList, error) => {
  configuration.availablePorts = portList;
  console.log('Available Ports:', portList);
});

const port = new Serialport(configuration.commPort, { baudRate: 9600 }); // instance of the port

port.on('open', function () {
  console.log(`Port opened, listening using: ${configuration.commPort}`);
  // TODO: Create setMonitors method to send registration command to all monitors 
  sendMessage();
});

// Reading only 5 bytes, a Packet includes all data within those 5 bytes.
const parser = port.pipe(new ByteLength({length: 5}));
// Listen to serial port for incoming data 

parser.on('data', (data)=>{
  // Decodes the incoming data into Packet object.
  const response = decode(data);
  console.log('Decoded: ', response);
  // TODO: Switch between responses: Address Broadcast, Voltage information, or Temperature. 
});

port.on('error', function (err) {
  console.error('Hmm..., error!');
  console.error(err);
  process.exit(1);
});


function sendMessage(buffer) {
  port.write([0x01], function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Message sent successfully');
    }
  });
}
