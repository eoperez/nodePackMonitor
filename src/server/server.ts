import * as express from 'express'
import * as SerialPort from 'serialport'
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { Application, Router, Request, Response} from 'express'
import { join } from "path";
import { Server } from "http";
import * as SocketIO from "socket.io";
import * as Sqlite3 from "sqlite3";

import { IDbService } from "./interfaces/IDbService.interface";
import {IBaterryMonitorService} from "./interfaces/IBaterryMonitorService.interface";
import {IPiPMonitorService, IPiPMonitorConfig} from "./interfaces/IPiPMonitorService.Interface";
import BatteriesMonitor from "./services/BatteryMonitor.Service"
import PiPMonitor from "./services/PiPMonitor.Service";
import DbService from "./services/DB.Service";

const dbService: IDbService = new DbService();
const dbConnection: Sqlite3.Database = dbService.getDbConnection();

const isFirstTime = dbService.getConfigTableExist();

const app: Application = express();
const router: Router = express.Router()
const port: number = 5000;
let availablePorts: SerialPort.PortInfo[] = [];
const batteryMonitorCommPort: string = '/dev/ttyS0';
const inverterMonitorCommPort: string = '/dev/ttyUSB0';

SerialPort.list().then((commPorts: SerialPort.PortInfo[]) => {
    availablePorts = commPorts;
});

// define route
const mainRoute = (req: Request, res: Response) => {
    // hook render function
    res.render('index', {});
}

// serverinfo route
const serverInfo = (req: Request, res: Response) => {
    res.json({
        ports: availablePorts,
        isFirstTime: isFirstTime,
        reponseStatus: "True"
    });
}

// Allow CORS to make front end development easier.
app.use(cors());
// Enable parser for JSON requests.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sets assests
app.use('/static', express.static(join(__dirname,'views/static')));

// Set templates handler
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

// Sets express route
app.get('/serverinfo', serverInfo);
app.get('/', mainRoute);

// Inititate the server
const server: Server = app.listen(port, () => {
    console.log(`App is listening on port:${port}`);
});

// Initiate IO Server
const io: SocketIO.Server = SocketIO(server);

const batteriesMonitor: IBaterryMonitorService = new BatteriesMonitor(io);
batteriesMonitor.init({commPort: batteryMonitorCommPort});

const pipMonitor: IPiPMonitorService = new PiPMonitor(io);
pipMonitor.init({commPort: inverterMonitorCommPort, maxPIPOutPower: 5000, maxPVPower: 5000});
