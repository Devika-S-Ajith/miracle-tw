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
import MilestoneRatingsTrendByAssessment from "./MilestoneRatingsTrendByAssessment";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useParams } from "react-router";
import { getNavbarFilterPayload } from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));


jest.mock("react-router", () => ({
  useParams: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetMilestoneRatingsTrendByAssessment: jest.fn(),
}));


jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
}));


jest.mock("../../Components/StateGovDashboardComponents/MoodImageMapping", () => ({
  MoodImageMapping: {
    THRIVING: "thriving.png",
    SAFE: "safe.png",
    VULNERABLE: "vulnerable.png",
    "IN-CRISIS": "incrisis.png",
  },
}));


jest.mock("../../../../components/SmallText/SmallText", () => (props) => (
  <span data-testid="small-text">{props.value}</span>
));


// Mock ReusableTrendTable and expose internal functions via test triggers
jest.mock("../../GovtDashboardOverview/Components/ReusableTrendTable", () => (props) => (
  <div data-testid="trend-table">
    <div data-testid="loading-state">{props.loading ? "loading" : "loaded"}</div>
    <button data-testid="reload-btn" onClick={() => props.onReload({ page: 1 })}>Reload</button>
    {/* Trigger for Branch Coverage: passing null to test the fallback || {} */}
    <button data-testid="reload-null" onClick={() => props.onReload(null)}>Reload Null</button>
    <div data-testid="table-content">
      {props.tableData?.map((row, i) => (
        <div key={`${row.assessmentNumber}-${i}`} data-testid={`row-${i}`}>
          {props.columns.map(col => (
             <div key={`${col.id}-${i}`} data-testid={`cell-${col.id}-${i}`}>
                {col.render ? col.render(row, row[col.id]) : row[col.id]}
             </div>
          ))}
        </div>
      ))}
    </div>
  </div>
));


describe("MilestoneRatingsTrendByAssessment Component", () => {
  const mockSetSummaryMilestones = jest.fn();
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
    signedinOrgType: "1",
  };


  const mockApiResponse = {
    data: {
      data: [
        {
          assessmentNumber: 1,
          mode: "thriving",
          thrivingPercent: 50,
          safePercent: 30,
          vulnerablePercent: 10,
          inCrisisPercent: 10,
          familyCount: 5,
          childCount: 10,
          averageMilestoneScorePercent: 75,
        }
      ]
    }
  };


  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("userRegion", "IN");
    localStorage.setItem("orgId", "org-123");
    useParams.mockReturnValue({ id: btoa("Test Milestone") });
    getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
  });


  const renderComponent = (contextValue = mockContextValue) => {
    return render(
      <CommonDataContext.Provider value={contextValue}>
        <MilestoneRatingsTrendByAssessment setSummaryMilestones={mockSetSummaryMilestones} />
      </CommonDataContext.Provider>
    );
  };


  it("renders correctly and fetches data", async () => {
    APIS.GetMilestoneRatingsTrendByAssessment.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();


    await waitFor(() => {
      expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
    });


    expect(APIS.GetMilestoneRatingsTrendByAssessment).toHaveBeenCalled();
    // Verify assessment label exists
    expect(screen.getAllByText(/Assessment 1/i).length).toBeGreaterThan(0);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });


  it("handles summary milestone selection logic (1 item vs 2+ items)", async () => {
    // Case 1: Single item
    APIS.GetMilestoneRatingsTrendByAssessment.mockResolvedValueOnce(mockApiResponse);
    renderComponent();
    await waitFor(() => expect(mockSetSummaryMilestones).toHaveBeenCalled());
   
    // Case 2: Multiple items (should pick first and last)
    const multiApiResponse = {
      data: {
        data: [
          { assessmentNumber: 1, thrivingPercent: 10, mode: "safe" },
          { assessmentNumber: 2, thrivingPercent: 20, mode: "safe" },
          { assessmentNumber: 3, thrivingPercent: 30, mode: "safe" }
        ]
      }
    };
    APIS.GetMilestoneRatingsTrendByAssessment.mockResolvedValueOnce(multiApiResponse);
    renderComponent();
    await waitFor(() => {
      expect(mockSetSummaryMilestones).toHaveBeenCalledWith([
        expect.objectContaining({ assessmentNumber: 1 }),
        expect.objectContaining({ assessmentNumber: 3 })
      ]);
    });
  });


  it("covers hover interaction logic (OnBarHoverComponent and SegmentLeave cleanup)", async () => {
    APIS.GetMilestoneRatingsTrendByAssessment.mockResolvedValueOnce(mockApiResponse);
    renderComponent();


    await waitFor(() => expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded"));


    const barSegments = screen.getAllByTestId("bar-segment");
   
    // 1. Simulate mouse enter (triggers handleSegmentHover)
    fireEvent.mouseEnter(barSegments[0]);


    await waitFor(() => {
      // Use getAllByText because it appears in both table cell and popper
      expect(screen.getAllByText(/Assessment 1/i).length).toBeGreaterThan(1);
     
      // Use function matcher to find text potentially split across elements
      expect(screen.getByText((content) =>
          content.includes("5") && content.includes("Families") &&
          content.includes("|") && content.includes("10") && content.includes("Children")
      )).toBeInTheDocument();
     
      expect(screen.getByText(/50% Thriving/i)).toBeInTheDocument();
    });


    // 2. Simulate mouse leave (triggers handleSegmentLeave for cleanup branch coverage)
    fireEvent.mouseLeave(barSegments[0]);
   
    // Ensure the tooltip disappears (MUI Popper cleanup)
    await waitFor(() => {
        expect(screen.queryByText(/50% Thriving/i)).not.toBeInTheDocument();
    });
  });


  it("handles API errors gracefully", async () => {
    APIS.GetMilestoneRatingsTrendByAssessment.mockRejectedValueOnce(new Error("API Error"));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
    });
  });


  it("early returns if countryFilter is null", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });
    renderComponent();
    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetMilestoneRatingsTrendByAssessment).not.toHaveBeenCalled();
  });


  it("handles decryption errors in useParams safely", async () => {
    useParams.mockReturnValue({ id: "invalid-base-64!!!" });
    APIS.GetMilestoneRatingsTrendByAssessment.mockResolvedValueOnce(mockApiResponse);
   
    renderComponent();


    await waitFor(() => {
      expect(APIS.GetMilestoneRatingsTrendByAssessment).toHaveBeenCalledWith(
        expect.objectContaining({ milestoneNameFilter: "" })
      );
    });
  });


  it("does not fetch if userRegion or signedinOrgType is missing", () => {
    localStorage.removeItem("userRegion");
    renderComponent({ ...mockContextValue, signedinOrgType: null });
    expect(APIS.GetMilestoneRatingsTrendByAssessment).not.toHaveBeenCalled();
  });


  it("triggers reload and handles null params coverage (Line 174 coverage fix)", async () => {
    APIS.GetMilestoneRatingsTrendByAssessment.mockResolvedValue(mockApiResponse);
    renderComponent();


    await waitFor(() => expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded"));
   
    // Explicitly pass null to trigger (params || {}) fallback
    fireEvent.click(screen.getByTestId("reload-null"));
   
    await waitFor(() => {
        expect(APIS.GetMilestoneRatingsTrendByAssessment).toHaveBeenCalledTimes(2);
    });
  });


  it("covers empty accountFilter branch when signedinOrgType is '6'", async () => {
    APIS.GetMilestoneRatingsTrendByAssessment.mockResolvedValueOnce(mockApiResponse);
    renderComponent({ ...mockContextValue, signedinOrgType: "6" });


    await waitFor(() => {
        expect(APIS.GetMilestoneRatingsTrendByAssessment).toHaveBeenCalledWith(
            expect.not.objectContaining({ accountFilter: ["org-123"] })
        );
    });
  });


  it("covers fallback branches for missing API data (Line 233 coverage)", async () => {
    const incompleteData = {
        data: {
            data: [{
                assessmentNumber: 1,
                mode: "safe",
                thrivingPercent: null, // Triggers || 0 fallback
                familyCount: 0,
                childCount: 0
            }]
        }
    };
    APIS.GetMilestoneRatingsTrendByAssessment.mockResolvedValueOnce(incompleteData);
    renderComponent();


    await waitFor(() => expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded"));
   
    // Hover check to confirm 0% is rendered
    const barSegments = screen.getAllByTestId("bar-segment");
    fireEvent.mouseEnter(barSegments[0]);
    expect(screen.getByText(/0% Thriving/i)).toBeInTheDocument();
  });
});

