import { useState, useEffect, useCallback,useContext } from 'react';
import { useNavigate} from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import { Box, Button, Container, Grid, Typography } from '@material-ui/core';
import UserListTable from '../Components/UserListTable';
import useMounted from '../../../common/hooks/UseMounted';
import DownloadIcon from '../../../assets/icons/Download';
import PlusIcon from '../../../assets/icons/Plus';
import UploadIcon from '../../../assets/icons/Upload';
import useSettings from '../../../common/hooks/UseSettings';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
//API CALL
import APIS from '../../../common/hooks/UseApiCalls';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
//import gtm from '../../lib/gtm'; 

const UserList = () => {
  const { getUserTokens, clearListingPageDetails, signedinUserRole } = useContext(CommonDataContext);
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const mounted = useMounted();
  const { settings } = useSettings();
  const [users, setUsers] = useState([]);
  const [orgOptions, setOrgOptions] = useState([{id:'0',organizationName:'All'}]);
  const [pageCount, setpageCount] = useState(1);
  const [loading,setLoading] = useState(false);
  const [presentPage, setpresentPage] = useState(1);
  const [payloadData, setPayloadData] = useState({});
  let dataList;
  const [pageData, setPageData] = useState({
    page:1,
    query:'',
    sort:'firstName',
    statusFilter:'',
    typeFilter:''
    
  })
  const [isExportDisabled, setIsExportDisabled] = useState(true);

  const getUserListpayloadConstant = {
    "rowCount": "10",
    "pageNumber": "1",
    "orderByField": [
        [
            "firstName",
            "ASC"
        ]
    ],
    "zipCodeLike": "",
    "firstNameLike": "",
    "lastNameLike": "",
    "phoneNumberLike": "",
    "emailLike": "",
    "addressLine1Like": "",
    "addressLine2Like": "",
    "userStatus": "",
    "organizationId":""
}

  let getUserListpayload = {
    "rowCount": "10",
    "pageNumber": "1",
    "orderByField": [
        [
            "firstName",
            "ASC"
        ]
    ],
    "zipCodeLike": "",
    "firstNameLike": "",
    "lastNameLike": "",
    "phoneNumberLike": "",
    "emailLike": "",
    "addressLine1Like": "",
    "addressLine2Like": "",
    "userStatus": "",
    "organizationId":""
}

  useEffect(() => {
    document.title = "Users | Miracle Foundation"
    //gtm.push({ event: 'page_view' });
    getUserTokens();
    setLoading(true);
    clearListingPageDetails('userPageData')
    getOrgList()
    if(localStorage.getItem('userPageData') === null){
      getUserList();
    } else {
      let localPageData = JSON.parse(localStorage.getItem('userPageData'))
      console.log("local Page data",localPageData);
      let pageObject = {
        "orderByField": [
          [
              `${localPageData.sort}`,
              "ASC"
          ]
      ],
      //"orgNameLike": `${localPageData.query}`,
      "globalSearchQuery": `${localPageData.query}`,
      "pageNumber":`${localPageData.page}`,
      "organizationId" :`${localPageData.typeFilter}`,
      "userStatus" :`${localPageData.statusFilter}`
      }
      setPageData({...localPageData})
     
      getUserList(pageObject)
    }
  }, []);

  const handleAddOrg =()=>{
    navigate('/dashboard/users/add');
  }
  const handleImport =()=>{
    navigate('/dashboard/users/import');
  }
  const handleExport = useCallback(async () =>{
      try {
        let finalPayload;
        let payload ={
          "moduleType": "user",
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
//   const getUsers = useCallback(async () => {
//     try {
//       const data = await APIS.OrganizationList(); 

//       if (mounted.current) {
//         setCustomers(data.data.organizations);
//         setLoading(false)
//       }
//     } catch (err) {
//       console.error(err);
//       setLoading(false)
//     }
//   }, [mounted]);


const savePageData = (pageObject= {}) => {
  localStorage.setItem('userPageData',JSON.stringify(pageObject))
}

const saveCurrentPage = (currentPage) => {
  setpresentPage(currentPage)
  console.log(`%c${presentPage}`,"display:none")
}


const getUserList =  useCallback(async (payload = null) => {
  setLoading(true)
  try {
    let finalPayload
    if(payload === null){
      finalPayload = getUserListpayloadConstant
    } else {
          finalPayload = { ...getUserListpayload, ...payload};
          getUserListpayload = { ...finalPayload }
    }

    if(signedinUserRole==='superadmin'){
      finalPayload.HTCountryId =''
    }else{
      finalPayload.HTCountryId = localStorage.getItem('userRegion')
    }
    
    dataList={...finalPayload}
    setPayloadData(dataList);
    const data = await APIS.ListUsers(finalPayload);
    console.log("api call",data)

    //if (mounted.current) {
      if(data=== undefined){
        // getUserList();
      }
      setUsers(data && data.data && data.data.users);
      setpageCount(data && data.data && data.data.pageCount);
      setLoading(false)
      if(data && data.data && data.data.users.length === 0){
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

const getOrgList = useCallback(async () => {
  try {
    const data = await APIS.LinkedOrganizationList();
    if (data && data.data && data.data.orgSelectionList.length) {
      setOrgOptions([{id:0,organizationName:'All'}, ...data.data.orgSelectionList])
    }
  } catch (err) {
    console.error(err);
  }
}, [mounted]);


  // useEffect(() => {
  //   getUserList()
    
  //   setLoading(true)
  // }, []);

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
                {t('common:user.UserList')}
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
                {(signedinUserRole === 'superadmin' || signedinUserRole === 'admin')
                ?(<Button
                  color="primary"
                  startIcon={<DownloadIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  //onClick={()=>{setLocationList(["kochi,alpy,tvm"])}}
                  onClick={handleImport}
                  disable={true}
                >
                 {t('common:common.Import')}

                </Button>):<></>}
                <Button
                  color="primary"
                  startIcon={<UploadIcon fontSize="small" />}
                  sx={{ mr: 1,mt :7 }}
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
                {(signedinUserRole === 'superadmin' || signedinUserRole === 'admin')
                ?<>
                <Button
                color="primary"
                startIcon={<DownloadIcon fontSize="small" />}
                sx={{ mr: 1,mt :7 }}
                //onClick={()=>{setLocationList(["kochi,alpy,tvm"])}}
                onClick={handleImport}
                disable={true}
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
                  {t('common:user.Add User')}
                </Button></> : <></>}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
           
                  { users && <UserListTable customers={users}
                                            savePageData={savePageData}
                                            pageCount={pageCount}
                                            pageData={pageData}
                                            saveCurrentPage={saveCurrentPage}
                                            loading={loading}
                                            orgOptions={orgOptions}
                                            getUserlist={getUserList} /> }
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default UserList;
