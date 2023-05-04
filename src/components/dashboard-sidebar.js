import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { Box, Button, Divider, Drawer, Typography, useMediaQuery } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { ChartBar as ChartBarIcon } from "../icons/chart-bar";
import { Cog as CogIcon } from "../icons/cog";
import { Lock as LockIcon } from "../icons/lock";
import { Selector as SelectorIcon } from "../icons/selector";
import { ShoppingBag as ShoppingBagIcon } from "../icons/shopping-bag";
import { User as UserIcon } from "../icons/user";
import { UserAdd as UserAddIcon } from "../icons/user-add";
import { Users as UsersIcon } from "../icons/users";
import { XCircle as XCircleIcon } from "../icons/x-circle";
import { Logo } from "./garmin_logo";
import { NavItem } from "./nav-item";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import SettingsInputComponentRoundedIcon from "@mui/icons-material/SettingsInputComponentRounded";
import useMqtt from "./mqtt/hook-mqtt";
import { LoadingButton } from "../components/loading-button";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import { useDispatch, useSelector } from "react-redux";
import { storeAction } from "../redux/state-slice";

const items = [
  {
    href: "/",
    icon: <ChartBarIcon fontSize="small" />,
    title: "Dashboard",
  },
  // {
  //   href: "/customers",
  //   icon: <UsersIcon fontSize="small" />,
  //   title: "Customers",
  // },
  // {
  //   href: "/products",
  //   icon: <ShoppingBagIcon fontSize="small" />,
  //   title: "Products",
  // },
  {
    href: "/account",
    icon: <UserIcon fontSize="small" />,
    title: "Account",
  },
  {
    href: "/settings",
    icon: <CogIcon fontSize="small" />,
    title: "Settings",
  },
  {
    href: "/login",
    icon: <LockIcon fontSize="small" />,
    title: "Login",
  },
  {
    href: "/register",
    icon: <UserAddIcon fontSize="small" />,
    title: "Register",
  },
  {
    href: "/404",
    icon: <XCircleIcon fontSize="small" />,
    title: "Error",
  },
  { href: "/engineer_mode", icon: <EngineeringRoundedIcon />, title: "Engineer" },
  { href: "/io", icon: <SettingsInputComponentRoundedIcon />, title: "I/O" },
];

export const DashboardSidebar = (props) => {
  const { open, onClose } = props;
  const router = useRouter();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"), {
    defaultMatches: true,
    noSsr: false,
  });

  const [_items, setItems] = useState(items);
  const [connState, setMQTTState] = useState("connect");

  // const mqttClient = useMqtt();

  const connectHandler = () => {
    console.log("MQTT connected");
    // setMQTTState("connected");

    mqttClient.subscribe("contents/POST", { qos: 0 }, (err, granted) => {
      if (err) console.log(`MQTT subscribe topic: "${granted.topic}" prone to error: "${err}"`);
      else console.log(`MQTT subscribe topic granted: ${granted.topic}`);
    });

    const topic = "contents/GET";
    const requestMsg = { type: "list", cmd: "get" };

    mqttPublish(topic, requestMsg);
  };

  const mqttPublish = (topic, msg) => {
    mqttClient.publish(topic, JSON.stringify(msg), { qos: 0 }, (err) => {
      if (err) console.log(`MQTT publish to topic "${topic}" prone to error: ${err}`);
      else {
        console.log(`MQTT publish message successfully: ${msg.toString()}`);
        setTimeout(() => {
          mqttPublish(topic, msg);
        }, 5000);
      }
    });
  };

  const errorHandler = (err) => {
    console.log("MQTT error", err);
  };

  const messageHandler = (topic, message) => {
    const replyMsg = JSON.parse(message);
    console.log("MQTT message received: ", replyMsg);
    console.log("payload: ", replyMsg.payload);

    setItems([
      ...items,
      ...replyMsg.payload.map((item) => ({
        href: "/io",
        icon: <ExtensionRoundedIcon />,
        title: item,
      })),
    ]);

    setMQTTState("msg received");

    // mqttClient.end();
  };

  // if (mqttClient) {
  //   mqttClient.on("connect", connectHandler);
  //   mqttClient.on("error", errorHandler);
  //   mqttClient.on("message", messageHandler);
  // }

  const { subscribeMQTT, unsubscribeMQTT, publishMQTT } = storeAction;
  const dispatch = useDispatch();
  const subscribe = (topic) => {
    dispatch(subscribeMQTT(topic));
  };
  const unsubscribe = (topic) => {
    dispatch(unsubscribeMQTT(topic));
  };
  /**
   * Publish payload to Redux store
   *
   * @param {object} payload - {topic: msg}
   */
  const publish = (payload) => {
    dispatch(publishMQTT(payload));
  };

  const mqttState = useSelector((state) => state.state);

  const subscribeTopic = "contents/POST";
  const publishPayload = { "contents/GET": { type: "list", cmd: "get" } };
  let setTimeoutID = useRef();
  useEffect(() => {
    switch (mqttState) {
      case "connected":
        subscribe(subscribeTopic);
        publishRequest();
        break;
      case "error":
        break;
      default:
        console.log(`No such MQTT state: ${mqttState}`);
    }
  }, [mqttState]);

  const publishRequest = () => {
    publish(publishPayload);
    setTimeoutID.current = setTimeout(() => publishRequest(publishPayload), 5000);
  };

  const mqttMessage = useSelector((state) => state.message);

  useEffect(() => {
    if (mqttMessage[subscribeTopic]) {
      addItems();
      clearInterval(setTimeoutID.current);
    }

    function addItems() {
      if (subscribeTopic in mqttMessage) {
        const msg = mqttMessage[subscribeTopic].payload;

        setItems([
          ...items,
          ...msg.map((item) => ({
            href: "",
            icon: <ExtensionRoundedIcon />,
            title: item,
          })),
        ]);

        setMQTTState("msg received");
      }
    }
  }, [mqttMessage]);

  useEffect(
    () => {
      if (!router.isReady) {
        return;
      }

      if (open) {
        onClose?.();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.asPath]
  );

  const content = (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div>
          <Box sx={{ p: 3 }}>
            <NextLink href="/" passHref>
              <a>
                <Logo variant="light" />
              </a>
            </NextLink>
          </Box>
          <Box sx={{ px: 2 }}>
            <Box
              sx={{
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                px: 3,
                py: "11px",
                borderRadius: 1,
              }}
            >
              <div>
                <Typography color="inherit" variant="subtitle1">
                  Garmin Ltd.
                </Typography>
                <Typography color="neutral.400" variant="body2">
                  Your tier : Premium
                </Typography>
              </div>
              <SelectorIcon
                sx={{
                  color: "neutral.500",
                  width: 14,
                  height: 14,
                }}
              />
            </Box>
          </Box>
        </div>
        <Divider
          sx={{
            borderColor: "#2D3748",
            my: 3,
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          {_items.map((item) => (
            <NavItem key={item.title} icon={item.icon} href={item.href} title={item.title} />
          ))}
          <Box
            sx={{
              px: 2,
            }}
          >
            {connState !== "msg received" && <LoadingButton>Loading...</LoadingButton>}
          </Box>
        </Box>
        <Divider sx={{ borderColor: "#2D3748" }} />
      </Box>
    </>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: "neutral.900",
            color: "#FFFFFF",
            width: 280,
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: "neutral.900",
          color: "#FFFFFF",
          width: 280,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

DashboardSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
