import * as SocketIO from "socket.io";
import * as SerialPort from 'serialport'

export interface IBaterryMonitorService {
    init(config: IBatteriesMonitorConfig): void;
}
export interface IPacket {
    address: number; // Address of the monitor, use 0 for broadcast.
    reg: number; // command registry: supported by monitor: address registration = 1 (0x1), Voltage request = 3 (0x3) and temperature request = 4 (0x4)
    request: boolean | number; // true if is a request, false is a response.
    value: number; // value in will use 2 bytes
    write: boolean | number; // if is a write (true) or read (false)
}

export interface IBatteriesMonitorConfig {
    commPort: string;
    startAddress?: number;
}