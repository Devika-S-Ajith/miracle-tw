import { render, screen, waitFor } from "@testing-library/react";
import AverageThriveScaleScores from "./AverageThriveScaleScores";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useParams } from "react-router";
import { getNavbarFilterPayload } from "../../../constants";


// --- Mocks ---


// Mock react-router to control the 'id' parameter
jest.mock("react-router", () => ({
  useParams: jest.fn(() => ({ id: null })),
}));


// Mock AWS Amplify Auth
jest.mock("@aws-amplify/auth", () => ({
  Auth: {
    currentSession: jest.fn(() =>
      Promise.resolve({
        getIdToken: () => ({ getJwtToken: () => "mock-jwt-token" }),
      })
    ),
    currentAuthenticatedUser: jest.fn(() => Promise.resolve({})),
  },
}));


// UPDATED MOCK: Now invokes the hoverComponent to cover internal statements/functions
jest.mock("../../../components/Barchart/Barchart", () => (props) => (
  <div data-testid="BarChartGraph">
    <div data-testid="loading-status">{props.loading ? "loading" : "loaded"}</div>
    <div data-testid="chart-props">{JSON.stringify({ data: props.data, categories: props.categories })}</div>
   
    {/* Trigger the internal hover component to cover its JSX logic */}
    {props.data && props.data.length > 0 && props.hoverComponent && (
      <div data-testid="hover-trigger">
        {props.hoverComponent({
          longLabel: "Test Assessment",
          familyCount: 10,
          childCount: 20,
          percentage: "75%",
          total: 30,
          hoveredCategory: { name: "Safe" },
          categories: [
            { label: "Thriving", name: "Thriving", value: 5, color: "blue" },
            { label: "Safe", name: "Safe", value: 15, color: "green" }
          ]
        })}
      </div>
    )}
  </div>
));


jest.mock("../../../components/SmallText/SmallText", () => (props) => (
  <span data-testid="small-text">{props.value}</span>
));


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));


jest.mock("../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
}));


const mockGetGovtDashboardAverageAssessmentScores = jest.fn();
jest.mock("../../../common/hooks/UseApiCalls", () => ({
  __esModule: true,
  default: {
    GetGovtDashboardAverageAssessmentScores: (...args) =>
      mockGetGovtDashboardAverageAssessmentScores(...args),
  },
}));


// --- Test Suite ---


describe("AverageThriveScaleScores", () => {
  const mockContextValue = {
    navbarFilterValues: { region: "test-region" },
    linkedAccounts: [],
  };


  const apiData = [
    {
      assessmentNo: 1,
      averageThrivescalePercent: 75,
      totalCount: 100,
      childCount: 60,
      familyCount: 40,
      thrivingPercent: 40,
      safePercent: 30,
      vulnerablePercent: 20,
      inCrisisPercent: 10,
    },
  ];


  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "userRegion") return "test-region";
      return null;
    });
    // Default valid payload
    getNavbarFilterPayload.mockReturnValue({ countryFilter: "test-country" });
    useParams.mockReturnValue({ id: null });
  });


  it("renders loading state initially and handles success", async () => {
    mockGetGovtDashboardAverageAssessmentScores.mockResolvedValue({
      data: { data: apiData },
    });


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <AverageThriveScaleScores />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });


    // Verifies data mapping (A1 label)
    const chartProps = JSON.parse(screen.getByTestId("chart-props").textContent);
    expect(chartProps.data[0].label).toBe("A1");
    expect(chartProps.data[0].barHeightValue).toBe(75);
  });


  // FIX FOR: if (id) { payload.accountFilter = [id]; }
  it("applies account filter when id is present in params", async () => {
    useParams.mockReturnValue({ id: "org-123" });
    mockGetGovtDashboardAverageAssessmentScores.mockResolvedValue({ data: { data: apiData } });


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <AverageThriveScaleScores />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
      expect(mockGetGovtDashboardAverageAssessmentScores).toHaveBeenCalledWith(
        expect.objectContaining({ accountFilter: ["org-123"] })
      );
    });
  });


  // FIX FOR: if (payload.countryFilter === null || payload.countryFilter === undefined)
  it("returns early if countryFilter is missing", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <AverageThriveScaleScores />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
        expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });
    expect(mockGetGovtDashboardAverageAssessmentScores).not.toHaveBeenCalled();
  });


  it("handles API error gracefully and covers catch block", async () => {
    mockGetGovtDashboardAverageAssessmentScores.mockRejectedValue(new Error("API Error"));


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <AverageThriveScaleScores />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });
  });


  // FIX FOR: popperData mapping and hover component logic
  it("covers the hover component rendering logic", async () => {
    mockGetGovtDashboardAverageAssessmentScores.mockResolvedValue({ data: { data: apiData } });


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <AverageThriveScaleScores />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
      // Use function matchers for complex text containing special characters (|) and i18n keys
      expect(screen.getByText(/Test Assessment/)).toBeInTheDocument();
     
      expect(screen.getByText((content) =>
        content.includes("10") &&
        content.includes("Families") &&
        content.includes("|") &&
        content.includes("20") &&
        content.includes("Children")
      )).toBeInTheDocument();


      expect(screen.getByText((content) =>
        content.includes("Average Thrive Scale Scores") &&
        content.includes("75%")
      )).toBeInTheDocument();


      // Verifies category mapping inside hover component (e.g., "15% Safe")
      expect(screen.getByText((content) =>
        content.includes("15%") &&
        content.includes("Safe")
      )).toBeInTheDocument();
    });
  });


  it("does not call API if userRegion is missing in localStorage", async () => {
    Storage.prototype.getItem.mockReturnValue(null);


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <AverageThriveScaleScores />
      </CommonDataContext.Provider>
    );


    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetGovtDashboardAverageAssessmentScores).not.toHaveBeenCalled();
  });


  // NEW: FIX FOR averageThriveScaleScoresRawData fallback []
  it("covers fallback empty array when response data is missing", async () => {
    mockGetGovtDashboardAverageAssessmentScores.mockResolvedValue({
      data: { data: null }, // This triggers the || []
    });


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <AverageThriveScaleScores />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });


    const chartProps = JSON.parse(screen.getByTestId("chart-props").textContent);
    expect(chartProps.data).toEqual([]); // Confirms chart data is an empty array
  });


  // NEW: FIX FOR payload fallback {}
  it("covers fallback empty object when payload is missing", async () => {
    getNavbarFilterPayload.mockReturnValue(null); // This triggers the || {}


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <AverageThriveScaleScores />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });


    // If payload is {}, payload.countryFilter is undefined, causing early return
    expect(mockGetGovtDashboardAverageAssessmentScores).not.toHaveBeenCalled();
  });
});

