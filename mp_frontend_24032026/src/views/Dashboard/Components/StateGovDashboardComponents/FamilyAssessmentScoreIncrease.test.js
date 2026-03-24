import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FamilyAssessmentScoreIncrease from "./FamilyAssessmentScoreIncrease";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
const { getNavbarFilterPayload } = require("../../../../constants");

// Mock dependencies
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback || key }),
}));
jest.mock("react-router", () => ({
  useParams: () => ({ id: "test-id" }),
}));
jest.mock("../../../../components/Barchart/Barchart", () => (props) => {
  return (
    <div data-testid="barchart-mock">
      <span data-testid="title">{props.title}</span>
      <span data-testid="subTitle">{props.subTitle}</span>
      <span data-testid="loading">{props.loading ? "loading" : "loaded"}</span>
      <span data-testid="apiError">{props.apiError ? "error" : "noerror"}</span>
      <span data-testid="categories">{props.categories.map((cat) => cat.label).join(",")}</span>
      <button onClick={() => { props.onReload(); }}>Reload</button>
      {/* Always render hover details for first data item if present */}
      {props.data && props.data.length > 0 && (
        <div data-testid="bar-hover">{props.hoverComponent(props.data[0])}</div>
      )}
    </div>
  );
});
jest.mock("../../../../components/BodyText/BodyText", () => ({ value }) => <span>{value}</span>);
jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetFamilyAssessmentScoreImprovements: jest.fn(),
}));
jest.mock("../../../../constants", () => ({
  getNavbarFilterPayload: jest.fn(() => ({
    countryFilter: "IN",
  })),
}));

const mockContext = {
  navbarFilterValues: [{ key: "countryFilter", id: "IN", value: "IN" }],
  linkedAccounts: [],
};

describe("FamilyAssessmentScoreIncrease", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => "IN");
  });

  it("renders loading state initially", async () => {
    APIS.GetFamilyAssessmentScoreImprovements.mockResolvedValue({ data: { data: [] } });
    render(
      <CommonDataContext.Provider value={mockContext}>
        <FamilyAssessmentScoreIncrease />
      </CommonDataContext.Provider>
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));
  });

  it("renders chart with API data after call", async () => {
    APIS.GetFamilyAssessmentScoreImprovements.mockResolvedValue({
      data: {
        data: [
          {
            improvementcategory: "Improvement",
            familycount: 10,
            activefamilycount: 7,
            inactivefamilycount: 3,
          },
        ],
      },
    });
    render(
      <CommonDataContext.Provider value={mockContext}>
        <FamilyAssessmentScoreIncrease />
      </CommonDataContext.Provider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));
    expect(screen.getByTestId("barchart-mock")).toBeInTheDocument();
    expect(screen.getByTestId("title")).toHaveTextContent("Family assessment score increases");
    expect(screen.getByTestId("subTitle")).toHaveTextContent(
      "All active and inactive families with at least 2 assessments"
    );
    expect(screen.getByTestId("categories")).toHaveTextContent("Improvement");
    expect(screen.getByText("7 Active families")).toBeInTheDocument();
    expect(screen.getByText("3 Inactive families")).toBeInTheDocument();
  });

  it("shows error message on API failure", async () => {
    APIS.GetFamilyAssessmentScoreImprovements.mockRejectedValue(new Error("API Error"));
    render(
      <CommonDataContext.Provider value={mockContext}>
        <FamilyAssessmentScoreIncrease />
      </CommonDataContext.Provider>
    );
    await waitFor(() => expect(screen.getByTestId("apiError")).toHaveTextContent("error"));
  });

// Only mock BarChartGraph for tests that do not require reload logic
// For the reload test, unmock it:
jest.unmock("../../../../components/Barchart/Barchart");

it("calls onReload when reload button is clicked", async () => {
  APIS.GetFamilyAssessmentScoreImprovements.mockResolvedValue({ data: { data: [] } });
  render(
    <CommonDataContext.Provider value={mockContext}>
      <FamilyAssessmentScoreIncrease />
    </CommonDataContext.Provider>
  );
  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));
  fireEvent.click(screen.getByText("Reload"));
  await waitFor(() => expect(APIS.GetFamilyAssessmentScoreImprovements).toHaveBeenCalledTimes(2));
});

  it("does not call API if countryFilter is null", async () => {
    getNavbarFilterPayload.mockReturnValueOnce({ countryFilter: null });
    render(
      <CommonDataContext.Provider value={mockContext}>
        <FamilyAssessmentScoreIncrease />
      </CommonDataContext.Provider>
    );
    await waitFor(() => expect(APIS.GetFamilyAssessmentScoreImprovements).not.toHaveBeenCalled());
  });

  it("does not call API if userRegion is missing", async () => {
    Storage.prototype.getItem = jest.fn(() => null);
    render(
      <CommonDataContext.Provider value={mockContext}>
        <FamilyAssessmentScoreIncrease />
      </CommonDataContext.Provider>
    );
    await waitFor(() => expect(APIS.GetFamilyAssessmentScoreImprovements).not.toHaveBeenCalled());
  });
});