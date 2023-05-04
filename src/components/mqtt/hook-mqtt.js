import { useEffect, useState } from "react";
import mqtt from "mqtt";
import { url, options } from "../../config/mqtt_config";

const useMqtt = () => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (client) {
      // _initEventHandler();
    } else {
      options.clientId = `mqtt-frontend-${Math.random().toString(16).substring(2, 8)}`;
      setClient(mqtt.connect(url, options));
      console.log("new MQTT client created");
    }

    return () => {
      if (client) {
        client.end();
        console.log("Disconnect with MQTT");
      }
    };
  }, [client]);

  return client;
};

const _initEventHandler = () => {
  client.on("connect", () => console.log("MQTT connected"));
  client.on("reconnect", () => console.log("MQTT reconnected"));
  client.on("error", (err) => console.log(`MQTT ERROR: ${err}`));
};

export default useMqtt;
