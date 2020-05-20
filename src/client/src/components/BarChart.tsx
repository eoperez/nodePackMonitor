import React, { ReactElement, useState } from 'react'
import {Paper, makeStyles, Theme, createStyles} from '@material-ui/core'


export interface Bar {
    id: number;
    voltage: number;
    temp?: number;
}

interface BarObj extends Bar {
    width: number;
    xLocation: number;
    height: number;
    yLocation: number;
    xStrokeLocation: number;
}

interface Props {
    bars: Array<Bar>;
    title: string;
}

interface VoltageSummary {
    avg: string;
    highest: string;
    lowest: string;
}

interface ChartRowBgs {
    id: number;
    bgBoxY: number;
    bgColor: string;
}

interface ChartScale {
    id: number;
    strokeY: number;
    voltageScale: string;
    scaleYLocation: number;
}

interface Summary {
    avg: string;
    lowest: string;
    highest: string;
    unbalanceMarkTopLoc: number;
    unbalanceMarkButtLoc: number;
    unbalanceAreaHeight: number;
}

// TODO: Move to configuration 
const scaleOptions = {start: 3.00, end: 4.25, interval: .10};
const rowSize: number = 20;
const chartTitleEnds: number = 40;
const barSpace: number = 5;
const numberScale: number = (scaleOptions.end - scaleOptions.start)/ scaleOptions.interval;
let barValueTotal: number = 0;
let barHighestValue: number = 0; // default value should be supper low
let barLowestValue: number = 100; // default value should be supper high
let unbalanceTop: number = 0;
let unbalanceButt: number = 0;

const useChartScale = () => {
    let rowScales: Array<ChartScale> = [];
    let scaleY: number = chartTitleEnds;
    let scaleNum: number = scaleOptions.end;

    for (let i: number = 0; i <= numberScale; i++) {
        scaleY = scaleY + rowSize;
        rowScales.push({
            id: i,
            strokeY: scaleY,
            voltageScale: scaleNum.toFixed(2),
            scaleYLocation: scaleY + 4
        });
        scaleNum = scaleNum - scaleOptions.interval;

    }
    return rowScales;
}

const useChartBoxBg = () => {
    let rowsBGs: Array<ChartRowBgs> = [];
    let cordY: number = chartTitleEnds;
    let bgColor: string = '#333333';
    for (let i = 0; i <= numberScale-1; i++) {
        cordY = cordY + rowSize;
        if(i%2 == 0){
            bgColor = '#333333';
        } else {
            bgColor = '#000000';
        }
        rowsBGs.push({
            id: i,
            bgBoxY: cordY,
            bgColor: bgColor
        });
    };
    return rowsBGs;
}

const useBarDimensions = (bars: Array<Bar>): Array<BarObj> => {
    const barWidth: number = (860 - (barSpace * bars.length)) / bars.length; // 860 is the available space between chart boundaries (vertical right x position - vertical left x position - 5px space to the right)
    const barsSets: Array<BarObj> = [];
    let barLocationX: number = 80;
    let prevBarValueTotal = 0;
    bars.forEach(bar => {
        barLocationX = barLocationX + 5;
        const barHeight: number = ((bar.voltage - scaleOptions.start) / (scaleOptions.end - scaleOptions.start)) * 240; // 240 is the maximum vertical space for the bar
        const barLocationY: number = 60 + (240 - barHeight);
        const cellStrokeX: number = barLocationX + (barWidth/2);
        barsSets.push({id: bar.id, voltage: bar.voltage, width: barWidth, xLocation: barLocationX, yLocation: barLocationY ,height: barHeight, xStrokeLocation: cellStrokeX});
        barLocationX = barLocationX + barWidth;
        // Do the summary
        barValueTotal = prevBarValueTotal + bar.voltage;
        console.log('barValueTotal: ', barValueTotal);
        if(bar.voltage < barLowestValue){
            barLowestValue = bar.voltage;
            unbalanceButt = barLocationY;
        }
        if(bar.voltage > barHighestValue) {
            barHighestValue = bar.voltage;
            unbalanceTop = barLocationY;
        }
        prevBarValueTotal = barValueTotal;
        console.log('prevBarValueTotal:', prevBarValueTotal);
    });
    
    return barsSets
}

const useSummary = (): Summary => {
    console.log('useSummary::barValueTotal:', barValueTotal);
    return {
        avg: (barValueTotal/2).toFixed(2), 
        lowest: barLowestValue.toFixed(2), 
        highest: barHighestValue.toFixed(2), 
        unbalanceMarkButtLoc: unbalanceButt, 
        unbalanceMarkTopLoc: unbalanceTop,
        unbalanceAreaHeight: (barHighestValue - barLowestValue)*240
    };
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            textAlign: 'center',
            padding: 10,
            margin: 'auto'
        },
        bar: {
            fill: '#ffff56'
        }
    })
);

export default function BarChart(props: Props): ReactElement {

    const classes = useStyles();
    const rowScales = useChartScale();
    const rowBgs = useChartBoxBg();
    const barDimensions = useBarDimensions(props.bars);
    const summary = useSummary();

    const chartRowScaleLines = rowScales.map((row)=>
        <g>
            <line stroke="#ffffff" stroke-linecap="null" stroke-linejoin="null" y2={row.strokeY} x2="950" y1={row.strokeY} x1="75" stroke-width="0.5" fill="none"/>
            <text transform="matrix(1 0 0 1 0 0)" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="12" y={row.scaleYLocation} x="45.0002" stroke-width="0" stroke="#ffffff" fill="#999999">{row.voltageScale}</text>
        </g>
    );

    const chartRowBgs= rowBgs.map((row)=>
        <rect opacity="1" height="20" width="864" y={row.bgBoxY} x="80" strokeOpacity="null" strokeWidth="0" stroke="#000" fill={row.bgColor}/>
    );
    const bars = barDimensions.map((bar) =>
        <g>
            <title>{`Cell: ${bar.id}, Volts: ${bar.voltage.toFixed(2)}`}</title>
            <rect rx="3" className={classes.bar} id={`bar${bar.id}`} height={bar.height} width={bar.width} y={bar.yLocation} x={bar.xLocation} stroke-width="0"/>
            <line stroke="#ffffff" stroke-linecap="null" stroke-linejoin="null" y2="305" x2={bar.xStrokeLocation} y1="300" x1={bar.xStrokeLocation} stroke-width="0.5" fill="none"/>
            <text text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="10" y="315" x={bar.xStrokeLocation} stroke-width="0" stroke="#000" fill="#ffffff">
                {bar.id}</text>
        </g>
    );

    return (
        <Paper className={classes.paper}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 350" preserveAspectRatio="xMinYMin meet">
                <g>
                    <rect rx="5" x="-1" y="-1" width="100%" height="100%" id="canvas_background" fill="#191919"/>
                    <g id="canvasGrid" display="none">
                        <rect rx="5" id="svg_1" width="100%" height="100%" x="0" y="0" strokeWidth="0" fill="url(#gridpattern)"/>
                    </g>
                </g>
                <g>
                    {chartRowBgs}
                </g>

                <g id="unbalance area">
                    <line fill="none" stroke="#39ff14" x1="80.00567" y1={summary.unbalanceMarkTopLoc} x2="944.99718" y2={summary.unbalanceMarkTopLoc} id="unBalanceGreen" stroke-linejoin="round" stroke-linecap="butt" stroke-dasharray="3,2"/>
                    <rect fill="#ff073a" x="80.00193" y="119.30234" width="864.82932" height={summary.unbalanceAreaHeight} id="svg_134" opacity="0.6" rx="1"/>
                </g>

                <g>
                    {chartRowScaleLines}
                </g>

                <g id="Series">
                    <line stroke="#ffffff" stroke-linecap="null" stroke-linejoin="null" id="verticalLeft" y2="305" x2="80" y1="55" x1="80" stroke-width="0.5" fill="none"/>
                    <line stroke="#ffffff" stroke-linecap="null" stroke-linejoin="null" id="verticalRight" y2="305" x2="945" y1="55" x1="945" stroke-width="0.5" fill="none"/>
                    <text opacity="0.75" transform="rotate(-90 21.2422 179.727)" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="14" id="svg_17" y="184.5" x="-2.5" stroke-width="0" stroke="#000" fill="#ffffff">Volts</text>
                    <text opacity="0.75" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" id="svg_17" y="335" x="496" stroke-width="0" stroke="#000" fill="#ffffff">Cells</text>
                </g>
                <g id="Avg">
                    <text text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="10" id="svg_20" y="45" x="670" stroke-width="0" stroke="#000" fill="#ffffff">Avg:</text>
                    <text opacity="0.75" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="10" id="svg_24" y="45" x="700" stroke-width="0" stroke="#000" fill="#ffff56">{summary.avg}v</text>
                </g>
                <g id="Lowest">
                    <text stroke="#000" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="10" id="svg_19" y="45" x="750" stroke-width="0" fill="#ffffff">Lowest:</text>
                    <text opacity="0.75" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="10" id="svg_26" y="45" x="800" stroke-width="0" stroke="#000" fill="#ffff56">{summary.lowest}v</text>
                </g>
                <g id="Highest">
                    <text stroke="#000" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="10" id="svg_21" y="45" x="850" stroke-width="0" fill="#ffffff">Highest:</text>
                    <text opacity="0.75" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="10" id="svg_25" y="45" x="900" stroke-width="0" stroke="#000" fill="#ffff56">{summary.highest}v</text>
                </g>
                <g>
                    <title>BarSet</title>
                    {bars}
                </g>
                <line fill="none" stroke="#ff073a" x1="80.00567" y1={summary.unbalanceMarkButtLoc} x2="944.99718" y2={summary.unbalanceMarkButtLoc} id="unBalanceRed" stroke-linejoin="round" stroke-linecap="butt" stroke-dasharray="3,2"/>
            </svg>
        </Paper>
    )
} 
