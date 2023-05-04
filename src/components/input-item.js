import { Grid, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { LabeledAntSwitch } from "./ant-switch";
import { GreyTextField } from "./grey-text-field";
import { memo, useCallback, useEffect, useMemo } from "react";

const InputItem = ({ id, label, value, handleChange, writable, description }) => {
  function handleChecked({ handleChange, id }) {
    return handleChange({
      target: { type: "checkbox", name: id },
    });
  }

  const Props = useMemo(() => {
    console.log(`${id} changed`);
    return { id, label, value, handleChange, writable, description };
  }, [id, label, value, writable, description, handleChange]);

  switch (typeof Props.value) {
    case "number":
      return (
        <ListItem
          secondaryAction={
            <GreyTextField
              variant="outlined"
              size="small"
              name={Props.id}
              type="number"
              onChange={Props.handleChange}
              value={value}
              writable={Props.writable}
            />
          }
        >
          {Props.description ? (
            <ListItemText primary={Props.label} secondary={Props.description} />
          ) : (
            <ListItemText primary={Props.label} />
          )}
        </ListItem>
      );
    case "string":
      return (
        <ListItem
          secondaryAction={
            <GreyTextField
              variant="outlined"
              size="small"
              name={Props.id}
              type="string"
              onChange={Props.handleChange}
              value={value}
              writable={Props.writable}
            />
          }
        >
          {Props.description ? (
            <ListItemText primary={Props.label} secondary={Props.description} />
          ) : (
            <ListItemText primary={Props.label} />
          )}
        </ListItem>
      );
    case "boolean":
      return (
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleChecked(Props)}
            name={Props.id}
            disabled={!Props.writable}
          >
            <Grid container justifyContent={"space-between"} alignItems={"center"}>
              <Grid item>
                {Props.description ? (
                  <ListItemText primary={Props.label} secondary={Props.description} />
                ) : (
                  <ListItemText primary={Props.label} />
                )}
              </Grid>
              <Grid item>
                <LabeledAntSwitch checked={value} />
              </Grid>
            </Grid>
          </ListItemButton>
        </ListItem>
      );
    default:
      console.log("Unsupported type: ", value);
  }

  return <></>;
};

export default memo(InputItem);
