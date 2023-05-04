import styled from "@emotion/styled";
import { TextField } from "@mui/material";

export const GreyTextField = (props) => (
  <TextField
    {...props}
    disabled={!props.writable}
    sx={{
      "& .MuiOutlinedInput-root": {
        background: "rgb(0,0,0,0.1)",
        "& input": {
          textAlign: "right",
        },
      },
    }}
  />
);
