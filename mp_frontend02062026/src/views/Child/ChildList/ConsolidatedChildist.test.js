import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import ConsolidatedChildList from "./ConsolidatedChildist";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import { ModalService } from "../../../components/Modal";

const mockNavigate = jest.fn();
const mockCheckAuth = jest.fn();
const mockUseAuthorization = jest.fn();
const mockUseCRUDPermissions = jest.fn();


jest.mock(
  "../../../components/Modal",
  () => ({
    __esModule: true,
    ModalService: {
      open: jest.fn(),
    },
  })
);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

jest.mock(
  "../../../components/UserComponents/useAuthorization",
  () => (...args) => mockUseAuthorization(...args)
);

jest.mock(
  "../../../components/UserComponents/useCRUDPermissions",
  () => () => mockUseCRUDPermissions()
);

jest.mock(
  "../../../components/PageBreadcrumbs/PageBreadcrumbs",
  () => () => <div data-testid="breadcrumbs">Breadcrumbs</div>
);

jest.mock(
  "../../../components/UserComponents/PageLoader",
  () => () => (
    <div data-testid="loader">
      Loader
    </div>
  )
);

jest.mock(
  "../../../components/BodyText/BodyText",
  () => ({ value, onClick }) => (
    <div onClick={onClick}>{value}</div>
  )
);

jest.mock(
  "../../../components/SecondaryButton/SecondaryButton",
  () => ({ label, onClick, loading }) => (
    <button
      onClick={onClick}
      disabled={loading}
    >
      {label}
    </button>
  )
);

jest.mock(
  "../Components/ChildListTable/ChildDetailForms/ManageChildForm",
  () => (props) => {
    props.handleChildModalOpen?.();

    return (
      <div data-testid="manage-child-form">
        ManageChildForm
      </div>
    );
  }
);

jest.mock(
  "../../../helpers/helperFunction",
  () => ({
    GenerateFileName: jest.fn(() => "children.xlsx"),
  })
);

jest.mock(
  "../../../assets/icons/PencilAlt",
  () => () => <div>EditIcon</div>
);

jest.mock(
  "../../../assets/icons/Trash",
  () => () => <div>TrashIcon</div>
);

jest.mock(
  "../../../assets/icons/SideBarIcons",
  () => ({
    AssessmentProgressReportIcon: () => (
      <div>AssessmentProgressReportIcon</div>
    ),
  })
);

jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    Chip: ({ label, onDelete }) => (
      <button
        data-testid={`chip-${label}`}
        onClick={onDelete}
      >
        {label}
      </button>
    ),
    Autocomplete: ({
  options = [],
  getOptionLabel,
  isOptionEqualToValue,
  renderInput,
  renderTags,
  onChange,
}) => {
  if (options.length && getOptionLabel) {
    getOptionLabel(options[0]);
  }

  if (options.length && isOptionEqualToValue) {
    isOptionEqualToValue(
      options[0],
      options[0]
    );
  }

  if (renderInput) {
    renderInput({
      InputProps: {},
      inputProps: {},
    });
  }

  return (
    <div>
      <button
        data-testid="autocomplete-change"
        onClick={() =>
          onChange?.(null, options.slice(0, 1))
        }
      >
        Change
      </button>

      {renderTags?.(
        options.slice(0, 1),
        () => ({
          onDelete: jest.fn(),
        })
      )}
    </div>
  );
},
  };
});

jest.mock(
  "../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable",
  () => (props) => {
    const row = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      familyName: "Smith Family",
      familyId: 99,
      caseWorkerFirstName: "Case",
      caseWorkerLastName: "Worker",
      childPlacementStatusValue: "Home",
      status: "Unknown",
    };

    return (
      <div data-testid="table">
      {props.filterComponent}
        {props.columns.map((column) => (
          <div
            key={column.id}
            data-testid={`column-${column.id}`}
          >
            {column.render
              ? column.render(row)
              : null}
          </div>
        ))}

        <button
          data-testid="apply-filter"
          onClick={() =>
            props.applyFilter({
              search: "john",
              rowCount: 10,
            })
          }
        >
          Apply Filter
        </button>

        <button
          data-testid="cancel-filter"
          onClick={props.cancelFilter}
        >
          Cancel Filter
        </button>

        <button
          data-testid="clear-filter"
          onClick={props.clearFilter}
        >
          Clear Filter
        </button>

        <button
          data-testid="delete-chip"
          onClick={() =>
            props.handleChipDelete(
              "status",
              "Active",
              {
                search: "",
                rowCount: 10,
              }
            )
          }
        >
          Delete Chip
        </button>

        {props.tableExtraButtons({
          query: "john",
          appliedFiltersChipArray: {
            status: [
              { value: "Active" },
            ],
          },
        })}
      </div>
    );
  }
);

jest.mock(
  "../../../common/hooks/UseApiCalls",
  () => ({
    __esModule: true,
    default: {
      GetChildList: jest.fn(),
      ListUsers: jest.fn(),
      exportChildren: jest.fn(),
    },
  })
);

APIS.ListUsers.mockResolvedValue({
  data: {
    data: [
      {
        id: 1,
        firstName: "Case",
        lastName: "Worker",
      },
    ],
  },
});

const renderComponent = () =>
  render(
    <CommonDataContext.Provider
      value={{
        signedinOrgId: "1",
        signedInOrgName: "Test Org",
        userIdData: "123",
      }}
    >
      <ConsolidatedChildList />
    </CommonDataContext.Provider>
  );

describe("ConsolidatedChildList", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthorization.mockReturnValue({
      authStatus: "authorized",
      checkAuth: mockCheckAuth,
    });

    mockUseCRUDPermissions.mockReturnValue({
      IS_HT_ALLOWED: true,
    });

    APIS.GetChildList.mockResolvedValue({
      data: {
        data: [],
        pageCount: 1,
        totalCount: 0,
      },
    });

    APIS.ListUsers.mockResolvedValue({
      data: {
        data: [],
      },
    });

    APIS.exportChildren.mockResolvedValue({
      data: "base64-content",
    });
  });
  afterEach(() => {
  jest.restoreAllMocks();
});

mockUseCRUDPermissions.mockReturnValue({
  IS_HT_ALLOWED: true,
});

  it("renders successfully", async () => {
    renderComponent();

    expect(
      screen.getByTestId("table")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        APIS.GetChildList
      ).toHaveBeenCalled();
    });

    expect(mockCheckAuth).toHaveBeenCalled();
    expect(document.title).toBe(
      "Child | ThriveWell"
    );
  });

  it("renders loader for loading state", () => {
    mockUseAuthorization.mockReturnValue({
      authStatus: "loading",
      checkAuth: jest.fn(),
    });

    renderComponent();

    expect(
      screen.getByTestId("loader")
    ).toBeInTheDocument();
  });

  it("renders loader for idle state", () => {
    mockUseAuthorization.mockReturnValue({
      authStatus: "idle",
      checkAuth: jest.fn(),
    });

    renderComponent();

    expect(
      screen.getByTestId("loader")
    ).toBeInTheDocument();
  });

  it("returns null when unauthorized", () => {
    mockUseAuthorization.mockReturnValue({
      authStatus: "unauthorized",
      checkAuth: jest.fn(),
    });

    const { container } =
      renderComponent();

    expect(
      container.firstChild
    ).toBeNull();
  });

  it("calls apply filter", async () => {
    renderComponent();

    fireEvent.click(
      screen.getByTestId("apply-filter")
    );

    await waitFor(() => {
      expect(
        APIS.GetChildList
      ).toHaveBeenCalledTimes(2);
    });
  });

  it("calls cancel filter", () => {
    renderComponent();

    fireEvent.click(
      screen.getByTestId("cancel-filter")
    );
  });

  it("calls clear filter", () => {
    renderComponent();

    fireEvent.click(
      screen.getByTestId("clear-filter")
    );
  });

  it("calls chip delete", async () => {
    renderComponent();

    fireEvent.click(
      screen.getByTestId("delete-chip")
    );

    await waitFor(() => {
      expect(
        APIS.GetChildList
      ).toHaveBeenCalled();
    });
  });

  it("exports children successfully", async () => {
  const clickMock = jest.fn();

  const originalCreateElement =
    document.createElement.bind(document);

  jest
    .spyOn(document, "createElement")
    .mockImplementation((tagName) => {
      if (tagName === "a") {
        const anchor = originalCreateElement("a");
        anchor.click = clickMock;
        return anchor;
      }

      return originalCreateElement(tagName);
    });

    renderComponent();

    fireEvent.click(
      screen.getByText(
        "common:common.Export"
      )
    );

    await waitFor(() => {
      expect(
        APIS.exportChildren
      ).toHaveBeenCalled();
    });
  });


it("opens add child modal and renders ManageChildForm", () => {
  renderComponent();

  fireEvent.click(
    screen.getByText(
      "common:tableColumn.Add new child"
    )
  );

  expect(ModalService.open).toHaveBeenCalled();

  const modalRenderer =
    ModalService.open.mock.calls[0][0];

  const rendered =
    modalRenderer({
      close: jest.fn(),
    });

  expect(rendered).toBeTruthy();
});

  it("covers GetChildList error branch", async () => {
    APIS.GetChildList.mockRejectedValue(
      new Error("API Error")
    );

    renderComponent();

    await waitFor(() => {
      expect(
        APIS.GetChildList
      ).toHaveBeenCalled();
    });
  });

  it("covers ListUsers error branch", async () => {
    APIS.ListUsers.mockRejectedValue(
      new Error("API Error")
    );

    renderComponent();

    await waitFor(() => {
      expect(
        APIS.ListUsers
      ).toHaveBeenCalled();
    });
  });

  it("covers IS_HT_ALLOWED false branch", () => {
    mockUseCRUDPermissions.mockReturnValue({
      IS_HT_ALLOWED: false,
    });

    renderComponent();

    expect(
      screen.getByTestId("table")
    ).toBeInTheDocument();
  });

  it("handles export failure", async () => {
  APIS.exportChildren.mockRejectedValue(
    new Error("Export Failed")
  );

  renderComponent();

  fireEvent.click(
    screen.getByText("common:common.Export")
  );

  await waitFor(() => {
    expect(
      APIS.exportChildren
    ).toHaveBeenCalled();
  });
});

it("navigates to child view", () => {
  renderComponent();

  fireEvent.click(
    screen.getByText("John Doe")
  );

  expect(mockNavigate).toHaveBeenCalledWith(
    "/dashboard/children/1/view"
  );
});

it("navigates to family view", () => {
  renderComponent();

  fireEvent.click(
    screen.getByText("Smith Family")
  );

  expect(mockNavigate).toHaveBeenCalledWith(
    "/dashboard/families/99/view"
  );
});

it("opens action menu", () => {
  renderComponent();

  fireEvent.click(
    screen.getByLabelText("more")
  );
});

it("covers getUserList catch console error", async () => {
  const spy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  APIS.ListUsers.mockRejectedValue(
    new Error("User API Error")
  );

  renderComponent();

  await waitFor(() => {
    expect(spy).toHaveBeenCalled();
  });

  spy.mockRestore();
});

it("covers autocomplete change", () => {
  renderComponent();

  fireEvent.click(
    screen.getAllByTestId(
      "autocomplete-change"
    )[0]
  );
});

it("removes download link after export", async () => {
  const removeSpy = jest.spyOn(
    document.body,
    "removeChild"
  );

  renderComponent();

  fireEvent.click(
    screen.getByText("common:common.Export")
  );

  await waitFor(() => {
    expect(removeSpy).toHaveBeenCalled();
  });
});

it("covers second autocomplete", () => {
  renderComponent();

  const buttons =
    screen.getAllByTestId(
      "autocomplete-change"
    );

  fireEvent.click(buttons[1]);
});

it("covers chip delete callbacks", () => {
  renderComponent();

  const chips =
    screen.queryAllByTestId(/chip-/);

  chips.forEach((chip) => {
    fireEvent.click(chip);
  });
});

it("covers edit child action", () => {
  renderComponent();

  fireEvent.click(
    screen.getByLabelText("more")
  );

  const editButton =
    document.getElementById("edit-family");

  if (editButton) {
    fireEvent.click(editButton);
  }
});

it("covers handleChipDelete after filter applied", () => {
  renderComponent();

  fireEvent.click(
    screen.getAllByTestId(
      "autocomplete-change"
    )[0]
  );

  fireEvent.click(
    screen.getByTestId("apply-filter")
  );

  fireEvent.click(
    screen.getByTestId("delete-chip")
  );
});

it("covers status delete callback with populated state", () => {
  renderComponent();

  fireEvent.click(
    screen.getAllByTestId(
      "autocomplete-change"
    )[0]
  );

  const chips =
    screen.queryAllByTestId(/chip-/);

  chips.forEach((chip) => {
    fireEvent.click(chip);
  });
});

it("covers case worker delete callback", async () => {
  renderComponent();

  await waitFor(() => {
    expect(
      APIS.ListUsers
    ).toHaveBeenCalled();
  });

  fireEvent.click(
    screen.getAllByTestId(
      "autocomplete-change"
    )[1]
  );

  const chips =
    screen.queryAllByTestId(/chip-/);

  chips.forEach((chip) => {
    fireEvent.click(chip);
  });
});

it("re-runs authorized effect", async () => {
  mockUseAuthorization.mockReturnValue({
    authStatus: "authorized",
    checkAuth: mockCheckAuth,
  });

  renderComponent();

  await waitFor(() => {
    expect(
      APIS.GetChildList
    ).toHaveBeenCalled();
  });

  expect(
    APIS.ListUsers
  ).toHaveBeenCalled();
});

it("navigates to assessment progress reports", () => {
  renderComponent();

  fireEvent.click(
    screen.getByLabelText("more")
  );

  const buttons =
    screen.getAllByRole("button");

  const assessmentButton =
    buttons.find(
      (btn) =>
        btn.textContent?.includes(
          "AssessmentProgressReportIcon"
        )
    );

  if (assessmentButton) {
    fireEvent.click(assessmentButton);
  }

  expect(mockNavigate).toHaveBeenCalledWith(
    "/dashboard/children/1/view",
    {
      state: {
        tabvalue:
          "assessmentsProgressReports",
      },
    }
  );
});

it("covers caseWorker filter mapping", async () => {
  renderComponent();

  fireEvent.click(
    screen.getAllByTestId(
      "autocomplete-change"
    )[1]
  );

  fireEvent.click(
    screen.getByTestId("apply-filter")
  );

  await waitFor(() => {
    expect(
      APIS.GetChildList
    ).toHaveBeenCalled();
  });
});

it("covers user mapping", async () => {
  APIS.ListUsers.mockResolvedValue({
    data: {
      data: [
        {
          id: 1,
          firstName: "John",
          lastName: "Worker",
        },
      ],
    },
  });

  renderComponent();

  await waitFor(() => {
    expect(
      APIS.ListUsers
    ).toHaveBeenCalled();
  });
});

it("covers handleClose", () => {
  renderComponent();

  fireEvent.click(
    screen.getByLabelText("more")
  );

  fireEvent.keyDown(
    document,
    { key: "Escape" }
  );
});

it("covers caseWorker filter mapping", async () => {
  renderComponent();

  fireEvent.click(
    screen.getAllByTestId(
      "autocomplete-change"
    )[1]
  );

  fireEvent.click(
    screen.getByTestId("apply-filter")
  );

  await waitFor(() => {
    expect(
      APIS.GetChildList
    ).toHaveBeenCalled();
  });

  expect(
    APIS.GetChildList.mock.calls
  ).toEqual(
    expect.arrayContaining([
      expect.arrayContaining([
        expect.objectContaining({
          caseWorker: expect.any(Array),
        }),
      ]),
    ])
  );
});

it("covers menu close", () => {
  renderComponent();

  fireEvent.click(
    screen.getByLabelText("more")
  );

  fireEvent.click(document.body);
});
});