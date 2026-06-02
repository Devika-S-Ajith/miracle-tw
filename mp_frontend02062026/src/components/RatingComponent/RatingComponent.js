import React from "react";
import Rating from "@mui/material/Rating";

const RatingComponent = ({
  rating,
  setRating,
  color = "#F37123",
  readOnly,
  ...props
}) => {
  return (
    <Rating
      sx={{ color: color }}
      name="simple-controlled"
      value={rating}
      onChange={(event, newValue) => {
        setRating?.(newValue);
      }}
      precision={0.2}
      readOnly={readOnly}
      {...props}
    />
  );
};

export default RatingComponent;
