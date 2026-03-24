import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as reactRouter from "react-router";
import ChildDetailsContainer from "./ChildDetailsContainer";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";

// Mock components used inside
const mockNavigate = jest.fn();
jest.mock("react-router", () => {
  // Import actual to retain other exports (like useParams, useLocation)
  const actual = jest.requireActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("./ChildDetails", () => ({ onSuccess }) => (
  <div data-testid="child-details">
    ChildDetails
    <button data-testid="on-success-btn" onClick={onSuccess}>
      Success
    </button>
  </div>
));
jest.mock("./ChildHistoryList", () => () => (
  <div data-testid="child-history">ChildHistoryList</div>
));
jest.mock("./ChildCombinedLogsList", () => () => (
  <div data-testid="child-logs">ChildCombinedLogsList</div>
));
jest.mock(
  "../../../../components/UserComponents/Loader",
  () =>
    ({ loading }) =>
      loading ? <div data-testid="loader">Loading...</div> : null
);

// Mock API calls
jest.mock("../../../../common/hooks/UseApiCalls", () => ({
  getFsChild: jest.fn(),
  getChildHistoryList: jest.fn(),
}));

// Mock useAuthorization hook (so it doesn't redirect)
jest.mock(
  "../../../../components/UserComponents/useAuthorization",
  () => () => true
);

const mockChildData = {
  id: "123",
  firstName: "John",
  lastName: "Doe",
};

describe("ChildDetailsContainer", () => {
  const renderComponent = () =>
    render(
      <CommonDataContext.Provider
        value={{
          getFsChildListData: jest.fn(),
          signedinUserRoleFS: "admin",
        }}
      >
        <MemoryRouter initialEntries={["/fostershare/children/123"]}>
          <Routes>
            <Route
              path="/fostershare/children/:id"
              element={<ChildDetailsContainer />}
            />
          </Routes>
        </MemoryRouter>
      </CommonDataContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loader while fetching and renders child details", async () => {
    APIS.getFsChild.mockResolvedValueOnce({
      status: 200,
      data: { data: mockChildData },
    });
    APIS.getChildHistoryList.mockResolvedValueOnce({
      status: 200,
      data: { data: [], totalCount: 0 },
    });

    renderComponent();

    // Loader appears while fetching
    expect(screen.getByTestId("loader")).toBeInTheDocument();

    // Wait until child details are displayed
    await waitFor(() =>
      expect(screen.getByTestId("child-details")).toBeInTheDocument()
    );

    // Breadcrumb should show child full name
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("renders ChildHistoryList in Details tab", async () => {
    APIS.getFsChild.mockResolvedValueOnce({
      status: 200,
      data: { data: mockChildData },
    });
    APIS.getChildHistoryList.mockResolvedValueOnce({
      status: 200,
      data: { data: [], totalCount: 0 },
    });

    renderComponent();

    await waitFor(() =>
      expect(screen.getByTestId("child-details")).toBeInTheDocument()
    );

    expect(screen.getByTestId("child-history")).toBeInTheDocument();
  });

  test("switches to Logs tab and renders ChildCombinedLogsList", async () => {
    APIS.getFsChild.mockResolvedValueOnce({
      status: 200,
      data: { data: mockChildData },
    });
    APIS.getChildHistoryList.mockResolvedValueOnce({
      status: 200,
      data: { data: [], totalCount: 0 },
    });

    renderComponent();

    await waitFor(() =>
      expect(screen.getByTestId("child-details")).toBeInTheDocument()
    );

    // Click Logs tab
    fireEvent.click(screen.getByRole("tab", { name: "Logs" }));

    expect(screen.getByTestId("child-logs")).toBeInTheDocument();
  });

  test("falls back when childData is undefined", async () => {
    APIS.getFsChild.mockResolvedValueOnce({
      status: 200,
      data: { data: null },
    });
    APIS.getChildHistoryList.mockResolvedValueOnce({
      status: 200,
      data: { data: [], totalCount: 0 },
    });

    renderComponent();

    await waitFor(() =>
      expect(screen.getByText("Child details")).toBeInTheDocument()
    );
  });

  test("calls onSuccessHandler and refreshes data", async () => {
    const mockGetFsChildListData = jest.fn();
    APIS.getFsChild.mockResolvedValue({
      status: 200,
      data: { data: mockChildData },
    });
    APIS.getChildHistoryList.mockResolvedValue({
      status: 200,
      data: { data: [], totalCount: 0 },
    });

    render(
      <CommonDataContext.Provider
        value={{
          getFsChildListData: mockGetFsChildListData,
          signedinUserRoleFS: "admin",
        }}
      >
        <MemoryRouter initialEntries={["/fostershare/children/123"]}>
          <Routes>
            <Route
              path="/fostershare/children/:id"
              element={<ChildDetailsContainer />}
            />
          </Routes>
        </MemoryRouter>
      </CommonDataContext.Provider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("child-details")).toBeInTheDocument()
    );

    // Simulate user clicking the success button to call onSuccess handler
    fireEvent.click(screen.getByTestId("on-success-btn"));

    // Now your stubs should have been called again
    await waitFor(() => {
      expect(mockGetFsChildListData).toHaveBeenCalled();
      expect(APIS.getFsChild).toHaveBeenCalledTimes(2); // Initial call + refresh
    });
  });

  test("error in getChildHistoryData does not crash", async () => {
    APIS.getFsChild.mockResolvedValueOnce({
      status: 200,
      data: { data: mockChildData },
    });
    APIS.getChildHistoryList.mockRejectedValueOnce(new Error("API failed"));

    renderComponent();
    await waitFor(() =>
      expect(screen.getByTestId("child-details")).toBeInTheDocument()
    );
    // No crash, component still renders
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("navigates when clicking breadcrumb links", async () => {
    APIS.getFsChild.mockResolvedValue({ status: 200, data: { data: mockChildData } });
    APIS.getChildHistoryList.mockResolvedValue({ status: 200, data: { data: [], totalCount: 0 } });

    renderComponent();
    await waitFor(() => expect(screen.getByTestId("child-details")).toBeInTheDocument());

    // Click on "FosterShare" breadcrumb
    fireEvent.click(screen.getByText("FosterShare"));
    expect(mockNavigate).toHaveBeenCalledWith("/fostershare/dashboard");

    // Click on "Children" breadcrumb
    fireEvent.click(screen.getByText("Children"));
    expect(mockNavigate).toHaveBeenCalledWith("/fostershare/children");
  });

  test("loader hides after fetch completes", async () => {
    APIS.getFsChild.mockResolvedValueOnce({
      status: 200,
      data: { data: mockChildData },
    });
    APIS.getChildHistoryList.mockResolvedValueOnce({
      status: 200,
      data: { data: [], totalCount: 0 },
    });

    renderComponent();

    // Loader visible first
    expect(screen.getByTestId("loader")).toBeInTheDocument();

    // Wait for loader to disappear
    await waitFor(() =>
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument()
    );
  });
});
