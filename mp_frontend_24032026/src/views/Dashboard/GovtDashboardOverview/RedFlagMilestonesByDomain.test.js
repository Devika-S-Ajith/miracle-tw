import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RedFlagMilestonesByDomain from "./RedFlagMilestonesByDomain";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import { getNavbarFilterPayload } from "../../../constants";


// 1. Mock i18n
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    // Modified to allow testing the '|| row.domainName' fallback
    t: (key) => (key.includes("TranslateMe") ? key : ""),
  }),
}));


// 2. Mock Constants
jest.mock("../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(() => ({})),
}));


// 3. Mock Helpers
jest.mock("./HelperFunctions/DashboardHelperFunction", () => ({
  getDomainIcon: jest.fn(() => <span data-testid="domain-icon" />),
}));


// 4. Mock ReusableTrendTable
jest.mock("./Components/ReusableTrendTable", () => (props) => (
  <div data-testid="reusable-table">
    {props.loading ? (
      <p>Loading...</p>
    ) : (
      <div>
        {props.tableData.map((row, idx) => (
          <div key={idx} data-testid="table-row">
            {props.columns.map((col) => (
              <div key={col.id}>{col.render(row)}</div>
            ))}
          </div>
        ))}
      </div>
    )}
    <button onClick={props.onReload}>Reload</button>
    {props.apiError && <p>Error occurred</p>}
  </div>
));


// 5. Mock API
jest.mock("../../../common/hooks/UseApiCalls", () => ({
  __esModule: true,
  default: {
    GetRedFlagMilestoneByDomain: jest.fn(),
  },
}));


describe("RedFlagMilestonesByDomain Full Coverage", () => {
  const mockContextValue = {
    navbarFilterValues: { region: "IN" },
    linkedAccounts: [],
    signedinOrgType: "6",
  };


  beforeEach(() => {
    jest.clearAllMocks();
    // Default localStorage setup
    Storage.prototype.getItem = jest.fn((key) => {
        if (key === "userRegion") return "IN";
        if (key === "orgId") return "test-org";
        return null;
    });
    getNavbarFilterPayload.mockReturnValue({ countryFilter: ["IN"] });
  });


  it("covers all icon branches and successful data transformation", async () => {
    const multiBranchResponse = {
      data: {
        data: [
          {
            domainId: 1,
            domainName: "TranslateMe", // Hits t(...) path
            startingAverage: 2.0,
            endingAverage: 3.0, // Branch: final > starting (Up)
            domainData: [{
                inCrisisRedFlagCount: null, // Hits || 0
                vulnerableRedFlagCount: 2,
                cases: 0, // Number(0) is falsy, hits || 0
                totalRedFlagCount: 10,
                redFlagCount: undefined // Hits || 0
            }],
          },
          {
            domainId: 2,
            domainName: "Health", // t() returns "", hits || row.domainName path
            startingAverage: 4.0,
            endingAverage: 1.0, // Branch: final < starting (Down)
            domainData: [{ redFlagCount: 2 }],
          },
          {
            domainId: 3,
            domainName: "Safety",
            startingAverage: 6.0,
            endingAverage: 6.0, // Branch: final == starting (Forward)
            domainData: [{ redFlagCount: 0 }],
          },
          {
            domainId: 4,
            domainName: "Empty",
            domainData: [], // Branch: length === 0 path
          },
          {
            domainId: 5,
            domainName: "NullData",
            domainData: null, // Branch: !domainData path
          }
        ],
      },
    };


    APIS.GetRedFlagMilestoneByDomain.mockResolvedValueOnce(multiBranchResponse);


    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <RedFlagMilestonesByDomain />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
      expect(screen.getAllByTestId("table-row")).toHaveLength(3);
      expect(screen.getByTestId("ArrowUpwardIcon")).toBeInTheDocument();
      expect(screen.getByTestId("ArrowDownwardIcon")).toBeInTheDocument();
      expect(screen.getByTestId("ArrowForwardIcon")).toBeInTheDocument();
      // Verifies t(...) fallback
      expect(screen.getByText("Health")).toBeInTheDocument();
    });
  });


  it("covers signedinOrgType !== '6' branch and API error", async () => {
    APIS.GetRedFlagMilestoneByDomain.mockRejectedValueOnce(new Error("Fail"));


    render(
      <CommonDataContext.Provider value={{ ...mockContextValue, signedinOrgType: "1" }}>
        <RedFlagMilestonesByDomain />
      </CommonDataContext.Provider>
    );


    await waitFor(() => {
      expect(APIS.GetRedFlagMilestoneByDomain).toHaveBeenCalledWith(
        expect.objectContaining({ accountFilter: ["test-org"] })
      );
      expect(screen.getByText("Error occurred")).toBeInTheDocument();
    });
  });


  it("covers missing userRegion or orgType branches (useEffect guards)", async () => {
    // Branch: missing userRegion
    Storage.prototype.getItem.mockReturnValue(null);
    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <RedFlagMilestonesByDomain />
      </CommonDataContext.Provider>
    );
    await new Promise(r => setTimeout(r, 50));
    expect(APIS.GetRedFlagMilestoneByDomain).not.toHaveBeenCalled();


    // Branch: missing signedinOrgType
    render(
        <CommonDataContext.Provider value={{ ...mockContextValue, signedinOrgType: null }}>
          <RedFlagMilestonesByDomain />
        </CommonDataContext.Provider>
      );
    expect(APIS.GetRedFlagMilestoneByDomain).not.toHaveBeenCalled();
  });


  it("triggers reload correctly", async () => {
    APIS.GetRedFlagMilestoneByDomain.mockResolvedValue({ data: { data: [] } });
    render(
      <CommonDataContext.Provider value={mockContextValue}>
        <RedFlagMilestonesByDomain />
      </CommonDataContext.Provider>
    );


    await waitFor(() => expect(APIS.GetRedFlagMilestoneByDomain).toHaveBeenCalled());
    fireEvent.click(screen.getByText("Reload"));
    expect(APIS.GetRedFlagMilestoneByDomain).toHaveBeenCalledTimes(2);
  });
});

