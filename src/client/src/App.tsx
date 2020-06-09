import React from 'react';
import { MuiThemeProvider, CssBaseline, createMuiTheme, colors, Theme, ThemeProvider, responsiveFontSizes } from '@material-ui/core';
import AppMenu from './components/AppMenu';
import Dashboard from './components/Dashboard';

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
export default class App extends React.Component {
  render() {
    return <MuiThemeProvider theme={pageTheme}>
    <CssBaseline />
    <Dashboard></Dashboard>
    <AppMenu></AppMenu>
  </MuiThemeProvider>
  }
}
