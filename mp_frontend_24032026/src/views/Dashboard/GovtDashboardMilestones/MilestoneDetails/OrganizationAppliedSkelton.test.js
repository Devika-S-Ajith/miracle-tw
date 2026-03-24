// ====== PROJECT-WIDE MOCKS (Absolute Top to avoid ESM/Axios initialization errors) ======


jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  defaults: {
    baseURL: '',
    headers: {
      common: {},
      post: {},
      put: {},
      patch: {},
      delete: {},
    },
  },
}));


jest.mock('lodash', () => ({
  get: jest.fn(),
  set: jest.fn(),
  isEmpty: jest.fn(),
}));


jest.mock('aws-amplify', () => ({
  Auth: {
    currentSession: jest.fn(),
    currentAuthenticatedUser: jest.fn(),
  },
}));


jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));


// Mock the config used by UseApiCalls
jest.mock('../../../../common/config', () => ({
  AppConfig: {
    baseURL: 'http://test-api.com',
  },
}), { virtual: true });


// ====== IMPORTS ======


import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import OrganizationAppliedSkeleton from "./OrganizationAppliedSkelton";


// Mocking MUI components for easier DOM targeting
jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    Skeleton: (props) => <div data-testid="mui-skeleton" {...props} />,
    Divider: (props) => <hr data-testid="mui-divider" {...props} />,
  };
});


describe("OrganizationAppliedSkeleton Component", () => {
  it("renders correctly without crashing", () => {
    const { container } = render(<OrganizationAppliedSkeleton />);
    expect(container).toBeInTheDocument();
  });


  it("renders the default number of rows (5)", () => {
    render(<OrganizationAppliedSkeleton />);
   
    const skeletons = screen.getAllByTestId("mui-skeleton");
    const dividers = screen.getAllByTestId("mui-divider");
   
    expect(skeletons).toHaveLength(5);
    expect(dividers).toHaveLength(5);
  });


  it("renders a custom number of rows when the prop is provided", () => {
    const customRows = 3;
    render(<OrganizationAppliedSkeleton rows={customRows} />);
   
    const skeletons = screen.getAllByTestId("mui-skeleton");
    expect(skeletons).toHaveLength(customRows);
  });


  it("applies the correct variant and width to the skeletons", () => {
    render(<OrganizationAppliedSkeleton rows={1} />);
   
    const skeleton = screen.getByTestId("mui-skeleton");
    // These match the props passed in OrganizationAppliedSkelton.js
    expect(skeleton).toHaveAttribute("variant", "text");
    expect(skeleton).toHaveAttribute("width", "60%");
  });


  it("has a container Box with expected display properties", () => {
    const { container } = render(<OrganizationAppliedSkeleton />);
    // The component returns a Box as the first element
    const containerBox = container.firstChild;
   
    // Check for styles defined in the sx prop
    expect(containerBox).toHaveStyle("display: flex");
    expect(containerBox).toHaveStyle("flex-direction: column");
  });
});

