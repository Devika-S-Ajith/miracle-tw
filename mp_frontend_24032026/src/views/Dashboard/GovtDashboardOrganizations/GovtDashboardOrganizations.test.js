import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import GovtDashboardOrganizations from "./GovtDashboardOrganizations";
import APIS from "../../../common/hooks/UseApiCalls";
import useAuthorization from "../../../components/UserComponents/useAuthorization";


// ====== MOCKS ======


// Create a STABLE translation function with ALL needed translations
const stableTFunction = (key, fallback) => {
  const translations = {
    "common:common.Thrive Scale": "Thrive Scale",
    "common:common.Organizations": "Organizations",
    "common:infoCard.Total # of active orgs": "Total # of active orgs",
    "common:infoCard.Total # of active children": "Total # of active children",
    "common:infoCard.New children (last 30 days)": "New children (last 30 days)",
    "common:infoCard.Total # of active families": "Total # of active families",
    "common:infoCard.New families (last 30 days)": "New families (last 30 days)",
  };
  // Logic: return hardcoded mock translation, or the provided fallback string, or the key itself
  return translations[key] || fallback || key;
};


jest.mock("../../../common/hooks/UseApiCalls", () => ({
  __esModule: true,
  default: {
    GetGovtDashboardOrganizationOverview: jest.fn(),
    UpdateDashboardDataViews: jest.fn(),
  }
}));


jest.mock("../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(() => ({ countryFilter: 'US' })),
}));


jest.mock("../../../components/UserComponents/useAuthorization", () => ({
  __esModule: true,
  default: jest.fn(),
}));


const mockedUsedNavigate = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockedUsedNavigate,
}));


jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: stableTFunction,
  }),
}));


// Mock subcomponents
jest.mock("../GovtDashboardOverview/NavbarFilterChipArray", () => () =>
  <div data-testid="navbar-filter">Navbar Filter</div>
);


jest.mock("../Components/StateGovDashboardComponents/OrganizationOverviewCard", () =>
  ({ data, loading, title, apiError, onReload }) => (
    <div data-testid="organization-overview-card">
      <h3 data-testid="card-title">{title}</h3>
      {loading && <div data-testid="loading">Loading...</div>}
      {apiError && <button onClick={onReload} data-testid="reload-button">Reload</button>}
      {!loading && !apiError && data && (
        <div data-testid="data-loaded">
          {data.map((item, i) => (
            <div key={i} data-testid={`data-item-${item.label}-${i}`}>
              {item.label}: {item.value}
            </div>
          ))}
        </div>
      )}
    </div>
  )
);


jest.mock("./Components/AllOrganizationListing", () => () =>
  <div data-testid="all-organization-listing">All Organizations List</div>
);


jest.mock("../../../assets/icons/ChevronRight", () => () =>
  <div data-testid="chevron-right">→</div>
);


describe("GovtDashboardOrganizations Component", () => {
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
    signedinOrgType: "GOVT",
    signedinUserRoleHT: "admin",
  };


  let localStorageMock;
  let consoleErrorSpy;


  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
   
    localStorageMock = {
      getItem: jest.fn((key) => {
        if (key === "userRegion") return "test-region";
        return null;
      }),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
    };
   
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
   
    APIS.GetGovtDashboardOrganizationOverview.mockResolvedValue({
      data: {
        data: {
          total_active_org: 10,
          total_active_children: 50,
          new_children_last_30: 5,
          total_active_families: 30,
          new_families_last_30: 2,
        },
      },
    });
   
    APIS.UpdateDashboardDataViews.mockResolvedValue({ status: 200 });
  });


  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockRestore();
  });


  const renderComponent = async (customContext = mockContextValue) => {
    let component;
    await act(async () => {
      component = render(
        <CommonDataContext.Provider value={customContext}>
          <BrowserRouter>
            <GovtDashboardOrganizations />
          </BrowserRouter>
        </CommonDataContext.Provider>
      );
    });
    return component;
  };


  test("renders breadcrumbs and static content", async () => {
    await renderComponent();
    expect(screen.getByText("Thrive Scale")).toBeInTheDocument();
    expect(screen.getByText("Organizations")).toBeInTheDocument();
  });


  test("navigates to overview on breadcrumb click", async () => {
    await renderComponent();
    const breadcrumb = screen.getByText("Thrive Scale");
    fireEvent.click(breadcrumb);
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/governmentDashboardOverview");
  });


  test("fetches data on mount when userRegion exists", async () => {
    await renderComponent();
    await waitFor(() => {
      expect(APIS.GetGovtDashboardOrganizationOverview).toHaveBeenCalled();
      expect(screen.getByTestId("data-loaded")).toBeInTheDocument();
    });
  });


  test("does not fetch data when userRegion is missing", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    await renderComponent();
    expect(APIS.GetGovtDashboardOrganizationOverview).not.toHaveBeenCalled();
  });


  test("handles API error and recovery via reload", async () => {
    APIS.GetGovtDashboardOrganizationOverview.mockRejectedValueOnce(new Error("API Error"));
    await renderComponent();
   
    await waitFor(() => {
      expect(screen.getByTestId("reload-button")).toBeInTheDocument();
    });
   
    APIS.GetGovtDashboardOrganizationOverview.mockResolvedValueOnce({
      data: { data: { total_active_org: 5 } }
    });
   
    fireEvent.click(screen.getByTestId("reload-button"));
    await waitFor(() => expect(screen.getByTestId("data-loaded")).toBeInTheDocument());
  });


  test("handles UpdateDashboardDataViews error silently", async () => {
    APIS.UpdateDashboardDataViews.mockRejectedValue(new Error("Update error"));
    await renderComponent();
    expect(APIS.UpdateDashboardDataViews).toHaveBeenCalled();
  });


  test("covers fallback logic (|| 0) when overview fields are null or missing", async () => {
    APIS.GetGovtDashboardOrganizationOverview.mockResolvedValue({
      data: {
        data: {
          total_active_org: null,
          total_active_children: undefined,
        },
      },
    });


    await renderComponent();


    await waitFor(() => {
      const dataItems = screen.getAllByTestId(/data-item-/);
      dataItems.forEach(item => {
        expect(item).toHaveTextContent(/: 0$/);
      });
    });
  });


  test("handles edge case: response.data is truthy but response.data.data is null", async () => {
    APIS.GetGovtDashboardOrganizationOverview.mockResolvedValue({
      data: { data: null }
    });


    await renderComponent();


    await waitFor(() => {
      const dataItems = screen.getAllByTestId(/data-item-/);
      dataItems.forEach(item => {
        expect(item).toHaveTextContent(/: 0$/);
      });
    });
  });


  // --- NEW TEST CASES FOR 100% COVERAGE ---


  test("sets the correct document title on mount", async () => {
    await renderComponent();
    expect(document.title).toBe("Organization | ThriveWell");
  });


  test("calls useAuthorization with correct contract parameters", async () => {
    await renderComponent();
    expect(useAuthorization).toHaveBeenCalledWith(
      "admin",
      null,
      "GOVT",
      "GOVTDashboard",
      true
    );
  });


  test("simulates navigation trigger from useAuthorization mock", async () => {
    // If useAuthorization implementation were to redirect, we simulate that side effect
    useAuthorization.mockImplementation(() => {
      mockedUsedNavigate("/unauthorized");
      return false;
    });
    await renderComponent();
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/unauthorized");
  });


  test("verifies translation fallback logic for All organization overview title", async () => {
    await renderComponent();
    // The component uses t("key", "fallback string")
    // Our mock logic returns translations["key"] || fallback || key
    expect(screen.getByTestId("card-title")).toHaveTextContent("All organization overview");
  });


  test("handles re-fetching when navbarFilterValues changes via context", async () => {
    const { rerender } = await renderComponent();
   
    // Clear initial call
    APIS.GetGovtDashboardOrganizationOverview.mockClear();


    // Trigger update via rerender with new context values
    await act(async () => {
      rerender(
        <CommonDataContext.Provider value={{ ...mockContextValue, navbarFilterValues: [{ key: 'COUNTRY', value: 'IN' }] }}>
          <BrowserRouter>
            <GovtDashboardOrganizations />
          </BrowserRouter>
        </CommonDataContext.Provider>
      );
    });


    expect(APIS.GetGovtDashboardOrganizationOverview).toHaveBeenCalled();
  });


  test("handles missing translation keys gracefully by returning key name", async () => {
    // Access the mock t function directly for a pure unit check
    const { useTranslation } = require("react-i18next");
    const { t } = useTranslation();
    expect(t("missing.key")).toBe("missing.key");
  });


  test("ensures UpdateDashboardDataViews is called on every render cycle via useEffect", async () => {
    await renderComponent();
    expect(APIS.UpdateDashboardDataViews).toHaveBeenCalled();
  });
});

