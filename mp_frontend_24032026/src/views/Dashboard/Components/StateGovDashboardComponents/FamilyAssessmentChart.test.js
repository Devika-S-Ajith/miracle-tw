import { render, screen } from "@testing-library/react";
import FamilyAssessmentChart from "./FamilyAssessmentChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// FamilyAssessmentChart.test.js

const renderWithTheme = (ui) => {
    const theme = createTheme();
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

const expectedData = [
    { label: "Decreased", value: 11 },
    { label: "+0-2%", value: 25 },
    { label: "+2-4%", value: 38 },
    { label: "+4-6%", value: 17 },
    { label: "+6-8%", value: 16 },
    { label: "+8-10%", value: 10 },
    { label: "> 10%", value: 4 },
];

describe("FamilyAssessmentChart", () => {
    it("renders chart title and subtitle", () => {
        renderWithTheme(<FamilyAssessmentChart />);
        expect(
            screen.getByText((content) =>
                content.includes("Family assessment score increases")
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText((content) =>
                content.includes("All active and inactive families")
            )
        ).toBeInTheDocument();
    });

    it("renders correct number of bars and labels when not loading", () => {
        renderWithTheme(<FamilyAssessmentChart />);
        // There should be 7 bars and 7 labels
        const barLabels = expectedData.map(item => `${item.label}: ${item.value}`);
        barLabels.forEach(label => {
            expect(screen.getByLabelText(label)).toBeInTheDocument();
        });
        expectedData.forEach(item => {
            expect(screen.getByText(item.label)).toBeInTheDocument();
            expect(screen.getByText(item.value.toString())).toBeInTheDocument();
        });
    });

    it("bars have correct heights and colors", () => {
        renderWithTheme(<FamilyAssessmentChart />);
        const maxValue = Math.max(...expectedData.map(item => item.value));
        expectedData.forEach(item => {
            const bar = screen.getByLabelText(`bar for ${item.label} with value ${item.value}`);
            const relativeHeight = (item.value / maxValue) * 140;
            const barHeight = Math.max(relativeHeight, 30);
            expect(bar).toHaveStyle(`height: ${barHeight}px`);
            expect(bar).toHaveStyle("background-color: #71C5D4");
        });
    });

    it("renders skeletons when loading is true", () => {
        renderWithTheme(<FamilyAssessmentChart loading />);
        // Should render 7 skeleton bars and 7 skeleton value labels
        const skeletonRects = screen.getAllByTestId("skeleton-rect");
        const skeletonTexts = screen.getAllByTestId("skeleton-text");
        expect(skeletonRects.length).toBe(expectedData.length);
        expect(skeletonTexts.length).toBe(expectedData.length);
    });

    it("has accessibility attributes for bars", () => {
        renderWithTheme(<FamilyAssessmentChart />);
        expectedData.forEach(item => {
            const bar = screen.getByLabelText(`bar for ${item.label} with value ${item.value}`);
            expect(bar).toHaveAttribute("role", "img");
            expect(bar).toHaveAttribute("aria-label", `bar for ${item.label} with value ${item.value}`);
        });
    });

    it("renders all labels in loading state", () => {
        renderWithTheme(<FamilyAssessmentChart loading />);
        expectedData.forEach(item => {
            expect(screen.getByText(item.label)).toBeInTheDocument();
        });
    });

    it("does not render chart bars when loading is true", () => {
        renderWithTheme(<FamilyAssessmentChart loading />);
        expectedData.forEach(item => {
            expect(screen.queryByLabelText(`bar for ${item.label} with value ${item.value}`)).toBeNull();
        });
    });
});