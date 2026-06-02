import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChildOverviewList } from "./ChildOverviewList";

// Mock image mappings for moods and negative behaviors
jest.mock(
  "../../../Dashboard/Components/StateGovDashboardComponents/MoodImageMapping",
  () => ({
    __esModule: true,
    MoodImageMapping: {
      INCRISIS: "/incrisis.png",
      HAPPY: "/happy.png",
    },
  })
);
jest.mock(
  "../../../Dashboard/Components/StateGovDashboardComponents/NegativeBehaviorImageMapping",
  () => ({
    __esModule: true,
    NegativeBehaviorImageMapping: {
      AGGRESSION: "/aggression.png",
      DEPRESSION: "/depression.png",
      ANXIETY: "/anxiety.png",
      FRUSTRATED: "/frustrated.png",
      ANGER: "/anger.png",
      SADNESS: "/sadness.png",
    },
  })
);

// Track props passed to ReusableTrendTable for assertions
let lastTableProps = null;
jest.mock(
  "../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable",
  () => ({
    __esModule: true,
    default: (props) => {
      lastTableProps = props;
      return (
        <div data-testid="trend-table">
          <h1>{props.title}</h1>
          {props.tableData.map((row, i) => (
            <div key={i} data-testid="row">
              <span>{row.event}</span>
              {Object.keys(row)
                .filter((k) => k !== "event")
                .map((k) => (
                  <span key={k} data-testid="cell">
                    {row[k]}
                  </span>
                ))}
            </div>
          ))}
        </div>
      );
    },
  })
);

// Dummy translation function
const mockT = (_key, fallback) => fallback;

// Example test data
const testData = [
  {
    date: "2025-10-23",
    mood: { label: "INCRISIS" },
    negativeBehaviors: [
      { label: "AGGRESSION" },
      { label: "DEPRESSION" },
      { label: "ANXIETY" },
      { label: "FRUSTRATED" },
    ],
    missedMedications: [{ name: "Adderall" }, { name: "Allegra" }],
    activities: ["Soccer"],
    minorIncident: true,
  },
  {
    date: "2025-10-22",
    mood: { label: "HAPPY" },
    negativeBehaviors: [],
    missedMedications: [],
    activities: [],
    minorIncident: false,
  },
];

describe("ChildOverviewList", () => {
  beforeEach(() => {
    lastTableProps = null;
    jest.clearAllMocks();
  });

  it("renders the table with correct title", () => {
    render(<ChildOverviewList data={testData} t={mockT} />);
    expect(screen.getByText("Child overview (last 7 days)")).toBeInTheDocument();
    expect(lastTableProps.title).toBe("Child overview (last 7 days)");
  });

  it("renders all event rows", () => {
    render(<ChildOverviewList data={testData} t={mockT} />);
    expect(screen.getAllByTestId("row").length).toBe(5);
    expect(lastTableProps.tableData.map((row) => row.event)).toEqual([
      "Mood",
      "Negative behaviors",
      "Missed medication",
      "Activity",
      "Minor incident",
    ]);
  });

  it("renders mood icons with correct alt text", () => {
    render(<ChildOverviewList data={testData} t={mockT} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.some((img) => img.getAttribute("alt") === "INCRISIS")).toBe(true);
    expect(imgs.some((img) => img.getAttribute("alt") === "HAPPY")).toBe(true);
  });

  it("shows chip indicating additional negative behaviors when more than 3 exist", () => {
    render(<ChildOverviewList data={testData} t={mockT} />);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders missed medications showing first med and additional count", () => {
    render(<ChildOverviewList data={testData} t={mockT} />);
    expect(screen.getByText("Adderall")).toBeInTheDocument();
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("renders tick icon for activities when present", () => {
    render(<ChildOverviewList data={testData} t={mockT} />);
    const imgs = screen.getAllByRole("img");
    // Tick icon alt text is "Minor Incident" for activities
    expect(imgs.some((img) => img.getAttribute("alt") === "Minor Incident")).toBe(true);
  });

  it("renders minor incident icon when minorIncident is true", () => {
    render(<ChildOverviewList data={testData} t={mockT} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.some((img) => img.getAttribute("alt") === "Minor Incident")).toBe(true);
  });

  it("renders em dash for empty data cells", () => {
    render(<ChildOverviewList data={testData} t={mockT} />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders default translation function if none provided", () => {
    render(<ChildOverviewList data={testData} />);
    expect(screen.getByText("Child overview (last 7 days)")).toBeInTheDocument();
  });

  it("renders with missing props (no t function)", () => {
    render(<ChildOverviewList data={[]} />);
    expect(screen.getByText("Child overview (last 7 days)")).toBeInTheDocument();
  });

  it("renders missed medications with only one item", () => {
    const data = [
      {
        date: "2025-10-23",
        mood: { label: "INCRISIS" },
        negativeBehaviors: [],
        missedMedications: [{ name: "Adderall" }],
        activities: [],
        minorIncident: false,
      },
    ];
    render(<ChildOverviewList data={data} t={mockT} />);
    expect(screen.getByText("Adderall")).toBeInTheDocument();
    expect(screen.queryByText("+1 more")).not.toBeInTheDocument();
  });

  it("renders activity with no activities", () => {
    const data = [
      {
        date: "2025-10-23",
        mood: { label: "INCRISIS" },
        negativeBehaviors: [],
        missedMedications: [],
        activities: [],
        minorIncident: false,
      },
    ];
    render(<ChildOverviewList data={data} t={mockT} />);
    // Should render em dash for empty activity
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders minor incident as false", () => {
    const data = [
      {
        date: "2025-10-23",
        mood: { label: "INCRISIS" },
        negativeBehaviors: [],
        missedMedications: [],
        activities: [],
        minorIncident: false,
      },
    ];
    render(<ChildOverviewList data={data} t={mockT} />);
    // Should render em dash for minor incident
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});
