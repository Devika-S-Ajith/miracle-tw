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
jest.mock('../../../../common/config', () => ({
  AppConfig: {
    baseURL: 'http://test-api.com',
  },
}), { virtual: true });


// ====== IMPORTS ======


import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MilestoneDetails from "./MilestoneDetails";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useNavigate, useParams } from "react-router-dom";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import {
  BreadcrumbsLinkThriveScale,
  BreadcrumbsLinkThriveScaleGovtDashboard
} from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => (options && options.defaultValue ? options.defaultValue : key),
  }),
}));


jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));


jest.mock("../../../../components/UserComponents/useAuthorization", () => jest.fn());


jest.mock("../../../../constants", () => ({
  BreadcrumbsLinkThriveScale: jest.fn(),
  BreadcrumbsLinkThriveScaleGovtDashboard: jest.fn(),
}));


// Mock Sub-components
jest.mock("./CurrentStatus", () => () => <div data-testid="current-status" />);
jest.mock("./MilestoneSummary", () => () => <div data-testid="milestone-summary" />);
jest.mock("./MilestoneRatingsTrendByAssessment", () => () => <div data-testid="trend-chart" />);
jest.mock("./MilestoneInterventions", () => () => <div data-testid="milestone-interventions" />);
jest.mock("./OrganizationsApplied", () => () => <div data-testid="orgs-applied" />);


jest.mock("../../../../components/PageBreadcrumbs/PageBreadcrumbs", () => (props) => (
  <div data-testid="page-breadcrumbs">
    {props.data?.map((item, idx) => (
      <button
        key={idx}
        data-testid={`breadcrumb-item-${idx}`}
        onClick={item?.onClick}
      >
        {item?.label || ""}
      </button>
    ))}
  </div>
));


describe("MilestoneDetails Component", () => {
  const mockNavigate = jest.fn();
  const mockContextValue = {
    signedinOrgType: "1",
    signedinUserRoleHT: "admin",
  };


  // Helper to simulate valid/invalid IDs
  const validEncodedId = btoa("Test Milestone Title");
  const invalidId = "!!!NotBase64!!!";


  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: validEncodedId });
   
    // Ensure helper mocks return valid objects for every test run to prevent "undefined" errors
    BreadcrumbsLinkThriveScale.mockReturnValue({ label: "Standard TS", link: "/" });
    BreadcrumbsLinkThriveScaleGovtDashboard.mockReturnValue({ label: "Gov TS", link: "/gov" });
  });


  const renderComponent = (contextValue = mockContextValue) => {
    return render(
      <CommonDataContext.Provider value={contextValue}>
        <MilestoneDetails />
      </CommonDataContext.Provider>
    );
  };


  it("renders correctly and sets the document title", () => {
    renderComponent();


    expect(document.title).toBe("Milestones | ThriveWell");


    // Verify all sub-components render
    expect(screen.getByTestId("current-status")).toBeInTheDocument();
    expect(screen.getByTestId("milestone-summary")).toBeInTheDocument();
    expect(screen.getByTestId("trend-chart")).toBeInTheDocument();
    expect(screen.getByTestId("milestone-interventions")).toBeInTheDocument();
    expect(screen.getByTestId("orgs-applied")).toBeInTheDocument();
  });


  it("decrypts the ID from URL parameters correctly", () => {
    renderComponent();
   
    // The third breadcrumb label should be the decrypted milestone title
    const milestoneBreadcrumb = screen.getByTestId("breadcrumb-item-2");
    expect(milestoneBreadcrumb).toHaveTextContent("Test Milestone Title");
  });


  it("handles decryption failure by returning an empty string (coverage for catch block)", () => {
    useParams.mockReturnValue({ id: invalidId });
   
    renderComponent();
   
    const milestoneBreadcrumb = screen.getByTestId("breadcrumb-item-2");
    expect(milestoneBreadcrumb).toHaveTextContent("");
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


  it("uses standard breadcrumbs for non-Gov organizations", () => {
    renderComponent({ ...mockContextValue, signedinOrgType: "1" });


    expect(BreadcrumbsLinkThriveScale).toHaveBeenCalled();
    expect(screen.getByTestId("breadcrumb-item-0")).toHaveTextContent("Standard TS");
  });


  it("uses GovDashboard breadcrumbs for organization type 6", () => {
    renderComponent({ ...mockContextValue, signedinOrgType: "6" });


    expect(BreadcrumbsLinkThriveScaleGovtDashboard).toHaveBeenCalled();
    expect(screen.getByTestId("breadcrumb-item-0")).toHaveTextContent("Gov TS");
  });


  it("navigates back to the main milestones list when the breadcrumb is clicked", () => {
    renderComponent();


    const milestonesLink = screen.getByTestId("breadcrumb-item-1");
    fireEvent.click(milestonesLink);


    expect(mockNavigate).toHaveBeenCalledWith("/governmentDashboardMilestones");
  });
});

