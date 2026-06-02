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
import { useTranslation } from 'react-i18next';
import APIS from '../../../common/hooks/UseApiCalls';
import AssessmentListTable from '../Components/AssessmentListTable';
import useMounted from '../../../common/hooks/UseMounted';
// import ChevronRightIcon from '../../../assets/icons/ChevronRight';
// import DownloadIcon from '../../../assets/icons/Download';
import PlusIcon from '../../../assets/icons/Plus';
// import UploadIcon from '../../../assets/icons/Upload';
import useSettings from '../../../common/hooks/UseSettings';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import _ from 'lodash'
//API CALL
//import APIS from '../../../common/hooks/UseApiCalls';

//import gtm from '../../lib/gtm';

const AssessmentList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const mounted = useMounted();
  const { settings } = useSettings();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [assessments, setAssessments] = useState([]);
  const [pageCount, setpageCount] = useState(1);
  // const [presentPage, setpresentPage] = useState(1);
  const [loading,setLoading] = useState(false);
  const {clearListingPageDetails, signedinUserRole, signedinOrgType} = useContext(CommonDataContext);
  const localPageData = !_.isEmpty(localStorage.getItem('assessmentPageData'))?JSON.parse(localStorage.getItem('assessmentPageData')):null
  const [pageData, setPageData] = useState(localPageData?{
    page:localPageData.page,
    query:localPageData.query,
    sort: localPageData.sort,
    order:localPageData.order,
    isComplete:localPageData.isComplete,
    orgFilter:localPageData.orgFilter
  }:{
    page:1,
    query:'',
    sort: 'dateOfAssessment',
    order:'ASC'

  })
  
  const handleAddAssessment =()=>{
    navigate('/dashboard/assessments/add');
  }
  // const handleImport =()=>{
  //   navigate('/dashboard/assessments/import');
  // }

  const savePageData = (pageObject= {}) => {
    localStorage.setItem('assessmentPageData',JSON.stringify(pageObject))
  }

  const saveCurrentPage = (currentPage) => {
    // setpresentPage(currentPage)
  }

  useEffect(() => {
    document.title = "Assessments | Miracle Foundation"
  }, [])

  useEffect(() => { 
    if(signedinUserRole !== null && signedinOrgType !== null){
      if(signedinUserRole !== 'viewonly'){
        clearListingPageDetails('assessmentPageData'); 
        if(localStorage.getItem('assessmentPageData') === null || localStorage.getItem('assessmentPageData')==''){
          getAssessments();
        } else {
          let localPageData = JSON.parse(localStorage.getItem('assessmentPageData'))
          let pageObject = {
            "orderByField": [
              [
                  `${localPageData.sort}`,
                  `${localPageData.order}`
              ]
          ],
          //"orgNameLike": `${localPageData.query}`,
          "globalSearchQuery": `${localPageData.query}`,
          "pageNumber": `${localPageData.page}`,
          //"isComplete": `${localPageData.isComplete=='All'?'':localPageData.isComplete}`,
         // "organizationFilter": `${localPageData.orgFilter=="0"?'':localPageData.orgFilter}`,
          }
          setPageData({...localPageData})
          getAssessments(pageObject)
        }
        // has access
      } else {
        navigate('/Unauthorized');
      }
    }
    
    return () => {
    }
  }, [signedinUserRole,signedinOrgType]);

  let getAssessmentListpayload = {
    "rowCount": "10",
    "pageNumber": "1",
    "orderByField": [
        ["dateOfAssessment", "ASC" ],
       // ["id", "DESC"]
    ],
    "assessmentStatus": "",
    "userTimeZone": userTimeZone
}

const setPageDataFun =(pagedataformtable)=>{
  setPageData(pagedataformtable)
}

const getAssessments =  useCallback(async (payload = null) => {
  setLoading(true)
  try {
    let finalPayload
    if(payload === null){
      finalPayload = getAssessmentListpayload;
    } else {
          finalPayload = { ...getAssessmentListpayload,...payload};
          //getAssessmentListpayload = { ...finalPayload }
    }
    const data = await APIS.AssessmentList(finalPayload); 
    //if (mounted.current) {
      console.log("assessent data", data);
      setAssessments(data && data.data && data.data.data);
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
                {t('common:assessment.Assessment List')}
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
                {[3,4,5].includes(parseInt(signedinOrgType)) ?(<Button
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
            {/* <Grid item>
              <Box sx={{ m: -1}}>
                {[3,4,5].includes(parseInt(signedinOrgType)) && (<Button
                  // color="#172b4d"
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{ mr: 1,mt :7 }}
                  variant="contained"
                  onClick={handleAddAssessment}
                  disabled
                >
                  {t('common:assessment.Add Assessment')}
                </Button>)}
              </Box>
            </Grid> */}
          </Grid>
          <Box sx={{ mt: 3 }}>
           
                  <AssessmentListTable
                  assessments={assessments}
                  loading={loading} 
                  savePageData={savePageData}
                  pageCount={pageCount}
                  pageData={pageData}
                  setPageDataFromTable={setPageDataFun}
                  saveCurrentPage={saveCurrentPage}
                  getAssessmentList={getAssessments}
                  />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AssessmentList;
