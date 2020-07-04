import React, { ReactElement, useState, useEffect } from 'react';
import {
  colors,
  Grid,
  Paper, 
  makeStyles, 
  createStyles,
  Theme} from '@material-ui/core';
import BarChart from './BarChart'
import GaugeTile from "./GaugeTile";
import SingleStat from "./SingleStat";
import socketIOClient from "socket.io-client"

const ENDPOINT = "http://192.168.0.5:5000"

interface Props {

}
interface IPeakStats {
  batteryPowerOut: number;
  usage: number;
  grid: number;
  pvProduction: number;
  pvCharging: number;
}

export interface IDailyStats {
  grid: number;
  pv: number;
  powerUsage: number;
  batteryUsage: number;
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
    listIconAvatar: {
      color: "white",
    }
  }),
);

export default function Dashboard(props: Props): ReactElement {
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
    const [dailyStats, setDailyStats] = useState<IDailyStats>({
      grid: 0,
      pv: 0,
      powerUsage: 0,
      batteryUsage: 0
    });
    const [peakStats, setPeakStats] = useState<IPeakStats>({
      batteryPowerOut: 0,
      usage: 0,
      grid: 0,
      pvProduction: 0,
      pvCharging: 0
    });
    useEffect(() => {
      const socket = socketIOClient(ENDPOINT);
      socket.on("bankInfo", (barsInfo: any) => {
        setBars(barsInfo);
      });
      socket.on("inverter", (inverterInfo: any) => {
        setInverter(inverterInfo);
      });
      socket.on("dailyTotals", (dailyStats: IDailyStats) => {
        setDailyStats(dailyStats);
      });
      socket.on("peakStats", (peakStats: IPeakStats) => {
        setPeakStats(peakStats);
      });
    }, []);
    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
               <GaugeTile id= "gridInfo" title="GRID" percentage={inverter.grid.loadPercent}
               infoTiles={[
                 {primaryText: inverter.grid.voltage, secondaryText: "Voltage", unit: "V"},
                 {primaryText: inverter.grid.frequency, secondaryText: "Frequency", unit: "Hz"},
                 {primaryText: inverter.grid.power.toFixed(2), secondaryText: "Power", unit: "W"}
                ]} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <GaugeTile id= "pvInfo" title="PV" percentage={inverter.pv.productionPercent} 
              infoTiles={[
                {primaryText: inverter.pv.voltage_1, secondaryText: "Voltage", unit: "V"},
                {primaryText: inverter.pv.currentBattery, secondaryText: "Battery Current", unit: "A"},
                {primaryText: inverter.pv.chargingPower, secondaryText: "Charging", unit: "W"},
                {primaryText: inverter.pv.powerForLoads.toFixed(2), secondaryText: "Load", unit: "V"},
              ]} reverse={true}/>

            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <GaugeTile id="consumption" title="Consumption" percentage={inverter.consumption.loadPercent}
              infoTiles={[
                {primaryText: inverter.consumption.voltage, secondaryText: "Voltage", unit: "V"},
                {primaryText: inverter.consumption.frequency, secondaryText: "Frequency", unit: "Hz"},
                {primaryText: inverter.consumption.powerVa, secondaryText: "Power", unit: "Va"},
                {primaryText: inverter.consumption.activePower, secondaryText: "Active", unit: "W"}
              ]} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <GaugeTile id="battery" title="Battery Bank" percentage={inverter.battery.capacity}
                infoTiles={[
                  {primaryText: inverter.battery.powerIn.toFixed(2), secondaryText: "Power In", unit:"W"},
                  {primaryText: inverter.battery.chargingCurrent, secondaryText: "Charging", unit: "A"},
                  {primaryText: inverter.battery.voltage, secondaryText: "Voltage", unit: "V"},
                  {primaryText: inverter.battery.powerOut.toFixed(2), secondaryText: "Power Out", unit: "W"}
                ]} reverse={true}/>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <BarChart
              title="Balance"
              bars={bars}
            ></BarChart>
          </Grid>
          <Grid item xs={2}>
            <Paper className={classes.paper}>
              <SingleStat title="Daily Grid Usage" value={dailyStats.grid.toFixed(2)} units="Kwh" icon="business" color={colors.orange[900]} textColor={colors.grey[50]} />
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper className={classes.paper}>
              <SingleStat title="Daily PV Production" value={dailyStats.pv.toFixed(2)} units="Kwh" icon="wb_sunny" color={colors.grey[700]} textColor={colors.lime[500]}/>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper className={classes.paper}>
                <SingleStat title="Daily Power Usage" value={dailyStats.powerUsage.toFixed(2)} units="Kwh" icon="wb_incandescent" color={colors.red['A400']} textColor={colors.grey[300]}/>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper className={classes.paper}>
              <SingleStat title="Daily Battery Usage" value={dailyStats.batteryUsage.toFixed(2)} units="Kwh" icon="battery_alert" color={colors.grey[700]} textColor={colors.yellow['A100']}/>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper className={classes.paper}>
              <SingleStat title="Peak Usage" value={peakStats.usage.toString()} units="w" icon="power" color={colors.orange[300]} textColor={colors.grey[800]}/>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper className={classes.paper}>
              <SingleStat title="Peak PV Output" value={peakStats.pvProduction.toString()} units="w" icon="brightness_high" color={colors.grey[700]} textColor={colors.yellow[500]}/>
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
}
