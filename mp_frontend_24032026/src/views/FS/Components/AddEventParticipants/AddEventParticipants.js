import {
  Box,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

const AddEventParticipants = ({ close }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleToggle = (item) => () => {
    if (isSelected(item)) {
      setSelectedItems((prev) =>
        prev.filter((selectedItem) => selectedItem.id !== item.id)
      );
    } else {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const isSelected = (item) => {
    return selectedItems.some((selectedItem) => selectedItem.id === item.id);
  };

  const items = [
    { id: 1, label: "Item 1" },
    { id: 2, label: "Item 2" },
    { id: 3, label: "Item 3" },
    // Add more items as needed
  ];
  console.log(selectedItems);
  return (
    <Box mx={-2}>
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{
          overflowY: "auto", // 'auto' will add a scrollbar when needed
          maxHeight: "70vh", // Set a maximum height to limit the scrollable area
        }}
        p={2}
      >
        <TextField
          id="venue"
          fullWidth
          label={"Search Families to Invite"}
          name="venue"
          // onChange={handleChange}
          // value={values?.venue}
          variant="outlined"
        />
        <Box
          border={1}
          borderColor="#0000003b"
          borderRadius={1}
          minHeight={250}
        >
          <Box m={1}>
            <Box
              sx={{
                overflowY: "auto", // 'auto' will add a scrollbar when needed
                maxHeight: 250, // Set a maximum height to limit the scrollable area
              }}
            >
              <List>
                {items.map((item) => (
                  <ListItem
                    id={item.id}
                    key={item.id}
                    dense
                    onClick={handleToggle(item)}
                  >
                    <Checkbox
                      id={item.id}
                      edge="start"
                      checked={isSelected(item)}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography
            color="textPrimary"
            // variant="subtitle2"
            fontWeight={700}
            fontSize="1rem"
          >
            Selected Participants
          </Typography>
          <Typography
            color="textPrimary"
            // variant="subtitle2"
            fontWeight={700}
            fontSize="1rem"
          >
            {selectedItems.length} Families
          </Typography>
        </Box>
        <Box
          border={1}
          borderColor="#0000003b"
          borderRadius={1}
          minHeight={200}
          sx={{ overflowY: "auto" }}
        >
          <Box m={1}>
            <Box
              sx={{
                overflowY: "auto", // 'auto' will add a scrollbar when needed
                maxHeight: 200, // Set a maximum height to limit the scrollable area
              }}
            >
              <List>
                {selectedItems.map((item) => (
                  <ListItem
                    id={item.id}
                    key={item.id}
                    dense
                    onClick={handleToggle(item)}
                  >
                    <Checkbox
                      id={item.id}
                      edge="start"
                      checked={isSelected(item)}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography
            color="textPrimary"
            // variant="subtitle2"
            fontWeight={700}
            fontSize="1rem"
          >
            Invited
          </Typography>
          <Typography
            color="textPrimary"
            // variant="subtitle2"
            fontWeight={700}
            fontSize="1rem"
          >
            0 Families
          </Typography>
        </Box>
      </Box>
      <Box mt sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
        <Button
          id="cancel-button"
          sx={{ borderRadius: "4px" }}
          variant="outlined"
          onClick={close}
        >
          Cancel
        </Button>
        <Button
          id="submit-button"
          sx={{ borderRadius: "4px" }}
          variant="contained"
          //   onClick={handleSubmit}
        >
          Add Participants
        </Button>
      </Box>
    </Box>
  );
};

export default AddEventParticipants;
