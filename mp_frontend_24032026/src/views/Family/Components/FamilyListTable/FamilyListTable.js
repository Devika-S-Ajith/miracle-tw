import { useState, useContext, useEffect } from 'react';
// import { useTheme } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import FilterListIcon from '@material-ui/icons/FilterList';
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
  Grid,
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
  //Chip
} from '@material-ui/core';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import PencilAltIcon from '../../../../assets/icons/PencilAlt';
import SearchIcon from '../../../../assets/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import TrashIcon from '../../../../assets/icons/Trash';
// import getInitials from '../../../../common/services';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
// import { customerApi } from '../../../../__fakeApi__/customerApi';
// import FamilyList from '../../FamilyList/FamilyList';
import { useTranslation } from 'react-i18next';
import AutoCompleteDropdownToFilter from '../../../../components/UserComponents/AutoCompleteDropdownToFilter'





const columnHeaders = [
  {
    label: 'Family ID',
    value: ''
  },
  {
    label: 'Family Name',
    value: 'familyName'
  },
  {
    label: 'No of Caregivers',
    value: 'numberOfCaregivers'
  },
  {
    label: 'No of Children',
    value: 'numberOfChildren'
  },
  {
    label: 'Location',
    value: 'HTDistrictId'
  },
  {
    label: 'Phone Number',
    value: 'phoneNumber'
  },
  // {
  //   label: 'Language',
  //   value: ''
  // },
  
  // {
  //   label: 'Status',
  //   value: 'isActive'
  // },
  {
    label: 'Actions',
    value: '',
    styleValue: {pl: 1}
  }
];

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



const FamilyListTable = (props) => {
  const { t } = useTranslation(['common']);
  const sortOptions = [
    {
      label: t('common:common.None'),
      id: 'none'
    },
    {
      label: t('common:common.Family Name'),
      id: 'familyName'
    },
    {
      label: t('common:common.No of Caregivers'),
      id: 'numberOfCaregivers'
    },
    {
      label: t('common:common.No of Children'),
      id: 'numberOfChildren'
    },
    {
      label: t('common:common.Location'),
      id: 'HTDistrictId'
    },
    
    {
      label: t('common:common.Phone Number'),
      id: 'phoneNumber'
    },
    // {
    //   label: t('common:common.Status'),
    //   id: 'isActive'
    // }
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
  const { families, getFamilyList, loading, savePageData, pageCount, pageData, saveCurrentPage, ...other } = props;
  const { languageList, locationList} = useContext(CommonDataContext);
  // const [currentTab, setCurrentTab] = useState('all');
  const [selectedFamilies, setSelectedFamilies] = useState([]);
  const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState('ASC');
  const [isOpen, setIsOpen] = useState(false);
  const langOptions = [{id:0,language:'All'},...languageList];
  console.log("langOptions",langOptions);
  const [langFilter, setLangFilter] = useState(langOptions && langOptions[0].id);
  const [statusFilter, setStatusFilter] = useState(statusOptions && statusOptions[0].value);
  const [open, setOpen] = useState(false);
  const [selectedFamilyToDelete, setSelectedFamilyToDelete] = useState(null);
  let singleClickTimer='';
  let clickCount=0;
  // const [filters, setFilters] = useState({
  //   hasAcceptedMarketing: null,
  //   isProspect: null,
  //   isReturning: null
  // });

  const parseFamilies = (families) => {
    return families
  }
  // const theme = useTheme();


  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    if(event.target.value === ""){
      getFamilyList({
        "globalSearchQuery":'',
        "pageNumber": "1",
        "languageFilter":langFilter,
        "familyStatus":statusFilter,
      });
    }else {
      if(open){ 
        let payload = {
          "globalSearchQuery" : event.target.value,
          "languageFilter": langFilter,
          "familyStatus": statusFilter,
          "pageNumber": "1",
        }
        getFamilyList(payload)
      }else{
        getFamilyList({
          "globalSearchQuery" :event.target.value,
          "pageNumber": "1",
          "languageFilter":langFilter,
          "familyStatus": statusFilter,
        })
      }
  }
  setQuery(event.target.value);
  setPage(1)
  };

  // const handleSortChange = (value) => {
  //   let payload={}
  //   if(value=='none'){
  //      payload = {
  //       "orderByField": [
         
  //       ],
  //       "pageNumber": "1",
  //       "globalSearchQuery" : query,
  //       "languageFilter": "",
  //       "familyStatus": "",
  //     }
  //   }
  //   else{
  //      payload = {
  //       "orderByField": [
  //         [
  //             `${value}`,
  //             "ASC"
  //         ]
  //     ],
  //     "pageNumber": "1",
  //     "globalSearchQuery" : query,
  //     "languageFilter": "",
  //     "familyStatus": "",
  //   }
   
  //   }
  //   getFamilyList(payload)
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
        "globalSearchQuery" : query,
        "languageFilter": "",
        "familyStatus": "",
      }
      getFamilyList(payload)
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
        "globalSearchQuery" : query,
        "languageFilter": "",
        "familyStatus": "",
      }
      getFamilyList(payload)
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
    getFamilyList({
      "globalSearchQuery" : '',
      "languageFilter": "",
      "familyStatus": "",
    });
  }
  const loadDefaultListOnClose = () => {
    if(open){
      setQuery('')
      getFamilyList({
        "globalSearchQuery" : '',
        "languageFilter": "",
        "familyStatus": "",
      });
    }
    
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
  },[pageData])

  const setPagedata = () => {
    if(localStorage.getItem('famPageData') === null){
      setPage(pageData.page);
      setQuery(pageData.query);
      setSort(pageData.sort);
      setLangFilter(pageData.langFilter);
      setStatusFilter(pageData.statusFilter);
    } else { 
      let localPageData = JSON.parse(localStorage.getItem('famPageData'))
      setPage(localPageData.page);
      setQuery(localPageData.query);
      setSort(localPageData.sort);
      setLangFilter(localPageData.langFilter)
      setStatusFilter(localPageData.statusFilter)
      if(localPageData.langFilter||localPageData.statusFilter)
        {
          setOpen(true)
        }
    }
  }

  const handleViewChange = () => {
    let pageObject = {
      page:page, 
      query:query,
      sort:sort,
      langFilter:langFilter,
      statusFilter:statusFilter
      
    }
    savePageData(pageObject)
  }


  // const handleSelectOneFamily = (event, id) => {
  //   if (!selectedFamilies.includes(id)) {
  //     setSelectedFamilies((prevSelected) => [...prevSelected, id]);
  //   } else {
  //     setSelectedFamilies((prevSelected) => prevSelected.filter((id) => id !== id));
  //   }
  // };

  const handlePageChange = (event, newPage) => {
    getFamilyList({
      "pageNumber": newPage,
      "languageFilter":langFilter,
      "familyStatus":statusFilter
    })
    setPage(newPage);
  };

  // const handleLimitChange = (event) => {
  //   setLimit(parseInt(event.target.value, 10));
  // };

  // const handleFilterChange = () => {
  //   if(open){
  //     getFamilyList()
  //   }
  //   else
  //   {
  //   setLangFilter(langOptions && langOptions[0].id)
  //   setStatusFilter(statusOptions && statusOptions[0].value)
  //   let payload = {
  //     "languageFilter": parseInt(langFilter,10),
  //     "familyStatus": statusFilter
  //   }
  //   console.log(" filter fam payload",payload);
  //   getFamilyList(payload)
  //   }
  //   setOpen(!open)
  // }
  const handleLangFilter = (value) => {
    let payload = {
      "languageFilter" : parseInt(value,10),
      "familyStatus" : statusFilter,
      "pageNumber": "1"
    }
  getFamilyList(payload)
  setPage(1);
  setLangFilter(value);
};
  const handleStatusFilter = (value) => {
    let payload = {
      "languageFilter":parseInt(langFilter,10),
      "familyStatus":value,
      "pageNumber" : "1"
    }
    getFamilyList(payload)
    setPage(1);
    setStatusFilter(value);
  };

  const handleDelete = (id) => {
    setSelectedFamilyToDelete(id);
    setIsOpen( !isOpen);
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  const handleConfirmDelete =  async () => {

    try {
      const statusPayload ={
      "id": selectedFamilyToDelete,
      "isActive": `true`,
      "isDeleted": "true"
      }
     
      console.log(statusPayload)
      await APIS.ChangeFamilyStatus(statusPayload)
      .then((res) =>{
        console.log(res);
        console.log(res.data.Message);
        if(res.data.Message !=="Family deleted Successfully"){
          toast.error(res.data.Message);
          setIsOpen(false);
          getFamilyList();
        }
        else if(res.data.Message==="Family deleted Successfully"){
          toast.success(t('common:family.Deleted Family Successfully'));
          setIsOpen(false);
          getFamilyList();

        }else {
          toast.error(t('common:common.Something went wrong'));
          getFamilyList();
        }
      })
    }catch (err) {
      toast.error(t('common:common.Something went wrong'));
    }
  };    
  // const filteredCustomers = applyFilters(customers, query, filters);
  // const sortedCustomers = applySort(filteredCustomers, sort);
  // const paginatedCustomers = applyPagination(sortedCustomers, page, limit);
  const paginatedFamilies = parseFamilies(families);
  const enableBulkActions = selectedFamilies.length > 0;
  //const selectedSomeFamilies = selectedFamilies.length > 0
    //&& families.length > 0 && selectedFamilies.length < families.length;
 // const selectedAllFamilies = selectedFamilies.length === families.length;

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
            placeholder={t('common:family.Search Family Name, Location and Phone')}
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
              //checked={selectedAllFamilies}
              color="primary"
              //indeterminate={selectedSomeFamilies}
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

      {loading && <CircularProgress 
                            sx={{zIndex : 1000,
                                  position : "absolute",
                                  top : "55%",
                                  left : "45%"}}
                            color="primary" />}
        <Box className={families?.length ? "scrollListTable" : ""} sx={{ minWidth: 700 }}>
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
                     name="language"
                     accessKey="language"
                     component={AutoCompleteDropdownToFilter}
                     getValueFunction={(value)=>{handleLangFilter(value)}}
                     label="language"
                     options={langOptions}
                     defaultVal={langOptions[0]}
                     textFieldProps={{
                       fullWidth: true,
                       margin: "normal",
                       variant: "outlined",
                       label:t('common:common.Language')
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
          
          { families && families.length > 0 && <Table>
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
              {paginatedFamilies.map((family) => {
                const isFamilySelected = selectedFamilies.includes(family.id);
                return (
                  <TableRow
                    hover
                    key={family.id}
                    selected={isFamilySelected}
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
                    {family.autogenfamilyid}
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
                            to={`/dashboard/family/${family.id}/view`}
                            variant="subtitle2"
                          >
                            {family.familyName}
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
                      {family.numberOfCaregivers}
                    </TableCell>
                    <TableCell>
                      {family.numberOfChildren}
                    </TableCell>
                    <TableCell>
                      {locationList && locationList.districts && locationList.districts.length && 
                      `${locationList.districts.find(item => item.id === family.HTDistrictId).districtName}, 
                      ${locationList && locationList.states && locationList.states.length && 
                        locationList.states.find(item => item.id === family.HTStateId).stateName}, 
                      ${locationList && locationList.countries && locationList.countries.length && 
                        locationList.countries.find(item => item.id === family.HTCountryId).countryName} `}
                    </TableCell>
                    <TableCell>
                      {family.phoneNumber}
                    </TableCell>
                    {/* <TableCell>
                      {languageList && languageList.length > 0 && languageList.find(item=>item.id === family.HTLanguageId).language}
                    </TableCell> */}
                    
                    {/* <TableCell>
                        <Chip
                          color="primary"
                          label={family && family.isActive ? `${t('common:common.Active')}`:`${t('common:common.Inactive')}`}
                          size="small"
                          sx={{backgroundColor: family && family.isActive ? "#4caf50":"#f44336", }} 
                        />
                    </TableCell> */}
                    <TableCell 
                    // align="right"
                    >
                    <Tooltip title={t('common:family.Edit Family')}>
                      <IconButton
                        component={RouterLink}
                        onClick={handleViewChange}
                        to={`/dashboard/family/${family.id}/edit`}
                      >
                        <PencilAltIcon fontSize="small"/>
                      </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common:family.Delete Family')}> 
                      <IconButton
                        onClick={()=>handleDelete(family.id)}
                        // disabled={true}
                      >
                      <TrashIcon fontSize="small"/>
                      </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common:family.View Family')}>
                      <IconButton
                        component={RouterLink}
                        onClick={handleViewChange}
                        to={`/dashboard/family/${family.id}/view`}
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
          { families && families.length === 0 &&
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
                          <Typography>{t('common:family.No families to list')}</Typography>
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
          {t('common:family.confirmdelete')}<br></br>
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

FamilyListTable.propTypes = {
  families: PropTypes.array.isRequired
};

export default FamilyListTable;
