import React, { ReactElement, useState, useContext, useMemo } from 'react'
import { Save } from "@material-ui/icons";
import {
    makeStyles,
    Theme,
    createStyles,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Button,
    FormControlLabel,
    FormLabel,
    Checkbox,
    Link,
    Slider,
    Radio,
    RadioGroup
} from '@material-ui/core'

import { IPort } from "./ConfigPeek";
import {AppConfigurationContext, IAppConfiguration, IAppConfigurationContext} from "../store/AppConfigurationContext"

interface Props {
    ports: Array<IPort> | undefined;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        slider: {
            marginTop: 30,
            marginLeft: 10
        },
        formContainer: {
            marginTop: 10
        },
        formControl: {
            margin: theme.spacing(1),
            width: '80%'
        },
        formActionBtn: {
            width: '90%',
            color: "white",
            textAlign: "center",
            position: "absolute",
            bottom: "0%",
            margin: 10
        }
    })
);

function packInBankValue(value: number) {
    return value.toString();
}

export default function MonitorConfig(props: Props): ReactElement {
    const { setCurrentAppConfigurationContext, appConfiguration } = useContext<IAppConfigurationContext>(AppConfigurationContext);
    const [currentAppConfig, setCurrentAppConfig] = useState(appConfiguration);
    const [isDisabled, setIsDisabled] = useState(true); // isBatteryMonitor
    const [isSaved, setIsSaved] = useState(true);
    
    const classes = useStyles();

    const menuItems = props.ports?.map((port: IPort, index) =>
        <MenuItem key={index} value={port.path}>{port.path} - {port.serialNumber}</MenuItem>
    )

    const handleInputChange = (event: React.ChangeEvent<any>, value?: any) => {
        let newAppConfig: IAppConfiguration = Object.assign({}, currentAppConfig);
        if(event.currentTarget.id === "save"){
            console.log(event.currentTarget);
            setIsSaved(!isSaved);
        } else {
            switch (event.target.name) {
                case "inverterMode":
                    newAppConfig.monitorConfig.inverterMode = value;
                    break;
                case "inverterPort":
                    newAppConfig.monitorConfig.inverterPort = event.target.value;
                    break;
                case "isBatMonitor":
                    setIsDisabled(!isDisabled);
                    newAppConfig.monitorConfig.isBatteryMonitor = !isDisabled;
                    break;
                case "batteryMonitorPort":
                    newAppConfig.monitorConfig.batteryMonitorPort = event.target.value;
                    break;
                default:
                    newAppConfig.monitorConfig.batteriesSeries = value;
                    break;
            }
        }
        setCurrentAppConfig(newAppConfig);
    }

    useMemo(() => {
        setCurrentAppConfigurationContext(currentAppConfig);
    }, [isSaved]);

    return (
        <div className={classes.formContainer}>
            <FormControl className={classes.formControl}>
                <FormLabel component="legend">Inverter Mode</FormLabel>
                <RadioGroup aria-label="Inverter Mode" name="inverterMode" value={currentAppConfig.monitorConfig.inverterMode} onChange={handleInputChange} row>
                    <FormControlLabel value="M" control={<Radio size="small" />} label="Mono" />
                    <FormControlLabel value="P" control={<Radio size="small" />} label="Parallel" />
                </RadioGroup>
                <FormHelperText>Select "Mono" if you only have 1 inverter otherwise Parallel.</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel id="inverterMonitorPortLabel" color="secondary">Select Inverter Port</InputLabel>
                <Select labelId="inverterMonitorPortLabel" id="inverterPort" value={currentAppConfig.monitorConfig.inverterPort} onChange={handleInputChange} name="inverterPort">
                    <MenuItem value="none" disabled></MenuItem>
                    {menuItems}
                </Select>
                <FormHelperText>Please communication port to monitor the inverter.</FormHelperText>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
                <FormControlLabel control={<Checkbox checked={!isDisabled} onChange={handleInputChange} name="isBatMonitor" />} label="Use battery monitor"/>
                <FormHelperText>Enable Battery Monitor - this means you have all monitors connected using <Link href="https://github.com/eoperez/packMonitor" target="blank"> PackMonitor</Link> </FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel id="batteryMonitorPortLabel" color="secondary">Select Battery Monitor Port</InputLabel>
                <Select disabled={isDisabled} labelId="batteryMonitorPortLabel" id="batteryMonitorPort" value={currentAppConfig.monitorConfig.batteryMonitorPort} onChange={handleInputChange} name="batteryMonitorPort">
                    <MenuItem value="none" disabled></MenuItem>
                    {menuItems}
                </Select>
                <FormHelperText>Please select battery monitor communication Port.</FormHelperText>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
                <Slider disabled={isDisabled} className={classes.slider} value={currentAppConfig.monitorConfig.batteriesSeries} getAriaValueText={packInBankValue} name="batteriesSeries" onChangeCommitted={handleInputChange} aria-labelledby="packInBankValue" step={1} min={0} max={16} valueLabelDisplay="on"/>
                <InputLabel className={classes.slider} id="packInBankValue" color="secondary"># Batteries in Series</InputLabel>
                <FormHelperText className={classes.slider}>Select the number of batteries you have connected in series to get inverter minimum voltage.</FormHelperText>
            </FormControl>
            <br />
            <Button id="save" component="button" onClick={handleInputChange} className={classes.formActionBtn} variant="contained" startIcon={<Save style={{color: "white"}} />} color="primary">Save</Button>
        </div>

    )
}