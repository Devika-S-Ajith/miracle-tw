import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import FamilyHistory from "./FamilyHistory";
import APIS from "../../../../common/hooks/UseApiCalls";

// Mock dependencies
jest.mock("../../../../common/hooks/UseApiCalls", () => ({
    GetFamilyHistoryList: jest.fn(),
}));
jest.mock("../../../Dashboard/GovtDashboardOverview/HelperFunctions/DashboardHelperFunction", () => ({
    getScoreChangeIcon: jest.fn(() => <span data-testid="score-icon" />),
}));
jest.mock("../../../../helpers/helperFunction", () => ({
    formatDate: jest.fn((date) => `formatted-${date}`),
    getOrdinal: jest.fn((num) => `${num}th`),
}));

// Mock icons
jest.mock("../../../../assets/icons/AssessmentWebIcon", () => () => <span data-testid="assessment-icon" />);
jest.mock("../../../../assets/icons/InCrisisFlag", () => () => <span data-testid="crisis-icon" />);
jest.mock("../../../../assets/icons/VulnerableFlags", () => () => <span data-testid="vulnerable-icon" />);
jest.mock("../../../../assets/icons/InterventionIcon", () => () => <span data-testid="intervention-icon" />);
jest.mock("../../../../assets/icons/EmptyHourGlassIcon", () => () => <span data-testid="empty-hourglass-icon" />);
jest.mock("../../../../assets/icons/FilledHourGlassIcon", () => () => <span data-testid="filled-hourglass-icon" />);
jest.mock("../../../../assets/icons/HalfFilledHourGlassIcon", () => () => <span data-testid="half-filled-hourglass-icon" />);

const mockT = (key, fallback) => fallback || key;

describe("FamilyHistory", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders loading state", async () => {
        APIS.GetFamilyHistoryList.mockResolvedValueOnce({ data: { data: [], pageCount: 0, totalCount: 0 } });
        render(<FamilyHistory t={mockT} HTFamilyId={123} />);
        expect(screen.getByText(/Family History/i)).toBeInTheDocument();
        await waitFor(() => expect(APIS.GetFamilyHistoryList).toHaveBeenCalled());
    });

    it("renders table data with correct columns", async () => {
        const mockData = {
            data: [
                {
                    seqNo: 1,
                    type: "ASSESSMENT",
                    dateOfAssessment: "2024-06-01",
                    submissionDate: "2024-06-02",
                    totalScore: 10,
                    trend: "up",
                    inCrisisCount: 2,
                    vulnerableCount: 3,
                    interventionCount: 1,
                    notStarted: 0,
                    inProgress: 1,
                    completed: 5,
                },
            ],
            pageCount: 1,
            totalCount: 1,
        };
        APIS.GetFamilyHistoryList.mockResolvedValueOnce({ data: mockData });

        render(<FamilyHistory t={mockT} HTFamilyId={123} />);
        await waitFor(() => expect(APIS.GetFamilyHistoryList).toHaveBeenCalled());

        // Action column
        expect(screen.getByText(/1st family assessment/i)).toBeInTheDocument();

        // Date column
        expect(screen.getByText(/formatted-2024-06-01/i)).toBeInTheDocument();

        // Summary column icons
        expect(screen.getByTestId("assessment-icon")).toBeInTheDocument();
        expect(screen.getByTestId("score-icon")).toBeInTheDocument();
        expect(screen.getByTestId("crisis-icon")).toBeInTheDocument();
        expect(screen.getByTestId("vulnerable-icon")).toBeInTheDocument();
        expect(screen.getByTestId("intervention-icon")).toBeInTheDocument();
        expect(screen.getByTestId("empty-hourglass-icon")).toBeInTheDocument();
        expect(screen.getByTestId("half-filled-hourglass-icon")).toBeInTheDocument();
        expect(screen.getByTestId("filled-hourglass-icon")).toBeInTheDocument();
    });

    it("shows error state on API failure", async () => {
        APIS.GetFamilyHistoryList.mockRejectedValueOnce(new Error("API error"));
        render(<FamilyHistory t={mockT} HTFamilyId={123} />);
        await waitFor(() => expect(APIS.GetFamilyHistoryList).toHaveBeenCalled());
        // The table should still render, but with no data
        expect(screen.getByText(/Family History/i)).toBeInTheDocument();
    });

    it("renders 'No summary available' if summary is missing", async () => {
        const mockData = {
            data: [
                {
                    seqNo: 2,
                    type: "ASSESSMENT",
                    dateOfAssessment: "2024-06-03",
                    submissionDate: "2024-06-04",
                },
            ],
            pageCount: 1,
            totalCount: 1,
        };
        APIS.GetFamilyHistoryList.mockResolvedValueOnce({ data: mockData });
        render(<FamilyHistory t={mockT} HTFamilyId={123} />);
        await waitFor(() => expect(APIS.GetFamilyHistoryList).toHaveBeenCalled());
        expect(screen.getByText(/No summary available/i)).toBeInTheDocument();
    });
});