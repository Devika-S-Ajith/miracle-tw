import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import IndividualInterventions from "./IndividualInterventions";

// Mock translation
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

// Mock the API module that imports axios (adjust path as needed)
jest.mock("../../common/hooks/UseApiCalls", () => ({
  getTableData: jest.fn(),
}));

// Mock ReusableTrendTable to capture props and render minimal output
let lastTableProps = null;
jest.mock(
  "../../views/Dashboard/GovtDashboardOverview/Components/ReusableTrendTable",
  () => (props) => {
    lastTableProps = props;
    return (
      <div data-testid="trend-table">
        <span>{props.title}</span>
        <span data-testid="rowcount">{props.tableData ? props.tableData.length : 0}</span>
        {props.apiError && <span data-testid="apiError">{props.apiError}</span>}
        {props.loading && <span data-testid="loading">loading</span>}
        <button onClick={() => props.onReload()}>Reload</button>
        {props.tableData &&
          props.tableData.map((row, i) => (
            <div key={i} data-testid="row">
              <span>{row.intervention}</span>
              <span>{row.milestone_name}</span>
              <span data-testid="children">{row.childrenApplied?.join(", ")}</span>
            </div>
          ))}
      </div>
    );
  }
);

const mockMemberList = [
  { id: 1, firstName: "John", lastName: "Doe" },
  { id: 2, firstName: "Jane", lastName: "Smith" },
];

describe("IndividualInterventions (unit)", () => {
  beforeEach(() => {
    lastTableProps = null;
    jest.clearAllMocks();
  });

  it("renders loading state", async () => {
    const getTableData = () =>
      new Promise(() => {}); // never resolves
    render(
      <IndividualInterventions
        id={123}
        getTableData={getTableData}
        memberList={mockMemberList}
      />
    );
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders with static data and maps childrenApplied", async () => {
    const getTableData = () =>
      Promise.resolve({
        data: {
          data: [
            {
              intervention: "Static Intervention",
              childrenApplied: [1, 2],
              interventionNotes: "Static notes",
              HTQuestionDomainId: "domain1",
              milestone_name: "Static Milestone",
              progressReportStartDate: "2025-10-01",
              progressReportSubmitedDate: "2025-10-10",
              assessment_modes: { current: "😊", next: "😐" },
              followupType: "completed",
              intervention_status: "Completed",
              redFlag: true,
            },
          ],
          pageCount: 1,
          totalCount: 1,
        },
      });

    render(
      <IndividualInterventions
        id={123}
        getTableData={getTableData}
        memberList={mockMemberList}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("trend-table")).toBeInTheDocument();
      expect(screen.getByText("All interventions")).toBeInTheDocument();
      expect(screen.getByText("Static Intervention")).toBeInTheDocument();
      expect(screen.getByText("Static Milestone")).toBeInTheDocument();
      expect(screen.getByTestId("rowcount")).toHaveTextContent("1");
      // Children mapping
      expect(screen.getByTestId("children")).toHaveTextContent("John Doe, Jane Smith");
      // Pagination props
      expect(lastTableProps.totalPageCount).toBe(1);
      expect(lastTableProps.totalItems).toBe(1);
    });
  });

  it("renders error state", async () => {
    const getTableData = () => Promise.reject(new Error("API Error"));

    render(
      <IndividualInterventions
        id={123}
        getTableData={getTableData}
        memberList={mockMemberList}
      />
    );

    expect(await screen.findByTestId("apiError")).toHaveTextContent("Failed to load interventions");
  });

  it("renders with empty data", async () => {
    const getTableData = () =>
      Promise.resolve({
        data: {
          data: [],
          pageCount: 0,
          totalCount: 0,
        },
      });

    render(
      <IndividualInterventions
        id={123}
        getTableData={getTableData}
        memberList={mockMemberList}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("trend-table")).toBeInTheDocument();
      expect(screen.getByTestId("rowcount")).toHaveTextContent("0");
      expect(lastTableProps.totalPageCount).toBe(0);
      expect(lastTableProps.totalItems).toBe(0);
    });
  });

  it("calls onReload when reload button is clicked", async () => {
    let callCount = 0;
    const getTableData = () => {
      callCount++;
      return Promise.resolve({
        data: {
          data: [],
          pageCount: 1,
          totalCount: 0,
        },
      });
    };
    render(
      <IndividualInterventions
        id={123}
        getTableData={getTableData}
        memberList={mockMemberList}
      />
    );
    await waitFor(() => expect(screen.getByTestId("trend-table")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Reload"));
    await waitFor(() => expect(callCount).toBe(2));
  });
});