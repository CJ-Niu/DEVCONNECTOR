import React, { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import './App.css';

const App = () => (
  <Router>
    <Fragment>
      <Navbar />
      <Routes>
        <Route exact path='/' component={Landing} />
      </Routes>
      <section className='container'>
        <Switch>
          <Route exact path='/register' component = {Register} />
          <Route exact path='/login' component = {Login} />
        </Switch>
      </section>
    </Fragment>
  </Router>
);

export default App;
