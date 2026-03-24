import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import MedicationChangesLog from "./MedicationChangesLog";

// Mock dependencies
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "test-log-id" }),
}));
jest.mock("react-hot-toast", () => ({ error: jest.fn() }));
jest.mock("@mui/x-date-pickers", () => ({
  ...jest.requireActual("@mui/x-date-pickers"),
  DatePicker: ({ onChange, ...props }) => (
    <input
      data-testid={props.id}
      type="date"
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  ),
  LocalizationProvider: ({ children }) => <div>{children}</div>,
}));
jest.mock("@mui/lab", () => ({
  LoadingButton: ({
    children,
    loading,
    loadingPosition,
    startIcon,
    ...props
  }) => <button {...props}>{children}</button>,
}));
jest.mock("../../../../components/UserComponents/Loader", () => () => (
  <div data-testid="loader" />
));
jest.mock(
  "../../../../components/UserComponents/ListPaging",
  () =>
    ({ rowCount, handleRowCountChange }) =>
      (
        <select
          data-testid="list-paging"
          value={rowCount}
          onChange={handleRowCountChange}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      )
);
jest.mock(
  "../../../../assets/images/woman-and-pc-screens.svg",
  () => "mocked-image"
);
jest.mock("../../../../helpers/helperFunction", () => ({
  getDate: jest.fn((val) => val),
  formatDate: jest.fn(() => "Jan 1, 2024, 10:00 AM"),
}));
jest.mock("./MedicationLabelValue", () => ({ label, value }) => (
  <div data-testid="med-label-value">
    {label}: {value}
  </div>
));
jest.mock("../../../../constants", () => ({
  DateFormatFromRegion: () => "MM/DD/YYYY",
}));
jest.mock("../../../../assets/icons/Search", () => () => (
  <span data-testid="search-icon" />
));
jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetMedicationChangeLogList: jest.fn(),
  ExportMedicationChangeLogList: jest.fn(),
}));
jest.mock("../../../../components/UserComponents/ReportGenerator", () => ({
  PrintAsPDF: jest.fn(),
}));

const {
  GetMedicationChangeLogList,
  ExportMedicationChangeLogList,
} = require("../../../../common/hooks/UseApiCalls");
const {
  PrintAsPDF,
} = require("../../../../components/UserComponents/ReportGenerator");

describe("MedicationChangesLog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    GetMedicationChangeLogList.mockImplementation(() => {
      return Promise.resolve({
        data: {
          data: {
            medicationHistory: [],
            pagination: { totalPages: 0 },
          },
        },
      });
    });
  });

  it("renders loader and empty state", async () => {
    GetMedicationChangeLogList.mockResolvedValueOnce({
      data: { data: { medicationHistory: [], pagination: { totalPages: 0 } } },
    });

    render(<MedicationChangesLog />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("There are no medication changes yet")
      ).toBeInTheDocument();
      expect(screen.getByAltText("NoLogFound")).toBeInTheDocument();
    });
  });

  it("renders medication change log table", async () => {
    GetMedicationChangeLogList.mockResolvedValue({
      data: {
        data: {
          medicationHistory: [
            {
              date: "2024-01-01T10:00:00Z",
              medication: "Aspirin",
              update: "Dose increased",
              details: "Increased from 50mg to 100mg",
              changedBy: "Dr. Smith",
              notes: "Patient tolerated well",
            },
          ],
          pagination: { totalPages: 1 },
        },
      },
    });

    render(<MedicationChangesLog />);
    await waitFor(() => {
      expect(screen.getByText("Medication change log")).toBeInTheDocument();
      expect(screen.getByText("Aspirin")).toBeInTheDocument();
      expect(screen.getByText("Dose increased")).toBeInTheDocument();
      expect(
        screen.getByText("Increased from 50mg to 100mg")
      ).toBeInTheDocument();
      expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
    });
  });

  it("expands accordion to show notes", async () => {
    GetMedicationChangeLogList.mockResolvedValue({
      data: {
        data: {
          medicationHistory: [
            {
              date: "2024-01-01T10:00:00Z",
              medication: "Aspirin",
              update: "Dose increased",
              details: "Increased from 50mg to 100mg",
              changedBy: "Dr. Smith",
              notes: "Patient tolerated well",
            },
          ],
          pagination: { totalPages: 1 },
        },
      },
    });

    render(<MedicationChangesLog />);
    await waitFor(() => {
      expect(screen.getByText("Aspirin")).toBeInTheDocument();
    });

    // Click all buttons to ensure the accordion expands
    screen.getAllByRole("button").forEach((btn) => fireEvent.click(btn));

    await waitFor(() => {
      expect(screen.getByText(/Patient tolerated well/)).toBeInTheDocument();
    });
  });

  it("collapses accordion when clicking the same row again", async () => {
    GetMedicationChangeLogList.mockResolvedValue({
      data: {
        data: {
          medicationHistory: [
            {
              date: "2024-01-01T10:00:00Z",
              medication: "Aspirin",
              update: "Dose increased",
              details: "Increased from 50mg to 100mg",
              changedBy: "Dr. Smith",
              notes: "Patient tolerated well",
            },
          ],
          pagination: { totalPages: 1 },
        },
      },
    });
    render(<MedicationChangesLog />);
    await waitFor(() => {
      expect(screen.getByText("Aspirin")).toBeInTheDocument();
    });
    const rows = screen.getAllByRole("row");
    const firstRow = rows[1]; // rows[0] is header
    const expandBtn = within(firstRow).getByRole("button");
    fireEvent.click(expandBtn); // expand
    // Debug output after click
    // eslint-disable-next-line no-console
    screen.debug();
    await waitFor(() => {
      expect(screen.getByTestId("med-label-value")).toHaveTextContent(
        "Patient tolerated well"
      );
    });
    fireEvent.click(expandBtn); // collapse
    await waitFor(() => {
      expect(screen.queryByTestId("med-label-value")).not.toBeInTheDocument();
    });
  });

  it("calls export and PDF print", async () => {
    GetMedicationChangeLogList.mockResolvedValue({
      data: {
        data: {
          medicationHistory: [
            {
              date: "2024-01-01T10:00:00Z",
              medication: "Aspirin",
              update: "Dose increased",
              details: "Increased from 50mg to 100mg",
              changedBy: "Dr. Smith",
              notes: "Patient tolerated well",
            },
          ],
          pagination: { totalPages: 1 },
        },
      },
    });
    ExportMedicationChangeLogList.mockResolvedValue({
      data: { some: "pdf-data" },
    });

    render(<MedicationChangesLog />);
    await waitFor(() => {
      expect(screen.getByText("Export")).toBeInTheDocument();
    });

    const exportBtn = screen.getByText("Export");
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(ExportMedicationChangeLogList).toHaveBeenCalled();
      expect(PrintAsPDF).toHaveBeenCalledWith(
        { some: "pdf-data" },
        "MEDICATION CHANGE LOG"
      );
    });
  });

  it("disables export button when there is no data", async () => {
    GetMedicationChangeLogList.mockResolvedValue({
      data: {
        data: {
          medicationHistory: [],
          pagination: { totalPages: 0 },
        },
      },
    });
    render(<MedicationChangesLog />);
    await waitFor(() => {
      const exportBtn = screen.getByText("Export");
      expect(exportBtn).toBeDisabled();
    });
  });

  it("searches when typing in the search box", async () => {
    GetMedicationChangeLogList.mockResolvedValue({
      data: {
        data: {
          medicationHistory: [],
          pagination: { totalPages: 0 },
        },
      },
    });

    render(<MedicationChangesLog />);
    const searchInput = screen.getByPlaceholderText("Search by medication");
    fireEvent.change(searchInput, { target: { value: "aspirin" } });

    await waitFor(() => {
      expect(searchInput.value).toBe("aspirin");
    });
  });

  it("clears search and fetches all data", async () => {
    render(<MedicationChangesLog />);
    const searchInput = screen.getByPlaceholderText("Search by medication");
    fireEvent.change(searchInput, { target: { value: "aspirin" } });
    await waitFor(() => {
      expect(searchInput.value).toBe("aspirin");
    });
    // Simulate clear icon click
    const clearBtn = screen.getByTestId("clear-search-btn");
    fireEvent.click(clearBtn);
    await waitFor(() => {
      expect(GetMedicationChangeLogList).toHaveBeenCalled();
      expect(searchInput.value).toBe("");
    });
  });

  it("filters by date range", async () => {
    GetMedicationChangeLogList.mockResolvedValue({
      data: {
        data: {
          medicationHistory: [],
          pagination: { totalPages: 0 },
        },
      },
    });
    render(<MedicationChangesLog />);
    const startDateInput = screen.getByTestId("fromDate");
    const endDateInput = screen.getByTestId("toDate");
    fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });
    fireEvent.change(endDateInput, { target: { value: "2024-01-31" } });
    // Wait for debounce and API call
    await waitFor(() => {
      expect(GetMedicationChangeLogList).toHaveBeenCalled();
    });
  });

  it("fetches new data when pagination changes", async () => {
    GetMedicationChangeLogList.mockResolvedValue({
      data: {
        data: {
          medicationHistory: [],
          pagination: { totalPages: 2 },
        },
      },
    });
    render(<MedicationChangesLog />);
    await waitFor(() => {
      expect(GetMedicationChangeLogList).toHaveBeenCalled();
    });
    // Simulate pagination change
    const allButtons = screen.getAllByRole("button");
    const page2Btn = allButtons.find((btn) => btn.textContent === "2");
    fireEvent.click(page2Btn);
    await waitFor(() => {
      expect(GetMedicationChangeLogList).toHaveBeenCalledTimes(2);
    });
  });

  it("fetches new data when row count changes", async () => {
    GetMedicationChangeLogList.mockResolvedValue({
      data: {
        data: {
          medicationHistory: [],
          pagination: { totalPages: 2 },
        },
      },
    });
    render(<MedicationChangesLog />);
    await waitFor(() => {
      expect(GetMedicationChangeLogList).toHaveBeenCalled();
    });
    const listPaging = screen.getByTestId("list-paging");
    fireEvent.change(listPaging, { target: { value: 20 } });
    await waitFor(() => {
      expect(GetMedicationChangeLogList).toHaveBeenCalledTimes(2);
    });
  });
});
