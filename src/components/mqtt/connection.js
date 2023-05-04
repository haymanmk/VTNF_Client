import { useEffect } from "react";
import mqtt from "mqtt";
import store from "../../redux/store";
import { storeAction } from "../../redux/state-slice";
import { url, options } from "../../config/mqtt_config";
import { useDispatch, useSelector } from "react-redux";

export const MQTTConnection = () => {
  const dispatch = useDispatch();
  const {
    connectMQTT,
    disconnectMQTT,
    updateState,
    updateMessage,
    subscribeMQTT,
    unsubscribeMQTT,
    publishMQTT,
  } = storeAction;
  const client = useSelector((state) => state.client);

  useEffect(() => {
    if (!client) {
      options.clientId = `mqtt-frontend-${Math.random().toString(16).substring(2, 8)}`;
      let _url = `ws://${location.hostname}:8083`;
      const newClient = mqtt.connect(_url, options);
      dispatch(connectMQTT(newClient));
    }
    _initEventHandler(client);

    return () => {
      if (client) {
        client.end();
        dispatch(disconnectMQTT());
      }
      console.log("Cleanup MQTT");
    };
  }, [client]);

  // const subscribe = useSelector((state) => state.subscribe);

  // useEffect(() => {
  //   if (!client) return;

  //   if (subscribe) {
  //     client.subscribe(subscribe, { qos: 0 }, (err, granted) => {
  //       if (err) {
  //         console.log("MQTT subscribe prone to error: ", err);
  //       } else {
  //         console.log(`MQTT topic "${subscribe}" subscribed.`);
  //       }
  //     });
  //     dispatch(subscribeMQTT(null));
  //   }
  // }, [subscribe]);

  const unsubscribe = useSelector((state) => state.unsubscribe);

  useEffect(() => {
    if (!client) return;

    if (unsubscribe) {
      client.unsubscribe(unsubscribe, (err) => {
        if (err) {
          console.log("MQTT unsubscribe failed: ", err);
        }
      });
      dispatch(unsubscribeMQTT(null));
    }
  }, [unsubscribe]);

  const publish = useSelector((state) => state.publish);

  useEffect(() => {
    if (!client) return;

    if (publish) {
      Object.keys(publish).map((key) => {
        const topic = key;
        const msg = publish[key];
        client.publish(topic, JSON.stringify(msg), { qos: 0 }, (err) => {
          if (err) {
            console.log(`MQTT publish to topic "${topic}" prone to error: ${err}`);
          } else {
            console.log("MQTT succeeds publishing to topic: ", topic);
          }
        });
        dispatch(publishMQTT(null));
      });
    } else console.log("Received publish payload with unsupported type.");
  }, [publish]);

  const connectHandler = () => {
    console.log("MQTT connected");
    dispatch(updateState("connected"));
  };

  const errorHandler = (err) => {
    console.log("MQTT error occurred: ", err);
    dispatch(updateState("error"));
  };

  const messageHandler = (topic, message) => {
    const msgObject = JSON.parse(message);
    console.log(`MQTT msg received from "${topic}" with msg:`);
    console.log(msgObject);

    dispatch(updateMessage({ [topic]: msgObject }));
  };

  const _initEventHandler = (_client) => {
    if (_client) {
      _client.on("connect", connectHandler);
      _client.on("error", errorHandler);
      _client.on("message", messageHandler);
    }
  };

  return <></>;
};
