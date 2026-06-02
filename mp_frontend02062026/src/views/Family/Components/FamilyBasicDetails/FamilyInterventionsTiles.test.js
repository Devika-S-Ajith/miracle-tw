import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import FamilyInterventionsTiles from "./FamilyInterventionsTiles";

jest.mock("../../../../components/InfoTile/InfoTile", () => (props) => (
  <div data-testid="info-tile">
    <span>{props.description}</span>
    <span>{props.bgcolor}</span>
    <span>{props.height}</span>
    <span>{props.title}</span>
  </div>
));
jest.mock("../../../../components/CommonCard/CommonCard", () => (props) => (
  <div data-testid="common-card">
    <span>{props.title}</span>
    {props.children}
  </div>
));
jest.mock("../../../../assets/icons/SideBarIcons", () => ({
  InterventionsIconBlack: () => <span data-testid="icon" />,
}));
const mockGetFamilyInterventionSummary = jest.fn();
jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  GetFamilyInterventionSummary: (...args) => mockGetFamilyInterventionSummary(...args),
}));

describe("FamilyInterventionsTiles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading skeletons when loading", async () => {
    let resolvePromise;
    mockGetFamilyInterventionSummary.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );
    render(<FamilyInterventionsTiles familyId="123" />);
    // Check for MUI Skeletons by class name
    expect(document.querySelectorAll('.MuiSkeleton-root').length).toBe(2);
    resolvePromise({
      data: { data: { active_interventions: 1, completed_interventions: 2 } },
    });
    await waitFor(() => {
      expect(screen.getAllByTestId("info-tile").length).toBe(2);
    });
  });

  it("renders InfoTile with correct values after API resolves", async () => {
    mockGetFamilyInterventionSummary.mockResolvedValue({
      data: { data: { active_interventions: 5, completed_interventions: 7 } },
    });
    render(<FamilyInterventionsTiles familyId="456" />);
    await waitFor(() => {
      expect(screen.getAllByTestId("info-tile").length).toBe(2);
      expect(screen.getByText("Active interventions")).toBeInTheDocument();
      expect(screen.getByText("Resolved interventions")).toBeInTheDocument();
      expect(screen.getByText("#F3F6FA")).toBeInTheDocument();
      expect(screen.getByText("#F3F7E2")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getAllByTestId("icon").length).toBe(2);
    });
  });

  it("renders zero values on API error", async () => {
    mockGetFamilyInterventionSummary.mockRejectedValue(new Error("API error"));
    render(<FamilyInterventionsTiles familyId="789" />);
    await waitFor(() => {
      expect(screen.getAllByTestId("info-tile").length).toBe(2);
      expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
    });
  });

  it("renders zero values if API resolves with no data", async () => {
    mockGetFamilyInterventionSummary.mockResolvedValue({ data: {} });
    render(<FamilyInterventionsTiles familyId="no-data" />);
    await waitFor(() => {
      expect(screen.getAllByTestId("info-tile").length).toBe(2);
      expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
    });
  });

  it("does not call API if familyId is not provided", () => {
    render(<FamilyInterventionsTiles />);
    expect(mockGetFamilyInterventionSummary).not.toHaveBeenCalled();
    expect(screen.getByTestId("common-card")).toBeInTheDocument();
  });

  it("calls API with correct familyId", async () => {
    mockGetFamilyInterventionSummary.mockResolvedValue({
      data: { data: { active_interventions: 2, completed_interventions: 3 } },
    });
    render(<FamilyInterventionsTiles familyId="abc" />);
    await waitFor(() => {
      expect(mockGetFamilyInterventionSummary).toHaveBeenCalledWith("abc");
    });
  });

  it("renders correct CommonCard title", async () => {
    mockGetFamilyInterventionSummary.mockResolvedValue({
      data: { data: { active_interventions: 1, completed_interventions: 2 } },
    });
    render(<FamilyInterventionsTiles familyId="xyz" />);
    await waitFor(() => {
      expect(screen.getByText("Interventions summary")).toBeInTheDocument();
    });
  });
});