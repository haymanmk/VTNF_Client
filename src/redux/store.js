import { configureStore } from "@reduxjs/toolkit";
import MQTTClientReducer from "./state-slice";

const store = configureStore({ reducer: MQTTClientReducer });

export default store;
