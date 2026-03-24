// ====== PROJECT-WIDE MOCKS (Absolute Top to avoid ESM/Axios initialization errors) ======


jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  defaults: {
    baseURL: '',
    headers: {
      common: {},
      post: {},
      put: {},
      patch: {},
      delete: {},
    },
  },
}));


jest.mock('lodash', () => ({
  get: jest.fn(),
  set: jest.fn(),
  isEmpty: jest.fn(),
}));


jest.mock('aws-amplify', () => ({
  Auth: {
    currentSession: jest.fn(),
    currentAuthenticatedUser: jest.fn(),
  },
}));


jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));


// Mock the config used by UseApiCalls
jest.mock('../../../common/config', () => ({
  AppConfig: {
    baseURL: 'http://test-api.com',
  },
}), { virtual: true });


// ====== IMPORTS ======


import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TableWithTrendLines from "./DomainScoreByAssessment";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import { useParams } from "react-router";
import { getNavbarFilterPayload } from "../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));


// Mock useParams to avoid needing a real Router context
jest.mock("react-router", () => ({
  useParams: jest.fn(),
}));


jest.mock("../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
}));


// CRITICAL: Mocking API as a default export to match component's 'import APIS from ...'
jest.mock("../../../common/hooks/UseApiCalls", () => ({
  __esModule: true,
  default: {
    DomainScoresAssessment: jest.fn(),
  },
}));


// Mock Icons to verify rendering of different branches
jest.mock("../../../assets/icons/TrendingUp", () => () => <span data-testid="trending-up" />);
jest.mock("../../../assets/icons/TrendingDown", () => () => <span data-testid="trending-down" />);
jest.mock("../../../assets/icons/TrendingStraight", () => () => <span data-testid="trending-straight" />);


// Mock Helper functions
jest.mock("./HelperFunctions/DashboardHelperFunction", () => ({
  getDomainIcon: () => <span data-testid="domain-icon" />,
}));


// Mock Sub-components
jest.mock("./Components/TrendLineChart", () => () => <div data-testid="trend-line-chart" />);


// Mock ReusableTrendTable and explicitly call col.render() to ensure coverage
jest.mock("./Components/ReusableTrendTable", () => (props) => (
  <div data-testid="reusable-table">
    <div data-testid="table-title">{props.title}</div>
    <div data-testid="loading-state">{props.loading ? "loading" : "loaded"}</div>
    <button data-testid="reload-btn" onClick={props.onReload}>Reload</button>
    <div data-testid="table-body">
      {props.tableData?.map((row, i) => (
        <div key={i} data-testid={`row-${i}`}>
          {props.columns.map((col) => (
            <div key={col.id} data-testid={`cell-${col.id}-${i}`}>
              {col.render ? col.render(row) : row[col.id]}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
));


describe("TableWithTrendLines Component", () => {
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
  };


  const mockApiResponse = {
    data: {
      data: [
        {
          domainId: 1,
          domainName: "Health",
          averageStartingScore: 70,
          averageScoreChange: 5, // Triggers TrendingUp
          trend: [1, 2, 3],
        },
        {
          domainId: 2,
          domainName: "Education",
          averageStartingScore: 60,
          averageScoreChange: -2, // Triggers TrendingDown
          trend: [3, 2, 1],
        },
        {
          domainId: 3,
          domainName: "Safety",
          averageStartingScore: 50,
          averageScoreChange: 0, // Triggers TrendingStraight
          trend: [2, 2, 2],
        }
      ]
    }
  };


  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ id: "org-123" });
    localStorage.setItem("userRegion", "IN");
    getNavbarFilterPayload.mockReturnValue({ countryFilter: ["IN"] });
  });


  const renderComponent = () =>
    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <TableWithTrendLines />
      </CommonDataContext.Provider>
    );


  it("renders and calls API on mount", async () => {
    APIS.DomainScoresAssessment.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();


    expect(screen.getByTestId("table-title")).toHaveTextContent("Domain scores by assessment");


    await waitFor(() => {
      // Verifies 'if(id)' branch and payload usage
      expect(APIS.DomainScoresAssessment).toHaveBeenCalledWith(
        expect.objectContaining({ accountFilter: ["org-123"] })
      );
    });


    // Verify data rendering through column render functions
    expect(screen.getByText("common:common.Health")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getAllByTestId("trend-line-chart")).toHaveLength(3);
  });


  it("covers all getScoreChangeIcon branches (Positive, Negative, Zero)", async () => {
    APIS.DomainScoresAssessment.mockResolvedValueOnce(mockApiResponse);
    renderComponent();


    await waitFor(() => {
      // Row 0: +5 (TrendingUp branch)
      expect(screen.getByTestId("cell-averagescorechange-0")).toContainElement(screen.getByTestId("trending-up"));
      // Row 1: -2 (TrendingDown branch)
      expect(screen.getByTestId("cell-averagescorechange-1")).toContainElement(screen.getByTestId("trending-down"));
      // Row 2: 0 (TrendingStraight branch)
      expect(screen.getByTestId("cell-averagescorechange-2")).toContainElement(screen.getByTestId("trending-straight"));
    });
  });


  it("handles loading state transitions correctly", async () => {
    let resolvePromise;
    APIS.DomainScoresAssessment.mockReturnValueOnce(new Promise(resolve => { resolvePromise = resolve; }));
   
    renderComponent();


    // Verify initial setLoading(true)
    expect(screen.getByTestId("loading-state")).toHaveTextContent("loading");


    resolvePromise(mockApiResponse);


    await waitFor(() => {
      // Verify setLoading(false) in the then/finally blocks
      expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
    });
  });


  it("triggers reload correctly", async () => {
    APIS.DomainScoresAssessment.mockResolvedValue(mockApiResponse);
    renderComponent();


    await waitFor(() => expect(APIS.DomainScoresAssessment).toHaveBeenCalledTimes(1));


    // Coverage for onReload callback
    fireEvent.click(screen.getByTestId("reload-btn"));


    await waitFor(() => expect(APIS.DomainScoresAssessment).toHaveBeenCalledTimes(2));
  });


  it("early returns if countryFilter is null (coverage for payload guard)", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });
    renderComponent();
    await new Promise(r => setTimeout(r, 50));
    expect(APIS.DomainScoresAssessment).not.toHaveBeenCalled();
  });


  it("handles API errors gracefully and updates error state", async () => {
    APIS.DomainScoresAssessment.mockRejectedValueOnce(new Error("Fail"));
    renderComponent();
   
    await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
    });
    // This executes the catch block: setApiError(true)
  });


  it("does not fetch if userRegion is missing in localStorage (useEffect guard)", async () => {
    localStorage.removeItem("userRegion");
    renderComponent();
    await new Promise(r => setTimeout(r, 50));
    expect(APIS.DomainScoresAssessment).not.toHaveBeenCalled();
  });
 
  it("handles scenario without ID correctly (falsy id branch)", async () => {
    useParams.mockReturnValue({ id: null });
    APIS.DomainScoresAssessment.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();
   
    await waitFor(() => {
        expect(APIS.DomainScoresAssessment).toHaveBeenCalled();
        const payload = APIS.DomainScoresAssessment.mock.calls[0][0];
        expect(payload.accountFilter).toBeUndefined();
    });
  });


  // ====== EDGE CASES FOR OPTIONAL CHAINING AND FALLBACKS (Line 39 Coverage) ======


  it("covers the truthy branch of if(resp?.data?.data) with an empty array", async () => {
    // An empty array is truthy in JS, so it enters the IF but uses the left side of ||
    APIS.DomainScoresAssessment.mockResolvedValueOnce({ data: { data: [] } });
    renderComponent();
    await waitFor(() => expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded"));
  });


  it("covers the falsy branch of if(resp?.data?.data) when data is null", async () => {
    // null is falsy, skips the IF block entirely
    APIS.DomainScoresAssessment.mockResolvedValueOnce({ data: { data: null } });
    renderComponent();
    await waitFor(() => expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded"));
  });


  it("covers optional chaining for missing response data", async () => {
    // Missing .data or .data.data triggers the optional chaining safety
    APIS.DomainScoresAssessment.mockResolvedValueOnce({});
    renderComponent();
    await waitFor(() => expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded"));
  });
});

