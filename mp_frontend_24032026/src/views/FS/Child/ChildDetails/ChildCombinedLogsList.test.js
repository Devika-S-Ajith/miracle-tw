import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ChildCombinedLogsList from "./ChildCombinedLogsList";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";

// Mock TableComponent
let lastTableComponentProps = null;
jest.mock(
  "../../../../components/TableComponent/TableComponent",
  () => (props) => {
    lastTableComponentProps = props;
    // To assist tests relying on columns inside the TableComponent, we serialize the columns prop as text content
    const columnsData = JSON.stringify({ columns: props.columns });
    return (
      <div
        data-testid="table-component"
        data-columns={columnsData}
        children={columnsData}
      />
    );
  }
);

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}));

// Mock dateFormatter and timeFormatter
jest.mock("../../../../constants", () => ({
  dateFormatter: () => "2024-06-01",
  timeFormatter: () => "12:00 PM",
}));

// Mock API calls
jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  ListLogTypes: jest.fn(() =>
    Promise.resolve({
      data: {
        data: {
          forms: [
            { id: "behavior", formName: "Behavior logs" },
            { id: "medication", formName: "Medication logs" },
            { id: "monthly-medication", formName: "Monthly medication logs" },
            { id: "recreation", formName: "Recreation logs" },
          ],
        },
      },
    })
  ),
  ListAllLogs: jest.fn(() => Promise.resolve({ data: { data: { logs: [] } } })),
}));

// Helper to render with theme
const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>
  );
};

describe("ChildCombinedLogsList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document.title before each test
    document.title = "";
  });

  it("renders toolbar with log type dropdown and date pickers", () => {
    renderWithTheme(<ChildCombinedLogsList />);
    expect(screen.getByText("Logs")).toBeInTheDocument();
    expect(screen.getByLabelText("Log Type")).toBeInTheDocument();
    expect(screen.getByLabelText("From")).toBeInTheDocument();
    expect(screen.getByLabelText("To")).toBeInTheDocument();

    // Open the dropdown
    fireEvent.mouseDown(screen.getByLabelText("Log Type"));

    // Now the options should be in the DOM
    expect(screen.getByText("All logs")).toBeInTheDocument();
    expect(screen.getByText("Behavior logs")).toBeInTheDocument();
    expect(screen.getByText("Medication logs")).toBeInTheDocument();
    expect(screen.getByText("Monthly medication logs")).toBeInTheDocument();
    expect(screen.getByText("Recreation logs")).toBeInTheDocument();
  });

  it("renders Export button", () => {
    renderWithTheme(<ChildCombinedLogsList />);
    expect(screen.getByRole("button", { name: /Export/i })).toBeInTheDocument();
  });

  it("renders TableComponent with correct props", () => {
    renderWithTheme(<ChildCombinedLogsList />);
    const table = screen.getByTestId("table-component");
    expect(table).toBeInTheDocument();
    const props = lastTableComponentProps;
    expect(props.id).toBe("combined-logs-table");
    expect(props.showSlno).toBe(false);
    expect(props.hideToolbar).toBe(true);
    expect(Array.isArray(props.columns)).toBe(true);
    expect(typeof props.dataLoader).toBe("function");
    expect(Array.isArray(props.defaultSorting)).toBe(true);
  });

  it("calls navigate when visibility icon is clicked", () => {
    renderWithTheme(<ChildCombinedLogsList />);
    const columns = lastTableComponentProps.columns;
    const visibilityCol = columns.find(
      (col) => typeof col.renderCell === "function" && !col.field
    );
    const row = { id: 1 };
    const cell = visibilityCol.renderCell(row);
    // Render the cell to get the button
    const { getByLabelText } = renderWithTheme(cell);
    fireEvent.click(getByLabelText("View"));
    expect(mockNavigate).toHaveBeenCalledWith("/fostershare/child/logs/1");
  });

  it("renders document link when document exists", () => {
    // We use the columns from lastTableComponentProps instead of parsing from rendered dom textContent (which does not contain actual column functions)
    renderWithTheme(<ChildCombinedLogsList />);
    const columns = lastTableComponentProps.columns;
    const docCol = columns.find((col) => col.field === "document");
    const row = { document: "http://example.com/doc.pdf" };
    const cell = docCol.renderCell(row);
    const { getByText } = renderWithTheme(cell);
    const link = getByText("View Document");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "http://example.com/doc.pdf");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders '-' when document does not exist", () => {
    renderWithTheme(<ChildCombinedLogsList />);
    const columns = lastTableComponentProps.columns;
    const docCol = columns.find((col) => col.field === "document");
    const row = { document: "" };
    const cell = docCol.renderCell(row);
    const { getByText } = renderWithTheme(cell);
    expect(getByText("-")).toBeInTheDocument();
  });

  it("disables Export button when there are no logs", () => {
    renderWithTheme(<ChildCombinedLogsList />);
    const exportButton = screen.getByRole("button", { name: /Export/i });
    expect(exportButton).toBeDisabled();
  });

  it("calls dataLoader with correct params", () => {
    renderWithTheme(<ChildCombinedLogsList />);
    const { dataLoader } = lastTableComponentProps;
    const params = { page: 1, pageSize: 10, sorting: [] };
    expect(() => dataLoader(params)).not.toThrow();
  });

  it("renders correct default sorting", () => {
    renderWithTheme(<ChildCombinedLogsList />);
    const { defaultSorting } = lastTableComponentProps;
    expect(defaultSorting.length).toBeGreaterThan(0);
    expect(defaultSorting[0]).toHaveProperty("field");
    expect(defaultSorting[0]).toHaveProperty("sort");
  });

  it("renders correct columns configuration", () => {
    renderWithTheme(<ChildCombinedLogsList />);
    const { columns } = lastTableComponentProps;
    expect(columns.some((col) => col.field === "document")).toBe(true);
    expect(columns.some((col) => typeof col.renderCell === "function")).toBe(
      true
    );
  });

  it("renders correct toolbar title", () => {
    renderWithTheme(<ChildCombinedLogsList />);
    expect(screen.getByText(/Logs/i)).toBeInTheDocument();
  });
});
