import axios from 'axios';

const setAuthToken = (token) => {
  // if there is an token in local storge
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token; // set global header
  } else {
    delete axios.defaults.headers.common['x-auth-token']; // not token, delete from global header
  }
};

export default setAuthToken;
