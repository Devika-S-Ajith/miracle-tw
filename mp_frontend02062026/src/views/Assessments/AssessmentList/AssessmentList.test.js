import React from "react";
import { render, screen } from "@testing-library/react";
import AssessmentList from "./AssessmentList";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { MemoryRouter } from "react-router-dom";

// Mock dependencies
jest.mock("../../../components/UserComponents/useAuthorization", () => jest.fn());
jest.mock("../../../components/ConsolidatedAssessmentProgressReport", () => () => <div data-testid="progress-report" />);
jest.mock("../../../components/PageBreadcrumbs/PageBreadcrumbs", () => ({ data }) => (
  <div data-testid="breadcrumbs">
    {data.map((item, idx) => item?.label && <span key={idx}>{item.label}</span>)}
  </div>
));
jest.mock("../../../constants", () => ({
    BreadcrumbsLinkThriveScale: jest.fn(() => ({ label: "ThriveScale" })),
}));
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key, fallback) => fallback || key,
    }),
}));

describe("AssessmentList", () => {
    const contextValue = {
        signedinUserRoleHT: "Admin",
        signedinOrgType: "OrgType",
    };

    beforeEach(() => {
        // Reset document title before each test
        document.title = "";
    });

    it("renders breadcrumbs and progress report", () => {
        render(
            <CommonDataContext.Provider value={contextValue}>
                <MemoryRouter>
                    <AssessmentList />
                </MemoryRouter>
            </CommonDataContext.Provider>
        );

        expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
        expect(screen.getByTestId("progress-report")).toBeInTheDocument();
        expect(screen.getByText("Assessments")).toBeInTheDocument();
    });

    it("sets the document title on mount", () => {
        render(
            <CommonDataContext.Provider value={contextValue}>
                <MemoryRouter>
                    <AssessmentList />
                </MemoryRouter>
            </CommonDataContext.Provider>
        );
        expect(document.title).toBe("Assessments | ThriveWell");
    });
});