/**
 * MQTT Configuration
 */

const hostName = "localhost";
const port = 8083;
const url = `ws://${hostName}:${port}`;
const clientID = `mqtt-frontend-${Math.random().toString(16).substring(2, 8)}`;
const options = {
  clientId: clientID,
  username: "iot",
  password: "1qazZAQ!",
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  will: {
    topic: "WillMsg",
    payload: "Frontend connection closed abnormally!",
    qos: 0,
    retain: false,
  },
};

export { url, options };
