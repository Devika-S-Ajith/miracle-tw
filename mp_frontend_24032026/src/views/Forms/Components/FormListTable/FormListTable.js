import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Pagination,
  TextField,
  Tooltip,
  Typography,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CardActions from '@mui/material/CardActions';
import CircleIcon from '@mui/icons-material/Circle';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import APIS from '../../../../common/hooks/UseApiCalls';
import moment from 'moment';

const ROWS_PER_PAGE = 10;

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: "#f2f5f7",
  },
  '&:last-child td, &:last-child th': {
    border: 3,
  },
}));


const FormListTable = (props) => {
  const { t } = useTranslation(['common']);
  const { ...other } = props
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("");
  const [formList, setFormList] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const { signedinUserRoleHT, locationList } = useContext(CommonDataContext);
  const [defaultForm, setDefaultForm] = useState(null);
  const [pageCount, setPageCount] = useState(1);
  const { setCurrentQuestionData, setCurrentlySelectedDomain } = useContext(CommonDataContext);


  useEffect(() => {
    setCurrentQuestionData([])
    setCurrentlySelectedDomain(1)
  }, [])

  useEffect(() => {
    getForms()
  }, [])

  // Filter + paginate whenever query or formList changes
  useEffect(() => {
    const filtered = formList.filter((form) =>
      form.formName?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredForms(filtered);
    setPageCount(Math.ceil(filtered.length / ROWS_PER_PAGE));
    setPage(1); // reset to page 1 on filter change
  }, [query, formList]);

  const paginatedForms = filteredForms.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  const onViewClick = (form) => {
    localStorage.removeItem('isCreateForm')
    navigate('/dashboard/forms/buildform', { state: { formName: form.formName, formDetails: form, defaultForm: defaultForm } })
  }

  const getForms = useCallback(async () => {
    setLoading(true)
    let payload = {
      "formName": query,
      "TWFormId": "",
      "limit": 1000,
      "page": page
    }
    try {
      let forms = [];
      if(signedinUserRoleHT === "superadmin"){
        if(localStorage.userDBRegion === "us-east-1"){
          payload.MPCountryId = locationList?.find(loc => loc.countryName === "US")?.id;
        } else {
          payload.MPCountryId = locationList?.find(loc => loc.countryName === "India")?.id;
        }
         payload = {
          ...payload,
          limit: 99
        }
        
        const data = await APIS.GetFormList(payload)
        forms = data?.data?.data || []
      } else {
        const data = await APIS.GetFormDetails(payload)
        forms = data?.data?.formData || []
      }
      setFormList(forms)
      setDefaultForm(forms.find(form => form.globalDefault === true))
      setLoading(false)
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, []);

  function utcToLocal(utcDateTime) {
    const localDateTime = moment.utc(utcDateTime).local();
    return localDateTime.format('DD-MM-YYYY HH:mm:ss');
  }

  const handleQueryChange = (e) => {
    setQuery(e.target.value)
  }

  const handleAddForm = () => {
    navigate('/dashboard/forms/add', { state: { form: defaultForm } });
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };


  return (
    <Card {...other} sx={{ borderRadius: '8px' }}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          p: 1
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
          {signedinUserRoleHT != "superadmin" && (
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
                  disabled={loading || signedinUserRoleHT === 'caseworker'}
                >
                  {t('common:question.Add New Assessment Form')}
                </Button>
              </CardActions>
            </Grid>
          )}
        </Grid>
      </Box>
      <Divider variant="middle" color='#000000' />
        {loading && <CircularProgress
          sx={{
            zIndex: 1000,
            position: "absolute",
            top: "55%",
            left: "45%"
          }}
          color="primary" />}
        <Box className={paginatedForms?.length ? "scrollListTable" : ""} sx={{ m: 2, minWidth: 'auto' }}>

          {paginatedForms && paginatedForms?.length > 0 &&
            <Table size="small">
              <TableHead style={{ color: 'white', backgroundColor: '#1D334B' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>
                    {t('common:form.Form Name')}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {t('common:form.Last Modified')}
                  </TableCell>
                  {signedinUserRoleHT != "superadmin" && (
                    <>
                      <TableCell sx={{ color: 'white' }}>
                        {t('common:form.Assessment Attached')}
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        {t('common:common.Status')}
                      </TableCell>
                    </>
                  )}
                  {signedinUserRoleHT == "superadmin" && (
                    <TableCell sx={{ color: 'white' }}>
                      {t('common:form.Orgs assigned to', 'Orgs assigned to')}
                    </TableCell>
                  )}
                  <TableCell
                    align="center"
                    sx={{ color: 'white' }}
                  >
                    {t('common:common.Actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedForms.map((form) => {
                  return (
                    <StyledTableRow
                      hover
                      key={form?.TWFormId}
                    >
                      <TableCell>
                        <Button
                          color="inherit"
                          variant="text"
                        >
                          {form.formName}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {signedinUserRoleHT == "superadmin" ? utcToLocal(form?.lastModified) : utcToLocal(form?.updatedAt)}
                      </TableCell>
                      {signedinUserRoleHT != "superadmin" && (
                        <>
                          <TableCell>
                            {form.assessmentStat ? t('common:assessment.Yes') : t('common:assessment.No')}
                          </TableCell>
                          <TableCell>
                            {form && form.makeActive
                              ? <Box><CircleIcon sx={{ color: 'green', fontSize: '65%', mr: 1 }} /> {t('common:common.Active')}</Box>
                              : <Box><CircleIcon sx={{ fontSize: '65%', mr: 1 }} />{t('common:common.Inactive')}</Box>
                            }
                          </TableCell>
                        </>
                      )}
                      {signedinUserRoleHT == "superadmin" && (
                        <TableCell>
                          {form?.organizationCount}
                        </TableCell>
                      )}
                      <TableCell
                        align="center"
                        spacing={1}
                      >
                        {signedinUserRoleHT === 'superadmin' || signedinUserRoleHT === 'admin' || signedinUserRoleHT === 'admin+caseworker' || signedinUserRoleHT === 'caseworker'
                          ? (
                            <Tooltip title={t('common:form.manageForm')}>
                              <Button
                                color="primary"
                                style={{ borderRadius: 4 }}
                                variant="contained"
                                size='small'
                                onClick={() => onViewClick(form)}
                              >
                                {form.assessmentStat || form.globalDefault || signedinUserRoleHT === 'caseworker' || signedinUserRoleHT === "superadmin"
                                  ? t('common:question.View')
                                  : t('common:question.Edit')
                                }
                              </Button>
                            </Tooltip>
                          ) : <></>}
                      </TableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          }
          {paginatedForms && paginatedForms.length === 0 && !loading &&
            <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
              <Box>
                <Grid container spacing={3}>
                  <Grid item md={3} xs={6}>
                    <Typography>{t('common:form.No forms to list')}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          }
        </Box>
      <Box sx={{ display: 'flex' }} flexDirection="row-reverse" p={1} m={1}>
        <Box sx={{ alignContent: 'flex-end' }}>
          <Pagination onChange={handlePageChange} page={page} count={pageCount} shape="rounded" />
        </Box>
      </Box>
    </Card>
  );
};

export default FormListTable;