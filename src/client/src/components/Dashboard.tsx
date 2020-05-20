import React, { ReactElement, useState, useEffect } from 'react'
import {Grid, Paper, makeStyles, createStyles, Theme} from '@material-ui/core'
import BarChart from './BarChart'
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
