import * as express from 'express'
import * as SerialPort from 'serialport'
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { Application, Router, Request, Response} from 'express'
import { join } from "path";
import { Server } from "http";
import * as SocketIO from "socket.io";
import * as Sqlite3 from "sqlite3";
import * as Localtunnel from "localtunnel";

import { IDbService, IConfiguration, IInfluxDbConfig } from "./interfaces/IDbService.interface";
import {IBaterryMonitorService} from "./interfaces/IBaterryMonitorService.interface";
import {IPiPMonitorService, IPiPMonitorConfig} from "./interfaces/IPiPMonitorService.Interface";
import { IPm2Service } from "./interfaces/IPM2Service.interface";
import BatteriesMonitor from "./services/BatteryMonitor.Service"
import PiPMonitor from "./services/PiPMonitor.Service";
import DbService from "./services/DB.Service";
import Pm2Service from "./services/PM2.Service";

const dbService: IDbService = new DbService();
const dbConnection: Sqlite3.Database = dbService.getDbConnection();
const pM2Service: IPm2Service = new Pm2Service();

const app: Application = express();
const router: Router = express.Router()
const port: number = 5000;
let availablePorts: SerialPort.PortInfo[] = [];

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
    dbService.getConfigurationExist((error: Error, results)=>{
        if(error){
            res.status(500);
            res.json({
                name: error.name,
                error: error.message
            })

        } else {
            res.json({
                ports: availablePorts,
                isFirstTime: results
            });
        }
    });
}
 // get configuration
 const getConfiguration = (req: Request, res: Response) => {
     dbService.getLastConfiguration((error: Error, result) =>{
        if(error){
            res.status(500);
            res.json({
                name: error.name,
                error: error.message
            })

        } else {
            res.json(result);
        }
     })
 }

 // save configuration
 const saveConfiguration = (req: Request, res: Response) => {
     const newConfig: IConfiguration = req.body;
     dbService.saveConfiguration(newConfig, (error: Error, result) => {
        if(error){
            res.sendStatus(500);
        } else {
            // Restart Monitors
            monitorsInit();
            res.sendStatus(200);
        }
     });
 }

 // Reload server
 const reloadProcess = (req: Request, res: Response) => {
    console.log('Server reload');
    pM2Service.managerReload();
    //process.abort();
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
app.get('/configuration', getConfiguration);
app.post('/configuration', saveConfiguration);
app.post('/reload', reloadProcess);
app.get('/', mainRoute);

// Inititate the server
const server: Server = app.listen(port, () => {
    console.log(`App is listening on port:${port}`);
});

// Initiate IO Server
const io: SocketIO.Server = SocketIO(server);
const batteriesMonitor: IBaterryMonitorService = new BatteriesMonitor(io,dbService);
const pipMonitor: IPiPMonitorService = new PiPMonitor(io, dbService);
// Method to initiate monitors
const monitorsInit = () => {
    // We only initiatiate the monitor if they are configured.
    dbService.getConfigurationExist((error: Error, isFirstTime)=>{ 
        if(error){
            console.error(error);
        } else {
            // Only if Configuration exists
            if(!isFirstTime){
                dbService.getLastConfiguration((error: Error, results)=>{
                    if(error) {
                        console.error(error);
                    } else {
                        // If Battery monitor is enabled then init monitor service
                        if(!!results.isBatteryMonitor) {
                            batteriesMonitor.init({commPort: results.batteryMonitorPort});
                        }
                        // start PIP monitor
                        pipMonitor.init({commPort: results.inverterPort, maxPIPOutPower: results.inverterPower, maxPVPower: results.pvModulesPower});
                        // If isPublic enable request a new publicTunnel
                        publicAccessInit(results.subdomain, !!results.isPublicEnabled);
                        // If Influx host configured
                        if(results.influxHost && (typeof results.influxHost != 'undefined')){
                            const influxConfig: IInfluxDbConfig = {
                                host: results.influxHost,
                                user: results.influxUser,
                                pwd: results.influxPassword,
                                db: results.influxDb
                            }
                            dbService.setInfluxDb(influxConfig);
                        }
                    }
                });
            }
        }
    });
}

// Initiate localtunnel
let tunnel: any = {};
const publicAccessInit = async (subdomain?: string, mustOpen?: boolean) => {
    // check if mustOpen.
    if(mustOpen){
        let tunnelConfig = {
            port: port,
            host: 'http://serverless.social',
            subdomain: ''
        }
        if((typeof subdomain != 'undefined') || subdomain !== ''){
           tunnelConfig = {
                port: port,
                host: 'http://serverless.social',
                subdomain: subdomain
            }
        }
        tunnel = await Localtunnel(tunnelConfig);
        console.log('URL', tunnel.url);
        tunnel.on('close', () => {
            console.warn('Localtunnel closed');
        });
    } else {
        // this means we must close if tunnel exist
        if(typeof tunnel.close !== 'undefined'){
            tunnel.close();
        }
    }
};

monitorsInit();