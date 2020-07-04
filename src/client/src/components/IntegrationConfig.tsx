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
    Checkbox,
    Input,
    InputAdornment,
    RadioGroup
} from '@material-ui/core'

import {AppConfigurationContext, IAppConfiguration, IAppConfigurationContext} from "../store/AppConfigurationContext"


interface Props {}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formContainer: {
            marginTop: 5
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

export default function IntegrationConfig(props: Props): ReactElement {
    const { setCurrentAppConfigurationContext, appConfiguration } = useContext<IAppConfigurationContext>(AppConfigurationContext);
    const [currentAppConfig, setCurrentAppConfig] = useState(appConfiguration);
    const [isDisabled, setIsDisabled] = useState(appConfiguration.integrationConfig.isPublicEnabled); // isBatteryMonitor
    const [isSaved, setIsSaved] = useState(true);

    const classes = useStyles();
    const handleInputChange = (event: React.ChangeEvent<any>, value?: any) => {
        let newAppConfig: IAppConfiguration = Object.assign({}, currentAppConfig);
        if(event.currentTarget.id === "save"){
            setIsSaved(!isSaved);
        } else {
            switch (event.target.name) {
                case "isPublic":
                    setIsDisabled(!isDisabled);
                    newAppConfig.integrationConfig.isPublicEnabled = !isDisabled;
                    break;
                case "subdomain":
                    newAppConfig.integrationConfig.subdomain = event.target.value;
                    break;
                case "influxHost":
                    newAppConfig.integrationConfig.influxHost = event.target.value;
                    break;
                case "influxUser":
                    newAppConfig.integrationConfig.influxUser = event.target.value;
                    break;
                case "influxPwd":
                    newAppConfig.integrationConfig.influxPassword = event.target.value;
                    break;
                case "influxDb":
                    newAppConfig.integrationConfig.influxDb = event.target.value;
                    break;
                default:
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
                <FormControlLabel control={<Checkbox checked={isDisabled} onChange={handleInputChange} name="isPublic" />} label="Make this server public"/>
                <FormHelperText>Enable public access to this server. Please note that enabling this feature will make this available to the internet. </FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="subdomain" color="secondary">Subdomain</InputLabel>
                <Input disabled={!isDisabled} onChange={handleInputChange} value={currentAppConfig.integrationConfig.subdomain} color="secondary" name="subdomain" id="subdomain" />
                <FormHelperText id="subdomain-helper-text">Enter the maximum power allowed by your inventer. This value will be used to calculate load percentage.</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="influxHost" color="secondary">Influx Host</InputLabel>
                <Input onChange={handleInputChange} value={currentAppConfig.integrationConfig.influxHost} color="secondary" name="influxHost" id="influxHost" />
                <FormHelperText id="influxHost-helper-text">Enter Influx host including port, it will be use by the server to send timeseries events.</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="influxUser" color="secondary">Influx User</InputLabel>
                <Input onChange={handleInputChange} value={currentAppConfig.integrationConfig.influxUser} color="secondary" name="influxUser" id="influxUser" />
                <FormHelperText id="influxUser-helper-text">Provide an Username. The user must have Db create permissions.</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="influxPwd" color="secondary">Influx User Password</InputLabel>
                <Input onChange={handleInputChange} value={currentAppConfig.integrationConfig.influxPassword} type="password" color="secondary" name="influxPwd" id="influxPwd" />
                <FormHelperText id="influxPwd-helper-text">Enter password for provided user.</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="influxDb" color="secondary">Influx Target Database</InputLabel>
                <Input onChange={handleInputChange} value={currentAppConfig.integrationConfig.influxDb} color="secondary" name="influxDb" id="influxDb" />
                <FormHelperText id="influxDb-helper-text">Database to use. If no name provide the system will use "solarMonitor" as name for the database</FormHelperText>
            </FormControl>
            <br />
            <Button id="save" component="button" onClick={handleInputChange} className={classes.formActionBtn} variant="contained" startIcon={<Save style={{color: "white"}} />} color="primary">Save</Button>
        </div>
    )
}