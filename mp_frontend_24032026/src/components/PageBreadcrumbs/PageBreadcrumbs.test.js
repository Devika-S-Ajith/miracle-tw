import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PageBreadcrumbs from "./PageBreadcrumbs";
import '@testing-library/jest-dom';

describe("PageBreadcrumbs", () => {
    it("renders breadcrumbs with clickable links and text", () => {
        const handleClick = jest.fn();
        const data = [
            { label: "Home", onClick: handleClick },
            { label: "Section" },
            { label: "Current Page" }
        ];

        render(<PageBreadcrumbs data={data} />);

        // Link should be rendered for item with onClick
        const homeLink = screen.getByText("Home");
        expect(homeLink).toBeInTheDocument();
        expect(homeLink.tagName).toBe("A");

        // Typography should be rendered for items without onClick
        expect(screen.getByText("Section")).toBeInTheDocument();
        expect(screen.getByText("Current Page")).toBeInTheDocument();

        // Clicking the link should call the handler
        fireEvent.click(homeLink);
        expect(handleClick).toHaveBeenCalled();
    });

    it("applies ellipsis and title for long labels", () => {
        const longLabel = "This is a very long breadcrumb label that should be truncated";
        const data = [{ label: longLabel }];

        render(<PageBreadcrumbs data={data} />);
        const label = screen.getByText(longLabel);

        expect(label).toHaveAttribute("title", longLabel);
        expect(label).toHaveStyle({ overflow: "hidden" });
    });

    it("does not set title for short labels", () => {
        const shortLabel = "Short";
        const data = [{ label: shortLabel }];

        render(<PageBreadcrumbs data={data} />);
        const label = screen.getByText(shortLabel);

        expect(label).not.toHaveAttribute("title");
    });

    it("renders nothing if data is empty", () => {
        render(<PageBreadcrumbs data={[]} />);
        // Breadcrumbs should still be rendered but empty
        expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
        // Check that no breadcrumb items are rendered
        expect(screen.queryAllByRole("link")).toHaveLength(0);
        // The container may have a wrapper, but should not have any breadcrumb text
        expect(screen.getByLabelText("breadcrumb")).toHaveTextContent("");
    });
});
// No changes needed for PageBreadcrumbs.test.js as it is already robust and passes all requirements.
// If you want to apply the robust popover click logic, do so in DashboardFilterSection.test.js, not here.