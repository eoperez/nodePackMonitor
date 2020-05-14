import React from 'react';
import { MuiThemeProvider, CssBaseline, createMuiTheme, colors, Theme } from '@material-ui/core';
import AppMenu from './components/AppMenu';
import Dashboard from './components/Dashboard';

const pageThem: Theme = createMuiTheme({
  palette: {
    primary: colors.lightBlue,
    type: 'dark'
  }
});

export default class App extends React.Component {
  render() {
    return <MuiThemeProvider theme={pageThem}>
    <CssBaseline />
    <Dashboard></Dashboard>
    <AppMenu></AppMenu>
  </MuiThemeProvider>
  }
}
