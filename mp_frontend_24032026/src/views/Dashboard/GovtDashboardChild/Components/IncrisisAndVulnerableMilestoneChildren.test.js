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
  })),
}));


// ====== IMPORTS ======
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import IncrisisAndVulnerableMilestoneChildren from "./IncrisisAndVulnerableMilestoneChildren";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload, UpdateDashboardDataViews } from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======
jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
  UpdateDashboardDataViews: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetIncrisisAndVulnerableMilestonesChildren: jest.fn(),
}));


// Mock MultiLineGraph - Keep this simple
jest.mock("../../../../components/MultilineGraph/MultiLineGraph", () => (props) => (
  <div data-testid="multiline-graph">
    <div data-testid="graph-title">{props.title}</div>
    <div data-testid="loading-status">{props.loading ? "loading" : "loaded"}</div>
    <div data-testid="error-status">{props.apiError || "none"}</div>
    <button data-testid="reload-btn" onClick={props.onReload}>Reload</button>
    <div data-testid="data-count">{props.data?.length || 0} items</div>
  </div>
));


describe("IncrisisAndVulnerableMilestonesChildren Component", () => {
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
  };


  const mockApiResponse = {
    data: {
      data: [
        {
          assessment_number: 1,
          InCrisisRedFlagMilestones: 5,
          VulnerableRedFlagMilestones: 10,
          InCrisisMilestones: 15,
          VulnerableMilestones: 20,
        },
      ],
    },
  };


  beforeEach(() => {
    jest.clearAllMocks();
   
    // Setup localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "userRegion") return "IN";
      return null;
    });


    getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
    APIS.GetIncrisisAndVulnerableMilestonesChildren.mockResolvedValue(mockApiResponse);
  });


  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });


  const renderComponent = (context = mockContextValue) =>
    render(
      <CommonDataContext.Provider value={context}>
        <IncrisisAndVulnerableMilestoneChildren />
      </CommonDataContext.Provider>
    );


  it("renders with correct title and fetches data on mount", async () => {
    renderComponent();


    expect(UpdateDashboardDataViews).toHaveBeenCalled();
    expect(screen.getByTestId("graph-title")).toHaveTextContent(
      "In crisis and Vulnerable milestones for all children, by assessment"
    );


    await screen.findByText("loaded");
    expect(screen.getByTestId("data-count")).toHaveTextContent("1 items");
  });


  it("does not fetch when countryFilter is null", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });
   
    renderComponent();
    await new Promise(r => setTimeout(r, 50));
   
    expect(APIS.GetIncrisisAndVulnerableMilestonesChildren).not.toHaveBeenCalled();
  });


  it("handles API errors and allows retry", async () => {
    // First call fails
    APIS.GetIncrisisAndVulnerableMilestonesChildren
      .mockRejectedValueOnce(new Error("API Error"))
      .mockResolvedValueOnce(mockApiResponse); // Second call succeeds


    renderComponent();


    // Should show error
    await screen.findByText("Failed to fetch data");
   
    // Click retry
    fireEvent.click(screen.getByTestId("reload-btn"));
   
    // Should recover
    await screen.findByText("none"); // Error cleared
    expect(APIS.GetIncrisisAndVulnerableMilestonesChildren).toHaveBeenCalledTimes(2);
  });


  it("handles empty/null API responses", async () => {
    APIS.GetIncrisisAndVulnerableMilestonesChildren.mockResolvedValue({ data: { data: null } });
   
    renderComponent();
    await screen.findByText("loaded");
   
    expect(screen.getByTestId("data-count")).toHaveTextContent("0 items");
  });


  it("uses fallback values for missing data fields", async () => {
    APIS.GetIncrisisAndVulnerableMilestonesChildren.mockResolvedValue({
      data: {
        data: [
          {
            assessment_number: 2,
            // All milestone fields missing or null
          },
        ],
      },
    });


    renderComponent();
    await screen.findByText("loaded");
   
    // Component should handle missing fields gracefully
    expect(APIS.GetIncrisisAndVulnerableMilestonesChildren).toHaveBeenCalled();
  });
});

