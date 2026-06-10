import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Tooltip } from "@mui/material";

const PageBreadcrumbs = ({ data }) => {
  const breadcrumbs = data.map((item, index) => {
    if (item.onClick) {
      return (
        <Link
          underline="none"
          key={index}
          color="text.primary"
          variant="h5"
          onClick={item.onClick}
          sx={{ cursor: "pointer" }}
        >
          {item.label}
        </Link>
      );
    } else {
      return (
        <Tooltip
          key={index}
          title={item?.label?.length > 30 ? item.label : ""}
          placement="bottom-start"
          arrow
        >
          <Typography
            key={index}
            variant="h5"
            sx={{
              color: "text.primary",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: {
              xs: 180, // small screens
              sm: 300, // medium screens
              md: 500, // large screens
              lg: 500, // extra large screens
            },
          }}
          title={item?.label?.length > 30 ? item.label : undefined}
        >
          {item.label}
        </Typography>
      </Tooltip>
    )  
  }})

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ my: 1 }}
    >
      {breadcrumbs}
    </Breadcrumbs>
  );
};
export default PageBreadcrumbs;
