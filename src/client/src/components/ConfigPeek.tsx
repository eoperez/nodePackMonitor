import React, { ReactElement, useState, useEffect } from 'react'
import axios from 'axios'
import { makeStyles, 
    Theme, 
    createStyles, 
    Drawer, 
    Typography, 
    Divider
} from '@material-ui/core'
import MonitorConfig from "./MonitorConfig";

interface Props {
    isOpen: boolean;
    drawerType?: string;
}

interface IDrawer extends Props {
    title?: string;
    form?: JSX.Element;

}

interface IServerInfo {
    isFirstTime: boolean;
    ports?: Array<IPort>
}
export interface IPort {
    manufacturer?: string;
    serialNumber?: string;
    pnpId?: string;
    vendorId?: string;
    productId?: string;
    path: string;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        drawerContainer: {
            margin: theme.spacing(1),
            height: '100%',
            width: 300
        }
    })
);

export default function ConfigPeek(props: Props): ReactElement {
    const classes = useStyles();
    const [serverInfo, setServerInfo] = useState<IServerInfo>({isFirstTime: true});
    const [drawer, setDrawer] = useState<IDrawer>({isOpen: props.isOpen, drawerType: props.drawerType});
    const getServerInfo = async () => {
        const results = await axios('http://192.168.0.5:5000/serverinfo');
        setServerInfo(results.data);
    }
    useEffect(() => {
        getServerInfo();
    }, []);
    useEffect(() => {
        const newDrawer: IDrawer = {...props};
        switch (props.drawerType) {
            case 'monitorConfig':
                newDrawer.title = 'Monitors Configuration';
                newDrawer.form = (
                    <MonitorConfig ports={serverInfo.ports}/>
                );
                break;
            case 'sysConfig':
                newDrawer.title = 'Solar System Information'
                break;
            case 'intConfig':
                newDrawer.title = 'Integration Configuration'
                break;
            default:
                break;
        }
        setDrawer(newDrawer);
    }, [props, serverInfo]);

    const drawerHandler = (newIsOpenStatus: boolean) => (event: React.KeyboardEvent | React.MouseEvent) =>{
        const newDrawer: IDrawer = {isOpen: newIsOpenStatus}
        setDrawer(newDrawer);
    }

    return (
        <Drawer anchor="left" open={drawer.isOpen} onClose={drawerHandler(false)}>
            <div className={classes.drawerContainer}>
                <Typography variant="h4">{drawer.title}</Typography>
                <Divider />
                {drawer.form}
            </div>
        </Drawer>
    )
}
