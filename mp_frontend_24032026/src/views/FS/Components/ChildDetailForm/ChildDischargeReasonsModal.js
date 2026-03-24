import React, { useEffect, useState } from "react";
import {
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Box,
  TextField,
} from "@mui/material";
import APIS from "../../../../common/hooks/UseApiCalls";

const ChildDischargeReasonsModal = ({ close, onSuccess }) => {
  const [selectedKeys, setSelectedKeys] = useState([]);

  const handleCheckboxChange = (key) => {
    if (key === "OTHER") {
      setOtherText(null); // Clear text when unchecking "Other"
    }

    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter((item) => item !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  const handleSubmit = () => {
    onSuccess(selectedKeys, otherText);
    close();
  };

  const handleCancel = () => {
    setSelectedKeys([]);
    close();
  };

  const [otherText, setOtherText] = useState(null);

  const handleOtherTextChange = (event) => {
    setOtherText(event.target.value);
  };

  const [dischargeReasons, setDischargeReasons] = useState([]);
  useEffect(() => {
    const getDischargeReasonsList = async () => {
      try {
        const res = await APIS.getFsChildDischargeReasonsList();

        if (res.status === 200) {
          setDischargeReasons(res.data.data);
        }
      } catch (error) {}
    };
    getDischargeReasonsList();
  }, []);

  return (
    <Box my mx={-2}>
      <Box
        sx={{
          overflowY: "auto", // 'auto' will add a scrollbar when needed
          maxHeight: "70vh", // Set a maximum height to limit the scrollable area
        }}
        p={2}
      >
        <FormGroup>
          {dischargeReasons.map((item) => (
            <FormControlLabel
              key={item.key}
              control={
                <Checkbox
                  checked={selectedKeys.includes(item.key)}
                  onChange={() => handleCheckboxChange(item.key)}
                />
              }
              label={item.value}
            />
          ))}
        </FormGroup>
        {selectedKeys.includes("OTHER") && (
          <TextField
            label="Other Reason"
            variant="outlined"
            fullWidth
            required
            value={otherText}
            onChange={handleOtherTextChange}
            sx={{ mt: 2 }}
            multiline
            rows={3}
          />
        )}
      </Box>
      <Box mt={2} display="flex" justifyContent="end" gap={2}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{ marginLeft: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            selectedKeys.length === 0 ||
            (selectedKeys.includes("OTHER") &&
              otherText &&
              otherText?.trim() === "")
          }
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default ChildDischargeReasonsModal;
