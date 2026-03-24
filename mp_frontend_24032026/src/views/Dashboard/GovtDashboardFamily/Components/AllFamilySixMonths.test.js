// ====== PROJECT-WIDE MOCKS (Absolute Top to avoid ESM/Axios initialization errors) ======


jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(),
    interceptors: { request: { use: jest.fn(), eject: jest.fn() }, response: { use: jest.fn(), eject: jest.fn() } },
  })),
  get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(),
  defaults: { baseURL: '', headers: { common: {}, post: {}, put: {}, patch: {}, delete: {} } },
}));




// Mock the config used by hooks
jest.mock('../../../../common/config', () => ({ AppConfig: { baseURL: 'http://test-api.com' } }), { virtual: true });


// ====== IMPORTS ======


import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import AllFamiliesSixMonths from "./AllFamilySixMonths";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { getSixMonthRange } from "../../../../helpers/helperFunction";
import { getNavbarFilterPayload, UpdateDashboardDataViews } from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("../../../../helpers/helperFunction", () => ({
  getSixMonthRange: jest.fn(() => ({
    startDate: "2023-01-01",
    endDate: "2023-06-01"
  })),
}));


jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
  UpdateDashboardDataViews: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetAllFamilesSixMonths: jest.fn(),
}));


// Mock MultiLineGraph to verify data passing
jest.mock("../../../../components/MultilineGraph/MultiLineGraph", () => (props) => (
  <div data-testid="multiline-graph">
    <div data-testid="graph-title">{props.title}</div>
    <div data-testid="loading-status">{props.loading ? "loading" : "loaded"}</div>
    <div data-testid="error-status">{props.apiError ? props.apiError : "none"}</div>
    <button data-testid="reload-btn" onClick={props.onReload}>Reload</button>
    <ul data-testid="data-list">
      {props.data?.map((item, i) => (
        <li key={i} data-testid={`data-item-${i}`}>
          {item.shortLabel}: {item.NewFamilies} (Active: {item.ActiveFamilies})
        </li>
      ))}
    </ul>
  </div>
));


describe("AllFamiliesSixMonths Component - Full Coverage Suite", () => {
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
  };


  const mockApiResponse = {
    data: {
      data: [
        {
          month_start: "2023-01-01",
          new_families_created: 10,
          active_families_count: 50,
          inactive_families_count: 5,
        }
      ]
    }
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
    getSixMonthRange.mockReturnValue({ startDate: "2023-01-01", endDate: "2023-06-01" });
    APIS.GetAllFamilesSixMonths.mockResolvedValue(mockApiResponse);
  });


  afterEach(cleanup);


  const renderComponent = (context = mockContextValue) =>
    render(
      <CommonDataContext.Provider value={context}>
        <AllFamiliesSixMonths />
      </CommonDataContext.Provider>
    );


  it("performs full mount lifecycle and fetches data successfully", async () => {
    renderComponent();


    expect(UpdateDashboardDataViews).toHaveBeenCalled();
    expect(getSixMonthRange).toHaveBeenCalled();


    // findBy queries handle the async wait automatically and avoid act warnings
    const loadedStatus = await screen.findByText("loaded");
    expect(loadedStatus).toBeInTheDocument();
   
    // Verify data transformation mapping (2023-01-01 -> Jan 2023)
    expect(screen.getByText(/Jan 2023: 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Active: 50/i)).toBeInTheDocument();
  });


  it("handles the early return branch when countryFilter is null", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });


    renderComponent();


    // Verify API was never called
    await new Promise(r => setTimeout(r, 50));
    expect(APIS.GetAllFamilesSixMonths).not.toHaveBeenCalled();
  });


  it("handles API errors gracefully and allows reload", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    APIS.GetAllFamilesSixMonths.mockRejectedValueOnce(new Error("API Fail"));


    renderComponent();


    // Verify error state
    const errorStatus = await screen.findByTestId("error-status");
    expect(errorStatus).toHaveTextContent("Failed to fetch milestones data");


    // Success for reload
    APIS.GetAllFamilesSixMonths.mockResolvedValueOnce(mockApiResponse);
    fireEvent.click(screen.getByTestId("reload-btn"));


    // Verify recovery
    expect(await screen.findByText(/Jan 2023: 10/i)).toBeInTheDocument();
    expect(screen.getByTestId("error-status")).toHaveTextContent("none");
   
    consoleSpy.mockRestore();
  });


  it("covers fallback logic when API response data is null (|| [] coverage)", async () => {
    // API returns response but data.data is null
    APIS.GetAllFamilesSixMonths.mockResolvedValueOnce({ data: { data: null } });


    renderComponent();


    await screen.findByText("loaded");
    // Verify that the tableData is an empty array (data-list is empty)
    expect(screen.getByTestId("data-list")).toBeEmptyDOMElement();
  });


  it("does not fetch if userRegion is missing in localStorage (useEffect guard)", () => {
    window.localStorage.getItem.mockReturnValue(null);
   
    renderComponent();


    expect(APIS.GetAllFamilesSixMonths).not.toHaveBeenCalled();
  });


  it("verifies multi-item mapping logic", async () => {
    const multiApiResponse = {
        data: {
            data: [
                {
                    month_start: "2023-03-15",
                    new_families_created: 25,
                    active_families_count: 100,
                    inactive_families_count: 2,
                }
            ]
        }
    };
    APIS.GetAllFamilesSixMonths.mockResolvedValueOnce(multiApiResponse);


    renderComponent();


    const item = await screen.findByTestId("data-item-0");
    // Verifies shortLabel (Mar 2023) and correct key mapping re-assignment
    expect(item).toHaveTextContent("Mar 2023: 25");
    expect(item).toHaveTextContent("Active: 100");
  });
  it("re-fetches when context values change", async () => {
  const { rerender } = renderComponent();
 
  // Initial fetch
  await screen.findByText("loaded");
 
  // Change context
  rerender(
    <CommonDataContext.Provider value={{
      navbarFilterValues: ['new-filter'],
      linkedAccounts: ['account-1']
    }}>
      <AllFamiliesSixMonths />
    </CommonDataContext.Provider>
  );
 
  // Should re-fetch
  expect(APIS.GetAllFamilesSixMonths).toHaveBeenCalledTimes(2);
});


it("shows loading skeleton during fetch", () => {
  // Delay API response
  APIS.GetAllFamilesSixMonths.mockImplementation(() =>
    new Promise(resolve => setTimeout(() => resolve(mockApiResponse), 100))
  );
 
  renderComponent();
 
  // Should show loading initially
  expect(screen.getByText("loading")).toBeInTheDocument();
});


it("handles empty data array gracefully", async () => {
  APIS.GetAllFamilesSixMonths.mockResolvedValue({
    data: { data: [] }
  });
 
  renderComponent();
 
  await screen.findByText("loaded");
  expect(screen.getByTestId("data-list")).toBeEmptyDOMElement();
});
});

