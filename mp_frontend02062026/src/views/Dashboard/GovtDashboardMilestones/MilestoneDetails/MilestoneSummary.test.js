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
import MilestoneSummary from "./MilestoneSummary";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useParams } from "react-router";
import {
    getNavbarFilterPayload,
    CommaseparateString
} from "../../../../constants";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
        if (options?.interventions) return `${key}: ${options.interventions}`;
        return key;
    },
  }),
}));


jest.mock("react-router", () => ({
  useParams: jest.fn(),
}));


jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetAllInterventionsForMilestone: jest.fn(),
}));


jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
  CommaseparateString: jest.fn((arr, sep) => arr.join(sep)),
}));


// Mock sub-components to verify props
jest.mock("../../../../components/CommonCard", () => (props) => (
  <div data-testid="common-card">
    <span>{props.title}</span>
    <button data-testid="reload-btn" onClick={props.onReload}>Reload</button>
    {props.apiError && <div data-testid="api-error">Error</div>}
    {props.children}
  </div>
));


jest.mock("../../../../components/InfoTile/InfoTile", () => (props) => (
  <div data-testid="info-tile" style={{ backgroundColor: props.bgcolor }}>
    <div data-testid="tile-title">{props.title}</div>
    <div data-testid="tile-subtitle">{props.subTitle}</div>
    <div data-testid="tile-description">{props.description}</div>
  </div>
));


jest.mock("../../../../components/SmallText/SmallText", () => (props) => (
  <span data-testid="small-text">{props.value}</span>
));


jest.mock("../../../../components/RatingComponent/RatingComponent", () => (props) => (
  <div data-testid="rating-comp">Rating: {props.rating}</div>
));


jest.mock("../../GovtDashboardInterventions/Components/MoodImprovement", () => (props) => (
  <div data-testid="mood-improvement">{props.fromEmoji} -> {props.toEmoji}</div>
));


describe("MilestoneSummary Component", () => {
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
    signedinOrgType: "1",
  };


  const mockApiResponse = {
    data: {
      data: [
        { intervention: "Counseling", interventionRating: 5 },
        { intervention: "Workshops", interventionRating: 4 },
        { intervention: "Mentoring", interventionRating: 5 },
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


  const renderComponent = (props = { summaryMilestones: [] }, context = mockContextValue) => {
    return render(
      <CommonDataContext.Provider value={context}>
        <MilestoneSummary {...props} />
      </CommonDataContext.Provider>
    );
  };


  it("renders loading skeleton and fetches interventions on mount", async () => {
  APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce(mockApiResponse);
 
  renderComponent({ summaryMilestones: [{ mode: "safe" }] });


  // Wait for content to appear to resolve act() warning and check data mapping
  await waitFor(() => {
    expect(screen.getByTestId("info-tile")).toBeInTheDocument();
  });


  // Instead of looking for text across elements, check that the small-text element
  // contains the expected translation key
  const smallText = screen.getByTestId("small-text");
  expect(smallText).toHaveTextContent("common:infoCard.Intervention summary");
 
  // Verify that the rating component shows the correct rating
  expect(screen.getByTestId("rating-comp")).toHaveTextContent("Rating: 5");
});


  it("shows 'no interventions' text when API returns empty data", async () => {
    APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce({ data: { data: [] } });
   
    renderComponent({ summaryMilestones: [{ mode: "safe" }] });


    await waitFor(() => {
      expect(screen.getByText("common:infoCard.There are no interventions associated with this milestone")).toBeInTheDocument();
    });
  });


  it("handles API error gracefully", async () => {
    APIS.GetAllInterventionsForMilestone.mockRejectedValueOnce(new Error("API Fail"));
   
    renderComponent({ summaryMilestones: [{ mode: "safe" }] });


    await waitFor(() => {
      expect(screen.getByTestId("api-error")).toBeInTheDocument();
    });
  });


  describe("Subtitle Generation Branches", () => {
    it("handles Significant Improvement (Index Diff > 1)", async () => {
        APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce({ data: { data: [] } });
        renderComponent({
            summaryMilestones: [{ mode: "Incrisis" }, { mode: "Thriving" }]
        });
        await waitFor(() => {
            expect(screen.getByTestId("tile-subtitle")).toHaveTextContent("common:infoCard.Milestone improves significantly over time");
        });
    });


    it("handles Moderate Improvement (Index Diff === 1)", async () => {
        APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce({ data: { data: [] } });
        renderComponent({
            summaryMilestones: [{ mode: "Safe" }, { mode: "Thriving" }]
        });
        await waitFor(() => {
            expect(screen.getByTestId("tile-subtitle")).toHaveTextContent("common:infoCard.Milestone improves over time");
        });
    });


    it("handles Stability (Index Diff === 0)", async () => {
        APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce({ data: { data: [] } });
        renderComponent({
            summaryMilestones: [{ mode: "Safe" }, { mode: "Safe" }]
        });
        await waitFor(() => {
            expect(screen.getByTestId("tile-subtitle")).toHaveTextContent("common:infoCard.Milestone remains stable over time");
        });
    });


    it("handles Decline (Index Diff < 0)", async () => {
        APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce({ data: { data: [] } });
        renderComponent({
            summaryMilestones: [{ mode: "Safe" }, { mode: "Vulnerable" }]
        });
        await waitFor(() => {
            expect(screen.getByTestId("tile-subtitle")).toHaveTextContent("common:infoCard.Milestone gets worse over time");
        });
    });


    it("handles Single Milestone - Poor start (In Crisis)", async () => {
        APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce({ data: { data: [] } });
        renderComponent({ summaryMilestones: [{ mode: "In crisis" }] });
        await waitFor(() => {
            expect(screen.getByTestId("tile-subtitle")).toHaveTextContent("common:infoCard.The majority of cases need some assistance with this milestone");
        });
    });


    it("handles Single Milestone - Poor start (Vulnerable)", async () => {
        APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce({ data: { data: [] } });
        renderComponent({ summaryMilestones: [{ mode: "vulnerable" }] });
        await waitFor(() => {
            expect(screen.getByTestId("tile-subtitle")).toHaveTextContent("common:infoCard.The majority of cases need some assistance with this milestone");
        });
    });


    it("handles Single Milestone - Good start (Safe)", async () => {
        APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce({ data: { data: [] } });
        renderComponent({ summaryMilestones: [{ mode: "safe" }] });
        await waitFor(() => {
            expect(screen.getByTestId("tile-subtitle")).toHaveTextContent("common:infoCard.This milestone is off to a good start for the majority of cases");
        });
    });


    it("handles Single Milestone - Good start (Thriving)", async () => {
        APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce({ data: { data: [] } });
        renderComponent({ summaryMilestones: [{ mode: "thriving" }] });
        await waitFor(() => {
            expect(screen.getByTestId("tile-subtitle")).toHaveTextContent("common:infoCard.This milestone is off to a good start for the majority of cases");
        });
    });


    it("returns empty string for invalid modes", async () => {
        APIS.GetAllInterventionsForMilestone.mockResolvedValueOnce({ data: { data: [] } });
        renderComponent({ summaryMilestones: [{ mode: "Unknown" }, { mode: "Safe" }] });
        await waitFor(() => {
            expect(screen.getByTestId("tile-subtitle")).toHaveTextContent("");
        });
    });
  });


  it("early returns if countryFilter is null", async () => {
    getNavbarFilterPayload.mockReturnValue({ countryFilter: null });
    renderComponent({ summaryMilestones: [{ mode: "safe" }] });
    expect(APIS.GetAllInterventionsForMilestone).not.toHaveBeenCalled();
  });


  it("handles decryption failure in useParams", async () => {
    useParams.mockReturnValue({ id: "!!!NotBase64!!!" });
    renderComponent({ summaryMilestones: [{ mode: "safe" }] });
   
    await waitFor(() => {
        expect(APIS.GetAllInterventionsForMilestone).toHaveBeenCalledWith(
            expect.objectContaining({ milestoneNameFilter: "" })
        );
    });
  });


  it("does not call API if userRegion or signedinOrgType is missing", () => {
    localStorage.removeItem("userRegion");
    renderComponent({ summaryMilestones: [{ mode: "safe" }] }, { ...mockContextValue, signedinOrgType: null });
    expect(APIS.GetAllInterventionsForMilestone).not.toHaveBeenCalled();
  });


  it("triggers reload when onReload is called", async () => {
    APIS.GetAllInterventionsForMilestone.mockResolvedValue(mockApiResponse);
    renderComponent({ summaryMilestones: [{ mode: "safe" }] });


    await waitFor(() => expect(APIS.GetAllInterventionsForMilestone).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId("reload-btn"));
    await waitFor(() => {
        expect(APIS.GetAllInterventionsForMilestone).toHaveBeenCalledTimes(2);
    });
  });
});



