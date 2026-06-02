import { useState, useEffect, useContext } from 'react';
// import { useTheme } from '@material-ui/core/styles';
import FilterListIcon from '@material-ui/icons/FilterList';
import { Link as RouterLink } from 'react-router-dom';
//import numeral from 'numeral';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import APIS from '../../../../common/hooks/UseApiCalls';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
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
  Grid
} from '@material-ui/core';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import PencilAltIcon from '../../../../assets/icons/PencilAlt';
import TrashIcon from '../../../../assets/icons/Trash';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '../../../../assets/icons/Search';
// import getInitials from '../../../../common/services';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import AutoCompleteDropdownToFilter from '../../../../components/UserComponents/AutoCompleteDropdownToFilter'



const columnHeaders = [
  {
    label: 'OrganizationId',
    value: ''
  },
  {
    label: 'Name',
    value: 'organizationName'
  },
  {
    label: 'Location',
    value: 'HTDistrictId'
  },
  {
    label: 'Phone Number',
    value: 'phoneNumber'
  },
  {
    label: 'Type',
    value: 'HTOrganizationTypeId'
  },
  {
    label: 'Status',
    value: 'isActive'
  },
  {
    label: 'Actions',
    value: '',
    styleValue: {pl : 6}
  }
];

// const applyFilters = (organizations, query, filters) => organizations
//   .filter((organization) => {
//     let matches = true;

//     if (query) {
//       const properties = ['email', 'name'];
//       let containsQuery = false;

//       properties.forEach((property) => {
//         if (organization[property].toLowerCase().includes(query.toLowerCase())) {
//           containsQuery = true;
//         }
//       });

//       if (!containsQuery) {
//         matches = false;
//       }
//     }

//     Object.keys(filters).forEach((key) => {
//       const value = filters[key];

//       if (value && organization[key] !== value) {
//         matches = false;
//       }
//     });

//     return matches;
//   });

// const applyPagination = (customers, page, limit) => customers
//   .slice(page * limit, page * limit + limit);

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

// const applySort = (organizations, sort) => {
//   const [orderBy, order] = sort.split('|');
//   const comparator = getComparator(order, orderBy);
//   const stabilizedThis = organizations.map((el, index) => [el, index]);

//   stabilizedThis.sort((a, b) => {
//     const newOrder = comparator(a[0], b[0]);

//     if (newOrder !== 0) {
//       return newOrder;
//     }

//     return a[1] - b[1];
//   });

//   return stabilizedThis.map((el) => el[0]);
// };



const OrganizationListTable = (props) => {
  const { t } = useTranslation(['common']);
  const sortOptions = [
    {
      label: t('common:common.None'),
      id: 'none'
    },
    {
      label: t('common:common.Location'),
      id: 'HTDistrictId'
    },
    {
      label: t('common:common.Name'),
      id: 'organizationName'
    },
    
    {
      label: t('common:common.Phone Number'),
      id: 'phoneNumber'
    },
    {
      label: t('common:common.Status'),
      id: 'isActive'
    },
    {
      label: t('common:common.Type'),
      id: 'HTOrganizationTypeId'
    }
  ];

  const statusOptions = [
    {
      label:  t('common:common.All'),
      id: 'All'
    },
    {
      label:  t('common:common.Active'),
      id: 'Active'
    },
    {
      label: t('common:common.Inactive'),
      id: 'Inactive'
    }
  ];
  const { organizations, getOrganisationlist,savePageData, pageCount, saveCurrentPage, pageData, loading, ...other } = props;
  const { locationList,typeList, getOrganizationList, signedinUserRole } = useContext(CommonDataContext)
  // const [currentTab, setCurrentTab] = useState('all');
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [open,setOpen] = useState(false);
  const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState('ASC');
  //advanced filter
  const typeOptions = [{id: '0',name: 'All'}, ...typeList ];
  const [typeFilter, setTypeFilter] = useState(typeOptions && typeOptions[0].id);
  const [statusFilter, setStatusFilter] = useState(statusOptions && statusOptions[0].id);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrgToDelete, setSelectedOrgToDelete] = useState(null);
  let singleClickTimer='';
  let clickCount=0;
  

  // const [filters, setFilters] = useState({
  //   hasAcceptedMarketing: null,
  //   isProspect: null,
  //   isReturning: null
  // });
  // const signedinOrgId = localStorage.getItem('orgId');
  const parseOrganisation = (organizations) => {
    return organizations
  }
  // const theme = useTheme();
  useEffect(() => {
    setPagedata()
    return () => {
    }
  },[pageData])

  // const typeOptions = [
  //   {
  //     id: '0',
  //     name: 'All'
  //   },
  //   {
  //     id: '1',
  //     name: 'Miracle Foundation'
  //   },
  //   {
  //     id: '2',
  //     name: 'Govt Officials'
  //   },
  //   {
  //     id: '3',
  //     name: 'CCI'
  //   },
  //   {
  //     id: '4',
  //     name: 'NGO'
  //   },
  // ];


  const setPagedata = () => {
      if(localStorage.getItem('orgPageData') === null){
        console.log("pagedata >>",pageData);
        setPage(pageData.page);
        setQuery(pageData.query);
        setSort(pageData.sort);
        setTypeFilter(pageData.typeFilter);
        setStatusFilter(pageData.statusFilter);
      } else {
        let localPageData = JSON.parse(localStorage.getItem('orgPageData'))
        console.log('savedData',localPageData)
        setPage(localPageData.page);
        setQuery(localPageData.query);
        setSort(localPageData.sort);
        setTypeFilter(localPageData.typeFilter);
        setStatusFilter(localPageData.statusFilter);
        if(localPageData.typeFilter||localPageData.statusFilter)
        {
          setOpen(true)
        }
    }
  }
  // const handleTabsChange = (event, value) => {
  //   const updatedFilters = {
  //     ...filters,
  //     hasAcceptedMarketing: null,
  //     isProspect: null,
  //     isReturning: null
  //   };

  //   if (value !== 'all') {
  //     updatedFilters[value] = true;
  //   }

  //   setFilters(updatedFilters);
  //   setSelectedCustomers([]);
  //   setCurrentTab(value);
  // };

  const handlePageChange = (event,value) => {
    getOrganisationlist({
      "pageNumber": value,
      "orgTypeFilter" : typeFilter,
      "orgStatus" : statusFilter
    })
    setPage(value);
  }

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    if(event.target.value === ""){
      getOrganisationlist({
        "globalSearchQuery" : '',
        "pageNumber": "1",
      });
    }else {
      if(open){
        let payload = {
          "globalSearchQuery" : event.target.value,
          "orgTypeFilter" : typeFilter,
          "orgStatus" : statusFilter,
          "pageNumber": "1",
        }
        getOrganisationlist(payload)
      }else{
      getOrganisationlist({
        "globalSearchQuery" : event.target.value,
        "pageNumber": "1",
        "orgTypeFilter" : typeFilter,
        "orgStatus" : statusFilter,
      })
    }
    }
    setQuery(event.target.value);
    setPage(1);
  };


  // const handleSearch = (event) =>{
  //   setQuery(event.target.value)
  //   let timer;
  //   clearTimeout(timer);
  //   timer = setTimeout(()=>{
  //     getOrganisationlist({
  //       "globalSearchQuery" : event.target.value,
  //     })
  //   },500)
  // }


  // const handleSortChange = (value) => {
  //   let payload ={}
  //   if(value=='none'){
  //     payload = {
  //       "orderByField": [
  //         [
             
  //         ]
  //     ],
  //     "pageNumber": "1",
  //   }}else{
  //   payload = {
  //     "orderByField": [
  //       [
  //           `${value}`,
  //           "ASC"
  //       ]
  //   ],
  //   "pageNumber": "1",
  //   }}
  //   getOrganisationlist(payload)
  //   setSort(value);
  //   setSortOrder('ASC')
  //   setPage(1);
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
      }
      getOrganisationlist(payload)
      setSort(value)
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
      setPage(1);
    
  }

   const handleDblClickColumn=()=>{
    let payload ={}
    payload = {
      "orderByField": [
        [
           
        ]
    ],
    "pageNumber": "1",
  }
  getOrganisationlist(payload)
  setSort('none');
  setSortOrder('ASC')
  setPage(1);
    
   }

  const handleClickColumn=(e,value)=>{
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

  
  const handleViewChange = () => {
    let pageObject = {
      page:page, 
      query:query,
      sort:sort,
      typeFilter:typeFilter,
      statusFilter:statusFilter
    }
    savePageData(pageObject)
  }

  const handleSelectAllOrganizations = (event) => {
    setSelectedOrganizations(event.target.checked
      ? organizations.map((organization) => organization.id)
      : []);
  };

  // const handleSelectOneOrganization = (event, customerId) => {
  //   if (!selectedOrganizations.includes(customerId)) {
  //     setSelectedOrganizations((prevSelected) => [...prevSelected, customerId]);
  //   } else {
  //     setSelectedOrganizations((prevSelected) => prevSelected.filter((id) => id !== customerId));
  //   }
  // };

  // const handlePageChange = (event, newPage) => {
  //   setPage(newPage);
  // };

  // const handleLimitChange = (event) => {
  //   setLimit(parseInt(event.target.value, 10));
  // };


  const handleTypeFilter = (value) => {
      let payload = {
        "orgTypeFilter" : value,
        "orgStatus" : statusFilter,
        "pageNumber": "1",
      }
    
    getOrganisationlist(payload)
    setPage(1);
    setTypeFilter(value);
  };

  const handleStatusFilter = (value) => {
    let payload = {
      "orgTypeFilter" : typeFilter,
      "orgStatus" : value,
      "pageNumber" : "1"
    }
    getOrganisationlist(payload)
    setPage(1);
    setStatusFilter(value);
  };

  const loadDefaultList = () => {
    setQuery('')
    getOrganisationlist({
      "globalSearchQuery" : '',
    });
  }

  const loadDefaultListOnClose = () => {
    if(open){
      setQuery('')
      getOrganisationlist({
        "globalSearchQuery" : '',
        "orgTypeFilter" : '',
        "orgStatus" : '',
      });
    }
    
  }

  // const handleFilterChange = () => {
  //   if(open){
  //     getOrganisationlist()
  //     console.log("working")
  //   }else{
  //   setTypeFilter(typeOptions && typeOptions[0].id)
  //   setStatusFilter(statusOptions && statusOptions[0].value)
  //   let payload = {
  //     "orgTypeFilter" : typeFilter,
  //     "orgStatus" : statusFilter
  //   }
  //   getOrganisationlist(payload)
  //   }
  //   setOpen(!open)
     
  // }

  const handleDelete = (id) => {
    setSelectedOrgToDelete(id);
    setIsOpen( !isOpen);
  };
  const handleClose= () => {
    setIsOpen(false);
  };
  const handleConfirmDelete =  async () => {
    try {
      const statusPayload ={
      "id": selectedOrgToDelete,
      "isActive": `true`,
      "isDeleted": "true"
      }
      await APIS.ChangeOrganizationStatus(statusPayload)
      .then((res) =>{
        if(res.data.Message !=="Organization deleted Successfully"){
        toast.error(res.data.Message);
        setIsOpen(false);
        getOrganizationList();
        getOrganisationlist();
        }
        else if(res.data.Message ==="Organization deleted Successfully"){
          toast.success(t('common:organization.Deleted Organization Successfully'));
          setIsOpen(false);
          getOrganizationList();
          getOrganisationlist();
        }
        else {
          toast.error(t('common:common.Something went wrong'));
          getOrganisationlist();
          getOrganizationList();
        }
      })
    }catch (err) {
      toast.error(t('common:common.Something went wrong'));
    }
  };    
  const paginatedOrganizations = parseOrganisation(organizations);
  const enableBulkActions = selectedOrganizations && selectedOrganizations.length > 0;
  const selectedSomeOrganizations = selectedOrganizations && selectedOrganizations.length > 0
    && selectedOrganizations.length < organizations.length;
  const selectedAllOrganizations = selectedOrganizations && organizations && selectedOrganizations.length === organizations.length;
  return (
    <Card 
    {...other}
    >
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
            //onKeyUp={handleSearch}
            placeholder={t('common:organization.Search organization name')}
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
              onClick={()=>{setOpen(!open);loadDefaultListOnClose()}}
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
            defaultVal="organizationName"
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
        <Box sx={{ position: 'relative'}}>
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
              checked={selectedAllOrganizations}
              color="primary"
              indeterminate={selectedSomeOrganizations}
              onChange={handleSelectAllOrganizations}
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

        <Box className={organizations.length ? "scrollListTable" : ""} sx={{ minWidth: 'auto' }}>
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
                     name="organization_type"
                     accessKey="name"
                     component={AutoCompleteDropdownToFilter}
                     getValueFunction={(value)=>{handleTypeFilter(value)}}
                     label="organization_type"
                     defaultVal={typeOptions[0]}
                     options={typeOptions}
                     textFieldProps={{
                       fullWidth: true,
                       margin: "normal",
                       variant: "outlined",
                       label:t('common:organization.Organization Type')
                    }}
                    />
                                   
                 </Grid>

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
                </Grid>

            </Box>
          }



          { organizations && organizations.length > 0 && 
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAllCustomers}
                    color="primary"
                    indeterminate={selectedSomeCustomers}
                    onChange={handleSelectAllCustomers}
                  />
                  onClick={() =>handleClickColumn(option.value)}
                </TableCell> */}
                {columnHeaders.map((option) => (
                  option.value ?
                    <TableCell  onClick={(e)=>handleClickColumn(e,option.value)}>
                      <TableSortLabel
                        active={sort === option.value}
                        direction={sortOrder === 'ASC' ? 'asc' : 'desc'}
                      >
                        {t(`common:common.${option.label}`)}
                      </TableSortLabel>
                    </TableCell>
                  :
                    <TableCell align={option.label==='Actions' ? "center" : ''} sx={option.style || null}>
                      {t(`common:common.${option.label}`)}
                    </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrganizations.map((organization) => {
                const isOrganizationSelected = selectedOrganizations.includes(organization.id);

                return (
                  <TableRow
                    hover
                    key={organization.id}
                    selected={isOrganizationSelected}
                  >
                    {/* <TableCell padding="checkbox">
                      <Checkbox
                        checked={isCustomerSelected}
                        color="primary"
                        onChange={(event) => handleSelectOneCustomer(event, customer.id)}
                        value={isCustomerSelected}
                      />
                    </TableCell> */}
                    <TableCell>{organization.organizationId}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex'
                        }}
                      >
                        {/* <Avatar
                          src={customer.avatar}
                          sx={{
                            height: 42,
                            width: 42
                          }}
                        >
                          {getInitials(customer.name)}
                        </Avatar> */}
                        <Box sx={{ ml: 1 }}>
                          <Link
                            color="inherit"
                            component={RouterLink}
                            to={`/dashboard/organizations/${organization.id}/view`}
                            variant="subtitle2"
                          >
                            {organization.organizationName}
                          </Link>
                          {/* <Typography
                            color="textSecondary"
                            variant="body2"
                          >
                            {customer.email}
                          </Typography> */}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {locationList && locationList?.districts && locationList?.districts?.length && 
                      `${locationList.districts.find(item => item.id === organization.HTDistrictId)?.districtName}, 
                      ${locationList && locationList.states && locationList.states.length && 
                        locationList.states.find(item => item.id === organization.HTStateId)?.stateName}, 
                      ${locationList && locationList.countries && locationList.countries.length && 
                        locationList.countries.find(item => item.id === organization.HTCountryId)?.countryName} `}
                    </TableCell>
                    <TableCell>
                      {organization.phoneNumber}
                    </TableCell>
                    <TableCell>
                      {typeList && typeList.length && `${t(`common:common.${typeList.find(item => item.id === organization.HTOrganizationTypeId)?.name}`)}`}
                    </TableCell>
                    <TableCell>
                        <Chip
                          color="primary"
                          label={organization && organization.isActive? `${t('common:common.Active')}` : `${t('common:common.Inactive')}`}
                          size="small"
                          sx={{backgroundColor: organization && organization.isActive ? "#4caf50":"#f44336", }} 
                        />
                    </TableCell>
                    <TableCell align="right">
                    {(signedinUserRole === 'superadmin') 
                    ?(<Tooltip title={t('common:organization.Edit Organization')}>
                      <IconButton
                        component={RouterLink}
                        onClick={handleViewChange}
                        to={`/dashboard/organizations/${organization.id}/edit`}
                      >
                        <PencilAltIcon fontSize="small" />
                      </IconButton>
                      </Tooltip>): <></>}
                      {(signedinUserRole === 'superadmin') ?
                      (<Tooltip title={t('common:organization.Delete Organization')}>
                      <IconButton
                        onClick={()=>{handleDelete(organization.id)}}
                        // disabled={organization.HTOrganizationTypeId === "1"}
                        //disabled={true}
                      >
                      <TrashIcon fontSize="small" />
                      </IconButton>
                      </Tooltip>):<></>}
                      <Tooltip title={t('common:organization.View Organization')}>
                      <IconButton
                        onClick={handleViewChange}
                        component={RouterLink}
                        to={`/dashboard/organizations/${organization.id}/view`}
                      >
                        <ArrowRightIcon fontSize="small" />
                      </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table> }
          { organizations && organizations.length === 0 &&
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
                          <Typography>{t('common:common.No match')}</Typography>
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
      <Dialog aria-labelledby="simple-dialog-title" open={isOpen}>
        <DialogTitle id="simple-dialog-title">{t('common:question.Are you sure')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          {t('common:organization.confirmdelete')}<br></br>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDelete} color="primary">
          {t('common:common.Yes')}
          </Button>
          <Button onClick={handleClose} color="primary"autoFocus>
          {t('common:common.No')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

OrganizationListTable.propTypes = {
  organizations: PropTypes.array.isRequired
};

export default OrganizationListTable;
