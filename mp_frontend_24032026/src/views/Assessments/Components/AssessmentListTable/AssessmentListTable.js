import { useState, useEffect, useContext, useCallback  } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import FilterListIcon from '@material-ui/icons/FilterList';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  Checkbox,
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
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import PencilAltIcon from '../../../../assets/icons/PencilAlt';
import SearchIcon from '../../../../assets/icons/Search';
import Check from '../../../../assets/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import useMounted from '../../../../common/hooks/UseMounted';
import APIS from '../../../../common/hooks/UseApiCalls'
import AutoCompleteDropdownToFilter from '../../../../components/UserComponents/AutoCompleteDropdownToFilter';




const columnHeaders = [
  
  {
    label: 'assessment.Child Name',
    value: 'childFirstName'
  },
  {
    label: 'assessment.Case Worker Name',
    value: 'caseWorkerName'
  },
  {
    label: 'common.Name of Child Care Institution',
    value: 'organizationName'
  },
  {
    label: 'assessment.Date of Assessment',
    value: 'dateOfAssessment'
  },
  {
    label: 'common.Submitted Date',
    value: ''
  },
  {
    label: 'common.Score',
    value: ''
  },
  {
    label: 'common.Actions',
    value: '',
  }
];

const applyFilters = (assessments, query, filters) => assessments
  .filter((assessment) => {
    let matches = true;

    if (query) {
      const properties = ['email', 'name'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (assessment[property].toLowerCase().includes(query.toLowerCase())) {
          containsQuery = true;
        }
      });

      if (!containsQuery) {
        matches = false;
      }
    }

    Object.keys(filters).forEach((key) => {
      const value = filters[key];

      if (value && assessment[key] !== value) {
        matches = false;
      }
    });

    return matches;
  });

const applyPagination = (assessments, page, limit) => assessments
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

const applySort = (assessments, sort) => {
  const [orderBy, order] = sort.split('|');
  const comparator = getComparator(order, orderBy);
  const stabilizedThis = assessments.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const newOrder = comparator(a[0], b[0]);

    if (newOrder !== 0) {
      return newOrder;
    }

    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
};

const stringToDate = (dateString) => {
  const [day, month, year] = dateString.split('/');
  return new Date([month, day, year].join('/'));
};

const getDate = (dateString) => {
  let yourDate = new Date(stringToDate(dateString))
  // yourDate.toISOString().split('T')[0];
  const offset = yourDate.getTimezoneOffset()
  yourDate = new Date(yourDate.getTime() - (offset*60*1000))
  return yourDate.toISOString().split('T')[0]
}



const AssessmentListTable = (props) => {
  const { t } = useTranslation(['common']);
  const sortOptions = [
    {
      label: t('common:assessment.None'),
      id: 'none'
    },
    
    {
      label: t('common:assessment.Case Worker Name'),
      id: 'caseWorkerName'
    },
    {
      label: t('common:assessment.Child Name'),
      id: 'childFirstName'
    },
    {
      label: t('common:assessment.Date of Assessment'),
      id: 'dateOfAssessment'
    },
    {
      label: t('common:assessment.Name of Child Care Institution'),
      id: 'organizationName'
    },
    
  ];
  
  const statusOptions = [
    {
      label: t('common:common.All'),
      id: 'All'
    },
    {
      label: t('common:common.Completed'),
      id: 'Completed'
    },
    {
      label: t('common:common.In Progress'),
      id: 'Not Completed'
    }
  ];
  const { assessments, getAssessmentList, loading, savePageData, pageCount, pageData,setPageData, saveCurrentPage, ...other } = props;
  const [selectedAssessments, setSelectedAssessments] = useState([]);
  const { signedinOrgType,signedinUserRole } = useContext(CommonDataContext)
  const mounted = useMounted();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [open,setOpen] = useState(false);
  const [sort, setSort] = useState(sortOptions[3].id);
  const [sortOrder, setSortOrder] = useState('ASC');
  const [orgOptions, setOrgOptions] = useState([{id:'0',organizationName:'All'}]);
  const [typeFilter, setTypeFilter] = useState(orgOptions && orgOptions[0].id);
  const [statusFilter, setStatusFilter] = useState(statusOptions && statusOptions[0].id);
  const [filters, setFilters] = useState({
    hasAcceptedMarketing: null,
    isProspect: null,
    isReturning: null
  });
  const [signedinOrgId, setSignedinOrgId] = useState('');
  let singleClickTimer='';
  let clickCount=0;

  const parseAssessments = (assessments) => {
    return assessments
  }
  const theme = useTheme();

  const getOrgList = useCallback(async () => {
    try {
      const data = await APIS.LinkedOrganizationList();
      if (data && data.data && data.data.orgSelectionList.length) {
        setOrgOptions([{id:0,organizationName:'All'}, ...data.data.orgSelectionList])
      }
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  useEffect(() => {
    setPagedata();
    getOrgList()
  },[])

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    if(event.target.value === ""){
      getAssessmentList({
        "globalSearchQuery" : '',
        "pageNumber": "1",
        "isComplete":statusFilter=='All'?'':statusFilter,
        "organizationFilter":typeFilter==0?'':typeFilter,
      });
    }else {
      let payload = {
        "globalSearchQuery" : event.target.value,
        "pageNumber": "1",
        "isComplete":statusFilter=='All'  || statusFilter=="undefined" ?'':statusFilter,
        "organizationFilter":typeFilter==0?'':typeFilter,
        
      }
      getAssessmentList(payload);
      setPage(1);
    }
  };

  const handleSortChange = (value) => {
    setSort(value);
    let payload={}
    if(value=='none')
    {
      payload = {
        "orderByField": [
         
        ],
        "pageNumber": "1",
        "isComplete":statusFilter,
        "globalSearchQuery" : query
      }

    }else{
      payload = {
        "orderByField": [
          [
              `${value}`,
              "ASC"
          ]
        ],
        "pageNumber": "1",
        "isComplete":statusFilter,
        "globalSearchQuery" : query
      }

    }
     
    getAssessmentList(payload);
    setPage(1)
    setSortOrder('ASC')
  };

  const handleSingleClickColumn = (value) => {
    
      let payload = {
        "orderByField": [
          [
              `${value}`,
              `${sortOrder === 'ASC' ? 'DESC' : 'ASC'}`
          ]
        ],
        "pageNumber": "1",
        "isComplete":statusFilter=='All'?'':statusFilter,
        "organizationFilter":typeFilter==0?'':typeFilter,
        "globalSearchQuery" : query
      }
      getAssessmentList(payload)
      setSort(value)
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
       setPage(1);
    
  }

  const handleDblClickColumn = () => {
    
      let payload = {
        "orderByField": [
          [
             
          ]
        ],
        "pageNumber": "1",
        "isComplete":statusFilter=='All'?'':statusFilter,
        "organizationFilter":typeFilter==0?'':typeFilter,
        "globalSearchQuery" : query
      }
      getAssessmentList(payload)
      setSort('none');
      setPage(1);
   
  }

  const handleClickColumn=(value)=>{
    clickCount++;
  if (clickCount === 1) {
    
    singleClickTimer = setTimeout(function() {
      clickCount=0;
      handleSingleClickColumn(value)
    }, 300);

  } else if (clickCount === 2) {
    clearTimeout(singleClickTimer);
    clickCount=0;
    handleDblClickColumn();
  }
}

  const loadDefaultList = () => {
    setQuery('')
    getAssessmentList({
      "globalSearchQuery" : '',
      "organizationFilter": typeFilter==0?'':typeFilter,
      "isComplete": statusFilter=='All' || statusFilter=='undefined'?'':statusFilter,

    });
  }
  const handleSelectAllAssessments = (event) => {
    setSelectedAssessments(event.target.checked
      ? assessments.map((assessment) => assessment.id)
      : []);
  };

  useEffect(() => {
    setPagedata();
    setSignedinOrgId(localStorage.getItem('orgId'));
    return () => {
    }
  },[pageData])

  const setPagedata = () => {
    if(localStorage.getItem('assessmentPageData') === null || localStorage.getItem('assessmentPageData')=='' ){
      setPage(pageData.page);
      setQuery(pageData.query);
      setSort(pageData.sort);
    } else {
      let localPageData = JSON.parse(localStorage.getItem('assessmentPageData'))
      setPage(localPageData.page);
      setQuery(localPageData.query);
      setSort(localPageData.sort);
     // setTypeFilter(localPageData.orgFilter=="0"?'':localPageData.orgFilter);
      //setStatusFilter(localPageData.isComplete=="All"?'':localPageData.isComplete);
    }
  }

  const handleViewChange = () => {
    let pageObject = {
      page:page, 
      query:query,
      sort:sort,
      order:sortOrder,
      isComplete:statusFilter,
      orgFilter:typeFilter
    }
    savePageData(pageObject)
  }


  // const handleSelectOneAssessment = (event, id) => {
  //   if (!selectedAssessments.includes(id)) {
  //     setSelectedAssessments((prevSelected) => [...prevSelected, id]);
  //   } else {
  //     setSelectedAssessments((prevSelected) => prevSelected.filter((id) => id !== id));
  //   }
  // };

  const handlePageChange = (event, newPage) => {
    getAssessmentList({
      pageNumber:newPage,
      organizationFilter: typeFilter==0?'':typeFilter,
      globalSearchQuery : query,
      //assessmentStatus: statusFilter
      isComplete: statusFilter=='All'?'':statusFilter,
      orderByField: [
        [
            sort,
            sortOrder === 'DESC' ? 'DESC' : 'ASC'
        ]
      ],
    })
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
  };

  const handleTypeFilter = (value) => {
    let payload = {

     "organizationFilter" : parseInt(value, 10),
     //"assessmentStatus" : statusFilter,
     "isComplete":statusFilter,
      "pageNumber": "1",
      "orderByField": [
        [
            sort,
            "ASC"
        ]
      ],
    }
    getAssessmentList(payload)
    setTypeFilter(parseInt(value, 10));
  }
  const handleStatusFilter = (value) => {
    let payload = {
      "organizationFilter" : typeFilter,
      //"assessmentStatus" : event.target.value,
      "isComplete": value,
      "pageNumber" : "1",
      "orderByField": [
        [
            sort,
            "ASC"
        ]
      ],
    }
    getAssessmentList(payload)
    setStatusFilter(value);
  };
  const handleFilterChange = () => {
    if(open){
      getAssessmentList()
    }else{
    setTypeFilter(orgOptions && orgOptions[0].id)
    setStatusFilter(statusOptions && statusOptions[0].value)
    let payload = {
      "organizationFilter" : parseInt(typeFilter, 10),
      "assessmentStatus" : statusFilter,
    }
    getAssessmentList(payload)
    }
    setOpen(!open)
     
  }

  // const filteredCustomers = applyFilters(customers, query, filters);
  // const sortedCustomers = applySort(filteredCustomers, sort);
  // const paginatedCustomers = applyPagination(sortedCustomers, page, limit);
  const paginatedAssessments = parseAssessments(assessments);
  const enableBulkActions = selectedAssessments.length > 0;
  const selectedSomeAssessments = selectedAssessments.length > 0
    && assessments.length > 0 && selectedAssessments.length < assessments.length;
  const selectedAllAssessments = selectedAssessments.length === assessments?.length;

  return (
    <Card {...other}>


      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          pt : 2,
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
                onClick={()=>loadDefaultList()}>
                  <ClearIcon/>
                </IconButton>
            }}
            onChange={handleQueryChange}
            placeholder={t('common:assessment.Search Assessment')}
            value={query}
            variant="outlined"
          />
          
        </Box>
        <Box
          sx={{
            mr: 4,
            width: 20
          }}
        >
          <IconButton
              color="inherit"
              onClick={()=>handleFilterChange()}
            >
            <FilterListIcon/>
            </IconButton>
          
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
              checked={selectedAllAssessments}
              color="primary"
              indeterminate={selectedSomeAssessments}
              onChange={handleSelectAllAssessments}
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

      {loading && <CircularProgress 
        sx={{zIndex : 1000,
              position : "absolute",
              top : "55%",
              left : "45%"}}
        color="primary" />}
        <Box className={paginatedAssessments?.length ? "scrollListTable" : ""} sx={{ minWidth: 'auto' }}>
          { open && 
          <Box 
            sx={{ ml: 2,mt:1,mb :1 }}
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                    item
                    md={3} //6
                    xs={6} //12
                    sx={{ mt: -2 }}
                   >
                   <TextField
                     sx={{width : 250,ml :1}}         
                     name="status"
                     accessKey="label"
                     component={AutoCompleteDropdownToFilter}
                     getValueFunction={(value)=>{handleStatusFilter(value)}}
                     label="status"
                     defaultVal="All"
                     options={statusOptions}
                     textFieldProps={{
                       fullWidth: true,
                       margin: "normal",
                       variant: "outlined",
                       label:t('common:common.Status')
                    }}
                    />
                                   
                 </Grid>
                 <Grid
                  item
                  md={3} //6
                  xs={6} //12
                  sx={{ mt: -2 }}
                >
                  { (parseInt(signedinOrgType) !== 3 && parseInt(signedinOrgType) !== 4) &&                
                    <TextField
                    sx={{width : 250,ml :1}}         
                    name="cci"
                    accessKey="organizationName"
                    component={AutoCompleteDropdownToFilter}
                    getValueFunction={(value)=>{handleTypeFilter(value)}}
                    label="cci"
                    defaultVal={orgOptions[0]}
                    options={orgOptions}
                    textFieldProps={{
                      fullWidth: true,
                      margin: "normal",
                      variant: "outlined",
                      label:t('common:common.Name of Child Care Institution')
                   }}
                   />
                  }
                </Grid>

                
                </Grid>

            </Box>
          }
          { paginatedAssessments && paginatedAssessments.length > 0 && <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAllCustomers}
                    color="primary"
                    indeterminate={selectedSomeCustomers}
                    onChange={handleSelectAllCustomers}
                  />
                </TableCell> */}
                {columnHeaders.map((option) => (
                  option.value ?
                    <TableCell onClick={() => handleClickColumn(option.value)}>
                      <TableSortLabel
                        active={sort === option.value}
                        direction={sortOrder === 'ASC' ? 'asc' : 'desc'}
                      >
                        {t(`common:${option.label}`)}
                      </TableSortLabel>
                    </TableCell>
                  :
                    <TableCell align={option.label==='Actions' ? "center" : ''}>
                      {t(`common:${option.label}`)}
                    </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAssessments.map((assessment) => {
                const isAssessmentSelected = selectedAssessments.includes(assessment.id);
                return (
                  <TableRow
                    hover
                    key={assessment.id}
                    selected={isAssessmentSelected}
                  >
                    {/* <TableCell padding="checkbox">
                      <Checkbox
                        checked={isCustomerSelected}
                        color="primary"
                        onChange={(event) => handleSelectOneCustomer(event, customer.id)}
                        value={isCustomerSelected}
                      />
                    </TableCell> */}
                    {/* <TableCell>
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex'
                        }}
                      >
                        <Box sx={{ ml: 1 }}>
                          <Link
                            color="inherit"
                            component={RouterLink}
                            to={`/dashboard/assessment/${assessment.id}/view`}
                            variant="subtitle2"
                          >
                      {assessment.childName}
                        </Box>
                      </Box>
                    </TableCell> */}
                    {/* <TableCell>
                      {assessment.caseId}
                    </TableCell> */}
                    <TableCell>
                      {assessment.childFirstName} {assessment.childLastName}
                    </TableCell>
                    <TableCell>
                      {assessment.caseWorkerFirstName} {assessment.caseWorkerLastName}
                    </TableCell>
                    <TableCell>
                      {assessment.organizationName}
                    </TableCell>
                    <TableCell>
                      {assessment.dateOfAssessment}
                    </TableCell>

                    <TableCell>
                     {assessment.isComplete ? assessment.updatedAt : ''}
                    </TableCell>
                    <TableCell>
                     {assessment.totalScore}
                    </TableCell>
                    <TableCell 
                    align="center"
                    >
                    {([3,4,5].includes(parseInt(signedinOrgType)) && assessment.organizationId === signedinOrgId)
                    ?(<Tooltip title={assessment.isComplete ? t('common:common.Completed') : t('common:assessment.Edit Assessment')}>
                      <IconButton
                        component={!assessment.isComplete ? RouterLink : ''}
                        onClick={handleViewChange}
                        to={`/dashboard/assessments/${assessment.id}/edit`}
                        state={{ editAssessment: true, formRevisionNumber: assessment.formRevisionNumber }}
                        disabled={!assessment.isComplete ? true : false}
                      >
                      {!assessment.isComplete ?
                        <PencilAltIcon fontSize="small"/>
                        : <Check fontSize="small"/> }
                      </IconButton>
                      </Tooltip>):<></>}
                      <Tooltip title={t('common:assessment.View Assessment')}>
                      <IconButton
                        component={RouterLink}
                        onClick={handleViewChange}
                        to={`/dashboard/assessments/${assessment.id}/view`}
                        state={{ viewAssessment: true, formRevisionNumber: assessment.formRevisionNumber }}
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
          { paginatedAssessments && paginatedAssessments.length === 0 &&
          <Box sx={{ width : "100%", ml : "40%", mt : 5,mb :1}}>
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
                          <Typography>{t('common:assessment.No Assessments to list')}</Typography>
                      </Grid>
                </Grid>
            </Box>
           </Box>
          }
        </Box>
      </Scrollbar>
      <Box sx={{display:'flex'}} flexDirection="row-reverse"  p={1} m={1}>
        <Box sx={{alignContent: 'flex-end'}}>
          <Pagination onChange={handlePageChange} page={page} count={pageCount} shape="rounded" />
        </Box>
      </Box>
    </Card>
  );
};

AssessmentListTable.propTypes = {
  assessments: PropTypes.array.isRequired
};

export default AssessmentListTable;
