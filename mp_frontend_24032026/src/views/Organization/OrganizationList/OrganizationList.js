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
  Typography,
  // Skeleton
} from '@material-ui/core';
import OrganizationListTable from '../Components/OrganizationListTable';
import useMounted from '../../../common/hooks/UseMounted';
// import ChevronRightIcon from '../../../assets/icons/ChevronRight';
import DownloadIcon from '../../../assets/icons/Download';
import PlusIcon from '../../../assets/icons/Plus';
import UploadIcon from '../../../assets/icons/Upload';
import APIS from '../../../common/hooks/UseApiCalls';
import useSettings from '../../../common/hooks/UseSettings';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
//import gtm from '../../lib/gtm';

const OrganizationList = () => {
  const { t } = useTranslation(['common']);
  const {clearListingPageDetails, signedinUserRole} = useContext(CommonDataContext);
  const navigate = useNavigate();
  const mounted = useMounted();
  const { settings } = useSettings();
  const [organizations, setOrganizations] = useState([]);
  const [pageCount, setpageCount] = useState(1);
  const [presentPage, setpresentPage] = useState(1);
  const [loading,setLoading] = useState(false);
  const [payloadData, setPayloadData] = useState({});
  let dataList;
  const [pageData, setPageData] = useState({
    page:1,
    query:'',
    sort: 'organizationName',
    typeFilter:'',
    statusFilter:''
  })
  const [isExportDisabled, setIsExportDisabled] = useState(true);

  const handleAddOrg =()=>{
    navigate('/dashboard/organizations/add');
  }

  const savePageData = (pageObject= {}) => {
    localStorage.setItem('orgPageData',JSON.stringify(pageObject))
  }

  const saveCurrentPage = (currentPage) => {
    setpresentPage(currentPage);
    console.log(`%c${presentPage}`,"display:none")
  }

  const handleImport =()=>{
    navigate('/dashboard/organizations/import');
  }
  const handleExport = useCallback(async () =>{
    try {
      let finalPayload;
      let payload ={
        "moduleType": "organization",
        "needFullData": "true",
       }
      finalPayload={...payloadData,...payload}
      if(signedinUserRole==='superadmin'){
        finalPayload.HTCountryId =''
      }else{
        finalPayload.HTCountryId = localStorage.getItem('userRegion')
      }
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

  let getOrgListpayload = {
    "rowCount": "10",
    "pageNumber": "1",
    "globalSearchQuery" : "",
    "orgStatus":"",
    "orgTypeFilter":"",
    "orderByField": [
        [
            "organizationName",
            "ASC"
        ]
    ],
    //"zipCodeLike": "",
    //"orgNameLike": "",
    //"phoneNumberLike": "",
    //"emailLike": "",
    //"addressLine1Like": "",
    //"addressLine2Like": "",
}

const getOrgListpayloadConstant = {
  "rowCount": "10",
  "pageNumber": "1",
  "globalSearchQuery" : "",
  "orgStatus":"",
  "orgTypeFilter":"",
  "orderByField": [
      [
          "organizationName",
          "ASC"
      ]
  ],
}

  const getOrganizations =  useCallback(async (payload = null) => {
    setLoading(true)
    try {
      let finalPayload
      if(payload === null){
        finalPayload = getOrgListpayloadConstant
      } else {
            finalPayload = { ...getOrgListpayload, ...payload};
            getOrgListpayload = { ...finalPayload }
      }
      if(signedinUserRole==='superadmin'){
        finalPayload.HTCountryId =''
      }else{
        finalPayload.HTCountryId = localStorage.getItem('userRegion')
      }
      console.log("final paylaod >>",finalPayload)
      dataList={...finalPayload}
      setPayloadData(dataList);
      const data = await APIS.OrganizationList(finalPayload); 
      //if (mounted.current) {
        setOrganizations(data && data.data && data.data.organizations);
        console.log("Org list in orgpage",data.data.organizations);
        setpageCount(data && data.data && data.data.pageCount);
        setLoading(false)
        if(data && data.data && data.data.organizations.length === 0){
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

  useEffect(() => {
    document.title = "Organizations | Miracle Foundation"
    setLoading(true);
    clearListingPageDetails('orgPageData');
    if(localStorage.getItem('orgPageData') === null){
      getOrganizations();
    } else {
      let localPageData = JSON.parse(localStorage.getItem('orgPageData'))
      let pageObject = {
        "orderByField": [
          [
              `${localPageData.sort}`,
              "ASC"
          ]
      ],
      //"orgNameLike": `${localPageData.query}`,
      "globalSearchQuery": `${localPageData.query}`,
      "pageNumber": `${localPageData.page}`,
      "orgStatus": `${localPageData.statusFilter}`,
      "orgTypeFilter":`${localPageData.typeFilter}`,
      }
      setPageData({...localPageData})
      getOrganizations(pageObject)
      
    }
    return () => {
    }
  }, []);

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
                {t('common:organization.Organization List')}
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
                {signedinUserRole === 'superadmin' ?(<Button
                  color="primary"
                  startIcon={<DownloadIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  //onClick={()=>{setLocationList(["kochi,alpy,tvm"])}}
                  onClick={handleImport}
                  
                >
                  {t('common:common.Import')}
                </Button>):<></>}
                <Button
                  color="primary"
                  startIcon={<UploadIcon fontSize="small" /> }
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
                  startIcon={<UploadIcon fontSize="small" /> }
                  sx={{ mr: 1,mt :7 }}
                  onClick={handleExport}
                  disabled={isExportDisabled}
                >
                  {t('common:common.Export')}
                </Button>
                {signedinUserRole === 'superadmin' ? (
               <>
               <Button
                color="primary"
                startIcon={<DownloadIcon fontSize="small" />}
                sx={{ mr: 1,mt :7 }}
                //onClick={()=>{setLocationList(["kochi,alpy,tvm"])}}
                onClick={handleImport}
                
              >
                {t('common:common.Import')}
              </Button>
              <Button
                  // color="#172b4d"
                  startIcon={<PlusIcon fontSize="small" />}
                  sx={{ mr: 1,mt :7 }}
                  variant="contained"
                  onClick={handleAddOrg}
                >
                  {t('common:organization.Add Organization')}
                </Button></>) : <></>}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <OrganizationListTable 
                                    savePageData={savePageData}
                                    pageCount={pageCount}
                                    pageData={pageData}
                                    organizations={organizations} 
                                    saveCurrentPage={saveCurrentPage}
                                    loading={loading}
                                    getOrganisationlist={getOrganizations} />

          </Box>
        </Container>
      </Box>
    </>
  );
};

export default OrganizationList;
