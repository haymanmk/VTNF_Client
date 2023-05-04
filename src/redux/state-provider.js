import { useState, useEffect } from "react";
import mqtt from "mqtt";
import { url, options } from "../config/mqtt_config";
import store from "./store";
import { Provider } from "react-redux";

export const ReduxProvider = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
