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
import MilestoneInterventions from "./MilestoneInterventions";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload, EncryptId } from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));


// CRITICAL FIX: Mock both router entry points to ensure useParams() works regardless of the import source
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));


jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetAllInterventionsForMilestone: jest.fn(),
}));


jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
  EncryptId: jest.fn(),
}));


jest.mock("../../../../components/RatingComponent/RatingComponent", () => () => <div data-testid="rating-component" />);


// Mock ReusableTrendTable to trigger its internal render logic and function props
jest.mock("../../GovtDashboardOverview/Components/ReusableTrendTable", () => (props) => (
  <div data-testid="trend-table">
    <div data-testid="table-title">{props.title}</div>
    <div data-testid="loading-state">{props.loading ? "loading" : "loaded"}</div>
    {/* Trigger for Branch Coverage: passing null to test the fallback || {} */}
    <button data-testid="reload-null" onClick={() => props.onReload(null)}>Reload Null</button>
    <button data-testid="reload-btn" onClick={() => props.onReload({ page: 1, rowCount: 10 })}>Reload</button>
    <div data-testid="table-content">
      {props.tableData?.map((row, i) => (
        <div key={i} data-testid={`row-${i}`}>
          {props.columns.map(col => (
             <div key={col.id} data-testid={`cell-${col.id}-${i}`}>
                {col.render ? col.render(row, row[col.id]) : row[col.id]}
             </div>
          ))}
        </div>
      ))}
    </div>
  </div>
));


describe("MilestoneInterventions Component", () => {
  const mockNavigate = jest.fn();
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
    signedinOrgType: "1",
  };


  const mockApiResponse = {
    data: {
      data: [
        {
          id: "1",
          intervention: "Test Intervention",
          activeInterventions: 5,
          completedInterventions: 10,
          interventionRating: 4,
        }
      ],
      total: 1,
      pageCount: 1,
    }
  };


  const milestoneTitle = "Test Milestone";


  beforeEach(() => {
    jest.clearAllMocks();
   
    // Setup consistent behavior for both potential router packages
    const { useParams: upR, useNavigate: unR } = require("react-router");
    const { useParams: upRD, useNavigate: unRD } = require("react-router-dom");
   
    const paramsMock = { id: btoa(milestoneTitle) };
    upR.mockReturnValue(paramsMock);
    upRD.mockReturnValue(paramsMock);
    unR.mockReturnValue(mockNavigate);
    unRD.mockReturnValue(mockNavigate);


    EncryptId.mockImplementation((id) => `encrypted-${id}`);
   
    localStorage.setItem("userRegion", "IN");
    localStorage.setItem("orgId", "org-123");
    getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
  });


  const renderComponent = (contextValue = mockContextValue) => {
    return render(
      <CommonDataContext.Provider value={contextValue}>
        <MilestoneInterventions />
      </CommonDataContext.Provider>
    );
  };


  it("renders correctly and fetches data on mount", async () => {
    APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
    });


    expect(APIS.GetAllInterventionsForMilestone).toHaveBeenCalled();
    expect(screen.getByText("Test Intervention")).toBeInTheDocument();
  });


  it("applies accountFilter when signedinOrgType is not '6'", async () => {
    APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent({ ...mockContextValue, signedinOrgType: "1" });


    await waitFor(() => {
      expect(APIS.GetAllInterventionsForMilestone).toHaveBeenCalledWith(
        expect.objectContaining({ accountFilter: ["org-123"] })
      );
    });
  });


  it("does not apply accountFilter when signedinOrgType is '6'", async () => {
    APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent({ ...mockContextValue, signedinOrgType: "6" });


    await waitFor(() => {
      expect(APIS.GetAllInterventionsForMilestone).toHaveBeenCalledWith(
        expect.not.objectContaining({ accountFilter: ["org-123"] })
      );
    });
  });


  it("navigates to intervention details when name is clicked", async () => {
    APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();


    const interventionLink = await screen.findByText("Test Intervention");
    fireEvent.click(interventionLink);


    // Verify navigation with correctly encrypted values and state
    expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("encrypted-Test Intervention"),
        expect.objectContaining({ state: { milestone: milestoneTitle } })
    );
  });


  it("handles API error correctly and sets apiError state", async () => {
    APIS.GetAllInterventionsForMilestone.mockRejectedValueOnce(new Error("API Error"));


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
    });
  });


  it("early returns if countryFilter is null (coverage for if branch)", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });


    renderComponent();


    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetAllInterventionsForMilestone).not.toHaveBeenCalled();
  });


  it("triggers reload when onReload is called from the table", async () => {
    APIS.GetAllInterventionsForMilestone.mockResolvedValue(mockApiResponse);


    renderComponent();


    await waitFor(() => expect(APIS.GetAllInterventionsForMilestone).toHaveBeenCalledTimes(1));


    fireEvent.click(screen.getByTestId("reload-btn"));


    await waitFor(() => expect(APIS.GetAllInterventionsForMilestone).toHaveBeenCalledTimes(2));
  });


  it("handles decryption error safely in internal helper", async () => {
    const { useParams: upR } = require("react-router");
    upR.mockReturnValue({ id: "invalid-base-64!!!" });
    APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce(mockApiResponse);


    renderComponent();


    await waitFor(() => {
      expect(APIS.GetAllInterventionsForMilestone).toHaveBeenCalledWith(
        expect.objectContaining({ milestoneNameFilter: "" })
      );
    });
  });
 
  it("uses fallback empty object for params in getAllInterventions (Line 38 coverage)", async () => {
    APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();


    await screen.findByText("loaded");
    // Explicitly trigger the params || {} branch by passing null via the mock button
    fireEvent.click(screen.getByTestId("reload-null"));


    await waitFor(() => {
        expect(APIS.GetAllInterventionsForMilestone).toHaveBeenCalled();
    });
  });


  it("does not call API if userRegion or signedinOrgType is missing (Line 67-69 coverage)", () => {
    localStorage.removeItem("userRegion");
    renderComponent({ ...mockContextValue, signedinOrgType: null });
   
    expect(APIS.GetAllInterventionsForMilestone).not.toHaveBeenCalled();
  });
});

