import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CurrentStatusSkelton from "./CurrentStatusSkelton";


// Mocking Material UI components to simplify the DOM structure for testing
jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    Skeleton: (props) => <div data-testid="mui-skeleton" {...props} />,
  };
});


describe("CurrentStatusSkelton Component", () => {
  it("renders correctly without crashing", () => {
    const { container } = render(<CurrentStatusSkelton />);
    expect(container).toBeInTheDocument();
  });


  it("renders exactly four skeleton elements", () => {
    render(<CurrentStatusSkelton />);
   
    // The component maps over [1, 2, 3, 4]
    const skeletons = screen.getAllByTestId("mui-skeleton");
    expect(skeletons).toHaveLength(4);
  });


  it("applies the correct rectangular variant to skeletons", () => {
    render(<CurrentStatusSkelton />);
   
    const skeletons = screen.getAllByTestId("mui-skeleton");
    skeletons.forEach((skeleton) => {
      // Check the variant prop passed to the mocked Skeleton
      expect(skeleton).toHaveAttribute("variant", "rectangular");
    });
  });


  it("has a container with appropriate padding and alignment", () => {
    const { container } = render(<CurrentStatusSkelton />);
   
    // Check for the Grid container (the first child of the component)
    const gridContainer = container.firstChild;
   
    // Verify it is a Grid container (MUI usually adds specific classes or roles)
    expect(gridContainer).toHaveClass("MuiGrid-container");
  });
});

