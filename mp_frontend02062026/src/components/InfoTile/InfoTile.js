import { Box, Card, CardContent } from "@mui/material";
import React from "react";
import Heading from "../Heading/Heading";
import BodyText from "../BodyText/BodyText";

const InfoTile = ({ icon, title, subTitle, description, bgcolor, height }) => {
  return (
    <Card
      sx={{
        justifyContent: "center",
        height: height || "none",
        textAlign: "center",
        borderRadius: 2,
        transition: "box-shadow 0.3s, transform 0.3s",
        boxShadow: 1,
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-4px) scale(1.03)",
        },
      }}
    >
      <CardContent sx={{ backgroundColor: bgcolor, py: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Heading heading={title} fontSize={"1.25rem"} />
            {icon}
          </Box>
          {subTitle && (
            <BodyText value={subTitle} sx={{ wordBreak: "break-word" }} />
          )}
        </Box>
      </CardContent>
      <CardContent sx={{ p: 2 }}>
        <BodyText value={description} sx={{ wordBreak: "break-word" }} />
      </CardContent>
    </Card>
  );
};

export default InfoTile;
