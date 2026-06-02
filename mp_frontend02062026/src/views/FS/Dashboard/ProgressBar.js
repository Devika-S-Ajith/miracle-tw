import React from "react";
import "./ProgressBar.css";
import BodyText from "../../../components/BodyText/BodyText";

const ProgressBar = ({ percentage, label }) => {
  return (
    <div className="progress-bar">
      <div
        className={percentage ? "progress" : "emptyProgress"}
        style={{ width: `${percentage}%` }}
      />
      <div className="progress-label-container">
        {/* <Typography
          variant="body2"
          fontWeight="bold"
          className="progress-label-left"
        >
          {label}
        </Typography> */}
        <BodyText value={label} fontWeight={600} />
        {percentage ? (
          //   <Typography
          //     variant="body2"
          //     fontWeight="bold"
          //     className="progress-label-right"
          //   >
          //     {Math.round(percentage)}%
          //   </Typography>

          <BodyText value={`${Math.round(percentage)}%`} fontWeight={600} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
