import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddAssessment from "./AddAssessment";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const mockNavigate = jest.fn();
const mockHandleExport = jest.fn();
const mockUseAuthorization = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

jest.mock(
  "../../../components/UserComponents/useAuthorization",
  () => jest.fn((...args) => mockUseAuthorization(...args))
);

jest.mock("../../../components/PageBreadcrumbs/PageBreadcrumbs", () => {
  return function MockPageBreadcrumbs({ data }) {
    return (
      <div data-testid="breadcrumbs">
        {data.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  };
});

jest.mock("../../../constants", () => ({
  BreadcrumbsLinkThriveScale: (t, navigate) => ({
    label: t("common:common.Thrive Scale"),
    onClick: () => navigate("/dashboard"),
  }),
}));

jest.mock("../Components/ViewAssessment", () => {
  const React = require("react");

  return React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      handleExport: mockHandleExport,
    }));

    return (
      <div data-testid="view-assessment">
        ViewAssessment Component
      </div>
    );
  });
});

const { useLocation } = require("react-router-dom");

const renderComponent = (locationState = {}) => {
  useLocation.mockReturnValue(locationState);

  return render(
    <CommonDataContext.Provider
      value={{
        signedinUserRoleHT: "Admin",
        signedinOrgType: "Organization",
      }}
    >
      <AddAssessment />
    </CommonDataContext.Provider>
  );
};

describe("AddAssessment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.title = "";
  });

  it("renders breadcrumbs and child component", () => {
    renderComponent({
      state: {
        viewAssessment: true,
      },
    });

    expect(
      screen.getByText("common:common.Thrive Scale")
    ).toBeInTheDocument();

    expect(
      screen.getByText("common:common.Assessments")
    ).toBeInTheDocument();

    expect(
      screen.getByText("common:assessment.View Assessment")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("view-assessment")
    ).toBeInTheDocument();
  });

  it("sets document title when viewAssessment is true", () => {
    renderComponent({
      state: {
        viewAssessment: true,
      },
    });

    expect(document.title).toBe(
      "Assessments | View | ThriveWell"
    );
  });

  it("does not set document title when viewAssessment is false", () => {
    renderComponent({
      state: {
        viewAssessment: false,
      },
    });

    expect(document.title).toBe("");
  });

  it("handles missing location state", () => {
    renderComponent({});

    expect(
      screen.getByText("common:assessment.View Assessment")
    ).toBeInTheDocument();
  });

  it("navigates to dashboard", () => {
    renderComponent({
      state: {
        viewAssessment: true,
      },
    });

    fireEvent.click(
      screen.getByText("common:common.Thrive Scale")
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard"
    );
  });

  it("navigates to assessments page", () => {
    renderComponent({
      state: {
        viewAssessment: true,
      },
    });

    fireEvent.click(
      screen.getByText("common:common.Assessments")
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/assessments"
    );
  });

  it("calls export handler", () => {
    renderComponent({
      state: {
        viewAssessment: true,
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "common:common.Export",
      })
    );

    expect(mockHandleExport).toHaveBeenCalledTimes(1);
  });

  it("calls useAuthorization correctly", () => {
  renderComponent({
    state: {
      viewAssessment: true,
    },
  });

  expect(useAuthorization).toHaveBeenCalledWith(
    "Admin",
    null,
    "Organization",
    "Assessment",
    true
  );
});

  it("covers false branch of handleExport optional chaining", () => {
    const spy = jest
      .spyOn(React, "useImperativeHandle")
      .mockImplementation((ref) => {
        ref.current = {};
      });

    renderComponent({
      state: {
        viewAssessment: true,
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "common:common.Export",
      })
    );

    expect(mockHandleExport).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});