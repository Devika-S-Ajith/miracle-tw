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
import FamilyListTable from '../Components/FamilyListTable';
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
 import toast from 'react-hot-toast';
//import gtm from '../../lib/gtm';

const FamilyList = () => {

  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const {clearListingPageDetails,signedinUserRole} = useContext(CommonDataContext);
  const mounted = useMounted();
  const { settings } = useSettings();
  const [families, setFamilies] = useState([]);
  const [pageCount, setpageCount] = useState(1);
  // const [presentPage, setpresentPage] = useState(1);
  const [loading,setLoading] = useState(false);
  const [payloadData, setPayloadData] = useState({});
  let dataList;
  const [pageData, setPageData] = useState({
    page:1,
    query:'',
    sort: 'familyName',
    langFilter:'',
    statusFilter:''
  })
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  
  const handleAddFamily =()=>{
    navigate('/dashboard/family/add');
  }

  const savePageData = (pageObject= {}) => {
    localStorage.setItem('famPageData',JSON.stringify(pageObject))
  }

  const saveCurrentPage = (currentPage) => {
    // setpresentPage(currentPage)
  }
  
  const handleImport =()=>{
    navigate('/dashboard/family/import');
  }
  const handleExport = useCallback(async () =>{
    try {
      let finalPayload;
      let payload ={
        "moduleType": "family",
        "needFullData": "true",
       }
      finalPayload={...payloadData,...payload}
      finalPayload.HTCountryId = localStorage.getItem('userRegion')
      console.log("final payload in export>>",finalPayload)
      const data = await APIS.ExportFile(finalPayload);
      if(data.data.Message ==="Data export started.")
      {
      toast.success(t('common:common.Data export started'));
      }  
      else if(data.data.Message==="Unauthorized")
      {
        toast.error(t('common:common.Unauthorized'));
      }
    } catch (err) {
      console.error(err);
    }

})


  useEffect(() => {
    document.title = "Family | Miracle Foundation"
    clearListingPageDetails('famPageData');
    if(localStorage.getItem('famPageData') === null){
      getFamilies();
    } else {
      let localPageData = JSON.parse(localStorage.getItem('famPageData'))
      let pageObject = {
      //   "orderByField": [
      //     [
      //         `${localPageData.sort}`,
      //         "ASC"
      //     ]
      // ],
      //"orgNameLike": `${localPageData.query}`,
      "globalSearchQuery": localPageData.query ? `${localPageData.query}` : '',
      "pageNumber": localPageData.page ? `${localPageData.page}` : '',
      "languageFilter": localPageData.langFilter ? `${localPageData.langFilter}` : '',
       "familyStatus": localPageData.statusFilter ? `${localPageData.statusFilter}` : '',

      }
      setPageData({...localPageData})
      getFamilies(pageObject)
      
    }
    return () => {
      
    }
  }, []);

  useEffect(() => {
    if(signedinUserRole !== null){
      if( signedinUserRole !== 'viewonly'){
        // has access
      } else {
        navigate('/Unauthorized');
      }
      return () =>{

      }
    }
  },[signedinUserRole])

  let getFamListpayload = {
    "rowCount": "10",
    "pageNumber": "1",
    "orderByField": [
        [
            "familyName",
            "ASC"
        ]
    ],
    //"languageFilter":"",
    "familyStatus":"",
    "globalSearchQuery": ""
}

const getFamilies =  useCallback(async (payload = null) => {
  setLoading(true)
  try {
    let finalPayload
    if(payload === null){
      finalPayload = getFamListpayload;
    } else {
          finalPayload = { ...getFamListpayload, ...payload};
          getFamListpayload = { ...finalPayload }
    }
    finalPayload.HTCountryId = localStorage.getItem('userRegion')
    console.log("fam final paylaod >>",finalPayload)
    dataList={...finalPayload}
    setPayloadData(dataList);
    const data = await APIS.FamilyList(finalPayload); 
    //if (mounted.current) {
      setFamilies(data && data.data && data.data.familyDetails);
      setpageCount(data && data.data && data.data.pageCount);
      setLoading(false)
      if(data && data.data && data.data.familyDetails.length === 0){
        setIsExportDisabled(true)
       }else{
        setIsExportDisabled(false)
       }
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
                {t('common:family.Families')}
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
                <Button
                  color="primary"
                  startIcon={<DownloadIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  //onClick={()=>{setLocationList(["kochi,alpy,tvm"])}}
                  onClick={handleImport}
                >
                  {t('common:common.Import')}
                </Button>
                <Button
                  color="primary"
                  startIcon={<UploadIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  onClick={handleExport}
                  disabled={isExportDisabled}
                >
                  {t('common:common.Export')}
                </Button>
              </Box> */}
            </Grid>
            <Grid item>
              <Box sx={{ m: -1}}>
             
                <Button
                  color="primary"
                  startIcon={<UploadIcon fontSize="small" />}
                  sx={{ mr: 1,mt :7 }}
                  onClick={handleExport}
                  disabled={isExportDisabled}
                >
                  {t('common:common.Export')}
                </Button>
                <Button
                  color="primary"
                  startIcon={<DownloadIcon fontSize="small" />}
                  sx={{ mr: 1,mt :7 }}
                  //onClick={()=>{setLocationList(["kochi,alpy,tvm"])}}
                  onClick={handleImport}
                >
                  {t('common:common.Import')}
                </Button>
                {signedinUserRole !== 'viewonly'?(<Button
                  // color="#172b4d"
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{ mr: 1,mt :7 }}
                  variant="contained"
                  onClick={handleAddFamily}
                >
                  {t('common:family.Add New Family')}
                </Button>): <></>}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
           
                  <FamilyListTable
                  families={families}
                  loading={loading} 
                  savePageData={savePageData}
                  pageCount={pageCount}
                  pageData={pageData}
                  saveCurrentPage={saveCurrentPage}
                  getFamilyList={getFamilies}
                  />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default FamilyList;
