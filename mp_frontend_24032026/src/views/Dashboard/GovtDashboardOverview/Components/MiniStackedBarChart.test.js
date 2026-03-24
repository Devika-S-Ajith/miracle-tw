import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MiniStackedBarChart from "./MiniStackedBarChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";


// Mock i18next to prevent translation errors
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));


const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};


describe("MiniStackedBarChart", () => {
  const mockAssessments = [
    {
      inCrisis: 1,
      vulnerable: 1,
      total: 4,
      cases: 2,
      totalRedFlagCount: 10
    },
    {
      inCrisis: 2,
      vulnerable: 0,
      total: 4,
      cases: 2,
      totalRedFlagCount: 10
    }
  ];


  it("renders correct number of segments with correct data mapping", () => {
    renderWithTheme(<MiniStackedBarChart assessments={mockAssessments} />);


    const redSegments = screen.getAllByTestId("red-segment");
    const yellowSegments = screen.getAllByTestId("yellow-segment");


    expect(redSegments.length).toBe(2);
    expect(yellowSegments.length).toBe(2);
   
    // Verify specific heights based on math (1/4 = 25%, 1/4 = 25%)
    expect(redSegments[0]).toHaveStyle("height: 25%");
    expect(yellowSegments[0]).toHaveStyle("height: 25%");
  });


  it("covers hover and popover logic and cleanup", async () => {
    renderWithTheme(<MiniStackedBarChart assessments={mockAssessments} />);


    const chartBars = screen.getAllByTestId("red-segment");
   
    // Trigger Mouse Enter on the first bar container (parent of red-segment)
    // Using mouseOver to trigger the event listener logic
    fireEvent.mouseEnter(chartBars[0].parentElement);


    // Verify Popover content appears (Covers 'hoveredIdx !== null' and 'open' branches)
    await waitFor(() => {
      expect(screen.getByText(/common:common.Assessment 1/i)).toBeInTheDocument();
      expect(screen.getByText(/1.00 \/ 10/i)).toBeInTheDocument();
    });


    // Trigger Mouse Leave (Hits cleanup logic)
    fireEvent.mouseLeave(chartBars[0].parentElement);
   
    await waitFor(() => {
      expect(screen.queryByText(/common:common.Assessment 1/i)).not.toBeInTheDocument();
    });
  });


  it("renders segments with correct colors from colorMap", () => {
    renderWithTheme(<MiniStackedBarChart assessments={[mockAssessments[0]]} />);


    const redSegment = screen.getByTestId("red-segment");
    const yellowSegment = screen.getByTestId("yellow-segment");


    expect(redSegment).toHaveStyle("background-color: rgb(166, 28, 60)"); // #A61C3C
    expect(yellowSegment).toHaveStyle("background-color: rgb(255, 182, 0)"); // #FFB600
  });


  // ====== BRANCH COVERAGE FIX: Default Parameters ======


  it("covers default parameter branches (inCrisis, vulnerable, total)", () => {
    // Providing an assessment where fields are missing to force default values
    // This triggers: { inCrisis = 0, vulnerable = 0, total = 1 }
    const minimalAssessments = [{}];


    renderWithTheme(<MiniStackedBarChart assessments={minimalAssessments} />);


    const redSegment = screen.getByTestId("red-segment");
    const yellowSegment = screen.getByTestId("yellow-segment");


    // Heights should be 0% because 0 / 1 = 0
    expect(redSegment).toHaveStyle("height: 0%");
    expect(yellowSegment).toHaveStyle("height: 0%");
  });
});

