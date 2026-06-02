import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ResourceDetails from './ResourceDetails';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import APIS from '../../../../common/hooks/UseApiCalls';
import { ModalService } from '../../../../components/Modal';
import toast from 'react-hot-toast';


// Mock dependencies
jest.mock('../../../../common/hooks/UseApiCalls', () => ({
  GetResourceDetail: jest.fn(),
  UpdateResource: jest.fn(),
}));


jest.mock('../../../../components/UserComponents/useAuthorization', () => jest.fn());


jest.mock('../../../../components/Modal', () => ({
  ModalService: {
    open: jest.fn(),
  },
}));


jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));


jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn(),
}));


jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Grid: ({ children, container, item, xs, sm, md, lg, spacing, my, ...props }) => (
      <div {...props} data-testid="grid-mock">{children}</div>
    ),
    Box: ({ children, my, sx, ...props }) => (
      <div {...props} data-testid="box-mock">{children}</div>
    ),
    Autocomplete: ({ options, value, onChange, renderInput, getOptionLabel, isOptionEqualToValue, disableClearable, ...props }) => {
      const handleChange = (e) => {
        const newValue = options.find(opt => opt.value === e.target.value);
        if (onChange) onChange(null, newValue);
      };
      return (
        <div data-testid="autocomplete">
          <div data-testid="autocomplete-mock-props" style={{ display: 'none' }}>
            {JSON.stringify({
              hasLabelFn: !!getOptionLabel,
              hasEqualFn: !!isOptionEqualToValue
            })}
          </div>
          <select
            data-testid="autocomplete-select"
            value={value?.value || ''}
            onChange={handleChange}
          >
            {options.map((option) => (
              <option key={option.id || option.value} value={option.value}>{option.value}</option>
            ))}
          </select>
          {renderInput && renderInput({
            InputProps: {
              ...props.InputProps,
              endAdornment: (
                <div data-testid="autocomplete-end-adornment"></div>
              )
            }
          })}
        </div>
      );
    },
  };
});


jest.mock('@mui/icons-material/Edit', () => ({ sx, onClick }) => (
  <span data-testid="edit-icon" onClick={onClick} style={sx}>Edit</span>
));


jest.mock('@mui/icons-material/Check', () => () => <span data-testid="check-icon">Check</span>);


jest.mock('../../../../components/LabelValue', () => ({ label, value }) => (
  <div data-testid="label-value">
    <span data-testid={`label-${label}`}>{label}: </span>
    <span data-testid={`value-${label}`}>{value}</span>
  </div>
));


jest.mock('../../../../components/ChipComponent/ChipComponent', () => ({ label }) => (
  <span data-testid="chip">{label}</span>
));


jest.mock('../../../../components/UserComponents/Loader', () => ({ loading }) =>
  loading ? <div data-testid="loader">Loading...</div> : null
);


jest.mock('../../Components/ResourceDetailForm', () => (props) => (
  <div data-testid="resource-detail-form">
    <button data-testid="close-form" onClick={props.close}>Close</button>
    <button data-testid="submit-form" onClick={props.onSuccess}>Submit</button>
  </div>
));


jest.mock('../../../../helpers/helperFunction', () => ({
  utcToLocalDate: jest.fn((date) => date ? 'Formatted Date' : ''),
}));


describe('ResourceDetails Component', () => {
  const mockGetResourceDetail = APIS.GetResourceDetail;
  const mockUpdateResource = APIS.UpdateResource;
  const mockUseParams = require('react-router').useParams;
  const mockModalServiceOpen = ModalService.open;
  const mockToastError = toast.error;


  const mockResourceDetail = {
    id: '123',
    title: 'Test Resource Title',
    articleLink: 'https://example.com/article',
    published: true,
    summary: 'This is a test summary for the resource.',
    imageLink: 'https://example.com/image.jpg',
    organization_name: 'Test Org',
    createdBy: 'John Doe',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
    categories: [
      { id: '1', name: 'Category 1' },
      { id: '2', name: 'Category 2' },
    ],
    TWAccountId: 'org-1',
    url: 'https://example.com/resource',
    image: 'https://example.com/image.jpg',
  };


  const mockOrganizationList = [
    { id: 'org-1', accountName: 'Organization 1' },
  ];


  const defaultContext = {
    signedinUserRoleFS: 'admin',
    organizationList: mockOrganizationList,
  };


  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '123' });
    APIS.GetResourceDetail.mockResolvedValue({
      data: { data: mockResourceDetail },
    });
    APIS.UpdateResource.mockResolvedValue({});
    window.open = jest.fn();
    Storage.prototype.getItem = jest.fn(() => 'testuser@example.com');
  });


  const renderComponent = (contextValue = defaultContext) => {
    return render(
      <BrowserRouter>
        <CommonDataContext.Provider value={contextValue}>
          <ResourceDetails />
        </CommonDataContext.Provider>
      </BrowserRouter>
    );
  };


  describe('Initial Load and Data Fetching', () => {
    it('should call GetResourceDetail API with correct ID on mount', async () => {
      renderComponent();
      await waitFor(() => {
        expect(mockGetResourceDetail).toHaveBeenCalledWith('123');
      });
    });


    it('should show loader while fetching data', async () => {
      const promise = Promise.resolve({ data: { data: mockResourceDetail } });
      mockGetResourceDetail.mockReturnValue(promise);
      renderComponent();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      await act(async () => { await promise; });
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });


    it('should handle API errors gracefully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockGetResourceDetail.mockRejectedValue(new Error('API Error'));
      renderComponent();
      await waitFor(() => {
        expect(mockGetResourceDetail).toHaveBeenCalled();
      });
      consoleLogSpy.mockRestore();
    });
  });


  describe('Component Rendering', () => {
    it('should render resource details correctly after data fetch', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Article details')).toBeInTheDocument();
      });
    });


    it('should render categories as chips with keys', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      });
      const chips = screen.getAllByTestId('chip');
      expect(chips).toHaveLength(2);
    });


    it('should display correct organization name when TWAccountId exists', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId('value-Agency')).toHaveTextContent('Organization 1');
      });
    });


    it('should display "All" when TWAccountId does not exist', async () => {
      mockGetResourceDetail.mockResolvedValue({
        data: { data: { ...mockResourceDetail, TWAccountId: null } },
      });
      renderComponent();
      await waitFor(() => {
        expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId('value-Agency')).toHaveTextContent('All');
      });
    });


    it('should render edit icon with click handler', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      });
    });
  });


  describe('Status Autocomplete', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });


    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });


    it('should initialize with correct status based on resource published flag', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId('autocomplete-select').value).toBe('Published');
      });
    });


    it('should update status when changed and call UpdateResource', async () => {
      renderComponent();
      await waitFor(() => screen.getByTestId('autocomplete-select'));
      fireEvent.change(screen.getByTestId('autocomplete-select'), { target: { value: 'Draft' } });
      await waitFor(() => {
        expect(mockUpdateResource).toHaveBeenCalled();
      });
    });


    it('should show error toast when status update fails', async () => {
      APIS.UpdateResource.mockRejectedValueOnce(new Error('Update Failed'));
      renderComponent();
      await waitFor(() => screen.getByTestId('autocomplete-select'));
      const select = screen.getByTestId('autocomplete-select');
      await act(async () => {
        fireEvent.change(select, { target: { value: 'Draft' } });
      });
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
      });
    });
  });


  describe('Interactions', () => {
    it('should open modal when edit icon is clicked', async () => {
      renderComponent();
      await waitFor(() => screen.getByTestId('edit-icon'));
      fireEvent.click(screen.getByTestId('edit-icon'));
      expect(mockModalServiceOpen).toHaveBeenCalled();
    });


    it('should open preview URL in new window when preview button is clicked', async () => {
      renderComponent();
      await waitFor(() => screen.getByText('Preview'));
      fireEvent.click(screen.getByText('Preview'));
      expect(window.open).toHaveBeenCalled();
    });


    it('should refetch data after modal form submission', async () => {
      let modalCallback;
      mockModalServiceOpen.mockImplementation((callback) => {
        modalCallback = callback;
        return {};
      });
      renderComponent();
      await waitFor(() => screen.getByTestId('edit-icon'));
      fireEvent.click(screen.getByTestId('edit-icon'));
      const modalElement = modalCallback({ close: jest.fn() });
      act(() => { modalElement.props.onSuccess(); });
      expect(mockGetResourceDetail).toHaveBeenCalledTimes(2);
    });
  });


  describe('Edge Cases', () => {
    it('should handle missing ID in URL params', async () => {
      mockUseParams.mockReturnValue({ id: undefined });
      renderComponent();
      expect(mockGetResourceDetail).not.toHaveBeenCalled();
    });


    it('should handle empty categories array', async () => {
      mockGetResourceDetail.mockResolvedValue({
        data: { data: { ...mockResourceDetail, categories: [] } },
      });
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId('label-Categories')).toBeInTheDocument();
      });
    });


    it('should handle API returning undefined data', async () => {
      mockGetResourceDetail.mockResolvedValue({ data: { data: undefined } });
      renderComponent();
      await waitFor(() => { expect(mockGetResourceDetail).toHaveBeenCalled(); });
      await waitFor(() => {
        expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });


    it('should handle Autocomplete getOptionLabel function', async () => {
      renderComponent();
      await waitFor(() => {
        const props = JSON.parse(screen.getByTestId('autocomplete-mock-props').textContent);
        expect(props.hasLabelFn).toBe(true);
      });
    });


    it('should handle Autocomplete isOptionEqualToValue function', async () => {
      renderComponent();
      await waitFor(() => {
        const props = JSON.parse(screen.getByTestId('autocomplete-mock-props').textContent);
        expect(props.hasEqualFn).toBe(true);
      });
    });
  });


  describe('Form Submission Payload', () => {
    it('should include category IDs in update payload', async () => {
      renderComponent();
      await waitFor(() => screen.getByTestId('autocomplete-select'));
      fireEvent.change(screen.getByTestId('autocomplete-select'), { target: { value: 'Draft' } });
      await waitFor(() => {
        expect(mockUpdateResource).toHaveBeenCalledWith(expect.objectContaining({ categoryIds: ['1', '2'] }));
      });
    });


    it('should include userId from localStorage', async () => {
      Storage.prototype.getItem = jest.fn(() => 'user123');
      renderComponent();
      await waitFor(() => screen.getByTestId('autocomplete-select'));
      fireEvent.change(screen.getByTestId('autocomplete-select'), { target: { value: 'Draft' } });
      await waitFor(() => {
        expect(mockUpdateResource).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user123' }));
      });
    });
  });


  describe('Targeted Coverage Fixes', () => {
    it('should fully cover Autocomplete helper functions', async () => {
      let capturedProps;
      const { Autocomplete } = require('@mui/material');
      jest.spyOn(require('@mui/material'), 'Autocomplete').mockImplementation((props) => {
        capturedProps = props;
        return <div data-testid="captured-autocomplete" />;
      });
      renderComponent();
      await waitFor(() => expect(capturedProps).toBeDefined());
      expect(capturedProps.getOptionLabel({ value: 'Published' })).toBe('Published');
      const opt = { val: 1 };
      expect(capturedProps.isOptionEqualToValue(opt, opt)).toBe(true);
      jest.restoreAllMocks();
    });


    it('should execute getDetailOfResource via onSuccess callback', async () => {
      let modalContent;
      ModalService.open.mockImplementation((callback) => {
        modalContent = callback({ close: jest.fn() });
        return {};
      });
      renderComponent();
      await waitFor(() => fireEvent.click(screen.getByTestId('edit-icon')));
      act(() => { modalContent.props.onSuccess(); });
      expect(mockGetResourceDetail).toHaveBeenCalledTimes(2);
    });
  });
});

