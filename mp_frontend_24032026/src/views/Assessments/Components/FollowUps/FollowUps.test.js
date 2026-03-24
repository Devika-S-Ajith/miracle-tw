import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import FollowUps from "./FollowUps";
import APIS from "../../../../common/hooks/UseApiCalls";
import { ModalService } from "../../../../components/Modal";

// Mock dependencies
jest.mock("../../../../common/hooks/UseApiCalls");
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key, fallback) => fallback || key,
    }),
}));
jest.mock("../../../../components/DateRangePicker", () => () => <div data-testid="date-range-picker" />);
jest.mock("../../../../components/BodyText/BodyText", () => (props) => <span>{props.value}</span>);
jest.mock("../../../../components/LabelValue", () => (props) => <div>{props.label}: {props.value}</div>);
jest.mock("../../../../components/Modal", () => ({
  ModalService: {
    open: jest.fn(),
    close: jest.fn(),
  },
}));
jest.mock("../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable", () => (props) => (
  <div>
    <div data-testid="trend-table">{props.title}</div>
    {props.toolBar}
    {props.loading && <span>Loading...</span>}
    {props.apiError && <span>Error!</span>}
    <button data-testid="reload-btn" onClick={props.onReload}>Reload</button>
    <button data-testid="export-btn" onClick={props.onExport}>Export</button>
    {props.tableData && props.tableData.map((row, idx) => (
      <div key={idx} data-testid="row">
        {row.caseWorker}
        <button data-testid={`actions-btn-${idx}`} onClick={() => props.columns.find(c => c.id === "actions").render(row)} />
      </div>
    ))}
  </div>
));
jest.mock("@mui/x-date-pickers", () => ({
    LocalizationProvider: ({ children }) => <div>{children}</div>,
}));
jest.mock("@mui/x-date-pickers/AdapterDayjs", () => ({}));
jest.mock("@mui/lab", () => ({
    LoadingButton: (props) => <button {...props}>{props.children}</button>,
}));
jest.mock("@mui/icons-material/FileUpload", () => () => <span>FileUploadIcon</span>);
jest.mock("@mui/icons-material/RemoveRedEye", () => (props) => <button {...props}>Eye</button>);
jest.mock("../../../../constants", () => ({
    dateTimeFormatter: (date) => `formatted-${date}`,
}));

describe("FollowUps", () => {
    const mockFollowUpsData = {
        data: [
            {
                dateOfFollowup: "2024-06-01T10:00:00Z",
                contactMethod: "PHONE",
                caseWorker: "John Doe",
                type: "AD_HOC",
                notes: "Follow up notes",
                frequency: "WEEKLY",
            },
        ],
        pageCount: 1,
        total: 1,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        APIS.GetFollowUpList.mockResolvedValue({
            data: {
                data: {
                    followups: [
                        {
                            dateOfFollowup: "2024-06-01T10:00:00Z",
                            contactMethod: "PHONE",
                            caseWorker: "John Doe",
                            type: "AD_HOC",
                            notes: "Follow up notes", // Ensure this value is present
                            frequency: "WEEKLY",
                        },
                    ],
                    pagination: { totalPages: 1, totalCount: 1 },
                },
            },
        });
        APIS.ExportFollowUps.mockResolvedValue({ data: "base64data" });
    });

    it("renders the trend table and toolbar", async () => {
        render(<FollowUps id="123" type="CHILD" />);
        expect(screen.getByTestId("trend-table")).toHaveTextContent("Follow - ups");
        expect(screen.getByTestId("date-range-picker")).toBeInTheDocument();
        await waitFor(() => expect(APIS.GetFollowUpList).toHaveBeenCalled());
    });

    it("shows loading indicator while fetching data", async () => {
        APIS.GetFollowUpList.mockImplementation(() => new Promise(() => {}));
        render(<FollowUps id="123" type="CHILD" />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("shows error indicator on API error", async () => {
        APIS.GetFollowUpList.mockRejectedValue(new Error("API error"));
        render(<FollowUps id="123" type="CHILD" />);
        await waitFor(() => expect(screen.getByText("Error!")).toBeInTheDocument());
    });

    it("renders table rows with correct data", async () => {
  render(<FollowUps id="123" type="CHILD" />);

  // Wait for the table rows to render
  await waitFor(() => expect(screen.getAllByTestId("row").length).toBe(1));

  // Debug the rendered DOM
  screen.debug();

  // Use a flexible matcher to find the "Follow up notes" text
  const notes = screen.getByText((content, element) => element?.textContent.includes("Follow up notes"));
  expect(notes).toBeInTheDocument();
});

    it("calls getFollowUpData on reload", async () => {
        render(<FollowUps id="123" type="CHILD" />);
        await waitFor(() => expect(APIS.GetFollowUpList).toHaveBeenCalledTimes(1));
        fireEvent.click(screen.getByTestId("reload-btn"));
        await waitFor(() => expect(APIS.GetFollowUpList).toHaveBeenCalledTimes(2));
    });

    it("calls exportFollowUps and triggers download", async () => {
  render(<FollowUps id="123" type="CHILD" />);

  // Debug the rendered DOM
  screen.debug();

  // Wait for the table rows to render
  await waitFor(() => expect(screen.getAllByTestId("row").length).toBe(1));

  // Use a flexible matcher to find the Export button
  const exportBtn = screen.getByText((content, element) => element?.textContent === "Export");

  // Mock document.createElement and click
  const clickMock = jest.fn();
  document.createElement = jest.fn(() => ({
    setAttribute: jest.fn(),
    click: clickMock,
    style: {},
    href: "",
    download: "",
    target: "",
  }));
  document.body.appendChild = jest.fn();
  document.body.removeChild = jest.fn();

  fireEvent.click(exportBtn);
  await waitFor(() => expect(APIS.ExportFollowUps).toHaveBeenCalled());
  expect(clickMock).toHaveBeenCalled();
});

    it("opens modal when actions icon is clicked", async () => {
  render(<FollowUps id="123" type="CHILD" />);

  // Wait for the table rows to render
  await waitFor(() => expect(screen.getAllByTestId("row").length).toBe(1));

  // Simulate clicking the actions button
  const actionsButton = screen.getByTestId("actions-btn-0");
  fireEvent.click(actionsButton);

  // Verify that ModalService.open was called
  expect(ModalService.open).toHaveBeenCalled();
});
});

afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = ""; // Clear dynamically created DOM elements
});