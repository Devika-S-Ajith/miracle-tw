import { Box, Typography } from "@mui/material";
import React from "react";
import ChipComponent from "../../../../components/ChipComponent";
import { useNavigate } from "react-router";

const ChildrenList = ({ children }) => {
  const navigate = useNavigate();
  return (
    <>
      <Typography
        color="textPrimary"
        // variant="subtitle2"
        fontWeight={700}
        fontSize="0.75rem"
        mb
      >
        Children
      </Typography>
      <Box
        sx={{ display: "flex", flexDirection: "row", gap: 1, flexWrap: "wrap" }}
      >
        {children?.length > 0 ? (
          children.map((child, index) => (
            <ChipComponent
              key={index}
              label={`${child?.firstName} ${child?.lastName}`}
              onClick={() => navigate(`/fostershare/children/${child.id}`)}
            />
          ))
        ) : (
          <Typography color="textPrimary" fontWeight={600}>
            No children
          </Typography>
        )}
      </Box>
    </>
  );
};

export default ChildrenList;
