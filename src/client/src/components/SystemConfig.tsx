import React, { ReactElement, useState, useContext, useMemo } from 'react'
import { Save } from "@material-ui/icons";
import {
    makeStyles,
    Theme,
    createStyles,
    FormControl,
    InputLabel,
    FormHelperText,
    Button,
    FormControlLabel,
    FormLabel,
    Slider,
    Radio,
    Input,
    InputAdornment,
    RadioGroup
} from '@material-ui/core'

import {AppConfigurationContext, IAppConfiguration, IAppConfigurationContext} from "../store/AppConfigurationContext"


interface Props {

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
            margin: theme.spacing(3),
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
    const isDisabled = appConfiguration.monitorConfig.isBatteryMonitor // isBatteryMonitor
    const [isSaved, setIsSaved] = useState(true);

    const classes = useStyles();
    const handleInputChange = (event: React.ChangeEvent<any>, value?: any) => {
        let newAppConfig: IAppConfiguration = Object.assign({}, currentAppConfig);
        if(event.currentTarget.id === "save"){
            setIsSaved(!isSaved);
        } else {
            switch (event.target.name) {
                case "inverterMode":
                    newAppConfig.systemConfig.inverterMode = value;
                    break;
                case "inverterPower":
                    newAppConfig.systemConfig.inverterPower = event.target.value;
                    break;
                case "pvModulesPower":
                    newAppConfig.systemConfig.pvModulesPower = event.target.value;
                    break;
                default:
                    newAppConfig.systemConfig.batteriesSeries = value;
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
                <RadioGroup aria-label="Inverter Mode" name="inverterMode" value={currentAppConfig.systemConfig.inverterMode} onChange={handleInputChange} row>
                    <FormControlLabel value="M" control={<Radio size="small" />} label="Mono" />
                    <FormControlLabel value="P" control={<Radio size="small" />} label="Parallel" />
                </RadioGroup>
                <FormHelperText>Select "Mono" if you only have 1 inverter otherwise Parallel.</FormHelperText>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="inverterPower" color="secondary">Inverter maximum power</InputLabel>
                <Input onChange={handleInputChange} value={currentAppConfig.systemConfig.inverterPower} color="secondary" name="inverterPower" id="inverterPower" type="number" endAdornment={<InputAdornment position="end">Watts</InputAdornment>} />
                <FormHelperText id="inverterPower-helper-text">Enter the maximum power allowed by your inventer. This value will be used to calculate load percentage.</FormHelperText>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="pvModulesPower" color="secondary">PV maximum power</InputLabel>
                <Input onChange={handleInputChange} value={currentAppConfig.systemConfig.pvModulesPower} color="secondary" name="pvModulesPower" id="pvModulesPower" type="number" endAdornment={<InputAdornment position="end">Watts</InputAdornment>} />
                <FormHelperText id="pvModulesPower-helper-text">Enter the maximum power produced by your PV array. This value will be used to calculate percentages.</FormHelperText>
            </FormControl>
            <br />
            <FormControl className={classes.formControl}>
                <Slider disabled={!isDisabled} className={classes.slider} value={currentAppConfig.systemConfig.batteriesSeries} getAriaValueText={packInBankValue} name="batteriesSeries" onChangeCommitted={handleInputChange} aria-labelledby="packInBankValue" step={1} min={0} max={16} valueLabelDisplay="on"/>
                <InputLabel className={classes.slider} id="packInBankValue" color="secondary"># Batteries in Series</InputLabel>
                <FormHelperText className={classes.slider}>Select the number of batteries you have connected in series to get inverter minimum voltage.</FormHelperText>
            </FormControl>
            <br />
            <Button id="save" component="button" onClick={handleInputChange} className={classes.formActionBtn} variant="contained" startIcon={<Save style={{color: "white"}} />} color="primary">Save</Button>
        </div>
    )
}