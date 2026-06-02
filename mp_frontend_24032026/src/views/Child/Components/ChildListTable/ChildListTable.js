import { useState, useEffect, useContext, useCallback } from 'react';
import { useTheme } from '@material-ui/core/styles';
import FilterListIcon from '@material-ui/icons/FilterList';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import ChartSquareBarIcon from '../../../../assets/icons/ChartSquareBar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import { Link as RouterLink,useNavigate} from 'react-router-dom';
//import numeral from 'numeral';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Checkbox,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
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
  Divider
} from '@material-ui/core';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import PencilAltIcon from '../../../../assets/icons/PencilAlt';
import PlusIcon from '../../../../assets/icons/Plus';
import TrashIcon from '../../../../assets/icons/Trash';
import SearchIcon from '../../../../assets/icons/Search';
import toast from 'react-hot-toast';
// import getInitials from '../../../../common/services';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
// import { customerApi } from '../../../../__fakeApi__/customerApi';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import APIS from '../../../../common/hooks/UseApiCalls';
import AutoCompleteDropdownToFilter from '../../../../components/UserComponents/AutoCompleteDropdownToFilter'
import AutoCompleteDropdownMultiNameToFilter from '../../../../components/UserComponents/AutoCompleteDropdownMultiNameToFilter'
import AutoCompleteDropdownOrgId from '../../../../components/UserComponents/AutoCompleteDropdownOrgId'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FamilyDetailsTable from '../FamilyDetailsTable';
import { tableCellClasses } from "@mui/material/TableCell";
import CloseIcon from '@material-ui/icons/Close';


const columnHeaders = [
  {
    label: 'Child ID',
    value: ''
  },
  {
    label: 'Child Name',
    value: 'firstName'
  },
  {
    label: 'Family Name',
    value: 'familyName'
  },
  {
    label: 'Placement Status',
    value: 'placementStatus'
  },
  {
    label: 'Status',
    value: 'isActive'
  },
  {
    label: 'Actions',
    value: '',
    styleValue: {pl : 2}
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

const ChildListTable = (props) => {
  const { t } = useTranslation(['common']);
  const sortOptions = [
    {
      label: t('common:common.None'),
      id: 'none'
    },
    {
      label: t('common:common.Case Worker'),
      id: 'HTUserId'
    },
    {
      label: t('common:common.Child Name'),
      id: 'firstName'
    },
    
    {
      label: t('common:common.Family Name'),
      id: 'familyName'
    },
    {
      label: t('common:common.Placement Status'),
      id: 'HTChildPlacementStatusId'
    },
    {
      label: t('common:common.Status'),
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
  const navigate = useNavigate(); 
  const { customers, getUserlist, savePageData, pageCount, saveCurrentPage, pageData, loading1, orgOptions,getChildListAfterFamilySave, ...other } = props;
  // const [currentTab, setCurrentTab] = useState('all');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const { childPlacementList, organizationList, signedinUserRole, signedinOrgType,familyList,locationList } = useContext(CommonDataContext)
  const signedinOrgId = localStorage.getItem('orgId');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState('ASC');
  const typeOptions = orgOptions;
  const [typeFilter, setTypeFilter] = useState(typeOptions && typeOptions[0].id);
  const [statusFilter, setStatusFilter] = useState(statusOptions && statusOptions[0].id);
  const [isopen,setIsOpen] = useState(false);
  const [open,setOpen] = useState(false);
  const [modalFlag, setModalFlag] = useState(false);
  const [transferFlag, setTransferFlag] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [transferOrganization, setTransferOrganization] = useState(null);
  const [linkedOrgList, setLinkedOrgList] = useState([]);
  const [transferCaseWorker, setTransferCaseWorker] = useState(null);
  const [linkedOrgCWList, setLinkedOrgCWList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disabledFlag, setDisabledFlag] = useState(true);
  const [keytag,setKeytag]=useState(false)
  const [addFamilyModalFlag,setAddFamilyModalFlag]= useState(false)
  const [newFamily,setNewFamily] =useState('')
  const [familyDetails,setFamilyDetails] =useState(null)
  const [CaregiversNames,setCaregiversNames]=useState('')
  const [childDetails,setChildDetails] =useState(null)
  const [loadingFamilyDetails,setLoadingFamilyDetails] =useState(false)
  const [disabledOnFamilySave,setDisabledOnFamilySave] = useState(false)
  
  let singleClickTimer='';
  let clickCount=0;
  // const [filters, setFilters] = useState({
  //   hasAcceptedMarketing: null,
  //   isProspect: null,
  //   isReturning: null
  // });

  const parseOrganisation = (customers) => {
    return customers
  }
  const theme = useTheme();

  const getOrgList = useCallback(async () => {
    try {
      const data = await APIS.LinkedTransferOrganizationList();
      if (data && data.data && data.data.orgList.length) {
        setLinkedOrgList(data.data.orgList)
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getUserList = useCallback( async(value) => {
    try {
      setLoading(true)
      const data = await APIS.ListUsers({
        "organizationId":value,
        "HTUserRoleId": "3"
      })
      if(data && data.data && data.data.users.length){
        setLinkedOrgCWList(data.data.users)
        
      }
      setLoading(false)
      // console.log('caseworker list',data)
    } catch (err){
      console.log(err)
      setLoading(false)
    }
  },[])

  let paginatedCustomers = parseOrganisation(customers);

  useEffect(() => {
    setPagedata();
    getOrgList();
    return () => {
    }
  },[]);

  useEffect(() => {
    paginatedCustomers = parseOrganisation(customers)
    return () => {
    }
  },[customers]);

  useEffect(() => {

    if(transferOrganization === null || typeof transferOrganization=='undefined'){
      setDisabledFlag(true);
    } else if(selectedChildId?.caseStatus === 'Open' && linkedOrgCWList.length === 0){
      setDisabledFlag(true);
    } else if(selectedChildId?.caseStatus !== 'Open' && transferOrganization === null){
      setDisabledFlag(true)
    } else if (selectedChildId?.caseStatus === 'Open'){
      if(linkedOrgCWList.length !== 0 && transferCaseWorker !== null ){
        setDisabledFlag(false);
      }
    } else if (selectedChildId?.caseStatus !== 'Open'){
      if (transferOrganization !== null){
        setDisabledFlag(false)
      }
    }

  },[transferOrganization,transferCaseWorker,linkedOrgCWList])

  useEffect(() => {
    if (selectedChildId?.caseStatus === 'Open'){
      if(linkedOrgCWList.length !== 0 && typeof transferCaseWorker == 'undefined'){
        setDisabledFlag(true);
      }
    }
  },[transferCaseWorker])

  const handleClose = (e, transferModalFlag = false) => {
    e.preventDefault()
    if(transferModalFlag){
      setTransferFlag(!transferFlag);
      setSelectedChildId(null);
      setTransferOrganization(null);
      setTransferCaseWorker(null);
      setLinkedOrgCWList([])
    }else{
      setModalFlag(!modalFlag);
      setSelectedChildId(null);
    }
    
    };

  const handleTransferOrganizationChange = (e,value) => {
    e.preventDefault()
    setLinkedOrgCWList([])
    setTransferCaseWorker(null)
    setKeytag(!keytag)
    setTransferOrganization(value)
    if(value!=='' && value!==null && typeof value !='undefined' && selectedChildId?.caseStatus === 'Open')
    {
      getUserList(value)
    }
   

  }

  const handleTransferCWChange = (value) => {
   // e.preventDefault()
    setTransferCaseWorker(value)
  }

  const TransferChild = async () => {
    setLoading(true)
    try {
      const transferPayload = {
        "orgId":transferOrganization,
        "childId":selectedChildId.id,
        "userId":transferCaseWorker
      }
      await APIS.TransferChildren(transferPayload)
      .then((res)=>{
        if(res.status === 200){
          //success
          setLoading(false)
          toast.success('Child Transferred Successfully');
          setTransferFlag(!transferFlag);
          setSelectedChildId(null);
          setTransferOrganization(null);
        }else if(res.status === 400){
          if(res.body.Error === 'Validation error : There must be no open cases'){
            toast.error('This child is assiged to a case, Please delete and try again!');
          }else if(res.body.Error === 'Validation error : There must be no incomplete assessments'){
            toast.error('There are incomplete assignments for this child.');
          }else {
            toast.error('Something went wrong');
          }
          setTransferFlag(!transferFlag);
          setSelectedChildId(null);
          setTransferOrganization(null);
        }
        getUserlist({
          "globalSearchQuery" : query,
          "pageNumber": page,
          "HTOrganizationId" : typeFilter,
          "childStatus" : statusFilter
        });
      })
    }catch (err){
      setTransferFlag(!transferFlag);
      setSelectedChildId(null);
      setTransferOrganization(null);
      console.log(err,'error')
      toast.error('Something went wrong');
    }
  }
   
  const openModal = (e, value, transferModalFlag = false) => {
    e.preventDefault()
    if(transferModalFlag){
      setTransferFlag(!transferFlag);
      setSelectedChildId(value)
    }else{
      setModalFlag(!modalFlag);
      setSelectedChildId(value)
    }
    
    };

    const deleteChild = async () => {
      try {
        const signedinOrgId = localStorage.getItem('orgId');
        const statusPayload = {
          "id": selectedChildId,
          "isActive": "true",
          "isDeleted": "true",
          "HTOrganizationId": signedinOrgId
        }
        // console.log(statusPayload)
        await APIS.ChangeChildStatus(statusPayload)
        .then((res) =>{
          if(res){
            toast.success('Child Deleted Successfully');
            setModalFlag(false);
            setSelectedChildId(null);
            getUserlist();
          }else {
            toast.error('Something went wrong');
            setModalFlag(false);
            setSelectedChildId(null);
            getUserlist();
            // setStatus({ success: false });
          }
        })
  
      }catch (err) {
        console.log(err,'error')
        toast.error('Something went wrong');
        // setStatus({ success: false });
        // setErr/ors({ submit: err.message });
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
    if(event.target.value === ""){
      getUserlist({
        "globalSearchQuery" : '',
        "pageNumber": "1",
        "HTOrganizationId" : typeFilter,
        "childStatus" : statusFilter
      });
    }else {
      if(open){
        let payload = {
          "globalSearchQuery" : event.target.value,
          "pageNumber": "1",
          "HTOrganizationId" : typeFilter,
           "childStatus" : statusFilter
        }
        getUserlist(payload)
      }else{
      getUserlist({
        "globalSearchQuery" : event.target.value,
        "pageNumber": "1",
        "HTOrganizationId" : typeFilter,
         "childStatus" : statusFilter
      })
    }
    }
    setQuery(event.target.value);
    setPage(1)
  };

  // const handleSortChange = (value) => {
  //   let payload=null
  //   if(value=='none'){
  //     payload = {
  //       "orderByField": [
          
  //     ],
  //     "pageNumber": "1",
  //     "HTOrganizationId" : typeFilter,
  //     "childStatus" : statusFilter
  //     }

  //   }else{
  //      payload = {
  //       "orderByField": [
  //         [
  //             `${value}`,
  //             "ASC"
  //         ]
  //     ],
  //     "pageNumber": "1",
  //     "HTOrganizationId" : typeFilter,
  //     "childStatus" : statusFilter
  //     }

  //   }
    
  //   getUserlist(payload)
  //   setSort(value);
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
        "HTOrganizationId" : typeFilter,
        "childStatus" : statusFilter
      }
      getUserlist(payload)
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
        "HTOrganizationId" : typeFilter,
        "childStatus" : statusFilter
      }
      getUserlist(payload)
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

  const handlePageChange = (event,value) => {
    getUserlist({
      "pageNumber": value,
      "HTOrganizationId" : typeFilter,
       "childStatus" : statusFilter
    })
    setPage(value);
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
  const loadDefaultList = () => {
    setQuery('')
    getUserlist({
      "globalSearchQuery" : '',
      "HTOrganizationId" : typeFilter,
      "childStatus" : statusFilter
    });
  }
  const loadDefaultListOnClose = () => {
    if(isopen){
      setQuery('')
      getUserlist({
        "globalSearchQuery" : '',
        "HTOrganizationId" : '',
        "childStatus" : ''
      });
    }
    
  }
  const handleTypeFilter = (value) => {
    let payload = {
      "childStatus" :statusFilter,
      "HTOrganizationId" :parseInt(value,10),
      "pageNumber" : "1"
    }
     getUserlist(payload);
     setPage(1);
    setTypeFilter(value);
  };
  const handleStatusFilter = (value) => {
    let payload = {
      "HTOrganizationId":parseInt(typeFilter,10),
      "childStatus" : value,
      "pageNumber" : "1"
    }
     getUserlist(payload);
     setPage(1);
    setStatusFilter(value);
  };
  // const handleFilterChange = () => {
  //   if(isopen){
  //     getUserlist()
  //   }else{
  //   setTypeFilter(typeOptions && parseInt(typeOptions[0].id,10))
  //   setStatusFilter(statusOptions && statusOptions[0].value)
  //   let payload = {

  //     "childStatus" :statusFilter,
  //     "HTOrganizationId":parseInt(typeFilter,10)
  //   }
  //   getUserlist(payload)
  //   }
  //   setIsOpen(!isopen)
     
  // }

  const setPagedata = () => {
    if(localStorage.getItem('childPageData') === null){
      console.log("pagedata >>",pageData);
      setPage(pageData.page);
      setQuery(pageData.query);
      setSort(pageData.sort);
      setTypeFilter(pageData.typeFilter);
      setStatusFilter(pageData.statusFilter);
    } else {
      let localPageData = JSON.parse(localStorage.getItem('childPageData'))
      console.log('savedData',localPageData)
      setPage(localPageData.page);
      setQuery(localPageData.query);
      setSort(localPageData.sort);
      setTypeFilter(localPageData.typeFilter);
      setStatusFilter(localPageData.statusFilter);
      if(localPageData.typeFilter||localPageData.statusFilter)
        {
          setIsOpen(true)
        }

    }
  }

  const onAddFamilyClick =(e,childInfo)=>{
    e.preventDefault()
    setChildDetails(childInfo)
    setAddFamilyModalFlag(true)
  }
  const stringToDate = (dateString) => {
   
    const [day, month, year] = dateString.split('/');
    return new Date([month, day, year].join('/'));
  };

  const getDate = (dateToFormat = null) => { 
    let yourDate;
    if(dateToFormat=== null){
      yourDate = new Date()
    }else {
      yourDate = new Date(stringToDate(dateToFormat))
    }
    // yourDate.toISOString().split('T')[0];
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    console.log(yourDate.toISOString().split('T')[0])
    return yourDate.toISOString().split('T')[0]
  }

  const onAddFamilyClose=()=>{
    setAddFamilyModalFlag(false)
    setFamilyDetails(null)
  }

  const getFamilyDetails = useCallback(async (id) => {
    try {
      const data = await APIS.FamilyDetails(id);
      setFamilyDetails(data.data.familyDetails)
      getMembersName(data.data.familyDetails)
      setLoadingFamilyDetails(false)
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleFamilyChange = (value) => {
    setFamilyDetails(null)
     setNewFamily(value)
     setLoadingFamilyDetails(true)
     getFamilyDetails(value)
   }

   const handleAddFamily =()=>{
    navigate(`/dashboard/family/add/${childDetails.id}`);
   }

   const handleFamilySave =async()=>{
     console.log(childDetails)
     setDisabledOnFamilySave(true)
     let payload = {
      "id": childDetails.id || '',
      "firstName": childDetails.firstName || '',
      "lastName": childDetails.lastName || '',
      "birthDate": getDate(childDetails.birthDate) || '',
      "dateOfEntry": childDetails.dateOfEntry !== ''  && childDetails.dateOfEntry !== null ?getDate(childDetails.dateOfEntry) :null, 
      "dateOfExit" : childDetails.dateOfExit !== ''  && childDetails.dateOfExit !== null ?getDate(childDetails.dateOfExit): null,
      "gender": childDetails.gender || '',
      "phoneNumber": childDetails.phoneNumber || '',
      "email": childDetails.email || '',
      "HTLanguageId": childDetails.HTLanguageId || '',
      "HTOrganizationId" : childDetails.HTOrganizationId || '',
      "HTChildPlacementStatusId": childDetails.HTChildPlacementStatusId || '',
      "HTChildStatusId": childDetails.HTChildStatusId || null,
      "HTChildCurrentPlacementStatusId": childDetails.HTChildCurrentPlacementStatusId || '',
      "HTChildEducationLevelId": childDetails.HTChildEducationLevelId || null,
      "highestEducationLevel": childDetails.highestEducationLevel || '',
      "addressLine1": childDetails.addressLine1 || '',
      "addressLine2": childDetails.addressLine2 || '',
      "zipCode": childDetails.zipCode || '',
      "HTCountryId": childDetails.HTCountryId || '',
      "HTDistrictId": childDetails.HTDistrictId || '',
      "HTStateId": childDetails.HTStateId || '',
      "city": childDetails.city || '',
      "HTFamilyId": newFamily || ''
     }
     console.log(payload)
     try { 
      await APIS.EditChild(payload)
      .then((res)=>{
      if(res && res.data && res.status === 200){
        getChildListAfterFamilySave() 
        setDisabledOnFamilySave(false)
        setAddFamilyModalFlag(false)
        setFamilyDetails(null)    
        toast.success(t('common:child.Child Updated Successfully'));
      }})
    }catch (err) {
      toast.error(t('common:common.Something went wrong'));
    }
   }

   const getMembersName =(familyDetails)=>{
    let caregivers =[]
    familyDetails?.HT_familyMembers?.map((individualMember)=>{
      if(individualMember.HTFamilyMemberTypeId==1){
        caregivers.push(individualMember.firstName +' '+individualMember.lastName) 
      }
   })
   setCaregiversNames(caregivers.toString());
   }

 

  // const handleLimitChange = (event) => {
  //   setLimit(parseInt(event.target.value, 10));
  // };

  // const filteredCustomers = applyFilters(customers, query, filters);
  // const sortedCustomers = applySort(filteredCustomers, sort);
  // const paginatedCustomers = applyPagination(sortedCustomers, page, limit);
  
  const enableBulkActions = selectedCustomers.length > 0;
  const selectedSomeCustomers = selectedCustomers.length > 0
    && selectedCustomers.length < customers.length;
  const selectedAllCustomers = selectedCustomers.length === customers.length;

  return (
    <Card {...other}>
      {/* <Tabs
        indicatorColor="primary"
        //onChange={handleTabsChange}
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
      {(loading1) && <CircularProgress 
                            sx={{zIndex : 100000,
                                  position : "absolute",
                                  top : "55%",
                                  left : "45%"}}
                            color="primary" />}


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
            placeholder={t('common:child.Search Child')}
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
              onClick={()=>{setIsOpen(!isopen);loadDefaultListOnClose()}}
            >
              <FilterListIcon></FilterListIcon>
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
            defaultVal="familyName"
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
        <Box className={customers.length ? "scrollListTable" : ""} sx={{ minWidth: 700 }}>
        { isopen && 
          <Box 
            sx={{ ml: 2,mt:1,mb :1 }}
            >
              <Grid
                container
                spacing={3}
              >
                {((signedinUserRole === 'admin' && signedinOrgType == 1) ||
                ((signedinOrgType == 3 || signedinOrgType == 4) && (signedinUserRole === 'admin' || signedinUserRole === 'caseworker')))
                  ? <></> 
                  : <Grid
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
                                 
               </Grid> }

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
                    <TableCell onClick={() => handleClickColumn(option.value)}>
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
              {paginatedCustomers.map((customer, index) => {
                const isCustomerSelected = selectedCustomers.includes(customer.id);

                return (
                  <TableRow
                    hover
                    key={customer.id + index}
                    // key={index}
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
                      {customer.childId}
                    </TableCell>
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
                            to={`/dashboard/child/${customer.id}/view`}
                            variant="subtitle2"
                          >
                        {`${customer.firstName} ${customer.lastName}`}
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
                      {customer.familyName? customer.familyName: <Button onClick={(e)=>{onAddFamilyClick(e, customer)}} disabled={!((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) && (signedinUserRole === 'admin' || signedinUserRole === 'caseworker'))} color="error">+ {t('common:family.Add Family')}</Button> }
                    </TableCell>
                    <TableCell>
                    {(customer.HTChildPlacementStatusId && childPlacementList) && childPlacementList.length && 
                      `${childPlacementList.find(item => item.id === customer.HTChildPlacementStatusId).placementStatus}`}
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
                    align="center"
                    >
                    {((signedinOrgType == 3 || signedinOrgType == 4) && 
                    (signedinUserRole === 'admin' || signedinUserRole === 'caseworker') && customer.HTOrganizationId === signedinOrgId)
                    ? <Tooltip title={t('common:child.Edit Child')}>
                      <IconButton
                        component={RouterLink}
                        onClick={handleViewChange}
                        to={`/dashboard/child/${customer.id}/edit`}
                      >
                        <PencilAltIcon fontSize="small" />
                      </IconButton>
                      </Tooltip> : <></>}
                    {((signedinOrgType == 3 || signedinOrgType == 4) && 
                    (signedinUserRole === 'admin' || signedinUserRole === 'caseworker') && customer.HTOrganizationId === signedinOrgId)
                    ? <Tooltip title="Delete Child">
                      <IconButton
                        onClick={(e)=>{openModal(e, customer.id)}}
                        //disabled={true}
                      >
                        <TrashIcon fontSize="small" />
                      </IconButton>
                      </Tooltip> : <></>}
                      <Tooltip title={t('common:common.Assessments')}>
                      <IconButton
                        onClick={() =>{navigate(`/dashboard/child/${customer.id}/view`,{state:{tabvalue:"Assessments"}});handleViewChange()}}
                      >
                        <ChartSquareBarIcon fontSize="small" />
                      </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common:common.Progress Report')}>
                        <IconButton
                          onClick={() => { navigate(`/dashboard/child/${customer.id}/view`, { state: { tabvalue: "ProgressReport" } }); handleViewChange() }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              height: 14,
                              width: 14,
                            }}
                          >
                            <img
                              alt={'Progress report icon'}
                              src={'/static/icons/ProgressReport.svg'}
                              height="13.5px"
                              width="13.5px"
                            /></Box>
                        </IconButton>
                      </Tooltip>
                      { signedinUserRole === 'superadmin' ? 
                      <Tooltip title={t('common:child.Transfer Child')}>
                        <IconButton 
                        onClick={(e)=>{openModal(e, customer, true)}}>
                          <CompareArrowsIcon fontSize='small' />
                        </IconButton>
                      </Tooltip> : <></>}
                      {/* <Tooltip title={t('common:child.View Child')}>
                      <IconButton
                        component={RouterLink}
                        onClick={handleViewChange}
                        to={`/dashboard/child/${customer.id}/view`} 
                      >
                        <ArrowRightIcon fontSize="small" />
                      </IconButton>
                      </Tooltip> */}
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
      <Dialog aria-labelledby="simple-dialog-title" open={modalFlag}>
      <DialogTitle id="simple-dialog-title">Are you sure?</DialogTitle>
      <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('common:common.All assessments related to this child will be deleted')}
            <br/>
            {t('common:common.Would you like to proceed with the deletion of this child')}<br></br>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteChild} color="primary">
            Yes
          </Button>
          <Button onClick={(e)=>handleClose(e)} color="primary" autoFocus>
            No
          </Button>
        </DialogActions>
      
    </Dialog>

    <Dialog aria-labelledby="simple-dialog-title" fullWidth maxWidth="sm" open={transferFlag}>
      <DialogTitle id="simple-dialog-title">{t('common:child.Transfer Child')}</DialogTitle>
      <DialogContent>
          <DialogContentText id="alert-dialog-description">

          <Grid
          container
          spacing={3}
          >
            {(loading) && <CircularProgress 
                            sx={{zIndex : 100000,
                                  position : "absolute",
                                  top : "40%",
                                  left : "47%"}}
                            color="primary" />}
            <Grid
            item
            md={6}
            xs={12}
            >
              <TextField
              id="standard-select-organization"
              disabled
              label={t("common:child.Child Name")}
              value={`${selectedChildId?.firstName} ${selectedChildId?.lastName}`}
              fullWidth
              // onChange={handleChange}
              />
            </Grid>
            <Grid item
            md={6}
            xs={12}>
              <TextField
              disabled
              id="standard-select-organization"
              label={t("common:common.Current Organization")}
              value={`${organizationList.find(item => item.id === selectedChildId?.HTOrganizationId)?.organizationName}`}
              fullWidth
              // onChange={handleChange}
              >
              </TextField>
            </Grid>
            <Grid item
            md={6}
            xs={12}
            sx={{ mt: -2 }}>             
              <TextField
                 sx={{width : 265}}                       
                 name="standard-select-organization"
                 accessKey="linkedOrganizationName"
                 component={AutoCompleteDropdownOrgId}
                 getValueFunction={(e,value)=>{handleTransferOrganizationChange(e,value)}}
                 label="Organization"
                 required={true}
                 options={linkedOrgList}
                 textFieldProps={{
                   fullWidth: true,
                   margin: "normal",
                   variant: "outlined",
                   label:t("common:common.Select Organization")
                 }}
               />
            </Grid>
            {selectedChildId?.caseStatus === 'Open' ? (<Grid item
            md={6}
            xs={12}
            sx={{ mt: -2 }}>
              {console.log(selectedChildId)}
              <TextField
                 sx={{width : 265}}                       
                 name="standard-select-organization"
                 accessKey1="firstName"
                 accessKey2="lastName"
                 Key={keytag}
                 component={AutoCompleteDropdownMultiNameToFilter}
                 getValueFunction={(value)=>{handleTransferCWChange(value)}}
                 label="caseworker"
                 options={linkedOrgCWList}
                 textFieldProps={{
                   fullWidth: true,
                   margin: "normal",
                   variant: "outlined",
                   label:t("common:common.Select Caseworker")
                 }}
               />
            </Grid>):<></>}

            {selectedChildId?.caseStatus === 'Open' && loading=== false && linkedOrgCWList.length === 0 && transferOrganization ? (<Grid item
            >
              <Typography color='secondary'>
                {t('common:common.No CaseWorkers in Selected Organization')}
              </Typography> 
            </Grid>):<></>}
                
          </Grid>
                      

                      
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e)=>{TransferChild()}} disabled={disabledFlag} variant="contained" color="primary">
            {t('common:common.Save')}
          </Button>
          <Button onClick={(e)=>handleClose(e,true)} color="primary" autoFocus>
            {t('common:common.Cancel')}
          </Button>
        </DialogActions>
      
    </Dialog>
    <Dialog aria-labelledby="simple-dialog-title" open={addFamilyModalFlag} fullWidth
        maxWidth='xs'>
      <DialogTitle id="simple-dialog-title">  <Box display="flex" alignItems="center">
      <Box flexGrow={1} ></Box>
          <Box><IconButton onClick={onAddFamilyClose}>
                          <CloseIcon />
                 </IconButton>
          </Box>
          </Box></DialogTitle>
          <DialogContent style={{height:'350px'}}>
         <Button
           // color="#172b4d"
            startIcon={<PlusIcon fontSize="small" />}
            sx={{ mr: 1,mb :2,mt:-1 }}
            variant="contained"
            onClick={handleAddFamily}
            >
             {t('common:family.Add New Family')}
            </Button>
            <Typography level='h3'sx={{ ml: 8,mb :2 }}>{t('common:common.OR')}</Typography>
            <Typography level='h3' sx={{ ml:1,mb :2 }} >{t('common:common.Assign existing Family')}</Typography>
         <Grid item
            md={6}
            xs={12}
            sx={{ mt: -2 }}>
              <TextField
                 sx={{width :"300px"}}                       
                 name="family"
                 accessKey="familyName"
                 component={AutoCompleteDropdownToFilter}
                 getValueFunction={(value)=>{handleFamilyChange(value)}}
                 label="family"
                 options={familyList}
                 textFieldProps={{
                   fullWidth: true,
                   margin: "normal",
                   variant: "outlined",
                   label:t("common:common.Choose Family")
                 }}
               />
            </Grid>
            <Grid item
             md={12}
             xs={12}
             sx={{ mt: 2 }}>
              {(loadingFamilyDetails) && <Table sx={{
                   [`& .${tableCellClasses.root}`]: {
                       borderBottom: "none"
                      }
                  }} size="small" >
                <TableBody><CircularProgress 
                            sx={{zIndex : 100000,
                                  ml:9, mt:4}}
                            color="primary" /></TableBody></Table>}
                           
               {familyDetails ? 
              //  <Table sx={{
              //      [`& .${tableCellClasses.root}`]: {
              //          borderBottom: "none"
              //         }
              //     }} size="small" >
              //   <TableBody>
                  
              //     <FamilyDetailsTable name={t('common:common.Family ID')+" :"} value={familyDetails.autogeneratedid}/>
              //     <FamilyDetailsTable name={t('common:common.Caregiver(s)')+" :"} value={CaregiversNames}/>
              //     <FamilyDetailsTable name={t('common:common.Address')+" :"} value={familyDetails.addressLine1 +','
              //                +(familyDetails.addressLine2?familyDetails.addressLine2 +', ':'')
              //                 +familyDetails.city+', '
              //                 +(locationList && locationList.districts && locationList.districts.length &&
              //                   locationList.districts.find(item => item.id === familyDetails.HTDistrictId).districtName)+', '
              //                 +(locationList && locationList.states && locationList.states.length &&
              //                 locationList.states.find(item => item.id === familyDetails.HTStateId).stateName)}/>
              //   </TableBody>
              // </Table>
              <>
                
                <Grid
                  item
                  md={12}
                  xs={12}
                  style={{display: "flex"}}
                  sx={{mt:1}}
                >
                  
                    <Typography
                      color="textPrimary"
                      variant="subtitle2"
                    >
                      {t('common:common.Family ID')+":"}
                    </Typography>
                    <Typography color="textPrimary"
                      variant="subtitle2"><b>{familyDetails.autogeneratedid}</b></Typography>
                </Grid>
                <Grid
                  item
                  md={12}
                  xs={12}
                  style={{display: "flex"}}
                  sx={{mt:1}}
                >
                    <Typography
                      color="textPrimary"
                      variant="subtitle2"
                    >
                      {t('common:common.Caregiver(s)')+":"}
                    </Typography>
                    <Typography color="textPrimary"
                      variant="subtitle2"><b>{CaregiversNames}</b></Typography>
                </Grid>
                <Grid
                  item
                  md={12}
                  xs={12}
                  style={{display: "flex"}}
                  sx={{mt:1}}
                >
                  
                    <Typography
                      color="textPrimary"
                      variant="subtitle2"
                    >
                      {t('common:common.Address')+":"}
                    </Typography>
                    <Typography color="textPrimary"
                      variant="subtitle2"><b>{familyDetails.addressLine1 +','
                      +(familyDetails.addressLine2?familyDetails.addressLine2 +', ':'')
                        +familyDetails.city+', '
                      +(locationList && locationList.districts && locationList.districts.length &&
                          locationList.districts.find(item => item.id === familyDetails.HTDistrictId).districtName)+', '
                        +(locationList && locationList.states && locationList.states.length &&
                        locationList.states.find(item => item.id === familyDetails.HTStateId).stateName)}</b></Typography>
                </Grid>
              </>
              :<></>}
            </Grid>
         
        </DialogContent>
        <DialogActions>         
          <Button color="primary" autoFocus onClick={onAddFamilyClose}>
          {t('common:common.Cancel')}
          </Button>
          <Button  color="primary" variant="contained" disabled={disabledOnFamilySave} onClick={()=>{handleFamilySave()}}>
          {t('common:common.Save Changes')}
          </Button>
        </DialogActions>
      
    </Dialog>
    </Card>
  );
};

ChildListTable.propTypes = {
  customers: PropTypes.array.isRequired
};

export default ChildListTable;


// {
//     id:'14',
//     first_name : "Carly",
//     last_name : "Anderson",
//     childId : "b67860bfaddd4064812e9360a4cbef3d",
//     organization:" The Smiling Kids ",
//     care_giver_id : "823ehh",
//     caregiver:"Jenny",
//     case_manager : "Janet Morris"

// }