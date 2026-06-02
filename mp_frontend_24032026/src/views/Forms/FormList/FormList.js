import { useState, useEffect, useCallback, useContext } from 'react';
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
import APIS from '../../../common/hooks/UseApiCalls';
import FormListTable from '../Components/FormListTable';
import useMounted from '../../../common/hooks/UseMounted';
// import ChevronRightIcon from '../../../assets/icons/ChevronRight';
// import DownloadIcon from '../../../assets/icons/Download';
// import PlusIcon from '../../../assets/icons/Plus';
// import UploadIcon from '../../../assets/icons/Upload';
import useSettings from '../../../common/hooks/UseSettings';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';
//API CALL
//import APIS from '../../../common/hooks/UseApiCalls';

//import gtm from '../../lib/gtm';

const FormList = () => {
  // const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const mounted = useMounted();
  const { settings } = useSettings();
  const [forms, setForms] = useState([]);
  const [pageCount, setpageCount] = useState(1);
  // const [presentPage, setpresentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { setCurrentQuestionData,setFormDetails,setCurrentlySelectedDomain } = useContext(CommonDataContext);
  const [pageData, setPageData] = useState({
    page: 1,
    query: '',
    sort: 'familyName'
  })

  // const handleAddForm =()=>{
  //   console.log('handleAdd called')
  //   //navigate('/dashboard/forms/add');
  // }

  const savePageData = (pageObject = {}) => {
    localStorage.setItem('formPageData', JSON.stringify(pageObject))
  }

  const saveCurrentPage = (currentPage) => {
    // setpresentPage(currentPage)
  }

  // const handleImport =()=>{
  //   navigate('/dashboard/forms/import');
  // }

  useEffect(() => {
    document.title = "Forms | Miracle Foundation"
    setCurrentQuestionData([])
    //setFormDetails([])
    setCurrentlySelectedDomain(1)
  }, []);

  // useEffect(() => {
  //   if (signedinOrgType !== null && signedinUserRole !== null) {
  //     if ((signedinUserRole === 'superadmin') || (signedinOrgType == 1 && signedinUserRole === 'caseworker')) {
  //       // has access
  //     } else {
  //       navigate('/Unauthorized');
  //     }
  //   }

  //   clearListingPageDetails('formPageData');
  //   if (localStorage.getItem('formPageData') === null) {
  //     getForms();
  //   } else {
  //     let localPageData = JSON.parse(localStorage.getItem('formPageData'))
  //     let pageObject = {
  //       //   "orderByField": [
  //       //     [
  //       //         `${localPageData.sort}`,
  //       //         "ASC"
  //       //     ]
  //       // ],
  //       //"orgNameLike": `${localPageData.query}`,
  //       "globalSearchQuery": `${localPageData.query}`,
  //       "pageNumber": `${localPageData.page}`,
  //     }
  //     setPageData({ ...localPageData })
  //     //getForms(pageObject)

  //   }
  //   return () => {

  //   }
  // }, [signedinOrgType, signedinUserRole]);

  let getFamListpayload = {
    "rowCount": "10",
    "pageNumber": "1",
    "orderByField": [
      [
        "id",
        "DESC"
      ]
    ],
    "familyStatus": "",
    "globalSearchQuery": ""
  }

  const getForms = useCallback(async () => {
    //setLoading(true)

    let payload = {
      "formName": "",
      "HTFormId": "",
      "limit": 10,
      "page": 1
    }

    try {
      // let finalPayload
      // if(payload === null){
      //   finalPayload = getFamListpayload;
      // } else {
      //       finalPayload = { ...getFamListpayload, ...payload};
      //       //getFamListpayload = { ...finalPayload }
      // }
      const data = await APIS.GetFormDetails();
      console.log("data >>", data)
      //if (mounted.current) {
      if (data && data.data && data.data.data) {
        setForms(data && data.data && data.data.data);
      }

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
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          pt: 2 //new style
          //py: 8
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <Box sx={{ mt: 3 }}>
            <FormListTable
              // forms={forms}
              // loading={loading}
              // savePageData={savePageData}
              // pageCount={pageCount}
              // pageData={pageData}
              // saveCurrentPage={saveCurrentPage}
              // getFormList={getForms}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default FormList;
