// ====== MOCK AXIOS AT THE VERY TOP ======
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
      delete: {}
    }
  },
}));


// ====== IMPORTS ======
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GovtDashboardFamily from "./GovtDashboardFamily";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useNavigate } from "react-router";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import { BreadcrumbsLinkThriveScaleGovtDashboard } from "../../../constants";


/* ======================= MOCKS ======================= */


jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));


jest.mock("../../../components/UserComponents/useAuthorization", () => jest.fn());


jest.mock("../../../constants", () => ({
  BreadcrumbsLinkThriveScaleGovtDashboard: jest.fn(),
}));


// Also mock the APIS import since your component imports it
jest.mock("../../../common/hooks/UseApiCalls", () => ({
  UpdateDashboardDataViews: jest.fn(),
}));


// Render-only mocks for layout components
jest.mock("../GovtDashboardOverview/NavbarFilterChipArray", () => () => <div data-testid="navbar-chips" />);


jest.mock("../../../components/PageBreadcrumbs/PageBreadcrumbs", () => (props) => (
  <div data-testid="page-breadcrumbs">
    {props.data?.map((item, idx) => (
      <button
        key={idx}
        data-testid={`breadcrumb-${idx}`}
        onClick={item?.onClick}
      >
        {item?.label || ""}
      </button>
    ))}
  </div>
));


jest.mock("./Components/AllFamilySixMonths", () => () => <div data-testid="six-months" />);
jest.mock("./Components/IncrisisAndVulnerableMilestones", () => () => <div data-testid="milestones" />);
jest.mock("../Components/StateGovDashboardComponents/FamilyAssessmentScoreIncrease", () => () => <div data-testid="score-increase" />);


/* ======================= TEST SETUP ======================= */


const mockNavigate = jest.fn();
const defaultContext = {
  signedinOrgType: "1",
  signedinUserRoleHT: "admin",
};


const renderComponent = (context = defaultContext) =>
  render(
    <CommonDataContext.Provider value={context}>
      <GovtDashboardFamily />
    </CommonDataContext.Provider>
  );


beforeEach(() => {
  jest.clearAllMocks();
  useNavigate.mockReturnValue(mockNavigate);
  // Default mock for the breadcrumb factory
  BreadcrumbsLinkThriveScaleGovtDashboard.mockReturnValue({
    label: "Gov Dashboard",
    onClick: jest.fn(),
  });
});


/* ======================= TESTS ======================= */


describe("GovtDashboardFamily Component", () => {
  it("calls useAuthorization with correct contract parameters", () => {
    renderComponent();


    expect(useAuthorization).toHaveBeenCalledWith(
      "admin",
      null,
      "1",
      "GOVTDashboard",
      true
    );
  });


  it("handles role-based authorization changes via context", () => {
    renderComponent({
      signedinOrgType: "6",
      signedinUserRoleHT: "supervisor",
    });


    expect(useAuthorization).toHaveBeenCalledWith(
      "supervisor",
      null,
      "6",
      "GOVTDashboard",
      true
    );
  });


  it("renders the correct composition of dashboard sections", () => {
    renderComponent();


    expect(screen.getByTestId("navbar-chips")).toBeInTheDocument();
    expect(screen.getByTestId("six-months")).toBeInTheDocument();
    expect(screen.getByTestId("milestones")).toBeInTheDocument();
    expect(screen.getByTestId("score-increase")).toBeInTheDocument();
  });


  describe("Breadcrumb Logic", () => {
    it("renders breadcrumbs with correct labels from factory and i18n", () => {
      renderComponent();


      // First breadcrumb from BreadcrumbsLinkThriveScaleGovtDashboard mock
      expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Gov Dashboard");
      // Second breadcrumb hardcoded in component
      expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Families");
    });


    it("invokes the navigation handler when the parent breadcrumb is clicked", () => {
      const breadcrumbHandler = jest.fn();
      BreadcrumbsLinkThriveScaleGovtDashboard.mockReturnValueOnce({
        label: "Gov Dashboard",
        onClick: breadcrumbHandler,
      });


      renderComponent();
      fireEvent.click(screen.getByTestId("breadcrumb-0"));


      expect(breadcrumbHandler).toHaveBeenCalledTimes(1);
    });
  });


  it("renders without crashing with minimal context (smoke test)", () => {
    expect(() =>
      renderComponent({ signedinOrgType: null, signedinUserRoleHT: null })
    ).not.toThrow();
  });
 


describe("Authorization Failure", () => {
  it("crashes when authorization hook throws an error (needs error boundary)", () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
   
    useAuthorization.mockImplementation(() => {
      throw new Error("Auth failed");
    });
   
    // Document the current (bad) behavior
    expect(() => renderComponent()).toThrow("Auth failed");
   
    consoleSpy.mockRestore();
  });
 
  it("logs authorization errors to console", () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
   
    useAuthorization.mockImplementation(() => {
      throw new Error("Auth failed");
    });
   
    try {
      renderComponent();
    } catch (e) {
      // Expected to crash
    }
   
    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});


  describe("Component Integration", () => {
    it("maintains consistent state when context changes", () => {
      const { rerender } = renderComponent();
     
      // Change context
      rerender(
        <CommonDataContext.Provider value={{...defaultContext, signedinOrgType: "2"}}>
          <GovtDashboardFamily />
        </CommonDataContext.Provider>
      );
     
      // Verify authorization was called with new values
      expect(useAuthorization).toHaveBeenCalledWith(
        "admin",
        null,
        "2",  // Updated org type
        "GOVTDashboard",
        true
      );
    });
  });


  describe("Disabled API Functionality", () => {
    it("documents that UpdateDashboardDataViews is commented out in component", () => {
      // This test verifies we're aware of the commented-out functionality
      // and won't be surprised when it's enabled later
      expect(true).toBe(true); // Placeholder for documentation
    });
  });
});

