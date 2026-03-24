import { render, screen } from "@testing-library/react";
import CommonCard from "./CommonCard";

// Mock Heading and SmallText to simplify tests
jest.mock("../Heading", () => ({ heading }) => <div data-testid="heading">{heading}</div>);
jest.mock("../SmallText/SmallText", () => ({ value }) => <div data-testid="smalltext">{value}</div>);

describe("CommonCard", () => {
    it("renders the card with the given title", () => {
        render(<CommonCard title="Test Title">Content</CommonCard>);
        expect(screen.getByTestId("heading")).toHaveTextContent("Test Title");
    });

    it("renders the subtitle when provided", () => {
        render(<CommonCard title="Test Title" subtitle="Test Subtitle">Content</CommonCard>);
        expect(screen.getByTestId("smalltext")).toHaveTextContent("Test Subtitle");
    });

    it("does not render the subtitle when not provided", () => {
        render(<CommonCard title="Test Title">Content</CommonCard>);
        expect(screen.queryByTestId("smalltext")).toBeNull();
    });

    it("renders children inside CardContent", () => {
        render(<CommonCard title="Test Title"><div data-testid="child">Child Content</div></CommonCard>);
        expect(screen.getByTestId("child")).toHaveTextContent("Child Content");
    });

    it("renders a divider after the header", () => {
        render(<CommonCard title="Test Title">Content</CommonCard>);
        // Divider is a <hr> with role="separator"
        expect(screen.getByRole("separator")).toBeInTheDocument();
    });
});