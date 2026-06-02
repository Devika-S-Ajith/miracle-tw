import { useState, useEffect, useCallback,useContext } from 'react';
import {  useNavigate } from 'react-router-dom';
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
import QuestionListTable from '../Components/QuestionListTable';
import useMounted from '../../../common/hooks/UseMounted';
// import ChevronRightIcon from '../../../assets/icons/ChevronRight';
import DownloadIcon from '../../../assets/icons/Download';
import PlusIcon from '../../../assets/icons/Plus';
import UploadIcon from '../../../assets/icons/Upload';
import useSettings from '../../../common/hooks/UseSettings';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';
//API CALL
//import APIS from '../../../common/hooks/UseApiCalls';

//import gtm from '../../lib/gtm';

const QuestionsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const mounted = useMounted();
  const { settings } = useSettings();
  const {clearListingPageDetails, signedinOrgType, signedinUserRole} = useContext(CommonDataContext);
  const languageList = JSON.parse(localStorage.getItem('languageList'));
  const currentLanguage = localStorage.getItem('language');
  const getLanguageId = () => {
    const langId = languageList.length && languageList.find(item => item.languageCode == currentLanguage)?.id
    return langId == 1 ? "" : langId;
  }
  const [selectedLanguageId, setSelectedLanguageId] = useState(currentLanguage === 'en' ? "" : getLanguageId());
  const [questions, setQuestions] = useState([]);
  const [pageCount, setpageCount] = useState(1);
  // const [presentPage, setpresentPage] = useState(1);
  const [loading,setLoading] = useState(false);
  const [pageData, setPageData] = useState({
    page: 1 ,
    query: '',
    sort: 'HTQuestionDomainId'
  })
  
  const handleAddQuestion =()=>{
    navigate('/dashboard/questions/add');
  }
  const handleAddCustomQuestion =()=>{
    navigate('/dashboard/questions/addCustomQuestion');
  }

  const savePageData = (pageObject= {}) => {
    localStorage.setItem('questionPageData',JSON.stringify(pageObject))
    console.log("pageObject stored >>",pageObject)
  }

  const saveCurrentPage = (currentPage) => {
    // setpresentPage(currentPage)
  }




  useEffect(() => {
    document.title = "Questions | Miracle Foundation"
    if( (signedinUserRole === 'superadmin') || (signedinOrgType == 1 && signedinUserRole === 'caseworker')){
      // has access
    } else {
      navigate('/Unauthorized');
    }
    clearListingPageDetails('questionPageData');  
    if(localStorage.getItem('questionPageData') === null){
      getQuestions();
    } else {
      let localPageData = JSON.parse(localStorage.getItem('questionPageData'))
      let pageObject = {
        "rowCount": "10",
        "pageNumber": `${localPageData.page}`,
        "questionStatus": "",
        "globalSearchQuery": `${localPageData.query}`,
        "HTQuestionDomainId": "",
        "HTQuestionTypeId": "",
        "orderByField": [
          [
              `${localPageData.sort}`,
              "ASC"
          ]
        ],
        "HTLanguageId" : currentLanguage === 'en' ? "" : getLanguageId(),
        "HTOrganizationId" : null
      }
      setPageData({...localPageData})
      getQuestions(pageObject)
      
    }
    return () => {
      //setPageData({})
    }
  }, []);

  let getQuestionListpayload = {
    "rowCount": "10",
    "pageNumber": "1",
    "orderByField": [
       ["HTQuestionDomainId", "ASC"]
      ],
    "questionStatus": "",
    "needFullData" : "false",
    "globalSearchQuery": "",
    "HTQuestionDomainId": "",
    "HTLanguageId" : localStorage.getItem('language') === 'en' ? "" : getLanguageId()
  }

  useEffect(() => {
    const languagePayload = { "HTLanguageId" : currentLanguage === 'en' ? "" : getLanguageId() }
    let finalPayload = { ...getQuestionListpayload, ...languagePayload};
    if(selectedLanguageId != finalPayload.HTLanguageId){
      getQuestions(finalPayload)
      setSelectedLanguageId(finalPayload.HTLanguageId)
    }
  }, [currentLanguage])

const getQuestions =  useCallback(async (payload = null) => {
  setLoading(true)
  setQuestions([])
  try {
    let finalPayload
    if(payload === null){
      finalPayload = getQuestionListpayload;
    } else {
      finalPayload = { ...getQuestionListpayload, ...payload};
    }
    // if(!finalPayload.HTLanguageId){
    //   // finalPayload.HTLanguageId = localStorage.getItem('language') === 'en' ? "" : getLanguageId()
    // }
    const langId = languageList.length && languageList.find(item => item.languageCode == localStorage.getItem('language'))?.id
    finalPayload.HTLanguageId = localStorage.getItem('language') === 'en' ? "" : (langId == 1 ? "" : langId)
    const data = await APIS.ListQuestions(finalPayload); 
    //if (mounted.current) {
      setpageCount(data && data.data && data.data.pageCount);
      let list = data && data.data && data.data.data;
      setQuestions(list)
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
                {t('common:question.Questions List')}
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
                {/* {(signedinUserRole === 'superadmin') ? (<Button
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
                {(signedinUserRole === 'superadmin')?(<Button
                  // color="#172b4d"
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{ mr: 1,mt :7 }}
                  variant="contained"
                  onClick={handleAddQuestion}
                >
                  {t('common:question.Add Question')}
                </Button>):<></>}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
           
                  <QuestionListTable
                  questions={questions}
                  loading={loading} 
                  savePageData={savePageData}
                  pageCount={pageCount}
                  pageData={pageData}
                  saveCurrentPage={saveCurrentPage}
                  getQuestionList={getQuestions}
                  />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default QuestionsList;
