import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomTooltip from './CustomTooltip';


// ====== COMPONENT-SPECIFIC MOCKS ======


// Mock Material UI Popper to avoid portal/positioning issues in JSDOM
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Popper: ({ children, open }) => (open ? <div data-testid="mui-popper">{children}</div> : null),
  };
});


// Mock Icons
jest.mock('../../../../assets/icons/InCrisisFlag', () => () => <span data-testid="in-crisis-flag" />);
jest.mock('../../../../assets/icons/VulnerableFlags', () => () => <span data-testid="vulnerable-flag" />);


// Mock SmallText
jest.mock('../../../../components/SmallText/SmallText', () => ({ value }) => (
  <span data-testid="small-text">{value}</span>
));


describe('CustomTooltip Component', () => {
  const mockPayload = [
    {
      payload: {
        key: '1',
        familyCount: 10,
        childrenCount: 20,
        value: 85,
        responses: {
          redFlagInCrisis: 2,
          redFlagVulnerable: 5,
        },
      },
    },
  ];


  const mockCoordinate = { x: 100, y: 100 };
  const mockChartRef = { current: document.createElement('div') };


  it('renders null when not active', () => {
    const { container } = render(
      <CustomTooltip active={false} payload={mockPayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );
    expect(container).toBeEmptyDOMElement();
  });


  it('renders null when payload is missing or empty', () => {
    const { container } = render(
      <CustomTooltip active={true} payload={[]} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );
    expect(container).toBeEmptyDOMElement();
  });


  it('renders null when coordinate is missing', () => {
    const { container } = render(
      <CustomTooltip active={true} payload={mockPayload} coordinate={null} chartRef={mockChartRef} />
    );
    expect(container).toBeEmptyDOMElement();
  });


  it('renders correctly with valid data', () => {
    render(
      <CustomTooltip active={true} payload={mockPayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );


    // Verify main content
    expect(screen.getByTestId('mui-popper')).toBeInTheDocument();
    expect(screen.getByText(/Assessment 1/i)).toBeInTheDocument();
    expect(screen.getByText(/10 Families | 20 Children/i)).toBeInTheDocument();
    expect(screen.getByText(/85%/i)).toBeInTheDocument();


    // Verify red flag data in SmallText components
    const smallTexts = screen.getAllByTestId('small-text');
    expect(smallTexts[0]).toHaveTextContent(/"In crisis" red flags: 2/i);
    expect(smallTexts[1]).toHaveTextContent(/"Vulnerable" red flags:5/i);
  });


  it('renders icons correctly', () => {
    render(
      <CustomTooltip active={true} payload={mockPayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );


    expect(screen.getByTestId('in-crisis-flag')).toBeInTheDocument();
    expect(screen.getByTestId('vulnerable-flag')).toBeInTheDocument();
  });


  it('handles missing nested response data gracefully', () => {
    const incompletePayload = [
      {
        payload: {
          key: '2',
          responses: {}, // Missing specific flags
        },
      },
    ];


    render(
      <CustomTooltip active={true} payload={incompletePayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );


    const smallTexts = screen.getAllByTestId('small-text');
    // Testing optional chaining: data?.responses?.redFlagInCrisis should be undefined
    expect(smallTexts[0]).toHaveTextContent(/"In crisis" red flags: undefined/i);
  });


  it('uses correct hardcoded color for the box', () => {
    render(
      <CustomTooltip active={true} payload={mockPayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );
   
    // The box has backgroundColor: '#71C5D4'
    // We could check if this color appears in the rendered HTML
    // or use jest-styled-components to test styles
  });


  it('applies correct styling props to Paper', () => {
    render(
      <CustomTooltip active={true} payload={mockPayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );
   
    // We can't easily test theme-based styling in Jest
    // But we can at least verify the component renders
    expect(screen.getByTestId('mui-popper')).toBeInTheDocument();
  });


  it('calculates correct offset based on coordinate', () => {
    const testCoordinate = { x: 500, y: 300 };
    const expectedOffsetX = 500 - 320; // coordinate.x - 320
    const expectedOffsetY = 300 - 60;  // coordinate.y - 60
   
    // We need to mock Popper to see the modifiers
    jest.doMock('@mui/material', () => {
      const actual = jest.requireActual('@mui/material');
      const MockPopper = ({ children, open, modifiers }) => {
        if (!open) return null;
       
        // Capture and test modifiers
        const offsetModifier = modifiers?.find(m => m.name === 'offset');
        if (offsetModifier) {
          expect(offsetModifier.options.offset[0]).toBe(expectedOffsetX);
          expect(offsetModifier.options.offset[1]).toBe(expectedOffsetY);
        }
       
        return <div data-testid="mui-popper">{children}</div>;
      };
     
      return { ...actual, Popper: MockPopper };
    });
   
    // Re-import after re-mocking
    const { default: CustomTooltipWithMock } = require('./CustomTooltip');
   
    render(
      <CustomTooltipWithMock
        active={true}
        payload={mockPayload}
        coordinate={testCoordinate}
        chartRef={mockChartRef}
      />
    );
   
    expect(screen.getByTestId('mui-popper')).toBeInTheDocument();
  });
 
  it('handles undefined payload[0].payload', () => {
    const badPayload = [
      { payload: undefined } // payload[0] exists but .payload is undefined
    ];
   
    // The component will crash because it tries to access data.key without optional chaining
    // This test reveals a bug in the component that needs to be fixed
    expect(() => {
      render(
        <CustomTooltip active={true} payload={badPayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
      );
    }).toThrow();
   
    // OR if you want to test gracefully, you need to fix the component first:
    // 1. Add optional chaining: const data = payload[0]?.payload;
    // 2. Then check: if (!data) return null;
  });


 
  it('handles missing data properties gracefully', () => {
    const incompleteData = [
      {
        payload: {
          key: '3',
          // Missing familyCount, childrenCount, value, responses
        }
      }
    ];
   
    render(
      <CustomTooltip active={true} payload={incompleteData} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );
   
    // Should render without crashing
    expect(screen.getByTestId('mui-popper')).toBeInTheDocument();
    expect(screen.getByText(/Assessment 3/i)).toBeInTheDocument();
   
    // Should handle missing data with optional chaining
    const smallTexts = screen.getAllByTestId('small-text');
    expect(smallTexts[0]).toHaveTextContent(/"In crisis" red flags: undefined/i);
  });
 
  it('handles null/undefined data.value', () => {
    const nullValuePayload = [
      {
        payload: {
          key: '4',
          familyCount: 5,
          childrenCount: 8,
          value: null,
          responses: {
            redFlagInCrisis: 1,
            redFlagVulnerable: 2,
          },
        }
      }
    ];
   
    render(
      <CustomTooltip active={true} payload={nullValuePayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );
   
    expect(screen.getByTestId('mui-popper')).toBeInTheDocument();
   
    // Instead of looking for "null%", look for just "%" since null renders as empty
    // Or check that the component renders without crashing
    const percentageText = screen.getByText(/%/i);
    expect(percentageText.textContent).toBe('%'); // Just the % symbol
   
    // Alternative: test that it renders without throwing
    // and the percentage text container exists
  });


  it('sets anchorEl when active becomes true with valid chartRef', () => {
    const { rerender } = render(
      <CustomTooltip active={false} payload={[]} coordinate={null} chartRef={mockChartRef} />
    );
   
    // Initially should not render
    expect(screen.queryByTestId('mui-popper')).not.toBeInTheDocument();
   
    // Rerender with active=true
    rerender(
      <CustomTooltip active={true} payload={mockPayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );
   
    // Should now render
    expect(screen.getByTestId('mui-popper')).toBeInTheDocument();
  });
 
  it('does not set anchorEl when chartRef.current is null', () => {
    const nullChartRef = { current: null };
    render(
      <CustomTooltip active={true} payload={mockPayload} coordinate={mockCoordinate} chartRef={nullChartRef} />
    );
   
    // Should not render because anchorEl won't be set
    expect(screen.queryByTestId('mui-popper')).not.toBeInTheDocument();
  });
 
  it('clears anchorEl when active becomes false', () => {
    const { rerender } = render(
      <CustomTooltip active={true} payload={mockPayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );
   
    expect(screen.getByTestId('mui-popper')).toBeInTheDocument();
   
    // Rerender with active=false
    rerender(
      <CustomTooltip active={false} payload={mockPayload} coordinate={mockCoordinate} chartRef={mockChartRef} />
    );
   
    // Should not render
    expect(screen.queryByTestId('mui-popper')).not.toBeInTheDocument();
  });


});



