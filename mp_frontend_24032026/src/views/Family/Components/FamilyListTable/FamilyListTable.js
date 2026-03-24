import { useState, useContext, useEffect, useCallback } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import APIS from "../../../../common/hooks/UseApiCalls";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import PlusIcon from "../../../../assets/icons/Plus";
import useMounted from "../../../../common/hooks/UseMounted";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Grid,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableSortLabel,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Autocomplete,
  Stack,
  Chip,
} from "@mui/material";
import PencilAltIcon from "../../../../assets/icons/PencilAlt";
import SearchIcon from "../../../../assets/icons/Search";
import ClearIcon from "@mui/icons-material/Clear";
import TrashIcon from "../../../../assets/icons/Trash";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import AutoCompleteDropdownToFilter from "../../../../components/UserComponents/AutoCompleteDropdownToFilter";
import {
  GenerateFileName,
  getDistrictList,
  getStateList,
} from "../../../../helpers/helperFunction";
import ListPaging from "../../../../components/UserComponents/ListPaging";
import { useDebouncedCallback } from "use-debounce";
import { authorizationConfig } from "../../../../assets/authorizationConfig";
import ChartSquareBarIcon from "../../../../assets/icons/ChartSquareBar";
import {
  ADMIN,
  ADMIN_CASEWORKER,
  SUPER_ADMIN,
} from "../../../../helpers/constant";
import { ModalService } from "../../../../components/Modal";
import AutoCompleteDropdown from "../../../../components/UserComponents/AutoCompleteDropdown";
import DeleteConfirmation from "../../../../components/UserComponents/DeleteConfirmation";
import Loader from "../../../../components/UserComponents/Loader";
import { LoadingButton } from "@mui/lab";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { AssessmentProgressReportIcon } from "../../../../assets/icons/SideBarIcons";


const columnHeaders = [
  {
    label: "Family ID",
    value: "",
  },
  {
    label: "Family Name",
    value: "familyName",
  },
  {
    label: "Case Worker",
    value: "caseWorkerFirstName",
  },
  {
    label: "No of Caregivers",
    value: "numberOfCaregivers",
  },
  {
    label: "No of Children",
    value: "",
  },
  {
    label: "Location",
    value: "HTDistrictId",
  },
  {
    label: "Phone Number",
    value: "phoneNumber",
  },
  {
    label: "Status",
    value: "Status"
  },
  {
    label: "Actions",
    value: "",
    styleValue: { pl: 1 },
  },
];

const FamilyListTable = (props) => {
  const { t } = useTranslation(["common"]);
  const {
    families,
    getFamilyList,
    loading,
    savePageData,
    pageCount,
    pageData,
    ...other
  } = props;
  const sortOptions = [
    {
      label: t("common:common.None"),
      id: "none",
    },
    {
      label: t("common:common.Family Name"),
      id: "familyName",
    },
    {
      label: t("common:common.Case Worker"),
      id: "caseWorkerFirstName",
    },
    {
      label: t("common:common.No of Caregivers"),
      id: "numberOfCaregivers",
    },
    {
      label: t("common:common.No of Children"),
      id: "numberOfChildren",
    },
    {
      label: t("common:common.Location"),
      id: "HTDistrictId",
    },

    {
      label: t("common:common.Phone Number"),
      id: "phoneNumber",
    },
  ];
  const statusOptions = [
    {
      label: t("common:common.All"),
      id: "All",
    },
    {
      label: t("common:common.Active"),
      id: "Active",
    },
    {
      label: t("common:common.Inactive"),
      id: "Inactive",
    },
  ];

  const navigate = useNavigate();
  const { locationList, htLanguagesList, signedinUserRoleHT, signedinOrgType, signedInOrgName, userIdData } =
    useContext(CommonDataContext);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState("ASC");
  const [isOpen, setIsOpen] = useState(false);
 const [keyVal,setKeyVal] =useState(false)
  const [familyDetails, setFamilyDetails] = useState(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [addCaseWorkerModalFlag, setAddCaseWorkerModalFlag] = useState(false);
  const [selectedCaseWorker, setSelectedCaseWorker] = useState(null);
  const [disabledOnCaseWorkerSave, setDisabledOnCaseWorkerSave] =
    useState(false);
  const { allowedRoles, allowedOrgTypes } = authorizationConfig["ManageFamily"];
  const [caseWorkers, setCaseWorkers] = useState(null);
  const signedinOrgId = localStorage.getItem("orgId");
  const mounted = useMounted();

  const langOptions = [
    { id: 0, language: t("common:common.All") },
    ...htLanguagesList,
  ];
  const [langFilter, setLangFilter] = useState(
    langOptions && langOptions[0].id
  );
  const [statusFilter, setStatusFilter] = useState(
    statusOptions && statusOptions[0].value
  );
  const [open, setOpen] = useState(false);
  const [deleteReason,setDeleteReason] = useState([])
  let singleClickTimer = "";
  let clickCount = 0;
  const [rowCount, setRowCount] = useState(10);
  const [deletionOnProgress, setDeletionOnProgress] = useState(false)

  const getDeleteDeactivateReason = async () => {
    try {
      await APIS.GetDeleteDeactivateReason("FAMILY_DELETION").then((res) => {
        setDeleteReason(res?.data?.reasons)
      });
    } catch (err) {
     console.log(err)
    }
  };

  const parseFamilies = (families) => {
    return families;
  };

  ////////////General Search Controlling States ////////////
  const debouncedHandleSearch = useDebouncedCallback(
    // function
    (event) => {
      console.log(event.target.value);

      handleQueryChange(event);
    },
    800
  );

  const getFamilyListWithPayload = (overrides = {}) => {
    const updatedPayload = {
      rowCount,
      pageNumber: "1",
      globalSearchQuery: query,
      languageFilter: langFilter,
      familyStatus: statusFilter,
      orderByField: [[sort, sortOrder]],
      ...overrides,
    };
    getFamilyList(updatedPayload);
  };

  // Todo - Recheck during API integration
  const getUserList = useCallback(async () => {
    try {
      const payload = {
        rowCount: "10000",
        pageNumber: "1",
        orderByField: [["firstName", "ASC"]],
        globalSearchQuery: "",
        accountId: [signedinOrgId],
        HTLanguageId: "",
        HTChildPlacementStatusId: "",
        HTChildStatusId: "",
        HTUserRoleId: ["4", "5"],
        HTCountryId: localStorage.getItem("userRegion"),
      };
      const data = await APIS.ListUsers(payload);
      setCaseWorkers(data && data.data && data.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const inputValue = e.target.value.trim();

      if (inputValue.length === 1 || inputValue.length === 2) {
        // Do something for string length 1 or 2
        handleQueryChange(e, true);
      }
    }
  };

  const handleQueryChange = (event, flag = false) => {
    const value = event.target.value;
    setQuery(value);
    setPage(1);
    if (!value.trim()) {
      getFamilyListWithPayload({ globalSearchQuery: "" });
    } else if (value.trim().length > 2 || flag) {
      getFamilyListWithPayload({ globalSearchQuery: value });
    }
  }

  const handleSingleClickColumn = (value) => {
    const newSortOrder = sortOrder === "ASC" ? "DESC" : "ASC";
    setSort(value);
    setSortOrder(newSortOrder);
    setPage(1);
    getFamilyListWithPayload({ orderByField: [[value, newSortOrder]] });
  };

  const handleDblClickColumn = () => {
    setSort("familyName");
    setSortOrder("ASC");
    setPage(1);
    getFamilyListWithPayload({ orderByField: [["familyName", "ASC"]] });
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
    getFamilyListWithPayload({
      globalSearchQuery: "",
    });
  };

  const loadDefaultListOnClose = () => {
    if (open) {
      setStatusFilter(null);
      setLangFilter(null);
      getFamilyListWithPayload({
        languageFilter: null,
        familyStatus: null,
      });
      setKeyVal(!keyVal)
    }
  };

  useEffect(() => {
    setPagedata();
    return () => {};
  }, [pageData]);

  const setPagedata = () => {
    setPage(pageData.page);
    setQuery(pageData.query);
    setSort(pageData.sort);
    setOpen(pageData.isOpen);
    setSortOrder(pageData.sortOrder)
    setLangFilter(pageData.langFilter);
    setStatusFilter(pageData.statusFilter);
    setKeyVal(!keyVal);
  };

  const handleViewChange = () => {
    let pageObject = {
      rowCount,
      page: page,
      query: query,
      sort: sort,
      sortOrder: sortOrder,
      langFilter: langFilter,
      statusFilter: statusFilter,
      isOpen: open,
    };
    savePageData(pageObject);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    getFamilyListWithPayload({ pageNumber: value });
  }

  useEffect(() => {
    handleViewChange();
  }, [page, query, sort, sortOrder, langFilter, statusFilter, open]);

  const handleLangFilter = (value) => {
    setLangFilter(value);
    setPage(1);
    getFamilyListWithPayload({ languageFilter: parseInt(value, 10) });

  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
    getFamilyListWithPayload({ familyStatus: value });
  };

  const handleDelete = (id) => {
    ModalService.open(({ close }) =>
      <DeleteConfirmation
        t={t}
        type="family"
        deleteReason={deleteReason}
        handleConfirmDelete={(reason,otherReason) => handleConfirmDelete(reason,otherReason,id,close)}
        close={close}
      />,
      {
        modalTitle: t("common:family.Delete family?"),
        width: "35%",
        hideModalFooter: true,
        enableClose: true,
      })
  };
  const handleCaseWorkerSave = () => {
    setConfirmationDialogOpen(true); // Show confirmation dialog
  };
  // Function to confirm save action and proceed with the API call
  const handleConfirmSave = async () => {
    setDisabledOnCaseWorkerSave(true);
    let payload = {
      id: familyDetails.id || "",
      TWUserId: selectedCaseWorker.id || "",
    };
    try {
      await APIS.UpdateCaseWorker(payload).then((res) => {
        if (res && res.data && res.status === 200) {
          getFamilyList();
          setDisabledOnCaseWorkerSave(false);
          setAddCaseWorkerModalFlag(false);
          onAddCaseWorkerClose();
          toast.success(t("common:child.Family Updated Successfully"));
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
    }
    setConfirmationDialogOpen(false); // Close the confirmation dialog after saving
  };

  const handleCancelSave = () => {
    setConfirmationDialogOpen(false); // Close the confirmation dialog without saving
  };

  useEffect(() => {
    getUserList();
    getDeleteDeactivateReason()
    return () => {};
  }, []);
   
  const handleConfirmDelete = async (reason,otherReason,id,close) => {
    try {
      const statusPayload = {
        id: id,
        isActive: false,
        isDeleted: true,
        TWAccountId: localStorage.getItem('orgId'),
        type:"FAMILY_DELETION",
        reason: reason,
        otherReason: otherReason
      };
      setDeletionOnProgress(true)
      await APIS.ChangeFamilyStatus(statusPayload).then((res) => {
        if (res.data.Message !== "Family deleted Successfully") {
          toast.error(res.data.Message);
          setDeletionOnProgress(false)
          getFamilyList();
          close()
        } else if (res.data.Message === "Family deleted Successfully") {
          toast.success(t("common:family.Deleted Family Successfully"));
          setDeletionOnProgress(false)
          getFamilyList();
          close()
        } else {
          toast.error(t("common:common.Something went wrong"));
          getFamilyList();
          setDeletionOnProgress(false)
          close()
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
      setDeletionOnProgress(false)
    }
  };

  const paginatedFamilies = parseFamilies(families);

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    setPage(1)
    getRefreshedUserList(event.target.value);
  };
  const getRefreshedUserList = (rowCount = 10) => {
    getFamilyList({
      globalSearchQuery: query,
      pageNumber: 1,
      rowCount: rowCount,
      languageFilter: langFilter,
      familyStatus: statusFilter,
      orderByField: [[`${sort}`, `${sortOrder === "ASC" ? "ASC" : "DESC"}`]],
    });
  };

  // Todo - Recheck during API integration
  const onAddCaseWorkerClick = (e, familyInfo) => {
    e.preventDefault(); // check - todo
    setFamilyDetails(familyInfo);
    setAddCaseWorkerModalFlag(true);
  };

  const onAddCaseWorkerClose = () => {
    setAddCaseWorkerModalFlag(false);
    setSelectedCaseWorker(null);
  };

  const handleCaseWorkerChange = (value) => {
    setSelectedCaseWorker(value);
  };

  // Todo - Recheck during API integration
  const handleAddCaseWorker = () => {
    navigate(`/dashboard/team/add/`);
  };
  
  const [isExporting, setIsExporting] = useState(false);
  const exportFamilies = async () => {
    setIsExporting(true);
    try {
      const res = await APIS.exportFamilies(langFilter, statusFilter, query);
      const linkSource = `data:application/xlsx;base64,${res.data}`;
      const downloadLink = document.createElement("a");
const fileName = GenerateFileName({
        signedInOrgName,
        userIdData,
        module: `Families`,
      });      downloadLink.href = linkSource;
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

  const handleAddFamily = () => {
    navigate("/dashboard/families/add",{state:{mode:"add"}});
  };

  return (
    <Card {...other}>
      <Loader loading={deletionOnProgress} />
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          pt: 2,
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
            onKeyDown={handleKeyPress} // Handle "Enter" key press
            placeholder={t(
              "common:family.Search Family Name, Location and Phone"
            )}
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
          <IconButton
            color="inherit"
            onClick={() => {
              setOpen(!open);
              loadDefaultListOnClose();
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
       
          <Box sx={{ flexGrow: 1, display: "flex", textAlign: "right", gap: 2, justifyContent: "flex-end" }}>
            {signedinUserRoleHT !== "viewonly" && (
              <Button
                startIcon={<PlusIcon fontSize="small" />}
                variant="contained"
                onClick={handleAddFamily}
                id="add-family-btn"
              >
                {t("common:family.Add New Family")}
              </Button>
            )}
            {families?.length > 0 && (
              <LoadingButton
                onClick={exportFamilies}
                loading={isExporting}
                loadingPosition="start"
                startIcon={<FileUploadIcon />}
                color="primary"
                variant="contained"
                id="export-families-btn"
              >
                {t('common:common.Export')}
              </LoadingButton>
            )}
          </Box>
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
          className={families?.length ? "scrollListTable" : ""}
          // sx={{ minWidth: 700 }}
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
                    name="language"
                    accessKey="language"
                    component={AutoCompleteDropdownToFilter}
                    getValueFunction={(value) => {
                      handleLangFilter(value);
                    }}
                    label="language"
                    key={keyVal}
                    options={langOptions}
                    defaultVal={langFilter || langOptions[0]}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label: t("common:common.Language"),
                    }}
                  />
                </Grid>

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
                    key={keyVal}
                    label="status"
                    defaultVal={statusFilter || "All"}
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

          {families && families.length > 0 && (
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
                          {t(`common:common.${option.label}`)}
                        </TableSortLabel>
                      </TableCell>
                    ) : (
                      <TableCell
                        align={option.label === "Actions" ? "center" : ""}
                        sx={option.style || null}
                      >
                        {t(`common:common.${option.label}`)}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFamilies.map((family) => {
                  return (
                    <TableRow hover key={family.id}>
                      <TableCell>{family.autogenfamilyid}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            alignItems: "center",
                            display: "flex",
                          }}
                        >
                          <Box sx={{ ml: 1 }}>
                            <Link
                              color="inherit"
                              component={RouterLink}
                              to={`/dashboard/families/${family.id}/view`}
                              variant="subtitle2"
                              style={{
                                color: "#F37123",
                                textDecoration: "none",
                                cursor: "pointer",
                              }}
                            >
                              {family.familyName}
                            </Link>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {family.caseWorkerFirstName
                          ? family.caseWorkerFirstName +
                            " " +
                            family.caseWorkerLastName
                          : [SUPER_ADMIN, ADMIN_CASEWORKER, ADMIN].includes(
                              signedinUserRoleHT
                            ) && (
                              <Button
                                variant="text"
                                sx={{ ml: -1 }}
                                onClick={(e) => {
                                  onAddCaseWorkerClick(e, family);
                                }}
                                disabled={
                                  !(
                                    allowedOrgTypes.includes(signedinOrgType) &&
                                    allowedRoles.includes(signedinUserRoleHT)
                                  )
                                }
                                color="error"
                              >
                                + {t("common:family.Add Case Worker")}
                              </Button>
                            )}
                      </TableCell>
                      <TableCell>{family.numberOfCaregivers}</TableCell>
                      <TableCell>{family.numberOfChildren}</TableCell>
                      <TableCell>
                        {[
                          getDistrictList(
                            locationList,
                            family.HTCountryId,
                            family.HTStateId
                          )?.find((item) => item.id === family.HTDistrictId)
                            ?.districtName,
                          getStateList(locationList, family.HTCountryId)?.find(
                            (item) => item.id === family.HTStateId
                          )?.stateName,
                          locationList?.find(
                            (item) => item.id === family.HTCountryId
                          )?.countryName,
                        ]
                          .filter(Boolean) // Remove undefined or empty values
                          .join(", ")}
                      </TableCell>
                      <TableCell>{family.phoneNumber}</TableCell>
                      <TableCell>
                        <Chip
                          color="primary"
                          label={
                            family.isActive
                              ? `${t("common:common.Active")}`
                              : `${t("common:common.Inactive")}`
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                            family.isActive
                                ? "#4caf50"
                                : "#f44336",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title={t("common:family.Edit Family")}>
                            <IconButton
                              component={RouterLink}
                              to={`/dashboard/families/${family.id}/edit`}
                              id="edit-family"
                            >
                              <PencilAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={
                              family?.numberOfChildrenActive > 0
                                ? (t("common:family.Cannot delete family with active children", "Cannot delete family with active children"))
                                : t("common:family.Delete Family")
                            }
                          >
                            <span>
                              <IconButton
                                disabled={family?.numberOfChildrenActive > 0}
                                onClick={() => handleDelete(family.id)}
                                id="delete-family"
                              >
                                <TrashIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title={t("common:common.Assessments & Progress Reports", "Assessments & Progress Reports")}>
                            <IconButton
                              onClick={() => {
                                navigate(
                                  `/dashboard/families/${family.id}/view`,
                                  {
                                    state: { tabvalue: "assessmentsProgressReports" },
                                  }
                                );
                              }}
                            >
                              <AssessmentProgressReportIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {families && families.length === 0 && !loading && (
            <Box sx={{ width: "100%", textAlign: "center", mt: 5, mb: 1 }}>
              <Box>
                <Typography>
                  {t("common:family.No families to list")}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      <Box
        sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}
        p={1}
        m={1}
      >
        <ListPaging
          rowCount={rowCount}
          handleRowCountChange={handleRowCountChange}
        ></ListPaging>

        <Pagination
          onChange={handlePageChange}
          page={page}
          count={pageCount}
          shape="rounded"
        />
      </Box>

      {/* Todo - Recheck during API integration */}
      <Dialog
        aria-labelledby="simple-dialog-title"
        open={addCaseWorkerModalFlag}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="simple-dialog-title">
          {" "}
          <Box display="flex" alignItems="center">
            <Box flexGrow={1}></Box>
            <Box>
              <IconButton onClick={onAddCaseWorkerClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent style={{ height: "350px" }}>
          <Button
            // color="#172b4d"
            startIcon={<PlusIcon fontSize="small" />}
            sx={{ mr: 1, mb: 2 }}
            variant="contained"
            onClick={handleAddCaseWorker}
          >
            {t("common:family.Add Case Worker")}
          </Button>
          <Typography level="h3" sx={{ ml: 8, mb: 2 }}>
            {t("common:common.OR")}
          </Typography>
          <Typography level="h3" sx={{ ml: 1, mb: 2 }}>
            {t("common:common.Assign existing Case Worker")}
          </Typography>
          <Grid>
            <Autocomplete
              disablePortal
              options={caseWorkers}
              onChange={(event, newValue) => handleCaseWorkerChange(newValue)}
              sx={{ width: 300 }}
              getOptionLabel={(option) =>
                option.firstName + " " + option.lastName
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("common:common.Choose Case Worker")}
                />
              )}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            autoFocus
            onClick={() => {
              onAddCaseWorkerClose();
            }}
          >
            {t("common:common.Cancel")}
          </Button>
          <Button
            color="primary"
            variant="contained"
            disabled={!selectedCaseWorker}
            onClick={handleCaseWorkerSave}
          >
            {t("common:common.Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={handleCancelSave}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t("common:common.Update case worker")}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {t(
              "common:common.By adding the caseworker to this family, this caseworker will automatically be reassigned to the child's Case Worker"
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSave}>{t("common:common.No")}</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleConfirmSave}
            disabled={disabledOnCaseWorkerSave}
          >
            {t("common:common.Yes reassign")}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

FamilyListTable.propTypes = {
  families: PropTypes.array.isRequired,
};

export default FamilyListTable;
