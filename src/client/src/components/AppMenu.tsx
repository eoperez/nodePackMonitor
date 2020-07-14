import React, { ReactElement, useState } from 'react'
import { AppBar, BottomNavigation, BottomNavigationAction, makeStyles, Theme, createStyles, Divider } from '@material-ui/core'
import { NetworkCheckSharp, SettingsBrightness, AccountTreeSharp, SyncProblem  } from "@material-ui/icons";
import axios from "axios";
import ConfigPeek from "./ConfigPeek";
import { ENDPOINT } from "../store/AppConfigurationContext";

interface IActiveAction {
    selected?: string;
    isDrawerOpen: boolean;
}

interface Props {}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            color: theme.palette.text.primary,
   
            "&$selected": {
                color: theme.palette.secondary.light
            }
        },
        appBar: {
            top: 'auto',
            bottom: 0,
        }
    })
);

const serverReload = async () => {
    const results = await axios.post(`${ENDPOINT}reload`);
            if(!(results.status === 200)){
                console.error('Error saving configuration:',results.data);
     }
}

export default function AppMenu(props: Props): ReactElement {
    const classes = useStyles();
    const [activeAction, setActiveAction] = useState<IActiveAction>({isDrawerOpen: false});

    const navActions = (event: React.ChangeEvent<{}>, newValue: string): void => {
        if(newValue) {
            setActiveAction({selected: newValue, isDrawerOpen: true});
        } else {
            serverReload();
        }
    }
    return (
        <React.Fragment key='holder'>
            <ConfigPeek isOpen={activeAction.isDrawerOpen} drawerType={activeAction.selected} />
            <AppBar position="fixed" color="primary" className={classes.appBar}>
                <Divider />
                <BottomNavigation value={activeAction.selected} onChange={navActions} showLabels={true} classes={classes}>
                    <BottomNavigationAction label="Monitors" value="monitorConfig" icon={<NetworkCheckSharp />} classes={classes} />
                    <BottomNavigationAction label="System" value="sysConfig" icon={<SettingsBrightness />} classes={classes} />
                    <BottomNavigationAction label="Integration" value="intConfig" icon={<AccountTreeSharp />} classes={classes} />
                    <BottomNavigationAction label="Reload" value="" icon={<SyncProblem />} classes={classes} />
                </BottomNavigation>
            </AppBar>
        </ React.Fragment>
    )
}
