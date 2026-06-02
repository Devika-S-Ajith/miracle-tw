import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChildDetails from "./ChildDetails";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock dependencies
jest.mock("../Components/ChildContactDetails", () => () => <div>ChildContactDetails</div>);
jest.mock("../Components/ChildHistory", () => () => <div>ChildHistory</div>);
jest.mock("../Components/Documents", () => () => <div>Documents</div>);
jest.mock("../Components/ProgressReport", () => () => <div>ProgressReport</div>);
jest.mock("../Components/Assessments", () => () => <div>Assessments</div>);
jest.mock("../Components/RadarGraph/RadarGraph", () => () => <div>RadarGraph</div>);
jest.mock("../../Assessments/Components/FollowUps", () => () => <div>FollowUps</div>);
jest.mock("./ChildInterventions", () => () => <div>ChildInterventions</div>);
jest.mock("../../../components/UserComponents/Loader", () => ({ loading }) => loading ? <div>Loading...</div> : null);

const mockChildData = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    HTCountryId: "IN",
    gender: "Male",
    birthDate: "2000-01-01",
    isActive: true,
    userFirstName: "Manager",
    userLastName: "Smith",
    familyMemberName: "Jane Doe",
    HTOrganizationId: "Org1",
    email: "john@example.com",
    phoneNumber: "1234567890",
    HTLanguageId: "EN",
    HTStateId: "State1",
    city: "City1",
    HTDistrictId: "District1",
    zipCode: "123456",
    addressLine1: "Address 1",
    addressLine2: "Address 2",
    HTChildEducationLevelId: "Edu1",
    HTChildStatusId: "Status1",
    HTChildPlacementStatusId: "Placement1",
    HTChildCurrentPlacementStatusId: "CurrentPlacement1",
    dateOfEntry: "2020-01-01",
    dateOfExit: "2022-01-01",
    highestEducationLevel: "High School",
    fileUrl: "profile.jpg",
    familyName: "Doe Family",
    HTFamilyId: "FAM1",
    childStatusList: [],
    HTCaseId: "CASE1"
};

const mockAuthorizationConfig = {
    AddChild: {
        allowedRoles: ["admin"],
        allowedOrgTypes: ["orgType1"]
    }
};

jest.mock("../../../assets/authorizationConfig", () => ({
    authorizationConfig: mockAuthorizationConfig
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}));

// Mock UseApiCalls hook
const mockChildDetails = jest.fn();
const mockFamilyMembers = jest.fn();

jest.mock("../../../common/hooks/UseApiCalls", () => ({
    ChildDetails: (...args) => mockChildDetails(...args),
    familyMembers: (...args) => mockFamilyMembers(...args)
}));

describe("ChildDetails", () => {
    const renderWithProviders = (contextValue = {}) => {
        return render(
            <CommonDataContext.Provider value={{
                signedinOrgType: "orgType1",
                signedinUserRoleHT: "admin",
                ...contextValue
            }}>
                <MemoryRouter initialEntries={["/dashboard/children/1/view"]}>
                    <Routes>
                        <Route path="/dashboard/children/:id/view" element={<ChildDetails />} />
                    </Routes>
                </MemoryRouter>
            </CommonDataContext.Provider>
        );
    };

    beforeEach(() => {
        jest.resetAllMocks();
        mockChildDetails.mockResolvedValue({ data: { data: mockChildData } });
        mockFamilyMembers.mockResolvedValue({ data: { familyDetails: { members: [], isActive: true } } });
    });

    it("renders loader initially", async () => {
        renderWithProviders();
        expect(screen.getByText("Loading...")).toBeInTheDocument();
        await waitFor(() => expect(mockChildDetails).toHaveBeenCalled());
    });

    it("renders child details tab by default", async () => {
        renderWithProviders();
        await waitFor(() => expect(screen.getByText("ChildContactDetails")).toBeInTheDocument());
        expect(screen.getByText("common:common.Thrive Scale")).toBeInTheDocument();
        expect(screen.getByText("common:common.Children")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("shows Edit button for allowed roles/orgTypes", async () => {
        renderWithProviders();
        await waitFor(() => expect(screen.getByText("common:common.Edit")).toBeInTheDocument());
    });

    it("changes tab and renders Assessments", async () => {
        renderWithProviders();
        await waitFor(() => screen.getByText("ChildContactDetails"));
        fireEvent.click(screen.getByRole("tab", { name: "common:common.Assessments" }));
        await waitFor(() => expect(screen.getByText("Assessments")).toBeInTheDocument());
    });

    it("renders Documents tab content", async () => {
        renderWithProviders();
        await waitFor(() => screen.getByText("ChildContactDetails"));
        fireEvent.click(screen.getByRole("tab", { name: "common:common.Documents" }));
        await waitFor(() => expect(screen.getByText("Documents")).toBeInTheDocument());
    });

    it("renders History tab content", async () => {
        renderWithProviders();
        await waitFor(() => screen.getByText("ChildContactDetails"));
        fireEvent.click(screen.getByRole("tab", { name: "common:common.History" }));
        await waitFor(() => expect(screen.getByText("ChildHistory")).toBeInTheDocument());
    });

    it("renders ProgressReport tab content", async () => {
        renderWithProviders();
        await waitFor(() => screen.getByText("ChildContactDetails"));
        fireEvent.click(screen.getByRole("tab", { name: "common:common.Progress Report" }));
        await waitFor(() => expect(screen.getByText("ProgressReport")).toBeInTheDocument());
    });

    it("renders Thrive scale score trend tab content", async () => {
        renderWithProviders();
        await waitFor(() => screen.getByText("ChildContactDetails"));
        fireEvent.click(screen.getByRole("tab", { name: "common:common.Thrive scale score trend" }));
        await waitFor(() => expect(screen.getByText("RadarGraph")).toBeInTheDocument());
    });

    it("renders FollowUps tab content", async () => {
        renderWithProviders();
        await waitFor(() => screen.getByText("ChildContactDetails"));
        fireEvent.click(screen.getByRole("tab", { name: "common:common.Follow - ups" }));
        await waitFor(() => expect(screen.getByText("FollowUps")).toBeInTheDocument());
    });

    it("renders ChildInterventions tab content", async () => {
        renderWithProviders();
        await waitFor(() => screen.getByText("ChildContactDetails"));
        fireEvent.click(screen.getByRole("tab", { name: "common:common.Interventions" }));
        await waitFor(() => expect(screen.getByText("ChildInterventions")).toBeInTheDocument());
    });
});