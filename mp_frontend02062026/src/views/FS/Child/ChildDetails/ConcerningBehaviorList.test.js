import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConcerningBehaviorList } from "./ConcerningBehaviorList";

// Mocks for MUI and icons
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  Typography: ({ children, ...props }) => <span {...props}>{children}</span>,
  Box: ({ children, ...props }) => <span {...props}>{children}</span>,
  Tooltip: ({ children, title }) => (
    <span data-testid="tooltip" title={title}>
      {children}
    </span>
  ),
  IconButton: ({ children, ...props }) => (
    <button {...props} data-testid="icon-button">
      {children}
    </button>
  ),
}));

jest.mock(
  "../../../../assets/icons/SideBarIcons",
  () => ({
    MessagesIconBlack: (props) => <svg data-testid="messages-icon" {...props} />,
  })
);

// Mock ReusableTrendTable to capture props and render children
const mockTableRender = jest.fn();
jest.mock(
  "../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable",
  () => ({
    __esModule: true,
    default: (props) => {
      mockTableRender(props);
      // Render columns for test visibility
      return (
        <div>
          <div data-testid="table-title">{props.title}</div>
          {props.tableData.map((row, idx) => (
            <div key={idx} data-testid={`row-${idx}`}>
              {props.columns.map((col, cidx) => (
                <div key={cidx} data-testid={`cell-${idx}-${col.id}`}>
                  {col.render(row)}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    },
  })
);

const customData = [
  {
    date: "2025-02-01",
    type: "mood",
    consecutiveDays: 2,
    startDate: "2025-01-30",
    label: "sad moods",
  },
  {
    date: "2025-02-02",
    type: "behavior",
    negativeCount: 7,
    label: "aggressive behaviors",
  },
  {
    date: "2025-02-03",
    type: "medication",
    consecutiveDays: 1,
    startDate: "2025-02-02",
    medication: "Ritalin",
    label: "missed medication",
  },
  {
    date: "2025-02-04",
    type: "unknown",
    label: "unknown concern",
  },
];

describe("ConcerningBehaviorList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default mockData and displays all rows", () => {
    render(<ConcerningBehaviorList />);
    expect(screen.getByTestId("table-title")).toHaveTextContent(
      "Concerning behaviors (last 7 days)"
    );
    // Should render 3 rows for mockData
    expect(screen.getByTestId("row-0")).toBeInTheDocument();
    expect(screen.getByTestId("row-1")).toBeInTheDocument();
    expect(screen.getByTestId("row-2")).toBeInTheDocument();
    // Date cell content
    expect(screen.getByTestId("cell-0-date")).toHaveTextContent("Jan 20, 2025");
    expect(screen.getByTestId("cell-1-date")).toHaveTextContent("Jan 17, 2025");
    expect(screen.getByTestId("cell-2-date")).toHaveTextContent("Jan 10, 2025");
  });

  it("renders with custom data and covers all concern types", () => {
    render(<ConcerningBehaviorList data={customData} />);
    // Mood branch
    expect(screen.getByTestId("cell-0-concern")).toHaveTextContent(
      "2 consecutive days"
    );
    expect(screen.getByTestId("cell-0-concern")).toHaveTextContent(
      "sad moods"
    );
    expect(screen.getByTestId("cell-0-concern").querySelector("img")).toHaveAttribute(
      "alt",
      "In Crisis"
    );
    // Behavior branch
    expect(screen.getByTestId("cell-1-concern")).toHaveTextContent(
      "More than"
    );
    expect(screen.getByTestId("cell-1-concern")).toHaveTextContent(
      "7"
    );
    expect(screen.getByTestId("cell-1-concern")).toHaveTextContent(
      "aggressive behaviors"
    );
    expect(screen.getByTestId("cell-1-concern").querySelector("img")).toHaveAttribute(
      "alt",
      "Negative Behavior"
    );
    // Medication branch
    expect(screen.getByTestId("cell-2-concern")).toHaveTextContent(
      "missed medication"
    );
    expect(screen.getByTestId("cell-2-concern")).toHaveTextContent(
      "Ritalin"
    );
    expect(screen.getByTestId("cell-2-concern").querySelector("img")).toHaveAttribute(
      "alt",
      "Missed Medication"
    );
    // Unknown type branch (fallback)
    expect(screen.getByTestId("cell-3-concern")).toHaveTextContent("—");
    expect(screen.getByTestId("cell-3-concern").querySelector("img")).toBeNull();
  });

  it("renders actions column with tooltip and icon button for each row", () => {
    render(<ConcerningBehaviorList data={customData} />);
    customData.forEach((_, idx) => {
      const cell = screen.getByTestId(`cell-${idx}-actions`);
      expect(cell.querySelector('[data-testid="tooltip"]')).toBeInTheDocument();
      expect(cell.querySelector('[data-testid="icon-button"]')).toBeInTheDocument();
      expect(cell.querySelector('[data-testid="messages-icon"]')).toBeInTheDocument();
    });
  });

  it("calls render functions for all columns and rows", () => {
    render(<ConcerningBehaviorList data={customData} />);
    // Should call render for each column per row
    expect(mockTableRender).toHaveBeenCalled();
    const { columns, tableData } = mockTableRender.mock.calls[0][0];
    tableData.forEach((row, idx) => {
      columns.forEach((col) => {
        // Should not throw for any render
        expect(() => col.render(row)).not.toThrow();
      });
    });
  });

  it("formats dates correctly in date column", () => {
    render(<ConcerningBehaviorList data={customData} />);
    expect(screen.getByTestId("cell-0-date")).toHaveTextContent("Feb 1, 2025");
    expect(screen.getByTestId("cell-1-date")).toHaveTextContent("Feb 2, 2025");
    expect(screen.getByTestId("cell-2-date")).toHaveTextContent("Feb 3, 2025");
    expect(screen.getByTestId("cell-3-date")).toHaveTextContent("Feb 4, 2025");
  });

  it("renders with empty data (edge case)", () => {
    render(<ConcerningBehaviorList data={[]} />);
    // Should not render any rows
    expect(screen.queryByTestId("row-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("table-title")).toBeInTheDocument();
  });

  it("renders with missing props (uses default mockData)", () => {
    render(<ConcerningBehaviorList />);
    expect(screen.getByTestId("row-0")).toBeInTheDocument();
    expect(screen.getByTestId("row-1")).toBeInTheDocument();
    expect(screen.getByTestId("row-2")).toBeInTheDocument();
  });
});