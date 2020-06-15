import React, { ReactElement, useState, useEffect } from 'react'
import { makeStyles, 
    Theme, 
    createStyles, 
    Drawer, 
    Typography, 
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText} from '@material-ui/core'

interface Props {
    isOpen: boolean;
    drawerType?: string;
}

interface IDrawer extends Props {
    title?: string;
    form?: JSX.Element;

}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        drawerContainer: {
            margin: 10
        }
    })
);

export default function ConfigPeek(props: Props): ReactElement {
    const classes = useStyles();

    const [drawer, setDrawer] = useState<IDrawer>({isOpen: props.isOpen, drawerType: props.drawerType});

    useEffect(() => {
        const newDrawer: IDrawer = {...props};
        switch (props.drawerType) {
            case 'monitorConfig':
                newDrawer.title = 'Monitors Configuration'
                newDrawer.form = (
                    <FormControl>
                        <InputLabel id="demo-simple-select-autowidth-label">Inverter Port</InputLabel>
                        <Select
                        labelId="demo-simple-select-autowidth-label"
                        id="demo-simple-select-autowidth"
                        autoWidth
                        >
                            <MenuItem value=""></MenuItem>
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                        <FormHelperText>Please select monitor communication Port.</FormHelperText>
                    </FormControl>
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
    }, [props]);

    const drawerHandler = (newIsOpenStatus: boolean) => (event: React.KeyboardEvent | React.MouseEvent) =>{
        const newDrawer: IDrawer = {isOpen: newIsOpenStatus}
        setDrawer(newDrawer);
    }

    return (
        <Drawer anchor="top" open={drawer.isOpen} onClose={drawerHandler(false)}>
            <div className={classes.drawerContainer}>
                <Typography variant="h4">{drawer.title}</Typography>
                <Divider />
                {drawer.form}
            </div>
        </Drawer>
    )
}
