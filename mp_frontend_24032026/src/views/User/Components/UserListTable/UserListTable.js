import { useState, useEffect, useContext } from 'react';
// import { useTheme } from '@material-ui/core/styles';
import FilterListIcon from '@material-ui/icons/FilterList';
import LockResetIcon from '@mui/icons-material/LockReset';
import { Link as RouterLink } from 'react-router-dom';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
//import numeral from 'numeral';
import PropTypes from 'prop-types';
import {
  // Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  // Divider,
  IconButton,
  InputAdornment,
  Link,
  Pagination,
  // Tab,
  Table,
  TableBody,
  TableCell,
  TableSortLabel,
  TableHead,
  // TablePagination,
  TableRow,
  // Tabs,
  TextField,
  Tooltip,
  Typography,
  Chip,
  Grid,
  // Popover
} from '@material-ui/core';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import PencilAltIcon from '../../../../assets/icons/PencilAlt';
import TrashIcon from '../../../../assets/icons/Trash';
import SearchIcon from '../../../../assets/icons/Search';
// import getInitials from '../../../../common/services';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { customerApi } from '../../../../__fakeApi__/customerApi';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import APIS from '../../../../common/hooks/UseApiCalls';
import toast from 'react-hot-toast';
import AutoCompleteDropdownToFilter from '../../../../components/UserComponents/AutoCompleteDropdownToFilter'
// const tabs = [
//   {
//     label: 'All',
//     value: 'all'
//   },
//   {
//     label: 'Accepts Marketing',
//     value: 'hasAcceptedMarketing'
//   },
//   {
//     label: 'Prospect',
//     value: 'isProspect'
//   },
//   {
//     label: 'Returning',
//     value: 'isReturning'
//   }
// ];



const columnHeaders = [
  {
    label: 'UserId',
    value: ''
  },
  {
    label: 'FirstName',
    value: 'firstName'
  },
  {
    label: 'LastName',
    value: ''
  },
  {
    label: 'Organization',
    value: 'HTOrganizationId'
  },
  {
    label: 'Role',
    value: 'HTUserRoleId'
  },
  {
    label: 'Email',
    value: 'email'
  },
  {
    label: 'Phone',
    value: 'phoneNumber'
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

// const applyFilters = (customers, query, filters) => customers
//   .filter((customer) => {
//     let matches = true;

//     if (query) {
//       const properties = ['email', 'name'];
//       let containsQuery = false;

//       properties.forEach((property) => {
//         if (customer[property].toLowerCase().includes(query.toLowerCase())) {
//           containsQuery = true;
//         }
//       });

//       if (!containsQuery) {
//         matches = false;
//       }
//     }

//     Object.keys(filters).forEach((key) => {
//       const value = filters[key];

//       if (value && customer[key] !== value) {
//         matches = false;
//       }
//     });

//     return matches;
//   });

// const applyPagination = (customers, page, limit) => customers
//   .slice(page * limit, page * limit + limit);

// const descendingComparator = (a, b, orderBy) => {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }

//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }

//   return 0;
// };

// const getComparator = (order, orderBy) => (order === 'desc'
//   ? (a, b) => descendingComparator(a, b, orderBy)
//   : (a, b) => -descendingComparator(a, b, orderBy));

// const applySort = (customers, sort) => {
//   const [orderBy, order] = sort.split('|');
//   const comparator = getComparator(order, orderBy);
//   const stabilizedThis = customers.map((el, index) => [el, index]);

//   stabilizedThis.sort((a, b) => {
//     const newOrder = comparator(a[0], b[0]);

//     if (newOrder !== 0) {
//       return newOrder;
//     }

//     return a[1] - b[1];
//   });

//   return stabilizedThis.map((el) => el[0]);
// };

// const getLocationsFromAPI = async () => {
//   try {
//     const data = await customerApi.getLocations(); 

//     // if (mounted.current) {
//     //   setCustomers(data.organizations);
//     // }
//   } catch (err) {
//     console.error(err);
//   }
// }
// const getOrgListpayloadConstant = {
//   "rowCount": "100",
//   "pageNumber": "1",
//   "globalSearchQuery" : "",
//   "orgStatus": "",
//   "orderByField": [
//       [
//           "organizationName",
//           "ASC"
//       ]
//   ],
// }

const UserListTable = (props) => {
  // const mounted = useMounted();
  const { t } = useTranslation(['common']);
  const sortOptions = [
    {
      label: t('common:common.None'),
      id: 'none'
    },
    {
      label:  t('common:common.Email'),
      id: 'email'
    },
    {
      label:  t('common:common.Name'),
      id: 'firstName'
    },
    {
      label:  t('common:common.Organization'),
      id: 'HTOrganizationId'
    },
    {
      label:  t('common:common.Phone'),
      id: 'phoneNumber'
    },
    {
      label:  t('common:common.Role'),
      id: 'HTUserRoleId'
    },
    {
      label:  t('common:common.Status'),
      id: 'isActive'
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
  const { customers, getUserlist, savePageData, pageCount, saveCurrentPage, pageData, loading, orgOptions, ...other } = props;
  const [stateData, setStateData] = useState([]);
  const [countryData, setCountryData] = useState([]); 
  const [districtData, setDistrictData] = useState([]);
  const [typesData, setTypesData] = useState([]);
  // const [currentTab, setCurrentTab] = useState('all');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(10);
  const [open,setOpen] = useState(false);
  const [modelFlag, setModelFlag] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState('ASC');
  // const [organizations, setOrganizations] = useState([]);
  const { staticRoleList, organizationList, signedinUserRole, signedinOrgType } = useContext(CommonDataContext)
  const typeOptions = orgOptions;
  const [typeFilter, setTypeFilter] = useState(typeOptions && typeOptions[0].id);
  const [statusFilter, setStatusFilter] = useState(statusOptions && statusOptions[0].value);
  // const [advTypeFilter, setAdvTypeFilter] = useState(typeOptions && typeOptions[0].id);
  // const [advStatusFilter, setAdvStatusFilter] = useState(statusOptions && statusOptions[0].value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  let singleClickTimer='';
  let clickCount=0;
  // const [filters, setFilters] = useState({
  //   hasAcceptedMarketing: null,
  //   isProspect: null,
  //   isReturning: null
  // });


  
  console.log("org list in userpage >>",organizationList);
  const signedinOrgId = localStorage.getItem('orgId');
  // console.log("customers >>",customers)
  const handleDelete = (id) => {
    setSelectedUserToDelete(id);
    setIsOpen( !isOpen);
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  const handleClose2 = () => {
    setModelFlag(false);
    setSelectedUser(null);
  };
 
    
    const handleConfirmDelete =  async () => {
      try {
        const signedinOrgId = localStorage.getItem('orgId');
        const statusPayload ={
        "id": selectedUserToDelete,
        "isActive": `true`,
        "isDeleted": `true`,
        "HTOrganizationId": signedinOrgId
        }
        
        console.log(statusPayload)
        await APIS.ChangeUserStatus(statusPayload)
        .then((res) =>{
          console.log("response",res);
          console.log("response mssg :",res.data.Message);
          if(res.data.Message!=="User Deleted Successfully"){
            toast.error(t('common:user.Reassign'));
            setIsOpen(false);
            getUserlist();
          }
          else if(res.data.Message==="User Deleted Successfully"){
            toast.success(t('common:user.Deleted User Successfully'));
            setIsOpen(false);
            getUserlist();
          }
          else {
            toast.error(t('common:common.Something went wrong'));
            getUserlist();
          }
        })
      }catch (err) {
        toast.error(t('common:common.Something went wrong'));
      }
    };

  
  const handleResendPopup = (event, userDetails) =>{
    event.preventDefault()
    setSelectedUser(userDetails);
    setModelFlag(true)
  }

  const handleConfirmResendInvite =  async () => {
      try {
        const statusPayload = {
          "firstName": selectedUser.firstName,
          "lastName": selectedUser.lastName,
          "phoneNumber": selectedUser.phoneNumber,
          "email": selectedUser.email,
          "HTOrganizationId": selectedUser.HTOrganizationId,
          "HTUserRoleId": selectedUser.HTUserRoleId 
        }
        
        // console.log(statusPayload)
        await APIS.ResendInvitation(statusPayload)
        .then((res) =>{
           if(res.data.Message==="Invitation sent Successfully"){
            toast.success(t('common:user.Invitation has been sent to User'));
            setModelFlag(false);
          }
          else {
            toast.error(t('common:common.Something went wrong'));
            setModelFlag(false);
          }
        })
      }catch (err) {
        toast.error(t('common:common.Something went wrong'));
      }
    };

  const parseOrganisation = (customers) => {
    return customers
  }
  // const theme = useTheme();
  // const getOrgListpayloadConstant = {
  //   "rowCount": "10",
  //   "pageNumber": "1",
  //   "globalSearchQuery" : "",
  //   "orgStatus": "",
  //   "orderByField": [
  //       [
  //           "organizationName",
  //           "ASC"
  //       ]
  //   ],
  // }
  
  //   const getOrganizations =  useCallback(async (payload = null) => {
  //     setLoading(true)
  //     try {
  //       let finalPayload
  //       if(payload === null){
  //         finalPayload = getOrgListpayloadConstant
  //       } else {
  //             finalPayload = { ...getOrgListpayload, ...payload};
  //             getOrgListpayload = { ...finalPayload }
  //       }
  //       console.log("final paylaod >>",finalPayload)
  //       const data = await APIS.OrganizationList(finalPayload); 
  //       //if (mounted.current) {
  //         setOrganizations(data && data.data && data.data.organizations);
  //         console.log("Org list in userpage",data.data.organizations);
          
  //       //}
  //     } catch (err) {
  //       console.error(err);
       
  //     }
  //   }, [mounted]);
  useEffect(() => {
    setPagedata();
    getLocationsFromAPI();
    // getOrganizations();
    getTypesFromAPI();
  },[]);

  const setPagedata = () => {
    if(localStorage.getItem('userPageData') === null){
      console.log("pagedata >>",pageData);
      setPage(pageData.page);
      setQuery(pageData.query);
      setSort(pageData.sort);
      setTypeFilter(pageData.typeFilter);
      setStatusFilter(pageData.statusFilter);
    } else {
      let localPageData = JSON.parse(localStorage.getItem('userPageData'))
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

  const getLocationsFromAPI = async () => {
    try {
      const data = await customerApi.getLocations(); 
      setStateData([...data.states]);
      setCountryData([...data.countries]);
      setDistrictData([...data.districts]);
    } catch (err) {
      console.error(err);
    }
  }
  const getTypesFromAPI = async () => {
    try {
      const data = await customerApi.getOrganizationType(); 
      setTypesData([...data.organisationTypes]);
    } catch (err) {
      console.error(err);
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

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
    if(event.target.value === ""){
      getUserlist({
        "globalSearchQuery" : '',
        "pageNumber": "1",
        "orgTypeFilter" : typeFilter,
        "orgStatus" : statusFilter
      });
    }else {
      if(open){
        let payload = {
          "globalSearchQuery" : event.target.value,
          "pageNumber": "1",
           "orgTypeFilter" : typeFilter,
           "orgStatus" : statusFilter
        }
        getUserlist(payload)
      }else{
      getUserlist({
        "globalSearchQuery" : event.target.value,
        "pageNumber": "1",
      })
    }
    }
    setQuery(event.target.value)
  };

  const handlePageChange = (event,value) => {
    getUserlist({
      "pageNumber": value,
      //  "orgTypeFilter" : typeFilter,
      //   "orgStatus" : statusFilter
    })
    setPage(value);
  }

  const handleSortChange = (value) => {
    let payload={}
    if(value=='none'){
      payload = {
        "orderByField": [
          
      ],
      }
    }else{
      payload = {
        "orderByField": [
          [
              `${value}`,
              "ASC"
          ]
      ],
      }

    }
    
    getUserlist(payload)
    setSort(value);
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
      }
      getUserlist(payload)
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
      }
      getUserlist(payload)
      setSort('none');
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

  const handleSelectAllCustomers = (event) => {
    setSelectedCustomers(event.target.checked
      ? customers.map((customer) => customer.id)
      : []);
  };

  // const handleSelectOneCustomer = (event, customerId) => {
  //   if (!selectedCustomers.includes(customerId)) {
  //     setSelectedCustomers((prevSelected) => [...prevSelected, customerId]);
  //   } else {
  //     setSelectedCustomers((prevSelected) => prevSelected.filter((id) => id !== customerId));
  //   }
  // };

  const handleTypeFilter = (val) => {
    let payload = {
      "organizationId" : parseInt(val, 10),
      "userStatus" : statusFilter,
      "pageNumber": "1",
    }
  
  getUserlist(payload)

  setTypeFilter(val);
  setPage(1);
  console.log("org type",typeFilter);
};

const handleStatusFilter = (value) => {
  let payload = {
    "organizationId" : parseInt(typeFilter, 10),
    "userStatus" : value,
    "pageNumber" : "1"
  }
  getUserlist(payload)
  setStatusFilter(value);
  setPage(1);
};

const loadDefaultList = () => {
  setQuery('')
  setPage(1);
  getUserlist({
    "globalSearchQuery" : '',
    "organizationId" : "",
    "userStatus" :"",
    "pageNumber": "1",

  });
}
const loadDefaultListOnClose = () => {
  if(open){
  setQuery('')
  setPage(1);
  getUserlist({
    "globalSearchQuery" : '',
    "organizationId" : "",
    "userStatus" :"",
    "pageNumber": "1",

  });
}
}

// const handleFilterChange = () => {
//   if(open){
//     console.log("working1")
//     getUserlist()
    
//   }
//   else if(open===true && typeFilter!=="" && statusFilter!==""){
//     console.log("working2")
//     setTypeFilter(typeFilter)
//     setStatusFilter(statusFilter)
//     let payload = {
//       "organizationId" : parseInt(typeFilter, 10),
//       "userStatus" : statusFilter
//     }
    
//     getUserlist(payload)
    
//   }
//   // else{
//   //   setTypeFilter(typeOptions && typeOptions[0].id)
//   //   setStatusFilter(statusOptions && statusOptions[0].value)
//   //   let payload = {
//   //     "organizationId" : parseInt(typeFilter, 10),
//   //     "userStatus" : statusFilter
//   //   }
//   // getUserlist(payload)

//   // }
//   setOpen(!open)
   
// }

  // const handleLimitChange = (event) => {
  //   setLimit(parseInt(event.target.value, 10));
  // };

  // const filteredCustomers = applyFilters(customers, query, filters);
  // const sortedCustomers = applySort(filteredCustomers, sort);
  // const paginatedCustomers = applyPagination(sortedCustomers, page, limit);
  const paginatedCustomers = parseOrganisation(customers);
  const enableBulkActions = selectedCustomers.length > 0;
  const selectedSomeCustomers = selectedCustomers.length > 0
    && selectedCustomers.length < customers.length;
  const selectedAllCustomers = selectedCustomers.length === customers.length;

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
            placeholder={t('common:user.Search user name')}
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
            defaultVal="firstName"
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
              checked={selectedAllCustomers}
              color="primary"
              indeterminate={selectedSomeCustomers}
              onChange={handleSelectAllCustomers}
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
        <Box className={customers.length ? "scrollListTable" : ""} sx={{ minWidth: 'auto' }}>
        { open && 
          <Box 
            sx={{ ml: 2,mt:1,mb :1 }}
            >
              <Grid
                container
                spacing={3}
              >
                {((signedinOrgType == 3 || signedinOrgType == 4) && (signedinUserRole === 'admin' || signedinUserRole === 'caseworker'))
                  ? <></> 
                   :  <Grid
                    item
                    md={3} //6
                    xs={6} //12
                    sx={{ mt: -2 }}
                   >
                   <TextField
                     sx={{width : 250,ml :1}}         
                     name="organization_type"
                     accessKey="organizationName"
                     component={AutoCompleteDropdownToFilter}
                     getValueFunction={(value)=>{handleTypeFilter(value)}}
                     label="organization_type"
                     defaultVal={typeOptions[0]}
                     options={typeOptions}
                     textFieldProps={{
                       fullWidth: true,
                       margin: "normal",
                       variant: "outlined",
                       label:t('common:common.Organization')
                    }}
                    />
                                   
                 </Grid>
                  
                   }

                
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
          { customers && customers.length >0 && <Table>
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
                    <TableCell onClick={(e) => handleClickColumn(e,option.value)}>
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
              {paginatedCustomers.map((customer) => {
                const isCustomerSelected = selectedCustomers.includes(customer.id);

                return (
                  <TableRow
                    hover
                    key={customer.id}
                    selected={isCustomerSelected}
                  >
                    {/* <TableCell padding="checkbox">
                      <Checkbox
                        checked={isCustomerSelected}
                        color="primary"
                        onChange={(event) => handleSelectOneCustomer(event, customer.id)}
                        value={isCustomerSelected}
                      />
                    </TableCell> */}
                    <TableCell>
                      {customer.userId}
                    </TableCell>
                    <TableCell>
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
                            to={`/dashboard/users/${customer.id}/view`}
                            variant="subtitle2"
                          >
                        {customer.firstName}
                          </Link>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex'
                        }}
                      >
                        <Box sx={{ ml: 1 }}>
                        {customer.lastName}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {` ${organizationList &&  organizationList.length && organizationList.find(item => item.id === customer.HTOrganizationId)?.organizationName} `}
                    </TableCell>
                    <TableCell>
                      {/* {customer.HTUserRoleId}{console.log(roleList)} */}
                      { staticRoleList && staticRoleList.length && customer.HTUserRoleId && `${t(`common:common.${staticRoleList.find(item => item.id === customer.HTUserRoleId)?.role}`)}`}
                      {/* {`${ roleList && roleList.length && customer.HTUserRoleId && roleList.find(item => item.id === customer.HTUserRoleId).role}`} */}
                    </TableCell>
                    <TableCell>
                      {customer.email}
                    </TableCell>
                    <TableCell>
                      {/* {`${typesData.find(item => item.id === customer.HTOrganizationTypeId).name}`} */}
                      {customer.phoneNumber}
                    </TableCell>
                    <TableCell>
                        <Chip
                          color="primary"
                          label={customer && customer.isActive? `${t('common:common.Active')}`:`${t('common:common.Inactive')}`}
                          size="small"
                          sx={{backgroundColor: customer && customer.isActive ? "#4caf50":"#f44336", }} 
                        />
                    </TableCell>
                    <TableCell 
                    align="right"
                    >
                      {((signedinUserRole === 'superadmin' && customer.HTOrganizationId === signedinOrgId) || 
                      (signedinUserRole === 'admin' && signedinOrgType == 1 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 2 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 3 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 4 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 5 && customer.HTOrganizationId === signedinOrgId)) &&
                      (!(signedinUserRole === 'admin' && customer.role === "Super Admin"))
                      ? <Tooltip title={t('common:user.Edit User')}>
                        <IconButton
                          component={RouterLink}
                          onClick={handleViewChange}
                          to={`/dashboard/users/${customer.id}/edit`}
                        >
                          <PencilAltIcon fontSize="small" />
                        </IconButton>
                      </Tooltip> : <></>}
                      {((signedinUserRole === 'superadmin' && customer.HTOrganizationId === signedinOrgId) || 
                      (signedinUserRole === 'admin' && signedinOrgType == 1 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 2 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 3 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 4 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 5 && customer.HTOrganizationId === signedinOrgId)) &&
                      (!(signedinUserRole === 'admin' && (customer.role === "Super Admin")||(localStorage.getItem('username')==customer.id)))
                      ? <Tooltip title={t('common:user.Delete User')}> 
                        <IconButton
                          onClick={()=>handleDelete(customer.id)}
                          // disabled={true}
                        >
                          <TrashIcon fontSize="small" />
                        </IconButton>
                      </Tooltip> : <></>}
                      {((signedinUserRole === 'superadmin' && customer.HTOrganizationId === signedinOrgId) || 
                      (signedinUserRole === 'admin' && signedinOrgType == 1 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 2 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 3 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 4 && customer.HTOrganizationId === signedinOrgId) ||
                      (signedinUserRole === 'admin' && signedinOrgType == 5 && customer.HTOrganizationId === signedinOrgId)) 
                       ? <>
                     { customer.resendInvite && customer.isActive && <Tooltip title={t('common:user.Resend Invitation')}>
                        <IconButton
                          onClick={(e)=>handleResendPopup(e,customer)}
                        >
                          <LockResetIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>} 
                      </> : <></>}
                      <Tooltip title={t('common:user.View User')}>
                        <IconButton
                          component={RouterLink}
                          onClick={handleViewChange}
                          to={`/dashboard/users/${customer.id}/view`}
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
          { customers && customers.length === 0 &&
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
          {t('common:user.confirmdelete')}<br></br>
          </DialogContentText>
        </DialogContent>                  
        <DialogActions>
          <Button onClick={handleConfirmDelete} color="primary">
          {t('common:common.Yes')}
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
          {t('common:common.No')}
          </Button>                              
        </DialogActions>                                          
      </Dialog>
      <Dialog aria-labelledby="simple-dialog-title" open={modelFlag}>
        <DialogTitle id="simple-dialog-title">{t('common:question.Are you sure')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          {t('common:user.confirmreset')}<br></br>
          </DialogContentText>
        </DialogContent>                  
        <DialogActions>
          <Button onClick={handleConfirmResendInvite} color="primary">
          {t('common:common.Yes')}
          </Button>
          <Button onClick={handleClose2} color="primary" autoFocus>
          {t('common:common.No')}
          </Button>                              
        </DialogActions>                                          
      </Dialog>
    </Card>
  );
};

UserListTable.propTypes = {
  customers: PropTypes.array.isRequired
};

export default UserListTable;
