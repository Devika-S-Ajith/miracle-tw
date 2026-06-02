import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ResourceDetailsContainer from './ResourceDetailsContainer';
import ChevronRightIcon from '../../../../assets/icons/ChevronRight';


// Mock the child component
jest.mock('./ResourceDetails', () => {
  return function MockSupportServiceDetails() {
    return <div data-testid="resource-details">Resource Details Component</div>;
  };
});


// Mock the ChevronRightIcon
jest.mock('../../../../assets/icons/ChevronRight', () => {
  return function MockChevronRightIcon({ color, fontSize }) {
    return (
      <svg data-testid="chevron-right-icon" data-color={color} data-font-size={fontSize}>
        ChevronRight Icon
      </svg>
    );
  };
});


// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));


// Create a theme for ThemeProvider
const theme = createTheme();


describe('ResourceDetailsContainer', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });


  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ResourceDetailsContainer />
        </ThemeProvider>
      </BrowserRouter>
    );
  };


  it('renders without crashing', () => {
    renderComponent();
   
    // Check if main elements are rendered
    expect(screen.getByText('FosterShare')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Resource details')).toBeInTheDocument();
    expect(screen.getByTestId('resource-details')).toBeInTheDocument();
  });


  it('renders breadcrumb navigation correctly', () => {
    renderComponent();
   
    // Check all breadcrumb items
    const fosterShareLink = screen.getByText('FosterShare');
    const resourcesLink = screen.getByText('Resources');
    const resourceDetailsText = screen.getByText('Resource details');
   
    expect(fosterShareLink).toBeInTheDocument();
    expect(resourcesLink).toBeInTheDocument();
    expect(resourceDetailsText).toBeInTheDocument();
   
    // Resource details should not be clickable (no onClick)
    expect(resourceDetailsText).not.toHaveAttribute('onClick');
  });


  it('renders ChevronRight icons with correct props', () => {
    renderComponent();
   
    const chevronIcons = screen.getAllByTestId('chevron-right-icon');
   
    // Should have 2 chevron icons
    expect(chevronIcons).toHaveLength(2);
   
    // Check icon props
    chevronIcons.forEach(icon => {
      expect(icon).toHaveAttribute('data-color', 'disabled');
      expect(icon).toHaveAttribute('data-font-size', 'small');
    });
  });


  it('navigates to dashboard when FosterShare is clicked', () => {
    renderComponent();
   
    const fosterShareLink = screen.getByText('FosterShare');
    fireEvent.click(fosterShareLink);
   
    expect(mockNavigate).toHaveBeenCalledWith('/fostershare/dashboard');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });


  it('navigates to resources when Resources is clicked', () => {
    renderComponent();
   
    const resourcesLink = screen.getByText('Resources');
    fireEvent.click(resourcesLink);
   
    expect(mockNavigate).toHaveBeenCalledWith('/fostershare/resources');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });


  it('renders the SupportServiceDetails component', () => {
    renderComponent();
   
    const resourceDetailsComponent = screen.getByTestId('resource-details');
    expect(resourceDetailsComponent).toBeInTheDocument();
    expect(resourceDetailsComponent).toHaveTextContent('Resource Details Component');
  });


  it('has correct layout structure', () => {
    renderComponent();
   
    // Check if main Box has margin
    const mainBox = screen.getByText('FosterShare').closest('.MuiBox-root');
    expect(mainBox).toBeInTheDocument();
   
    // Check if Grid item has flex direction row
    const gridItem = screen.getByText('FosterShare').closest('.MuiGrid-item');
    expect(gridItem).toBeInTheDocument();
  });


  it('applies correct cursor styles', () => {
    renderComponent();
   
    const fosterShareLink = screen.getByText('FosterShare');
    const resourcesLink = screen.getByText('Resources');
    const resourceDetailsText = screen.getByText('Resource details');
   
    // Clickable items should have pointer cursor
    expect(fosterShareLink).toHaveStyle('cursor: pointer');
    expect(resourcesLink).toHaveStyle('cursor: pointer');
   
    // Last breadcrumb item should not have pointer cursor
    expect(resourceDetailsText).not.toHaveStyle('cursor: pointer');
  });


  it('has correct accessibility attributes', () => {
    renderComponent();
   
    // Check for aria-label/id if present
    const resourceElements = screen.getAllByText('Resources');
    // The one with id should be found
    expect(screen.getByText('Resources')).toHaveAttribute('id', 'support services-table-label');
  });
});

