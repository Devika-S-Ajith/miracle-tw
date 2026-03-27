import { useState, useEffect, useContext, useCallback, useRef } from "react";
import ChartSquareBarIcon from "../../../../assets/icons/ChartSquareBar";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Link,
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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  tableCellClasses
} from "@mui/material";
import { FilterList as FilterListIcon, Clear as ClearIcon, Close as CloseIcon, FileUpload as FileUploadIcon } from "@mui/icons-material";
import PencilAltIcon from "../../../../assets/icons/PencilAlt";
import PlusIcon from "../../../../assets/icons/Plus";
import TrashIcon from "../../../../assets/icons/Trash";
import SearchIcon from "../../../../assets/icons/Search";
import toast from "react-hot-toast";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import APIS from "../../../../common/hooks/UseApiCalls";
import AutoCompleteDropdownToFilter from "../../../../components/UserComponents/AutoCompleteDropdownToFilter";
import ListPaging from "../../../../components/UserComponents/ListPaging";
import { useDebouncedCallback } from "use-debounce";
import {
  GenerateFileName,
  getDistrictList,
  getStateList,
} from "../../../../helpers/helperFunction";
import { authorizationConfig } from "../../../../assets/authorizationConfig";
import {
  ADMIN,
  ADMIN_CASEWORKER,
  CASEWORKER,
} from "../../../../helpers/constant";
import { ModalService } from "../../../../components/Modal";
import DeleteConfirmation from "../../../../components/UserComponents/DeleteConfirmation";
import Loader from "../../../../components/UserComponents/Loader";
import { LoadingButton } from "@mui/lab";
import { AssessmentProgressReportIcon } from "../../../../assets/icons/SideBarIcons";
import ChildModal from './ChildModal';
import ManageChildForm from "./ChildDetailForms/ManageChildForm";

const columnHeaders = [
  {
    label: "Child ID",
    value: "",
  },
  {
    label: "Child Name",
    value: "firstName",
  },
  {
    label: "Family Name",
    value: "familyName",
  },
  {
    label: "Child Placement Status table",
    value: "placementStatus",
  },
  {
    label: "Status",
    value: "isActive",
  },
  {
    label: "Actions",
    value: "",
    styleValue: { pl: 2 },
  },
];

const ChildListTable = (props) => {
  const { t } = useTranslation(["common"]);
  const sortOptions = [
    {
      label: t("common:common.None"),
      id: "none",
    },
    {
      label: t("common:common.Case Worker"),
      id: "TWUserId",
    },
    {
      label: t("common:common.Child Name"),
      id: "firstName",
    },

    {
      label: t("common:common.Family Name"),
      id: "familyName",
    },
    {
      label: t("common:common.Placement Status"),
      id: "HTChildPlacementStatusId",
    },
    {
      label: t("common:common.Status"),
      id: "isActive",
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
  const {
    childList,
    getUserlist,
    savePageData,
    pageCount,
    saveCurrentPage,
    pageData,
    loading,
    orgOptions,
    getChildListAfterFamilySave,
    ...other
  } = props;
  const {
    childPlacementList,
    signedinUserRoleHT,
    signedinOrgType,
    locationList,
    signedInOrgName,
    userIdData
  } = useContext(CommonDataContext);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState("ASC");
  const typeOptions = orgOptions;
  const [typeFilter, setTypeFilter] = useState(
    typeOptions && typeOptions[0].id
  );
  const [statusFilter, setStatusFilter] = useState(
    statusOptions && statusOptions[0].id
  );
  const [rowCount, setRowCount] = useState(10);
  const [isopen, setIsOpen] = useState(false);
  const [addFamilyModalFlag, setAddFamilyModalFlag] = useState(false);
  const [newFamily, setNewFamily] = useState("");
  const [familyDetails, setFamilyDetails] = useState(null);
  const [CaregiversNames, setCaregiversNames] = useState("");
  const [loadingFamilyDetails, setLoadingFamilyDetails] = useState(false);
  const [disabledOnFamilySave, setDisabledOnFamilySave] = useState(false);
  const [deleteReason,setDeleteReason] = useState([])
  const [deletionOnProgress, setDeletionOnProgress] = useState(false)
  const [keyVal,setKeyVal] = useState(false)
  const [familyList, setFamilyList] = useState([]);

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = (formData) => {
    console.log('Form data:', formData);
    // Handle save logic here
    setOpen(false);
  };


  let singleClickTimer = "";
  let clickCount = 0;
  const childInfoRef = useRef(null);
  const { allowedRoles, allowedOrgTypes } = authorizationConfig["AddChild"];

  const getDeleteDeactivateReason = async () => {
    try {
      await APIS.GetDeleteDeactivateReason("CHILD_DELETION").then((res) => {
        setDeleteReason(res?.data?.reasons)
      });
    } catch (err) {
     console.log(err)
    }
  }

  const getFamilyList = useCallback(async () => {
    try {
      let getFamListpayload = {
        rowCount: "10000",
        pageNumber: "1",
        orderByField: [["familyName", "ASC"]],
        familyStatus:"Active"
      };
      const data = await APIS.FamilyList(getFamListpayload);
      if (data?.data?.familyDetails) {
        setFamilyList(data.data.familyDetails);
      }
      
    } catch (err) {
      console.error(err);
    }
  }, []);
  
  useEffect(() => {
    setPagedata();
    return () => {};
  }, [pageData]);

  useEffect(() => {
    getDeleteDeactivateReason();
    getFamilyList()
    return () => { };
  }, []);

  const handleDelete = async (id,familyId) => {
    try {
      setDeletionOnProgress(true);
      const primaryCheck = await APIS.checkChildIsPrimaryContactOfFamily(id);
      if (primaryCheck.status === 200 && primaryCheck?.data?.status === "OK") {
        const deactivationCheck = await APIS.checkDeactivationAllowed(id, familyId ?? "", "CHILD");
        if (deactivationCheck.status === 200 && deactivationCheck?.data?.Message === "OK") {
          setDeletionOnProgress(false);
          ModalService.open(
            ({ close }) => (
              <DeleteConfirmation
                t={t}
                type="child"
                deleteReason={deleteReason}
                handleConfirmDelete={(reason, otherReason) =>
                  deleteAfterConfirmation(reason, otherReason, id, close)
                }
                close={close}
              />
            ),
            {
              modalTitle: t("common:child.Delete Child") + "?",
              width: "35%",
              hideModalFooter: true,
              enableClose: true,
            }
          );
        } else {
          setDeletionOnProgress(false);
          toast.error(
            "Child cannot be deleted as there are pending assessments or progress reports."
          );
        }
      } else {
        setDeletionOnProgress(false);
        toast.error(
          "This child is the primary contact of a family. Please update the primary contact before deleting."
        );
      }
    } catch (err) {
      console.error(err);
      setDeletionOnProgress(false);
      toast.error("An error occurred while trying to delete the child.");
    }
  };


  const deleteAfterConfirmation = async (reason,otherReason,id,close) => {
    try {
      const signedinOrgId = localStorage.getItem("orgId");
      const statusPayload = {
        id: id,
        isActive: false,
        isDeleted:true,
        TWAccountId: signedinOrgId,
        type:"CHILD_DELETION",
        reason: reason,
        otherReason: otherReason
      };
      setDeletionOnProgress(true)
      await APIS.ChangeChildStatus(statusPayload).then((res) => {
        if (res.status === 200) {
          toast.success("Child Deleted Successfully");
          setDeletionOnProgress(false)
          getUserListWithPayload()
          close()
        } else {
          setDeletionOnProgress(false)
          toast.error("Something went wrong");
          close()
        }
      });
    } catch (err) {
      setDeletionOnProgress(false);
      console.log(err, "error");
      toast.error("Something went wrong");
      close()
    }
    setDeletionOnProgress(false);
  };

  const debouncedHandleSearch = useDebouncedCallback((event) => {
    handleQueryChange(event);
  }, 800);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const inputValue = e.target.value.trim();
      if (inputValue.length === 1 || inputValue.length === 2) {
        // Do something for string length 1 or 2
        handleQueryChange(e, true);
      }
    }
  };

  const getUserListWithPayload = (overrides = {}) => {
    const updatedPayload = {
      rowCount,
      pageNumber: page,
      globalSearchQuery: query,
      HTOrganizationId: typeFilter,
      childStatus: statusFilter,
      orderByField: [[sort, sortOrder]],
      ...overrides,
    };
    getUserlist(updatedPayload);
  };

  const handleQueryChange = (event, flag = false) => {
    const value = event.target.value;
    setQuery(value);
    setPage(1);

    if (!value.trim()) {
      getUserListWithPayload({ globalSearchQuery: "" , pageNumber:"1" });
    } else if (value.trim().length > 2 || flag) {
      getUserListWithPayload({ globalSearchQuery: value ,pageNumber:"1"  });
    }
  };

  const handleSingleClickColumn = (value) => {
    const newSortOrder = sortOrder === "ASC" ? "DESC" : "ASC";
    setSort(value);
    setSortOrder(newSortOrder);
    setPage(1);
    getUserListWithPayload({ orderByField: [[value, newSortOrder]],pageNumber:"1"  });
  };

  const handleDblClickColumn = () => {
    setSort("firstName");
    setSortOrder("ASC");
    setPage(1);
    getUserListWithPayload({ orderByField: [["firstName", "ASC"]],pageNumber:"1"  });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    getUserListWithPayload({ pageNumber: value });
  };

  const loadDefaultList = () => {
    setQuery("");
    getUserListWithPayload({ globalSearchQuery: "" ,pageNumber:"1" });
  };

  const loadDefaultListOnClose = () => {
    if (isopen) {
      setStatusFilter(null)
      setTypeFilter(null)
      getUserListWithPayload({ HTOrganizationId: null, childStatus: null ,pageNumber:"1"  });
    }
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
    getUserListWithPayload({ childStatus: value ,pageNumber:"1"  });
  };

  const getRefreshedUserList = (updatedRowCount = 10) => {
    getUserListWithPayload({ rowCount: updatedRowCount, pageNumber: 1 });
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

  const handleViewChange = () => {
    let pageObject = {
      rowCount,
      page: page,
      query: query,
      sort: sort,
      sortOrder: sortOrder,
      typeFilter: typeFilter,
      statusFilter: statusFilter,
      isOpen: isopen,
    };
    savePageData(pageObject);
  };

  useEffect(() => {
    handleViewChange();
  }, [page, query, sort, sortOrder, typeFilter, statusFilter, isopen]);

  const setPagedata = () => {
    setPage(pageData.page);
    setQuery(pageData.query);
    setSort(pageData.sort);
    setIsOpen(pageData.isOpen);
    setTypeFilter(pageData.typeFilter);
    setStatusFilter(pageData.statusFilter);
    setKeyVal(!keyVal);
  };

  const onAddFamilyClick = (e, childInfo) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setAddFamilyModalFlag(true); // Open modal
    childInfoRef.current = childInfo; // Set child info in ref immediately
  };

  const stringToDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date([month, day, year].join("/"));
  };

  const getDate = (dateToFormat = null) => {
    let yourDate;
    if (dateToFormat === null) {
      yourDate = new Date();
    } else {
      yourDate = new Date(stringToDate(dateToFormat));
    }
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    return yourDate.toISOString().split("T")[0];
  };

  const onAddFamilyClose = () => {
    setAddFamilyModalFlag(false);
    setFamilyDetails(null);
  };

  const getFamilyDetails = useCallback(async (id) => {
    try {
    
      const data = await APIS.FamilyDetails(id);
      setFamilyDetails(data.data.familyDetails);
      getMembersName(data.data.familyDetails);
      setLoadingFamilyDetails(false);
      const childDetails = childInfoRef.current
      const isDifferentCase = checkCaseworkerIsDifferent(childDetails, data?.data?.familyDetails);
      if (isDifferentCase) {
        ModalService.open(({ close }) => (
          <Box>
            <Typography>
              {childDetails?.userFirstName &&
          `${t("common:common.This child is currently assigned to Case Worker")} ${childDetails.userFirstName} ${childDetails.userLastName}. `}
              {t("common:common.By adding this child to this family, this child will automatically be reassigned to the family’s Case Worker")} {data?.data?.familyDetails?.caseworkerName}.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, marginTop: 2 }}>
              <Button variant="outlined"
          onClick={() => { close(); }}>{t("common:common.No")}</Button>
              <Button variant="contained"
          onClick={() => {
            close();
          }}>{t("common:common.Yes,Update case worker")}</Button>
            </Box>
          </Box>
        ), {
          modalTitle: t("common:common.Update case worker"),
          width: "30%",
          hideModalFooter: true,
          enableClose: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleFamilyChange = (value) => {
    setFamilyDetails(null);
    setNewFamily(value);
    setLoadingFamilyDetails(true);
    getFamilyDetails(value);
  };

  const checkCaseworkerIsDifferent = (childDetails, familyDetails) => {

    if(!familyDetails?.caseManagerId){
      return false
    }
   
    if (childDetails.TWUserId != familyDetails.caseManagerId ) {
      return true;
    } else {
      return false;
    }
  };

  const handleAddFamily = () => {
    navigate("/dashboard/families/add", { state: { mode: "add" } });
  };

  const addCase = useCallback(async (childID, caseWorkerId) => {
    let payload = {
      TWUserId: caseWorkerId,
      HTChildId: childID,
    };
    try {
      const res = await APIS.AddCase(payload);
      if (!(res?.data && (res.status === 200 || res.status === 201))) {
        toast.error(t("common:common.Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("common:common.Something went wrong"));
    }
  });

  const editCase = useCallback(async (childID, caseId, caseWorkerId) => {
    let payload = {
      id: caseId,
      TWUserId: caseWorkerId,
      HTChildId: childID,
    };
    try {
      const res = await APIS.EditCase(payload);
      if (!(res?.data && res.status === 200)) {
        toast.error(t("common:common.Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("common:common.Something went wrong"));
    }
  });

  const handleFamilySave = async () => {
    setDisabledOnFamilySave(true);
    const childDetails = childInfoRef.current
    let payload = {
      id: childDetails.id || "",
      firstName: childDetails.firstName || "",
      lastName: childDetails.lastName || "",
      birthDate: getDate(childDetails.birthDate) || "",
      dateOfEntry:
        childDetails.dateOfEntry !== "" && childDetails.dateOfEntry !== null
          ? getDate(childDetails.dateOfEntry)
          : null,
      dateOfExit:
        childDetails.dateOfExit !== "" && childDetails.dateOfExit !== null
          ? getDate(childDetails.dateOfExit)
          : null,
      gender: childDetails.gender || "",
      phoneNumber: childDetails.phoneNumber || "",
      email: childDetails.email || "",
      HTLanguageId: childDetails.HTLanguageId || "",
      TWAccountId: childDetails.TWAccountId || "",
      HTChildPlacementStatusId: childDetails.HTChildPlacementStatusId || "",
      HTChildStatusId: childDetails.HTChildStatusId || null,
      HTChildCurrentPlacementStatusId:
        childDetails.HTChildCurrentPlacementStatusId || "",
      HTChildEducationLevelId: childDetails.HTChildEducationLevelId || null,
      highestEducationLevel: childDetails.highestEducationLevel || "",
      addressLine1: childDetails.addressLine1 || "",
      addressLine2: childDetails.addressLine2 || "",
      zipCode: childDetails.zipCode || "",
      HTCountryId: childDetails.HTCountryId || "",
      HTDistrictId: childDetails.HTDistrictId || null,
      HTStateId: childDetails.HTStateId || "",
      city: childDetails.city || "",
      HTFamilyId: newFamily || "",
    };
    try {
      await APIS.EditChild(payload).then((res) => {
        if (res && res.data && res.status === 200) {
          getChildListAfterFamilySave();
          setDisabledOnFamilySave(false);
          if (familyDetails?.caseManagerId != childDetails?.TWUserId) {
            if (childDetails?.TWUserId) {
              editCase(childDetails.id, childDetails.HTCaseId, familyDetails?.caseManagerId);
            } else {
              addCase(childDetails.id, familyDetails?.caseManagerId);
            }
          }
          setAddFamilyModalFlag(false);
          setNewFamily(null);
          setFamilyDetails(null);
          toast.success(t("common:child.Child Updated Successfully"));
        }
      });
    } catch (err) {
      toast.error(t("common:common.Something went wrong"));
    }
  };

  const getMembersName = (familyDetails) => {
    let caregivers = [];
    familyDetails?.HT_familyMembers?.map((individualMember) => {
      if (individualMember.HTFamilyMemberTypeId == 1) {
        caregivers.push(
          individualMember.firstName + " " + individualMember.lastName
        );
      }
    });
    setCaregiversNames(caregivers.toString());
  };

  const handleRowCountChange = (event) => {
    setRowCount(event.target.value);
    setPage(1)
    getRefreshedUserList(event.target.value);
  };

  const [isExporting, setIsExporting] = useState(false);
  const exportChildren = async () => {
    setIsExporting(true);
    try {
      const res = await APIS.exportChildren({
        childStatusFilter: statusFilter, // "inActive","all"
        globalSearchQuery: query,
      });
      const linkSource = `data:application/xlsx;base64,${res.data}`;
      const downloadLink = document.createElement("a");
      const fileName = GenerateFileName({
        signedInOrgName,
        userIdData,
        module: `Children`,
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

  const handleAddChild = () => {
    navigate("/dashboard/children/add");
  };

  return (
    <Card {...other}>
      <Loader loading={deletionOnProgress} />
       {(loading) && (
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
            placeholder={t("common:child.Search Child")}
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
              setIsOpen(!isopen);
              loadDefaultListOnClose();
            }}
          >
            <FilterListIcon></FilterListIcon>
          </IconButton>
        </Box>
        <Box sx={{ flexGrow: 1, display: "flex", textAlign: "right", gap: 2, justifyContent: "flex-end" }}>
          {allowedOrgTypes.includes(signedinOrgType) &&
           allowedRoles.includes(signedinUserRoleHT) &&
           <>
              <Button
                startIcon={<PlusIcon fontSize="small" />}
                variant="contained"
                onClick={()=>
                  ModalService.open(({ close }) => (<ManageChildForm close={close} />), {
                        modalTitle: <Box>
                                      Child <span style={{ color: '#FF8C42' }}>ACTIVE</span>
                                    </Box>,
                        width: "30%",
                        maxHeight: "90%",
                        hideModalFooter: true,
                        enableClose: true
                      })
                }
                id="add-child-btn"
              >
                {t("common:child.Add Child")}
              </Button>
              <ChildModal open={open} onClose={handleClose} onSave={handleSave} />
           </>
          }
          {childList.length > 0 && 
            <LoadingButton
              onClick={exportChildren}
              loading={isExporting}
              loadingPosition="start"
              startIcon={<FileUploadIcon />}
              color="primary"
              variant="contained"
              id="export-children-btn"
            >
              {t('common:common.Export')}
            </LoadingButton>
          }
        </Box>
      </Box>
        <Box
          className={childList.length ? "scrollListTable" : ""}
          sx={{ minWidth: 700 }}
        >
          {isopen && (
            <Box sx={{ ml: 2, mt: 1, mb: 1 }}>
              <Grid container spacing={3}>
                <Grid
                  item
                  md={3} //6
                  xs={6} //12
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
                    key={keyVal}
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
        {childList && childList.length > 0 && (
          <Box
            sx={{
              width: '100%',
              overflow: 'hidden' // Prevent outer container from scrolling
            }}
          >
            <Box
              sx={{
                overflowY: 'auto', // Add vertical scroll if needed
                width: '100%',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Table sx={{ minWidth: 800 }}> {/* Set minimum width to force horizontal scroll */}
                <TableHead>
                  <TableRow>
                    {columnHeaders.map((option, index) =>
                      option.value ? (
                        <TableCell
                          key={index}
                          onClick={() => handleClickColumn(option.value)}
                          sx={{
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            minWidth: 120 // Ensure minimum width for each column
                          }}
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
                          key={index}
                          align={option.label === "Actions" ? "center" : "left"}
                          sx={{
                            whiteSpace: 'nowrap',
                            minWidth: option.label === "Actions" ? 180 : 120,
                            ...(option.style || {})
                          }}
                        >
                          {t(`common:common.${option.label}`)}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>

                  {childList.map((child, index) => {
                    return (
                      <TableRow hover key={child.id + index}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {child.childId}
                        </TableCell>
                        <TableCell sx={{ minWidth: 200 }}>
                          <Box
                            sx={{
                              alignItems: "center",
                              display: "flex",
                              wordBreak: "break-word",
                              whiteSpace: "normal",
                            }}
                          >
                            <Box sx={{ ml: 1 }}>
                              <Link
                                color="inherit"
                                component={RouterLink}
                                to={`/dashboard/children/${child.id}/view`}
                                variant="subtitle2"
                                sx={{
                                  color: "#F37123",
                                  textDecoration: "none",
                                  cursor: "pointer",
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  width: "100%",
                                  display: "block",
                                }}
                              >
                                {`${child.firstName} ${child?.lastName ?? ""}`}
                              </Link>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          {child.familyName ? (
                            <Box sx={{
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              width: "100%",
                              display: "block"
                            }}>
                              {child.familyName}
                            </Box>
                          ) : (
                            child.isActive ? <Button
                              variant="text"
                              size="small"
                              onClick={(e) => {
                                onAddFamilyClick(e, child);
                              }}
                              disabled={
                                !(
                                  allowedOrgTypes.includes(signedinOrgType) &&
                                  allowedRoles.includes(signedinUserRoleHT)
                                )
                              }
                              color="error"
                              sx={{
                                whiteSpace: 'nowrap',
                                minWidth: 'auto'
                              }}
                            >
                              + {t("common:family.Add Family")}
                            </Button> : "-"
                          )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 150 }}>
                          {child.HTChildPlacementStatusId &&
                            childPlacementList &&
                            childPlacementList.length &&
                            `${childPlacementList.find(
                              (item) =>
                                item.id === child.HTChildPlacementStatusId
                            )?.placementStatus || ''
                            }`}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            color="primary"
                            label={
                              child?.status || (child && child.isActive
                                ? t("common:common.Active")
                                : t("common:common.Inactive"))
                            }
                            size="small"
                            sx={{
                              backgroundColor:
                                child && child.isActive ? "#4caf50" : "#f44336",
                              color: 'white',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 180 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {[ADMIN_CASEWORKER, CASEWORKER, ADMIN].includes(
                              signedinUserRoleHT
                            ) && (
                                <>
                                  <Tooltip title={t("common:child.Edit Child")}>
                                    <IconButton
                                      component={RouterLink}
                                      to={`/dashboard/children/${child.id}/edit`}
                                      size="small"
                                    >
                                      <PencilAltIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t("common:child.Delete Child")}>
                                    <IconButton
                                      onClick={() => {
                                        handleDelete(child.id, child.HTFamilyId);
                                      }}
                                      size="small"
                                    >
                                      <TrashIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            <Tooltip title={t("common:common.Assessments & Progress Reports", "Assessments & Progress Reports")}>
                              <IconButton
                                onClick={() => {
                                  navigate(`/dashboard/children/${child.id}/view`, {
                                    state: { tabvalue: "assessmentsProgressReports" },
                                  });
                                }}
                                size="small"
                              >
                                <AssessmentProgressReportIcon fontSize="14px" />
                                {/* <ChartSquareBarIcon fontSize="small" /> */}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}
        {childList && childList.length === 0 && !loading && (
          <Box sx={{ width: "100%", textAlign: "center", mt: 5, mb: 1 }}>
            <Box>
              <Typography>{t("common:common.No Children")}</Typography>
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
      <Dialog
        aria-labelledby="simple-dialog-title"
        open={addFamilyModalFlag}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="simple-dialog-title">
          {" "}
          <Box display="flex" alignItems="center">
            <Box flexGrow={1}></Box>
            <Box>
              <IconButton onClick={onAddFamilyClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent style={{ height: "350px" }}>
          <Button
            startIcon={<PlusIcon fontSize="small" />}
            sx={{ mr: 1, mb: 2 }}
            variant="contained"
            onClick={handleAddFamily}
          >
            {t("common:family.Add New Family")}
          </Button>
          <Typography level="h3" sx={{ ml: 8, mb: 2 }}>
            {t("common:common.OR")}
          </Typography>
          <Typography level="h3" sx={{ ml: 1, mb: 2 }}>
            {t("common:common.Assign existing Family")}
          </Typography>
          <Grid item md={6} xs={12} sx={{ mt: -2 }}>
            <TextField
              sx={{ width: "300px" }}
              name="family"
              accessKey="familyName"
              component={AutoCompleteDropdownToFilter}
              getValueFunction={(value) => {
                handleFamilyChange(value);
              }}
              label="family"
              options={familyList}
              textFieldProps={{
                fullWidth: true,
                margin: "normal",
                variant: "outlined",
                label: t("common:common.Choose Family"),
              }}
            />
          </Grid>
          <Grid item md={12} xs={12} sx={{ mt: 2 }}>
            {loadingFamilyDetails && (
              <Table
                sx={{
                  [`& .${tableCellClasses.root}`]: {
                    borderBottom: "none",
                  },
                }}
                size="small"
              >
                <TableBody>
                  <CircularProgress
                    sx={{
                      zIndex: 100000,
                      ml: 9,
                      mt: 4,
                    }}
                    color="primary"
                  />
                </TableBody>
              </Table>
            )}

            {familyDetails ? (
              <>
                <Grid
                  item
                  md={12}
                  xs={12}
                  style={{ display: "flex" }}
                  sx={{ mt: 1 }}
                  gap={1}
                >
                  <Typography color="textPrimary" variant="subtitle2">
                    {t("common:common.Family ID")}
                  </Typography>
                  <Typography color="textPrimary" variant="subtitle2">
                    :
                  </Typography>
                  <Typography color="textPrimary" variant="subtitle2">
                    <b>{` ${familyDetails.autogeneratedid}`}</b>
                  </Typography>
                </Grid>
                <Grid
                  item
                  md={12}
                  xs={12}
                  style={{ display: "flex" }}
                  sx={{ mt: 1 }}
                  gap={1}
                >
                  <Typography color="textPrimary" variant="subtitle2">
                    {t("common:common.Caregiver(s)")}
                  </Typography>
                  <Typography color="textPrimary" variant="subtitle2">
                    :
                  </Typography>
                  <Typography color="textPrimary" variant="subtitle2">
                    <b>{CaregiversNames}</b>
                  </Typography>
                </Grid>
                <Grid
                  item
                  md={12}
                  xs={12}
                  style={{ display: "flex" }}
                  sx={{ mt: 1 }}
                  gap={1}
                >
                  <Typography color="textPrimary" variant="subtitle2">
                    {t("common:common.Address")}
                  </Typography>
                  <Typography color="textPrimary" variant="subtitle2">
                    :
                  </Typography>
                  <Typography color="textPrimary" variant="subtitle2">
                    <b>
                      {familyDetails.addressLine1 +
                        ", " +
                        (familyDetails.addressLine2
                          ? familyDetails.addressLine2 + ", "
                          : "") +
                        familyDetails.city +
                        ", " +
                        (locationList &&
                          familyDetails?.HTDistrictId &&
                          getDistrictList(
                            locationList,
                            familyDetails?.HTCountryId,
                            familyDetails?.HTStateId
                          )?.find(
                            (dis) => dis.id == familyDetails?.HTDistrictId
                          )?.districtName) +
                        ", " +
                        (locationList &&
                          getStateList(
                            locationList,
                            familyDetails?.HTCountryId
                          )?.find(
                            (state) => state.id == familyDetails?.HTStateId
                          )?.stateName)}
                    </b>
                  </Typography>
                </Grid>
              </>
            ) : (
              <></>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="primary" autoFocus onClick={onAddFamilyClose}>
            {t("common:common.Cancel")}
          </Button>
          <Button
            color="primary"
            variant="contained"
            disabled={disabledOnFamilySave || familyDetails === null}
            onClick={() => {
              handleFamilySave();
            }}
          >
            {t("common:common.Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

ChildListTable.propTypes = {
  childList: PropTypes.array.isRequired,
};

export default ChildListTable;