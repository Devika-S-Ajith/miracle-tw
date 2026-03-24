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
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import OrganizationsApplied from "./OrganizationsApplied";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useParams, useNavigate } from "react-router";
import { getNavbarFilterPayload } from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));


jest.mock("react-router", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetOrganizationsApliedForMilestone: jest.fn(),
}));


jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
}));


// Mock skeleton to verify loading state
jest.mock("./OrganizationAppliedSkelton", () => () => (
  <div data-testid="skeleton-loading">Loading...</div>
));


// Mock SmallText and CommonCard to verify props and triggers
jest.mock("../../../../components/SmallText/SmallText", () => (props) => (
  <span data-testid={`org-item-${props.value}`} onClick={props.onClick} style={props.sx}>
    {props.value}
  </span>
));


jest.mock("../../../../components/CommonCard", () => (props) => (
  <div data-testid="common-card">
    <div data-testid="card-title">{props.title}</div>
    {props.children}
  </div>
));


describe("OrganizationsApplied Component", () => {
  const mockNavigate = jest.fn();
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
    signedinOrgType: "1",
  };


  const mockApiResponse = {
    data: {
      data: [
        { accountName: "Organization A", HTAccountId: "org-a" },
        { accountName: "Organization B", HTAccountId: "org-b" },
      ],
    },
  };


  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: btoa("Test Milestone") });
    localStorage.setItem("userRegion", "IN");
    localStorage.setItem("orgId", "org-123");
    getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
  });


  const renderComponent = (contextValue = mockContextValue) => {
    return render(
      <CommonDataContext.Provider value={contextValue}>
        <OrganizationsApplied />
      </CommonDataContext.Provider>
    );
  };


  it("renders loading skeleton initially and fetches data", async () => {
    APIS.GetOrganizationsApliedForMilestone.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();


    expect(screen.getByTestId("skeleton-loading")).toBeInTheDocument();


    await waitFor(() => {
      expect(screen.queryByTestId("skeleton-loading")).not.toBeInTheDocument();
    });


    expect(APIS.GetOrganizationsApliedForMilestone).toHaveBeenCalled();
    expect(screen.getByTestId("card-title")).toHaveTextContent("(2)");
    expect(screen.getByText("Organization A")).toBeInTheDocument();
  });


  it("navigates to the organization details when a name is clicked", async () => {
    APIS.GetOrganizationsApliedForMilestone.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();


    const orgLink = await screen.findByTestId("org-item-Organization A");
    fireEvent.click(orgLink);


    expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("/governmentDashboardOrganizations/org-a"),
    );
  });


  it("handles API error gracefully", async () => {
    APIS.GetOrganizationsApliedForMilestone.mockRejectedValueOnce(new Error("API Error"));


    renderComponent();


    await waitFor(() => {
      expect(screen.queryByTestId("skeleton-loading")).not.toBeInTheDocument();
    });
  });


  it("early returns if countryFilter is null", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });


    renderComponent();


    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetOrganizationsApliedForMilestone).not.toHaveBeenCalled();
  });


  it("uses empty accountFilter when signedinOrgType is '6'", async () => {
    APIS.GetOrganizationsApliedForMilestone.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent({ ...mockContextValue, signedinOrgType: "6" });


    await waitFor(() => {
      expect(APIS.GetOrganizationsApliedForMilestone).toHaveBeenCalledWith(
        expect.not.objectContaining({ accountFilter: ["org-123"] })
      );
    });
  });


  it("does not call API if userRegion is missing in localStorage", () => {
    localStorage.removeItem("userRegion");
    renderComponent();
   
    expect(APIS.GetOrganizationsApliedForMilestone).not.toHaveBeenCalled();
  });


  it("handles decryption failure in useParams safely (catch block coverage)", async () => {
    useParams.mockReturnValue({ id: "!!!NotBase64!!!" });
    APIS.GetOrganizationsApliedForMilestone.mockResolvedValueOnce(mockApiResponse);


    renderComponent();


    await waitFor(() => {
        expect(APIS.GetOrganizationsApliedForMilestone).toHaveBeenCalledWith(
            expect.objectContaining({ milestoneNameFilter: "" })
        );
    });
  });


  it("covers fallback branches for malformed API responses without crashing", async () => {
    // Case 1: response.data is missing (optional chaining coverage)
    APIS.GetOrganizationsApliedForMilestone.mockResolvedValueOnce({});
    renderComponent();
    await waitFor(() => expect(screen.queryByTestId("skeleton-loading")).not.toBeInTheDocument());
    });
    it("covers fallback branches for malformed API responses without crashing", async () => {


    // Case 2: data is null (triggers || [] fallback in component to prevent .map crash)
    APIS.GetOrganizationsApliedForMilestone.mockResolvedValueOnce({ data: { data: null } });
    renderComponent();
    await waitFor(() => {
        expect(screen.queryByTestId("skeleton-loading")).not.toBeInTheDocument();
        expect(screen.getByTestId("card-title")).toHaveTextContent("(0)");
    });
  });
});

