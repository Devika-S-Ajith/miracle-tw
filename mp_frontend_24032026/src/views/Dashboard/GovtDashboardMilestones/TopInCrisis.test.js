import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TopInCrisis from "./TopInCrisis";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload } from "../../../constants";
// ====== MOCKS ======


jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));


jest.mock("../../../components/InfoTile/InfoTile", () => (props) => (
  <div data-testid="info-tile">
    <span>{props.title}</span>
    {props.preDescriptionIcon && <span data-testid="red-flag-icon">Icon</span>}
  </div>
));


jest.mock("../../../components/CommonCard", () => (props) => (
  <div data-testid="common-card">{props.children}</div>
));


jest.mock("../GovtDashboardOverview/Components/ErrorWithReload", () => (props) => (
  <div data-testid="error-reload" onClick={props.onReload}>Reload</div>
));


jest.mock("../GovtDashboardOverview/Components/NoDataFoundText", () => () => (
  <div data-testid="no-data">No Data</div>
));


jest.mock("../../../common/hooks/UseApiCalls", () => ({
  GetTopInCrisis: jest.fn(),
}));


jest.mock("../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(),
}));


const mockContext = {
  navbarFilterValues: { region: "Asia" },
  linkedAccounts: [],
  signedinOrgType: "8",
};


// ====== REUSABLE TEST DATA ======
const mockDataWithRedFlags = [
  { activeInCrisisCases: 10, milestone: "M1", redFlag: true },
  { activeInCrisisCases: 5, milestone: "M2", redFlag: false },
];


const mockEmptyData = [];
const mockNullData = null;
const mockFiveItems = Array.from({ length: 5 }, (_, i) => ({
  activeInCrisisCases: i + 1,
  milestone: `M${i + 1}`,
  redFlag: i % 2 === 0
}));


const mockOneItem = [{ activeInCrisisCases: 10, milestone: "M1", redFlag: true }];


// ====== REUSABLE MOCK FUNCTIONS ======
const setupMocks = (overrides = {}) => {
  const defaults = {
    localStorage: {
      userRegion: "Asia",
      orgId: "123"
    },
    navbarFilterPayload: { countryFilter: "IN" },
    apiResponse: { data: { data: mockDataWithRedFlags } }
  };
 
  const config = { ...defaults, ...overrides };
 
  // Setup localStorage
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === "userRegion") return config.localStorage.userRegion;
    if (key === "orgId") return config.localStorage.orgId;
    return null;
  });
 
  // Setup getNavbarFilterPayload
  getNavbarFilterPayload.mockReturnValue(config.navbarFilterPayload);
 
  // Setup API response
  if (config.apiResponse instanceof Error) {
    APIS.GetTopInCrisis.mockRejectedValue(config.apiResponse);
  } else {
    APIS.GetTopInCrisis.mockResolvedValue(config.apiResponse);
  }
 
  return config;
};


// ====== REUSABLE RENDER FUNCTION ======
const renderComponent = (contextOverrides = {}, mockOverrides = {}) => {
  setupMocks(mockOverrides);
 
  return render(
    <CommonDataContext.Provider value={{ ...mockContext, ...contextOverrides }}>
      <TopInCrisis />
    </CommonDataContext.Provider>
  );
};


describe("TopInCrisis Branch Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default setup - clean slate
    setupMocks();
  });


  // ====== CLEANER TESTS USING REUSABLE FUNCTIONS ======
 
  it("covers successful data fetch and redFlag icon branching", async () => {
    renderComponent();
   
    await waitFor(() => {
      expect(screen.getAllByTestId("info-tile")).toHaveLength(2);
      expect(screen.getAllByTestId("red-flag-icon")).toHaveLength(1);
    });
  });


  it("covers the 'signedinOrgType === 6' branch", async () => {
    renderComponent({ signedinOrgType: "6" }, {
      apiResponse: { data: { data: mockEmptyData } }
    });


    await waitFor(() => {
      const payload = APIS.GetTopInCrisis.mock.calls[0][0];
      expect(payload.accountFilter).toBeUndefined();
    });
  });


  it("covers the 'signedinOrgType !== 6' branch", async () => {
    renderComponent({ signedinOrgType: "1" }, {
      apiResponse: { data: { data: mockEmptyData } }
    });


    await waitFor(() => {
      expect(APIS.GetTopInCrisis).toHaveBeenCalledWith(
        expect.objectContaining({ accountFilter: ["123"] })
      );
    });
  });


  it("covers the || [] fallback branch when API response data is missing", async () => {
    renderComponent({}, {
      apiResponse: { data: { data: mockNullData } }
    });


    await waitFor(() => {
      expect(screen.getByTestId("no-data")).toBeInTheDocument();
    });
  });


  it("covers the error and reload branches", async () => {
    renderComponent({}, {
      apiResponse: new Error("Fail")
    });


    await waitFor(() => expect(screen.getByTestId("error-reload")).toBeInTheDocument());


    // Reset for reload
    setupMocks({ apiResponse: { data: { data: mockEmptyData } } });
    fireEvent.click(screen.getByTestId("error-reload"));


    await waitFor(() => expect(APIS.GetTopInCrisis).toHaveBeenCalledTimes(2));
  });


  it("covers the countryFilter null early return branch", async () => {
    renderComponent({}, {
      navbarFilterPayload: { countryFilter: null }
    });


    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetTopInCrisis).not.toHaveBeenCalled();
  });


  it("covers the case when signedinOrgType is falsy", async () => {
    renderComponent({ signedinOrgType: null });


    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetTopInCrisis).not.toHaveBeenCalled();
  });


  it("covers early return when userRegion is missing", async () => {
    renderComponent({}, {
      localStorage: { userRegion: null, orgId: "123" }
    });


    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetTopInCrisis).not.toHaveBeenCalled();
  });


  it("covers the case when API response.data is undefined", async () => {
    renderComponent({}, {
      apiResponse: { data: undefined }
    });


    await waitFor(() => {
      expect(screen.getByTestId("error-reload")).toBeInTheDocument();
    });
  });


  it("covers Grid layout with 1 item", async () => {
    renderComponent({}, {
      apiResponse: { data: { data: mockOneItem } }
    });


    await waitFor(() => {
      expect(screen.getAllByTestId("info-tile")).toHaveLength(1);
    });
  });


  it("covers Grid layout with 5 items", async () => {
    renderComponent({}, {
      apiResponse: { data: { data: mockFiveItems } }
    });


    await waitFor(() => {
      expect(screen.getAllByTestId("info-tile")).toHaveLength(5);
    });
  });


  // Note: The translation test needs special handling due to module mocking
  // We can keep it separate or refactor differently
});

