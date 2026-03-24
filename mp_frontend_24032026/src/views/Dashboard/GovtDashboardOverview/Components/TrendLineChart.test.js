import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrendLineChart from './TrendLineChart';


// ====== COMPONENT-SPECIFIC MOCKS ======


// Mock Recharts components to verify props and avoid SVG rendering issues in JSDOM
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children, data }) => (
      <div data-testid="line-chart" data-data={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Line: (props) => <div data-testid="line-component" data-props={JSON.stringify(props)} />,
    // UPDATED MOCK: Explicitly calls the 'content' function (renderTooltip) to ensure coverage
    Tooltip: (props) => {
      return (
        <div data-testid="tooltip-component">
          {props.content && props.content({ active: true, payload: [] })}
        </div>
      );
    },
  };
});


// Mock the internal CustomTooltip component
jest.mock('./CustomTooltip', () => (props) => (
  <div data-testid="custom-tooltip-mock">
    Custom Tooltip Rendered
  </div>
));


describe('TrendLineChart Component', () => {
  const mockData = [
    { value: 10, label: 'Point 1' },
    { value: 20, label: 'Point 2' },
    { value: 15, label: 'Point 3' },
  ];


  it('renders without crashing', () => {
    render(<TrendLineChart data={mockData} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });


  it('passes the correct data to the LineChart component', () => {
    render(<TrendLineChart data={mockData} />);
    const chart = screen.getByTestId('line-chart');
    const passedData = JSON.parse(chart.getAttribute('data-data'));
   
    expect(passedData).toHaveLength(3);
    expect(passedData[0].value).toBe(10);
  });


  it('configures the Line component with correct visual properties', () => {
    render(<TrendLineChart data={mockData} />);
    const line = screen.getByTestId('line-component');
    const props = JSON.parse(line.getAttribute('data-props'));


    expect(props.stroke).toBe("#71C5D4");
    expect(props.dataKey).toBe("value");
    expect(props.strokeWidth).toBe(2);
  });


  it('executes the custom tooltip rendering logic (covers renderTooltip function)', () => {
    render(<TrendLineChart data={mockData} />);
   
    // This assertion confirms that renderTooltip was called and our mocked CustomTooltip appeared
    expect(screen.getByTestId('custom-tooltip-mock')).toBeInTheDocument();
  });


  it('applies the correct explicit dimensions to the wrapper div', () => {
    const { container } = render(<TrendLineChart data={mockData} />);
    const wrapper = container.firstChild;


    expect(wrapper).toHaveStyle('width: 120px');
    expect(wrapper).toHaveStyle('height: 45px');
  });


  it('handles empty data arrays gracefully', () => {
    render(<TrendLineChart data={[]} />);
    const chart = screen.getByTestId('line-chart');
    const passedData = JSON.parse(chart.getAttribute('data-data'));
   
    expect(passedData).toEqual([]);
  });
});

