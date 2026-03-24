import { useState, useContext, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
//import numeral from 'numeral';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  Chip,
  Checkbox,
  IconButton,
  InputAdornment,
  // Link,
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
  CircularProgress
} from '@mui/material';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import PlusIcon from '../../../../assets/icons/Plus';
import TrashIcon from '../../../../assets/icons/Trash';
import PencilAltIcon from '../../../../assets/icons/PencilAlt';
import SearchIcon from '../../../../assets/icons/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import toast from 'react-hot-toast';
import APIS from '../../../../common/hooks/UseApiCalls';
// import AutoCompleteDropdownToFilter from '../../../../components/UserComponents/AutoCompleteDropdownToFilter'




const applyFilters = (families, query, filters) => families
  .filter((family) => {
    let matches = true;

    if (query) {
      const properties = ['email', 'name'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (family[property].toLowerCase().includes(query.toLowerCase())) {
          containsQuery = true;
        }
      });

      if (!containsQuery) {
        matches = false;
      }
    }

    Object.keys(filters).forEach((key) => {
      const value = filters[key];

      if (value && family[key] !== value) {
        matches = false;
      }
    });

    return matches;
  });

const applyPagination = (families, page, limit) => families
  .slice(page * limit, page * limit + limit);


const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }

  if (b[orderBy] > a[orderBy]) {
    return 1;
  }

  return 0;
};

const getComparator = (order, orderBy) => (order === 'desc'
  ? (a, b) => descendingComparator(a, b, orderBy)
  : (a, b) => -descendingComparator(a, b, orderBy));

const applySort = (families, sort) => {
  const [orderBy, order] = sort.split('|');
  const comparator = getComparator(order, orderBy);
  const stabilizedThis = families.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const newOrder = comparator(a[0], b[0]);

    if (newOrder !== 0) {
      return newOrder;
    }

    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
};



const CaseListTable = (props) => {
  const { t } = useTranslation(['common']);

  const sortOptions = [
    {
      label: t('common:common.None'),
      id: 'none'
    },
    {
      label: t('common:common.Case Worker'),
      id: 'TWUserId'
    },
    {
      label: t('common:common.Child'),
      id: 'HTChildId'
    }
  ];

  const { families, getFamilyList, loading, savePageData, pageCount, pageData, saveCurrentPage, getCaseList, ...other } = props;
  const { signedinUserRole, signedinOrgType } = useContext(CommonDataContext);
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedFamilies, setSelectedFamilies] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [modalFlag, setModalFlag] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState('ASC');
  const [filters, setFilters] = useState({
    hasAcceptedMarketing: null,
    isProspect: null,
    isReturning: null
  });
  let singleClickTimer = '';
  let clickCount = 0;

  const parseCases = (caseList) => {
    return caseList
  }
  const theme = useTheme();

  const handleClose = () => {
    setModalFlag(!modalFlag);
    setSelectedCaseId(null);

  };

  const openModal = (value) => {
    setSelectedCaseId(value)
    setModalFlag(!modalFlag);

  };

  const deleteCase = async () => {
    try {
      const selectedChildId = paginatedCases.find(item => item.id === selectedCaseId)?.HTChildId
      const statusPayload = {
        "id": selectedCaseId,
        "HTChildId": selectedChildId,
        "isActive": "true",
        "isDeleted": "true"
      }
      // console.log(statusPayload)
      await APIS.DeleteCase(statusPayload)
        .then((res) => {
          // console.log(res);
          // console.log(res.data.Message);
          if (res.data.Message !== "Case deleted Successfully") {
            toast.error(res.data.Message);
            setModalFlag(false);
            // setSelectedCaseId(null);
            getCaseList();
          }
          else if (res.data.Message === "Case deleted Successfully") {
            toast.success('Case Deleted Successfully');
            setModalFlag(false);
            setSelectedCaseId(null);
            getCaseList();
          }
          else {
            toast.error('Something went wrong');
            setModalFlag(false);
            setSelectedCaseId(null);
            getCaseList();
            // setStatus({ success: false });
          }
        })

    } catch (err) {
      console.log(err, 'error')
      toast.error('Something went wrong');
      // setStatus({ success: false });
      // setErr/ors({ submit: err.message });
    }
  }


  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    if (event.target.value === "") {
      getCaseList({
        "globalSearchQuery": '',
        "pageNumber": "1",
      });
    } else {
      if (open) {
        let payload = {
          "globalSearchQuery": event.target.value,
          "pageNumber": "1",
          // "orgTypeFilter" : typeFilter,
          // "orgStatus" : statusFilter
        }
        getCaseList(payload)
      } else {
        getCaseList({
          "globalSearchQuery": event.target.value,
          "pageNumber": "1",
        })
      }
    }
    setQuery(event.target.value);
    setPage(1);
  };

  // const handleSortChange = (value) => {
  //   setSort(value);
  //   let payload={}
  //    if(value=='none'){
  //     payload = {
  //       "orderByField": [

  //     ],
  //     "pageNumber": "1",
  //     "globalSearchQuery" : query
  //     }

  //    }else{
  //     payload = {
  //       "orderByField": [
  //         [
  //             `${value}`,
  //             "ASC"
  //         ]
  //     ],
  //     "pageNumber": "1",
  //     "globalSearchQuery" : query
  //     }

  //    }

  //   getCaseList(payload);
  //   setPage(1);
  //   setSortOrder('ASC')
  // };

  const handleSingleClickColumn = (value) => {

    let payload = {
      "orderByField": [
        [
          `${value}`,
          `${sortOrder === 'ASC' ? 'DESC' : 'ASC'}`
        ]
      ],
      "pageNumber": "1",
      "globalSearchQuery": query
    }
    getCaseList(payload)
    setSort(value)
    setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    setPage(1);

  }

  const handleDblClickColumn = (value) => {

    let payload = {
      "orderByField": [
        [

        ]
      ],
      "pageNumber": "1",
      "globalSearchQuery": query
    }
    getCaseList(payload)
    setSort('none');
    setPage(1);

  }

  const handleClickColumn = (value) => {
    clickCount++;
    if (clickCount === 1) {

      singleClickTimer = setTimeout(function () {
        clickCount = 0;
        handleSingleClickColumn(value)
      }, 300);

    } else if (clickCount === 2) {
      clearTimeout(singleClickTimer);
      clickCount = 0;
      handleDblClickColumn();
    }
  }

  const loadDefaultList = () => {
    setQuery('')
    getCaseList({
      "globalSearchQuery": '',
    });
  }

  const handleSelectAllFamilies = (event) => {
    setSelectedFamilies(event.target.checked
      ? families.map((family) => family.id)
      : []);
  };

  useEffect(() => {
    setPagedata()
    return () => {
    }
  }, [pageData])

  const setPagedata = () => {
    if (localStorage.getItem('casePageData') === null) {
      setPage(pageData.page);
      setQuery(pageData.query);
      setSort(pageData.sort);
    } else {
      let localPageData = JSON.parse(localStorage.getItem('casePageData'))
      setPage(localPageData.page);
      setQuery(localPageData.query);
      setSort(localPageData.sort);
    }
  }

  const handleViewChange = () => {
    let pageObject = {
      page: page,
      query: query,
      sort: sort
    }
    savePageData(pageObject)
  }

  const handleAddAssessment = (caseId) => {
    handleViewChange()
    navigate(`/dashboard/assessments/add`, {
      state: {
        "fromCaseList": true,
        "caseId": caseId
      }
    });
  }


  // const handleSelectOneFamily = (event, id) => {
  //   if (!selectedFamilies.includes(id)) {
  //     setSelectedFamilies((prevSelected) => [...prevSelected, id]);
  //   } else {
  //     setSelectedFamilies((prevSelected) => prevSelected.filter((id) => id !== id));
  //   }
  // };

  const handlePageChange = (event, newPage) => {
    getCaseList({
      "pageNumber": newPage,
      "globalSearchQuery": query
    })
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
  };

  const stringToDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date([month, day, year].join('/'));
  };

  const getDate = (dateString) => {
    let yourDate = new Date(stringToDate(dateString))
    // yourDate.toISOString().split('T')[0];
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
    return yourDate.toISOString().split('T')[0]
  }

  // const filteredCustomers = applyFilters(customers, query, filters);
  // const sortedCustomers = applySort(filteredCustomers, sort);
  // const paginatedCustomers = applyPagination(sortedCustomers, page, limit);
  const paginatedCases = parseCases(families);
  // const paginatedCases = [{
  //   id: 1,
  //   caseID: 1001,
  //   caseWorkerName: "Worker 1",
  //   childName: "Child 1",
  //   createdBy: "Miracle",
  //   createdDate: "1 Januray 2021",
  //   editAssessment: false,
  //   numberOfAssessments: 2
  // },{
  //   id: 2,
  //   caseID: 1002,
  //   caseWorkerName: "Worker 2",
  //   childName: "Child 2",
  //   createdBy: "Miracle",
  //   createdDate: "1 Januray 2021",
  //   editAssessment: true,
  //   numberOfAssessments: 2
  // }]
  const enableBulkActions = selectedFamilies.length > 0;
  const selectedSomeFamilies = selectedFamilies.length > 0
    && families.length > 0 && selectedFamilies.length < families.length;
  const selectedAllFamilies = selectedFamilies.length === families?.length;

  return (
    <Card {...other}>
      {/* <Tabs
        indicatorColor="primary"
        onChange={handleTabsChange}
        scrollButtons="auto"
        textColor="primary"
        value={currentTab}
        variant="scrollable"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
          />
        ))}
      </Tabs> */}


      {/* <Divider /> */}


      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          pt: 2,
          //m: -1,
          p: 2
        }}
      >
        <Box
          sx={{
            m: 1,
            maxWidth: '100%',
            width: 500
          }}
        >
          <TextField
            fullWidth
            InputProps={{
              startAdornment:
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>,
              endAdornment:
                query.length > 0 && <IconButton
                  color="inherit"
                  onClick={() => loadDefaultList()}>
                  <ClearIcon />
                </IconButton>
            }}
            onChange={handleQueryChange}
            placeholder={t('common:case.Search case')}
            value={query}
            variant="outlined"
          />

        </Box>
        <Box
          sx={{
            m: 1,
            width: 20
          }}
        >
          <FilterListIcon />

        </Box>
        {/* <Box
          sx={{
            m: 1,
            width: 240
          }}
        >
          <TextField
            fullWidth          
            name="sort"
            accessKey="label"
            component={AutoCompleteDropdownToFilter}
            getValueFunction={(value)=>{handleSortChange(value)}}
            label="sort"
            defaultVal={sortOptions[0]}
            options={sortOptions}
            textFieldProps={{
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              label:t('common:common.Sort By')
           }}
           />
        </Box> */}
      </Box>
      {enableBulkActions && (
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              backgroundColor: 'background.paper',
              mt: '6px',
              position: 'absolute',
              px: '4px',
              width: '100%',
              zIndex: 2
            }}
          >
            <Checkbox
              checked={selectedAllFamilies}
              color="primary"
              indeterminate={selectedSomeFamilies}
              onChange={handleSelectAllFamilies}
            />


            <Button
              color="primary"
              sx={{ ml: 2 }}
              variant="outlined"
            >
              Delete
            </Button>
            <Button
              color="primary"
              sx={{ ml: 2 }}
              variant="outlined"
            >
              Edit
            </Button>
          </Box>
        </Box>
      )}
      <Scrollbar>

        {loading &&
          <CircularProgress
          sx={{
            zIndex: 1000,
            position: "fixed",
            top: "50%",   // Adjusted to 50% to center vertically
            left: "50%",  // Adjusted to 50% to center horizontally
            transform: "translate(-50%, -50%)"  // Centering trick
          }}
            color="primary"
          />
        }

        <Box className={paginatedCases.length ? "scrollListTable" : ""} sx={{ minWidth: 'auto' }}>

          {paginatedCases && paginatedCases.length > 0 && <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  {t('common:child.Case ID')}
                </TableCell>
                <TableCell onClick={() => handleClickColumn('TWUserId')}>
                  <TableSortLabel
                    active={sort === 'TWUserId'}
                    direction={sortOrder === 'ASC' ? 'asc' : 'desc'}
                  >
                    {t('common:common.Case Worker')}
                  </TableSortLabel>
                </TableCell>
                <TableCell onClick={() => handleClickColumn('HTChildId')}>
                  <TableSortLabel
                    active={sort === 'HTChildId'}
                    direction={sortOrder === 'ASC' ? 'asc' : 'desc'}
                  >
                    {t('common:common.Child')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  {t('common:common.Status')}
                </TableCell>
                <TableCell
                  align="center" sx={{ pl: 4 }}
                >
                  {t('common:common.Actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCases.map((cases) => {
                const isFamilySelected = selectedFamilies.includes(cases.id);
                return (
                  <TableRow
                    hover
                    key={cases.id}
                    selected={isFamilySelected}
                  >
                    <TableCell>
                      {cases.caseid}
                    </TableCell>
                    <TableCell>
                      {`${cases.userFirstName} ${cases.userLastName}`}
                    </TableCell>
                    <TableCell>
                      {`${cases.childFirstName} ${cases.childLastName}`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color="primary"
                        label={t(`common:common.${cases.caseStatus}`)}
                        size="small"
                        sx={{ backgroundColor: cases && cases.caseStatus === 'Open' ? "#4caf50" : "#f44336", }}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                    >
                      {((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) &&
                        (signedinUserRole === 'admin' || signedinUserRole === 'caseworker')) && cases.caseStatus === 'Open'
                        ? <Tooltip title={t('common:assessment.Add Assessment')}>
                          <IconButton
                            //component={RouterLink}
                            onClick={() => handleAddAssessment(cases.id)}
                          //to={`/dashboard/assessments/add`}
                          >
                            <PlusIcon fontSize="10px" />
                          </IconButton>
                        </Tooltip> : <></>}
                      {((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) &&
                        (signedinUserRole === 'admin' || signedinUserRole === 'caseworker'))
                        ? <Tooltip title={t('common:case.Edit Case')}>
                          <IconButton
                            component={RouterLink}
                            onClick={handleViewChange}
                            to={`/dashboard/cases/${cases.id}/edit`}
                          >
                            <PencilAltIcon fontSize="small" />
                          </IconButton>
                        </Tooltip> : <></>}
                      {((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) &&
                        (signedinUserRole === 'admin' || signedinUserRole === 'caseworker'))
                        ? <Tooltip title={t('common:case.Delete Case')}>
                          <IconButton
                            onClick={(e) => { openModal(cases.id) }}
                          //disabled={true}
                          >
                            <TrashIcon fontSize="small" />
                          </IconButton>
                        </Tooltip> : <></>}
                      <Tooltip title={t('common:case.View Case')}>
                        <IconButton
                          component={RouterLink}
                          onClick={handleViewChange}
                          to={`/dashboard/cases/${cases.id}/view`}
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
          }
          {paginatedCases && paginatedCases.length === 0 &&
            <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
              <Box>
                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    item
                    md={3} //6
                    xs={6} //12
                  >
                    <Typography>{t('common:case.No Cases to list')}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          }
        </Box>
      </Scrollbar>
      <Box sx={{ display: 'flex' }} flexDirection="row-reverse" p={1} m={1}>
        <Box sx={{ alignContent: 'flex-end' }}>

          <Pagination onChange={handlePageChange} page={page} count={pageCount} shape="rounded" />
        </Box>
      </Box>
      <Dialog aria-labelledby="simple-dialog-title" open={modalFlag}>

        <DialogTitle id="simple-dialog-title">{t('common:question.Are you sure')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <br></br>
            {t('common:case.confirmdelete')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteCase} color="primary">
            {t('common:common.Yes')}
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            {t('common:common.No')}
          </Button>
        </DialogActions>

      </Dialog>
    </Card>
  );
};

CaseListTable.propTypes = {
  families: PropTypes.array.isRequired
};

export default CaseListTable;
