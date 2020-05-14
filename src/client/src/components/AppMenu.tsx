import React, { ReactElement } from 'react'
import { AppBar, Toolbar, makeStyles, Theme, createStyles } from '@material-ui/core'

interface Props {}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            top: 'auto',
            bottom: 0,
        }
    })
);

export default function AppMenu({ }: Props): ReactElement {
    const classes = useStyles();
    return (
        <AppBar position="fixed" color="primary" className={classes.appBar}>
            <Toolbar>

            </Toolbar>
        </AppBar>
    )
}
