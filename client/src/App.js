import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import Dashboard from './components/dashboard/Dashboard';
import CreateProfile from './components/profile-forms/CreateProfile';
import EditProfile from './components/profile-forms/EditProfile';
import PrivateRoute from './components/routing/PrivateRoute';

// Redux
import store from './store';
import { Provider } from 'react-redux';
import { loadUser } from './actions/auth';
import setAuthToken from './untils/setAuthToken';

import './App.css';

if (localStorage.token) {
  setAuthToken(localStorage.token); // set header with token, if token exist
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Alert />
        <Routes>
          <Route exact path='/' element={<Landing />} />
          <Route exact path='/register' element={<Register />} />
          <Route exact path='/login' element={<Login />} />
          <Route
            exact
            path='/dashboard'
            element={<PrivateRoute component={Dashboard} />}
          />
          <Route
            exact
            path='/create-profile'
            element={<PrivateRoute component={CreateProfile} />}
          />
          <Route
            exact
            path='/edit-profile'
            element={<PrivateRoute component={EditProfile} />}
          />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
