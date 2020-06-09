import React, { ReactElement } from 'react'
import {
    Grid,
    Typography,
    Hidden,
    Divider,
    colors
} from '@material-ui/core'

import GaugeChart from 'react-gauge-chart';

interface IinfoTile {
    primaryText: string;
    secondaryText: string;
    unit?: string;
}

interface Props {
    id: string;
    title: string;
    percentage: number;
    infoTiles: Array<IinfoTile>;
    reverse?: boolean;
}

export default function GaugeTile(props: Props): ReactElement {
    const infoTiles = props.infoTiles.map((infoTile:IinfoTile) =>
        <Grid item>
            <Typography variant='h6' color="secondary" style={{ fontSize: '1rem' }}>{infoTile.primaryText}<Typography variant="caption">{infoTile.unit}</Typography></Typography>
            <Typography variant='body2' style={{ fontSize: '.8rem' }}>{infoTile.secondaryText}</Typography>
        </Grid>
    );
    let colors: Array<string> = ["#00FF00", "#FF0000"];
    if (props.reverse) {
        colors = ["#FF0000", "#00FF00"];
    }
    return (
        <Grid container direction="row" justify="space-around">
            <Grid item xs={12}>
                <Typography variant='h6' style={{ color: "white" }}>{props.title}</Typography>
                <Divider />
            </Grid>
            <Hidden smDown>
                <Grid item xs={12}>
                    <GaugeChart id={props.id}
                        nrOfLevels={6} arcPadding={0.05} cornerRadius={3} percent={props.percentage} marginInPercent={0.04}
                        style={{ width: "70%", display: "inline-block" }} colors={colors} needleBaseColor="#6B6B6B" needleColor="#6B6B6B"
                    />
                    <Divider />
                </Grid>
            </Hidden>
            {infoTiles}
        </Grid>
    )
}
