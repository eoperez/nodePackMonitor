import React from 'react';
import { MuiThemeProvider, CssBaseline, createMuiTheme, colors, Theme, ThemeProvider, responsiveFontSizes } from '@material-ui/core';
import AppMenu from './components/AppMenu';
import Dashboard from './components/Dashboard';

let pageThem: Theme = createMuiTheme({
  palette: {
    primary: colors.lightBlue,
    secondary: colors.yellow,
    type: 'dark'
  },
});

pageThem.typography.body2 = {
  fontFamily: 'Arial',
  fontSize: '.9rem', 
  [pageThem.breakpoints.down('xs')]: {
    fontSize: '.5rem',
  },
  [pageThem.breakpoints.up('sm')]: {
    fontSize: '.9rem'
  }
}
export default class App extends React.Component {
  render() {
    return <MuiThemeProvider theme={pageThem}>
    <CssBaseline />
    <Dashboard></Dashboard>
    <AppMenu></AppMenu>
  </MuiThemeProvider>
  }
}
