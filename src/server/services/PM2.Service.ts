import { IPm2Service } from "../interfaces/IPM2Service.interface";
import * as PM2 from "pm2";

export default class Pm2Service implements IPm2Service {
    constructor() {}
    managerList = ():void => {
        PM2.connect((error: Error) => {
            if(error){
                console.error(error);
                process.exit(2);
            }
            PM2.list((error: Error, list: PM2.ProcessDescription[]) =>{
                console.log('PM2 Services list', list);
            });
        })
    }
}