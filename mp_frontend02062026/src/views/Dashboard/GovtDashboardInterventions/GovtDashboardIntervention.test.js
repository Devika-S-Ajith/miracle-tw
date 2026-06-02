// ====== PROJECT-WIDE MOCKS ======
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    defaults: {
      baseURL: '',
      headers: {
        common: {},
        post: {},
        put: {},
        patch: {},
        delete: {}
      }
    }
  })),
  defaults: {
    baseURL: 'http://test-api.com',
    headers: {
      common: {},
      post: { 'Content-Type': 'application/json' },
      put: { 'Content-Type': 'application/json' },
      patch: { 'Content-Type': 'application/json' },
      delete: {}
    }
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));


jest.mock('../../../common/config', () => ({
  AppConfig: { baseURL: 'http://test-api.com' }
}));


// ====== IMPORTS ======
import React from "react";
import { render, screen, waitFor, fireEvent, act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import GovtDashboardIntervention from "./GovtDashboardIntervention";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import { useNavigate } from "react-router";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import {
  getNavbarFilterPayload,
  BreadcrumbsLinkThriveScale,
  BreadcrumbsLinkThriveScaleGovtDashboard
} from "../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======
const stableTFunction = (key, options) => {
  const translations = {
    "common:common.Interventions": "Interventions",
    "common:infoCard.Best and worst interventions": "Best and worst interventions",
  };
  if (options && options.defaultValue) return options.defaultValue;
  return translations[key] || key;
};


jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: stableTFunction }),
}));


jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}));


jest.mock("../../../common/hooks/UseApiCalls", () => ({
  GetBestAndWorstInterventions: jest.fn(),
  UpdateDashboardDataViews: jest.fn(),
}));


jest.mock("../../../components/UserComponents/useAuthorization", () => jest.fn());


// Track which breadcrumb function was called
let breadcrumbFunctionUsed = null;


jest.mock("../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
  BreadcrumbsLinkThriveScale: jest.fn(() => ({ label: "Standard Breadcrumb", link: "/" })),
  BreadcrumbsLinkThriveScaleGovtDashboard: jest.fn(() => ({ label: "Gov Breadcrumb", link: "/gov" })),
}));


jest.mock("../GovtDashboardOverview/NavbarFilterChipArray", () => () => (
  <div data-testid="navbar-chips" aria-label="Navigation filter chips" />
));


// FIXED: Correct mock syntax with props parameter
jest.mock("../Components/StateGovDashboardComponents/OrganizationOverviewCard", () => (props) => (
  <div data-testid="overview-card">
    <h3 data-testid="card-title">{props.title}</h3>
    <div data-testid="loading-status">{props.loading ? "loading" : "loaded"}</div>
    <div data-testid="error-status">{props.apiError ? "error" : "none"}</div>
    <button data-testid="reload-btn" onClick={props.onReload}>Reload</button>
    <div data-testid="data-length">{props.data?.length || 0} items</div>
    <ul data-testid="summary-data">
      {props.data?.map((item, i) => (
        <li key={i} data-testid={`data-item-${i}`}>
          {typeof item.label === 'string' ? item.label : "Component Label"}
        </li>
      ))}
    </ul>
  </div>
));


jest.mock("./Components/AllInterventions", () => () => (
  <div data-testid="all-interventions" aria-label="All interventions chart" />
));


// Fixed PageBreadcrumbs mock
jest.mock("../../../components/PageBreadcrumbs/PageBreadcrumbs", () => (props) => (
  <nav data-testid="page-breadcrumbs" aria-label="Breadcrumb navigation">
    {props.data?.map((item, idx) => (
      <span key={idx} data-testid={`breadcrumb-${idx}`}>
        {item?.label || "No Label"}
      </span>
    ))}
  </nav>
));


describe("GovtDashboardIntervention Component", () => {
  const mockNavigate = jest.fn();
  const defaultContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
    signedinOrgType: "1",
    signedinUserRoleHT: "admin",
  };


  const mockApiResponse = {
    data: {
      data: [
        { intervention: "Counseling", average_rating: 4.5 },
        { intervention: "Education Support", average_rating: 2.5 },
      ],
    },
  };


  let localStorageMock;
  let consoleErrorSpy;


  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
   
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
   
    localStorageMock = {
      getItem: jest.fn((key) => {
        if (key === "userRegion") return "IN";
        if (key === "orgId") return "org-123";
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });


    getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
    APIS.GetBestAndWorstInterventions.mockResolvedValue(mockApiResponse);
    APIS.UpdateDashboardDataViews.mockResolvedValue({});
  });


  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockRestore();
  });


  const renderComponent = async (context = defaultContextValue) => {
    let result;
    await act(async () => {
      result = render(
        <CommonDataContext.Provider value={context}>
          <BrowserRouter>
            <GovtDashboardIntervention />
          </BrowserRouter>
        </CommonDataContext.Provider>
      );
    });
    return result;
  };


  // ====== CORE FUNCTIONALITY TESTS ======
 
  it("performs mount lifecycle: initializes and fetches data successfully", async () => {
    await renderComponent();


    // Verify authorization
    expect(useAuthorization).toHaveBeenCalledWith(
      "admin",
      null,
      "1",
      "GOVTDashboardInterventions",
      true
    );


    // Verify API calls
    expect(APIS.UpdateDashboardDataViews).toHaveBeenCalled();
   
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });


    // Verify data display
    expect(screen.getByTestId("data-length")).toHaveTextContent("2 items");
    expect(screen.getByText("Counseling")).toBeInTheDocument();
    expect(screen.getByText("Education Support")).toBeInTheDocument();
  });


  it("handles API error and recovery via reload", async () => {
    APIS.GetBestAndWorstInterventions.mockRejectedValueOnce(new Error("API Failed"));


    await renderComponent();


    // Should show error state
    await waitFor(() => {
      expect(screen.getByTestId("error-status")).toHaveTextContent("error");
    });


    // Reset mock and simulate retry
    APIS.GetBestAndWorstInterventions.mockResolvedValueOnce(mockApiResponse);
    fireEvent.click(screen.getByTestId("reload-btn"));


    // Should recover and show data
    await waitFor(() => {
      expect(screen.getByTestId("error-status")).toHaveTextContent("none");
      expect(screen.getByText("Counseling")).toBeInTheDocument();
    });
  });


  // ====== CONDITIONAL LOGIC TESTS ======
 
  it("early returns and skips fetch if countryFilter is null", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });


    await renderComponent();
   
    expect(APIS.GetBestAndWorstInterventions).not.toHaveBeenCalled();
   
    // Should show no data
    expect(screen.getByTestId("data-length")).toHaveTextContent("0 items");
  });


  it("uses gov breadcrumbs for org type 6", async () => {
    // Explicitly set return value for the gov breadcrumb mock
    BreadcrumbsLinkThriveScaleGovtDashboard.mockReturnValue({ label: "Gov Breadcrumb", link: "/gov" });
   
    await renderComponent({ ...defaultContextValue, signedinOrgType: "6" });
   
    expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Gov Breadcrumb");
    expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Interventions");
  });


  it("uses standard breadcrumbs for non-gov org types", async () => {
    // Explicitly set return value for the standard breadcrumb mock
    BreadcrumbsLinkThriveScale.mockReturnValue({ label: "Standard Breadcrumb", link: "/" });
   
    await renderComponent({ ...defaultContextValue, signedinOrgType: "1" });
   
    expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Standard Breadcrumb");
    expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Interventions");
  });
 
  it("handles UpdateDashboardDataViews error silently", async () => {
    APIS.UpdateDashboardDataViews.mockRejectedValueOnce(new Error("Update failed"));
   
    await renderComponent();
   
    // Should still render without crashing
    expect(screen.getByTestId("page-breadcrumbs")).toBeInTheDocument();
    // The error should be caught and console.error should be called
    expect(consoleErrorSpy).toHaveBeenCalled();
  });


  it("applies accountFilter for standard org types", async () => {
    await renderComponent({ ...defaultContextValue, signedinOrgType: "1" });
   
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });
   
    expect(APIS.GetBestAndWorstInterventions).toHaveBeenCalledWith(
      expect.objectContaining({
        countryFilter: "IN",
        accountFilter: ["org-123"]
      })
    );
  });


  it("excludes accountFilter for org type 6", async () => {
    await renderComponent({ ...defaultContextValue, signedinOrgType: "6" });
   
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });
   
    expect(APIS.GetBestAndWorstInterventions).toHaveBeenCalledWith(
      expect.objectContaining({
        countryFilter: "IN"
      })
    );
   
    // Should NOT have accountFilter
    const lastCall = APIS.GetBestAndWorstInterventions.mock.calls[0];
    expect(lastCall[0]).not.toHaveProperty('accountFilter');
  });


  // ====== EDGE CASE TESTS ======
 
  it("handles null response.data.data gracefully", async () => {
    APIS.GetBestAndWorstInterventions.mockResolvedValueOnce({
      data: { data: null }
    });


    await renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });
   
    expect(screen.getByTestId("data-length")).toHaveTextContent("0 items");
    expect(screen.getByTestId("summary-data")).toBeEmptyDOMElement();
  });


  it("handles empty array response", async () => {
    APIS.GetBestAndWorstInterventions.mockResolvedValueOnce({
      data: { data: [] }
    });


    await renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });
   
    expect(screen.getByTestId("data-length")).toHaveTextContent("0 items");
  });


  it("does not fetch if userRegion is missing", async () => {
    localStorageMock.getItem.mockImplementation((key) =>
      key === "userRegion" ? null : "val"
    );
   
    await renderComponent();
   
    expect(APIS.GetBestAndWorstInterventions).not.toHaveBeenCalled();
    expect(screen.getByTestId("data-length")).toHaveTextContent("0 items");
  });


  it("handles missing orgId for non-type-6 orgs", async () => {
    localStorageMock.getItem.mockImplementation((key) =>
      key === "userRegion" ? "IN" : null  // orgId is null
    );
   
    await renderComponent({ ...defaultContextValue, signedinOrgType: "1" });
   
    // Should still fetch but with null orgId in accountFilter
    expect(APIS.GetBestAndWorstInterventions).toHaveBeenCalledWith(
      expect.objectContaining({
        accountFilter: [null]
      })
    );
  });


  // ====== DEPENDENCY CHANGE TESTS ======
 
  it("refetches when navbarFilterValues changes", async () => {
    const { rerender } = await renderComponent();
   
    // Initial fetch
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });
   
    // Clear mock to track new calls
    jest.clearAllMocks();
    APIS.GetBestAndWorstInterventions.mockResolvedValue(mockApiResponse);
   
    // Simulate navbar filter change by rerendering with new context
    await act(async () => {
      rerender(
        <CommonDataContext.Provider value={{
          ...defaultContextValue,
          navbarFilterValues: ['new-filter']
        }}>
          <BrowserRouter>
            <GovtDashboardIntervention />
          </BrowserRouter>
        </CommonDataContext.Provider>
      );
    });
   
    // Should refetch with new filters
    expect(APIS.GetBestAndWorstInterventions).toHaveBeenCalled();
  });


  // ====== LAYOUT AND UI TESTS ======
 
  it("renders all required components", async () => {
    await renderComponent();
   
    expect(screen.getByTestId("page-breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-chips")).toBeInTheDocument();
    expect(screen.getByTestId("overview-card")).toBeInTheDocument();
    expect(screen.getByTestId("all-interventions")).toBeInTheDocument();
  });


  it("displays correct title for organization overview card", async () => {
    await renderComponent();
   
    expect(screen.getByTestId("card-title")).toHaveTextContent(
      "Best and worst interventions"
    );
  });


  // ====== CONSOLE ERROR CHECK ======
 
  it("has no console errors during successful render", async () => {
    await renderComponent();
   
    // Wait for async operations
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });
   
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});

