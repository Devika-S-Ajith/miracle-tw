import React, { useCallback, useReducer, useState, useMemo, memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  TextField,
  Pagination,
  TableSortLabel,
  IconButton,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Stack,
  Grid,
  Chip,
  Button,
} from "@mui/material";
import { Box } from "@mui/system";
import { useDebouncedCallback } from "use-debounce";
import Heading from "../../../../components/Heading";
import SmallText from "../../../../components/SmallText/SmallText";
import ErrorWithReload from "./ErrorWithReload";
import NoDataFoundText from "./NoDataFoundText";
import ListPaging from "../../../../components/UserComponents/ListPaging";
import CloseIcon from "@mui/icons-material/Close";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import BodyText from "../../../../components/BodyText/BodyText";
import SearchIcon from '@mui/icons-material/Search';
// Constants
const SEARCH_MIN_LENGTH = 3;
const DEBOUNCE_DELAY = 800;
const DEFAULT_ROW_COUNT = 10;

// Consolidated state reducer
const tableStateReducer = (state, action) => {
  switch (action.type) {
    case "SET_SORT":
      const isSameColumn = state.sortState.orderBy === action.column;
      return {
        ...state,
        sortState: {
          orderBy: action.column,
          sortOrder:
            isSameColumn && state.sortState.sortOrder === "asc"
              ? "desc"
              : "asc",
        },
        page: 1,
      };
    case "SET_SEARCH":
      return {
        ...state,
        searchQuery: action.value,
        page: 1,
      };
    case "SET_PAGE":
      return {
        ...state,
        page: action.page,
      };
    case "SET_ROW_COUNT":
      return {
        ...state,
        rowCount: action.value,
        page: 1,
      };
    default:
      return state;
  }
};

// Memoized skeleton rows component
const SkeletonRows = memo(({ count, columnCount }) => {
  const rows = useMemo(
    () =>
      Array.from({ length: count }, (_, idx) => (
        <TableRow key={idx}>
          {Array.from({ length: columnCount }, (_, cidx) => (
            <TableCell key={cidx}>
              <Skeleton variant="rectangular" height={28} />
            </TableCell>
          ))}
        </TableRow>
      )),
    [count, columnCount]
  );
  return <>{rows}</>;
});

// Memoized table row component
const TableRowMemo = memo(({ row, columns }) => {
  const [expanded, setExpanded] = useState(false);

  // If row.expandable is true, show expand/collapse button
  const isExpandable = true;

  return (
    <>
      <TableRow>
        {columns.map((col, idx) =>
            <TableCell key={col.id}>
              {col.render ? col.render(row, row[col.id], expanded, setExpanded) : row[col.id]}
            </TableCell>
        )}
      </TableRow>
      {isExpandable && expanded && (
        <TableRow>
          <TableCell
            colSpan={columns.length + 1}
            sx={{ background: "#f9f9f9" }}
          >
            {row.expandedContent}
          </TableCell>
        </TableRow>
      )}
    </>
  );
});

// Optimized table body renderer
const renderTableBody = (tableData, columns) => {
  if (!tableData || tableData.length === 0) return [];
  return tableData.map((row) => (
    <TableRowMemo key={row.id} row={row} columns={columns} />
  ));
};

// Memoized empty state component
const EmptyStateRow = memo(
  ({ columnCount, apiError, onReload, currentPageFilters }) => {
    const handleReload = useCallback(() => {
      onReload?.(currentPageFilters);
    }, [onReload, currentPageFilters]);

    return (
      <TableRow>
        <TableCell
          colSpan={columnCount}
          align="center"
          sx={{
            py: 6,
            borderBottom: "none",
            background: "transparent",
            height: 200,
            textAlign: "center",
            verticalAlign: "middle",
          }}
        >
          {apiError ? (
            <ErrorWithReload onReload={handleReload} />
          ) : (
            <NoDataFoundText />
          )}
        </TableCell>
      </TableRow>
    );
  }
);

// Memoized table header component
const TableHeaderMemo = memo(({ columns, sortState, onSort, t, boldHeaders, tableData }) => {
    return (
        <TableHead>
            <TableRow sx={{ alignItems: 'stretch', height: 48 }}>
                {columns.map((col, idx) => (
                    <TableCell
                        key={col.id}
                        onClick={col.enableSorting ? () => onSort(col.id) : undefined}
                        sx={{
                            cursor: col.enableSorting ? 'pointer' : 'default',
                            userSelect: 'none',
                            fontWeight: sortState.orderBy === col.id ? 'bold' : 'normal',
                            minWidth: col.minWidth || 60,
                            maxWidth: col.maxWidth || 'none',
                            p: 0,
                            position: 'relative',
                           
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                height: '48px',
                                px: 2,
                                gap: 1,
                               
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Tooltip 
                                    title={t(`common:tableColumn.${col.label}`, col.label)}
                                    placement="top"
                                    enterDelay={500}
                                    disableHoverListener={false}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight={boldHeaders || sortState.orderBy === col.id ? "bold" : "normal"}
                                        component="span" // Changed to span to work better with flex layout
                                        sx={{ 
                                            whiteSpace: 'nowrap', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis',
                                            display: 'block',
                                        }}
                                    >
                                        {t(`common:tableColumn.${col.label}`, col.label)}
                                    </Typography>
                                </Tooltip>
                            </Box>
                            
                            {/* Fixed sort icon - now properly integrated */}
                            {col.enableSorting && (
                                <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                    <TableSortLabel
                                        active={sortState.orderBy === col.id}
                                        direction={sortState.orderBy === col.id ? sortState.sortOrder : 'asc'}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent double firing
                                            onSort(col.id);
                                        }}
                                        sx={{
                                            '& .MuiTableSortLabel-icon': {
                                                opacity: sortState.orderBy === col.id ? 1 : 0,
                                                transition: 'opacity 0.2s'
                                            },
                                            // Remove the default margin that TableSortLabel adds
                                            '&.MuiTableSortLabel-root': {
                                                flexDirection: 'row',
                                                justifyContent: 'center'
                                            }
                                        }}
                                    >
                                        {/* Empty content since we show text separately */}
                                    </TableSortLabel>
                                </Box>
                            )}
                            
                        </Box>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
});

TableHeaderMemo.displayName = "TableHeaderMemo";

// Memoized search component
const SearchField = memo(
  ({ searchQuery, onSearchChange, onKeyPress, t, searchPlaceholder }) => (
    <CardContent
      sx={{
        pt: 0,
        pb: 0,
        width: {
          xs: "100%",
          sm: "100%",
          md: "100%",
          lg: "484px",
        },
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder={t(`common:common.${searchPlaceholder}`, searchPlaceholder)}
        value={searchQuery}
        onChange={onSearchChange}
        onKeyDown={onKeyPress}
        InputProps={{
          style: {
            fontSize: 14,
          },
          startAdornment: <SearchIcon style={{ color: "#888", marginRight: 4, fontSize: "20px" }} />,
          endAdornment: searchQuery && (
            <CloseIcon
              onClick={() => onSearchChange({ target: { value: "" } })}
              style={{ cursor: "pointer", color: "#888" }}
              fontSize="small"
            />
          ),
        }}
      />
    </CardContent>
  )
);

const PaginationSection = memo(
  ({
    rowCount,
    onRowCountChange,
    rowCountOptions, 
    page,
    totalPageCount,
    onPageChange,
    totalItems = 0,
    loading = false,
  }) => {
    // Calculate start and end item numbers
    const start = totalItems === 0 ? 0 : rowCount * (page - 1) + 1;
    const end = Math.min(page * rowCount, totalItems);

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
        p={1}
        m={1}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Rows per page:
          </Typography>
          <ListPaging
            rowCount={rowCount}
            handleRowCountChange={onRowCountChange}
            rowCountOptions={rowCountOptions}
          />
          <Typography variant="body2" sx={{ ml: 2 }}>
            {loading ? (
              <Skeleton
                variant="rectangular"
                width={60}
                height={32}
                sx={{ borderRadius: 1 }}
              />
            ) : (
              `${start} - ${end} of ${totalItems}`
            )}
          </Typography>
        </Box>
        <Box sx={{ ml: 2 }}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              width={160}
              height={32}
              sx={{ borderRadius: 1 }}
            />
          ) : (
            <Pagination
              onChange={onPageChange}
              page={Number(page)}
              siblingCount={0}
              boundaryCount={1}
              count={Number(totalPageCount)}
              shape="rounded"
            />
          )}
        </Box>
      </Box>
    );
  }
);

const ReusableTrendTable = ({
  columns,
  title,
  subheader,
  cardSx,
  tableSx,
  searchable = false,
  filterable = false,
  apiError = false,
  loading = false,
  enablePagination = false,
  skeltonRowcount = 10,
  totalPageCount = 1,
  totalItems = 0,
  onReload,
  tableData = [],
  t,
  defaultSortField = null,
  defaultSortFieldOrder = null,
  searchPlaceholder = "Search...",
  toolBar = null,
  boldHeaders = true,
  filterComponent = null,
  appliedFiltersChipArray,
  applyFilter,
  handleChipDelete,
  clearFilter,
  tableExtraButtons,
  cancelFilter,
  rowCountOptions
}) => {
  // Table state
  const [state, dispatch] = useReducer(tableStateReducer, {
    searchQuery: "",
    rowCount: DEFAULT_ROW_COUNT,
    sortState: { orderBy: defaultSortField, sortOrder: defaultSortFieldOrder },
    page: 1,
  });

  // Column selector
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedColumnIds, setSelectedColumnIds] = useState(() =>
    columns.map((col) => col.id)
  );

  // filter selector
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const handleFilterClick = (target) => {
    setFilterAnchorEl(target);
    setOpenFilter((previousOpen) => !previousOpen);
  }
  // Visible columns (in original order)
  const visibleColumns = useMemo(
    () => columns.filter((col) => selectedColumnIds.includes(col.id)),
    [columns, selectedColumnIds]
  );

  const buildFilters = useCallback(
    (overrides = {}) => ({
      search: overrides.search ?? state.searchQuery,
      sort: overrides.sort ?? state.sortState.orderBy,
      order: overrides.order ?? state.sortState.sortOrder,
      page: overrides.page ?? state.page,
      rowCount: overrides.rowCount ?? state.rowCount,
    }),
    [
      state.searchQuery,
      state.sortState.orderBy,
      state.sortState.sortOrder,
      state.page,
      state.rowCount,
    ]
  );

  const triggerReload = useCallback(
    (filters) => {
      if (onReload) onReload(filters);
    },
    [onReload]
  );

  const handleSort = useCallback(
    (colId) => {
      dispatch({ type: "SET_SORT", column: colId });
      const newSortOrder =
        state.sortState.orderBy === colId && state.sortState.sortOrder === "asc"
          ? "desc"
          : "asc";
      const filters = buildFilters({
        sort: colId,
        order: newSortOrder,
        page: 1,
      });
      triggerReload(filters);
    },
    [
      state.sortState.orderBy,
      state.sortState.sortOrder,
      buildFilters,
      triggerReload,
    ]
  );

  const handleRowCountChange = useCallback(
    (e) => {
      const newRowCount = e.target.value;
      dispatch({ type: "SET_ROW_COUNT", value: newRowCount });
      const filters = buildFilters({
        rowCount: newRowCount,
        page: 1
       
      });
      triggerReload(filters);
    },
    [buildFilters, triggerReload]
  );

  const handlePageChange = useCallback(
    (_, newPage) => {
      dispatch({ type: "SET_PAGE", page: newPage });
      const filters = buildFilters({ page: newPage });
      triggerReload(filters);
    },
    [buildFilters, triggerReload]
  );

  const handleQueryChange = useCallback(
    (event, forceSearch = false) => {
      const value = event.target.value;
      dispatch({ type: "SET_SEARCH", value });
      const shouldSearch =
        !value.trim() ||
        value.trim().length >= SEARCH_MIN_LENGTH ||
        forceSearch;
      if (shouldSearch) {
        const filters = buildFilters({
          search: value,
          page: 1,
        });
        triggerReload(filters);
      }
    },
    [buildFilters, triggerReload]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        const inputValue = e.target.value.trim();
        if (inputValue.length > 0 && inputValue.length < SEARCH_MIN_LENGTH) {
          handleQueryChange(e, true);
        }
      }
    },
    [handleQueryChange]
  );

  // Debounced search handler
  const debouncedHandleSearch = useDebouncedCallback(
    handleQueryChange,
    DEBOUNCE_DELAY
  );

  const handleSearchInputChange = useCallback(
    (e) => {
      dispatch({ type: "SET_SEARCH", value: e.target.value });
      debouncedHandleSearch(e);
    },
    [debouncedHandleSearch]
  );

  // Table body: only render visible columns!
  const tableBodyContent = useMemo(() => {
    if (loading) {
      return (
        <SkeletonRows
          count={skeltonRowcount}
          columnCount={visibleColumns.length}
        />
      );
    }
    const body = renderTableBody(tableData, visibleColumns);
    const isEmpty = !body || (Array.isArray(body) && body.length === 0);
    if (isEmpty) {
      return (
        <EmptyStateRow
          columnCount={visibleColumns.length}
          apiError={apiError}
          onReload={onReload}
          currentPageFilters={null}
        />
      );
    }
    return body;
  }, [loading, tableData, visibleColumns, skeltonRowcount, apiError, onReload]);

  // Memoized pagination visibility
  const shouldShowPagination = useMemo(() => {
    if (!enablePagination) return false;
    return Array.isArray(tableData) && tableData.length > 0;
  }, [enablePagination, tableData]);

  // Column selector handlers
  const handleOpenColumns = (event) => setAnchorEl(event.currentTarget);
  const handleCloseColumns = () => setAnchorEl(null);

  const handleToggleColumn = (columnId) => {
    setSelectedColumnIds((prev) => {
      const isSelected = prev.includes(columnId);
      if (isSelected && prev.length === 1) return prev; // Don't let user hide all columns!
      if (isSelected) return prev.filter((id) => id !== columnId);
      // Insert while preserving original column order
      const newSelected = columns
        .map((col) =>
          col.id === columnId || prev.includes(col.id) ? col.id : null
        )
        .filter(Boolean);
      return newSelected;
    });
  };

  // Memoized card header with right-aligned icon
  const cardHeader = useMemo(() => {
    if (!title) return null;
    return (
      <CardHeader
        title={<Heading heading={t(`common:infoCard.${title}`, title)} />}
        subheader={
          subheader && (
            <SmallText value={t(`common:infoCard.${subheader}`, subheader)} />
          )
        }
        action={
          false && (
            <IconButton onClick={handleOpenColumns}>
              <ViewColumnIcon />
            </IconButton>
          )
        }
      />
    );
  }, [title, subheader, t]);

  // Styles
  const cardStyles = useMemo(
    () => ({
      border: "1px solid #D6DBDE",
      height: "100%",
      ...cardSx,
    }),
    [cardSx]
  );

  const tableStyles = useMemo(
    () => ({
      minWidth: 650,
      ...tableSx,
    }),
    [tableSx]
  );
const resolvedTableExtraButtons = useMemo(() => {
    if (!tableExtraButtons) return null;
    if (typeof tableExtraButtons === "function") {
      return tableExtraButtons({
        query: state.searchQuery,
        appliedFiltersChipArray,
        currentTableFilters: buildFilters(),
      });
    }
    return tableExtraButtons;
  }, [tableExtraButtons, state.searchQuery, appliedFiltersChipArray, buildFilters]);
  
  return (
    <Card elevation={0} sx={cardStyles}>
      <Box display="flex" px gap={2} alignItems="center">
        {cardHeader}
        {toolBar}
      </Box>
      {title && <Divider sx={{ mx: 2, mb: 2, borderBottomWidth: 2 }} />}
      <Stack direction="row" alignItems="center" mt={!title && 2}>
        {searchable && (
          <SearchField
            searchQuery={state.searchQuery}
            onSearchChange={handleSearchInputChange}
            onKeyPress={handleKeyPress}
            searchPlaceholder={searchPlaceholder}
            t={t}
          />
        )}
        {filterable && (
          <>
            <IconButton
              aria-describedby="filter-icon"
              size="small"
              onClick={(e) => handleFilterClick(e.currentTarget)}
            >
              <Tooltip title={t("common:common.Filter", "Filter")}>
                <Box>
                  <FilterAltIcon style={{ color: "#F37123", fontSize: "24px" }} />
                  {/* Only show dot if at least one key has a non-empty array */}
                  {appliedFiltersChipArray &&
                    Object.entries(appliedFiltersChipArray).some(
                      ([, arr]) => Array.isArray(arr) && arr.length > 0
                    ) && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 8,
                          height: 8,
                          bgcolor: "#222",
                          borderRadius: "50%",
                          zIndex: 2,
                        }}
                      />
                    )}
                </Box>
              </Tooltip>
            </IconButton>
            <Popover
              id="filter-icon"
              open={openFilter}
              
              // disable outside click to close
              disableEnforceFocus
              disableAutoFocus
              disableRestoreFocus
              hideBackdrop

              anchorEl={filterAnchorEl}
              onClose={() => {
                setFilterAnchorEl(null);
                setOpenFilter(false);
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              {
                <Stack p={2} gap={2} minWidth={200}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <BodyText value={t("common:common.Filters", "Filters")} />
                  <IconButton
                    size="small"
                    onClick={() => {
                      cancelFilter();
                      setFilterAnchorEl(null);
                      setOpenFilter(false);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  </Stack>
                  <Divider sx={{ mx: -2 }} />
                  {filterComponent}
                  <Divider sx={{ mx: -2 }} />
                  <Grid container alignItems="center" spacing={2} >
                    <Grid item xs={6}>
                      <Button fullWidth variant="outlined" onClick={clearFilter}>
                        {t("common:infoCard.Clear", "Clear")}
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button fullWidth variant="contained" onClick={() => { applyFilter({ search: state.searchQuery, rowCount: state.rowCount }); setOpenFilter(false); }} >
                        {t("common:infoCard.Apply", "Apply")}
                      </Button>
                    </Grid>
                  </Grid>
                </Stack>
              }
            </Popover>
          </>
        )}
        {resolvedTableExtraButtons}        
      </Stack>

      {appliedFiltersChipArray && <Stack direction="row" gap={1} flexWrap="wrap" mx={2} mt={2}>
        {appliedFiltersChipArray && Object.entries(appliedFiltersChipArray)?.map(([key, values]) =>
            values.map((item) => (
              <Chip
                key={`${key}-${item.value}`}
                // label={`${item.key}: ${item.label}`}
                label={`${t(`common:infoCard.${item.key}`)}: ${t(`common:infoCard.${item.label}`, item.label)}`}
                sx={{ mb: 1, backgroundColor: "#34475D", color: "#fff" }}
                deleteIcon={<CloseIcon style={{ color: "#fff", fontSize: "16px" }} />}
                onDelete={() => handleChipDelete(key, item.value, { search: state.searchQuery, rowCount: state.rowCount })}
              />
            ))
        )}
      </Stack>}
      <CardContent sx={{ py: 0, width: "100%" }}>
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Table sx={tableStyles}>
            {(() => {
              const hasData = Array.isArray(tableData) && tableData.length > 0;
              if (hasData) {
                return (
                  <TableHeaderMemo
                    columns={visibleColumns}
                    sortState={state.sortState}
                    onSort={handleSort}
                    t={t}
                    tableData={tableData}
                    boldHeaders={boldHeaders}
                  />
                );
              }
              return null;
            })()}
            <TableBody>{tableBodyContent}</TableBody>
          </Table>
        </Box>

        {shouldShowPagination && (
          <PaginationSection
            rowCount={state.rowCount}
            onRowCountChange={handleRowCountChange}
            page={state.page}
            totalPageCount={totalPageCount}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            loading={loading}
            rowCountOptions={rowCountOptions}
          />
        )}
      </CardContent>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseColumns}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box p={2}>
          <FormGroup>
            {columns.map((col) => {
              const isChecked = selectedColumnIds.includes(col.id);
              return (
                <FormControlLabel
                  key={col.id}
                  control={
                    <Checkbox
                      checked={isChecked}
                      disabled={
                        (isChecked && selectedColumnIds.length === 1) ||
                        !col.enableColumnSelector
                      }
                      onChange={() => handleToggleColumn(col.id)}
                    />
                  }
                  label={col.label}
                />
              );
            })}
          </FormGroup>
        </Box>
      </Popover>
    </Card>
  );
};

export default memo(ReusableTrendTable);
