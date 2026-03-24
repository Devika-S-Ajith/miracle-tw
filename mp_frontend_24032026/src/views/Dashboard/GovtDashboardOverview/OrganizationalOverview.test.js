import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import OrganizationalOverview from "./OrganizationalOverview";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useParams } from "react-router";
import { getNavbarFilterPayload } from "../../../constants";


// --- Mocks ---


jest.mock("react-router", () => ({
  useParams: jest.fn(() => ({ id: null })),
}));


jest.mock("../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
}));


// Mock InfoCard to verify the props it receives
jest.mock("../../../components/InfoCard", () => ({ title, data, loading, apiError, onReload }) => (
  <div data-testid="info-card-mock">
    <div data-testid="title">{title}</div>
    <div data-testid="loading">{loading ? "loading" : "loaded"}</div>
    <div data-testid="error-state">{apiError ? "error-active" : "no-error"}</div>
    <button data-testid="reload-btn" onClick={onReload}>Reload</button>
    <ul data-testid="data-list">
      {data.map((item, idx) => (
        <li key={idx} data-testid={`item-${idx}`}>
          {item.label}: {item.value} (Access: {item.access ? "yes" : "no"})
        </li>
      ))}
    </ul>
  </div>
));


const mockGetGovtDashboardOrganizationOverview = jest.fn();
jest.mock("../../../common/hooks/UseApiCalls", () => ({
  __esModule: true,
  default: {
    GetGovtDashboardOrganizationOverview: (...args) => mockGetGovtDashboardOrganizationOverview(...args),
  },
}));


// --- Test Suite ---


describe("OrganizationalOverview Full Coverage", () => {
  const mockContextValue = {
    navbarFilterValues: [{ key: "region", value: "US" }],
    linkedAccounts: [],
  };


  const successData = {
    data: {
      total_active_org: 10,
      total_active_children: 50,
      total_active_families: 25,
      new_children_last_30: 5,
      new_families_last_30: 3,
      total_active_cases: 75,
      intervention_in_progress: 12,
      intervention_completed: 100,
      avg_cases_per_casemanagers: 15,
      no_of_active_casemanagers: 5,
    }
  };


  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("userRegion", "IN");
    getNavbarFilterPayload.mockReturnValue({ countryFilter: ["IN"] });
    useParams.mockReturnValue({ id: null });
  });


  const renderComponent = () =>
    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <OrganizationalOverview />
      </CommonDataContext.Provider>
    );


  it("renders and fetches data successfully", async () => {
    mockGetGovtDashboardOrganizationOverview.mockResolvedValue({ data: successData });


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });


    expect(screen.getByText(/Total # of active orgs: 10/)).toBeInTheDocument();
  });


  // FIX FOR: Default fallbacks (|| 0) and response data branches
  it("uses fallback values (0) when API data fields are missing", async () => {
    // Providing an empty data object to trigger the "|| 0" branches
    mockGetGovtDashboardOrganizationOverview.mockResolvedValue({
        data: { data: {} }
    });


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });


    // Verify fallback to 0
    expect(screen.getByText(/Total # of active orgs: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Total # of active children: 0/)).toBeInTheDocument();
  });


  it("handles case where response.data.data is null", async () => {
    // Triggering the falsy branch of: if (response.data && response.data.data)
    mockGetGovtDashboardOrganizationOverview.mockResolvedValue({
        data: { data: null }
    });


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });


    // Data array should remain empty
    const dataList = screen.getByTestId("data-list");
    expect(dataList).toBeEmptyDOMElement();
  });


  it("early returns and does not call API if countryFilter is null", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });


    renderComponent();


    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetGovtDashboardOrganizationOverview).not.toHaveBeenCalled();
  });


  it("applies accountFilter and updates access when id is present in URL", async () => {
    useParams.mockReturnValue({ id: "org-123" });
    mockGetGovtDashboardOrganizationOverview.mockResolvedValue({ data: successData });


    renderComponent();


    // CRITICAL: Wait for "loaded" to avoid act() warnings by ensuring state updates finish
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });


    expect(mockGetGovtDashboardOrganizationOverview).toHaveBeenCalledWith(
        expect.objectContaining({ accountFilter: ["org-123"] })
    );


    const orgItem = screen.getByText(/Total # of active orgs/);
    expect(orgItem).toHaveTextContent("Access: no");
  });


  it("handles API error correctly and sets error state", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetGovtDashboardOrganizationOverview.mockRejectedValue(new Error("Network Error"));


    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("error-state")).toHaveTextContent("error-active");
    });


    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });


  it("triggers fetchData again when onReload is called", async () => {
    mockGetGovtDashboardOrganizationOverview.mockResolvedValue({ data: successData });
    renderComponent();


    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));


    fireEvent.click(screen.getByTestId("reload-btn"));
   
    await waitFor(() => {
      expect(mockGetGovtDashboardOrganizationOverview).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });
  });


  it("does not fetch if userRegion is missing in localStorage", async () => {
    localStorage.removeItem("userRegion");
    renderComponent();
   
    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetGovtDashboardOrganizationOverview).not.toHaveBeenCalled();
  });
});

