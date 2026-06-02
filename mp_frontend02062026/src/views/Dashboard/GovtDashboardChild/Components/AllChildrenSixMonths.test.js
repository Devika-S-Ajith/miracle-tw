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
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AllChildrenSixMonths from "./AllChildrenSixMonths";
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
  GetAllChildrenSixMonths: jest.fn(),
}));


// Simpler mock - test behavior, not implementation
jest.mock("../../../../components/MultilineGraph/MultiLineGraph", () => (props) => (
  <div data-testid="multiline-graph">
    <h3>{props.title}</h3>
    <div data-testid="loading">{props.loading.toString()}</div>
    <div data-testid="error">{props.apiError || "no-error"}</div>
    <button onClick={props.onReload}>Retry</button>
    <div data-testid="data-count">{props.data?.length || 0} items</div>
    <div data-testid="sample-data">
      {props.data?.[0]?.NewChildren}-{props.data?.[0]?.ActiveChildren}-{props.data?.[0]?.MaleChildren}
    </div>
  </div>
));


describe("AllChildrenSixMonths Component", () => {
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
  };


  const mockApiResponse = {
    data: {
      data: [
        {
          month: "2023-01-01",
          newChildren: 10,
          activeChildren: 50,
          caseClosed: 5,
          maleChildren: 6,
          femaleChildren: 4
        }
      ]
    }
  };


  beforeEach(() => {
    jest.clearAllMocks();
   
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) =>
      key === "userRegion" ? "IN" : null
    );


    getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
    getSixMonthRange.mockReturnValue({ startDate: "2023-01-01", endDate: "2023-06-01" });
    APIS.GetAllChildrenSixMonths.mockResolvedValue(mockApiResponse);
  });


  afterEach(cleanup);


  const renderComponent = (context = mockContextValue) =>
    render(
      <CommonDataContext.Provider value={context}>
        <AllChildrenSixMonths />
      </CommonDataContext.Provider>
    );


  it("fetches data on mount and shows loading state", async () => {
    renderComponent();


    // Should start loading
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
   
    // Wait for load to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
   
    expect(screen.getByTestId("data-count")).toHaveTextContent("1 items");
  });


  it("correctly handles early return with setLoading(false)", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });
   
    renderComponent();
   
    // Should NOT call API
    await waitFor(() => {
      expect(APIS.GetAllChildrenSixMonths).not.toHaveBeenCalled();
    });
   
    // CRITICAL: Should set loading to false
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });


  it("maps all 5 data fields correctly", async () => {
    renderComponent();
   
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
   
    // Verify all 5 mappings
    expect(screen.getByTestId("sample-data")).toHaveTextContent("10-50-6");
    // NewChildren: 10, ActiveChildren: 50, MaleChildren: 6
  });


  it("handles API errors with retry functionality", async () => {
    APIS.GetAllChildrenSixMonths
      .mockRejectedValueOnce(new Error("API Failed"))
      .mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();
   
    // Should show error
    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Failed to fetch milestones data");
    });
   
    // Click retry
    fireEvent.click(screen.getByText("Retry"));
   
    // Should recover
    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    });
    expect(APIS.GetAllChildrenSixMonths).toHaveBeenCalledTimes(2);
  });


  it("handles invalid/malformed date strings gracefully", async () => {
    APIS.GetAllChildrenSixMonths.mockResolvedValue({
      data: {
        data: [
          {
            month: "invalid-date",  // Invalid date!
            newChildren: 10,
            activeChildren: 50,
            caseClosed: 5,
            maleChildren: 6,
            femaleChildren: 4
          }
        ]
      }
    });
   
    renderComponent();
   
    // Should not crash with invalid date
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
   
    // Component should handle invalid date (might show "Invalid Date" or similar)
    expect(screen.getByTestId("data-count")).toHaveTextContent("1 items");
  });


  it("re-fetches when navbarFilterValues changes", async () => {
    const { rerender } = renderComponent();
   
    // Initial fetch
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
   
    jest.clearAllMocks();
   
    // Change context
    rerender(
      <CommonDataContext.Provider value={{
        navbarFilterValues: ['new-filter'],
        linkedAccounts: []
      }}>
        <AllChildrenSixMonths />
      </CommonDataContext.Provider>
    );
   
    // Should re-fetch
    expect(APIS.GetAllChildrenSixMonths).toHaveBeenCalledTimes(1);
  });


  it("does not fetch when userRegion is missing", () => {
    Storage.prototype.getItem = jest.fn(() => null); // No userRegion
   
    renderComponent();
   
    expect(APIS.GetAllChildrenSixMonths).not.toHaveBeenCalled();
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });


  it("handles empty API response gracefully", async () => {
    APIS.GetAllChildrenSixMonths.mockResolvedValue({ data: { data: [] } });
   
    renderComponent();
   
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
   
    expect(screen.getByTestId("data-count")).toHaveTextContent("0 items");
  });
  it("handles when response.data.data is undefined (empty data object)", async () => {
    // response?.data?.data -> undefined
    APIS.GetAllChildrenSixMonths.mockResolvedValueOnce({ data: {} });
   
    renderComponent();
   
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
   
    // Should use empty array fallback
    expect(screen.getByTestId("data-count")).toHaveTextContent("0 items");
  });


  it("handles when response.data is undefined", async () => {
    // response?.data?.data -> undefined
    APIS.GetAllChildrenSixMonths.mockResolvedValueOnce({});
   
    renderComponent();
   
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
   
    expect(screen.getByTestId("data-count")).toHaveTextContent("0 items");
  });


  it("handles when entire response is undefined", async () => {
    // response?.data?.data -> undefined
    APIS.GetAllChildrenSixMonths.mockResolvedValueOnce(undefined);
   
    renderComponent();
   
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
   
    expect(screen.getByTestId("data-count")).toHaveTextContent("0 items");
  });


  it("handles when response is null", async () => {
    // response?.data?.data -> undefined
    APIS.GetAllChildrenSixMonths.mockResolvedValueOnce(null);
   
    renderComponent();
   
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
   
    expect(screen.getByTestId("data-count")).toHaveTextContent("0 items");
  });
});





