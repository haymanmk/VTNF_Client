import { useEffect } from "react";
import { storeAction } from "../../redux/state-slice";
import { useDispatch, useSelector } from "react-redux";

export const MQTTConnection = () => {
  const dispatch = useDispatch();
  const { connectMQTT, disconnectMQTT, updateState, updateMessage } = storeAction;
  const client = useSelector((state) => state.client);

  useEffect(() => {
    if (!client) {
      dispatch(connectMQTT());
    }

    if (client) _initEventHandler(client);

    return () => {
      if (client) {
        client.end();
        dispatch(disconnectMQTT());
      }
      console.log("Cleanup MQTT");
    };
  }, [client]);

  const _initEventHandler = (_client) => {
    if (_client) {
      _client.on("connect", connectHandler);
      _client.on("error", errorHandler);
      _client.on("message", messageHandler);
    }
  };

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

  return <></>;
};
