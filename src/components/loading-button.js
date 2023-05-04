import { CircularProgress } from "@mui/material";
import { Button } from "@mui/material";
import { Children } from "react";

export const LoadingButton = (props) => {
  return (
    <Button
      component="a"
      startIcon={<CircularProgress size={20} sx={{ color: "neutral.400" }} />}
      sx={{ display: "flex", px: 3, color: "neutral.400", justifyContent: "flex-start" }}
    >
      {props.children}
    </Button>
  );
};
