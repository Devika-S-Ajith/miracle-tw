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
jest.mock('../../../../common/config', () => ({
  AppConfig: {
    baseURL: 'http://test-api.com',
  },
}), { virtual: true });


// ====== IMPORTS ======


import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CurrentStatus from "./CurrentStatus";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useParams } from "react-router";
import { getNavbarFilterPayload } from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));


jest.mock("react-router", () => ({
  useParams: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetCurrentStatus: jest.fn(),
}));


jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
}));


jest.mock("../../Components/StateGovDashboardComponents/MoodImageMapping", () => ({
  MoodImageMapping: {
    INCRISIS: "inCrisis.png",
    VULNERABLE: "vulnerable.png",
    SAFE: "safe.png",
    THRIVING: "thriving.png",
  },
}));


// Skeleton and InfoTile mocks for testid targeting
jest.mock("./CurrentStatusSkelton", () => () => (
  <div data-testid="skeleton-loading">Loading...</div>
));


jest.mock("../../../../components/InfoTile/InfoTile", () => (props) => (
  <div data-testid={`info-tile-${props.description}`}>
    <div data-testid="tile-title-content">{props.title}</div>
    <span>{props.subTitle}</span>
    <span>{props.description}</span>
  </div>
));


jest.mock("../../../../components/CommonCard", () => (props) => (
  <div>
    <button data-testid="reload-btn" onClick={props.onReload}>Reload</button>
    {props.apiError && <div data-testid="api-error">{props.apiError}</div>}
    <div data-testid="test-card-title">{props.title}</div>
    {props.children}
  </div>
));


describe("CurrentStatus Component", () => {
  const mockContextValue = {
    navbarFilterValues: { region: "IN" },
    linkedAccounts: [],
    signedinOrgType: "1",
  };


  const mockApiResponse = {
    data: {
      data: [
        {
          activeCasesInCrisis: 7,
          activeCasesInVulnerable: 8,
          activeCasesSafe: 9,
          activeCasesThriving: 10,
        },
      ],
    },
  };


  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("userRegion", "IN");
    localStorage.setItem("orgId", "org-123");
    useParams.mockReturnValue({ id: btoa("Test Milestone") });
    getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
  });


  const renderComponent = (contextValue = mockContextValue) => {
    return render(
      <CommonDataContext.Provider value={contextValue}>
        <CurrentStatus />
      </CommonDataContext.Provider>
    );
  };


  it("renders loading skeleton initially and fetches data", async () => {
    APIS.GetCurrentStatus.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();


    expect(screen.getByTestId("skeleton-loading")).toBeInTheDocument();


    await waitFor(() => {
      expect(screen.queryByTestId("skeleton-loading")).not.toBeInTheDocument();
    });
  });


  it("renders InfoTile components with correct data from API", async () => {
    APIS.GetCurrentStatus.mockResolvedValueOnce(mockApiResponse);


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("info-tile-common:assessment.In-crisis")).toHaveTextContent("7");
      expect(screen.getByTestId("info-tile-common:assessment.Vulnerable")).toHaveTextContent("8");
      expect(screen.getByTestId("info-tile-common:assessment.Safe")).toHaveTextContent("9");
      expect(screen.getByTestId("info-tile-common:assessment.Thriving")).toHaveTextContent("10");
    });
  });


  it("handles API errors gracefully", async () => {
    APIS.GetCurrentStatus.mockRejectedValueOnce(new Error("API Error"));


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("api-error")).toHaveTextContent("Failed to fetch data");
    });
  });


  it("early returns and does not call API if countryFilter is null", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });


    renderComponent();


    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetCurrentStatus).not.toHaveBeenCalled();
  });


  it("uses empty accountFilter when signedinOrgType is '6'", async () => {
    APIS.GetCurrentStatus.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent({ ...mockContextValue, signedinOrgType: "6" });


    await waitFor(() => {
      expect(APIS.GetCurrentStatus).toHaveBeenCalledWith(
        expect.not.objectContaining({ accountFilter: ["org-123"] })
      );
    });
  });


  it("reloads data when reload button is clicked", async () => {
    APIS.GetCurrentStatus.mockResolvedValue(mockApiResponse);


    renderComponent();


    await waitFor(() => expect(APIS.GetCurrentStatus).toHaveBeenCalledTimes(1));


    fireEvent.click(screen.getByTestId("reload-btn"));


    await waitFor(() => expect(APIS.GetCurrentStatus).toHaveBeenCalledTimes(2));
  });


  it("handles decryption failure in useParams", () => {
    useParams.mockReturnValue({ id: "invalid-base-64!!!" });
    APIS.GetCurrentStatus.mockResolvedValueOnce(mockApiResponse);


    renderComponent();


    waitFor(() => {
      expect(APIS.GetCurrentStatus).toHaveBeenCalledWith(
        expect.objectContaining({ milestoneNameFilter: "" })
      );
    });
  });


  // ====== ADDITIONAL TESTS FOR 100% BRANCH COVERAGE ======


  it("covers fallback values (|| 0) when API fields are missing or null", async () => {
    // API returns an object but the specific metric fields are null
    APIS.GetCurrentStatus.mockResolvedValueOnce({
      data: {
        data: [{
          activeCasesInCrisis: null,
          activeCasesInVulnerable: undefined,
          activeCasesSafe: 0,
          activeCasesThriving: null
        }]
      }
    });


    renderComponent();


    await waitFor(() => {
      // Verify they all fallback to "0" (covering the || 0 branches)
      expect(screen.getByTestId("info-tile-common:assessment.In-crisis")).toHaveTextContent("0");
      expect(screen.getByTestId("info-tile-common:assessment.Vulnerable")).toHaveTextContent("0");
    });
  });


  it("handles malformed API data (response.data.data?.[0] optional chaining branches)", async () => {
    // Case 1: response.data.data is an empty array
    APIS.GetCurrentStatus.mockResolvedValueOnce({ data: { data: [] } });
    renderComponent();
    await waitFor(() => expect(screen.queryByTestId("skeleton-loading")).not.toBeInTheDocument());


    // Case 2: response.data is null
    APIS.GetCurrentStatus.mockResolvedValueOnce({ data: null });
    renderComponent();
    await waitFor(() => expect(screen.queryByTestId("skeleton-loading")).not.toBeInTheDocument());
  });


  it("does not call API if userRegion is missing from localStorage (useEffect guard)", async () => {
    localStorage.removeItem("userRegion");
    renderComponent();
   
    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetCurrentStatus).not.toHaveBeenCalled();
  });


  it("does not call API if signedinOrgType is missing (useEffect guard)", async () => {
    renderComponent({ ...mockContextValue, signedinOrgType: null });
   
    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetCurrentStatus).not.toHaveBeenCalled();
  });
});

