import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ToDoWidget from "./ToDoWidget";
import APIS from "../../../../common/hooks/UseApiCalls";

// Mock dependencies
jest.mock("../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable", () => (props) => (
    <div data-testid="trend-table">
        <span>{props.title}</span>
        <span>{props.loading ? "Loading..." : "Loaded"}</span>
        <span>{props.apiError ? "Error" : "No Error"}</span>
        <span>Rows: {props.tableData?.length}</span>
    </div>
));

jest.mock("../../../../common/hooks/UseApiCalls", () => ({
    GetTodoList: jest.fn(),
}));

jest.mock("../../../../helpers/helperFunction", () => ({
    formatDate: jest.fn((date) => date),
    getOrdinal: jest.fn((num) => `${num}th`),
}));


const mockT = (key, fallback) => fallback || key;

describe("ToDoWidget", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders loading state initially", async () => {
        APIS.GetTodoList.mockResolvedValue({ data: { data: [] } });
        render(<ToDoWidget t={mockT} HTFamilyId={123} />);
        expect(screen.getByText(/Loading.../)).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText(/Loaded/)).toBeInTheDocument());
    });

    it("renders todo items when API returns data", async () => {
        const todoList = [
            { status: "PENDING", assessmentNo: "1", type: "ASSESSMENT", overDueDate: "2024-06-01" },
            { status: "COMPLETED", assessmentNo: "2", type: "FOLLOWUP", overDueDate: "2024-06-02" },
            { status: "PENDING", assessmentNo: "3", type: "FOLLOWUP", overDueDate: "2024-06-03" },
        ];
        APIS.GetTodoList.mockResolvedValue({ data: { data: todoList } });
        render(<ToDoWidget t={mockT} HTFamilyId={123} />);
        await waitFor(() => expect(screen.getByText(/Loaded/)).toBeInTheDocument());
        expect(screen.getByText(/Rows: 2/)).toBeInTheDocument(); // Only PENDING items
        expect(screen.getByText(/To-do \(2\) all actions must be completed in the mobile app\)/)).toBeInTheDocument();
    });

    it("shows error state when API fails", async () => {
        APIS.GetTodoList.mockRejectedValue(new Error("API error"));
        render(<ToDoWidget t={mockT} HTFamilyId={123} />);
        await waitFor(() => expect(screen.getByText(/Error/)).toBeInTheDocument());
    });

    it("calls GetTodoList with correct payload", async () => {
        APIS.GetTodoList.mockResolvedValue({ data: { data: [] } });
        render(<ToDoWidget t={mockT} HTFamilyId={999} />);
        await waitFor(() => expect(APIS.GetTodoList).toHaveBeenCalledWith({
            limit: 100,
            start: 1,
            HTFamilyId: 999,
        }));
    });
});