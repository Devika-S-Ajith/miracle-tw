import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ChildInterventions from './ChildInterventions';

// Mock the API module
jest.mock('../../../common/hooks/UseApiCalls', () => ({
  GetFamilyInterventionList: jest.fn(),
  // ...other API functions if needed
}));

// Properly mock IndividualInterventions as a default export React component returning JSX
jest.mock('../../../components/IndividualInterventions', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div data-testid="mock-individual-interventions">
      Mocked IndividualInterventions - {JSON.stringify(props)}
    </div>
  )),
}));

describe('ChildInterventions Component', () => {
  const mockData = {
    data: [
      { id: 1, intervention: 'Sample', interventionNotes: 'Note 1' },
    ],
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders IndividualInterventions with expected props', async () => {
    const APIS = require('../../../common/hooks/UseApiCalls');
    APIS.GetFamilyInterventionList.mockResolvedValue(mockData);

    render(<ChildInterventions childId={123} />);

    await waitFor(() => {
      const IndividualInterventions = require('../../../components/IndividualInterventions').default;
      expect(IndividualInterventions).toHaveBeenCalledTimes(1);
      expect(IndividualInterventions).toHaveBeenCalledWith(
        expect.objectContaining({
          id: { HTChildId: 123 },
          getTableData: expect.any(Function),
        }),
        {}
      );
    });
  });

  it('calls GetFamilyInterventionList when getTableData is used', async () => {
    const mockApiCall = jest.fn().mockResolvedValue(mockData);
    const APIS = require('../../../common/hooks/UseApiCalls');
    APIS.GetFamilyInterventionList.mockImplementation(mockApiCall);

    render(<ChildInterventions childId={789} />);

    const IndividualInterventions = require('../../../components/IndividualInterventions').default;
    const getTableDataFn = IndividualInterventions.mock.calls[0][0].getTableData;
    const payload = { page: 2, pageSize: 5 };

    await getTableDataFn(payload);

    await waitFor(() => {
      expect(APIS.GetFamilyInterventionList).toHaveBeenCalledWith(payload);
    });
  });

  it('matches snapshot', async () => {
    const APIS = require('../../../common/hooks/UseApiCalls');
    APIS.GetFamilyInterventionList.mockResolvedValue(mockData);

    const { asFragment } = render(<ChildInterventions childId={999} />);

    const IndividualInterventions = require('../../../components/IndividualInterventions').default;
    await waitFor(() => {
      expect(IndividualInterventions).toHaveBeenCalledTimes(1);
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
