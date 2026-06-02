import { Skeleton } from "@mui/material";
import React from "react";

const ThriveScaleSummarySkelton = () => {
  const rings = [1, 2, 3, 4, 5];
  const axes = [-90, -18, 54, 126, 198];
  const pentagonShape =
    "polygon(50% 0%, 97.55% 34.55%, 79.39% 90.45%, 20.61% 90.45%, 2.45% 34.55%)";

  return (
    <>
    <Skeleton
        variant="rectangular"
        width={200}
        height={30}
        sx={{ borderRadius: 1, mx: "auto" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 320,
          width: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 260,
            height: 260,
          }}
        >
          {rings.map((ring) => (
            <div
              key={`ring-${ring}`}
              style={{
                position: "absolute",
                top: `0%`,
                left: `0%`,
                width: `100%`,
                height: `100%`,
                boxSizing: "border-box",
                border: "1px solid #e5e7eb",
                background: ring % 2 === 0 ? "#f9fafb" : "transparent",
                clipPath: pentagonShape,
                animation: "pulse 1.6s ease-in-out infinite",
              }}
            />
          ))}

          {axes.map((angle) => (
            <div
              key={`axis-${angle}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "calc(50% - 1px)",
                height: 1,
                background: "#d1d5db",
                transformOrigin: "0% 50%",
                transform: `rotate(${angle}deg)`,
                animation: "pulse 1.6s ease-in-out infinite",
              }}
            />
          ))}

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 12,
              height: 12,
              marginTop: -6,
              marginLeft: -6,
              borderRadius: "50%",
              background: "#d1d5db",
              animation: "pulse 1.6s ease-in-out infinite",
            }}
          />
        </div>

        <style>
          {`@keyframes pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }`}
        </style>
      </div>
    </>
  );
};

export default ThriveScaleSummarySkelton;
