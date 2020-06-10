import * as SocketIO from "socket.io";
import * as SerialPort from 'serialport';
import { IPacket, IBatteriesMonitorConfig, IBaterryMonitorService, ICellInfo, IActiveCall } from "../interfaces/IBaterryMonitorService.interface";

export default class BatteryMonitor implements IBaterryMonitorService {
    ioSocketServer: SocketIO.Server;
    startAddress: number;
    ADDRESS_BROADCAST: number;
    REG_ADDRESS: number;
    REG_VOLTAGE: number;
    REG_TEMP: number;
    PACKET_LENGTH: number;
    commPort: string;
    packet: IPacket;
    public numberPacks: number;
    buffer: Array<number>; // it should have array of integers
    port: SerialPort;
    bankInfo: Array<ICellInfo>;
    activeCall: IActiveCall;

    constructor(ioServer: SocketIO.Server) {
        // Sets instance of Socket.IO
        this.ioSocketServer = ioServer;
        // Defaults
        this.startAddress = 1; // Defaulting to 1
        this.numberPacks = 0; // By default we have no cell/packs to monitor
        // Defining Registries
        this.ADDRESS_BROADCAST = 0x0;
        this.REG_ADDRESS = 0x1;
        this.REG_VOLTAGE = 0x3;
        this.REG_TEMP = 0x4;
        this.PACKET_LENGTH = 4;
        // Initialize required properties 
        this.packet = {
            address: this.ADDRESS_BROADCAST,
            reg: this.REG_ADDRESS,
            request: true,
            value: 4200,
            write: true
        }; // by defult using broadcast address request. Value is ignored just using ramdom number for now
        this.bankInfo = [];
        this.activeCall = {};
    }
    // triggers communication over serial port to send and collect sensor data
    init = (config: IBatteriesMonitorConfig): void => {
        this.port = new SerialPort(config.commPort, { baudRate: 9600 }); // generate Serial Port instance
        if (config.startAddress) {
            this.startAddress = config.startAddress;
        }
        // Reading only 5 bytes, a Packet includes all data within those 5 bytes.
        const parser: SerialPort.parsers.ByteLength = this.port.pipe(new SerialPort.parsers.ByteLength({ length: 5 }));

        this.port.on('open', this.portOpenCallback);

        // Catch any errors with the Serial
        this.port.on('error', function (err) {
            console.error('Serial Error! ');
            console.error(err);
            // TODO: send a nice error instead of killing the process.
            // process.exit(1);
        });

        // Listen to serial port for incoming data 
        parser.on('data', (data)=>{
            // Handle the response
            this.responseHandler(data); 
        });

        //Debug when a socket connection is stablished
        this.ioSocketServer.on('connection', (socket: SocketIO.Socket) => {
            console.log("Client connected to battery monitor.");
        });

    }
    
    portOpenCallback = (): void => {
        console.log(`Port opened, listening using serial configuraiton`);
        //get monitor information
        this.getMonitorInfo(this.ADDRESS_BROADCAST, this.REG_ADDRESS);
    }

    healthCheck = (sentCall: IActiveCall, loopCount: number ): void => {
       if(sentCall == this.activeCall){
           loopCount++;
           if(loopCount > 2000){
            // this.getMonitorInfo(sentCall.address, sentCall.REG);
            // console.log('Maximum loops reached. Requesting monitor info again:', sentCall);
            console.log('loopcount over 2000:', loopCount);
           } else {
            console.log('loopcount:', loopCount);
            setTimeout((healthCheck = this.healthCheck, sendCallOriginal = sentCall, currentLoopCount = loopCount) => {
                healthCheck(sendCallOriginal, currentLoopCount);
            }, 0);
           }
       }
    }

    debugAsBinary(number: number){
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
    encode(packet: IPacket): Array<number>{
        // return an array (buffer) with 4 bytes build as described above.
        const buffer: Array<number> = [
            (packet.address << 1) | (packet.request ? 1 : 0),
            (packet.reg << 1) | (packet.write ? 1 : 0),
            packet.value >> 8, // 8 bits 
            packet.value & 0xFF // rest of the 8 bits
        ];
        return buffer
    }
    // Decode buffer into a packet object
    decode(buffer: Array<number>): IPacket{
        // return an packet object with data included in the buffer
        return {
            address: buffer[0] >> 1,
            request: buffer[0] & 1,
            reg: buffer[1] >> 1,
            write: buffer[1] & 1,
            value: (buffer[2] << 8) | buffer[3]
        }
    }
    // Handles all serrial responses.
    responseHandler(buffer: Array<number>){
        const response: IPacket = this.decode(buffer);
        const key: number = response.address - 1;
        switch (response.reg) {
            case this.REG_VOLTAGE:
                // Upsert cell record with the voltage
                if ( typeof this.bankInfo[key] === 'undefined') {
                    this.bankInfo[key] = {id: response.address, voltage: response.value/1000}; // dividing by 1000 to send volts instead of milliVolts
                } else {
                    // persisting temp value 
                    this.bankInfo[key] = {id: response.address, voltage: response.value/1000, temp: this.bankInfo[key].temp};
                }
                // 2nd  request chain with current address now move to temp
                this.getMonitorInfo(response.address, this.REG_TEMP);
                break;
            case this.REG_TEMP:
                // update record to include temperature.
                this.bankInfo[key].temp = response.value;
                // move pointer to next monitor.
                const nextMonitor = response.address + 1;
                // if is less or equal to number of packs request voltage
                if (nextMonitor <= this.numberPacks) {
                    this.getMonitorInfo(nextMonitor, this.REG_VOLTAGE);
                } else {
                    // Start request again
                    this.getMonitorInfo(this.startAddress, this.REG_VOLTAGE);
                }
                break;
            case this.REG_ADDRESS:
                // This is broadcast 
                this.numberPacks = response.value - 1;
                console.log('number of packs:', this.numberPacks);
                // start the request chain with startAddress and start with Voltage
                this.getMonitorInfo(this.startAddress, this.REG_VOLTAGE);
                break;
            default:
                console.log('Serial package data bad formatted.', buffer);
                break;
        }
        //emit bank information using socket service.
        console.log('emitting bank info:', this.bankInfo);
        this.ioSocketServer.sockets.emit('bankInfo', this.bankInfo);
    }

    getMonitorInfo(monitorAddress: number, REG: number){
        // Notify acctive call for watcher to check see if we need to restrart the call.
        this.activeCall = {address: monitorAddress, REG: REG};
        this.packet = {
            address: monitorAddress, // Address of the monitor, use 0 for broadcast.
            reg: REG, // command registry: supported by monitor: address registration = 1 (0x1), Voltage request = 3 (0x3) and temperature request = 4 (0x4)
            request: true, // true if is a request, false is a response.
            value: 0, // value in will use 2 bytes
            write: false // if is a write (true) or read (false)
        }
        if (monitorAddress === 0) {
            this.packet.value = this.startAddress;
            this.packet.write = true
        }
        const buffer: Array<number> = this.encode(this.packet);
        this.sendSerialMessage(buffer);
    }

    sendSerialMessage(buffer: Array<number>) {
        const crc = this.crc8(buffer, this.PACKET_LENGTH);
        buffer.push(crc);
        this.port.write(buffer, (error)=>{
            if(error) {
                console.log('error sending packet, check:', this.activeCall);
            } else {
                const sentDate = new Date();
                console.log(`Packet sent: ${sentDate.getFullYear()}-${sentDate.getMonth()}-${sentDate.getDate()} ${sentDate.getHours()}:${sentDate.getMinutes()}:${sentDate.getMilliseconds()/1000}`, this.activeCall);
                this.healthCheck(this.activeCall, 0);
            }
        });
    }

    crc8(buffer: Array<number>, length: number) {
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
}