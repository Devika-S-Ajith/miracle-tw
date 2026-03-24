import React from "react";
import { render, screen } from "@testing-library/react";
import InfoTile from "./InfoTile";

// Mock Heading and BodyText to simplify tests
jest.mock("../Heading/Heading", () => ({ heading }) => <div data-testid="heading">{heading}</div>);
jest.mock("../BodyText/BodyText", () => ({ value }) => <div data-testid="bodytext">{value}</div>);

describe("InfoTile", () => {
    const defaultProps = {
        icon: <span data-testid="icon">ICON</span>,
        title: "Test Title",
        subTitle: "Test Subtitle",
        description: "Test Description",
        bgcolor: "red"
    };

    it("renders the title using Heading", () => {
        render(<InfoTile {...defaultProps} />);
        expect(screen.getByTestId("heading")).toHaveTextContent(defaultProps.title);
    });

    it("renders the icon", () => {
        render(<InfoTile {...defaultProps} />);
        expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("renders the subtitle when provided", () => {
        render(<InfoTile {...defaultProps} />);
        const bodyTexts = screen.getAllByTestId("bodytext");
        expect(bodyTexts.map(el => el.textContent)).toContain(defaultProps.subTitle);
    });

    it("does not render subtitle when not provided", () => {
        const { queryAllByTestId } = render(
            <InfoTile {...defaultProps} subTitle={undefined} />
        );
        // Only one BodyText for description
        expect(queryAllByTestId("bodytext")).toHaveLength(1);
        expect(screen.getByTestId("bodytext")).toHaveTextContent(defaultProps.description);
    });

    it("renders the description", () => {
        render(<InfoTile {...defaultProps} />);
        // There are two BodyText: one for subtitle, one for description
        const bodyTexts = screen.getAllByTestId("bodytext");
        expect(bodyTexts[1]).toHaveTextContent(defaultProps.description);
    });

    it("applies the background color to the first CardContent", () => {
        const { container } = render(<InfoTile {...defaultProps} />);
        // The first CardContent should have the background color style
        const cardContents = container.querySelectorAll('.MuiCardContent-root');
        expect(cardContents[0]).toHaveStyle(`background-color: ${defaultProps.bgcolor}`);
    });
});