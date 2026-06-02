import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DataGrid, GridPagination } from "@mui/x-data-grid";
import { Box, Chip, CircularProgress } from "@mui/material";
import CustomToolbar from "./CustomToolbar";
import CustomPagination from "./CustomPagination";
import { FilterKeywords } from "../../constants";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const PAGE_SIZE_OPTIONS = [10, 25, 50];
export const TableComponent = ({
  showSlno = true,
  title,
  toolBarExtra,
  toolBarBottom,
  gridToolbarColumnsButton = false,
  hideSearchField = false,
  hideToolbar = true,
  CustomFilterPanel,
  dataLoader = dataLoaderFn,
  columns,
  parentRef,
  defaultSorting,
  filterMandatory = false,
  secondaryTable = false,
  ...props
}) => {
  /////////////Pagination Controlling States ///////////////
  const [isLoading, setIsLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE_OPTIONS[0],
  });
  const [sortModel, setSortModel] = useState(
    defaultSorting
      ? defaultSorting
      : [
          {
            field: columns[0].field,
            sort: "asc",
          },
        ]
  );
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const doSearch = (value) => {
    setSearchValue(value);
    setPaginationModel({
      page: 0,
      pageSize: paginationModel.pageSize,
    });
  };

  const doFilter = (value = {}) => {
    let newValues = { ...value };
    for (let propName in newValues) {
      if (
        Array.isArray(newValues[propName]) &&
        newValues[propName]?.length <= 0
      ) {
        delete newValues[propName];
      }
    }
    setFilterValues(cleanJsObject(newValues));
    setPaginationModel({
      page: 0,
      pageSize: paginationModel.pageSize,
    });
  };

  const doSort = (value) => {
    let newSortModel = [];
    if (value && typeof value === "string") {
      const [field, sort] = value.split(":");
      if (["1", "0"].includes(String(sort))) {
        newSortModel = [
          {
            field,
            sort: String(sort) === "1" ? "ASC" : "DESC",
          },
        ];
      }
    }
    setSortModel(newSortModel);
  };

  const handleSortModelChange = (value) => {
    setSortModel(value);
  };

  const mapFilterValues = (originalObject) => {
    const mappedObject = {};
    for (const key in originalObject) {
      if (Array.isArray(originalObject[key])) {
        mappedObject[key] =
          originalObject[key].map((obj) => obj.id ?? obj).join(",") ||
          originalObject[key];
      } else mappedObject[key] = originalObject[key].id ?? originalObject[key];
    }
    return mappedObject;
  };

  /////////API TRIGERING///////////////////////
  const getDataLoader = useCallback(async () => {
    setIsLoading(true);
    try {
      const sortValue =
        Array.isArray(sortModel) && sortModel.length > 0
          ? [
              sortModel?.[0].field,
              sortModel?.[0].sort === "asc" ? "ASC" : "DESC",
            ]
          : [];

      const res = await dataLoader({
        // take: paginationModel.pageSize,
        // skip: paginationModel.page * paginationModel.pageSize,
        rowCount: paginationModel.pageSize,
        pageNumber: paginationModel.page + 1,
        globalSearchQuery: searchValue?.trim(),
        filter: mapFilterValues(filterValues),
        orderByField: sortValue.length ? [sortValue] : undefined,
        // sort: sortValue,
      });
      if (Array.isArray(res?.items))
        setRows((prev) =>
          Object.is(JSON.stringify(prev), JSON.stringify(res.items))
            ? prev
            : res.items
        );
      setRowCount(res?.meta?.totalCount || res?.items?.length);
    } catch (error) {
      console.error("API_ERROR 💥", error);
    }
    setIsLoading(false);
  }, [paginationModel, searchValue, filterValues, sortModel]);

  useEffect(() => {
    if (parentRef)
      parentRef.current = { getDataLoader, doFilter, doSort, filterValues };
  }, [getDataLoader, doFilter]);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      getDataLoader();
    }, 100);
    return () => {
      clearTimeout(timeOut);
    };
  }, [getDataLoader]);
  //////////////////////////////////////////////////

  /////// TO add Serial Number /////////////////////
  const updatedColumns = useMemo(() => {
    if (!showSlno) return columns;
    return [
      {
        field: "id",
        headerName: "Sl. No.",
        filterable: false,
        sortable: false,
        renderCell: (index) => {
          return (
            paginationModel.page * paginationModel.pageSize +
              (1 + index.api.getAllRowIds().indexOf(index?.id)) || "#"
          );
        },
        minWidth: 70,
        width: 70,
      },
    ].concat(columns);
  }, [columns, paginationModel]);

  /////////////////////////////////////////////
  const getTableStyleRows = (rowdata) => {
    //if the asset is inactive then the row need to highlight in red color
    if (rowdata.row.active !== undefined && !rowdata.row.active) {
      return "inactive-row";
    } else if (rowdata.indexRelativeToCurrentPage % 2 === 0) {
      return "Mui-even";
    } else {
      return "Mui-odd";
    }
  };

  return (
    <Box width={1} height={1}>
      {!hideToolbar && (
        <CustomToolbar
          id="toolbar"
          gridToolbarColumnsButton={gridToolbarColumnsButton}
          title={title}
          toolBarExtra={toolBarExtra}
          toolBarBottom={toolBarBottom}
          hideSearchField={hideSearchField}
          CustomFilterPanel={
            typeof CustomFilterPanel === "function"
              ? (filterProps) =>
                  CustomFilterPanel({
                    ...filterProps,
                    filterValues: filterValues,
                    applyFilter: doFilter,
                    clearFilter: () => doFilter({}),
                  })
              : undefined
          }
          isFilterActive={!!Object.keys(cleanJsObject(filterValues))?.length}
          doSearch={doSearch}
          searchValue={searchValue}
          clearFilter={() => doFilter({})}
        />
      )}
      <Box display="flex" flexWrap="wrap" gap={2} my={2}>
        {Object.entries(filterValues)?.map((obj, index) => (
          <Chip
            key={index}
            sx={{ backgroundColor: "#172b4d", color: "#ffffff" }}
            label={`${FilterKeywords?.[obj[0]]}: ${
              FilterKeywords?.[obj[1]] || obj[1]?.value || obj[1]
            }`}
            onDelete={() => {
              let filters = filterValues;
              delete filters[obj[0]];
              doFilter(filters);
            }}
            deleteIcon={
              obj?.[1]?.filterMandatory ? (
                <></>
              ) : (
                <CloseIcon
                  sx={{
                    color: "#ffffff !important",
                    fontSize: "16px !important",
                  }}
                />
              )
            }
          />
        ))}
      </Box>

      <DataGrid
        id="datagrid"
        rowHeight={73}
        sx={{
          borderRadius: 2 / 8,
          mx: secondaryTable ? -3 : undefined,
          borderTop: secondaryTable ? "none" : undefined,
          borderLeft: secondaryTable ? "none" : undefined,
          borderRight: secondaryTable ? "none" : undefined,
          "& .Mui-no-cell-border:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            // textTransform: "capitalize",
            fontWeight: 600,
            fontSize: "1rem",
          },
          "& .MuiDataGrid-virtualScroller": {
            // textTransform: "capitalize",
            minHeight: "50px",
            overflow: "auto",
          },
          " .MuiCircularProgress-root": {
            width: "30px !important",
            height: "30px !important",
          },
          " .MuiDataGrid-overlayWrapperInner": {
            height: "40px !important",
          },
          // Disable row hover color change
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "transparent", // Set hover background color to transparent
          },
          // Ensure row focus style does not affect the background color
          "& .MuiDataGrid-row:focus": {
            backgroundColor: "transparent", // Set focus background color to transparent
          },
          // "& .MuiBox-root": {
          //   // textTransform: "capitalize",
          //   // minHeight: "50px",
          //   overflow: "auto",
          // },
          // minHeight: 200,
        }}
        columns={updatedColumns}
        rows={rows}
        rowCount={rowCount || 0}
        stickyHeader
        /////Server side pagination//////
        // pagination={!disablePagination}
        paginationMode="server"
        loading={isLoading}
        // loading={false}
        autoHeight={false} // Ensure autoHeight is set to false
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        ////////////////////////////////////////
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        slots={{
          pagination: Pagination,
          columnSortedAscendingIcon: ColumnSortedAscendingIcon,
          columnSortedDescendingIcon: ColumnSortedDescendingIcon,
        }}
        disableColumnMenu
        getRowClassName={(params) => getTableStyleRows(params)}
        disableRowSelectionOnClick
        localeText={{ noRowsLabel: "No results to show" }}
        components={{
          LoadingOverlay: loadingOverlay,
        }}
        hideHeader
        {...props}
      />
    </Box>
  );
};

export default TableComponent;

const Pagination = (props) => {
  return <GridPagination ActionsComponent={CustomPagination} {...props} />;
};

const ColumnSortedAscendingIcon = () => {
  return (
    <>
      {/* <Box
        id="ColumnSortedAscendingIcon"
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <ExpandLessIcon sx={{ height: "1rem" }} />
        <ExpandMoreIcon sx={{ height: "1rem", opacity: 0.5 }} />

      </Box> */}
      <ArrowUpwardIcon sx={{ height: "1rem" }} />
    </>
  );
};
const ColumnSortedDescendingIcon = () => {
  return (
    <>
      {/* <Box
        id="ColumnSortedDescendingIcon"
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <ExpandLessIcon sx={{ height: "1rem", opacity: 0.5 }} />
        <ExpandMoreIcon sx={{ height: "1rem" }} />
      </Box> */}
      <ArrowDownwardIcon sx={{ height: "1rem" }} />
    </>
  );
};
/**
 * Data table data loader
 * @param {{skip:number,take:number,keyword:string,filter,sort}} query
 * @returns Promise({items:[],meta:{totalItems:number}})
 */
const dataLoaderFn = async () => {
  return {
    items: [],
    meta: { totalItems: PAGE_SIZE_OPTIONS[0] },
  };
};
export const cleanJsObject = (obj, cleanConditions = [null, undefined, ""]) => {
  for (let propName in obj) {
    if (cleanConditions.includes(obj[propName])) {
      delete obj[propName];
    }
  }
  return obj;
};

const loadingOverlay = () => <CircularProgress size={18} />;
