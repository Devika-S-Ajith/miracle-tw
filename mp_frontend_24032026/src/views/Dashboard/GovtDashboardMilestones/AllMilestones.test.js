import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AllMilestones from "./AllMilestones";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import { useNavigate } from "react-router-dom";


const { getNavbarFilterPayload } = require("../../../constants");


// Mock dependencies
jest.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
}));


jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));


// Mock Material UI Icons to use spans instead of divs to avoid validateDOMNesting warnings (div inside p)
jest.mock("../../../assets/icons/TrendingUp", () => () => <span data-testid="trending-up-icon" />);
jest.mock("../../../assets/icons/TrendingDown", () => () => <span data-testid="trending-down-icon" />);
jest.mock("../../../assets/icons/TrendingStraight", () => () => <span data-testid="trending-straight-icon" />);


// UPDATED MOCK: Executes render functions and provides buttons to trigger internal functions
jest.mock("../GovtDashboardOverview/Components/ReusableTrendTable", () => (props) => (
    <div data-testid="trend-table">
        <span>{props.title}</span>
        <span data-testid="loading">{props.loading ? "loading" : "loaded"}</span>
        <span data-testid="apiError">{props.apiError}</span>
        <div data-testid="table-body">
            {props.tableData.map((row, rowIndex) => (
                <div key={rowIndex} data-testid={`row-${rowIndex}`}>
                    {props.columns.map((col) => (
                        <div key={col.id} data-testid={`cell-${col.id}`}>
                            {col.render ? col.render(row, row[col.id]) : row[col.id]}
                        </div>
                    ))}
                </div>
            ))}
        </div>
        {/* Trigger for Line 173: passing null to test the fallback || {} */}
        <button data-testid="reload-null" onClick={() => props.onReload(null)}>Reload Null</button>
        <button data-testid="reload-default" onClick={() => props.onReload()}>Reload Default</button>
    </div>
));


jest.mock("../../../common/hooks/UseApiCalls", () => ({
    GetAllMilestones: jest.fn(),
}));


jest.mock("../../../constants", () => ({
    getNavbarFilterPayload: jest.fn(),
}));


jest.mock("../Components/StateGovDashboardComponents/MoodImageMapping", () => ({
    MoodImageMapping: {
        HAPPY: "/happy.svg",
        SAD: "/sad.svg",
    },
}));


const mockNavigate = jest.fn();
const mockContext = {
    navbarFilterValues: { someFilter: "value" },
    linkedAccounts: [],
    signedinOrgType: "8",
};


describe("AllMilestones Full Coverage Suite", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockImplementation(() => mockNavigate);
        // Default filter mock
        getNavbarFilterPayload.mockReturnValue({ countryFilter: "IN" });
       
        Storage.prototype.getItem = jest.fn((key) => {
            if (key === "userRegion") return "IN";
            if (key === "orgId") return "123";
            return null;
        });
    });


    it("covers Line 136 (empty milestone title) and basic navigation", async () => {
        APIS.GetAllMilestones.mockResolvedValue({
            data: {
                data: [{ milestone: "", domainId: 1 }],
                pageCount: 1, total: 1,
            },
        });


        render(
            <CommonDataContext.Provider value={mockContext}>
                <AllMilestones />
            </CommonDataContext.Provider>
        );


        const milestoneCell = await screen.findByTestId("cell-milestone");
        const clickTarget = milestoneCell.querySelector("p");
       
        // Wrap the interaction and wait for loading to finish to avoid act() warning
        fireEvent.click(clickTarget);
       
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
            expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        });
    });


    it("covers Line 137 (successful milestone encryption and navigation)", async () => {
        const milestoneTitle = "Health Milestone";
        APIS.GetAllMilestones.mockResolvedValue({
            data: {
                data: [{ milestone: milestoneTitle, domainId: 1 }],
                pageCount: 1, total: 1,
            },
        });


        render(
            <CommonDataContext.Provider value={mockContext}>
                <AllMilestones />
            </CommonDataContext.Provider>
        );


        const milestoneCell = await screen.findByTestId("cell-milestone");
        const clickTarget = milestoneCell.querySelector("p");
        fireEvent.click(clickTarget);
       
        const expectedEncoded = btoa(encodeURIComponent(milestoneTitle));
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining(expectedEncoded));
            expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        });
    });


    it("covers Line 153 (positive score change icon)", async () => {
        APIS.GetAllMilestones.mockResolvedValue({
            data: {
                data: [{ milestone: "Positive", averageScoreChange: 10 }],
                pageCount: 1, total: 1,
            },
        });


        render(
            <CommonDataContext.Provider value={mockContext}>
                <AllMilestones />
            </CommonDataContext.Provider>
        );


        await waitFor(() => {
            expect(screen.getByTestId("trending-up-icon")).toBeInTheDocument();
            expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        });
    });


    it("covers Line 154 (negative score change icon)", async () => {
        APIS.GetAllMilestones.mockResolvedValue({
            data: {
                data: [{ milestone: "Negative", averageScoreChange: -5 }],
                pageCount: 1, total: 1,
            },
        });


        render(
            <CommonDataContext.Provider value={mockContext}>
                <AllMilestones />
            </CommonDataContext.Provider>
        );


        await waitFor(() => {
            expect(screen.getByTestId("trending-down-icon")).toBeInTheDocument();
            expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        });
    });


    it("covers Line 173 (params || {} fallback)", async () => {
        APIS.GetAllMilestones.mockResolvedValue({ data: { data: [] } });


        render(
            <CommonDataContext.Provider value={mockContext}>
                <AllMilestones />
            </CommonDataContext.Provider>
        );


        await screen.findByText("loaded");
       
        // Trigger reload and wait for the resulting state update to finish
        fireEvent.click(screen.getByTestId("reload-null"));
       
        await waitFor(() => {
            expect(APIS.GetAllMilestones).toHaveBeenCalled();
            expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        });
    });


    it("covers Line 181-182 (countryFilter null early return)", async () => {
        getNavbarFilterPayload.mockReturnValue({ countryFilter: null });


        render(
            <CommonDataContext.Provider value={mockContext}>
                <AllMilestones />
            </CommonDataContext.Provider>
        );


        expect(APIS.GetAllMilestones).not.toHaveBeenCalled();
    });


    it("covers Lines 188-195 (Object to Array conversion for mood icons)", async () => {
        APIS.GetAllMilestones.mockResolvedValue({
            data: {
                data: [{
                    milestone: "Mood Test",
                    milestoneModeByAssessment: { 0: "happy" }
                }],
                pageCount: 1, total: 1,
            },
        });


        render(
            <CommonDataContext.Provider value={mockContext}>
                <AllMilestones />
            </CommonDataContext.Provider>
        );


        await waitFor(() => {
            expect(screen.getByAltText("happy")).toBeInTheDocument();
            expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        });
    });


    it("covers Red Flag branches and existing functionality", async () => {
        APIS.GetAllMilestones.mockResolvedValue({
            data: {
                data: [
                    { milestone: "Flagged", redFlag: true, domainId: 1 },
                    { milestone: "Not Flagged", redFlag: false, domainId: 2 }
                ],
                pageCount: 1, total: 2,
            },
        });


        render(
            <CommonDataContext.Provider value={mockContext}>
                <AllMilestones />
            </CommonDataContext.Provider>
        );


        await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));
       
        const row0 = screen.getByTestId("row-0");
        const redFlagImg = row0.querySelector('img[src="/static/icons/redFlag.svg"]');
        expect(redFlagImg).toBeInTheDocument();


        const row1 = screen.getByTestId("row-1");
        expect(row1.querySelector('[data-testid="cell-redFlag"]')).toHaveTextContent("-");
    });


    it("covers API error branch", async () => {
        APIS.GetAllMilestones.mockRejectedValue(new Error("Failure"));
       
        render(
            <CommonDataContext.Provider value={mockContext}>
                <AllMilestones />
            </CommonDataContext.Provider>
        );


        await waitFor(() => {
            expect(screen.getByTestId("apiError")).toHaveTextContent("Failed to fetch milestones data");
            expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        });
    });
});

