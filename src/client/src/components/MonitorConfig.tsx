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
    Checkbox,
    Link
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
        FormLabel: {
            color: "white"
        }
        ,
        formContainer: {
            marginTop: 10
        },
        formControl: {
            margin: theme.spacing(3),
            width: '80%',
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

export default function MonitorConfig(props: Props): ReactElement {
    const { setCurrentAppConfigurationContext, appConfiguration } = useContext<IAppConfigurationContext>(AppConfigurationContext);
    const [currentAppConfig, setCurrentAppConfig] = useState(appConfiguration);
    const [isDisabled, setIsDisabled] = useState(appConfiguration.monitorConfig.isBatteryMonitor); // isBatteryMonitor
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
                <InputLabel className={classes.FormLabel} id="inverterMonitorPortLabel" color="secondary">Select Inverter Port</InputLabel>
                <Select labelId="inverterMonitorPortLabel" id="inverterPort" value={currentAppConfig.monitorConfig.inverterPort} onChange={handleInputChange} name="inverterPort">
                    <MenuItem value="none" disabled></MenuItem>
                    {menuItems}
                </Select>
                <FormHelperText>Please communication port to monitor the inverter.</FormHelperText>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
                <FormControlLabel control={<Checkbox checked={isDisabled} onChange={handleInputChange} name="isBatMonitor" />} label="Use battery monitor"/>
                <FormHelperText>Enable Battery Monitor - this means you have all monitors connected using <Link href="https://github.com/eoperez/packMonitor" target="blank"> PackMonitor</Link> </FormHelperText>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
                <InputLabel id="batteryMonitorPortLabel" color="secondary">Select Battery Monitor Port</InputLabel>
                <Select disabled={!isDisabled} labelId="batteryMonitorPortLabel" id="batteryMonitorPort" value={currentAppConfig.monitorConfig.batteryMonitorPort} onChange={handleInputChange} name="batteryMonitorPort">
                    <MenuItem value="none" disabled></MenuItem>
                    {menuItems}
                </Select>
                <FormHelperText>Please select battery monitor communication Port.</FormHelperText>
            </FormControl>
            <br />
            <Button id="save" component="button" onClick={handleInputChange} className={classes.formActionBtn} variant="contained" startIcon={<Save style={{color: "white"}} />} color="primary">Save</Button>
        </div>

    )
}