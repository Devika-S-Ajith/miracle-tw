import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AverageDomainScores from "./AverageDomainScores";


// Mock child components with more realistic structure
jest.mock("../GovtDashboardOverview/ActiveRedFlagMilestones", () => () => (
  <div
    data-testid="active-red-flag-milestones"
    className="active-red-flag-milestones"
  >
    Active Red Flag Milestones
  </div>
));


jest.mock("../GovtDashboardOverview/RedFlagMilestonesByDomain", () => () => (
  <div
    data-testid="red-flag-milestones-by-domain"
    className="red-flag-milestones-by-domain"
  >
    Red Flag Milestones By Domain
  </div>
));


// Create a minimal theme for MUI components
const theme = createTheme();


// Helper function to render with ThemeProvider
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};


describe("AverageDomainScores Component", () => {
  describe("Rendering and Structure", () => {
    it("renders without crashing", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
      expect(container).toBeInTheDocument();
    });


    it("renders both child components", () => {
      renderWithTheme(<AverageDomainScores />);
     
      expect(screen.getByTestId("active-red-flag-milestones")).toBeInTheDocument();
      expect(screen.getByTestId("red-flag-milestones-by-domain")).toBeInTheDocument();
    });


    it("renders with correct MUI Grid container", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
     
      const gridContainer = container.querySelector(".MuiGrid-container");
      expect(gridContainer).toBeInTheDocument();
     
      const computedStyle = window.getComputedStyle(gridContainer);
      expect(computedStyle.display).toBe("flex");
      expect(computedStyle.flexWrap).toBe("wrap");
      // Verify that spacing or width calculations are present
      expect(computedStyle.width).toBeTruthy();
    });


    it("renders exactly two Grid items", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
     
      const gridItems = container.querySelectorAll(".MuiGrid-item");
      expect(gridItems).toHaveLength(2);
    });
  });


  describe("Layout and Responsive Behavior", () => {
    it("applies correct flex properties to the container", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
      const gridContainer = container.querySelector(".MuiGrid-container");
      const computedStyle = window.getComputedStyle(gridContainer);
     
      expect(computedStyle.alignItems).toBe("stretch");
      expect(computedStyle.height).toBe("100%");
      expect(computedStyle.minHeight).toBeTruthy();
    });


    it("configures first Grid item for responsive layout (xs=12, md=4)", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
     
      const firstGridItem = container.querySelector(".MuiGrid-item:first-child");
      expect(firstGridItem).toBeInTheDocument();
      expect(firstGridItem).toHaveClass("MuiGrid-grid-xs-12");
      expect(firstGridItem).toHaveClass("MuiGrid-grid-md-4");
    });


    it("configures second Grid item for responsive layout (xs=12, md=8)", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
     
      const secondGridItem = container.querySelector(".MuiGrid-item:last-child");
      expect(secondGridItem).toBeInTheDocument();
      expect(secondGridItem).toHaveClass("MuiGrid-grid-xs-12");
      expect(secondGridItem).toHaveClass("MuiGrid-grid-md-8");
    });


    it("applies flex-direction column to Grid items", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
     
      const gridItems = container.querySelectorAll(".MuiGrid-item");
      gridItems.forEach(item => {
        expect(item).toHaveStyle({
          display: "flex",
          flexDirection: "column"
        });
      });
    });


    it("applies spacing between Grid items", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
      const gridContainer = container.querySelector(".MuiGrid-container");
      const computedStyle = window.getComputedStyle(gridContainer);
     
      // spacing={2} translates to 16px. MUI applies negative margins to the container.
      expect(computedStyle.marginTop).toBe("-16px");
      expect(computedStyle.marginLeft).toBe("-16px");
    });
  });


  describe("Box Component Integration", () => {
    it("renders Box components inside Grid items", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
     
      const boxes = container.querySelectorAll(".MuiBox-root");
      expect(boxes.length).toBeGreaterThanOrEqual(2);
    });


    it("verifies Box component styling", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
      const boxes = container.querySelectorAll(".MuiBox-root");
     
      const firstBox = boxes[0];
      const computedStyle = window.getComputedStyle(firstBox);


      expect(computedStyle.flex).toContain("1");
      expect(computedStyle.display).toBe("flex");
      expect(computedStyle.flexDirection).toBe("column");
      expect(computedStyle.height).toBe("100%");
    });


    it("ensures child components are properly nested within Box components", () => {
      renderWithTheme(<AverageDomainScores />);
     
      const activeMilestones = screen.getByTestId("active-red-flag-milestones");
      const domainMilestones = screen.getByTestId("red-flag-milestones-by-domain");
     
      // Verify they are within Box components
      expect(activeMilestones.parentElement).toHaveClass("MuiBox-root");
      expect(domainMilestones.parentElement).toHaveClass("MuiBox-root");
     
      // Verify Box components are within Grid items
      expect(activeMilestones.parentElement.parentElement).toHaveClass("MuiGrid-item");
      expect(domainMilestones.parentElement.parentElement).toHaveClass("MuiGrid-item");
    });
  });


  describe("Accessibility and Semantics", () => {
    it("has proper semantic structure without interactive elements", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
     
      const mainContainer = container.firstChild;
      expect(mainContainer).toBeInTheDocument();
     
      // Verify no interactive elements in this layout component
      const buttons = container.querySelectorAll('button');
      const links = container.querySelectorAll('a');
      const clickableDivs = container.querySelectorAll('[role="button"]');
     
      expect(buttons.length + links.length + clickableDivs.length).toBe(0);
    });


    it("has appropriate ARIA attributes if any", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
     
      const allElements = container.querySelectorAll("*");
      allElements.forEach(element => {
        const attributes = element.getAttributeNames();
        const ariaAttributes = attributes.filter(name => name.startsWith("aria-"));
        ariaAttributes.forEach(attr => {
          expect(element.getAttribute(attr)).toBeTruthy();
        });
      });
    });
  });


  describe("Snapshot Testing", () => {
    it("matches snapshot for consistent UI", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
      expect(container.firstChild).toMatchSnapshot();
    });


    it("matches snapshot of component structure", () => {
      const { asFragment } = renderWithTheme(<AverageDomainScores />);
      expect(asFragment()).toMatchSnapshot();
    });
  });


  describe("Error Boundaries and Edge Cases", () => {
    it("handles missing child components gracefully", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
     
      // Verify layout structure exists
      const gridContainer = container.querySelector(".MuiGrid-container");
      expect(gridContainer).toBeInTheDocument();
     
      const gridItems = container.querySelectorAll(".MuiGrid-item");
      expect(gridItems).toHaveLength(2);
    });


    it("maintains layout with empty content", () => {
      const { container } = renderWithTheme(<AverageDomainScores />);
     
      // Even with mocked empty components, layout should persist
      const gridContainer = container.querySelector(".MuiGrid-container");
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveStyle("height: 100%");
    });
  });
});