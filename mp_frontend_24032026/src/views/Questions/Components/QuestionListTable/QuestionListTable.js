import { useState, useContext, useEffect } from 'react';
// import { useTheme } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import FilterListIcon from '@material-ui/icons/FilterList';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
//import numeral from 'numeral';
// import PropTypes from 'prop-types';
import {
  // Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  // Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  Chip
} from '@material-ui/core';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import PencilAltIcon from '../../../../assets/icons/PencilAlt';
import SearchIcon from '../../../../assets/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import TrashIcon from '../../../../assets/icons/Trash';
// import getInitials from '../../../../common/services';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import APIS from '../../../../common/hooks/UseApiCalls';
//import { customerApi } from '../../../../__fakeApi__/customerApi';
//import FamilyList from '../../FamilyList/FamilyList';
// import AutoCompleteDropdownToFilter from '../../../../components/UserComponents/AutoCompleteDropdownToFilter';




// const applyFilters = (questions, query, filters) => questions
//   .filter((question) => {
//     let matches = true;

//     if (query) {
//       const properties = ['email', 'name'];
//       let containsQuery = false;

//       properties.forEach((property) => {
//         if (question[property].toLowerCase().includes(query.toLowerCase())) {
//           containsQuery = true;
//         }
//       });

//       if (!containsQuery) {
//         matches = false;
//       }
//     }

//     Object.keys(filters).forEach((key) => {
//       const value = filters[key];

//       if (value && question[key] !== value) {
//         matches = false;
//       }
//     });

//     return matches;
//   });

// const applyPagination = (questions, page, limit) => questions
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

// const applySort = (questions, sort) => {
//   const [orderBy, order] = sort.split('|');
//   const comparator = getComparator(order, orderBy);
//   const stabilizedThis = questions.map((el, index) => [el, index]);

//   stabilizedThis.sort((a, b) => {
//     const newOrder = comparator(a[0], b[0]);

//     if (newOrder !== 0) {
//       return newOrder;
//     }

//     return a[1] - b[1];
//   });

//   return stabilizedThis.map((el) => el[0]);
// };




const QuestionListTable = (props) => {
  const { t } = useTranslation(['common']);
  const sortOptions = [
    {
      label:t('common:question.None'),
      id: 'none'
    },
    {
      label: t('common:question.Domain'),
      id: 'HTQuestionDomainId'
    },
    {
      label: t('common:question.Question'),
      id: 'questionText'
    }
    // {
    //   label: 'Type',
    //   value: 'isActive'
    // }
  ];
  const { questions, getQuestionList, loading, savePageData, pageCount, pageData, saveCurrentPage, ...other } = props;
  const { questionDomainList, signedinUserRole } = useContext(CommonDataContext);
  // const [currentTab, setCurrentTab] = useState('all');
  const [selectedQuestions, setSelectedQuestions] = useState([]); 
  const [page, setPage] = useState("1");
  // const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState('');
  //const [questionList, setQuestionList] = useState([]);
  const [sort, setSort] = useState(sortOptions[0].id);
  const [sortOrder, setSortOrder] = useState('ASC');
  let singleClickTimer='';
  let clickCount=0;
  // const [filters, setFilters] = useState({
  //   hasAcceptedMarketing: null,
  //   isProspect: null,
  //   isReturning: null
  // });

  // const parseQuestions = (questions) => {
  //   return questions
  // }
  // const theme = useTheme();

  useEffect(()=>{
  },[])

  const handleDelete = (id)=> {
    setIsOpen(!isOpen)
    setQuestionToDelete(id)
  }
  
  const handleClose=()=>{
    setIsOpen(false)
  }
  
  const handleConfirmDelete =  async () => {
  
    try {
      const payload ={
      "id": questionToDelete !== null && questionToDelete,
      "isActive": false,
      "isDeleted": true
      }
      await APIS.DeleteQuestion(payload)
      .then((res) =>{
        if(res && res.data && res.data.Message === "Status Changed Successfully"){
          toast.success(t('common:question.Question Deleted Successfully'));
          setIsOpen(false);
          getQuestionList();
  
        }else {
          toast.error(t('common:common.Something went wrong')
          );
          setIsOpen(false);
        }
      })
    }catch (err) {
      toast.error(t('common:common.Something went wrong')
      );
    }
  }; 
  

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    if(event.target.value === ""){
      getQuestionList({
        "globalSearchQuery" : '',
        "pageNumber": "1",
      });
    }else {
      let payload = {
        "globalSearchQuery" : event.target.value,
        "pageNumber": "1",
      }
      getQuestionList(payload);
      setPage(1);
    }
  };

  // const handleSortChange = (value) => {
  //   setSort(value);
  //   let payload={}
  //   if(value=='none'){
  //      payload = {
  //       "orderByField": [
          
  //     ],
  //     "pageNumber": "1",
  //     //"pageNumber": page.toString(),
  //     "globalSearchQuery" : query
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
  //     //"pageNumber": page.toString(),
  //     "globalSearchQuery" : query
  //     }
  //   }
   
  //   getQuestionList(payload);
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
        "globalSearchQuery" : query
      }
      getQuestionList(payload)
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
        "globalSearchQuery" : query
      }
      getQuestionList(payload)
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
    getQuestionList({
      "globalSearchQuery" : '',
    });
  }

  const handleSelectAllQuestions = (event) => {
    setSelectedQuestions(event.target.checked
      ? questions.map((question) => question.id)
      : []);
  };

  useEffect(() => {
    setPagedata()
    return () => {
    }
  },[pageData])

  const setPagedata = () => {
    if(localStorage.getItem('questionPageData') === null){
      setPage(pageData.page);
      setQuery(pageData.query);
      setSort(pageData.sort);
    } else {
      let localPageData = JSON.parse(localStorage.getItem('questionPageData'))
      setPage(localPageData.page);
      setQuery(localPageData.query);
      setSort(localPageData.sort);
    }
  }

  const handleViewChange = () => {
    let pageObject = {
      page:page, 
      query:query,
      sort:sort
    }
    savePageData(pageObject)
  }


  // const handleSelectOneQuestion = (event, id) => {
  //   if (!selectedQuestions.includes(id)) {
  //     setSelectedQuestions((prevSelected) => [...prevSelected, id]);
  //   } else {
  //     setSelectedQuestions((prevSelected) => prevSelected.filter((id) => id !== id));
  //   }
  // };

  const handlePageChange = (event, newPage) => {
    getQuestionList({
      "pageNumber": newPage.toString(),
      "globalSearchQuery" : query,
      "orderByField": [
        [
            sort,
            sortOrder
        ]
      ],
    })
    setPage(newPage);
  };

  // const handleLimitChange = (event) => {
  //   setLimit(parseInt(event.target.value, 10));
  // };

  // const filteredCustomers = applyFilters(customers, query, filters);
  // const sortedCustomers = applySort(filteredCustomers, sort);
  // const paginatedCustomers = applyPagination(sortedCustomers, page, limit);
  // const paginatedQuestions = parseQuestions(questions);
  const enableBulkActions = selectedQuestions && selectedQuestions.length > 0;
  //const selectedSomeFamilies = selectedFamilies && selectedFamilies.length > 0
   // && families && families.length > 0 && selectedFamilies.length < families.length;
  //const selectedAllFamilies = selectedFamilies.length === families.length;

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

      <Dialog
        //fullScreen={fullScreen}
        //onBackdropClick={()=>alert("hii")}
        open={isOpen}
        //onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
        {t('common:question.confirm delete question')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
          {t('common:question.This question will be deleted')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleConfirmDelete}>
          {t('common:common.Delete')}
          </Button>
          <Button onClick={handleClose} autoFocus>
          {t('common:common.Cancel')}
          </Button>
        </DialogActions>
      </Dialog>


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
                query && query.length > 0 && <IconButton
                color="inherit"
                onClick={()=>loadDefaultList()}>
                  <ClearIcon/>
                </IconButton>
            }}
            onChange={handleQueryChange}
            placeholder={t('common:question.Search Questions and Domains')}
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
          <FilterListIcon/>
          
        </Box>
        {/* <Box
          sx={{
            m: 1,
            width: 240
          }}
        >
          <TextField
            label="Sort By"
            name="sort"
            onChange={handleSortChange}
            select
            SelectProps={{ native: true }}
            value={sort}
            variant="outlined"
          >
            {sortOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </TextField>
        </Box> */}


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
              //checked={selectedAllFamilies}
              color="primary"
              //indeterminate={selectedSomeQuestions}
              onChange={handleSelectAllQuestions}
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
        <Box className={questions.length ? "scrollListTable" : ""} sx={{ minWidth: 'auto'}}>
          
          { questions && questions.length > 0 && <Table>
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
                <TableCell width="50%" onClick={() => handleClickColumn('questionText')}>
                  <TableSortLabel
                    active={sort === 'questionText'}
                    direction={sortOrder === 'ASC' ? 'asc' : 'desc'}
                  >
                    {t('common:question.Question')}
                  </TableSortLabel>
                </TableCell>
                <TableCell onClick={() => handleClickColumn('HTQuestionDomainId')}>
                  <TableSortLabel
                    active={sort === 'HTQuestionDomainId'}
                    direction={sortOrder === 'ASC' ? 'asc' : 'desc'}
                  >
                    {t('common:question.Domain')}
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                >
                  {t('common:question.Is Redflag')}
                </TableCell>
                <TableCell
                // width="20%"
                align="center" sx={{pl : 8}}
                >
                {t('common:common.Actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions && questions.map((question) => {
                const isQuestionSelected = selectedQuestions.includes(question.id);
                return (
                  <TableRow
                    hover
                    key={question.id}
                    selected={isQuestionSelected}
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
                        <Box sx={{
                          //display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'left',
                          typography: 'body1',
                          }}>
                          <Link
                            sx={{maxWidth : '40%'}}
                            color="inherit"
                            component={RouterLink}
                            to={`/dashboard/questions`}
                            variant="subtitle2"
                          >
                          {question.questionText}
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
                      {(questionDomainList && questionDomainList.length) && (question && question.HTQuestionDomainId) &&
                        `${questionDomainList.find(item => item.id === question.HTQuestionDomainId).domainName}`}
                    </TableCell>
                    <TableCell>
                    <Chip
                          color="primary"
                          label={question && question.isRedFlag ? `${t('common:common.Yes')}`: ""}
                          size="small"
                          sx={{width : 70, 
                            backgroundColor: question && 
                            question.isRedFlag ? "#f44336" : "#ffffff00"}} 
                        />
                    </TableCell>
                    {/* 
                    <TableCell>
                        {(questionTypeList && questionTypeList.length) && (question && question.HTQuestionTypeId) && 
                        `${questionTypeList.find(item => item.id === question.HTQuestionTypeId).typeName}`}
                    </TableCell> */}
                    <TableCell 
                    align="right"
                    >
                    {signedinUserRole === 'superadmin'?(<><Tooltip title={question.questionPublished ? `${t('common:question.Question cannot be edited as it is published')}`:`${t('common:question.Edit Question')}` }>
                      <IconButton
                        component={RouterLink}
                        disabled={question.questionPublished}
                        onClick={handleViewChange}
                        to={`/dashboard/questions/${question.id}/edit`}
                      >
                        <PencilAltIcon fontSize="small"/>
                      </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common:question.Delete Question')}>
                      <IconButton
                        disabled={question.questionPublished}
                        onClick={()=> handleDelete(question.id)}
                      >
                        <TrashIcon fontSize="small" />
                      </IconButton>
                      </Tooltip></>):<></>}
                      <Tooltip title={t('common:question.View Question')}>
                      <IconButton
                        component={RouterLink}
                        onClick={handleViewChange}
                        to={`/dashboard/questions/${question.id}/view`}
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
          { questions && questions.length === 0  || questions === undefined &&
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
                          <Typography>{t('common:question.No Questions to list')}</Typography>
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

// QuestionListTable.propTypes = {
//   questions: PropTypes.array.isRequired
// };

export default QuestionListTable;
