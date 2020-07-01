import React, {ReactElement}from 'react';
import { MuiThemeProvider, CssBaseline, createMuiTheme, colors, Theme} from '@material-ui/core';
import {AppConfigurationContext, useAppConfigurationContext} from './store/AppConfigurationContext';
import AppMenu from './components/AppMenu';
import Dashboard from './components/Dashboard';
interface serverInfo{
  isFirstTime: boolean;
  ports: Array<any>;
}
interface Props {

}

export let pageTheme: Theme = createMuiTheme({
  palette: {
    primary: colors.lightBlue,
    secondary: colors.yellow,
    type: 'dark'
  },
});

pageTheme.typography.body2 = {
  fontFamily: 'Arial',
  fontSize: '.9rem', 
  [pageTheme.breakpoints.down('xs')]: {
    fontSize: '.5rem',
  },
  [pageTheme.breakpoints.up('sm')]: {
    fontSize: '.9rem'
  },
}
pageTheme.typography.h6 = {
  [pageTheme.breakpoints.down('xs')]: {
    fontSize: '.68rem'
  },
  [pageTheme.breakpoints.up('sm')]: {
    fontSize: '1.25rem'
  }
}
pageTheme.typography.h5 = {
  fontSize: '3rem',
  [pageTheme.breakpoints.down('xs')]: {
    fontSize: '1rem',
  },
  [pageTheme.breakpoints.up('sm')]: {
    fontSize: '1.5rem'
  },
  [pageTheme.breakpoints.up('md')]: {
    fontSize: '2rem'
  }
}
pageTheme.typography.subtitle2 = {
  fontFamily: 'Arial',
  fontSize: '1rem', 
  [pageTheme.breakpoints.down('xs')]: {
    fontSize: '.5rem',
  },
  [pageTheme.breakpoints.up('sm')]: {
    fontSize: '.9rem'
  },
}

export default function App (props: Props): ReactElement {

    const appConfigContext = useAppConfigurationContext();

    return (
      <MuiThemeProvider theme={pageTheme}>
        <AppConfigurationContext.Provider value={appConfigContext}>
          <CssBaseline />
          <Dashboard></Dashboard>
          <AppMenu></AppMenu>
        </AppConfigurationContext.Provider>
      </MuiThemeProvider>
    )
}
