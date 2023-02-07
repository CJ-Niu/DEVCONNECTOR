import { GET_PROFILE, PROFILE_ERROR } from '../actions/types';

const initialState = {
  profile: null, // hold ourself's profile data
  profiles: [], // for profile listing page (list of developers)
  repos: [],
  loading: true,
  error: {},
};

export default function (state = initialState, action) {
  // destructor the action
  const { type, payload } = action;

  switch (type) {
    case GET_PROFILE:
      return {
        ...state,
        profile: payload,
        loading: false,
      };
    case PROFILE_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    default:
      return state;
  }
}
