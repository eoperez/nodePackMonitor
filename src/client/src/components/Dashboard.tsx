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

    useEffect(() => {
      const socket = socketIOClient(ENDPOINT);
      socket.on("bankInfo", (barsInfo: any) => {
        // console.log('bankInfo object:', JSON.stringify(barsInfo) );
        setBars(barsInfo);
      });
    }, []);
    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
               <GaugeTile id= "gridInfo" title="GRID" percentage={.5} 
               infoTiles={[
                 {primaryText: "250v", secondaryText: "Voltage"},
                 {primaryText: "60hz", secondaryText: "Frequency"}
                ]} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <GaugeTile id= "pvInfo" title="PV" percentage={.5} 
              infoTiles={[
                {primaryText: "250v", secondaryText: "Voltage"},
                {primaryText: "16a", secondaryText: "Current"}
              ]} reverse={true}/>

            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <GaugeTile id="consumption" title="Consumption" percentage={.5}
              infoTiles={[
                {primaryText: "250v", secondaryText: "Voltage"},
                {primaryText: "60hz", secondaryText: "Frequency"},
                {primaryText: "800va", secondaryText: "Power"},
                {primaryText: "750w", secondaryText: "Active"}
              ]} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <GaugeTile id="battery" title="Battery Bank" percentage={.5}
                infoTiles={[
                  {primaryText: "48v", secondaryText: "Bus Voltage"},
                  {primaryText: "56.7v", secondaryText: "Voltage"},
                  {primaryText: "0a", secondaryText: "Current"}
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
