import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RatingWithValue from "./RatingWithValue";


// ====== COMPONENT-SPECIFIC MOCKS ======


// Mocking RatingComponent to verify props passed to it
jest.mock("../../../../components/RatingComponent/RatingComponent", () => (props) => (
  <div
    data-testid="rating-component"
    data-rating={props.rating}
    data-readonly={props.readOnly}
    aria-label={`Rating: ${props.rating}`}
  >
    Rating: {props.rating}
  </div>
));


describe("RatingWithValue Component", () => {
  const defaultProps = {
    rating: 4,
    interventionCount: 150,
  };


  it("renders correctly with required props", () => {
    render(<RatingWithValue {...defaultProps} />);


    // Verify RatingComponent is rendered with correct props
    const ratingComp = screen.getByTestId("rating-component");
    expect(ratingComp).toBeInTheDocument();
    expect(ratingComp).toHaveAttribute("data-rating", "4");
    expect(ratingComp).toHaveAttribute("data-readonly", "true");


    // Verify intervention count is displayed
    expect(screen.getByText("150")).toBeInTheDocument();
  });


  it("renders with zero values correctly", () => {
    render(<RatingWithValue rating={0} interventionCount={0} />);


    expect(screen.getByTestId("rating-component")).toHaveAttribute("data-rating", "0");
    expect(screen.getByText("0")).toBeInTheDocument();
  });


  it("renders with decimal rating values", () => {
    render(<RatingWithValue rating={3.5} interventionCount={75} />);


    expect(screen.getByTestId("rating-component")).toHaveAttribute("data-rating", "3.5");
    expect(screen.getByText("75")).toBeInTheDocument();
  });


  it("applies the expected flexbox styling to the container", () => {
    const { container } = render(<RatingWithValue {...defaultProps} />);
   
    // The component returns a span as its root
    const rootSpan = container.firstChild;
    expect(rootSpan).toHaveStyle({
      display: "flex",
      alignItems: "center"
    });
  });


  it("applies padding to the intervention count span", () => {
    render(<RatingWithValue {...defaultProps} />);
   
    const countSpan = screen.getByText("150");
    expect(countSpan).toHaveStyle("padding-left: 8px");
  });


  // Additional edge cases
  it("handles negative intervention count", () => {
    render(<RatingWithValue rating={2} interventionCount={-10} />);
    expect(screen.getByText("-10")).toBeInTheDocument();
  });


  it("handles large numbers", () => {
    render(<RatingWithValue rating={5} interventionCount={10000} />);
    expect(screen.getByText("10000")).toBeInTheDocument();
  });


  // Accessibility test
  it("maintains accessibility structure", () => {
    render(<RatingWithValue {...defaultProps} />);
   
    const ratingElement = screen.getByTestId("rating-component");
    expect(ratingElement).toHaveAttribute("aria-label", "Rating: 4");
  });
});

