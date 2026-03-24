import { render, screen, waitFor } from "@testing-library/react";
import ActiveRedFlagMilestones from "./ActiveRedFlagMilestones";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";


// Mock i18n
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));


// Mock InfoCard
jest.mock("../../../components/InfoCard", () => ({ title, data, loading }) => (
  <div data-testid="info-card">
    <h1>{title}</h1>
    {loading ? (
      <p>Loading...</p>
    ) : (
      data.map((item, idx) => (
        <div key={idx} data-testid="info-item">
          <span>{item.label}</span>: <span>{item.value}</span>
        </div>
      ))
    )}
  </div>
));


// Mock API method
jest.mock("../../../common/hooks/UseApiCalls", () => ({
  GetGovtDashboardRedflagOverview: jest.fn(),
}));


// Mock getNavbarFilterPayload to ensure valid payload structure
jest.mock("../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(() => ({
    countryFilter: ["IN"],
    stateFilter: [],
    districtFilter: [],
    zipCodeFilter: [],
    accountFilter: [],
  })),
}));


describe("ActiveRedFlagMilestones", () => {
  const mockContextValue = {
    navbarFilterValues: [],
    linkedAccounts: [],
    signedinOrgType: "6",
  };


  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });


  afterAll(() => {
    console.error.mockRestore();
  });


  beforeEach(() => {
    jest.clearAllMocks();
   
    // Clear localStorage mock for every test to prevent leakage
    const localStorageMock = {
      getItem: jest.fn((key) => {
        if (key === "userRegion") return "IN";
        if (key === "orgId") return "123";
        return null;
      }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true
    });
  });


  it("renders default data and calls API successfully", async () => {
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValueOnce({ data: { data: [] } });


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <ActiveRedFlagMilestones />
      </CommonDataContext.Provider>
    );


    expect(screen.getByTestId("info-card")).toBeInTheDocument();
   
    // FIX: Using the repetition logic to handle multiple matching labels
    await waitFor(() => {
      const elements = screen.getAllByText(/common:Families with active/i);
      expect(elements.length).toBeGreaterThanOrEqual(2);
    });
  });


  it("calls API and updates data if response is successful", async () => {
    const mockApiResponse = {
      data: {
        data: [
          {
            familiesWithIncrisisRedflagMilestone: 5,
            familiesWithVulnerableRedflagMilestone: 8,
            totalFamily: 20,
            childrenWithIncrisisRedflagMilestone: 3,
            childrenWithVulnerableRedflagMilestone: 7,
            totalChildren: 25,
          },
        ],
      },
    };


    APIS.GetGovtDashboardRedflagOverview.mockResolvedValueOnce(mockApiResponse);


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <ActiveRedFlagMilestones />
      </CommonDataContext.Provider>
    );


    expect(await screen.findByText("5 / 20")).toBeInTheDocument();
    expect(screen.getByText("8 / 20")).toBeInTheDocument();
    expect(screen.getByText("3 / 25")).toBeInTheDocument();
    expect(screen.getByText("7 / 25")).toBeInTheDocument();
  });


  it("covers branch where signedinOrgType is not 6", async () => {
    const customContext = { ...mockContextValue, signedinOrgType: "8" };
    APIS.GetGovtDashboardRedflagOverview.mockResolvedValueOnce({ data: { data: [] } });


    render(
      <CommonDataContext.Provider value={customContext}>
        <ActiveRedFlagMilestones />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
      expect(APIS.GetGovtDashboardRedflagOverview).toHaveBeenCalled();
      const calledPayload = APIS.GetGovtDashboardRedflagOverview.mock.calls[0][0];
      expect(calledPayload).toHaveProperty("accountFilter");
    });
  });


  it("handles API error gracefully and hits catch block", async () => {
    APIS.GetGovtDashboardRedflagOverview.mockRejectedValueOnce(new Error("API Error"));


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <ActiveRedFlagMilestones />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
      expect(screen.getAllByText("0/0")).toHaveLength(4);
      expect(console.error).toHaveBeenCalled();
    });
  });


  it("skips fetchData if userRegion is missing", async () => {
    // FIX: Completely override the localStorage mock before rendering
    const emptyLocalStorage = {
      getItem: jest.fn().mockReturnValue(null),
    };
    Object.defineProperty(window, 'localStorage', {
      value: emptyLocalStorage,
      configurable: true
    });


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <ActiveRedFlagMilestones />
      </CommonDataContext.Provider>
    );


    // Short wait to ensure no async effect triggered the API
    await new Promise((r) => setTimeout(r, 50));
    expect(APIS.GetGovtDashboardRedflagOverview).not.toHaveBeenCalled();
  });
});

