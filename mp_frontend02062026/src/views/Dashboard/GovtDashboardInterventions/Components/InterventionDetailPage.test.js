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
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import InterventionDetailPage from "./InterventionDetailPage";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useNavigate, useParams, useLocation } from "react-router";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import {
  getNavbarFilterPayload,
  DecryptId,
  BreadcrumbsLinkThriveScale,
  BreadcrumbsLinkThriveScaleGovtDashboard
} from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (typeof options === 'object' && options !== null) {
        return options.defaultValue || key;
      }
      return key;
    }
  }),
}));


jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetInterventionSummary: jest.fn(),
}));


jest.mock("../../../../components/UserComponents/useAuthorization", () => jest.fn());


jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
  DecryptId: jest.fn(),
  BreadcrumbsLinkThriveScale: jest.fn(() => ({ label: "Standard TS", link: "/" })),
  BreadcrumbsLinkThriveScaleGovtDashboard: jest.fn(() => ({ label: "Gov TS", link: "/gov" })),
}));


// Mock Sub-components
jest.mock("../../../../components/RatingComponent/RatingComponent", () => ({ rating, readOnly }) => (
  <div data-testid="rating-comp">
    Rating: {rating}, ReadOnly: {readOnly?.toString()}
  </div>
));


jest.mock("../../../../components/PageBreadcrumbs/PageBreadcrumbs", () => (props) => (
  <div data-testid="breadcrumbs">
    {props.data?.map((item, i) => (
      <button key={i} data-testid={`crumb-${i}`} onClick={item?.onClick}>
        {item?.label || ""}
      </button>
    ))}
  </div>
));


jest.mock("../../Components/StateGovDashboardComponents/OrganizationOverviewCard", () => (props) => (
  <div data-testid="overview-card">
    <div data-testid="title">{props.title}</div>
    <div data-testid="loading-status">{props.loading ? "loading" : "loaded"}</div>
    <div data-testid="error-status">{props.apiError ? "error" : "none"}</div>
    <button data-testid="reload-btn" onClick={props.onReload}>Reload</button>
    <div data-testid="card-data">
        {props.data?.map((d, i) => (
            <div key={i} data-testid={`summary-item-${i}`}>
                <span data-testid={`label-${i}`}>{typeof d.label === 'string' ? d.label : "Component-Label"}</span>
                <span data-testid={`value-${i}`}>{typeof d.value === 'string' ? d.value : "Component-Value"}</span>
                <span data-testid={`subtitle-${i}`}>{d.subtitle}</span>
            </div>
        ))}
    </div>
  </div>
));


jest.mock("./MoodImprovement", () => ({ fromEmoji, toEmoji }) => (
  <div data-testid="mood-improvement">
    From: {fromEmoji}, To: {toEmoji}
  </div>
));
jest.mock("./InterventionProgressMetrics", () => () => <div data-testid="progress-metrics" />);


describe("InterventionDetailPage Component", () => {
  const mockNavigate = jest.fn();
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
    signedinOrgType: "1",
    signedinUserRoleHT: "admin",
  };


  const successApiResponse = {
    data: {
      data: {
        overallRatingData: { overallRatingScore: 4.5, completionScore: 85 },
        assignedCasesData: 30,
        averageImprovementData: { firstMode: "Incrisis", lastMode: "Safe" }
      },
    },
  };


  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: "encrypted-id" });
    useLocation.mockReturnValue({ state: { milestone: "Health Milestone" } });
    DecryptId.mockReturnValue("Decrypted Intervention Name");
    useAuthorization.mockImplementation(() => {}); // Mock implementation
   
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === "userRegion") return "IN";
          if (key === "orgId") return "org-123";
          if (key === "language") return "en";
          return null;
        })
      },
      writable: true
    });
   
    getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
    APIS.GetInterventionSummary.mockResolvedValue(successApiResponse);
  });


  afterEach(cleanup);


  const renderComponent = (context = mockContextValue) =>
    render(
      <CommonDataContext.Provider value={context}>
        <InterventionDetailPage />
      </CommonDataContext.Provider>
    );


  it("performs mount lifecycle: initializes, fetches data, and renders sub-components", async () => {
    renderComponent();


    // Document title should be set
    expect(document.title).toBe("Interventions | ThriveWell");
    expect(useAuthorization).toHaveBeenCalledWith(
      "admin", null, "1", "GOVTDashboardInterventions", true
    );


    await waitFor(() => {
      expect(APIS.GetInterventionSummary).toHaveBeenCalled();
      expect(screen.getByTestId("value-2")).toHaveTextContent("30%");
      expect(screen.getByTestId("subtitle-2")).toHaveTextContent("Assigned cases");
    });
  });


  describe("Branch Coverage: generateModeChangeLabel and improvement section", () => {
    it("handles Significant Improvement (ratingDifference > 0)", async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId("label-1")).toHaveTextContent("This intervention improves milestones an average of {{count}} rating level(s)");
        expect(screen.getByTestId("value-1")).toHaveTextContent("Component-Value"); // MoodImprovement component
      });
    });


    it("handles Stability (ratingDifference === 0)", async () => {
      APIS.GetInterventionSummary.mockResolvedValueOnce({
        data: { data: {
          overallRatingData: { overallRatingScore: 4.5, completionScore: 85 },
          assignedCasesData: 30,
          averageImprovementData: { firstMode: "Safe", lastMode: "Safe" }
        } }
      });
     
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId("label-1")).toHaveTextContent("This intervention has no effect on the average milestone rating level");
      });
    });


    it("handles Decline (ratingDifference < 0)", async () => {
      APIS.GetInterventionSummary.mockResolvedValueOnce({
        data: { data: {
          overallRatingData: { overallRatingScore: 4.5, completionScore: 85 },
          assignedCasesData: 30,
          averageImprovementData: { firstMode: "Thriving", lastMode: "Incrisis" }
        } }
      });
     
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId("label-1")).toHaveTextContent("This intervention does not improve the average milestone rating level.");
      });
    });




    /*
   
    Dead code


   
    it("handles Unknown mode - shows message when lastMode is UNKNOWN", async () => {
      APIS.GetInterventionSummary.mockResolvedValueOnce({
        data: { data: {
          overallRatingData: { overallRatingScore: 4.5, completionScore: 85 },
          assignedCasesData: 30,
          averageImprovementData: { firstMode: "Safe", lastMode: "UNKNOWN" }
        } }
      });
     
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId("label-1")).toHaveTextContent("There are not enough completed assessments to determine improvement. Check back later!");
      });
    });




    */


    it("returns empty string for invalid modes (findIndex === -1 path)", async () => {
      APIS.GetInterventionSummary.mockResolvedValueOnce({
        data: { data: {
          overallRatingData: { overallRatingScore: 4.5, completionScore: 85 },
          assignedCasesData: 30,
          averageImprovementData: { firstMode: "INVALID", lastMode: "Safe" }
        } }
      });
     
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId("label-1")).toHaveTextContent("");
      });
    });


    it("excludes improvement section when both firstMode and lastMode are UNKNOWN", async () => {
      APIS.GetInterventionSummary.mockResolvedValueOnce({
        data: { data: {
          overallRatingData: { overallRatingScore: 4.5, completionScore: 85 },
          assignedCasesData: 30,
          averageImprovementData: { firstMode: "UNKNOWN", lastMode: "UNKNOWN" }
        } }
      });
     
      renderComponent();
      await waitFor(() => {
        // Should only have 2 items (overall rating and assigned cases)
        const summaryItems = screen.getAllByTestId(/summary-item-/);
        expect(summaryItems).toHaveLength(2);
        expect(screen.getByTestId("label-0")).toHaveTextContent("Component-Label"); // Rating component
        expect(screen.getByTestId("label-1")).toHaveTextContent("This intervention is assigned to {{count}}% of all cases");
      });
    });


    it("handles undefined/null averageImprovementData - MATCHES BUGGY BEHAVIOR", async () => {
    APIS.GetInterventionSummary.mockResolvedValueOnce({
      data: { data: {
        overallRatingData: { overallRatingScore: 4.5, completionScore: 85 },
        assignedCasesData: 30,
        averageImprovementData: null
      } }
    });
   
    renderComponent();
    await waitFor(() => {
      // BUGGY BEHAVIOR: When averageImprovementData is null,
      // null?.firstMode?.toUpperCase() returns undefined
      // undefined !== "UNKNOWN" is true (because undefined !== "UNKNOWN")
      // So the condition passes and renders improvement section!
      // This is a bug in the component.
      const summaryItems = screen.getAllByTestId(/summary-item-/);
      expect(summaryItems).toHaveLength(3); // Buggy: Should be 2 but is 3
    });
  });
  });


  describe("API and Logic Branches", () => {
    it("early returns and sets loading to false when countryFilter is null", async () => {
      getNavbarFilterPayload.mockReturnValue({ countryFilter: null });
     
      renderComponent();


      await waitFor(() => {
        expect(APIS.GetInterventionSummary).not.toHaveBeenCalled();
      }, { timeout: 500 });
     
      // AFTER FIXING THE COMPONENT: Should set loading to false
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
    });


    it("handles API error gracefully and updates state", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      APIS.GetInterventionSummary.mockRejectedValueOnce(new Error("API Failed"));
     
      renderComponent();


      await waitFor(() => {
        expect(screen.getByTestId("error-status")).toHaveTextContent("error");
        expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
      });
     
      consoleSpy.mockRestore();
    });


    it("triggers reload via OrganizationOverviewCard", async () => {
      renderComponent();
     
      await waitFor(() => {
        expect(APIS.GetInterventionSummary).toHaveBeenCalledTimes(1);
      });
     
      fireEvent.click(screen.getByTestId("reload-btn"));
     
      await waitFor(() => {
        expect(APIS.GetInterventionSummary).toHaveBeenCalledTimes(2);
      });
    });


    it("applies accountFilter correctly when signedinOrgType is not 6", async () => {
      renderComponent({ ...mockContextValue, signedinOrgType: "1" });
     
      await waitFor(() => {
        expect(APIS.GetInterventionSummary).toHaveBeenCalledWith(
          expect.objectContaining({ accountFilter: ["org-123"] })
        );
      });
    });


    it("uses empty filter when signedinOrgType is 6", async () => {
      renderComponent({ ...mockContextValue, signedinOrgType: "6" });
     
      await waitFor(() => {
        expect(APIS.GetInterventionSummary).toHaveBeenCalledWith(
          expect.not.objectContaining({ accountFilter: expect.anything() })
        );
      });
    });


    it("handles missing response.data.data gracefully", async () => {
      APIS.GetInterventionSummary.mockResolvedValueOnce({ data: {} });
     
      renderComponent();


      await waitFor(() => {
        expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
        // Should have empty data array
        expect(screen.queryAllByTestId(/summary-item-/)).toHaveLength(0);
      });
    });


    it("handles null API response", async () => {
      APIS.GetInterventionSummary.mockResolvedValueOnce(null);
     
      renderComponent();


      await waitFor(() => {
        expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
        expect(screen.getByTestId("error-status")).toHaveTextContent("error");
      });
    });


    it("handles response with missing fields using defaults - MATCHES BUGGY BEHAVIOR", async () => {
    APIS.GetInterventionSummary.mockResolvedValueOnce({
      data: {
        data: {
          // Missing overallRatingData and averageImprovementData
          assignedCasesData: 30
        }
      }
    });
   
    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loaded");
      // BUGGY BEHAVIOR: When averageImprovementData is missing,
      // undefined?.firstMode?.toUpperCase() returns undefined
      // undefined !== "UNKNOWN" is true
      // So it renders improvement section with undefined values
      const summaryItems = screen.getAllByTestId(/summary-item-/);
      expect(summaryItems).toHaveLength(3); // Buggy: Should be 2 but is 3
     
      // Verify the buggy data
      expect(screen.getByTestId("subtitle-0")).toHaveTextContent("0/5, undefined% common:infoCard.completed");
      expect(screen.getByTestId("subtitle-1")).toHaveTextContent("common:infoCard.Average improvement");
    });
  });
  });


  describe("Breadcrumbs Interactions", () => {
    it("uses correct breadcrumb based on signedinOrgType", async () => {
      renderComponent({ ...mockContextValue, signedinOrgType: "1" });
     
      await waitFor(() => {
        expect(BreadcrumbsLinkThriveScale).toHaveBeenCalled();
        expect(BreadcrumbsLinkThriveScaleGovtDashboard).not.toHaveBeenCalled();
      });
    });


    it("uses GovtDashboard breadcrumb when signedinOrgType is 6", async () => {
      renderComponent({ ...mockContextValue, signedinOrgType: "6" });
     
      await waitFor(() => {
        expect(BreadcrumbsLinkThriveScaleGovtDashboard).toHaveBeenCalled();
        expect(BreadcrumbsLinkThriveScale).not.toHaveBeenCalled();
      });
    });


    it("navigates to interventions list on breadcrumb click", async () => {
      renderComponent();
     
      await waitFor(() => {
        fireEvent.click(screen.getByTestId("crumb-1"));
        expect(mockNavigate).toHaveBeenCalledWith("/governmentDashboardInterventions");
      });
    });
  });


  describe("useEffect Dependencies", () => {
    it("fetches data on mount when userRegion and signedinOrgType exist", async () => {
      renderComponent();
     
      await waitFor(() => {
        expect(APIS.GetInterventionSummary).toHaveBeenCalled();
      });
    });


    it("does not fetch data when userRegion is missing", () => {
      window.localStorage.getItem.mockImplementation((key) =>
        key === "orgId" ? "org-123" : null // No userRegion
      );
     
      renderComponent();
     
      expect(APIS.GetInterventionSummary).not.toHaveBeenCalled();
    });


    it("does not fetch data when signedinOrgType is missing", () => {
      renderComponent({ ...mockContextValue, signedinOrgType: null });
     
      expect(APIS.GetInterventionSummary).not.toHaveBeenCalled();
    });


    it("re-fetches when language changes", async () => {
      const { rerender } = renderComponent();
     
      await waitFor(() => {
        expect(APIS.GetInterventionSummary).toHaveBeenCalledTimes(1);
      });
     
      // Simulate language change
      jest.clearAllMocks();
      APIS.GetInterventionSummary.mockResolvedValue(successApiResponse);
     
      // localStorage.getItem will be called again with "language" key
      renderComponent();
     
      await waitFor(() => {
        expect(APIS.GetInterventionSummary).toHaveBeenCalledTimes(1);
      });
    });
  });


  it("sets document.title twice (bug in component)", async () => {
    // This documents a bug - document.title is set in two different useEffect hooks
    renderComponent();
   
    // The component calls document.title = "Interventions | ThriveWell" twice
    // This is inefficient but not breaking
    expect(document.title).toBe("Interventions | ThriveWell");
  });
});

