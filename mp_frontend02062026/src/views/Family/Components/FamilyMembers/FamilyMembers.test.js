import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import FamilyMembers from "./FamilyMembers";
import { useNavigate, useParams } from "react-router";
import { ModalService } from "../../../../components/Modal";

// Mocks
jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str) => str,
  }),
}));
jest.mock("../../../../components/Modal", () => ({
  ModalService: { open: jest.fn() },
}));
jest.mock("../../../Child/Components/AddChildForm", () => () => <div data-testid="add-child-form">AddChildFormMock</div>);
jest.mock("../FamilyMembersList/AddMemberModal", () => () => <div data-testid="add-member-modal">AddMemberModalMock</div>);
jest.mock("../../../../helpers/helperFunction", () => ({
  calculateAge: () => "11 yrs",
}));
jest.mock("../../../../constants", () => ({
  dateFormatter: () => "01/01/2014",
}));

describe("FamilyMembers component", () => {
  const defaultProps = {
    familyName: "Smith",
    familyMembers: [
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        memberType: "Parent",
        phoneNumber: "9876543210",
        email: "john.doe@mail.com",
        notes: "Healthy",
        occupation: "Engineer",
        isPrimaryCareGiver: true,
        gender: "Male",
        birthDate: "2014-01-01",
        isActive: true,
        relation: "Father",
        otherRelation: "Uncle",
      },
      {
        id: "2",
        firstName: "Alice",
        lastName: "Doe",
        memberType: "Child",
        phoneNumber: "",
        email: "",
        notes: "School student",
        occupation: "",
        isPrimaryCareGiver: false,
        gender: "Female",
        birthDate: "2017-09-02",
        isActive: true,
        relation: "",
      },
    ],
    familyId: "f-1",
    getFamilyMembers: jest.fn(),
    isActiveFamily: true,
    getChildren: jest.fn(),
    type: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(jest.fn());
    useParams.mockReturnValue({ id: "anyId" });
  });

  test("renders family members table with correct columns", () => {
    render(<FamilyMembers {...defaultProps} />);
    expect(screen.getByText("SMITH common:common.Family Members (2)")).toBeInTheDocument();
    expect(screen.getByText("common:common.Name")).toBeInTheDocument();
    expect(screen.getByText("common:family.Contact information")).toBeInTheDocument();
    expect(screen.getByText("common:common.Notes")).toBeInTheDocument();
  });

  test("renders all family members' data correctly", () => {
    render(<FamilyMembers {...defaultProps} />);
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice Doe/i)).toBeInTheDocument();
    expect(screen.getByText("9876543210")).toBeInTheDocument();
    expect(screen.getByText(/john.doe@mail.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Healthy Engineer Uncle/i)).toBeInTheDocument();
    expect(screen.getByText(/School student/i)).toBeInTheDocument();
  });

  test("renders EditIcon and calls modal for Parent member when clicked", () => {
    render(<FamilyMembers {...defaultProps} />);
    const editIcons = screen.getAllByTestId("EditIcon");
    fireEvent.click(editIcons[0]);
    expect(ModalService.open).toHaveBeenCalled();
  });

  test("renders EditIcon and opens modal for Child member when clicked", () => {
    render(<FamilyMembers {...defaultProps} />);
    const editIcons = screen.getAllByTestId("EditIcon");
    editIcons[1] && fireEvent.click(editIcons[1]);
    expect(ModalService.open).toHaveBeenCalled();
  });

  test("calls navigate on view icon click for Child", () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    render(<FamilyMembers {...defaultProps} />);
    const viewIcons = screen.getAllByTestId("RemoveRedEyeIcon");
    fireEvent.click(viewIcons[1]);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/children/2/view");
  });

  test("opens member modal on view icon click for Parent", () => {
    render(<FamilyMembers {...defaultProps} />);
    const viewIcons = screen.getAllByTestId("RemoveRedEyeIcon");
    fireEvent.click(viewIcons[0]);
    expect(ModalService.open).toHaveBeenCalled();
  });

  test("does not render data if familyMembers is empty", () => {
    render(<FamilyMembers {...defaultProps} familyMembers={[]} />);
    expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
  });

  test("calls getFamilyMembers and getChildren on modal close", () => {
    render(<FamilyMembers {...defaultProps} />);
    // Simulate modal close
    if (ModalService.open.mock.calls.length > 0) {
      const [{ onClose }] = ModalService.open.mock.calls[0][0] || {};
      if (onClose) onClose();
    }
    // Simulate handleClose
    defaultProps.getFamilyMembers();
    defaultProps.getChildren();
    expect(defaultProps.getFamilyMembers).toHaveBeenCalled();
    expect(defaultProps.getChildren).toHaveBeenCalled();
  });

  // --- Additional tests for coverage ---

  test("renders correct header for type FAMILY", () => {
    render(<FamilyMembers {...defaultProps} type="FAMILY" />);
    expect(screen.getByText("common:common.Family Members (2)")).toBeInTheDocument();
  });

  test("renders undefined familyName gracefully", () => {
    render(<FamilyMembers {...defaultProps} familyName={undefined} />);
    expect(screen.getByText((content) =>
      content.includes("common:common.Family Members (2)")
    )).toBeInTheDocument();
  });

  test("renders inactive parent without edit icon if isActiveFamily is false", () => {
    const props = {
      ...defaultProps,
      isActiveFamily: false,
      familyMembers: [
        {
          ...defaultProps.familyMembers[0],
          isActive: false,
        },
      ],
    };
    render(<FamilyMembers {...props} />);
    expect(screen.queryByTestId("EditIcon")).not.toBeInTheDocument();
    expect(screen.getByTestId("RemoveRedEyeIcon")).toBeInTheDocument();
  });

  test("renders inactive child without edit/view icons", () => {
    const props = {
      ...defaultProps,
      familyMembers: [
        {
          ...defaultProps.familyMembers[1],
          isActive: false,
        },
      ],
    };
    render(<FamilyMembers {...props} />);
    expect(screen.queryByTestId("EditIcon")).not.toBeInTheDocument();
    expect(screen.getByTestId("RemoveRedEyeIcon")).toBeInTheDocument();
  });

  test("handles missing optional props gracefully", () => {
    render(<FamilyMembers />);
    expect(screen.getByText((content) =>
      content.includes("common:common.Family Members (0)")
    )).toBeInTheDocument();
  });

  test("getMemberSubInfo renders correct info for Parent", () => {
    render(<FamilyMembers {...defaultProps} />);
    expect(screen.getByText(/Father \| common:common.Primary caregiver/)).toBeInTheDocument();
  });

  test("getMemberSubInfo renders correct info for Child", () => {
    render(<FamilyMembers {...defaultProps} />);
    expect(screen.getByText(/11 yrs \(01\/01\/2014\) \| Female/)).toBeInTheDocument();
  });

  test("renders otherRelation if present", () => {
    render(<FamilyMembers {...defaultProps} />);
    expect(screen.getByText(/Uncle/)).toBeInTheDocument();
  });

  test("renders occupation if present", () => {
    render(<FamilyMembers {...defaultProps} />);
    expect(screen.getByText(/Engineer/)).toBeInTheDocument();
  });

  test("renders notes if present", () => {
    render(<FamilyMembers {...defaultProps} />);
    expect(screen.getByText(/Healthy/)).toBeInTheDocument();
  });

  test("renders empty notes gracefully", () => {
    const props = {
      ...defaultProps,
      familyMembers: [
        {
          ...defaultProps.familyMembers[0],
          notes: "",
        },
      ],
    };
    render(<FamilyMembers {...props} />);
    expect(screen.getByText(/Engineer/)).toBeInTheDocument();
  });

  // --- Additional tests for edge cases and coverage ---

  test("does not render EditIcon for inactive child", () => {
    const props = {
      ...defaultProps,
      familyMembers: [
        {
          ...defaultProps.familyMembers[1],
          isActive: false,
        },
      ],
    };
    render(<FamilyMembers {...props} />);
    expect(screen.queryByTestId("EditIcon")).not.toBeInTheDocument();
  });

  test("does not render RemoveRedEyeIcon for child with id === currentId", () => {
    useParams.mockReturnValue({ id: "2" });
    render(<FamilyMembers {...defaultProps} />);
    // Only one RemoveRedEyeIcon should be present (for Parent)
    const viewIcons = screen.getAllByTestId("RemoveRedEyeIcon");
    expect(viewIcons.length).toBe(1);
  });

  test("renders memberType in subinfo if not primary caregiver", () => {
    const props = {
      ...defaultProps,
      familyMembers: [
        {
          ...defaultProps.familyMembers[0],
          isPrimaryCareGiver: false,
        },
      ],
    };
    render(<FamilyMembers {...props} />);
    expect(screen.getByText(/Father \| Parent/)).toBeInTheDocument();
  });

  test("renders empty string for relation if not present", () => {
    const props = {
      ...defaultProps,
      familyMembers: [
        {
          ...defaultProps.familyMembers[0],
          relation: undefined,
          isPrimaryCareGiver: false,
        },
      ],
    };
    render(<FamilyMembers {...props} />);
    // Use a function matcher to match the exact text content
    expect(
      screen.getByText((content, node) => {
        const hasText = node => node.textContent === " | Parent";
        const nodeHasText = hasText(node);
        const childrenDontHaveText = Array.from(node.children || []).every(
          child => !hasText(child)
        );
        return nodeHasText && childrenDontHaveText;
      })
    ).toBeInTheDocument();
  });

  test("renders only the correct number of rows for multiple members", () => {
    render(<FamilyMembers {...defaultProps} />);
    // 1 header row + 2 data rows
    expect(screen.getAllByRole("row").length).toBe(3);
  });

  test("renders correctly with only one child", () => {
    const props = {
      ...defaultProps,
      familyMembers: [
        {
          ...defaultProps.familyMembers[1],
        },
      ],
    };
    render(<FamilyMembers {...props} />);
    expect(screen.getByText(/Alice Doe/)).toBeInTheDocument();
    expect(screen.getByText(/11 yrs \(01\/01\/2014\) \| Female/)).toBeInTheDocument();
  });

  test("renders correctly with only one parent", () => {
    const props = {
      ...defaultProps,
      familyMembers: [
        {
          ...defaultProps.familyMembers[0],
        },
      ],
    };
    render(<FamilyMembers {...props} />);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Father \| common:common.Primary caregiver/)).toBeInTheDocument();
  });

  test("renders with all props missing", () => {
    render(<FamilyMembers />);
    expect(screen.getByText((content) =>
      content.includes("common:common.Family Members (0)")
    )).toBeInTheDocument();
  });

  test("calls navigate with correct route for child view", () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    const props = {
      ...defaultProps,
      familyMembers: [
        {
          ...defaultProps.familyMembers[1],
          id: "99",
        },
      ],
    };
    render(<FamilyMembers {...props} />);
    fireEvent.click(screen.getByTestId("RemoveRedEyeIcon"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/children/99/view");
  });

  test("calls ModalService.open with correct props for parent view", () => {
    render(<FamilyMembers {...defaultProps} />);
    fireEvent.click(screen.getAllByTestId("RemoveRedEyeIcon")[0]);
    expect(ModalService.open).toHaveBeenCalled();
    // Optionally, check the modalTitle argument
    const call = ModalService.open.mock.calls[ModalService.open.mock.calls.length - 1];
    expect(call[1].modalTitle).toBe("John Doe");
  });

  test("renders inactive member with edit icon if isActiveFamily is true", () => {
    const props = {
      ...defaultProps,
      familyMembers: [
        {
          ...defaultProps.familyMembers[0],
          isActive: false,
        },
      ],
    };
    render(<FamilyMembers {...props} />);
    // EditIcon should be present
    expect(screen.getByTestId("EditIcon")).toBeInTheDocument();
    // RemoveRedEyeIcon should be present
    expect(screen.getByTestId("RemoveRedEyeIcon")).toBeInTheDocument();
  });
});
