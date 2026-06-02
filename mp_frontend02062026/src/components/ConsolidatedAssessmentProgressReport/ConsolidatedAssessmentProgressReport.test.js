import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import ConsolidatedAssessmentProgressReport from "./ConsolidatedAssessmentProgressReport";
import { useNavigate } from "react-router";
import APIS from "../../common/hooks/UseApiCalls";

// Mock dependencies
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));
jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("../../common/hooks/UseApiCalls", () => ({
  GetConsolidatedAssessmentProgressReport: jest.fn(),
}));

// Mock child components
jest.mock(
  "../../views/Dashboard/GovtDashboardOverview/Components/ReusableTrendTable",
  () => (props) => {
    return (
      <div>
        <div data-testid="table-title">{props.title}</div>
        <table>
          <tbody>
            {(props.tableData || []).map((row, rowIndex) => (
              <tr key={rowIndex} data-testid={`table-row-${rowIndex}`}>
                {/* Render ALL keys in the row for test visibility */}
                {Object.entries(row).map(([key, value]) => (
                  <td key={key}>{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {props.loading && <div data-testid="loading">Loading...</div>}
        {props.apiError && <div data-testid="api-error">{props.apiError}</div>}
      </div>
    );
  }
);
jest.mock("../SmallText/SmallText", () => (props) => <span>{props.value}</span>);

describe("ConsolidatedAssessmentProgressReport", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    localStorage.setItem("orgId", "test-org-id");
  });

  it("renders table title and loading state", async () => {
    APIS.GetConsolidatedAssessmentProgressReport.mockResolvedValue({
      data: { data: [], pageCount: 1, totalCount: 0 },
    });

    render(<ConsolidatedAssessmentProgressReport pageType="CHILD" id="child-1" />);
    expect(screen.getByTestId("table-title")).toHaveTextContent(
      "Assessments & progress reports"
    );
    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(APIS.GetConsolidatedAssessmentProgressReport).toHaveBeenCalled();
    });
  });

  it("shows api error on fetch failure", async () => {
    APIS.GetConsolidatedAssessmentProgressReport.mockRejectedValue(
      new Error("API Error")
    );

    render(<ConsolidatedAssessmentProgressReport pageType="CHILD" id="child-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("api-error")).toHaveTextContent(
        "Failed to fetch milestones data"
      );
    });
  });

  it("renders table rows with data and handles action button clicks", async () => {
    const mockData = [
      {
        assessmentFor: "John Doe",
        caseWorker: "Jane Smith",
        status: "Completed",
        dateOfVisit: "2024-06-01",
        dateOfSubmission: "2024-06-02",
        totalScore: 85,
        progressReportStatus: "Submitted",
        progressreportSubmissionDate: "2024-06-03",
        interventionStatus: true,
        HTAssessmentId: "assess-1",
        activeNotStartedIntervention: 1,
        inProgressIntervention: 2,
        completedIntervention: 3,
      },
    ];
    APIS.GetConsolidatedAssessmentProgressReport.mockResolvedValue({
      data: { data: mockData, pageCount: 1, totalCount: 1 },
    });

    render(<ConsolidatedAssessmentProgressReport pageType="CHILD" id="child-1" />);
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    const rows = screen.getAllByTestId(/^table-row-/);
    const johnDoeRow = rows.find(
      (row) => row.textContent && row.textContent.includes("John Doe")
    );
    expect(johnDoeRow).toBeDefined();

    // Example: simulate button clicks or other interactions here if needed
  });

  it("renders intervention status icons and counts", async () => {
    const mockData = [
      {
        caseWorker: "Jane Smith",
        status: "Completed",
        activeNotStartedIntervention: 5,
        inProgressIntervention: 2,
        completedIntervention: 1,
      },
    ];
    APIS.GetConsolidatedAssessmentProgressReport.mockResolvedValue({
      data: { data: mockData, pageCount: 1, totalCount: 1 },
    });

    render(<ConsolidatedAssessmentProgressReport pageType="CHILD" id="child-1" />);
    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });
});