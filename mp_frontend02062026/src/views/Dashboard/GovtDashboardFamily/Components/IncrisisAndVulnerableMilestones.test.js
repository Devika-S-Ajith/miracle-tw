// ====== PROJECT-WIDE MOCKS (Absolute Top to avoid ESM/Axios initialization errors) ======




// ====== IMPORTS ======


import React from "react";
import { render, screen, fireEvent, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom";
import IncrisisAndVulnerableMilestones from "./IncrisisAndVulnerableMilestones";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload, UpdateDashboardDataViews } from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
  UpdateDashboardDataViews: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetIncrisisAndVulnerableMilestonesFamilies: jest.fn(),
}));


// Mock MultiLineGraph to verify data passing and internal logic
jest.mock("../../../../components/MultilineGraph/MultiLineGraph", () => (props) => (
  <div data-testid="multiline-graph">
    <div data-testid="graph-title">{props.title}</div>
    <div data-testid="loading-status">{props.loading ? "loading" : "loaded"}</div>
    <div data-testid="error-status">{props.apiError ? props.apiError : "none"}</div>
    <button data-testid="reload-btn" onClick={props.onReload}>Reload</button>
    <ul data-testid="data-list">
      {props.data?.map((item, i) => (
        <li key={i} data-testid={`data-item-${i}`}>
          {item.shortLabel}: {item.InCrisisRedFlagMilestone} | {item.VulnerableRedFlagMilestone} | {item.InCrisisMilestone} | {item.VulnerableMilestone}
        </li>
      ))}
    </ul>
  </div>
));


describe("IncrisisAndVulnerableMilestones Component (Families)", () => {
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
  };


  const mockApiResponse = {
    data: {
      data: [
        {
          assessment_number: 1,
          InCrisisRedFlagMilestones: 10,
          VulnerableRedFlagMilestones: 20,
          InCrisisMilestones: 30,
          VulnerableMilestones: 40,
        },
      ],
    },
  };


  beforeEach(() => {
    jest.clearAllMocks();
   
    // Setup consistent localStorage
    const storageMock = {
        getItem: jest.fn((key) => {
            if (key === "userRegion") return "IN";
            return null;
        })
    };
    Object.defineProperty(window, 'localStorage', { value: storageMock, writable: true });


    // Set default mock returns
    getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
    APIS.GetIncrisisAndVulnerableMilestonesFamilies.mockResolvedValue(mockApiResponse);
  });


  afterEach(cleanup);


  const renderComponent = (context = mockContextValue) =>
    render(
      <CommonDataContext.Provider value={context}>
        <IncrisisAndVulnerableMilestones />
      </CommonDataContext.Provider>
    );


  it("performs full mount lifecycle and fetches data successfully", async () => {
    renderComponent();


    expect(UpdateDashboardDataViews).toHaveBeenCalled();


    // Verify loaded state and data mapping
    const loadedStatus = await screen.findByText("loaded");
    expect(loadedStatus).toBeInTheDocument();
   
    // Verify transformed data labels and values
    expect(screen.getByText(/A1: 10/i)).toBeInTheDocument();
  });


  it("handles the countryFilter early return branch", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });


    renderComponent();


    // Verify the API was never called.
    await new Promise(r => setTimeout(r, 50));
    expect(APIS.GetIncrisisAndVulnerableMilestonesFamilies).not.toHaveBeenCalled();
  });


  it("handles API error gracefully and allows reload", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    APIS.GetIncrisisAndVulnerableMilestonesFamilies.mockRejectedValueOnce(new Error("API Fail"));


    renderComponent();


    // Verify error display
    const errorStatus = await screen.findByTestId("error-status");
    expect(errorStatus).toHaveTextContent("Failed to fetch data");


    // Mock success for reload
    APIS.GetIncrisisAndVulnerableMilestonesFamilies.mockResolvedValueOnce(mockApiResponse);
    fireEvent.click(screen.getByTestId("reload-btn"));


    // Verify successful recovery
    expect(await screen.findByText(/A1: 10/i)).toBeInTheDocument();
    expect(screen.getByTestId("error-status")).toHaveTextContent("none");
    consoleSpy.mockRestore();
  });


  it("covers fallback logic when API response data is null (|| [] branch)", async () => {
    // API returns response but data.data is null
    APIS.GetIncrisisAndVulnerableMilestonesFamilies.mockResolvedValueOnce({ data: { data: null } });


    renderComponent();


    await screen.findByText("loaded");
    // Verify that the data array is empty
    expect(screen.getByTestId("data-list")).toBeEmptyDOMElement();
  });


  it("does not trigger fetch if userRegion is missing in localStorage", () => {
    window.localStorage.getItem.mockReturnValue(null);
   
    renderComponent();


    expect(APIS.GetIncrisisAndVulnerableMilestonesFamilies).not.toHaveBeenCalled();
  });


  it("covers fallback values for missing fields in data items (Logic Coverage)", async () => {
    // API returns the object, but specific numeric fields are null or missing
    APIS.GetIncrisisAndVulnerableMilestonesFamilies.mockResolvedValueOnce({
      data: {
        data: [
          {
            assessment_number: 2,
            InCrisisRedFlagMilestones: null,
            VulnerableRedFlagMilestones: undefined,
            // InCrisisMilestones missing
            // VulnerableMilestones missing
          },
        ],
      },
    });


    renderComponent();


    // Wait for mapping to complete
    await screen.findByText("loaded");


    // Check that fallbacks to 0 are used for all 4 milestone keys (hits all 4 || 0 branches)
    const dataItem = screen.getByTestId("data-item-0");
    expect(dataItem).toHaveTextContent("A2: 0 | 0 | 0 | 0");
  });
  it("re-fetches when navbarFilterValues change", async () => {
  const { rerender } = renderComponent();
 
  // Initial fetch
  await screen.findByText("loaded");
 
  // Change context to trigger re-fetch
  rerender(
    <CommonDataContext.Provider value={{
      navbarFilterValues: ['new-filter'],  // Different value
      linkedAccounts: []
    }}>
      <IncrisisAndVulnerableMilestones />
    </CommonDataContext.Provider>
  );
 
  // Should re-fetch with new filter
  expect(APIS.GetIncrisisAndVulnerableMilestonesFamilies).toHaveBeenCalledTimes(2);
});
});

