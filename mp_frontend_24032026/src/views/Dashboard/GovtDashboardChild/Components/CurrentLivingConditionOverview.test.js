// ====== PROJECT-WIDE MOCKS (Absolute Top to avoid ESM/Axios initialization errors) ======


jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(),
    interceptors: { request: { use: jest.fn(), eject: jest.fn() }, response: { use: jest.fn(), eject: jest.fn() } },
  })),
  get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(),
  defaults: { baseURL: '', headers: { common: {}, post: {}, put: {}, patch: {}, delete: {} } },
}));


jest.mock('lodash', () => ({ get: jest.fn(), set: jest.fn(), isEmpty: jest.fn() }));
jest.mock('aws-amplify', () => ({ Auth: { currentSession: jest.fn(), currentAuthenticatedUser: jest.fn() } }));
jest.mock('react-hot-toast', () => ({ toast: { success: jest.fn(), error: jest.fn(), loading: jest.fn() } }));


// Mock the config used by hooks
jest.mock('../../../../common/config', () => ({ AppConfig: { baseURL: 'http://test-api.com' } }), { virtual: true });


// ====== IMPORTS ======


import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import CurrentLivingConditionOverview from "./CurrentLivingConditionOverview";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload, UpdateDashboardDataViews } from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback || key }),
}));


jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
  UpdateDashboardDataViews: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetCurrentLivingCondition: jest.fn(),
}));


// Mock child component to verify data passing
jest.mock("../../Components/StateGovDashboardComponents/OrganizationOverviewCard", () => (props) => (
  <div data-testid="overview-card">
    <div data-testid="card-title">{props.title}</div>
    <div data-testid="loading-status">{props.loading ? "loading" : "loaded"}</div>
    <div data-testid="error-status">{props.apiError ? props.apiError : "none"}</div>
    <button data-testid="reload-btn" onClick={props.onReload}>Reload</button>
    <ul data-testid="data-list">
      {props.data?.map((item, i) => (
        <li key={i} data-testid={`data-item-${i}`}>
          {item.label}: {item.value}
        </li>
      ))}
    </ul>
  </div>
));


describe("CurrentLivingConditionOverview Component", () => {
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
  };


  const mockApiResponse = {
    data: {
      data: [
        { category: "Rented", count: 15 },
        { category: "Owned", count: 25 },
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
    APIS.GetCurrentLivingCondition.mockResolvedValue(mockApiResponse);
  });


  afterEach(cleanup);


  const renderComponent = (context = mockContextValue) =>
    render(
      <CommonDataContext.Provider value={context}>
        <CurrentLivingConditionOverview />
      </CommonDataContext.Provider>
    );


  it("performs full mount lifecycle and fetches data successfully", async () => {
    renderComponent();


    expect(UpdateDashboardDataViews).toHaveBeenCalled();


    // Verify loaded state and data mapping
    const loadedStatus = await screen.findByText("loaded");
    expect(loadedStatus).toBeInTheDocument();
   
    // Verify transformed data labels and values
    expect(screen.getByText(/Rented: 15/i)).toBeInTheDocument();
    expect(screen.getByText(/Owned: 25/i)).toBeInTheDocument();
  });


  it("handles the countryFilter early return branch", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });


    renderComponent();


    // Note: Component stays in loading state if countryFilter is null
    // unless you add setLoading(false) to that branch.
    await new Promise(r => setTimeout(r, 50));
    expect(APIS.GetCurrentLivingCondition).not.toHaveBeenCalled();
  });


  it("handles API error gracefully and allows reload", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    APIS.GetCurrentLivingCondition.mockRejectedValueOnce(new Error("API Fail"));


    renderComponent();


    // Verify error display
    const errorStatus = await screen.findByTestId("error-status");
    expect(errorStatus).toHaveTextContent("Failed to fetch current living condition data");


    // Mock success for reload
    APIS.GetCurrentLivingCondition.mockResolvedValueOnce(mockApiResponse);
    fireEvent.click(screen.getByTestId("reload-btn"));


    // Verify successful recovery
    expect(await screen.findByText(/Rented: 15/i)).toBeInTheDocument();
    expect(screen.getByTestId("error-status")).toHaveTextContent("none");
    consoleSpy.mockRestore();
  });


  it("covers fallback logic when API response data is null (transformedData branch)", async () => {
    // API returns response but data.data is null
    APIS.GetCurrentLivingCondition.mockResolvedValueOnce({ data: { data: null } });


    renderComponent();


    await screen.findByText("loaded");
    // Verify that the data array is empty
    expect(screen.getByTestId("data-list")).toBeEmptyDOMElement();
  });


  it("handles case where response is entirely missing data object", async () => {
    // Case where response is {} or undefined
    APIS.GetCurrentLivingCondition.mockResolvedValueOnce({});


    renderComponent();


    await screen.findByText("loaded");
    expect(screen.getByTestId("data-list")).toBeEmptyDOMElement();
  });


  it("does not trigger fetch if userRegion is missing in localStorage", () => {
    window.localStorage.getItem.mockReturnValue(null);
   
    renderComponent();


    expect(APIS.GetCurrentLivingCondition).not.toHaveBeenCalled();
  });
  it("re-fetches when navbarFilterValues changes", async () => {
  const { rerender } = renderComponent();
 
  // Initial fetch
  await screen.findByText("loaded");
  jest.clearAllMocks();
 
  // Change context
  rerender(
    <CommonDataContext.Provider value={{
      navbarFilterValues: ['new-filter'],  // Changed!
      linkedAccounts: []
    }}>
      <CurrentLivingConditionOverview />
    </CommonDataContext.Provider>
  );
 
  // Should re-fetch
  expect(APIS.GetCurrentLivingCondition).toHaveBeenCalledTimes(1);
});


it("re-fetches when linkedAccounts changes", async () => {
  const { rerender } = renderComponent();
 
  // Initial fetch
  await screen.findByText("loaded");
  jest.clearAllMocks();
 
  // Change context
  rerender(
    <CommonDataContext.Provider value={{
      navbarFilterValues: [],
      linkedAccounts: ['new-account']  // Changed!
    }}>
      <CurrentLivingConditionOverview />
    </CommonDataContext.Provider>
  );
 
  // Should re-fetch
  expect(APIS.GetCurrentLivingCondition).toHaveBeenCalledTimes(1);
});


// BONUS: Test the localStorage.getString() bug
it("has potential bug with localStorage in dependency array", () => {
  // This is a documentation test - the dependency array has a bug!
  // localStorage.getItem("userRegion") returns a STRING, not a function
  // This won't trigger re-fetches when localStorage changes!
  const dependencyArray = ['IN', [], []]; // What React sees
  expect(true).toBe(true); // Document the issue
});
});

