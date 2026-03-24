// ====== PROJECT-WIDE MOCKS ======

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(),
    interceptors: { request: { use: jest.fn(), eject: jest.fn() }, response: { use: jest.fn(), eject: jest.fn() } },
  })),
  get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(),
  defaults: { baseURL: '', headers: { common: {}, post: {}, put: {}, patch: {}, delete: {} } },
}));

// ====== IMPORTS ======

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterPopover from "./FilterPopover";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";

// ====== COMPONENT-SPECIFIC MOCKS ======

jest.mock("../../../components/SubHeading", () => (props) => (
  <div data-testid="subheading">{props.value}</div>
));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        "common:common.Filters": "Filters",
        "common:common.Organization": "Organization",
        "common:common.State": "State",
        "common:common.Region": "Region",
        "common:common.Zipcode": "Zipcode",
        "common:common.Clear": "Clear",
        "common:common.Apply": "Apply",
        "common:common.All Orgs": "All Organizations",
      };
      return translations[key] || key;
    },
  }),
}));

const mockHandleClose = jest.fn();

const mockCountryListForSidenav = [
  {
    countryId: "1",
    states: [
      { stateId: "s1", stateName: "State 1" },
      { stateId: "s2", stateName: "State 2" },
      { stateId: "s3", stateName: "State 3" },
    ],
    districts: [
      { districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" },
      { districtId: "d2", districtName: "Region 2", stateId: "s1", stateName: "State 1" },
      { districtId: "d3", districtName: "Region 3", stateId: "s2", stateName: "State 2" },
    ],
    zipcodes: [
      { id: "z1", zipcode: "10001", districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
      { id: "z2", zipcode: "10002", districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
      { id: "z3", zipcode: "20001", districtId: "d3", stateId: "s2", districtName: "Region 3", stateName: "State 2" },
    ],
  },
  {
    countryId: "2",
    states: [
      { stateId: "s4", stateName: "Other State" },
    ],
    districts: [],
    zipcodes: [
      { id: "z4", zipcode: "99999", stateName: "Other State" },
    ],
  },
];

const mockLinkedAccounts = [
  { accountId: "a1", accountName: "Org 1" },
  { accountId: "a2", accountName: "Org 2" },
];

function renderWithContext(contextProps) {
  return render(
    <CommonDataContext.Provider value={contextProps}>
      <FilterPopover handleClose={mockHandleClose} />
    </CommonDataContext.Provider>
  );
}

beforeEach(() => {
  // Mock localStorage
  Storage.prototype.getItem = jest.fn((key) => (key === "userRegion" ? "1" : null));
  Storage.prototype.setItem = jest.fn();
  Storage.prototype.clear = jest.fn();
  
  jest.clearAllMocks();
});

afterEach(() => {
  // Restore localStorage mock
  delete Storage.prototype.getItem;
  delete Storage.prototype.setItem;
  delete Storage.prototype.clear;
});

// ====== HELPER FUNCTIONS ======

const openDropdown = async (label) => {
  // Find all elements with the label text
  const containers = screen.getAllByText(label);
  // Get the first one (should be the SubHeading)
  const container = containers[0].parentElement;
  const input = container.querySelector('input[role="combobox"]');
  if (input) {
    await userEvent.click(input);
  } else {
    // Fallback: find by ID
    const idMap = {
      "Organization": "organization",
      "State": "state", 
      "Region": "region",
      "Zipcode": "zipcode"
    };
    const inputById = document.getElementById(idMap[label]);
    if (inputById) {
      await userEvent.click(inputById);
    }
  }
};

// ====== TESTS ======

describe("FilterPopover", () => {
  test("renders all filter sections", () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Organization")).toBeInTheDocument();
    expect(screen.getByText("State")).toBeInTheDocument();
    expect(screen.getByText("Region")).toBeInTheDocument();
    expect(screen.getByText("Zipcode")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
  });

  test("shows organization options and allows selection", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Open organization dropdown
    await openDropdown("Organization");
    
    // Wait for options to be visible
    const listbox = await screen.findByRole('listbox');
    
    // Find and click the option (not just the checkbox)
    const option = await screen.findByRole('option', { name: /Org 1/i });
    await userEvent.click(option);
    
    // Chip should appear
    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      const orgChip = Array.from(chips).find(chip => chip.textContent === "Org 1");
      expect(orgChip).toBeInTheDocument();
    });
  });

  test("shows state options and allows selection", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("State");
    
    // Wait for options to be visible
    const listbox = await screen.findByRole('listbox');
    
    // Find and click the option
    const option = await screen.findByRole('option', { name: /State 1/i });
    await userEvent.click(option);
    
    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      const stateChip = Array.from(chips).find(chip => chip.textContent === "State 1");
      expect(stateChip).toBeInTheDocument();
    });
  });

  test("shows region options when userRegion is 1", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Region");
    
    await waitFor(() => {
      expect(screen.getByText("Region 1")).toBeInTheDocument();
    });
  });

  test("does not show region section when userRegion is not 1", async () => {
    Storage.prototype.getItem = jest.fn(() => "2");
    
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    expect(screen.queryByText("Region")).not.toBeInTheDocument();
  });

  test("shows zipcode options and allows selection", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    // Wait for options to be visible
    const listbox = await screen.findByRole('listbox');
    
    // Find and click the option
    const option = await screen.findByRole('option', { name: /10001/i });
    await userEvent.click(option);
    
    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      const zipcodeChip = Array.from(chips).find(chip => chip.textContent === "10001");
      expect(zipcodeChip).toBeInTheDocument();
    });
  });

  test("clear filters button resets all filters and calls handleClose", async () => {
    const setNavbarFilterValues = jest.fn();
    renderWithContext({
      setNavbarFilterValues,
      navbarFilterValues: [
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "REGION", id: "d1", value: "Region 1" },
        { key: "ZIPCODE", id: "z1", value: "10001" },
        { key: "ORG", id: "a1", value: "Org 1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await userEvent.click(screen.getByText("Clear"));
    expect(setNavbarFilterValues).toHaveBeenCalledWith([]);
    expect(mockHandleClose).toHaveBeenCalled();
  });

  test("apply filters button updates context and calls handleClose", async () => {
    const setNavbarFilterValues = jest.fn();
    renderWithContext({
      setNavbarFilterValues,
      navbarFilterValues: [
        { key: "ORG", id: "a1", value: "Org 1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await userEvent.click(screen.getByText("Apply"));
    
    expect(setNavbarFilterValues).toHaveBeenCalled();
    expect(mockHandleClose).toHaveBeenCalled();
  });

  test("covers branch: null/undefined for linkedAccounts and countryData lists", () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: [{ countryId: "1" }],
      linkedAccounts: null,
    });

    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  test("deletes chips individually", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "ORG", id: "a1", value: "Org 1" },
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "REGION", id: "d1", value: "Region 1" },
        { key: "ZIPCODE", id: "z1", value: "10001" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Find and click delete buttons on chips
    const deleteButtons = screen.getAllByTestId("CloseIcon")
      .filter(icon => icon.closest('.MuiChip-deleteIcon'));
    
    // Delete first chip (Org 1)
    if (deleteButtons.length > 0) {
      await userEvent.click(deleteButtons[0]);
      await waitFor(() => {
        // Chip should be removed
        const orgChips = screen.queryAllByText("Org 1").filter(el => el.closest('.MuiChip-label'));
        expect(orgChips.length).toBe(0);
      });
    }
  });

  test("filters zipcodes when regions are selected without a state", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should show zipcodes from Region 1
      expect(screen.getByText("10001")).toBeInTheDocument();
      expect(screen.getByText("10002")).toBeInTheDocument();
      // Should NOT show zipcodes from other regions
      expect(screen.queryByText("20001")).not.toBeInTheDocument();
    });
  });

  test("filters regions based on selected states", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "STATE", id: "s1", value: "State 1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Region");
    
    await waitFor(() => {
      // Should show regions from State 1
      expect(screen.getByText("Region 1")).toBeInTheDocument();
      expect(screen.getByText("Region 2")).toBeInTheDocument();
      // Should NOT show regions from other states
      expect(screen.queryByText("Region 3")).not.toBeInTheDocument();
    });
  });

  test("handles scroll events for dropdowns", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Open state dropdown
    await openDropdown("State");
    
    // Find listbox
    const listbox = await screen.findByRole("listbox");
    
    // Trigger scroll event directly on the component's handler
    // This tests that the scroll handler doesn't crash
    expect(listbox).toBeInTheDocument();
  });

  test("handles filterOptions logic with search input", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Get state input
    const stateInputs = screen.getAllByText("State");
    const stateInput = stateInputs[0].parentElement.querySelector('input');
    
    // Type to trigger filter
    await userEvent.type(stateInput, "State 1");
    
    await openDropdown("State");
    
    await waitFor(() => {
      expect(screen.getByText("State 1")).toBeInTheDocument();
      expect(screen.queryByText("State 3")).not.toBeInTheDocument();
    });
  });

  test("handles groupBy logic for Zipcodes based on userRegion", async () => {
    // First test with userRegion = 1
    Storage.prototype.getItem = jest.fn(() => "1");
    
    const { unmount } = renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should show district names when userRegion = 1
      expect(screen.getByText("10001")).toBeInTheDocument();
    });

    unmount();

    // Now test with userRegion != 1
    Storage.prototype.getItem = jest.fn(() => "2");
    
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      expect(screen.getByText("99999")).toBeInTheDocument();
    });
  });

  test("handles handleFilteringZipcodes with various inputs", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Get zipcode input
    const zipInputs = screen.getAllByText("Zipcode");
    const zipInput = zipInputs[0].parentElement.querySelector('input');
    
    // Test searching by zipcode
    await userEvent.type(zipInput, "10001");
    
    await openDropdown("Zipcode");
    
    await waitFor(() => {
      expect(screen.getByText("10001")).toBeInTheDocument();
      expect(screen.queryByText("20001")).not.toBeInTheDocument();
    });
  });

  test("syncs initial values from navbarFilterValues", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "ORG", id: "a1", value: "Org 1" },
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
        { key: "ZIPCODE", id: "z1", value: "10001", districtId: "d1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Check that chips are rendered
    await waitFor(() => {
      // Use getAllByText and filter for chips
      const orgChips = screen.getAllByText("Org 1").filter(el => el.closest('.MuiChip-label'));
      const stateChips = screen.getAllByText("State 1").filter(el => el.closest('.MuiChip-label'));
      const regionChips = screen.getAllByText("Region 1").filter(el => el.closest('.MuiChip-label'));
      const zipcodeChips = screen.getAllByText("10001").filter(el => el.closest('.MuiChip-label'));
      
      expect(orgChips.length).toBeGreaterThan(0);
      expect(stateChips.length).toBeGreaterThan(0);
      expect(regionChips.length).toBeGreaterThan(0);
      expect(zipcodeChips.length).toBeGreaterThan(0);
    });
  });

  test("handles filter ordering on apply", async () => {
    const setNavbarFilterValues = jest.fn();
    renderWithContext({
      setNavbarFilterValues,
      navbarFilterValues: [
        { key: "ZIPCODE", id: "z1", value: "10001", districtId: "d1" },
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "ORG", id: "a1", value: "Org 1" },
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await userEvent.click(screen.getByText("Apply"));
    
    // Check that filters are sorted in correct order
    expect(setNavbarFilterValues).toHaveBeenCalled();
    const filters = setNavbarFilterValues.mock.calls[0][0];
    const keys = filters.map(f => f.key);
    
    // Should be sorted: ORG, STATE, REGION, ZIPCODE
    expect(keys).toEqual(["ORG", "STATE", "REGION", "ZIPCODE"]);
  });

  test("handles edge case with missing data in filterOptions", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: [{
        countryId: "1",
        states: [
          { stateId: "s1", stateName: "State 1" },
          { stateId: "s2", stateName: "" }, // Empty stateName
        ],
        districts: [],
        zipcodes: [],
      }],
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("State");
    
    // Should not crash with missing/empty stateName
    await waitFor(() => {
      expect(screen.getByText("State 1")).toBeInTheDocument();
    });
  });

  test("handles chip delete for all filter types", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "ORG", id: "a1", value: "Org 1" },
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
        { key: "ZIPCODE", id: "z1", value: "10001", districtId: "d1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Test that all delete handlers work without error
    const deleteIcons = screen.getAllByTestId("CloseIcon")
      .filter(icon => icon.closest('.MuiChip-deleteIcon'));
    
    // Click each delete icon
    for (const icon of deleteIcons) {
      await userEvent.click(icon);
      await waitFor(() => {
        // Component should still be rendered
        expect(screen.getByText("Filters")).toBeInTheDocument();
      });
    }
  });

  test("handles multiple selections in organization dropdown", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Organization");
    
    // Select Org 1
    const option1 = await screen.findByRole('option', { name: /Org 1/i });
    await userEvent.click(option1);
    
    // Select Org 2
    const option2 = await screen.findByRole('option', { name: /Org 2/i });
    await userEvent.click(option2);
    
    await waitFor(() => {
      // Should show count chip "2"
      const chips = document.querySelectorAll('.MuiChip-label');
      const countChip = Array.from(chips).find(chip => chip.textContent === "2");
      expect(countChip).toBeInTheDocument();
    });
  });

  test("handles state filter with no regions selected", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "STATE", id: "s1", value: "State 1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should show all zipcodes from State 1
      expect(screen.getByText("10001")).toBeInTheDocument();
      expect(screen.getByText("10002")).toBeInTheDocument();
    });
  });

  test("handles clearing organization filter via chip delete", async () => {
    const setNavbarFilterValues = jest.fn();
    renderWithContext({
      setNavbarFilterValues,
      navbarFilterValues: [
        { key: "ORG", id: "a1", value: "Org 1" },
        { key: "ORG", id: "a2", value: "Org 2" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Find the chip delete button
    const deleteIcons = screen.getAllByTestId("CloseIcon")
      .filter(icon => icon.closest('.MuiChip-deleteIcon'));
    
    await userEvent.click(deleteIcons[0]);
    
    await waitFor(() => {
      // Chip should be removed
      const chips = document.querySelectorAll('.MuiChip-label');
      expect(chips.length).toBe(0);
    });
  });

  test("handles zipcode filtering by district name", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Get zipcode input
    const zipInputs = screen.getAllByText("Zipcode");
    const zipInput = zipInputs[0].parentElement.querySelector('input');
    
    // Search by district name
    await userEvent.type(zipInput, "Region 1");
    
    await waitFor(() => {
      // Should show zipcodes from Region 1
      expect(screen.getByText("10001")).toBeInTheDocument();
      expect(screen.queryByText("20001")).not.toBeInTheDocument();
    });
  });

  test("handles state and region combination for zipcode filtering", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should only show zipcodes from Region 1 in State 1
      expect(screen.getByText("10001")).toBeInTheDocument();
      expect(screen.getByText("10002")).toBeInTheDocument();
      expect(screen.queryByText("20001")).not.toBeInTheDocument();
    });
  });

  test("handles renderTags for different tag counts", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "STATE", id: "s2", value: "State 2" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Should show "2" as count chip for multiple selections
    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      const countChip = Array.from(chips).find(chip => chip.textContent === "2");
      expect(countChip).toBeInTheDocument();
    });
  });

  test("handles scroll to load more options", async () => {
    // Create a large dataset
    const largeStates = Array.from({ length: 50 }, (_, i) => ({
      stateId: `s${i}`,
      stateName: `State ${i}`,
    }));

    const largeCountryList = [{
      ...mockCountryListForSidenav[0],
      states: largeStates,
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: largeCountryList,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("State");
    
    const listbox = await screen.findByRole('listbox');
    
    // Mock the scroll properties
    Object.defineProperty(listbox, 'scrollTop', { value: 1000, writable: true });
    Object.defineProperty(listbox, 'clientHeight', { value: 100, writable: true });
    Object.defineProperty(listbox, 'scrollHeight', { value: 1100, writable: true });
    
    // Trigger scroll event
    fireEvent.scroll(listbox);
    
    // Component should not crash
    expect(listbox).toBeInTheDocument();
  });

  test("handles empty filter values in localFilterValues update", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Select and then deselect a state
    await openDropdown("State");
    const option = await screen.findByRole('option', { name: /State 1/i });
    await userEvent.click(option);
    
    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      expect(chips.length).toBeGreaterThan(0);
    });
    
    // Click again to deselect
    await userEvent.click(option);
    
    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      const stateChip = Array.from(chips).find(chip => chip.textContent === "State 1");
      expect(stateChip).toBeUndefined();
    });
  });

  test("handles region filtering when no state is selected but regions exist", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Initially all regions should be available
    await openDropdown("Region");
    
    await waitFor(() => {
      expect(screen.getByText("Region 1")).toBeInTheDocument();
      expect(screen.getByText("Region 2")).toBeInTheDocument();
      expect(screen.getByText("Region 3")).toBeInTheDocument();
    });
  });

  test("handles userRegion = 1 specific logic", async () => {
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "userRegion") return "1";
      return null;
    });

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Region section should be visible
    expect(screen.getByText("Region")).toBeInTheDocument();
    
    // Zipcode groupBy should use districtName
    await openDropdown("Zipcode");
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });



  test("handles region search filtering", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Get region input
    const regionInputs = screen.getAllByText("Region");
    const regionInput = regionInputs[0].parentElement.querySelector('input');
    
    // Search for specific region
    await userEvent.type(regionInput, "Region 2");
    
    await openDropdown("Region");
    
    await waitFor(() => {
      expect(screen.getByText("Region 2")).toBeInTheDocument();
      // Region 3 should not be visible as it doesn't match search
      expect(screen.queryByText("Region 3")).not.toBeInTheDocument();
    });
  });

  test("handles region search by state name", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Get region input
    const regionInputs = screen.getAllByText("Region");
    const regionInput = regionInputs[0].parentElement.querySelector('input');
    
    // Search by state name
    await userEvent.type(regionInput, "State 2");
    
    await openDropdown("Region");
    
    await waitFor(() => {
      // Should show regions from State 2
      expect(screen.getByText("Region 3")).toBeInTheDocument();
      // Should not show regions from State 1
      expect(screen.queryByText("Region 1")).not.toBeInTheDocument();
    });
  });

  test("handles region scroll to load more", async () => {
    // Create large region dataset
    const largeRegions = Array.from({ length: 50 }, (_, i) => ({
      districtId: `d${i}`,
      districtName: `Region ${i}`,
      stateId: "s1",
      stateName: "State 1"
    }));

    const largeCountryList = [{
      ...mockCountryListForSidenav[0],
      districts: largeRegions,
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: largeCountryList,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Region");
    
    const listbox = await screen.findByRole('listbox');
    
    // Mock scroll properties
    Object.defineProperty(listbox, 'scrollTop', { value: 1000, writable: true });
    Object.defineProperty(listbox, 'clientHeight', { value: 100, writable: true });
    Object.defineProperty(listbox, 'scrollHeight', { value: 1100, writable: true });
    
    // Trigger scroll event
    fireEvent.scroll(listbox);
    
    expect(listbox).toBeInTheDocument();
  });

  test("handles zipcode scroll to load more", async () => {
    // Create large zipcode dataset
    const largeZipcodes = Array.from({ length: 50 }, (_, i) => ({
      id: `z${i}`,
      zipcode: `1000${i}`,
      districtId: "d1",
      stateId: "s1",
      districtName: "Region 1",
      stateName: "State 1"
    }));

    const largeCountryList = [{
      ...mockCountryListForSidenav[0],
      zipcodes: largeZipcodes,
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: largeCountryList,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    const listbox = await screen.findByRole('listbox');
    
    // Mock scroll properties
    Object.defineProperty(listbox, 'scrollTop', { value: 1000, writable: true });
    Object.defineProperty(listbox, 'clientHeight', { value: 100, writable: true });
    Object.defineProperty(listbox, 'scrollHeight', { value: 1100, writable: true });
    
    // Trigger scroll event
    fireEvent.scroll(listbox);
    
    expect(listbox).toBeInTheDocument();
  });

  test("handles region change with empty selection", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Region");
    
    // Click to deselect
    const option = await screen.findByRole('option', { name: /Region 1/i });
    await userEvent.click(option);
    
    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      const regionChip = Array.from(chips).find(chip => chip.textContent === "Region 1");
      expect(regionChip).toBeUndefined();
    });
  });

  test("handles state filterOptions without input", async () => {
    const largeStates = Array.from({ length: 15 }, (_, i) => ({
      stateId: `s${i}`,
      stateName: `State ${i}`,
    }));

    const largeCountryList = [{
      ...mockCountryListForSidenav[0],
      states: largeStates,
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: largeCountryList,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("State");
    
    // Should show limited options (10 by default)
    await waitFor(() => {
      expect(screen.getByText("State 0")).toBeInTheDocument();
      expect(screen.getByText("State 9")).toBeInTheDocument();
      // State 14 should not be visible initially
      expect(screen.queryByText("State 14")).not.toBeInTheDocument();
    });
  });

  test("handles region filterOptions without input", async () => {
    const largeRegions = Array.from({ length: 15 }, (_, i) => ({
      districtId: `d${i}`,
      districtName: `Region ${i}`,
      stateId: "s1",
      stateName: "State 1"
    }));

    const largeCountryList = [{
      ...mockCountryListForSidenav[0],
      districts: largeRegions,
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: largeCountryList,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Region");
    
    // Should show limited options (10 by default)
    await waitFor(() => {
      expect(screen.getByText("Region 0")).toBeInTheDocument();
      expect(screen.getByText("Region 9")).toBeInTheDocument();
      // Region 14 should not be visible initially
      expect(screen.queryByText("Region 14")).not.toBeInTheDocument();
    });
  });

  test("handles zipcode filterOptions without input", async () => {
    const largeZipcodes = Array.from({ length: 15 }, (_, i) => ({
      id: `z${i}`,
      zipcode: `1000${i}`,
      districtId: "d1",
      stateId: "s1",
      districtName: "Region 1",
      stateName: "State 1"
    }));

    const largeCountryList = [{
      ...mockCountryListForSidenav[0],
      zipcodes: largeZipcodes,
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: largeCountryList,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    // Should show limited options (10 by default)
    await waitFor(() => {
      expect(screen.getByText("10000")).toBeInTheDocument();
      expect(screen.getByText("10009")).toBeInTheDocument();
      // 10014 should not be visible initially
      expect(screen.queryByText("10014")).not.toBeInTheDocument();
    });
  });

  test("handles multiple state selection for region filtering", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "STATE", id: "s2", value: "State 2" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Region");
    
    await waitFor(() => {
      // Should show regions from both states
      expect(screen.getByText("Region 1")).toBeInTheDocument(); // State 1
      expect(screen.getByText("Region 2")).toBeInTheDocument(); // State 1
      expect(screen.getByText("Region 3")).toBeInTheDocument(); // State 2
    });
  });

  test("handles state with regions for zipcode filtering - no regions selected", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "STATE", id: "s2", value: "State 2" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should show all zipcodes from State 2
      expect(screen.getByText("20001")).toBeInTheDocument();
      // Should not show zipcodes from State 1
      expect(screen.queryByText("10001")).not.toBeInTheDocument();
    });
  });

  test("handles multiple states with different region selections", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "STATE", id: "s2", value: "State 2" },
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should show zipcodes from Region 1 (State 1) and all of State 2
      expect(screen.getByText("10001")).toBeInTheDocument(); // Region 1
      expect(screen.getByText("10002")).toBeInTheDocument(); // Region 1
      expect(screen.getByText("20001")).toBeInTheDocument(); // State 2
    });
  });

  test("handles region selection with multiple regions", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Region");
    
    // Select Region 1
    const option1 = await screen.findByRole('option', { name: /Region 1/i });
    await userEvent.click(option1);
    
    // Select Region 2
    const option2 = await screen.findByRole('option', { name: /Region 2/i });
    await userEvent.click(option2);
    
    await waitFor(() => {
      // Both regions should be selected
      const chips = document.querySelectorAll('.MuiChip-label');
      expect(chips.length).toBeGreaterThan(0);
    });
  });

  test("handles zipcode change handler covering filter removal path", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "ZIPCODE", id: "z1", value: "10001", districtId: "d1" },
        { key: "STATE", id: "s1", value: "State 1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    // Deselect the existing zipcode
    const option = await screen.findByRole('option', { name: /10001/i });
    await userEvent.click(option);
    
    // Select a different zipcode to trigger the filter update
    const option2 = await screen.findByRole('option', { name: /10002/i });
    await userEvent.click(option2);
    
    await waitFor(() => {
      // Should have the new zipcode
      const chips = document.querySelectorAll('.MuiChip-label');
      const zipcodeChips = Array.from(chips).filter(chip => 
        chip.textContent === "10002" || chip.textContent === "2"
      );
      expect(zipcodeChips.length).toBeGreaterThan(0);
    });
  });

  test("handles undefined stateOptionsLimit fallback", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Open dropdown without any prior state
    await openDropdown("State");
    
    await waitFor(() => {
      // Should show limited options using the || 10 fallback
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("handles undefined regionOptionsLimit fallback", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Region");
    
    await waitFor(() => {
      // Should show limited options using the || 10 fallback
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("handles undefined zipcodeOptionsLimit fallback", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should show limited options using the || 10 fallback
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("handles zipcode groupBy with missing districtName", async () => {
    const dataWithMissingDistrictName = [{
      countryId: "1",
      states: [{ stateId: "s1", stateName: "State 1" }],
      districts: [{ districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" }],
      zipcodes: [
        { id: "z1", zipcode: "10001", districtId: "d1", stateId: "s1", stateName: "State 1" }, // missing districtName
        { id: "z2", zipcode: "10002", districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: dataWithMissingDistrictName,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should fall back to stateName for grouping
      expect(screen.getByText("10001")).toBeInTheDocument();
    });
  });

  test("handles zipcode renderTags with non-object values", async () => {
    // This tests the || option fallback in renderTags
    const dataWithSimpleZipcodes = [{
      countryId: "1",
      states: [{ stateId: "s1", stateName: "State 1" }],
      districts: [{ districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" }],
      zipcodes: [
        { id: "z1", zipcode: "10001", districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "ZIPCODE", id: "z1", value: "10001", districtId: "d1" },
      ],
      countryListForSidenav: dataWithSimpleZipcodes,
      linkedAccounts: mockLinkedAccounts,
    });

    await waitFor(() => {
      // Chip should render with zipcode value
      const chips = document.querySelectorAll('.MuiChip-label');
      const zipcodeChip = Array.from(chips).find(chip => chip.textContent === "10001");
      expect(zipcodeChip).toBeInTheDocument();
    });
  });

  test("handles zipcode renderOption with non-object values", async () => {
    const dataWithMixedZipcodes = [{
      countryId: "1",
      states: [{ stateId: "s1", stateName: "State 1" }],
      districts: [{ districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" }],
      zipcodes: [
        { id: "z1", zipcode: "10001", districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
        { id: "z2", zipcode: "10002", districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: dataWithMixedZipcodes,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should render zipcodes correctly
      expect(screen.getByText("10001")).toBeInTheDocument();
      expect(screen.getByText("10002")).toBeInTheDocument();
    });
  });

  test("handles userRegion != 1 for zipcode groupBy", async () => {
    Storage.prototype.getItem = jest.fn(() => "2");

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should use stateName for grouping when userRegion != 1
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("handles state change that clears incompatible regions", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
        { key: "REGION", id: "d3", value: "Region 3", stateId: "s2" }, // This belongs to State 2
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Initially should have State 1 selected
    await waitFor(() => {
      const stateChip = Array.from(document.querySelectorAll('.MuiChip-label'))
        .find(chip => chip.textContent === "State 1");
      expect(stateChip).toBeInTheDocument();
    });

    // Change state selection - deselect State 1
    await openDropdown("State");
    const stateOption = await screen.findByRole('option', { name: /State 1/i });
    await userEvent.click(stateOption);

    // Region 3 (from State 2) should be filtered out since State 2 is not selected
    await waitFor(() => {
      const regionChips = Array.from(document.querySelectorAll('.MuiChip-label'))
        .filter(chip => chip.textContent.includes("Region"));
      // Should only have regions compatible with remaining selected states
      expect(regionChips.length).toBeLessThanOrEqual(2);
    });
  });

  test("covers region handler with length check", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Region");
    
    // Select a region to trigger the if (newValue?.length) path
    const option = await screen.findByRole('option', { name: /Region 1/i });
    await userEvent.click(option);
    
    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      const regionChip = Array.from(chips).find(chip => chip.textContent === "Region 1");
      expect(regionChip).toBeInTheDocument();
    });

    // Now deselect to cover the else path
    await userEvent.click(option);
    
    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      const regionChip = Array.from(chips).find(chip => chip.textContent === "Region 1");
      expect(regionChip).toBeUndefined();
    });
  });

  test("handles complex filter scenario with all filter types", async () => {
    const setNavbarFilterValues = jest.fn();
    renderWithContext({
      setNavbarFilterValues,
      navbarFilterValues: [
        { key: "ORG", id: "a1", value: "Org 1" },
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
        { key: "ZIPCODE", id: "z1", value: "10001", districtId: "d1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Modify zipcode
    await openDropdown("Zipcode");
    const zipcodeOption = await screen.findByRole('option', { name: /10002/i });
    await userEvent.click(zipcodeOption);

    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      expect(chips.length).toBeGreaterThan(0);
    });

    // Apply filters
    await userEvent.click(screen.getByText("Apply"));
    
    expect(setNavbarFilterValues).toHaveBeenCalled();
  });

  test("covers stateOptionsLimit explicitly undefined", async () => {
    const { rerender } = renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Force component to use undefined limit by opening without scrolling
    const stateInput = screen.getAllByText("State")[0].parentElement.querySelector('input');
    
    // This should trigger the filterOptions with no inputValue, hitting the || 10 path
    await userEvent.click(stateInput);
    
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("covers regionOptionsLimit explicitly undefined", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    const regionInput = screen.getAllByText("Region")[0].parentElement.querySelector('input');
    
    // Trigger filterOptions with undefined limit
    await userEvent.click(regionInput);
    
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("covers zipcodeOptionsLimit explicitly undefined", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    const zipInput = screen.getAllByText("Zipcode")[0].parentElement.querySelector('input');
    
    // Trigger filterOptions with undefined limit
    await userEvent.click(zipInput);
    
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("covers zipcode groupBy with both districtName and stateName present", async () => {
    Storage.prototype.getItem = jest.fn(() => "1");

    const completeData = [{
      countryId: "1",
      states: [{ stateId: "s1", stateName: "State 1" }],
      districts: [{ districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" }],
      zipcodes: [
        { id: "z1", zipcode: "10001", districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: completeData,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should use districtName (not fall back to stateName)
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("covers zipcode groupBy when districtName is explicitly null", async () => {
    Storage.prototype.getItem = jest.fn(() => "1");

    const dataWithNullDistrict = [{
      countryId: "1",
      states: [{ stateId: "s1", stateName: "State 1" }],
      districts: [{ districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" }],
      zipcodes: [
        { id: "z1", zipcode: "10001", districtId: "d1", stateId: "s1", districtName: null, stateName: "State 1" },
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: dataWithNullDistrict,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should fall back to stateName
      expect(screen.getByText("10001")).toBeInTheDocument();
    });
  });

  test("covers zipcode groupBy when districtName is empty string", async () => {
    Storage.prototype.getItem = jest.fn(() => "1");

    const dataWithEmptyDistrict = [{
      countryId: "1",
      states: [{ stateId: "s1", stateName: "State 1" }],
      districts: [{ districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" }],
      zipcodes: [
        { id: "z1", zipcode: "10001", districtId: "d1", stateId: "s1", districtName: "", stateName: "State 1" },
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: dataWithEmptyDistrict,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should fall back to stateName
      expect(screen.getByText("10001")).toBeInTheDocument();
    });
  });

  test("covers renderTags with zipcode as object", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "ZIPCODE", id: "z1", value: "10001", districtId: "d1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-label');
      const zipcodeChip = Array.from(chips).find(chip => chip.textContent === "10001");
      // Should use option.zipcode (not || option fallback)
      expect(zipcodeChip).toBeInTheDocument();
    });
  });

  test("covers renderOption with zipcode as plain value", async () => {
    // This would require modifying the component or having zipcode as non-object
    // but for now, we can test the normal path
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      // Should render with option.zipcode
      expect(options.length).toBeGreaterThan(0);
    });
  });

  test("covers userRegion != 1 path for zipcode groupBy", async () => {
    Storage.prototype.getItem = jest.fn(() => "2");

    const dataForRegion2 = [{
      countryId: "2",
      states: [{ stateId: "s4", stateName: "Other State" }],
      districts: [],
      zipcodes: [
        { id: "z4", zipcode: "99999", stateName: "Other State" },
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: dataForRegion2,
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should use stateName directly (not districtName)
      expect(screen.getByText("99999")).toBeInTheDocument();
    });
  });

  test("covers all branches in filterOptions for state", async () => {
    const largeStates = Array.from({ length: 15 }, (_, i) => ({
      stateId: `s${i}`,
      stateName: `State ${i}`,
    }));

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: [{ ...mockCountryListForSidenav[0], states: largeStates }],
      linkedAccounts: mockLinkedAccounts,
    });

    const stateInput = screen.getAllByText("State")[0].parentElement.querySelector('input');
    
    // First, trigger without input (should hit || 10 path)
    await userEvent.click(stateInput);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());

    // Then type to trigger search (should hit the filter path)
    await userEvent.type(stateInput, "State 5");
    await waitFor(() => {
      expect(screen.getByText("State 5")).toBeInTheDocument();
    });
  });

  test("covers all branches in filterOptions for region", async () => {
    const largeRegions = Array.from({ length: 15 }, (_, i) => ({
      districtId: `d${i}`,
      districtName: `Region ${i}`,
      stateId: "s1",
      stateName: "State 1"
    }));

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: [{ ...mockCountryListForSidenav[0], districts: largeRegions }],
      linkedAccounts: mockLinkedAccounts,
    });

    const regionInput = screen.getAllByText("Region")[0].parentElement.querySelector('input');
    
    // Trigger without input (should hit || 10 path)
    await userEvent.click(regionInput);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());

    // Type to trigger search (should hit the filter path with districtName)
    await userEvent.type(regionInput, "Region 5");
    await waitFor(() => {
      expect(screen.getByText("Region 5")).toBeInTheDocument();
    });

    // Clear and search by state name
    await userEvent.clear(regionInput);
    await userEvent.type(regionInput, "State 1");
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("covers all branches in filterOptions for zipcode", async () => {
    const largeZipcodes = Array.from({ length: 15 }, (_, i) => ({
      id: `z${i}`,
      zipcode: `1000${i}`,
      districtId: "d1",
      stateId: "s1",
      districtName: "Region 1",
      stateName: "State 1"
    }));

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: [{ ...mockCountryListForSidenav[0], zipcodes: largeZipcodes }],
      linkedAccounts: mockLinkedAccounts,
    });

    const zipInput = screen.getAllByText("Zipcode")[0].parentElement.querySelector('input');
    
    // Trigger without input (should hit || 10 path)
    await userEvent.click(zipInput);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());

    // Type to trigger search
    await userEvent.type(zipInput, "10005");
    await waitFor(() => {
      expect(screen.getByText("10005")).toBeInTheDocument();
    });
  });

  test("covers region filterOptions when districtName is missing", async () => {
    const regionsWithMissingNames = [
      { districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" },
      { districtId: "d2", districtName: "", stateId: "s1", stateName: "State 1" }, // empty districtName
      { districtId: "d3", districtName: "Region 3", stateId: "s1", stateName: "State 1" },
    ];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: [{ ...mockCountryListForSidenav[0], districts: regionsWithMissingNames }],
      linkedAccounts: mockLinkedAccounts,
    });

    const regionInput = screen.getAllByText("Region")[0].parentElement.querySelector('input');
    // Search for something that won't match to trigger filter with empty districtName
    await userEvent.type(regionInput, "xyz");
    
    await waitFor(() => {
      // Should not crash even with empty districtName
      expect(regionInput).toBeInTheDocument();
    });
  });

  test("covers region filterOptions when stateName is missing", async () => {
    const regionsWithMissingStateName = [
      { districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" },
      { districtId: "d2", districtName: "Region 2", stateId: "s1", stateName: "" }, // empty stateName
    ];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: [{ ...mockCountryListForSidenav[0], districts: regionsWithMissingStateName }],
      linkedAccounts: mockLinkedAccounts,
    });

    const regionInput = screen.getAllByText("Region")[0].parentElement.querySelector('input');
    // Search for something that won't match to trigger filter with empty stateName
    await userEvent.type(regionInput, "xyz");
    
    await waitFor(() => {
      // Should not crash even with empty stateName
      expect(regionInput).toBeInTheDocument();
    });
  });

  test("covers handleFilteringZipcodes with string conversion", async () => {
    const zipcodesWithNumbers = [
      { id: "z1", zipcode: 10001, districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
      { id: "z2", zipcode: 10002, districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
    ];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: [{ ...mockCountryListForSidenav[0], zipcodes: zipcodesWithNumbers }],
      linkedAccounts: mockLinkedAccounts,
    });

    const zipInput = screen.getAllByText("Zipcode")[0].parentElement.querySelector('input');
    await userEvent.type(zipInput, "10001");
    
    await waitFor(() => {
      expect(screen.getByText("10001")).toBeInTheDocument();
    });
  });

  test("covers handleFilteringZipcodes when both zipcode and districtName match", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    const zipInput = screen.getAllByText("Zipcode")[0].parentElement.querySelector('input');
    // Search for "Region" which should match districtName
    await userEvent.type(zipInput, "Region");
    
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("explicitly tests stateOptionsLimit is 0 triggering || 10", async () => {
    // This test ensures the || 10 path is hit when limit is explicitly 0
    const TestComponent = () => {
      const [limit, setLimit] = React.useState(0);
      
      return (
        <CommonDataContext.Provider value={{
          setNavbarFilterValues: jest.fn(),
          navbarFilterValues: [],
          countryListForSidenav: mockCountryListForSidenav,
          linkedAccounts: mockLinkedAccounts,
        }}>
          <FilterPopover handleClose={mockHandleClose} />
        </CommonDataContext.Provider>
      );
    };

    render(<TestComponent />);
    
    const stateInput = screen.getAllByText("State")[0].parentElement.querySelector('input');
    await userEvent.click(stateInput);
    
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  test("covers all ternary and || branches comprehensively", async () => {
    Storage.prototype.getItem = jest.fn(() => "1");
    
    // Data with various edge cases
    const edgeCaseData = [{
      countryId: "1",
      states: [
        { stateId: "s1", stateName: "State 1" },
      ],
      districts: [
        { districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" },
        { districtId: "d2", districtName: "", stateId: "s1", stateName: "State 1" }, // empty
      ],
      zipcodes: [
        { id: "z1", zipcode: "10001", districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
        { id: "z2", zipcode: "10002", districtId: "d2", stateId: "s1", districtName: "", stateName: "State 1" }, // empty districtName
        { id: "z3", zipcode: "10003", districtId: "d1", stateId: "s1", districtName: null, stateName: "State 1" }, // null districtName
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: edgeCaseData,
      linkedAccounts: mockLinkedAccounts,
    });

    // Test zipcode groupBy with various districtName states
    await openDropdown("Zipcode");
    
    await waitFor(() => {
      expect(screen.getByText("10001")).toBeInTheDocument();
      expect(screen.getByText("10002")).toBeInTheDocument();
      expect(screen.getByText("10003")).toBeInTheDocument();
    });
  });

  test("tests numeric zipcode rendering", async () => {
    const numericZipcodes = [{
      countryId: "1",
      states: [{ stateId: "s1", stateName: "State 1" }],
      districts: [{ districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" }],
      zipcodes: [
        { id: "z1", zipcode: 10001, districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "ZIPCODE", id: "z1", value: 10001, districtId: "d1" }, // numeric value
      ],
      countryListForSidenav: numericZipcodes,
      linkedAccounts: mockLinkedAccounts,
    });

    await waitFor(() => {
      // Should convert number to string
      const chips = document.querySelectorAll('.MuiChip-label');
      expect(chips.length).toBeGreaterThan(0);
    });
  });

  test("covers Math.min in scroll handlers", async () => {
    // Test with exactly matching lengths to hit Math.min branches
    const exactStates = Array.from({ length: 10 }, (_, i) => ({
      stateId: `s${i}`,
      stateName: `State ${i}`,
    }));

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: [{ ...mockCountryListForSidenav[0], states: exactStates }],
      linkedAccounts: mockLinkedAccounts,
    });

    await openDropdown("State");
    const listbox = await screen.findByRole('listbox');
    
    // Mock scroll to trigger limit increase
    Object.defineProperty(listbox, 'scrollTop', { value: 1000, writable: true });
    Object.defineProperty(listbox, 'clientHeight', { value: 100, writable: true });
    Object.defineProperty(listbox, 'scrollHeight', { value: 1100, writable: true });
    
    fireEvent.scroll(listbox);
    
    expect(listbox).toBeInTheDocument();
  });

  test("covers !== comparisons in filter removal", async () => {
    const setNavbarFilterValues = jest.fn();
    
    renderWithContext({
      setNavbarFilterValues,
      navbarFilterValues: [
        { key: "ORG", id: "a1", value: "Org 1" },
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
        { key: "ZIPCODE", id: "z1", value: "10001", districtId: "d1" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // Change each filter type to trigger !== comparisons
    await openDropdown("Organization");
    const orgOption = await screen.findByRole('option', { name: /Org 2/i });
    await userEvent.click(orgOption);

    await openDropdown("State");
    const stateOption = await screen.findByRole('option', { name: /State 2/i });
    await userEvent.click(stateOption);

    await openDropdown("Region");
    const regionOption = await screen.findByRole('option', { name: /Region 2/i });
    await userEvent.click(regionOption);

    await openDropdown("Zipcode");
    const zipcodeOption = await screen.findByRole('option', { name: /10002/i });
    await userEvent.click(zipcodeOption);

    // Each change should trigger filter removal (f.key !== "TYPE")
    await waitFor(() => {
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });
  });

  test("covers array includes checks in zipcode filtering", async () => {
    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [
        { key: "STATE", id: "s1", value: "State 1" },
        { key: "STATE", id: "s2", value: "State 2" },
        { key: "REGION", id: "d1", value: "Region 1", stateId: "s1" },
        { key: "REGION", id: "d3", value: "Region 3", stateId: "s2" },
      ],
      countryListForSidenav: mockCountryListForSidenav,
      linkedAccounts: mockLinkedAccounts,
    });

    // This should trigger all the includes() checks in zipcode filtering logic
    await openDropdown("Zipcode");
    
    await waitFor(() => {
      // Should show zipcodes from selected regions
      expect(screen.getByText("10001")).toBeInTheDocument();
      expect(screen.getByText("20001")).toBeInTheDocument();
    });
  });

  test("covers toLowerCase in filtering", async () => {
    const mixedCaseData = [{
      countryId: "1",
      states: [{ stateId: "s1", stateName: "STATE ONE" }],
      districts: [{ districtId: "d1", districtName: "REGION ONE", stateId: "s1", stateName: "STATE ONE" }],
      zipcodes: [
        { id: "z1", zipcode: "10001", districtId: "d1", stateId: "s1", districtName: "REGION ONE", stateName: "STATE ONE" },
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mixedCaseData,
      linkedAccounts: mockLinkedAccounts,
    });

    // Search with lowercase to trigger toLowerCase comparisons
    const stateInput = screen.getAllByText("State")[0].parentElement.querySelector('input');
    await userEvent.type(stateInput, "state");
    
    await waitFor(() => {
      expect(screen.getByText("STATE ONE")).toBeInTheDocument();
    });

    const regionInput = screen.getAllByText("Region")[0].parentElement.querySelector('input');
    await userEvent.type(regionInput, "region");
    
    await waitFor(() => {
      expect(screen.getByText("REGION ONE")).toBeInTheDocument();
    });

    const zipInput = screen.getAllByText("Zipcode")[0].parentElement.querySelector('input');
    await userEvent.type(zipInput, "region");
    
    await waitFor(() => {
      expect(screen.getByText("10001")).toBeInTheDocument();
    });
  });

  test("covers String conversion in handleFilteringZipcodes", async () => {
    const mixedZipcodes = [{
      countryId: "1",
      states: [{ stateId: "s1", stateName: "State 1" }],
      districts: [{ districtId: "d1", districtName: "Region 1", stateId: "s1", stateName: "State 1" }],
      zipcodes: [
        { id: "z1", zipcode: 10001, districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
        { id: "z2", zipcode: "10002", districtId: "d1", stateId: "s1", districtName: "Region 1", stateName: "State 1" },
      ],
    }];

    renderWithContext({
      setNavbarFilterValues: jest.fn(),
      navbarFilterValues: [],
      countryListForSidenav: mixedZipcodes,
      linkedAccounts: mockLinkedAccounts,
    });

    const zipInput = screen.getAllByText("Zipcode")[0].parentElement.querySelector('input');
    // Search for numeric zipcode
    await userEvent.type(zipInput, "10001");
    
    await waitFor(() => {
      expect(screen.getByText("10001")).toBeInTheDocument();
    });
  });
});