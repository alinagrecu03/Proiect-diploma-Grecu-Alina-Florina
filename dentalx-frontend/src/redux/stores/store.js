import { configureStore } from "@reduxjs/toolkit";
import allReducers from "../reducers/combineReducers";

export const store = configureStore({
    reducer: allReducers
  });