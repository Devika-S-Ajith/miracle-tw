import React from "react";
import LineGraph from "../../../components/LineChart/LineChart";
import CommonCard from "../../../components/CommonCard";

function InCrisisAndVulnerableMilestones() {
  const data = [
    {
      assessment: "A1",
      category1: 0.15,
      category2: 0.25,
      category3: 0.18,
      category4: 0.32,
    },
    {
      assessment: "A2",
      category1: 0.16,
      category2: 0.28,
      category3: 0.19,
      category4: 0.38,
    },
    {
      assessment: "A3",
      category1: 0.17,
      category2: 0.3,
      category3: 0.2,
      category4: 0.4,
    },
  ];

  // Dynamic categories with colors and line types
  const categories = [
    {
      key: "category1",
      color: "#c41e3a",
      lineType: "solid",
      label: "In crisis red flag milestone",
    },
    {
      key: "category2",
      color: "#ff8c00",
      lineType: "solid",
      label: "Vulnerable red flag milestone",
    },
    {
      key: "category3",
      color: "#c41e3a",
      lineType: "dotted",
      label: "In crisis milestone",
    },
    {
      key: "category4",
      color: "#ff8c00",
      lineType: "dotted",
      label: "Vulnerable milestone milestone",
    },
  ];

  const hoverComponent = ({ payload }) => {
    console.log("Hover payload:", payload);
    return (
      <div style={{ padding: "10px", backgroundColor: "#fff", borderRadius: "4px" }}>
        {payload.map((item, index) => (
          <div key={index} style={{ color: item.color }}>
            <strong>{categories.find(cat => cat.key === item.name)?.label}:</strong> {item.value.toFixed(2)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <CommonCard title="In crisis and Vulnerable milestones for all families, by assessment">
      <LineGraph
        data={data}
        categories={categories}
        lineType="linear"
        height={200}
        hoverComponent={hoverComponent}
      />
    </CommonCard>
  );
}

export default InCrisisAndVulnerableMilestones;
