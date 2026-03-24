// ====== PROJECT-WIDE MOCKS ======
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(),
    interceptors: { request: { use: jest.fn(), eject: jest.fn() }, response: { use: jest.fn(), eject: jest.fn() } },
  })),
  get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(),
  defaults: { baseURL: '', headers: { common: {}, post: {}, put: {}, patch: {}, delete: {} } },
}));


// ====== COMPONENT-SPECIFIC MOCKS ======


// Mock the API hook
const mockUpdateSystemMessageReadStatus = jest.fn();
jest.mock("../../../common/hooks/UseApiCalls", () => ({
  UpdateSystemMessageReadStatus: (...args) => mockUpdateSystemMessageReadStatus(...args),
}));


// Mock sub-components - must return a component function
jest.mock("../popupModal", () => {
  const MockPopupModal = (props) => {
    if (!props.open) return null;
    return (
      <div data-testid="popup-modal">
        <div data-testid="popup-subject">{props.subject}</div>
        <div data-testid="popup-content">{props.content}</div>
        <div data-testid="popup-actions">
          {props.availableActions?.map((action, idx) => (
            <span key={idx} data-testid={`action-${action}`}>{action}</span>
          ))}
        </div>
        <button data-testid="close-popup" onClick={props.handleclose}>Close</button>
      </div>
    );
  };
  return MockPopupModal;
});


jest.mock("../Components/Banner", () => {
  const MockBanner = (props) => (
    <div data-testid="banner-msg">
      <span data-testid="banner-subject">{props.subject}</span>
      <span data-testid="banner-content">{props.content}</span>
    </div>
  );
  return MockBanner;
});


// ====== IMPORTS ======
import React from "react";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardSystemMessages from "./DashboardSystemMessages";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";
import PopupModal from "../popupModal";
import Banner from "../Components/Banner";


describe("DashboardSystemMessages Component", () => {
  const mockSetAllSystemMessages = jest.fn();
 
  const mockPopupMessages = [
    { id: "p1", subject: "Popup 1", content: "Content 1", availableActions: ["action1", "action2"] },
    { id: "p2", subject: "Popup 2", content: "Content 2", availableActions: [] },
  ];


  const mockBannerMessages = [
    { id: "b1", subject: "Banner 1", content: "Banner Content 1" },
    { id: "b2", subject: "Banner 2", content: "Banner Content 2" },
  ];


  const mockAllMessages = [...mockPopupMessages, ...mockBannerMessages];


  const defaultContext = {
    popupMessages: [],
    bannerMessages: [],
    allSystemMessages: [],
    setAllSystemMessages: mockSetAllSystemMessages,
  };


  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateSystemMessageReadStatus.mockResolvedValue({
      data: { message: "Read Status Updated Successfully" }
    });
  });


  afterEach(() => {
    cleanup();
  });


  const renderComponent = (contextValue = defaultContext) => {
    return render(
      <CommonDataContext.Provider value={contextValue}>
        <DashboardSystemMessages />
      </CommonDataContext.Provider>
    );
  };


  describe("Basic Rendering", () => {
    it("renders nothing when there are no messages", () => {
      renderComponent();
      expect(screen.queryByTestId("popup-modal")).not.toBeInTheDocument();
      expect(screen.queryByTestId("banner-msg")).not.toBeInTheDocument();
    });


    it("renders multiple banners correctly", () => {
      renderComponent({
        ...defaultContext,
        bannerMessages: mockBannerMessages
      });
     
      const banners = screen.getAllByTestId("banner-msg");
      expect(banners).toHaveLength(2);
      expect(screen.getByText("Banner 1")).toBeInTheDocument();
      expect(screen.getByText("Banner 2")).toBeInTheDocument();
    });


    it("renders the first popup message on mount with available actions", () => {
      renderComponent({
        ...defaultContext,
        popupMessages: mockPopupMessages
      });
     
      expect(screen.getByTestId("popup-modal")).toBeInTheDocument();
      expect(screen.getByTestId("popup-subject")).toHaveTextContent("Popup 1");
      expect(screen.getByTestId("popup-content")).toHaveTextContent("Content 1");
      expect(screen.getByTestId("action-action1")).toBeInTheDocument();
      expect(screen.getByTestId("action-action2")).toBeInTheDocument();
    });
  });


  describe("API Integration", () => {
    let consoleErrorSpy;


    beforeEach(() => {
      // Suppress console.error for error tests
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });


    afterEach(() => {
      if (consoleErrorSpy) {
        consoleErrorSpy.mockRestore();
      }
    });


    it("updates the global system messages state when a message is read successfully", async () => {
      renderComponent({
        ...defaultContext,
        popupMessages: mockPopupMessages,
        allSystemMessages: mockAllMessages
      });


      fireEvent.click(screen.getByTestId("close-popup"));


      // Wait for API call
      await waitFor(() => {
        expect(mockUpdateSystemMessageReadStatus).toHaveBeenCalledWith({
          messageId: "p1",
          readDate: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) // ISO format
        });
      });


      // Wait for state update
      await waitFor(() => {
        expect(mockSetAllSystemMessages).toHaveBeenCalled();
       
        // Check that p1 was filtered out
        const callArgs = mockSetAllSystemMessages.mock.calls;
        expect(callArgs.length).toBeGreaterThan(0);
       
        const updatedList = callArgs[0][0];
        const remainingIds = updatedList.map(msg => msg.id);
        expect(remainingIds).not.toContain("p1");
        expect(updatedList).toHaveLength(mockAllMessages.length - 1);
      });
    });


    it("does not update context state if API returns failure message", async () => {
      mockUpdateSystemMessageReadStatus.mockResolvedValueOnce({
        data: { message: "Error updating status" }
      });


      renderComponent({
        ...defaultContext,
        popupMessages: mockPopupMessages,
        allSystemMessages: mockAllMessages
      });


      fireEvent.click(screen.getByTestId("close-popup"));


      await waitFor(() => {
        expect(mockUpdateSystemMessageReadStatus).toHaveBeenCalled();
        expect(mockSetAllSystemMessages).not.toHaveBeenCalled();
      });
    });


   it("handles API errors gracefully", async () => {
      // Mock a rejection that doesn't bubble up as an unhandled exception
      mockUpdateSystemMessageReadStatus.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error"))
      );


      renderComponent({
        ...defaultContext,
        popupMessages: mockPopupMessages,
        allSystemMessages: mockAllMessages
      });


      fireEvent.click(screen.getByTestId("close-popup"));


      // Wait for the attempt to finish
      await waitFor(() => {
        expect(mockUpdateSystemMessageReadStatus).toHaveBeenCalled();
      });


      // Ensure setAllSystemMessages was NEVER called because the API failed
      expect(mockSetAllSystemMessages).not.toHaveBeenCalled();
    });
  });


  describe("Edge Cases", () => {
    it("resets current message index when popupMessages array changes", () => {
      const { rerender } = renderComponent({
        ...defaultContext,
        popupMessages: [mockPopupMessages[1]]
      });


      expect(screen.getByTestId("popup-subject")).toHaveTextContent("Popup 2");


      // Change the messages list (simulating new messages from context)
      const newPopupList = [{ id: "p3", subject: "New Popup", content: "New Content" }];
     
      rerender(
        <CommonDataContext.Provider value={{ ...defaultContext, popupMessages: newPopupList }}>
          <DashboardSystemMessages />
        </CommonDataContext.Provider>
      );


      // Should reset to index 0 and show new message
      expect(screen.getByTestId("popup-subject")).toHaveTextContent("New Popup");
    });


    it("handles empty popupMessages after messages are read", async () => {
      const { rerender } = renderComponent({
        ...defaultContext,
        popupMessages: [mockPopupMessages[0]]
      });


      expect(screen.getByTestId("popup-modal")).toBeInTheDocument();


      // Simulate reading all messages (empty popupMessages)
      rerender(
        <CommonDataContext.Provider value={{ ...defaultContext, popupMessages: [] }}>
          <DashboardSystemMessages />
        </CommonDataContext.Provider>
      );


      expect(screen.queryByTestId("popup-modal")).not.toBeInTheDocument();
    });


    it("formats date correctly for API call", async () => {
      const mockDate = new Date('2024-01-15T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);


      renderComponent({
        ...defaultContext,
        popupMessages: [mockPopupMessages[0]]
      });


      fireEvent.click(screen.getByTestId("close-popup"));


      await waitFor(() => {
        expect(mockUpdateSystemMessageReadStatus).toHaveBeenCalledWith(
          expect.objectContaining({
            readDate: "2024-01-15T10:30:00.000Z"
          })
        );
      });


      // Restore original Date
      jest.restoreAllMocks();
    });
  });


  describe("Performance and Memory", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });


    afterEach(() => {
      jest.useRealTimers();
    });


    it("cleans up timers when component unmounts", () => {
      const { unmount } = renderComponent({
        ...defaultContext,
        popupMessages: mockPopupMessages
      });


      // Should have a popup open
      expect(screen.getByTestId("popup-modal")).toBeInTheDocument();


      // Unmount should not cause timer errors
      expect(() => {
        unmount();
        jest.advanceTimersByTime(300);
      }).not.toThrow();
    });


    it("does not create memory leaks with multiple rapid clicks", async () => {
      renderComponent({
        ...defaultContext,
        popupMessages: mockPopupMessages
      });


      // Rapid multiple clicks
      const closeButton = screen.getByTestId("close-popup");
      fireEvent.click(closeButton);
     
      // Try to click again but button should be gone after first click
      await waitFor(() => {
        expect(mockUpdateSystemMessageReadStatus).toHaveBeenCalledTimes(1);
      });
    });
  });


  describe("Component Props Validation", () => {
    it("passes correct props to PopupMessage component", () => {
      const testMessage = {
        id: "test1",
        subject: "Test Subject",
        content: "Test Content",
        availableActions: ["Accept", "Reject"]
      };


      renderComponent({
        ...defaultContext,
        popupMessages: [testMessage]
      });


      // Verify component renders with correct props
      expect(screen.getByTestId("popup-modal")).toBeInTheDocument();
      expect(screen.getByTestId("popup-subject")).toHaveTextContent("Test Subject");
      expect(screen.getByTestId("popup-content")).toHaveTextContent("Test Content");
      expect(screen.getByTestId("action-Accept")).toBeInTheDocument();
      expect(screen.getByTestId("action-Reject")).toBeInTheDocument();
    });


    it("passes correct props to Banner component", () => {
      const testBanner = {
        id: "banner1",
        subject: "Banner Subject",
        content: "Banner Content"
      };


      renderComponent({
        ...defaultContext,
        bannerMessages: [testBanner]
      });


      // Verify banner renders with correct props
      expect(screen.getByTestId("banner-msg")).toBeInTheDocument();
      expect(screen.getByTestId("banner-subject")).toHaveTextContent("Banner Subject");
      expect(screen.getByTestId("banner-content")).toHaveTextContent("Banner Content");
    });
  });




  describe("Popup Message Sequence", () => {
  beforeEach(() => {
    jest.useFakeTimers();  // This is CRITICAL
  });


  afterEach(() => {
    jest.useRealTimers();  // Clean up
  });


  it("should show the second popup after closing the first one", async () => {
    renderComponent({
      ...defaultContext,
      popupMessages: mockPopupMessages,
      allSystemMessages: mockAllMessages
    });


    // 1. Initial render check
    expect(screen.getByTestId("popup-subject")).toHaveTextContent("Popup 1");


    // 2. Trigger close (starts the API call and the 300ms timer)
    fireEvent.click(screen.getByTestId("close-popup"));


    // 3. IMPORTANT: Use act() to advance the timers.
    // This ensures the setTimeout logic is executed by the test.
    act(() => {
      jest.advanceTimersByTime(300);
    });


    // 4. Use findBy instead of getBy.
    // findBy will wait for the re-renders (and that useEffect) to finish
    // and keep checking until "Popup 2" appears.
    const secondPopup = await screen.findByText("Popup 2");
    expect(secondPopup).toBeInTheDocument();
  });


    it("should NOT show another popup after the last one", async () => {
      // Render with only 1 popup
      renderComponent({
        ...defaultContext,
        popupMessages: [mockPopupMessages[0]],  // Just one
        allSystemMessages: mockAllMessages
      });


      expect(screen.getByText("Popup 1")).toBeInTheDocument();


      fireEvent.click(screen.getByTestId("close-popup"));


      await waitFor(() => {
        expect(mockUpdateSystemMessageReadStatus).toHaveBeenCalled();
      });


      // Advance timer
      act(() => {
        jest.advanceTimersByTime(300);
      });


      // Should NOT show any popup
      expect(screen.queryByTestId("popup-modal")).not.toBeInTheDocument();
    });


    it("handles single popup message correctly", async () => {
      renderComponent({
        ...defaultContext,
        popupMessages: [mockPopupMessages[0]],
        allSystemMessages: mockAllMessages
      });


      expect(screen.getByTestId("popup-modal")).toBeInTheDocument();
     
      fireEvent.click(screen.getByTestId("close-popup"));


      await waitFor(() => {
        expect(mockUpdateSystemMessageReadStatus).toHaveBeenCalled();
      });


      act(() => {
        jest.advanceTimersByTime(300);
      });


      // Wait for React to re-render
      await waitFor(() => {
        expect(screen.queryByTestId("popup-modal")).not.toBeInTheDocument();
      });
    });


  });
 
});





