// Software Configuration. 
//TODO: need to externalize this so I can save to a file
const configuration = {
    commPort: "somePath",
    calibration: 517,
    voltageTolerance: 10,
    serverPort: 3030,
    sample: 40,
    availablePorts: []
}

const Serialport = require('serialport');
const Readline = require('@serialport/parser-readline');

// Get a list of serial ports
Serialport.list().then((portList, error)=>{
    configuration.availablePorts = portList;
    console.log('Available Ports:', portList);
 });