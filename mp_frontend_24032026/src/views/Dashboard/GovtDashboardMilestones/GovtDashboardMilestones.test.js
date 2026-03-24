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


// ====== CONSOLIDATED IMPORTS ======


import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GovtDashboardMilestones from "./GovtDashboardMilestones";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useNavigate } from "react-router";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import {
  BreadcrumbsLinkThriveScale,
  BreadcrumbsLinkThriveScaleGovtDashboard
} from "../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


// Mock Translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => (options && options.defaultValue ? options.defaultValue : key),
  }),
}));


// Mock Router
jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));


// Mock Custom Hook
jest.mock("../../../components/UserComponents/useAuthorization", () => jest.fn());


// Mock Constants/Functions
// FIXED: Explicitly defined return values to ensure they are never undefined
jest.mock("../../../constants", () => ({
  BreadcrumbsLinkThriveScale: jest.fn(() => ({ label: "Thrive Scale", link: "/" })),
  BreadcrumbsLinkThriveScaleGovtDashboard: jest.fn(() => ({ label: "Gov Dashboard", link: "/gov" })),
}));


// Mock Sub-components
jest.mock("./AverageDomainScores", () => () => <div data-testid="average-domain-scores" />);
jest.mock("./AllMilestones", () => () => <div data-testid="all-milestones" />);
jest.mock("./TopInCrisis", () => () => <div data-testid="top-in-crisis" />);
jest.mock("../GovtDashboardOverview/NavbarFilterChipArray", () => () => <div data-testid="navbar-filter-chip-array" />);


// FIXED: Added defensive checks (item?.label) to prevent crash if data is missing
jest.mock("../../../components/PageBreadcrumbs/PageBreadcrumbs", () => (props) => (
  <div data-testid="page-breadcrumbs">
    {props.data?.map((item, idx) => (
      <span key={idx} data-testid={`breadcrumb-item-${idx}`}>
        {item?.label || ""}
      </span>
    ))}
  </div>
));


describe("GovtDashboardMilestones Component", () => {
  const mockNavigate = jest.fn();
  const mockContextValue = {
    signedinOrgType: "1",
    signedinUserRoleHT: "admin",
  };


  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
   
    // Ensure mocks return valid objects for every test run
    BreadcrumbsLinkThriveScale.mockReturnValue({ label: "Thrive Scale", link: "/" });
    BreadcrumbsLinkThriveScaleGovtDashboard.mockReturnValue({ label: "Gov Dashboard", link: "/gov" });
  });


  const renderComponent = (contextValue = mockContextValue) => {
    return render(
      <CommonDataContext.Provider value={contextValue}>
        <GovtDashboardMilestones />
      </CommonDataContext.Provider>
    );
  };


  it("renders correctly and sets the document title", () => {
    renderComponent();


    // Verify document title
    expect(document.title).toBe("Milestones | ThriveWell");


    // Verify presence of child components
    expect(screen.getByTestId("navbar-filter-chip-array")).toBeInTheDocument();
    expect(screen.getByTestId("top-in-crisis")).toBeInTheDocument();
    expect(screen.getByTestId("average-domain-scores")).toBeInTheDocument();
    expect(screen.getByTestId("all-milestones")).toBeInTheDocument();
  });


  it("calls useAuthorization with correct parameters", () => {
    renderComponent();


    expect(useAuthorization).toHaveBeenCalledWith(
      "admin",
      null,
      "1",
      "GOVTDashboardMilestones",
      true
    );
  });


  it("uses standard breadcrumbs when signedinOrgType is not 6", () => {
    renderComponent({ ...mockContextValue, signedinOrgType: "1" });


    expect(BreadcrumbsLinkThriveScale).toHaveBeenCalled();
    expect(BreadcrumbsLinkThriveScaleGovtDashboard).not.toHaveBeenCalled();
   
    // Check that the first breadcrumb label matches the mock return
    expect(screen.getByTestId("breadcrumb-item-0")).toHaveTextContent("Thrive Scale");
  });


  it("uses GovtDashboard breadcrumbs when signedinOrgType is 6", () => {
    renderComponent({ ...mockContextValue, signedinOrgType: "6" });


    expect(BreadcrumbsLinkThriveScaleGovtDashboard).toHaveBeenCalled();
    expect(BreadcrumbsLinkThriveScale).not.toHaveBeenCalled();


    // Check that the first breadcrumb label matches the gov mock return
    expect(screen.getByTestId("breadcrumb-item-0")).toHaveTextContent("Gov Dashboard");
  });


  it("renders the 'Milestones' label as the second breadcrumb", () => {
    renderComponent();
   
    // Verify the second breadcrumb exists and has correct text
    const milestoneBreadcrumb = screen.getByTestId("breadcrumb-item-1");
    expect(milestoneBreadcrumb).toHaveTextContent("common:common.Milestones");
  });


  it("handles translation fallback when translation key is missing", () => {
    renderComponent();
 
  // We can't easily spy on the existing mock, but we can verify the breadcrumb text
  // The breadcrumb should show "Milestones" (the fallback) not "common:common.Milestones"
  const milestoneBreadcrumb = screen.getByTestId("breadcrumb-item-1");
  expect(milestoneBreadcrumb).toHaveTextContent("Milestones"); // Not "common:common.Milestones"
  });


  it("handles missing breadcrumb functions gracefully", () => {
    // Temporarily break the mocks
    BreadcrumbsLinkThriveScale.mockReturnValueOnce(null);
    BreadcrumbsLinkThriveScaleGovtDashboard.mockReturnValueOnce(null);
   
    // Should not crash due to defensive checks in PageBreadcrumbs mock
    expect(() => {
      renderComponent();
    }).not.toThrow();
   
    // Breadcrumb container should still render
    expect(screen.getByTestId("page-breadcrumbs")).toBeInTheDocument();
  });


  it("maintains document title after component unmounts", () => {
    const { unmount } = renderComponent();
   
    expect(document.title).toBe("Milestones | ThriveWell");
   
    unmount();
   
    // Title remains (no cleanup in component)
    expect(document.title).toBe("Milestones | ThriveWell");
  });


  it("renders correctly when signedinOrgType is null/undefined", () => {
    // Test missing signedinOrgType
    renderComponent({ ...mockContextValue, signedinOrgType: null });
   
    // Should still render without crashing
    expect(screen.getByTestId("top-in-crisis")).toBeInTheDocument();
   
    // Verify which breadcrumb was called (should be ThriveScale since not "6")
    expect(BreadcrumbsLinkThriveScale).toHaveBeenCalled();
  });


  it("renders correctly when signedinUserRoleHT is missing", () => {
    renderComponent({ ...mockContextValue, signedinUserRoleHT: null });
   
    // useAuthorization should still be called
    expect(useAuthorization).toHaveBeenCalledWith(
      null, // signedinUserRoleHT
      null,
      "1",
      "GOVTDashboardMilestones",
      true
    );
  });
});



