import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AssessmentList from "./AssessmentList";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));

jest.mock(
  "../../../components/UserComponents/useAuthorization",
  () => jest.fn()
);

// const useAuthorization = require(
//   "../../../components/UserComponents/useAuthorization"
// );

jest.mock(
  "../../../components/ConsolidatedAssessmentProgressReport",
  () => () => (
    <div data-testid="progress-report">
      Progress Report
    </div>
  )
);

jest.mock(
  "../../../components/PageBreadcrumbs/PageBreadcrumbs",
  () => ({ data }) => (
    <div data-testid="breadcrumbs">
      {data?.map((item) => item.label).join(" > ")}
    </div>
  )
);

jest.mock(
  "../../../components/UserComponents/PageLoader",
  () => () => (
    <div data-testid="page-loader">
      Loading...
    </div>
  )
);

describe("AssessmentList", () => {
  const contextValue = {};

  beforeEach(() => {
    useAuthorization.mockReturnValue({
      authStatus: "authorized",
      checkAuth: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders breadcrumbs and progress report", () => {
    render(
      <CommonDataContext.Provider value={contextValue}>
        <MemoryRouter>
          <AssessmentList />
        </MemoryRouter>
      </CommonDataContext.Provider>
    );

    expect(
      screen.getByTestId("breadcrumbs")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("progress-report")
    ).toBeInTheDocument();
  });

  it("sets document title on mount", () => {
    render(
      <CommonDataContext.Provider value={contextValue}>
        <MemoryRouter>
          <AssessmentList />
        </MemoryRouter>
      </CommonDataContext.Provider>
    );

    expect(document.title).toBe(
      "Assessments | ThriveWell"
    );
  });

  it("shows loader when auth status is loading", () => {
    useAuthorization.mockReturnValue({
      authStatus: "loading",
      checkAuth: jest.fn(),
    });

    render(
      <CommonDataContext.Provider value={contextValue}>
        <MemoryRouter>
          <AssessmentList />
        </MemoryRouter>
      </CommonDataContext.Provider>
    );

    expect(
      screen.getByTestId("page-loader")
    ).toBeInTheDocument();
  });
  it("shows loader when auth status is idle", () => {
    useAuthorization.mockReturnValue({
      authStatus: "idle",
      checkAuth: jest.fn(),
    });

    render(
      <CommonDataContext.Provider value={contextValue}>
        <MemoryRouter>
          <AssessmentList />
        </MemoryRouter>
      </CommonDataContext.Provider>
    );

    expect(
      screen.getByTestId("page-loader")
    ).toBeInTheDocument();
  });

  it("renders nothing when unauthorized", () => {
  useAuthorization.mockReturnValue({
    authStatus: "unauthorized",
    checkAuth: jest.fn(),
  });

  const { container } = render(
    <CommonDataContext.Provider value={contextValue}>
      <MemoryRouter>
        <AssessmentList />
      </MemoryRouter>
    </CommonDataContext.Provider>
  );

  expect(container.firstChild).toBeNull();
});

  it("calls checkAuth on mount", () => {
    const checkAuth = jest.fn();

    useAuthorization.mockReturnValue({
      authStatus: "authorized",
      checkAuth,
    });

    render(
      <CommonDataContext.Provider value={contextValue}>
        <MemoryRouter>
          <AssessmentList />
        </MemoryRouter>
      </CommonDataContext.Provider>
    );

    expect(checkAuth).toHaveBeenCalled();
  });
  it("renders assessment content when authorized", () => {
  useAuthorization.mockReturnValue({
    authStatus: "authorized",
    checkAuth: jest.fn(),
  });

  render(
    <CommonDataContext.Provider value={contextValue}>
      <MemoryRouter>
        <AssessmentList />
      </MemoryRouter>
    </CommonDataContext.Provider>
  );

  expect(
    screen.getByTestId("breadcrumbs")
  ).toBeInTheDocument();

  expect(
    screen.getByTestId("progress-report")
  ).toBeInTheDocument();

  expect(
    screen.queryByTestId("page-loader")
  ).not.toBeInTheDocument();
});
});