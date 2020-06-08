import * as express from 'express'
import * as SerialPort from 'serialport'
import { Application, Router, Request, Response} from 'express'
import { join } from "path";
import { Server } from "http";
import * as SocketIO from "socket.io";

import {IBaterryMonitorService} from "./interfaces/IBaterryMonitorService.interface";
import BatteriesMonitor from "./services/BatteryMonitor.Service"

const app: Application = express();
const router: Router = express.Router()
const port: number = 5000;
let availablePorts: SerialPort.PortInfo[] = [];
const commPort: string = '/dev/ttyS0';

SerialPort.list().then((commPorts: SerialPort.PortInfo[]) => {
    availablePorts = commPorts;
    console.log('CommPorts:', availablePorts);
});

// define route
const mainRoute = (req: Request, res: Response) => {
    // hook render function
    res.render('index', {});
}

// Sets assests
app.use('/static', express.static(join(__dirname,'views/static')));

// Set templates handler
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

// Sets express route
app.use('/', router.get('/', mainRoute));

// Inititate the server
const server: Server = app.listen(port, () => {
    console.log(`App is listening on port:${port}`)
});

// Initiate IO Server
const io: SocketIO.Server = SocketIO(server);

const batteriesMonitor: IBaterryMonitorService = new BatteriesMonitor(io);
batteriesMonitor.init({commPort: commPort});