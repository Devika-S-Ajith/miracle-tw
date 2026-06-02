import React from "react";
import { render, screen } from "@testing-library/react";
import { FamilyMembersSection } from "./FamilyMemberSection";

describe("FamilyMembersSection", () => {
    const primaryParent = [
        {
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            email: "john@example.com",
            roleColor: "#1976d2",
            dateOfBirth: "1980-01-01",
            gender: "Male",
        },
    ];

    const parentData = [
        {
            firstName: "Jane",
            lastName: "Doe",
            phoneNumber: "0987654321",
            email: "jane@example.com",
            roleColor: "#388e3c",
            dateOfBirth: "1982-02-02",
            gender: "Female",
        },
    ];

    const childData = [
        {
            firstName: "Jimmy",
            lastName: "Doe",
            dateOfBirth: "2010-03-03",
            gender: "Male",
            roleColor: "#fbc02d",
        },
    ];

    it("renders all family members with correct labels", () => {
        render(
            <FamilyMembersSection
                primaryParent={primaryParent}
                parentData={parentData}
                childData={childData}
            />
        );

        // Primary Caregiver
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Primary Caregiver")).toBeInTheDocument();
        expect(screen.getByText("1234567890")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();

        // Secondary Caregiver
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
        expect(screen.getByText("Secondary Caregiver")).toBeInTheDocument();
        expect(screen.getByText("0987654321")).toBeInTheDocument();
        expect(screen.getByText("jane@example.com")).toBeInTheDocument();

        // Child
        expect(screen.getByText("Jimmy Doe")).toBeInTheDocument();
        expect(screen.getByText("Child")).toBeInTheDocument();
        expect(screen.getByText("Male")).toBeInTheDocument();
        // Date of birth formatted
        expect(screen.getByText(/2010/)).toBeInTheDocument();
    });

    it("renders nothing if no members are provided", () => {
        render(<FamilyMembersSection />);
        expect(screen.getByText("Caregivers and Family Members")).toBeInTheDocument();
        // No member names should be present
        expect(screen.queryByText("Primary Caregiver")).not.toBeInTheDocument();
        expect(screen.queryByText("Secondary Caregiver")).not.toBeInTheDocument();
        expect(screen.queryByText("Child")).not.toBeInTheDocument();
    });

});