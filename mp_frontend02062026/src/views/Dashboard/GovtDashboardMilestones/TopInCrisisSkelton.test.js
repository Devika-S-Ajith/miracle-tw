

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TopInCrisisSkeleton from "./TopInCrisisSkelton";


// ====== COMPONENT-SPECIFIC MOCKS ======


// Mocking Material UI components to simplify DOM targeting
jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    Skeleton: (props) => <div data-testid="mui-skeleton" {...props} />,
  };
});


// Mock CommonCard to verify its title prop
jest.mock("../../../components/CommonCard", () => ({ title, children }) => (
  <div data-testid="common-card">
    <div data-testid="card-title">{title}</div>
    {children}
  </div>
));


describe("TopInCrisisSkeleton Component", () => {
  it("renders correctly without crashing", () => {
    const { container } = render(<TopInCrisisSkeleton />);
    expect(container).toBeInTheDocument();
  });


  it("renders the correct title in the CommonCard", () => {
    render(<TopInCrisisSkeleton />);
    expect(screen.getByTestId("card-title")).toHaveTextContent("Top In Crisis");
  });


  it("renders exactly five skeleton placeholders", () => {
    render(<TopInCrisisSkeleton />);
   
    // The component uses [...Array(5)] to map
    const skeletons = screen.getAllByTestId("mui-skeleton");
    expect(skeletons).toHaveLength(5);
  });


  it("applies the correct props to the skeletons", () => {
    render(<TopInCrisisSkeleton />);
   
    const skeletons = screen.getAllByTestId("mui-skeleton");
    skeletons.forEach((skeleton) => {
      // These match the props in TopInCrisisSkelton.js
      expect(skeleton).toHaveAttribute("variant", "rectangular");
      // Note: React Testing Library attributes are strings,
      // but height={150} is passed as a number. RTL/JSDOM treats it as string here.
      expect(skeleton).toHaveAttribute("height", "150");
    });
  });


  it("uses a Grid container for the layout", () => {
    const { container } = render(<TopInCrisisSkeleton />);
   
    // The Grid container is rendered inside CommonCard
    // MUI Grid adds specific classes like MuiGrid-container
    const gridContainer = container.querySelector(".MuiGrid-container");
    expect(gridContainer).toBeInTheDocument();
  });
  it('applies correct spacing and padding props to Grid container', () => {
    const { container } = render(<TopInCrisisSkeleton />);
   
    // The Grid container has: pt, px={2}, spacing={2}
    const gridContainer = container.querySelector('.MuiGrid-container');
   
    // These are MUI classes that get applied
    expect(gridContainer).toHaveClass('MuiGrid-container');
    // MUI adds spacing classes like MuiGrid-spacing-xs-2
    expect(gridContainer.className).toMatch(/MuiGrid-spacing-xs-[0-9]/);
  });
 
  it('has correct breakpoint sizing for Grid items', () => {
    render(<TopInCrisisSkeleton />);
   
    // Check that each Grid item has the correct classes
    // This is testing MUI's internal implementation, but could be useful
    const gridItems = document.querySelectorAll('.MuiGrid-item');
    expect(gridItems).toHaveLength(5);
   
    gridItems.forEach(item => {
      // Should have responsive classes
      expect(item.className).toMatch(/MuiGrid-grid-xs-12/); // xs={12}
      expect(item.className).toMatch(/MuiGrid-grid-sm-6/);  // sm={6}
      expect(item.className).toMatch(/MuiGrid-grid-md-4/);  // md={4}
      // lg={12/5} = 2.4, MUI handles this differently
    });
  });
 
  it('uses unique keys for each skeleton item', () => {
    // This is more of an integration test
    // The component uses idx as key, which is acceptable for static lists
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
   
    render(<TopInCrisisSkeleton />);
   
    // Should not have React key warnings
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('key'),
      expect.anything()
    );
   
    consoleSpy.mockRestore();
  });
});

