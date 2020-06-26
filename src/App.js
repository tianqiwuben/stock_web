import React from 'react';
import Dashboard from './components/dashboard/Dashboard';
import store from './redux/store';
import {Provider} from 'react-redux';
import { SnackbarProvider } from 'notistack';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import './App.css';

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <SnackbarProvider>
          <Router>
            <Dashboard />
          </Router>
        </SnackbarProvider>
      </Provider>
    </div>
  );
}

export default App;
