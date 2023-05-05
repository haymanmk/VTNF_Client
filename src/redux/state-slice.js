import { createSlice } from "@reduxjs/toolkit";
import { options } from "../config/mqtt_config";
import mqtt from "mqtt";

const MQTTClientSlice = createSlice({
  name: "mqtt_client",
  initialState: {
    client: null,
    state: "disconnected",
    subscribe: null,
    unsubscribe: null,
    publish: null,
    message: {},
  },
  reducers: {
    connectMQTT: (state) => {
      if (!state.client) {
        options.clientId = `mqtt-frontend-${Math.random().toString(16).substring(2, 8)}`;
        let _url = `ws://${location.hostname}/mqtt`;
        // let _url = `ws://${location.hostname}:8083`;
        state.client = mqtt.connect(_url, options);
        state.state = "connecting";
      }
    },
    disconnectMQTT: (state) => {
      state.client = null;
      state.state = "disconnected";
    },
    subscribeMQTT: (state, action) => {
      state.client.subscribe(action.payload, { qos: 0 }, (err, granted) => {
        if (err) {
          console.log("MQTT subscribe prone to error: ", err);
        } else {
          console.log(`MQTT topic "${action.payload}" subscribed.`);
        }
      });
    },
    unsubscribeMQTT: (state, action) => {
      if (action.payload in state) delete state[action.payload];
    },
    publishMQTT: (state, action) => {
      Object.keys(action.payload).map((key) => {
        const topic = key;
        const payload = JSON.stringify(action.payload[key]);
        state.client.publish(topic, payload, { qos: 0 }, (err) => {
          if (err) {
            console.log(`MQTT publish to topic "${topic}" prone to error: ${err}`);
          } else {
            console.log("MQTT succeeds publishing to topic: ", topic);
          }
        });
      });
    },
    updateState: (state, action) => {
      state.state = action.payload;
    },
    updateMessage: (state, action) => {
      Object.keys(action.payload).map((key) => {
        state.message[key] = action.payload[key];
      });
    },
  },
});

export const storeAction = MQTTClientSlice.actions;

export default MQTTClientSlice.reducer;
