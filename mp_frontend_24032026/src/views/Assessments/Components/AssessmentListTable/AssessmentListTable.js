import { useState, useEffect, useContext, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  InputAdornment,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableSortLabel,
  TableHead,
  Pagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { FilterList as FilterListIcon, Clear as ClearIcon, FileUpload as FileUploadIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { useTranslation } from "react-i18next";
import ArrowRightIcon from "../../../../assets/icons/ArrowRight";
import SearchIcon from "../../../../assets/icons/Search";
import Check from "../../../../assets/icons/Check";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import useMounted from "../../../../common/hooks/UseMounted";
import APIS from "../../../../common/hooks/UseApiCalls";
import AutoCompleteDropdownToFilter from "../../../../components/UserComponents/AutoCompleteDropdownToFilter";
import {
  ChildIconBlack,
  FamilyIconBlack,
} from "../../../../assets/icons/SideBarIcons";
import { GenerateFileName, utcToLocalDate,formattedDate } from "../../../../helpers/helperFunction";
import { useDebouncedCallback } from "use-debounce";

const columnHeaders = [
  {
    label: "assessment.Assessment for",
    value: "childFirstName",
  },
  {
    label: "common.Case Worker",
    value: "caseWorkerName",
  },
  {
    label: "common.Date of Assessment",
    value: "dateOfAssessment",
  },
  {
    label: "common.Submitted Date",
    value: "",
  },
  {
    label: "common.Score",
    value: "",
  },
  {
    label: "common.Actions",
    value: "",
  },
];

const AssessmentListTable = (props) => {
  const { t } = useTranslation(["common"]);
  const sortOptions = [
    {
      label: t("common:assessment.None"),
      id: "none",
    },

    {
      label: t("common:assessment.Case Worker Name"),
      id: "caseWorkerName",
    },
    {
      label: t("common:assessment.Child Name"),
      id: "childFirstName",
    },
    {
      label: t("common:assessment.Date of Assessment"),
      id: "dateOfAssessment",
    },
    {
      label: t("common:assessment.Name of Child Care Institution"),
      id: "organizationName",
    },
  ];

  const statusOptions = [
    {
      label: t("common:common.All"),
      id: "All",
    },
    {
      label: t("common:common.Completed"),
      id: "Completed",
    },
    {
      label: t("common:common.In Progress"),
      id: "Not Completed",
    },
  ];
  const {
    assessments,
    getAssessmentList,
    loading,
    savePageData,
    pageCount,
    pageData,
    setPageData,
    ...other
  } = props;
  const [selectedAssessments] = useState([]);
  const { signedInOrgName, userIdData } =
    useContext(CommonDataContext);
  const mounted = useMounted();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState(sortOptions[3].id);
  const [sortOrder, setSortOrder] = useState("ASC");
  const [orgOptions, setOrgOptions] = useState([
    { id: "0", accountName: "All" },
  ]);
  const [statusFilter, setStatusFilter] = useState(
    statusOptions && statusOptions[0].id
  );
  const [anchorEl, setAnchorEl] = useState();
  const [openOptions, setOpenOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  let singleClickTimer = "";
  let clickCount = 0;

  const getOrgList = useCallback(async () => {
    const payload = {
      rowCount: "1000",
      pageNumber: "1",
      globalSearchQuery: "",
      accountStatus: "",
      accountFilter: "",
      orderByField: [["accountName", "ASC"]],
      addressLine1Like: "",
    };
    payload.TWCountryId = localStorage.getItem("userRegion");
    try {
      const data = await APIS.OrganizationList(payload);
      if (data && data.data && data.data.data.length) {
        setOrgOptions([{ id: "", accountName: "All" }, ...data.data.data]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  useEffect(() => {
    setPagedata();
    getOrgList();
  }, []);

  const getAssessmentListWithPayload = (overrides = {}) => {
    const updatedPayload = {
      rowCount:10,
      pageNumber: "1",
      globalSearchQuery: query,
      isComplete: statusFilter == "All" ? "" : statusFilter,
      orderByField: [[sort, sortOrder]],
      ...overrides,
    };
    getAssessmentList(updatedPayload);
  };

  const handleQueryChange = (event, flag = false) => {
    const value = event.target.value;
    setQuery(value);
    setPage(1);
    if (!value.trim()) {
      getAssessmentListWithPayload({ globalSearchQuery: "" });
    } else if (value.trim().length > 2 || flag) {
      getAssessmentListWithPayload({ globalSearchQuery: value });
    }
  }

   const debouncedHandleSearch = useDebouncedCallback(
      (event) => {
        handleQueryChange(event);
      },
      800
    );

  const handleSingleClickColumn = (value) => {
    const newSortOrder = sortOrder === "ASC" ? "DESC" : "ASC";
    setSort(value);
    setSortOrder(newSortOrder);
    setPage(1);
    getAssessmentListWithPayload({ orderByField: [[value, newSortOrder]] });
  };

  const handleDblClickColumn = () => {
    setSort("dateOfAssessment");
    setSortOrder("ASC");
    setPage(1);
    getAssessmentListWithPayload({ orderByField: [["dateOfAssessment", "ASC"]] });
  };

  const handleClickColumn = (value) => {
    clickCount++;
    if (clickCount === 1) {
      singleClickTimer = setTimeout(function () {
        clickCount = 0;
        handleSingleClickColumn(value);
      }, 300);
    } else if (clickCount === 2) {
      clearTimeout(singleClickTimer);
      clickCount = 0;
      handleDblClickColumn();
    }
  };

  const loadDefaultList = () => {
    setQuery("");
    getAssessmentListWithPayload({
      globalSearchQuery: "",
    });
  };

  useEffect(() => {
    setPagedata();
    return () => {};
  }, [pageData]);

  useEffect(() => {
    handleViewChange();
  }, [page, query, sort, sortOrder, statusFilter, open]);

  const setPagedata = () => {
    setPage(pageData.page);
    setQuery(pageData.query);
    setSort(pageData.sort);
    setOpen(pageData.isOpen);
    setSortOrder(pageData.sortOrder)
    setStatusFilter(pageData.assessmentStatus);
  };

  const handleViewChange = () => {
    let pageObject = {
      page: page,
      query: query,
      sort: sort,
      order: sortOrder,
      isComplete: statusFilter,
    };
    savePageData(pageObject);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    getAssessmentListWithPayload({ pageNumber: value });
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
    getAssessmentListWithPayload({ isComplete: value == "All" ? "" : value });
  };
 
  const handleFilterChange = () => {
    if (open) {
      setStatusFilter(null);
      getAssessmentListWithPayload({
        isComplete:"",
      });
    }
    setOpen(!open);
  };


  const exportAssessments = async (type) => {
    setIsExporting(true);
    try {
      const res = await APIS.exportAssessments({
        type: type,
        isComplete: statusFilter,
        accountFilter: localStorage.getItem("orgId"),
        globalSearchQuery: query,
      });
      const linkSource = `data:application/xlsx;base64,${res.data}`;
      const downloadLink = document.createElement("a");
      const fileName = GenerateFileName({
        signedInOrgName,
        userIdData,
        module: `${type === "FAMILY" ? "Family" : "Children"}_Assessments`,
      });
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.target = "_blank";
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setIsExporting(false);
    } catch (error) {
      setIsExporting(false);
    }
  };

  return (
    <Card {...other}>
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          pt: 2,
          //m: -1,
          p: 2,
        }}
      >
        <Box
          sx={{
            m: 1,
            maxWidth: "100%",
            width: 500,
          }}
        >
          <TextField
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query.length > 0 && (
                <IconButton color="inherit" onClick={() => loadDefaultList()}>
                  <ClearIcon />
                </IconButton>
              ),
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              debouncedHandleSearch(e);
            }}
            placeholder={t("common:assessment.Search Assessment")}
            value={query}
            variant="outlined"
          />
        </Box>
        <Box
          sx={{
            mr: 4,
            width: 20,
          }}
        >
          <IconButton color="inherit" onClick={() => handleFilterChange()}>
            <FilterListIcon />
          </IconButton>
        </Box>
        {assessments?.length > 0 && <Box sx={{ flexGrow: 1, textAlign: "right" }}>
          <LoadingButton  
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setOpenOptions(true);
            }}
            loading={isExporting}
            loadingPosition="start"
            startIcon={<FileUploadIcon />} color="primary" variant="contained">
              {t('common:common.Export')}
            </LoadingButton>
          <Menu
            anchorEl={anchorEl}
            open={openOptions}
            onClose={() => setOpenOptions(false)}
          >
            <MenuItem
              onClick={() => {
                setOpenOptions(false);
                exportAssessments("FAMILY");
              }}
            >
              {t("common:assessment.All family assessments")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setOpenOptions(false);
                exportAssessments("CHILD");
              }}
            >
              {t("common:assessment.All child assessments")}
            </MenuItem>
          </Menu>
        </Box>}
      </Box>
        {loading && (
          <CircularProgress
            sx={{
              zIndex: 1000,
              position: "fixed",
              top: "50%", // Adjusted to 50% to center vertically
              left: "50%", // Adjusted to 50% to center horizontally
              transform: "translate(-50%, -50%)", // Centering trick
            }}
            color="primary"
          />
        )}
        <Box
          className={assessments?.length ? "scrollListTable" : ""}
          sx={{ minWidth: "auto" }}
        >
          {open && (
            <Box sx={{ ml: 2, mt: 1, mb: 1 }}>
              <Grid container spacing={2}>
                <Grid
                  item
                  sx={{ mt: -2 }}
                >
                  <TextField
                    sx={{ width: 250, ml: 1 }}
                    name="status"
                    accessKey="label"
                    component={AutoCompleteDropdownToFilter}
                    getValueFunction={(value) => {
                      handleStatusFilter(value);
                    }}
                    label="status"
                    defaultVal="All"
                    options={statusOptions}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t("common:common.Status"),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          {assessments && assessments.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  {columnHeaders.map((option) =>
                    option.value ? (
                      <TableCell
                        onClick={() => handleClickColumn(option.value)}
                      >
                        <TableSortLabel
                          active={sort === option.value}
                          direction={sortOrder === "ASC" ? "asc" : "desc"}
                        >
                          {t(`common:${option.label}`)}
                        </TableSortLabel>
                      </TableCell>
                    ) : (
                      <TableCell
                        align={
                          option.label === "common.Actions" ? "center" : ""
                        }
                      >
                        {t(`common:${option.label}`)}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {assessments.map((assessment) => {
                  const isAssessmentSelected = selectedAssessments.includes(
                    assessment.id
                  );
                  return (
                    <TableRow
                      hover
                      key={assessment.id}
                      selected={isAssessmentSelected}
                    >
                      <TableCell>
                        {Boolean(assessment?.HTFamilyId) ? (
                          <FamilyIconBlack fontSize="small" />
                        ) : (
                          <ChildIconBlack fontSize="small" />
                        )}
                        <span style={{ marginLeft: "10px" }}>
                          {Boolean(assessment?.HTFamilyId)
                            ? assessment?.familyName
                            : assessment?.childFirstName +
                              " " +
                              assessment?.childLastName}
                        </span>
                      </TableCell>
                      <TableCell>
                        {assessment.caseWorkerFirstName}{" "}
                        {assessment.caseWorkerLastName}
                      </TableCell>
                      {/* <TableCell>{assessment.accountName}</TableCell> */}
                      <TableCell>{formattedDate(assessment?.dateOfAssessment)}</TableCell>
                      <TableCell>
                        {assessment.isComplete ? utcToLocalDate(assessment.assessmentEndsAt) : ""}
                      </TableCell>
                      <TableCell>{assessment.totalScore}</TableCell>
                      <TableCell align="center">
                        <Tooltip
                          title={
                            assessment.isComplete
                              ? t("common:common.Completed")
                              : t("common:assessment.Edit Assessment")
                          }
                        >
                          <IconButton
                            disableFocusRipple={true}
                            disableRipple
                            component={!assessment.isComplete ? RouterLink : ""}
                            onClick={handleViewChange}
                            to={`/dashboard/assessments/${assessment.id}/edit`}
                            state={{
                              editAssessment: true,
                              formRevisionNumber: assessment.formRevisionNumber,
                            }}
                            disabled={!assessment.isComplete ? true : false}
                          >
                            {!assessment.isComplete ? (
                              <></>
                            ) : (
                              <Check
                                fontSize="small"
                                sx={{ cursor: "default" }}
                              />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("common:assessment.View Assessment")}>
                          <IconButton
                            component={RouterLink}
                            onClick={handleViewChange}
                            to={`/dashboard/assessments/${assessment.id}/view`}
                            state={{
                              viewAssessment: true,
                              formRevisionNumber: assessment.formRevisionNumber,
                            }}
                          >
                            <ArrowRightIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {assessments && assessments.length === 0 && !loading && (
            <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
              <Box>
                <Grid container spacing={3}>
                  <Grid
                    item
                    md={3} //6
                    xs={6} //12
                  >
                    <Typography>
                      {t("common:assessment.No Assessments to list")}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
      <Box sx={{ display: "flex" }} flexDirection="row-reverse" p={1} m={1}>
        <Box sx={{ alignContent: "flex-end" }}>
          <Pagination
            onChange={handlePageChange}
            page={page}
            count={pageCount}
            shape="rounded"
          />
        </Box>
      </Box>
    </Card>
  );
};

AssessmentListTable.propTypes = {
  assessments: PropTypes.array.isRequired,
};

export default AssessmentListTable;
