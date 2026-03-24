import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import UserDetails from "./UserDetails";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { MemoryRouter, useNavigate } from "react-router-dom";
import APIS from "../../../common/hooks/UseApiCalls";

// Mock dependencies
jest.mock("../../../common/hooks/UseSettings", () => () => ({
    settings: { compact: false }
}));
jest.mock("../../../common/hooks/UseApiCalls", () => ({
    UserDetails: jest.fn()
}));
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}));
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({ id: "123" }),
    useNavigate: () => jest.fn()
}));

const mockUser = {
    id: "123",
    firstName: "John",
    lastName: "Doe",
    addressLine1: "123 Main St",
    addressLine2: "Apt 4",
    HTCountryId: "1",
    HTDistrictId: "2",
    HTStateId: "3",
    email: "john.doe@example.com",
    phoneNumber: "555-1234",
    TWAccountId: "10",
    city: "Metropolis",
    HTUserRoleId: "5",
    FSUserRoleId: "6",
    status: "active",
    zipCode: "12345",
    cognitoId: "cognito-xyz"
};

const mockLocationList = [
    { id: "1", countryName: "CountryA" },
    { id: "2", countryName: "CountryB" }
];

describe("UserDetails", () => {
    beforeEach(() => {
        APIS.UserDetails.mockResolvedValue({
            data: { data: mockUser }
        });
        localStorage.setItem("orgId", "org-1");
        localStorage.setItem("userRegion", "1");
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    function renderWithProviders() {
        return render(
            <CommonDataContext.Provider
                value={{
                    getUserTokens: jest.fn(),
                    locationList: mockLocationList
                }}
            >
                <MemoryRouter>
                    <UserDetails />
                </MemoryRouter>
            </CommonDataContext.Provider>
        );
    }

    it("renders user details including phone number", async () => {
        renderWithProviders();

        await waitFor(() => {
            expect(screen.getByText("common:common.Admin")).toBeInTheDocument();
            expect(screen.getByText("common:common.Team")).toBeInTheDocument();
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        // Check if phone number is rendered
        expect(screen.getByText(mockUser.phoneNumber)).toBeInTheDocument();
    });

    it("renders nothing if user is not loaded", async () => {
        APIS.UserDetails.mockResolvedValue({ data: { data: null } });
        renderWithProviders();

        await waitFor(() => {
            expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        });
    });

    it("sets selectedCountry based on localStorage and locationList", async () => {
        renderWithProviders();

        await waitFor(() => {
            // The selected country should be CountryA (id: "1")
            const countryElements = screen.getAllByText("CountryA");
            expect(countryElements.length).toBeGreaterThan(0);
            // Optionally, check a specific one:
            expect(countryElements[0]).toBeInTheDocument();
        });
    });
});