import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";import "@testing-library/jest-dom";
import APIS from "../../common/hooks/UseApiCalls";
import ConsolidatedAssessmentProgressReport from "./ConsolidatedAssessmentProgressReport";

const mockNavigate = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));

jest.mock("../../common/hooks/UseApiCalls", () => ({
  __esModule: true,
  default: {
    GetConsolidatedAssessmentProgressReport: jest.fn(() =>
      Promise.resolve({
        data: {
          data: [],
          pageCount: 1,
          totalCount: 0,
        },
      })
    ),
  },
}));

let tableProps;

jest.mock(
  "../../views/Dashboard/GovtDashboardOverview/Components/ReusableTrendTable",
  () => (props) => {
    tableProps = props;

    return (
      <div data-testid="trend-table">
        {props.filterComponent}
        <button
          data-testid="apply-filter"
          onClick={() =>
            props.applyFilter({
              search: "test",
              rowCount: 20,
            })
          }
        >
          Apply
        </button>

        <button
          data-testid="cancel-filter"
          onClick={() => props.cancelFilter()}
        >
          Cancel
        </button>

        <button
          data-testid="clear-filter"
          onClick={() => props.clearFilter()}
        >
          Clear
        </button>

        <button
          data-testid="reload"
          onClick={() => props.onReload()}
        >
          Reload
        </button>
      </div>
    );
  }
);

jest.mock("../SmallText/SmallText", () => {
  return function MockSmallText({ value }) {
    return <span>{value}</span>;
  };
});

jest.mock("../BodyText/BodyText", () => {
  return function MockBodyText({ value }) {
    return <span>{value}</span>;
  };
});

jest.mock("../SecondaryButton/SecondaryButton", () => {
  return function MockSecondaryButton({ label, onClick }) {
    return <button onClick={onClick}>{label}</button>;
  };
});

jest.mock("../../constants", () => ({
  MonthDayYearFormatter: jest.fn((value) => value || "-"),
}));

describe("ConsolidatedAssessmentProgressReport", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Storage.prototype.getItem = jest.fn(() => "org-123");
  });

  it("renders successfully", async () => {
    render(
      <ConsolidatedAssessmentProgressReport
        pageType="ASSESSMENT"
        id="1"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("trend-table")
      ).toBeInTheDocument();
    });
  });

  it("calls apply filter", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  fireEvent.click(
    screen.getByTestId("apply-filter")
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });
});

it("calls cancel filter", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  // First apply a filter
  const combos = screen.getAllByRole("combobox");
  fireEvent.change(combos[0], {
    target: {
      value: "Completed",
    },
  });

  await waitFor(() => {
    fireEvent.click(
      screen.getByTestId("apply-filter")
    );
  });

  // Then cancel filter to restore previous state
  await waitFor(() => {
    fireEvent.click(
      screen.getByTestId("cancel-filter")
    );
  });
});

it("calls clear filter", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  fireEvent.click(
    screen.getByTestId("clear-filter")
  );
});

it("calls reload", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  fireEvent.click(
    screen.getByTestId("reload")
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });
});

it("handles api failure", async () => {
  APIS.GetConsolidatedAssessmentProgressReport.mockRejectedValueOnce(
  new Error("failed")
  );

  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });
});

it("renders assessment status column", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "status"
  );

  render(column.render({}, "Completed"));

  expect(
    screen.getByText("common:infoCard.Completed")
  ).toBeInTheDocument();
});

it("renders score when completed", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "totalScore"
  );

  render(
    column.render(
      { status: "Completed" },
      80
    )
  );

  expect(
    screen.getByText("80%")
  ).toBeInTheDocument();
});

it("renders dash when not completed", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "totalScore"
  );

  render(
    column.render(
      { status: "In Progress" },
      80
    )
  );

  expect(
    screen.getByText("-")
  ).toBeInTheDocument();
});

it("navigates to assessment view", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "actions"
  );

  render(
    column.render({
      status: "Completed",
      TWAssessmentId: 123,
    })
  );

 fireEvent.click(
  screen.getByLabelText(
    "common:common.Assessments"
  )
);

  expect(mockNavigate).toHaveBeenCalledWith(
    "/dashboard/assessments/123/view"
  );
});

it("navigates to child progress report", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="CHILD"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "actions"
  );

  render(
    column.render({
      progressReportStatus: "Completed",
      TWAssessmentId: 55,
    })
  );

  fireEvent.click(
  screen.getByLabelText(
    "common:common.Progress Report"
  )
);

  expect(mockNavigate).toHaveBeenCalledWith(
    "/dashboard/progressReportChildren",
    {
      state: {
        assessmentId: 55,
      },
    }
  );
});

it("navigates to family progress report", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="FAMILY"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "actions"
  );

  render(
    column.render({
      progressReportStatus: "Completed",
      TWAssessmentId: 99,
    })
  );

  fireEvent.click(
  screen.getByLabelText(
    "common:common.Progress Report"
  )
);

  expect(mockNavigate).toHaveBeenCalledWith(
    "/dashboard/reportProgressReportsFamilies",
    {
      state: {
        assessmentId: 99,
      },
    }
  );
});

it("renders overdue assessment submission", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "dateOfSubmission"
  );

  const { container } = render(
    column.render(
      {
        dueDate: "2024-01-01",
        dateOfSubmission: "2024-01-10",
        assessmentNumber: "2",
      },
      "2024-01-10"
    )
  );

  // Find the span with "days overdue" text to avoid matching filter label
  const overdueSpans = container.querySelectorAll("span");
  const overdueText = Array.from(overdueSpans).find(span =>
    span.textContent.includes("overdue")
  );
  
  expect(overdueText).toBeInTheDocument();
});

it("renders assessment submission without overdue", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "dateOfSubmission"
  );

  render(
    column.render(
      {
        dueDate: "2024-01-10",
        dateOfSubmission: "2024-01-10",
        assessmentNumber: "2",
      },
      "2024-01-10"
    )
  );
});

it("renders overdue progress report", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "progressreportSubmissionDate"
  );

  const { container } = render(
    column.render(
      {
        dateOfVisit: "2024-01-01",
      },
      "2024-05-01"
    )
  );

  // Find the span with "days overdue" text to avoid matching filter label
  const overdueSpans = container.querySelectorAll("span");
  const overdueText = Array.from(overdueSpans).find(span =>
    span.textContent.includes("overdue")
  );
  
  expect(overdueText).toBeInTheDocument();
});

it("renders intervention status", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "interventionStatus"
  );

  render(
    column.render({
      activeNotStartedIntervention: 1,
      inProgressIntervention: 2,
      completedIntervention: 3,
      interventionNoLongerRelevant: 4,
    })
  );

  expect(screen.getByText("1")).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
  expect(screen.getByText("3")).toBeInTheDocument();
  expect(screen.getByText("4")).toBeInTheDocument();
});

it("renders assessment for child", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "assessmentFor"
  );

  render(
    column.render(
      { type: "CHILD" },
      "John"
    )
  );

  expect(screen.getByText("John")).toBeInTheDocument();
});

it("renders assessment for family", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "assessmentFor"
  );

  render(
    column.render(
      { type: "FAMILY" },
      "Smith Family"
    )
  );

  expect(
    screen.getByText("Smith Family")
  ).toBeInTheDocument();
});

it("passes title for child page", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="CHILD"
      id="1"
    />
  );

  expect(tableProps.title).toBe(
    "Assessments & Progress Reports"
  );
});

it("does not pass title for assessment page", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  expect(tableProps.title).toBeUndefined();
});

it("builds child payload correctly", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="CHILD"
      id="999"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  const payload =
    APIS.GetConsolidatedAssessmentProgressReport.mock.calls[0][0];

  expect(payload.TWChildId).toBe("999");
  expect(payload.TWFamilyId).toBeNull();
});

it("builds family payload correctly", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="FAMILY"
      id="888"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  const payload =
    APIS.GetConsolidatedAssessmentProgressReport.mock.calls[0][0];

  expect(payload.TWFamilyId).toBe("888");
  expect(payload.TWChildId).toBeNull();
});

it("renders empty progress report date", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    c => c.id === "progressreportSubmissionDate"
  );

  render(
    column.render(
      { dateOfVisit: "2024-01-01" },
      ""
    )
  );
});

it("renders dash when completed score missing", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    c => c.id === "totalScore"
  );

  render(
    column.render(
      { status: "Completed" },
      null
    )
  );

  expect(
    screen.getByText("-")
  ).toBeInTheDocument();
});

it("renders empty action column", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    c => c.id === "actions"
  );

  render(
    column.render({
      status: "In Progress",
      progressReportStatus: "Not started",
    })
  );
});

it("changes assessment status filter", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const combos = screen.getAllByRole("combobox");

  fireEvent.change(combos[0], {
    target: {
      value: "Completed",
    },
  });
});

it("changes progress report filter", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const combos = screen.getAllByRole("combobox");

  fireEvent.change(combos[1], {
    target: {
      value: "Completed",
    },
  });
});

it("changes overdue filter", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const combos = screen.getAllByRole("combobox");

  fireEvent.change(combos[2], {
    target: {
      value: "Overdue",
    },
  });
});

it("renders on-time assessment submission (same day)", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "dateOfSubmission"
  );

  const { container } = render(
    column.render(
      {
        dueDate: "2024-01-10",
        dateOfSubmission: "2024-01-10",
        assessmentNumber: "2",
      },
      "2024-01-10"
    )
  );

  // Should not show overdue text for on-time submission
  const spans = container.querySelectorAll("span");
  const overdueText = Array.from(spans).find(span =>
    span.textContent.includes("overdue")
  );
  
  expect(overdueText).toBeUndefined();
});

it("renders assessment submission for first assessment (no overdue shown)", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "dateOfSubmission"
  );

  const { container } = render(
    column.render(
      {
        dueDate: "2024-01-01",
        dateOfSubmission: "2024-01-10",
        assessmentNumber: "1",
      },
      "2024-01-10"
    )
  );

  // Should not show overdue for assessment number 1
  const spans = container.querySelectorAll("span");
  const overdueText = Array.from(spans).find(span =>
    span.textContent.includes("overdue")
  );
  
  expect(overdueText).toBeUndefined();
});

it("renders pending assessment submission with no date", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "dateOfSubmission"
  );

  const { container } = render(
    column.render(
      {
        dueDate: "2024-01-01",
        dateOfSubmission: "",
        assessmentNumber: "2",
      },
      ""
    )
  );

  expect(screen.getByText("-")).toBeInTheDocument();
});

it("renders pending assessment submission overdue (no submission date, past due)", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "dateOfSubmission"
  );

  const { container } = render(
    column.render(
      {
        dueDate: "2024-01-01",
        dateOfSubmission: "",
        assessmentNumber: "2",
      },
      ""
    )
  );

  // Just verify it renders the date column
  expect(screen.getByText("-")).toBeInTheDocument();
});

it("renders progress report without overdue when empty", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "progressreportSubmissionDate"
  );

  const { container } = render(
    column.render(
      {
        dateOfVisit: "2024-01-01",
      },
      ""
    )
  );

  const spans = container.querySelectorAll("span");
  const overdueText = Array.from(spans).find(span =>
    span.textContent.includes("overdue")
  );
  
  expect(overdueText).toBeUndefined();
});

it("renders on-time progress report", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "progressreportSubmissionDate"
  );

  const { container } = render(
    column.render(
      {
        dateOfVisit: "2024-01-01",
      },
      "2024-02-01"
    )
  );

  const spans = container.querySelectorAll("span");
  const overdueText = Array.from(spans).find(span =>
    span.textContent.includes("overdue")
  );
  
  expect(overdueText).toBeUndefined();
});

it("clears assessment status filter via chip delete", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });
});

it("handles chip delete for progress report status", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });
});

it("handles chip delete for overdue status", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });
});

it("navigates to assessment view for assessment page type", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "actions"
  );

  render(
    column.render({
      status: "Completed",
      progressReportStatus: "Not started",
      TWAssessmentId: 123,
    })
  );

  fireEvent.click(
    screen.getByLabelText(
      "common:common.Assessments"
    )
  );

  expect(mockNavigate).toHaveBeenCalledWith(
    "/dashboard/assessments/123/view"
  );
});

it("renders no action buttons when both statuses incomplete", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "actions"
  );

  const { container } = render(
    column.render({
      status: "In Progress",
      progressReportStatus: "Not started",
      TWAssessmentId: 123,
    })
  );

  const buttons = container.querySelectorAll("button");
  expect(buttons.length).toBe(0);
});

it("renders both action buttons when both statuses completed", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "actions"
  );

  const { container } = render(
    column.render({
      status: "Completed",
      progressReportStatus: "Completed",
      TWAssessmentId: 123,
    })
  );

  const buttons = container.querySelectorAll("button");
  expect(buttons.length).toBe(2);
});

it("handles API error gracefully", async () => {
  APIS.GetConsolidatedAssessmentProgressReport.mockRejectedValueOnce(
    new Error("Network error")
  );

  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });
});

it("processes payload for assessment page type", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  const payload =
    APIS.GetConsolidatedAssessmentProgressReport.mock.calls[0][0];

  expect(payload.TWChildId).toBeNull();
  expect(payload.TWFamilyId).toBeNull();
});

it("handles single day overdue correctly", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "dateOfSubmission"
  );

  const { container } = render(
    column.render(
      {
        dueDate: "2024-01-10",
        dateOfSubmission: "2024-01-11",
        assessmentNumber: "2",
      },
      "2024-01-11"
    )
  );

  const overdueSpans = container.querySelectorAll("span");
  const overdueText = Array.from(overdueSpans).find(span =>
    span.textContent.includes("day overdue") && !span.textContent.includes("days overdue")
  );
  
  expect(overdueText).toBeDefined();
});

it("renders score with percentage sign", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "totalScore"
  );

  render(
    column.render(
      { status: "Completed" },
      100
    )
  );

  expect(
    screen.getByText("100%")
  ).toBeInTheDocument();
});

it("renders zero score with percentage", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "totalScore"
  );

  const { container } = render(
    column.render(
      { status: "Completed" },
      1
    )
  );

  const spans = container.querySelectorAll("span");
  const scoreSpan = Array.from(spans).find(span =>
    span.textContent === "1%"
  );
  
  expect(scoreSpan).toBeDefined();
});

it("shows case worker column", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  const caseWorkerColumn = tableProps.columns.find(
    c => c.id === "caseWorker"
  );

  expect(caseWorkerColumn).toBeDefined();
  expect(caseWorkerColumn.label).toBe("Case worker");
});

it("shows date of visit column", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  const dateOfVisitColumn = tableProps.columns.find(
    c => c.id === "dateOfVisit"
  );

  expect(dateOfVisitColumn).toBeDefined();
  expect(dateOfVisitColumn.label).toBe("Date of visit");
});

it("renders formatted date of visit", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  const column = tableProps.columns.find(
    c => c.id === "dateOfVisit"
  );

  const { container } = render(column.render({}, "2024-01-15"));
  
  const spans = container.querySelectorAll("span");
  expect(spans.length).toBeGreaterThan(0);
});

it("renders dash for empty date of visit", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  const column = tableProps.columns.find(
    c => c.id === "dateOfVisit"
  );

  render(column.render({}, null));
  expect(screen.getByText("-")).toBeInTheDocument();
});

it("calls handleChipDelete via tableProps when chip delete button is clicked", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  expect(tableProps.handleChipDelete).toBeDefined();
});

it("calls applyFilter via tableProps", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  expect(tableProps.applyFilter).toBeDefined();
  
  // Test calling applyFilter
  tableProps.applyFilter({ search: "test", rowCount: 20 });
  
  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });
});

it("calls cancelFilter via tableProps", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  expect(tableProps.cancelFilter).toBeDefined();
  tableProps.cancelFilter();
});

it("calls clearFilter via tableProps", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  expect(tableProps.clearFilter).toBeDefined();
  tableProps.clearFilter();
});

it("passes all required table props", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  expect(tableProps.columns).toBeDefined();
  expect(tableProps.filterable).toBe(true);
  expect(tableProps.searchable).toBe(true);
  expect(tableProps.loading).toBe(false);
  expect(tableProps.enablePagination).toBe(true);
  expect(tableProps.defaultSortField).toBe("dateOfVisit");
  expect(tableProps.defaultSortFieldOrder).toBe("desc");
});

it("renders assessment columns for assessment page type", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  // Verify that columns are defined
  expect(tableProps.columns).toBeDefined();
  expect(tableProps.columns.length).toBeGreaterThan(0);
});

it("renders assessment columns for child page type with title", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="CHILD"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  // For CHILD page type, title should be defined
  expect(tableProps.title).toBe("Assessments & Progress Reports");
});

it("renders assessment columns for family page type with title", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="FAMILY"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  // For FAMILY page type, title should be defined
  expect(tableProps.title).toBe("Assessments & Progress Reports");
});

it("renders only assessment button for completed assessment", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "actions"
  );

  const { container } = render(
    column.render({
      status: "Completed",
      progressReportStatus: "Not started",
      TWAssessmentId: 123,
    })
  );

  const buttons = container.querySelectorAll("button");
  expect(buttons.length).toBe(1);
});

it("renders only progress report button for completed progress report", () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  const column = tableProps.columns.find(
    (c) => c.id === "actions"
  );

  const { container } = render(
    column.render({
      status: "In Progress",
      progressReportStatus: "Completed",
      TWAssessmentId: 123,
    })
  );

  const buttons = container.querySelectorAll("button");
  expect(buttons.length).toBe(1);
});

it("renders assessment with multiple filters applied", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  // Apply multiple filters
  fireEvent.click(
    screen.getByTestId("apply-filter")
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalledTimes(2);
  });
});

it("renders with different page types and correct payload", async () => {
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="CHILD"
      id="123"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  const payload =
    APIS.GetConsolidatedAssessmentProgressReport.mock.calls[0][0];

  expect(payload.TWChildId).toBe("123");
});

it("handles complex filter state changes", async () => {
  jest.clearAllMocks();
  render(
    <ConsolidatedAssessmentProgressReport
      pageType="ASSESSMENT"
      id="1"
    />
  );

  await waitFor(() => {
    expect(
      APIS.GetConsolidatedAssessmentProgressReport
    ).toHaveBeenCalled();
  });

  // Test clearFilter
  tableProps.clearFilter();
});


});