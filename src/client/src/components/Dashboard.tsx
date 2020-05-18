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
    const [response, setResponse] = useState("");

    useEffect(() => {
      const socket = socketIOClient(ENDPOINT);
      socket.on("monitorVolt", (data: any) => {
        console.log('volts object:', JSON.stringify(data) );
        setResponse(data);
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
              bars={[
                {id: 1, value: 3.91},
                {id: 2, value: 3.93},
                {id: 3, value: 3.91},
                {id: 4, value: 3.92},
                {id: 5, value: 3.94},
                {id: 6, value: 3.91},
                {id: 7, value: 3.90},
                {id: 8, value: 3.93},
                {id: 9, value: 3.91},
                {id: 10, value: 3.92},
                {id: 11, value: 3.92},
                {id: 13, value: 3.93},
                {id: 14, value: 3.94},
                {id: 15, value: 3.93},
                {id: 16, value: 3.93},
                {id: 17, value: 3.93},
                {id: 18, value: 3.92},
                {id: 19, value: 3.91},
                {id: 20, value: 3.92},
                {id: 21, value: 3.92},
                {id: 22, value: 3.93},
                {id: 23, value: 3.91},
                {id: 24, value: 3.90}
              ]}
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
