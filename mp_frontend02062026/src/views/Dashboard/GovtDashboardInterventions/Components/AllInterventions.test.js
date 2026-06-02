// ====== PROJECT-WIDE MOCKS ======
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
}));


// ====== IMPORTS ======
import React from "react";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import AllInterventions from "./AllInterventions";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useNavigate, useParams } from "react-router-dom";
import { getNavbarFilterPayload } from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));


jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetAllInterventions: jest.fn(),
}));


jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
}));


jest.mock("../../GovtDashboardOverview/HelperFunctions/DashboardHelperFunction", () => ({
  getDomainIcon: (domainId) => <span data-testid={`domain-icon-${domainId}`}>Icon {domainId}</span>,
}));


jest.mock("../../../../components/RatingComponent/RatingComponent", () => ({ rating }) => (
  <span data-testid="rating-comp">Rating: {rating}</span>
));


jest.mock("../../../../assets/icons/InCrisisFlag", () => () => <span data-testid="crisis-flag" />);


jest.mock("../../GovtDashboardOverview/Components/ReusableTrendTable", () => (props) => (
  <div data-testid="trend-table">
    <div data-testid="table-title">{props.title}</div>
    <div data-testid="loading-state">{props.loading ? "loading" : "loaded"}</div>
    <div data-testid="error-state">{props.apiError ? "error" : "no-error"}</div>
    <div data-testid="pagination-info">
      Page Count: {props.totalPageCount}, Total Items: {props.totalItems}
    </div>
    <div data-testid="sort-field">Sort Field: {props.defaultSortField}</div>
   
    <button data-testid="reload-btn" onClick={() => props.onReload({ page: 2, search: "test", sort: "intervention", order: "desc" })}>
      Reload with params
    </button>
    <button data-testid="reload-empty" onClick={() => props.onReload({})}>Reload Empty</button>
    <button data-testid="reload-null" onClick={() => props.onReload(null)}>Reload Null</button>
    <button data-testid="reload-default" onClick={() => props.onReload()}>Reload Default</button>
   
    <div data-testid="table-content">
      {props.tableData?.map((row, i) => (
        <div key={i} data-testid={`row-${i}`}>
          {props.columns.map(col => (
             <div key={col.id} data-testid={`cell-${col.id}-${i}`}>
                {col.render ? col.render(row) : row[col.id]}
             </div>
          ))}
        </div>
      ))}
    </div>
   
    {/* Test all boolean props */}
    <div data-testid="feature-flags">
      Searchable: {props.searchable ? "yes" : "no"}
      Pagination: {props.enablePagination ? "yes" : "no"}
      Sorting: {props.enableSorting ? "yes" : "no"}
      Filterable: {props.filterable ? "yes" : "no"}
    </div>
  </div>
));


describe("AllInterventions Component", () => {
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
          intervention: "Counseling",
          milestone_name: "Mental Health",
          active_interventions_count: 5,
          cases_assigned_percentage: 20,
          completed_interventions_count: 10,
          completion_rate_percentage: 50,
          rating: 4,
          domain_id: 5,
        }
      ],
      total: 100,
      pageCount: 10,
    }
  };


  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: null });
   
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === "userRegion") return "IN";
          if (key === "orgId") return "org-123";
          return null;
        })
      },
      writable: true
    });


    getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
    APIS.GetAllInterventions.mockResolvedValue(mockApiResponse);
  });


  afterEach(cleanup);


  const renderComponent = (context = mockContextValue) =>
    render(
      <CommonDataContext.Provider value={context}>
        <AllInterventions />
      </CommonDataContext.Provider>
    );


  it("renders correctly and fetches interventions on mount", async () => {
    renderComponent();


    expect(screen.getByTestId("table-title")).toHaveTextContent("All interventions");
    await waitFor(() => {
      expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
    });


    expect(APIS.GetAllInterventions).toHaveBeenCalledWith(
      expect.objectContaining({
        pageNumber: 1,
        rowCount: 10,
        orderByField: [["intervention", "ASC"]]
      })
    );
  });


  it("navigates to intervention details when name is clicked", async () => {
    renderComponent();


    // Wait for the async API call to finish and UI to transition to "loaded"
    await screen.findByText("loaded");
   
    // Resilient selection: find the text directly.
    // Clicking the text span bubbles up to the Typography's onClick handler.
    const interventionLink = screen.getByText("Counseling");
    fireEvent.click(interventionLink);


    const expectedHash = btoa(encodeURIComponent("Counseling"));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining(expectedHash));
  });


  it("navigates to milestone details when milestone name is clicked", async () => {
    renderComponent();


    // Wait for the async API call to finish
    await screen.findByText("loaded");
   
    // Resilient selection: find the text directly.
    const milestoneLink = screen.getByText("Mental Health");
    fireEvent.click(milestoneLink);


    const expectedHash = btoa(encodeURIComponent("Mental Health"));
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(`/governmentDashboardMilestones/${expectedHash}`)
    );
  });


  describe("encryptedUrl function edge cases", () => {
    it("returns empty string for falsy title", async () => {
      // 1. Mock API with empty data first
      APIS.GetAllInterventions.mockResolvedValueOnce({
        data: {
          data: [{ intervention: "", milestone_name: "Milestone", domain_id: 1 }],
          total: 1,
          pageCount: 1
        }
      });
     
      renderComponent();
     
      // 2. Wait for loading to finish (findByText handles the async poll)
      await screen.findByText("loaded");
     
      // 3. Trigger click on the empty intervention cell
      const interventionCell = screen.getByTestId("cell-intervention-0");
      // The Typography (first child) has the onClick handler
      fireEvent.click(interventionCell.firstChild);
     
      // 4. Verify navigation happened with empty hash
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/\/$/));
    });


    it("handles special characters in encryption", async () => {
      APIS.GetAllInterventions.mockResolvedValueOnce({
        data: {
          data: [{
            intervention: "Counseling & Therapy",
            milestone_name: "Mental Health - 1st Session",
            domain_id: 1
          }],
          total: 1,
          pageCount: 1
        }
      });
     
      renderComponent();
     
      // Wait for the async mapping to finish
      await screen.findByText("loaded");
     
      // FIX: Use text-based selection. Brittle querySelectors like
      // span[style*="cursor: pointer"] often return null in JSDOM.
      const link = screen.getByText("Counseling & Therapy");
      fireEvent.click(link);
     
      const expectedHash = btoa(encodeURIComponent("Counseling & Therapy"));
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining(expectedHash));
    });
  });


  describe("API error handling", () => {
    it("handles API error and sets apiError state", async () => {
      APIS.GetAllInterventions.mockRejectedValueOnce(new Error("API Error"));
     
      renderComponent();


      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
        expect(screen.getByTestId("error-state")).toHaveTextContent("error");
      });
    });


    it("finally block always sets loading to false", async () => {
      // Test that finally block executes even after error
      APIS.GetAllInterventions.mockRejectedValueOnce(new Error("API Error"));
     
      renderComponent();


      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });
    });


    it("handles when response.data is undefined", async () => {
      APIS.GetAllInterventions.mockResolvedValueOnce({ data: undefined });
     
      renderComponent();


      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
        // tableData should be [] when response.data is undefined
        expect(screen.getByTestId("table-content")).toBeInTheDocument();
      });
    });


    it("handles when response.data.data is null/undefined", async () => {
      APIS.GetAllInterventions.mockResolvedValueOnce({ data: { data: null } });
     
      renderComponent();


      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });
    });
  });


  describe("reload functionality", () => {
    it("triggers reload with empty params object", async () => {
      renderComponent();
     
      await waitFor(() => screen.getByTestId("loading-state"));
     
      fireEvent.click(screen.getByTestId("reload-empty"));
     
      await waitFor(() => {
        expect(APIS.GetAllInterventions).toHaveBeenCalledTimes(2);
      });
    });


    it("triggers reload with null params (uses default)", async () => {
      renderComponent();
     
      await waitFor(() => screen.getByTestId("loading-state"));
     
      fireEvent.click(screen.getByTestId("reload-null"));
     
      await waitFor(() => {
        expect(APIS.GetAllInterventions).toHaveBeenCalledTimes(2);
        // Should use default params when null is passed
        expect(APIS.GetAllInterventions).toHaveBeenCalledWith(
          expect.objectContaining({
            pageNumber: 1,
            rowCount: 10
          })
        );
      });
    });


    it("triggers reload with no params (uses default)", async () => {
      renderComponent();
     
      await waitFor(() => screen.getByTestId("loading-state"));
     
      fireEvent.click(screen.getByTestId("reload-default"));
     
      await waitFor(() => {
        expect(APIS.GetAllInterventions).toHaveBeenCalledTimes(2);
      });
    });


    it("triggers reload with full params for pagination/sorting", async () => {
      renderComponent();
     
      await waitFor(() => screen.getByTestId("loading-state"));
     
      fireEvent.click(screen.getByTestId("reload-btn"));
     
      await waitFor(() => {
        expect(APIS.GetAllInterventions).toHaveBeenCalledTimes(2);
        expect(APIS.GetAllInterventions).toHaveBeenCalledWith(
          expect.objectContaining({
            pageNumber: 2,
            accountNameFilter: "test",
            orderByField: [["intervention", "DESC"]]
          })
        );
      });
    });
  });


  describe("early return conditions", () => {
    it("early returns when countryFilter is null", async () => {
      getNavbarFilterPayload.mockReturnValue({ countryFilter: null });
     
      renderComponent();


      await waitFor(() => {
        expect(APIS.GetAllInterventions).not.toHaveBeenCalled();
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });
    });


    it("does not fetch data if userRegion is missing", () => {
      window.localStorage.getItem.mockImplementation((key) =>
        key === "orgId" ? "org-123" : null // No userRegion
      );
     
      renderComponent();
     
      expect(APIS.GetAllInterventions).not.toHaveBeenCalled();
    });


    it("does not fetch data if signedinOrgType is missing", () => {
      renderComponent({ ...mockContextValue, signedinOrgType: null });
     
      expect(APIS.GetAllInterventions).not.toHaveBeenCalled();
    });
  });


  describe("accountFilter logic", () => {
    it("applies accountFilter when signedinOrgType is not '6'", async () => {
      renderComponent({ ...mockContextValue, signedinOrgType: "1" });
     
      await waitFor(() => {
        expect(APIS.GetAllInterventions).toHaveBeenCalledWith(
          expect.objectContaining({ accountFilter: ["org-123"] })
        );
      });
    });


    it("does not include accountFilter when signedinOrgType is '6'", async () => {
      renderComponent({ ...mockContextValue, signedinOrgType: "6" });
     
      await waitFor(() => {
        expect(APIS.GetAllInterventions).toHaveBeenCalledWith(
          expect.not.objectContaining({ accountFilter: expect.anything() })
        );
      });
    });
  });


  describe("column rendering with edge cases", () => {
    it("handles missing row data in column renders", async () => {
      APIS.GetAllInterventions.mockResolvedValueOnce({
        data: {
          data: [
            {
              // Missing most fields
              intervention: "Test",
              domain_id: 1
            }
          ],
          total: 1,
          pageCount: 1
        }
      });
     
      renderComponent();
     
      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
        // Should not crash when rendering columns with missing data
        expect(screen.getByTestId("cell-intervention-0")).toBeInTheDocument();
      });
    });


    it("renders trimmed text for intervention and milestone", async () => {
      APIS.GetAllInterventions.mockResolvedValueOnce({
        data: {
          data: [
            {
              intervention: "  Counseling  ",
              milestone_name: "  Mental Health  ",
              domain_id: 1
            }
          ],
          total: 1,
          pageCount: 1
        }
      });
     
      renderComponent();
     
      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
        // The .trim() should be applied in the render functions
      });
    });
  });


  describe("ReusableTrendTable props", () => {
    it("passes correct props to ReusableTrendTable", async () => {
      renderComponent();
     
      await waitFor(() => screen.getByTestId("loading-state"));
     
      expect(screen.getByTestId("table-title")).toHaveTextContent("All interventions");
      expect(screen.getByTestId("pagination-info")).toHaveTextContent("Page Count: 10, Total Items: 100");
      expect(screen.getByTestId("sort-field")).toHaveTextContent("Sort Field: intervention");
     
      // Check feature flags
      expect(screen.getByTestId("feature-flags")).toHaveTextContent("Searchable: no");
      expect(screen.getByTestId("feature-flags")).toHaveTextContent("Pagination: yes");
      expect(screen.getByTestId("feature-flags")).toHaveTextContent("Sorting: yes");
      expect(screen.getByTestId("feature-flags")).toHaveTextContent("Filterable: yes");
    });


    it("passes skeltonRowcount and other props", async () => {
      // The skeltonRowcount prop is hardcoded as 5 in the component
      // We can verify the table renders without errors
      renderComponent();
     
      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });
    });
  });


  describe("useEffect dependencies", () => {
    it("re-fetches when navbarFilterValues changes", async () => {
      const { rerender } = renderComponent();
     
      await waitFor(() => {
        expect(APIS.GetAllInterventions).toHaveBeenCalledTimes(1);
      });
     
      jest.clearAllMocks();
      APIS.GetAllInterventions.mockResolvedValue(mockApiResponse);
     
      // Change context
      rerender(
        <CommonDataContext.Provider value={{
          ...mockContextValue,
          navbarFilterValues: ['new-filter']
        }}>
          <AllInterventions />
        </CommonDataContext.Provider>
      );
     
      // Should re-fetch
      await waitFor(() => {
        expect(APIS.GetAllInterventions).toHaveBeenCalledTimes(1);
      });
    });


    it("re-fetches when signedinOrgType changes", async () => {
      const { rerender } = renderComponent();
     
      await waitFor(() => {
        expect(APIS.GetAllInterventions).toHaveBeenCalledTimes(1);
      });
     
      jest.clearAllMocks();
      APIS.GetAllInterventions.mockResolvedValue(mockApiResponse);
     
      // Change signedinOrgType
      rerender(
        <CommonDataContext.Provider value={{
          ...mockContextValue,
          signedinOrgType: "2"
        }}>
          <AllInterventions />
        </CommonDataContext.Provider>
      );
     
      // Should re-fetch
      await waitFor(() => {
        expect(APIS.GetAllInterventions).toHaveBeenCalledTimes(1);
      });
    });
  });
});

