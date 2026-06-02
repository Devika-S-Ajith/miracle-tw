import { useState, useEffect, useCallback,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import {
  Box,
  // Breadcrumbs,
  Button,
  Container,
  Grid,
  // Link,
  Typography
} from '@material-ui/core';
import APIS from '../../../common/hooks/UseApiCalls';
import CaseListTable from '../Components/CaseListTable';
import useMounted from '../../../common/hooks/UseMounted';
// import ChevronRightIcon from '../../../assets/icons/ChevronRight';
// import DownloadIcon from '../../../assets/icons/Download';
import PlusIcon from '../../../assets/icons/Plus';
// import UploadIcon from '../../../assets/icons/Upload';
import useSettings from '../../../common/hooks/UseSettings';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';
//API CALL
//import APIS from '../../../common/hooks/UseApiCalls';

//import gtm from '../../lib/gtm';

const CaseList = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const mounted = useMounted();
  const { settings } = useSettings();
  const [cases, setCases] = useState([]);
  const [pageCount, setpageCount] = useState(1);
  const [presentPage, setpresentPage] = useState(1);
  const [loading,setLoading] = useState(false);
  const { clearListingPageDetails, signedinUserRole, signedinOrgType } = useContext(CommonDataContext); 

  const [pageData, setPageData] = useState({
    page:1,
    query:'',
    sort: 'caseName'
  })
  
  const handleAddCase =()=>{
    navigate('/dashboard/cases/add');
  }
  // const handleImport =()=>{
  //   navigate('/dashboard/cases/import');
  // }

  const savePageData = (pageObject= {}) => {
    localStorage.setItem('casePageData',JSON.stringify(pageObject))
  }

  const saveCurrentPage = (currentPage) => {
    setpresentPage(currentPage)
    console.log(`%c${presentPage}`,"display:none")
  }




  useEffect(() => {
    document.title = "Cases | Miracle Foundation"
    clearListingPageDetails('casePageData');
    if(localStorage.getItem('casePageData') === null){
      getCases();
    } else {
      let localPageData = JSON.parse(localStorage.getItem('casePageData'))
      let pageObject = {
      //   "orderByField": [
      //     [
      //         `${localPageData.sort}`,
      //         "ASC"
      //     ]
      // ],
      //"orgNameLike": `${localPageData.query}`,
      "globalSearchQuery": `${localPageData.query}`,
      "pageNumber": `${localPageData.page}`,
      }
      setPageData({...localPageData})
      getCases(pageObject)
      
    }
    return () => {
      
    }
  }, []);

  let getFamListpayload = {
    "rowCount": "10",
    "pageNumber": "1", 
    "orderByField": [
        [
            "HTChildId",
            "ASC"
        ]
    ],
    "caseStatus": "",
    "globalSearchQuery": ""
}

const getCases =  useCallback(async (payload = null) => {
  setLoading(true)
  try {
    let finalPayload
    if(payload === null){
      finalPayload = getFamListpayload;
    } else {
          finalPayload = { ...getFamListpayload, ...payload};
          //getFamListpayload = { ...finalPayload }
    }
    const data = await APIS.ListCases(finalPayload); 
    console.log('caselist',data);
    //if (mounted.current) {
      setCases(data && data.data && data.data.data);
      setpageCount(data && data.data && data.data.pageCount);
      setLoading(false)
    //}
  } catch (err) {
    console.error(err);
    setLoading(false)
  }
}, [mounted]);

  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer List | Material Kit Pro</title>
      </Helmet> */}
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          pt : 2 //new style
          //py: 8
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <Grid
            container
            justifyContent="space-between"
            spacing={3}
          >
            <Grid item>
              <Typography
                color="textPrimary"
                variant="h5"
              >
                {t('common:case.Case List')}
              </Typography>
              {/* <Breadcrumbs
                aria-label="breadcrumb"
                separator={<ChevronRightIcon fontSize="small" />}
                sx={{ mt: 1 }}
              >
                <Link
                  color="textPrimary"
                  component={RouterLink}
                  to="/dashboard"
                  variant="subtitle2"
                >
                  Dashboard
                </Link>
                <Link
                  color="textPrimary"
                  component={RouterLink}
                  to="/dashboard"
                  variant="subtitle2"
                >
                  Management
                </Link>
                <Typography
                  color="textSecondary"
                  variant="subtitle2"
                >
                  Customers
                </Typography>
              </Breadcrumbs> */}


              {/* <Box
                sx={{
                  mb: -1,
                  mx: -1,
                  mt: 1
                }}
              >
                {((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) && 
                (signedinUserRole === 'admin' || signedinUserRole === 'caseworker'))
                ?(<Button
                  color="primary"
                  startIcon={<DownloadIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  //onClick={()=>{setLocationList(["kochi,alpy,tvm"])}}
                  //onClick={handleImport}
                >
                  {t('common:common.Import')}
                </Button>):<></>}
                <Button
                  color="primary"
                  startIcon={<UploadIcon fontSize="small" />}
                  sx={{ m: 1 }}
                >
                  {t('common:common.Export')}
                </Button>
              </Box> */}
            </Grid>
            <Grid item>
              <Box sx={{ m: -1}}>
              {((signedinOrgType == 3 || signedinOrgType == 4 || signedinOrgType == 5) && 
                (signedinUserRole === 'admin' || signedinUserRole === 'caseworker'))
                ? <Button
                  // color="#172b4d"
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{ mr: 1,mt :7 }}
                  variant="contained"
                  onClick={handleAddCase}
                >
                  {t('common:case.Add Case')}
                </Button> : <></>}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
           
                  <CaseListTable
                  families={cases}
                  loading={loading} 
                  savePageData={savePageData}
                  pageCount={pageCount}
                  pageData={pageData}
                  saveCurrentPage={saveCurrentPage}
                  getCaseList={getCases}
                  />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CaseList;
