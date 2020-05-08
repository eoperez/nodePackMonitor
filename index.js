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
  startAddress: 1,
  interval: 600,
  availablePorts: []
}

console.log('default port: ', defaultPort);
console.log('configuration: ', configuration);

const Serialport = require('serialport');
const Readline = require('@serialport/parser-readline');
const ByteLength = require('@serialport/parser-byte-length');

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
let numberPacks = 0;

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
  buffer = [
    (packet.address << 1) | (packet.request ? 1 : 0),
    (packet.reg << 1) | (packet.write ? 1 : 0),
    packet.value >> 8, // 8 bits 
    packet.value & 0xFF // rest of the 8 bits
  ];
  return buffer
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
  //get monitor information
  getMonitorInfo(ADDRESS_BROADCAST, REG_ADDRESS);
});

// Reading only 5 bytes, a Packet includes all data within those 5 bytes.
const parser = port.pipe(new ByteLength({length: 5}));
// Listen to serial port for incoming data 

parser.on('data', (data)=>{
  // Handle the response
  responseHandler(data);
  // TODO: Switch between responses: Address Broadcast, Voltage information, or Temperature. 
});

port.on('error', function (err) {
  console.error('Serial Error! ');
  console.error(err);
  process.exit(1);
});

function responseHandler(data){
  response = decode(data);
  switch (response.reg) {
      case REG_VOLTAGE:
        // TODO: emit to socket type "voltage" {pack:ADDRESS, value: VALUE}
        console.log('Voltage', response.address, response.value);
        break;
      case REG_TEMP:
        // TODO: emit to socket type "temp" {pack:ADDRESS, value: VALUE}
        console.log('Temp', response.address, response.value);
        break;
      case REG_ADDRESS:
        // This is broadcast 
        numberPacks = response.value -1;
        console.log('number of packs:', numberPacks);
        // kickoff monitor data requests
        loop(numberPacks);
        break;
      default:
        console.log('Serial package data bad formatted.', data);
        break;
    }
}

function getMonitorInfo(monitorAddress, REG){
  packet = {
    address: monitorAddress, // Address of the monitor, use 0 for broadcast.
    reg: REG, // command registry: supported by monitor: address registration = 1 (0x1), Voltage request = 3 (0x3) and temperature request = 4 (0x4)
    request: true, // true if is a request, false is a response.
    value: 0, // value in will use 2 bytes
    write: false // if is a write (true) or read (false)
  }
  if(monitorAddress === 0){
    packet.value = configuration.startAddress;
    packet.write = true
  }
  const buffer = encode(packet);
  sendSerialMessage(buffer);
}

function crc8(buffer, length){
  let crc = 0;
  let data;
  for (let i = 0; i < length; i++) {
    data = crc ^ buffer[i];
    for (let j = 0; j < 8; j++) {
      if (data & 0x80) {
        data <<= 1;
        data ^= 0x07;
      } else {
        data <<= 1;
      }
    }
    crc = data;
  }
  return crc;
}

function sendSerialMessage(buffer) {
  const crc = crc8(buffer,PACKET_LENGTH);
  buffer.push(crc);
  port.write(buffer, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Packet sent");
    }
  });
}

function loop(numPacks){
  getMonitorInfo(1,REG_TEMP);
  setInterval(function(){
    console.log('after 1 sec');
  },1000);
  /*
  for (let pack = 1; pack <= numPacks; pack++) {
    // request voltage
    setInterval(function() {
      getMonitorInfo(pack, REG_VOLTAGE)
    },configuration.interval);
    // request temperature
    setInterval(function() {
      getMonitorInfo(pack, REG_TEMP)
    },configuration.interval);
  }
  loop(numPacks);
  */
}