import React, { ReactElement, useState, useEffect } from 'react'
import { AppBar, BottomNavigation, BottomNavigationAction, makeStyles, Theme, createStyles, Divider } from '@material-ui/core'
import { NetworkCheckSharp, SettingsBrightness, AccountTreeSharp  } from "@material-ui/icons";
import axios from 'axios'
import ConfigPeek from "./ConfigPeek";

interface IActiveAction {
    selected?: string;
    isDrawerOpen: boolean;
}

interface IServerInfo {
    isFirstTime: boolean;
    ports?: Array<IPort>
}
interface IPort {
    manufacturer?: string;
    serialNumber?: string;
    pnpId?: string;
    vendorId?: string;
    productId?: string;
    path: string;
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
        selected: {},
        appBar: {
            top: 'auto',
            bottom: 0,
        }
    })
);

export default function AppMenu(props: Props): ReactElement {
    const classes = useStyles();
    const [activeAction, setActiveAction] = useState<IActiveAction>({isDrawerOpen: false});
    const [serverInfo, setServerInfo] = useState<IServerInfo>({isFirstTime: true});
    
    useEffect(() => {
        const getServerInfo = async () => {
            const results = await axios('http://192.168.0.5:5000/serverinfo');
            setServerInfo(results.data);
        }
        getServerInfo();
    },[]);

    useEffect(() => {
        console.log(serverInfo.ports);
    });

    const navActions = (event: React.ChangeEvent<{}>, newValue: string): void => {
        if(newValue) {
            setActiveAction({selected: newValue, isDrawerOpen: true});
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
                </BottomNavigation>
            </AppBar>
        </ React.Fragment>
    )
}
