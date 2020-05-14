import * as express from 'express'
import { Application, Router, Request, Response} from 'express'
import { join } from "path";
import { Server } from "http";
import * as SocketIO from "socket.io";
import { IPacket, ISerialConfiguration} from "./interfaces/ISerialData.interface";

const app: Application = express();
const router: Router = express.Router()
const port: number = 5000;

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

