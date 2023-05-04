import InputItem from "./input-item";
import { Divider } from "@mui/material";

const InputItems = ({ ioState, handleChange }) => {
  return Object.keys(ioState).map((key, index) => (
    <>
      {index > 0 && <Divider />}
      <InputItem
        key={key}
        id={key}
        label={ioState[key].name}
        value={ioState[key].value}
        handleChange={handleChange}
        writable={ioState[key].writable}
      />
    </>
  ));
};

export default InputItems;
