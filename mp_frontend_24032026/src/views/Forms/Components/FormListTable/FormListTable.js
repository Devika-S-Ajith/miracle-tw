import { useState, useEffect, useContext, useCallback } from 'react';
// import { useTheme } from '@material-ui/core/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  // Avatar,
  Box,
  Card,
  CircularProgress,
  Divider,
  Grid,
  // Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Pagination,
  // Tabs,
  TextField,
  Tooltip,
  Typography,
  Button
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CardActions from '@mui/material/CardActions';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import APIS from '../../../../common/hooks/UseApiCalls';
import moment from 'moment';

const sortOptions = [
  // {
  //   label: 'Name',
  //   value: 'firstName'
  // },
  // {
  //   label: 'Phone Number',
  //   value: 'phoneNumber'
  // },
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Status',
    value: 'HTDistrictId'
  },
  // {
  //   label: 'No of Members',
  //   value: 'orders|asc'
  // },
  // {
  //   label: 'No of Children',
  //   value: 'trial|asc'
  // },
  // {
  //   label: 'Type',
  //   value: 'isActive'
  // }
];

const applyFilters = (forms, query, filters) => forms
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

const applyPagination = (forms, page, limit) => forms
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

const applySort = (forms, sort) => {
  const [orderBy, order] = sort.split('|');
  const comparator = getComparator(order, orderBy);
  const stabilizedThis = forms.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const newOrder = comparator(a[0], b[0]);

    if (newOrder !== 0) {
      return newOrder;
    }

    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: "#f2f5f7",
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 3,
  },
}));


const FormListTable = (props) => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("");
  const [formList, setFormList] = useState([]);
  const { signedinUserRole } = useContext(CommonDataContext);
  const [sort, setSort] = useState(sortOptions[0].value);
  const [pageCount, setpageCount] = useState(1);
  const { setCurrentQuestionData,setFormDetails,setCurrentlySelectedDomain } = useContext(CommonDataContext);


  useEffect(() => {
    getForms()
    setCurrentQuestionData([])
    //setFormDetails([])
    setCurrentlySelectedDomain(1)
  },[])

  useEffect(() => {
    getForms()
  },[query])

  const onViewClick =(form)=>{
     navigate('/dashboard/forms/buildform',{state:{formName:form.formName,formDetails:form,createForm:false,defaultForm:formList[0]}})
  }

  const getForms = useCallback(async () => {
    setLoading(true)
    let payload = {
      "formName": query,
      "HTFormId": "",
      "limit": 10,
      "page": page
    }
    try {
      const data = await APIS.GetFormDetails(payload);
      setFormList(data?.data?.formData)
      setLoading(false)
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  });

  function utcToLocal(utcDateTime) {
      const localDateTime = moment.utc(utcDateTime).local();
      return localDateTime.format('DD-MM-YYYY HH:mm:ss');
    }

  // useEffect(() => {
  //   setPagedata()
  //   return () => {
  //   }
  // },[pageData])

  // const setPagedata = () => {
  //    if(localStorage.getItem('formPageData') === null){
  //     setPage(pageData.page);
  //     setQuery(pageData.query);
  //     setSort(pageData.sort);
  //   } else {
  //     let localPageData = JSON.parse(localStorage.getItem('formPageData'))
  //     setPage(localPageData.page);
  //     setQuery(localPageData.query);
  //     setSort(localPageData.sort);
  //   }
  // }

  // const handleViewChange = () => {
  //   let pageObject = {
  //     page:page, 
  //     query:query,
  //     sort:sort
  //   }
  //   savePageData(pageObject)
  // }
  const handleQueryChange = (e) => {
    setQuery(e.target.value)
  }


  const handleAddForm = () => {
    navigate('/dashboard/forms/add',{state:{form:formList[0]}});
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };


  return (
    <Card sx={{ borderRadius: '8px' }}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          pt: 1,
          pb: -1
        }}
      >
        <Grid
          container
          justifyContent="space-between"
          spacing={3}
        >
          <Grid item>
            <Typography
              color="textPrimary"
              variant="h5"
              sx={{ p: 2 }}
            >
              {t('common:form.formList')}
            </Typography>
          </Grid>
          <Grid item>
            <CardActions>
              <TextField
                onChange={handleQueryChange}
                InputProps={{
                  sx: {
                    borderRadius: '5px', m: 1, background: '#ffffff',
                    position: 'relative',
                    fontSize: 13,
                    padding: '1px 1px',
                    disableUnderline: true,
                    "&::placeholder": {
                      textAlign: "center"
                    },
                  }
                }}
                placeholder={t('common:form.Search Form')}
                value={query}
                variant="outlined"
                size="small"
              />
              <Button
                color="primary"
                style={{ borderRadius: 4 }}
                onClick={handleAddForm}
                variant="contained"
                disabled={loading || signedinUserRole ==='caseworker'}
              >
               {t('common:question.Add New Assessment Form')}
              </Button>
            </CardActions>
          </Grid>
        </Grid>
      </Box>
      <Divider variant="middle" color='#000000' />
      <Scrollbar>
        {loading && <CircularProgress
          sx={{
            zIndex: 1000,
            position: "absolute",
            top: "55%",
            left: "45%"
          }}
          color="primary" />}
        <Box className={formList?.length ? "scrollListTable" : ""} sx={{ m: 2, minWidth: 'auto' }}>

          {formList && formList?.length > 0 &&

            <Table size="small">
              <TableHead style={{ color: 'white', backgroundColor: '#1D334B' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>
                    {t('common:form.Form Name')}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {t('common:form.Last Modified')}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {t('common:form.Assessment Attached')}
                  </TableCell>
                  
                  <TableCell sx={{ color: 'white' }}>
                    {t('common:common.Status')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: 'white' }}
                  >
                    {t('common:common.Actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formList && formList.map((form) => {
                  return (
                    <StyledTableRow
                      hover
                      key={form.id}
                    >
                      <TableCell>
                            <Button
                              color="inherit"
                              // component={RouterLink}
                              // to={'/dashboard/forms/buildform'}
                              // state={{formName:'Form name'}}
                              variant="text"
                            >
                              {form.formName} {form.globalDefault? `(${t('common:common.Active')})` :'' }
                            </Button>
                      </TableCell>
                      <TableCell>
                        {utcToLocal(form.updatedAt)}
                      </TableCell>
                      <TableCell>
                        {form.assessmentStat? t('common:assessment.Yes') : t('common:assessment.No')}
                      </TableCell>                     
                      <TableCell>
                        {form && form.makeActive ? <><Box><CircleIcon sx={{ color: 'green', fontSize: '65%', mr: 1 }} /> {t('common:common.Active')}</Box></> : <><Box><CircleIcon sx={{ fontSize: '65%', mr: 1 }} />{t('common:common.Inactive')}</Box></>}
                      </TableCell>
                      <TableCell
                        align="center"
                        spacing={1}
                      >
                        {signedinUserRole === 'superadmin' || signedinUserRole === 'admin' || signedinUserRole === 'caseworker' ? (<Tooltip title={t('common:form.manageForm')}>
                          <Button
                            color="primary"
                            style={{ borderRadius: 4 }}
                            variant="contained"
                            size='small'
                            onClick={()=>onViewClick(form)}
                          >
                            {form.assessmentStat || signedinUserRole === 'caseworker' ? t('common:question.View') : t('common:question.Edit')}
                          </Button>
                        </Tooltip>) : <></>}
                      </TableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          }
          {formList && formList.length === 0 &&
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
                    <Typography>{t('common:form.No forms to list')}</Typography>
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
    </Card>
  );
};

export default FormListTable;
