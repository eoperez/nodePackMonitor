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

let pageTheme: Theme = createMuiTheme({
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
