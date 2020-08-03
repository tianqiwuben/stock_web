import React from 'react';
import Dashboard from './components/dashboard/Dashboard';
import store from './redux/store';
import {Provider} from 'react-redux';
import { SnackbarProvider } from 'notistack';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";

import {
  createMuiTheme
} from "@material-ui/core";

import './App.css';

const theme = createMuiTheme({
  palette: {
    type: "dark"
  }
});

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <Router>
                <Dashboard />
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </Provider>
    </div>
  );
}

export default App;
