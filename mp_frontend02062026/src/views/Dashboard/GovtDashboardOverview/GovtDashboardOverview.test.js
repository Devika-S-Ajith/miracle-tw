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
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GovtDashboardOverview from "./GovtDashboardOverview";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import { useNavigate, useParams } from "react-router";
import { useLocation } from "react-router-dom";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import { BreadcrumbsLinkThriveScaleGovtDashboard } from "../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    // Updated mock to return the translation key instead of the fallback string
    // This allows the tests to verify the correct key is being used.
    t: (key) => key,
  }),
}));


jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));


jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
}));


jest.mock("../../../common/hooks/UseApiCalls", () => ({
  UpdateDashboardDataViews: jest.fn(),
}));


jest.mock("../../../components/UserComponents/useAuthorization", () => jest.fn());


jest.mock("../../../constants", () => ({
  BreadcrumbsLinkThriveScaleGovtDashboard: jest.fn(() => ({ label: "Gov Dashboard", link: "/gov" })),
}));


// Mock Sub-components to isolate test
jest.mock("./OrganizationalOverview", () => () => <div data-testid="org-overview" />);
jest.mock("./AverageThriveScaleScores", () => () => <div data-testid="thrive-scores" />);
jest.mock("./NavbarFilterChipArray", () => () => <div data-testid="navbar-chips" />);
jest.mock("./DomainScoreByAssessment", () => () => <div data-testid="domain-scores" />);
jest.mock("./RedflagOverview", () => () => <div data-testid="redflag-overview" />);


jest.mock("../../../components/PageBreadcrumbs/PageBreadcrumbs", () => (props) => (
  <div data-testid="page-breadcrumbs">
    {props.data?.map((item, idx) => (
      <span key={idx} data-testid={`breadcrumb-item-${idx}`}>
        {item?.label || ""}
      </span>
    ))}
  </div>
));


describe("GovtDashboardOverview Component", () => {
  const mockNavigate = jest.fn();
  const mockContextValue = {
    signedinUserRoleHT: "admin",
    signedinOrgType: "1",
  };


  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: null });
    useLocation.mockReturnValue({ search: "" });
    BreadcrumbsLinkThriveScaleGovtDashboard.mockReturnValue({ label: "Gov Dashboard" });
  });


  const renderComponent = (contextValue = mockContextValue) => {
    return render(
      <CommonDataContext.Provider value={contextValue}>
        <GovtDashboardOverview />
      </CommonDataContext.Provider>
    );
  };


  it("renders correctly and initializes dashboard data", async () => {
    renderComponent();


    // Verify side effects
    expect(document.title).toBe("Dashboard | ThriveWell");
    expect(APIS.UpdateDashboardDataViews).toHaveBeenCalled();


    // Verify sub-components
    expect(screen.getByTestId("navbar-chips")).toBeInTheDocument();
    expect(screen.getByTestId("org-overview")).toBeInTheDocument();
    expect(screen.getByTestId("thrive-scores")).toBeInTheDocument();
    expect(screen.getByTestId("redflag-overview")).toBeInTheDocument();
    expect(screen.getByTestId("domain-scores")).toBeInTheDocument();
  });


  it("calls useAuthorization with correct parameters", () => {
    renderComponent();


    expect(useAuthorization).toHaveBeenCalledWith(
      "admin",
      null,
      "1",
      "GOVTOverview",
      true
    );
  });


  describe("Breadcrumbs logic", () => {
    it("renders 'Overview' breadcrumb when no ID is present", () => {
      useParams.mockReturnValue({ id: null });
      renderComponent();


      expect(screen.getByTestId("breadcrumb-item-1")).toHaveTextContent("common:common.Overview");
    });


    it("renders 'Organizations' breadcrumb when an ID is present", () => {
      useParams.mockReturnValue({ id: "org-123" });
      renderComponent();


      expect(screen.getByTestId("breadcrumb-item-1")).toHaveTextContent("common:common.Organizations");
    });


    it("includes accountName in breadcrumbs when provided in URL query", () => {
      useLocation.mockReturnValue({ search: "?accountName=Test%20Org" });
      renderComponent();


      // Third breadcrumb should be the accountName (which is passed as a direct label)
      expect(screen.getByTestId("breadcrumb-item-2")).toHaveTextContent("Test Org");
    });
  });


  it("handles API error in UpdateDashboardDataViews gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    APIS.UpdateDashboardDataViews.mockRejectedValueOnce(new Error("API Error"));


    renderComponent();


    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("UpdateDashboardDataViews error:", expect.any(Error));
    });
   
    consoleSpy.mockRestore();
  });
});

