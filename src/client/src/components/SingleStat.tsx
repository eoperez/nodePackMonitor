import React, { ReactElement } from 'react';
import {
    makeStyles, 
    Theme, 
    createStyles,
    Grid,
    Typography,
    Hidden,
    Divider,
    Icon,
    Avatar
} from '@material-ui/core';

import { pageTheme } from "../App";

interface Props {
    icon?: string;
    title?: string;
    value?: string;
    units?: string;
    color: string;
    textColor?: string;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        avatar: {
            fontSize: 60,
            margin: -5,
            width: 'auto',
            height: 'auto',
        },
        icon: {
            fontSize: '100%',
            margin: 10
        },
        content: {
            marginTop: 5,
            marginBottom: 5
        },
        title: {
            marginTop: 5
        },
        divider: {
            marginLeft: 15,
            marginRight: 10
        }
    })
);

export default function SingleStat(props: Props): ReactElement {
    const classes = useStyles();

    return (
        <Grid container direction="row" justify="space-around">
            <Hidden smDown>
                <Grid item xs={4}>
                    <Avatar className={classes.avatar} style={{backgroundColor: props.color}} variant="rounded">
                        <Icon className={classes.icon} style={{color: props.textColor }}>{props.icon}</Icon>
                    </Avatar>
                </Grid>
            </Hidden>
            <Grid item xs={8}>
                <Typography variant="h5" color="secondary" className={classes.content}>{props.value}<Typography variant="caption"> {props.units}</Typography></Typography>
                <Divider className={classes.divider} />
                <Typography variant="subtitle2" style={{ color: "white" }} className={classes.title}>{props.title}</Typography>
            </Grid>
            
        </Grid>
    )
}
