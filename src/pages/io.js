import { Card, Divider, List, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import Head from "next/head";
import { DashboardLayout } from "../components/dashboard-layout";
import { useCallback, useEffect, useRef, useState } from "react";
import { storeAction } from "../redux/state-slice";
import { useDispatch, useSelector } from "react-redux";
import { isInteger } from "formik";
import InputItems from "../components/setting-items";
import InputItem from "../components/input-item";

const Page = () => {
  const [ioState, setIOState] = useState({});
  const [_event, setEvent] = useState({ target: {} });

  useEffect(() => console.log("io page remounted"), []);
  console.log("io page rerendered");

  const { subscribeMQTT, unsubscribeMQTT, publishMQTT } = storeAction;
  const dispatch = useDispatch();

  const subscribe = (topic) => {
    dispatch(subscribeMQTT(topic));
  };

  const unsubscribe = (topic) => {
    dispatch(unsubscribeMQTT(topic));
  };

  const publish = (payload) => {
    dispatch(publishMQTT(payload));
  };

  const mqttState = useSelector((state) => state.state);

  const subscribeTopic = "io/response";
  const publishTopic = "io/request";
  const getIOContents = { [publishTopic]: { type: "io", cmd: "read" } };
  useEffect(() => {
    switch (mqttState) {
      case "connected":
        subscribe(subscribeTopic);
        publishRequests(getIOContents);
        break;
      case "error":
        break;
    }
  }, [mqttState]);

  const setTimeoutID = useRef();
  const publishRequests = (payload) => {
    publish(payload);
    setTimeoutID.current = setTimeout(() => publishRequests(getIOContents), 5000);
  };

  const mqttMessage = useSelector((state) => state.message);

  useEffect(() => {
    if (mqttMessage[subscribeTopic]) {
      clearTimeout(setTimeoutID.current);

      if (subscribeTopic in mqttMessage) {
        const msg = mqttMessage[subscribeTopic].payload;
        const _ioState = { ...ioState, ...msg };
        setIOState(_ioState);
      }
    }
  }, [mqttMessage]);

  const setTimeoutID_handleChange = useRef();
  useEffect(() => {
    clearTimeout(setTimeoutID_handleChange.current);
    const target = _event.target;
    const { name, type, value } = target;
    const changedState = Object.assign({}, ioState[name]);

    if (type === "number") {
      if (!isNaN(value)) {
        changedState.value = isInteger(value) ? parseInt(value) : parseFloat(value);
      }
    } else if (type === "checkbox") {
      changedState.value = !changedState.value;
    } else changedState.value = value;

    if (name) {
      setIOState((prevState) => {
        return { ...prevState, [name]: changedState };
      });
      setTimeoutID_handleChange.current = setTimeout(() => {
        const publishIOStateMsg = {
          [publishTopic]: { type: "io", cmd: "write", payload: { [name]: changedState } },
        };
        publish(publishIOStateMsg);
      }, 500);
    }
  }, [_event]);

  return (
    <>
      <Head>
        <title>I/O | VTNF</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography sx={{ mb: 3 }} variant="h4">
            I/O Monitor
          </Typography>
          <Card>
            <List>
              <InputItems ioState={ioState} handleChange={setEvent} />
            </List>
          </Card>
        </Container>
      </Box>
    </>
  );
};
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
