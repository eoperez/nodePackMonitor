import React, { ReactElement, useState, useEffect } from 'react'
import {
  Grid,
  Paper, 
  makeStyles, 
  createStyles,
  Theme} from '@material-ui/core'
import BarChart from './BarChart'
import GaugeTile from "./GaugeTile";
import socketIOClient from "socket.io-client"

const ENDPOINT = "http://192.168.0.6:5000"

interface Props {

}


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      margin: 20
    },
    paper: {
      padding: theme.spacing(1),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    list: {
    },
    listIconAvatar: {
      color: "white",
    }
  }),
);

export default function Dashboard({}: Props): ReactElement {
    const classes = useStyles();
    const [bars, setBars] = useState([]);
    const [inverter,setInverter] = useState({
      grid: {
          voltage: '--- ',
          frequency: '--- ',
          power: 0,
          loadPercent: 0
      },
      pv: {
          currentBattery: '--- ',
          voltage_1: '--- ',
          chargingPower: '--- ',
          powerForLoads: 0,
          productionPercent: 0
      },
      consumption: {
          voltage: '--- ',
          frequency: '--- ',
          powerVa: '--- ',
          activePower: '--- ',
          loadPercent: 0,
          current: 0
      },
      battery: {
          voltage: '--- ',
          chargingCurrent: '--- ',
          capacity: 0,
          voltageFromScc: '--- ',
          dischargeCurrent: '--- ',
          powerOut: 0,
          powerIn: 0
      },
      inverter: {
          busVoltage: '--- ',
          heatSinkTemperature: '--- ',
          deviceStatus: {
              chargingAC: '',
              chargingSccAcc: '',
              chargingScc: ''
          }
      }
  });

    useEffect(() => {
      const socket = socketIOClient(ENDPOINT);
      socket.on("bankInfo", (barsInfo: any) => {
        // console.log('bankInfo object:', JSON.stringify(barsInfo) );
        setBars(barsInfo);
      });
      socket.on("inverter", (inverterInfo: any) => {
        // console.log('Inverter Info object:', JSON.stringify(inverterInfo) );
        setInverter(inverterInfo);
      });
    }, []);
    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
               <GaugeTile id= "gridInfo" title="GRID" percentage={inverter.grid.loadPercent}
               infoTiles={[
                 {primaryText: inverter.grid.voltage + "V", secondaryText: "Voltage"},
                 {primaryText: inverter.grid.frequency + "Hz", secondaryText: "Frequency"},
                 {primaryText: inverter.grid.power + "W", secondaryText: "Power"}
                ]} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <GaugeTile id= "pvInfo" title="PV" percentage={inverter.pv.productionPercent} 
              infoTiles={[
                {primaryText: inverter.pv.voltage_1 + "V", secondaryText: "Voltage"},
                {primaryText: inverter.pv.currentBattery + "A", secondaryText: "Battery Current"},
                {primaryText: inverter.pv.chargingPower + "W", secondaryText: "Charging Power"},
                {primaryText: inverter.pv.powerForLoads + "W", secondaryText: "Power for Load"},
              ]} reverse={true}/>

            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <GaugeTile id="consumption" title="Consumption" percentage={inverter.consumption.loadPercent}
              infoTiles={[
                {primaryText: inverter.consumption.voltage + "V", secondaryText: "Voltage"},
                {primaryText: inverter.consumption.frequency + "Hz", secondaryText: "Frequency"},
                {primaryText: inverter.consumption.powerVa + "Va", secondaryText: "Power"},
                {primaryText: inverter.consumption.activePower + "W", secondaryText: "Active"}
              ]} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <GaugeTile id="battery" title="Battery Bank" percentage={inverter.battery.capacity}
                infoTiles={[
                  {primaryText: inverter.battery.powerIn + "W", secondaryText: "Power In"},
                  {primaryText: inverter.battery.chargingCurrent + "A", secondaryText: "Charging Current"},
                  {primaryText: inverter.battery.voltage + "V", secondaryText: "Voltage"},
                  {primaryText: inverter.battery.powerOut + "W", secondaryText: "Power Out"}
                ]} reverse={true}/>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <BarChart
              title="Balance"
              bars={bars}
            ></BarChart>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
        </Grid>
      </div>
    )
}
