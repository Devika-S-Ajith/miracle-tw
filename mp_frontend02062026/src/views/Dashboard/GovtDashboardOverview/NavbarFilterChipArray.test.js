import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';


// =========================================================
// CRITICAL: MOCK AXIOS AND DEPENDENCIES BEFORE ANY IMPORTS
// This prevents the "import statement outside a module" error.
// We also mock the full headers structure to satisfy UseApiCalls.js initialization.
// =========================================================


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


// Mock lodash
jest.mock('lodash', () => ({
  get: jest.fn((obj, path, def) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || def;
  }),
  set: jest.fn(),
  isEmpty: jest.fn((val) => val == null || (Array.isArray(val) ? val.length === 0 : Object.keys(val).length === 0)),
}));


// Mock aws-amplify
jest.mock('aws-amplify', () => ({
  Auth: {
    currentSession: jest.fn(),
    currentAuthenticatedUser: jest.fn(),
  },
}));


// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));


// Mock the config file that UseApiCalls.js depends on
jest.mock('../../../common/config', () => ({
  AppConfig: {
    baseURL: 'http://test-api.com',
  },
}), { virtual: true });


// Mock Translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));


// =========================================================
// NOW IMPORTS (after mocks are defined)
// =========================================================


import NavbarFilterChipArray from './NavbarFilterChipArray';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';


describe('NavbarFilterChipArray Component', () => {
  const mockSetNavbarFilterValues = jest.fn();
 
  const mockContextValue = {
    navbarFilterValues: [
      { label: 'Country', value: 'India', key: 'COUNTRY', id: '1' },
      { label: 'State', value: 'Kerala', key: 'STATE', id: '101' },
    ],
    setNavbarFilterValues: mockSetNavbarFilterValues,
  };


  const renderComponent = (contextValue = mockContextValue) => {
    return render(
      <CommonDataContext.Provider value={contextValue}>
        <NavbarFilterChipArray />
      </CommonDataContext.Provider>
    );
  };


  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('renders chips based on context filter values array', () => {
    renderComponent();
   
    // Verifying that chips are rendered with the label: value format
    expect(screen.getByText(/Country : India/i)).toBeInTheDocument();
    expect(screen.getByText(/State : Kerala/i)).toBeInTheDocument();
  });


  it('calls setNavbarFilterValues when a chip is deleted', () => {
    renderComponent();
   
    // FIXED: Your environment renders "CloseIcon" instead of "CancelIcon"
    const deleteButtons = screen.getAllByTestId('CloseIcon');
   
    fireEvent.click(deleteButtons[0]);
   
    // Check if the update function was called
    expect(mockSetNavbarFilterValues).toHaveBeenCalled();
   
    // Manually execute the update function to verify the filtering logic for coverage
    const updateFn = mockSetNavbarFilterValues.mock.calls[0][0];
    const result = updateFn(mockContextValue.navbarFilterValues);
   
    // Should have filtered out the first chip (Country)
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('Kerala');
  });


  it('removes associated REGION chips when a STATE chip is deleted', () => {
    const complexFilters = [
      { label: 'State', value: 'Kerala', key: 'STATE', id: '101' },
      { label: 'Region', value: 'South', key: 'REGION', id: '501', stateId: '101' },
      { label: 'Region', value: 'North', key: 'REGION', id: '502', stateId: '202' },
    ];
   
    renderComponent({
      navbarFilterValues: complexFilters,
      setNavbarFilterValues: mockSetNavbarFilterValues,
    });


    // FIXED: Using "CloseIcon"
    const deleteButtons = screen.getAllByTestId('CloseIcon');
   
    // Delete the State Chip (index 0)
    fireEvent.click(deleteButtons[0]);


    // Manually execute update function to cover the branch logic
    const updateFn = mockSetNavbarFilterValues.mock.calls[0][0];
    const result = updateFn(complexFilters);


    // Should remove both the State chip AND the Region chip belonging to that state
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('North');
  });


  it('calls setNavbarFilterValues with an empty array when Clear Filters is clicked', () => {
    renderComponent();


    const clearFiltersBtn = screen.getByText(/Clear Filters/i);
    fireEvent.click(clearFiltersBtn);


    // This covers the onClick={() => setNavbarFilterValues([])} line
    expect(mockSetNavbarFilterValues).toHaveBeenCalledWith([]);
  });


  it('renders an empty Box container when the filter array is empty', () => {
    const emptyContext = {
      navbarFilterValues: [],
      setNavbarFilterValues: mockSetNavbarFilterValues,
    };
   
    const { container } = renderComponent(emptyContext);
   
    // Component returns an empty Box (div) when navbarFilterValues is []
    // So container.firstChild will exist, but it should have no children (no chips, no clear button)
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});

