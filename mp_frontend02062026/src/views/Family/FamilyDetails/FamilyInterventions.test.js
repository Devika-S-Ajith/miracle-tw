import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FamilyInterventions from "./FamilyInterventions";

// Mock API
jest.mock("../../../common/hooks/UseApiCalls", () => ({
  GetFamilyInterventionList: jest.fn(),
}));

// Track props passed to IndividualInterventions
let lastProps = null;
jest.mock("../../../components/IndividualInterventions", () => (props) => {
  lastProps = props;
  return <div data-testid="individual-interventions" />;
});

describe("FamilyInterventions", () => {
  beforeEach(() => {
    lastProps = null;
    jest.clearAllMocks();
  });

  it("renders IndividualInterventions with correct props", () => {
    const memberList = [
      { id: 1, firstName: "John", lastName: "Doe" },
      { id: 2, firstName: "Jane", lastName: "Smith" },
    ];
    render(<FamilyInterventions familyId={42} memberList={memberList} />);
    expect(screen.getByTestId("individual-interventions")).toBeInTheDocument();
    expect(lastProps.id).toEqual({ HTFamilyId: 42 });
    expect(lastProps.memberList).toBe(memberList);
    expect(typeof lastProps.getTableData).toBe("function");
  });

  it("calls getTableData with correct payload", () => {
    const { GetFamilyInterventionList } = require("../../../common/hooks/UseApiCalls");
    GetFamilyInterventionList.mockResolvedValue({ data: [] });
    render(<FamilyInterventions familyId={99} memberList={[]} />);
    // Simulate a call to getTableData
    lastProps.getTableData({ foo: "bar" });
    expect(GetFamilyInterventionList).toHaveBeenCalledWith({ foo: "bar" });
  });
});