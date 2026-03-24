import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import OrganizationOverviewCard from "./OrganizationOverviewCard";

// Mock child components
jest.mock("../../../../components/Heading", () => ({ heading }) => <div data-testid="heading">{heading}</div>);
jest.mock("@mui/material/Skeleton", () => (props) => <div data-testid="skeleton" {...props} />);
jest.mock("../../GovtDashboardOverview/Components/ErrorWithReload", () => ({ message, onReload }) => (
    <div data-testid="error-with-reload">
        {message}
        <button data-testid="reload-btn" onClick={onReload}>Reload</button>
    </div>
));
jest.mock("../../../../components/InfoTile/InfoTile", () => ({ title, description }) => (
    <div data-testid="info-tile">
        <span>{title}</span>
        <span>{description}</span>
    </div>
));

describe("OrganizationOverviewCard", () => {
    const mockData = [
        { label: "Org 1", value: "Value 1" },
        { label: "Org 2", value: "Value 2" },
        { label: "Org 3", value: "Value 3" },
    ];

    it("renders heading and info tiles when not loading or error", () => {
        render(<OrganizationOverviewCard data={mockData} title="Test Title" />);
        expect(screen.getByTestId("heading")).toHaveTextContent("Test Title");
        expect(screen.getAllByTestId("info-tile")).toHaveLength(mockData.length);
        mockData.forEach(item => {
            expect(screen.getByText(item.label)).toBeInTheDocument();
            expect(screen.getByText(item.value)).toBeInTheDocument();
        });
    });

    it("renders skeletons when loading", () => {
        render(<OrganizationOverviewCard data={mockData} title="Test Title" loading />);
        expect(screen.getByTestId("heading")).toHaveTextContent("Test Title");
        expect(screen.getAllByTestId("skeleton")).toHaveLength(mockData.length);
    });

    it("renders default 3 skeletons if data is undefined when loading", () => {
        render(<OrganizationOverviewCard title="Test Title" loading />);
        expect(screen.getAllByTestId("skeleton")).toHaveLength(3);
    });

    it("renders error with reload when apiError is true", () => {
        const onReload = jest.fn();
        render(<OrganizationOverviewCard title="Test Title" apiError onReload={onReload} />);
        expect(screen.getByTestId("error-with-reload")).toHaveTextContent(
            "Oops, something went wrong on our end. Please try again"
        );
        fireEvent.click(screen.getByTestId("reload-btn"));
        expect(onReload).toHaveBeenCalled();
    });

    it("renders nothing for empty data when not loading or error", () => {
        render(<OrganizationOverviewCard data={[]} title="Test Title" />);
        expect(screen.queryByTestId("info-tile")).not.toBeInTheDocument();
    });
});