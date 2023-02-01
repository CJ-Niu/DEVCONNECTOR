import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_ALERT:
      // Case 1. adding an alert
      // return array with payload && new alert
      return [...state, payload];
    case REMOVE_ALERT:
      // Case 2. remove specific alert by its ID
      // return all alerts except the one that match the payload
      return state.filter((alert) => alert.id !== payload);
    default:
      // Case 3. default
      return state;
  }
}
