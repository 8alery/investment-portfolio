import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';

import Header from './Header';
import Home from './Home';
import Bonds from '../containers/Bonds';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Route exact path="/" component={Home} />
        <Route path="/bonds" component={Bonds} />
      </div>
    </Router>
  );
}

export default App;
