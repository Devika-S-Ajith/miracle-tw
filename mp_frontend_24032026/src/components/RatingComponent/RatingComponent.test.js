import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RatingComponent from "./RatingComponent";

// Mock MUI Rating to simplify testing
jest.mock("@mui/material/Rating", () => (props) => (
    <input
        data-testid="mui-rating"
        value={props.value}
        onChange={e => props.onChange(e, Number(e.target.value))}
        style={{ color: props.sx?.color }}
    />
));

describe("RatingComponent", () => {
    it("renders with the given rating value", () => {
        render(<RatingComponent rating={3} setRating={jest.fn()} />);
        const ratingInput = screen.getByTestId("mui-rating");
        expect(ratingInput.value).toBe("3");
    });

    it("calls setRating when value changes", () => {
        const setRating = jest.fn();
        render(<RatingComponent rating={2} setRating={setRating} />);
        const ratingInput = screen.getByTestId("mui-rating");
        fireEvent.change(ratingInput, { target: { value: "4" } });
        expect(setRating).toHaveBeenCalledWith(4);
    });

    it("applies the default color if color prop is not provided", () => {
        render(<RatingComponent rating={1} setRating={jest.fn()} />);
        const ratingInput = screen.getByTestId("mui-rating");
        expect(ratingInput).toHaveStyle({ color: "#F37123" });
    });

    it("applies the custom color if color prop is provided", () => {
        render(<RatingComponent rating={1} setRating={jest.fn()} color="#123456" />);
        const ratingInput = screen.getByTestId("mui-rating");
        expect(ratingInput).toHaveStyle({ color: "#123456" });
    });
});