import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import RedflagOverview from "./RedflagOverview";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useParams } from "react-router";
import * as APIS from "../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload } from "../../../constants";


// --- Mocks ---


// Mock react-router to control the 'id' parameter for organizational filtering
jest.mock("react-router", () => ({
  useParams: jest.fn(() => ({ id: null })),
}));


// Mock filter payload utility
jest.mock("../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
}));


// Mock InfoCard to verify data mapping and reload triggers
jest.mock("../../../components/InfoCard", () => ({ title, data, loading, apiError, onReload }) => (
  <div data-testid="info-card-mock">
    <h1>{title}</h1>
    <div data-testid="loading-status">{loading ? "loading" : "loaded"}</div>
    <div data-testid="error-status">{apiError ? "error-active" : "no-error"}</div>
    <button data-testid="reload-btn" onClick={onReload}>Reload</button>
    <ul data-testid="data-list">
      {data.map((item, idx) => (
        <li key={idx} data-testid={`item-${idx}`}>
          {item.label}: {item.value}
        </li>
      ))}
    </ul>
  </div>
));


// Mock API calls
jest.mock("../../../common/hooks/UseApiCalls", () => ({
  GetGovtDashboardRedflagOverview: jest.fn(),
}));


// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));


// --- Test Suite ---


describe("RedflagOverview Full Coverage", () => {
  const mockContextValue = {
    navbarFilterValues: { country: "US" },
    linkedAccounts: [],
  };


  const successApiResponse = {
    data: {
      data: [
        {
          familiesWithIncrisisRedflagMilestone: 5,
          familiesWithVulnerableRedflagMilestone: 8,
          totalFamily: 20,
          childrenWithIncrisisRedflagMilestone: 3,
          childrenWithVulnerableRedflagMilestone: 7,
          totalChildren: 25,
          activeRedflagInterventions: 10,
          completedRedflagInterventions: 15,
        },
      ],
    },
  };


  beforeEach(() => {
    jest.clearAllMocks();
    // Setup localStorage mock to pass the useEffect guard
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "userRegion") return "test-region";
      return null;
    });
    // Default valid payload
    getNavbarFilterPayload.mockReturnValue({ countryFilter: ["IN"] });
    useParams.mockReturnValue({ id: null });
  });


  afterEach(cleanup);


  const renderComponent = () =>
    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <RedflagOverview />
      </CommonDataContext.Provider>
    );


  it("renders and fetches red flag overview data successfully", async () => {
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValue(successApiResponse);


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });


    // Use function matchers to handle whitespace/special characters in labels
    expect(screen.getByText((content) =>
        content.includes("Families with active") &&
        content.includes("In crisis") &&
        content.includes("5 / 20")
    )).toBeInTheDocument();


    expect(screen.getByText(/Active red flag interventions: 10/)).toBeInTheDocument();
    expect(screen.getByText(/Completed red flag interventions: 15/)).toBeInTheDocument();
  });


  it("applies accountFilter when id is present in the URL path", async () => {
    useParams.mockReturnValue({ id: "org-789" });
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValue(successApiResponse);


    renderComponent();


    await waitFor(() => {
      expect(APIS.GetGovtDashboardRedflagOverview).toHaveBeenCalledWith(
        expect.objectContaining({ accountFilter: ["org-789"] })
      );
    });
  });


  it("handles API errors gracefully and updates error state", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    APIS.GetGovtDashboardRedflagOverview.mockRejectedValue(new Error("API Failure"));


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("error-status")).toHaveTextContent("error-active");
    });


    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });


  it("triggers a data re-fetch when the onReload function is called", async () => {
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValue(successApiResponse);
    renderComponent();


    await waitFor(() => expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded"));


    fireEvent.click(screen.getByTestId("reload-btn"));


    await waitFor(() => {
      expect(APIS.GetGovtDashboardRedflagOverview).toHaveBeenCalledTimes(2);
    });
  });


  it("skips API call if userRegion is missing from localStorage", async () => {
    Storage.prototype.getItem.mockReturnValue(null);


    renderComponent();


    // Small delay to ensure useEffect would have triggered if guard failed
    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetGovtDashboardRedflagOverview).not.toHaveBeenCalled();
  });


  it("uses fallback values (0) when API data fields are missing", async () => {
    // API returns empty object in data array to trigger overviewData?.[key] || 0 branches
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValue({
      data: { data: [{}] },
    });


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });


    expect(screen.getByText(/Active red flag interventions: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Completed red flag interventions: 0/)).toBeInTheDocument();
  });


  it("handles the else branch when response.data.data is empty", async () => {
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValue({
      data: { data: [] },
    });


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });


    const list = screen.getByTestId("data-list");
    expect(list).toBeEmptyDOMElement();
  });


  // --- REFINED: Exhaustive Optional Chaining and Branch Coverage ---
  // Split into separate blocks to avoid "Found multiple elements" errors for loading-status








  it("covers optional chaining branches (null response)", async () => {
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValueOnce(null);
    renderComponent();
    await waitFor(() => expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded"));
    expect(screen.getByTestId("data-list")).toBeEmptyDOMElement();
  });


  it("covers optional chaining branches (empty object response)", async () => {
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValueOnce({});
    renderComponent();
    await waitFor(() => expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded"));
    expect(screen.getByTestId("data-list")).toBeEmptyDOMElement();
  });


  it("covers optional chaining branches (null data array)", async () => {
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValueOnce({ data: { data: null } });
    renderComponent();
    await waitFor(() => expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded"));
    expect(screen.getByTestId("data-list")).toBeEmptyDOMElement();
  });


  it("covers fallback string templates when overviewData keys are missing", async () => {
    // Mocking an object where keys are missing to trigger overviewData?.key branches
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValue({
      data: {
        data: [
          {
            familiesWithIncrisisRedflagMilestone: undefined,
            totalFamily: null,
          }
        ]
      }
    });


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });


    // Use flexible matcher with unique identifiers to avoid "Found multiple elements"
    expect(screen.getByText((content) =>
        content.includes("Families with active") &&
        content.includes("“In crisis”") &&
        content.includes("undefined / null")
    )).toBeInTheDocument();


    expect(screen.getByText((content) =>
        content.includes("Families with active") &&
        content.includes("“Vulnerable”") &&
        content.includes("undefined / null")
    )).toBeInTheDocument();
  });


  it("handles when id is undefined/null specifically to cover falsy branch of if(id)", async () => {
    // useParams is already mocked to return id: null by default in beforeEach
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValue(successApiResponse);
   
    renderComponent();
   
    await waitFor(() => {
        expect(APIS.GetGovtDashboardRedflagOverview).toHaveBeenCalled();
        // Verify payload does NOT contain accountFilter
        const callArgs = APIS.GetGovtDashboardRedflagOverview.mock.calls[0][0];
        expect(callArgs.accountFilter).toBeUndefined();
    });
  });
});

