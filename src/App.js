import React from 'react';
import Dashboard from './components/dashboard/Dashboard';
import store from './redux/store';
import {Provider} from 'react-redux';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import './App.css';

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Router>
          <Dashboard />
        </Router>
      </Provider>
    </div>
  );
}

export default App;
