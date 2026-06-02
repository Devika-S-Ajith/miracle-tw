import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BarChartGraph from "./Barchart";

// Mock MUI components and i18n
jest.mock("@mui/material", () => {
    const actual = jest.requireActual("@mui/material");
    return {
        ...actual,
        useTheme: () => ({}),
        Card: (props) => <div data-testid="card" {...props} />,
        CardContent: (props) => <div data-testid="card-content" {...props} />,
        Box: (props) => {
            // Filter out MUI-specific props
            const { flexDirection, mb, mt, ...rest } = props;
            return <div data-testid="box" {...rest} />;
        },
        Typography: (props) => <div data-testid="typography" {...props} />,
        Popper: (props) => {
            // Filter out MUI-specific and non-DOM props
            const {
                open,
                children,
                anchorEl,
                transition,
                placement,
                modifiers,
                popperOptions,
                ...rest
            } = props;
            // Support function-as-children pattern
            const content = typeof children === "function" ? children({}) : children;
            return (
                <div data-testid="popper" {...rest}>
                    {open ? content : null}
                </div>
            );
        },
        Paper: (props) => <div data-testid="paper" {...props} />,
        Fade: (props) => <div data-testid="fade" {...props} />,
        Grid: (props) => {
            // Filter out MUI-specific props
            const {
                container, item, xs, sm, md, lg, xl, spacing,
                mt, mb, ml, mr, mx, my, // add any other MUI props you use
                ...rest
            } = props;
            return <div data-testid="grid" {...rest} />;
        },
    };
});
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key, fallback) => fallback || key,
    }),
}));

// Mock child components
jest.mock("../Heading", () => (props) => <div data-testid="heading">{props.heading}</div>);
jest.mock("../SubHeading", () => (props) => <div data-testid="subheading">{props.value}</div>);
jest.mock("../SmallText/SmallText", () => (props) => <div data-testid="smalltext">{props.value}</div>);
jest.mock("./BarchartSkelton", () => () => <div data-testid="skeleton" />);

const categories = [
    { name: "In crisis", color: "#BC1041" },
    { name: "Vulnerable", color: "#F37123" },
    { name: "Safe", color: "#C5D86D" },
    { name: "Thriving", color: "#71C5D4" },
];

const data = [
    {
        label: "A1",
        primaryBarIndicator: "Primary",
        secondaryBarIndicator: "Secondary",
        barHeightValue: 45,
        categories: [
            { name: "Thriving", value: 8, color: "#71C5D4" },
            { name: "Safe", value: 15, color: "#C5D86D" },
            { name: "Vulnerable", value: 10, color: "#F37123" },
            { name: "In crisis", value: 12, color: "#BC1041" },
        ],
    },
    {
        label: "A2",
        primaryBarIndicator: "Primary2",
        secondaryBarIndicator: "Secondary2",
        barHeightValue: 65,
        categories: [
            { name: "Thriving", value: 8, color: "#71C5D4" },
            { name: "Safe", value: 21, color: "#C5D86D" },
            { name: "Vulnerable", value: 15, color: "#F37123" },
            { name: "In crisis", value: 18, color: "#BC1041" },
        ],
    },
];

describe("BarChartGraph", () => {
    it("renders loading skeleton when loading is true", () => {
        render(
            <BarChartGraph
                title="Test Title"
                subTitle="Test Subtitle"
                data={[]}
                categories={categories}
                loading={true}
            />
        );
        expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });

    it("renders empty state when data is empty and loading is false", () => {
        render(
            <BarChartGraph
                title="Test Title"
                subTitle="Test Subtitle"
                data={[]}
                categories={categories}
                loading={false}
            />
        );
        expect(screen.getByText("Sorry, we couldn't find any results")).toBeInTheDocument();
    });

    it("renders category legends", () => {
        render(
            <BarChartGraph
                title="Test Title"
                subTitle="Test Subtitle"
                data={data}
                categories={categories}
                loading={false}
            />
        );
        categories.forEach((cat) => {
            expect(screen.getAllByText(cat.name)[0]).toBeInTheDocument();
        });
    });

    it("renders bar labels", () => {
        render(
            <BarChartGraph
                title="Test Title"
                subTitle="Test Subtitle"
                data={data}
                categories={categories}
                loading={false}
            />
        );
        data.forEach((bar) => {
            expect(screen.getAllByText(bar.label)[0]).toBeInTheDocument();
        });
    });

    it("renders heading and subtitle", () => {
        render(
            <BarChartGraph
                title="Test Title"
                subTitle="Test Subtitle"
                data={data}
                categories={categories}
                loading={false}
            />
        );
        expect(screen.getByTestId("heading")).toHaveTextContent("Test Title");
        // There are multiple smalltext elements, so check that one contains the subtitle
        const smalltexts = screen.getAllByTestId("smalltext");
        expect(smalltexts.map(el => el.textContent)).toContain("Test Subtitle");
    });

    it("calls hoverComponent when hovering over a bar segment", async () => {
        const hoverComponent = jest.fn(() => <div data-testid="hover-content">Hover Content</div>);
        render(
            <BarChartGraph
                title="Test Title"
                subTitle="Test Subtitle"
                data={data}
                categories={categories}
                loading={false}
                hoverComponent={hoverComponent}
            />
        );
        // Find bar segments by data-testid
        const barSegments = screen.queryAllByTestId("bar-segment");
        expect(barSegments.length).toBeGreaterThan(0);
        fireEvent.mouseEnter(barSegments[0]);
        // Wait for the hover content to appear
        expect(await screen.findByTestId("hover-content")).toBeInTheDocument();
        expect(hoverComponent).toHaveBeenCalled();
    });
});