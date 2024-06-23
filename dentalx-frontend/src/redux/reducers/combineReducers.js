import { combineReducers } from "redux";
import loggedReducer from './authenticationReducer';

const allReducers = combineReducers({
    userDetails: loggedReducer
});

export default allReducers;