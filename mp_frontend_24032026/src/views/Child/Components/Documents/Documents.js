import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  IconButton,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Tooltip,
  TableRow,
  TextField,
  CircularProgress,
  Pagination
} from '@material-ui/core';
import moment from 'moment';
import toast from 'react-hot-toast';
import _ from 'lodash';
import useMounted from '../../../../common/hooks/UseMounted';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
//import Label from '../../../../components/Label';
import TrashIcon from '../../../../assets/icons/Trash';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import APIS from '../../../../common/hooks/UseApiCalls';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';

const Documents = (props) => {
  const mounted = useMounted();
  const { t } = useTranslation(['common']);
  const { care_givers, childId, ...other } = props;
  let { id } = useParams();

  const inputEl = useRef(null)
  const [ loading, setLoading] = useState(false);
  const [ isDeleting, setIsDeleting] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);
  const [modalFlag, setModalFlag] = useState(false);
  const [modalFlag2, setModalFlag2] = useState(false);
  const [filename,setFileName] = useState(''); //? New Line
  const [uploadFlag,setUploadFlag] = useState(false); //? New Line
  const [signedURL,setSignedURL] = useState(''); //? New Line
  const [allowedType,setAllowedType] = useState(true)
  const [page, setPage] = useState(1);
  const [pageData,setPageData]= useState([]);
  // const [uploadStatus, setUploadStatus] = useState('');
  const {signedinOrgType, signedinUserRole} = useContext(CommonDataContext);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const allowedExtendions = new Set( [
    'pdf',
    'doc',
    'docx',
    'jpg',
    'jpeg',
    'gif',
    'xls',
    'xlsx',
    'csv',
    'png']);


    

  useEffect(() => {
    // console.log(`%c${loading}`,"display:none")
    getDocumentsList(childId);
    return () => {
    }
  }, []);

  useEffect(() => {
    if(signedURL !== ''  ){
      fileUpload()
    }
    return () => {
    }
  }, [signedURL]);



  const getDate = (payload = null) => {
    let yourDate = payload === null ? new Date() : new Date(payload)
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    let newDate =  yourDate.toISOString()
    // console.log(moment(newDate).format('DD/MM/YYYY'),"DD/MM/YYYY")
    return moment(newDate).format('DD/MM/YYYY')
}

 const getDateToSort =  (payload = null) => {
  let yourDate = payload === null ? new Date() : new Date(payload)
  const offset = yourDate.getTimezoneOffset()
  yourDate = new Date(yourDate.getTime() - (offset*60*1000))
  let newDate =  yourDate.toISOString()
  // console.log(moment(newDate).format('DD/MM/YYYY'),"DD/MM/YYYY")
  return moment(newDate).format('YYYY/MM/DD')
}
  const changeHandler = (event) => { //? New Function
		setSelectedFile(event.target.files[0]);
		setIsFilePicked(true);
    let filenames = event.target.files[0].name.split('.')
    let extension = filenames[filenames.length -1];
    // if(filename === ''){
      setFileName(event.target.files[0].name.split('.')[0])
    // }
    if(!allowedExtendions.has(extension.toLowerCase())){
      setUploadFlag(true);
       setAllowedType(false);
    }else {
      setUploadFlag(false);
      setAllowedType(true);
    }
    // getSignedURL(event.target.files[0])
	};

  const getSignedURL = useCallback(async (value) => { //? New Function
    setLoading(true);
    setUploadFlag(true);
    // console.log('filename value now:',filename)
    try {
        let nameWithoutExtension = value.name.split('.')[0];
        let nameWithoutSpaces= nameWithoutExtension.replaceAll(" ","-")
        let finalPayload = {
            moduleType: 'child',
            documentType: 'doc',
            fileName: `${value.name.toLowerCase()}`,
            moduleId: `${id}`,
            fileSize: `${value.size/1024}`,
            description: `${filename !== '' ? filename.replaceAll(' ','-') : nameWithoutSpaces }`
        }
        
        // console.log('newName:',nameWithoutSpaces)
        // console.log('payload:', finalPayload)
        const data = await APIS.UploadFile(finalPayload);
        // console.log('data', data)
        if (data.status === 200) {
            // setUploadFlag(false);
            setSignedURL(data.data.signedUrl);
            console.log("signed url",signedURL);
        } else {
            console.log('An Error occurred');
        }

    } catch (err) {
        setUploadFlag(false)
        console.error(err);
    }
}, []);

const fileUpload = useCallback(async () => { //? New Function
  let config = {
      transformRequest: [(data, headers) => {
          delete headers.common.Authorization;
          return data
      }]
  };
  config.headers = {
      'Content-Type': 'multipart/form-data'
  }
  config.method = "PUT";
  config.url = signedURL;
  config.data = selectedFile;
  const res = await axios(config)
  // console.log(res)
  if(res.status === 200){
    toast.success(t('common:common.File Uploaded Successfully'));
    setTimeout(() =>{ getDocumentsList(childId);}, 3500)
  } else {
    toast.error(t('common:warnings.Error Occured'));
  }
  setUploadFlag(false)
  handleClose();
 // setTimeout(() =>{ getDocumentsList(childId);}, 3500)
  // console.log(res);
})

const startUpload = () => {
  getSignedURL(selectedFile);
}

   const formatBytes =(bytes, decimals = 2) => { //? New Function
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

  const handleClose = () => {
    inputEl.current.value = '';
    setIsFilePicked(false);
    setSelectedFile();
    setModalFlag(!modalFlag);
    setUploadFlag(false);
    setFileName('');
    setSignedURL('');
      
    };

  const handleClose2 = () => {
    setModalFlag2(!modalFlag2);
    setSelectedDocumentId(null);
      
    };
  const openModal2 = (value) => {
    setSelectedDocumentId(value)
    setModalFlag2(!modalFlag2);
      
    };

  

  const deleteDocument = async () => {
    setIsDeleting(true)
    try {
      const statusPayload = {
        "id": selectedDocumentId,
        "isActive": "true",
        "isDeleted": "true"
      }
      await APIS.DeleteDocument(statusPayload)
      .then((res) =>{
        if(res.data.Message !=="Status Changed successfully"){
          toast.error(res.data.Message);
          setModalFlag2(false);
          // setSelectedCaseId(null);
          getDocumentsList(childId);
        }
        else if(res.data.Message ==="Status Changed successfully"){
          toast.success(t('common:common.File Deleted Successfully'));
          setModalFlag2(false);
          setSelectedDocumentId(null);
          getDocumentsList(childId);
        }
        else {
          toast.error(t('common:common.Something went wrong'));
          setModalFlag2(false);
          setSelectedDocumentId(null);
          getDocumentsList(childId);
          // setStatus({ success: false });
        }
        setIsDeleting(false)
      })

    }catch (err) {
      console.log(err,'error')
      toast.error(t('common:common.Something went wrong'));
      // setStatus({ success: false });
      // setErr/ors({ submit: err.message });
    }
  }
  
  const openModal = (value) => {
    setModalFlag(!modalFlag);
      
    };

  let getFamListpayload = {
    "rowCount": "100",
    "pageNumber": "1",
    "orderByField": [
        [
            "id",
            "DESC"
        ]
    ],
    "globalSearchQuery": "",
    "HTOrganizationId": "",
    "HTChildId": "",
    "moduleType" : "",
    "documentType" : ""
}

  const getDocumentsList =  useCallback(async (value) => {
    setLoading(true)
    let consentPayload ={
      "rowCount": "100",
      "pageNumber": "1",
      "orderByField": [
        [
            "id",
            "DESC"
        ]
      ],
      "globalSearchQuery": "",
      "HTOrganizationId": "",
      "HTChildId": `${id}`,
    }


    try {
       let finalPayload = getFamListpayload;
       finalPayload.HTChildId = id  
       const data = await APIS.UploadedFileList(finalPayload);
       const consentData = await APIS.ListChildrenConsent(consentPayload)
       const combinedDocList = [...data?.data?.data || [],...consentData?.data?.data || []] 
       const sortedDocList = combinedDocList.sort((a, b) => {
          return new Date(getDateToSort(b.createdAt)) - new Date(getDateToSort(a.createdAt));
       })
       setPageData(sortedDocList);
       setLoading(false)
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, [mounted]);

  useEffect(()=>{
    const currentPageItems = pageData.slice(0,10)
    setDocuments(currentPageItems)
    setPage(1);
  },[pageData])

  const handlePageChange = (event,value) => {
    
     if(page<value){
      const currentPageItems = pageData.slice((page)*10,(value*10))
      setDocuments(currentPageItems)
     }else if(page>value){
      const currentPageItems = pageData.slice((value-1)*10,(page-1)*10)
      setDocuments(currentPageItems)
     }
    setPage(value);
  }

  return (<>
    <Card {...other}>
      <CardHeader
        title={t('common:common.Documents')}
      
      action ={((signedinOrgType == 3 || signedinOrgType == 4) && (signedinUserRole === 'admin' || signedinUserRole === 'caseworker'))?
      (
        <Button color="primary" onClick={openModal}  variant="contained" component="span">
        {t('common:common.Upload Document')}
        </Button>
      ):<></>}/>
      <Divider />
      <Scrollbar>
      {loading && <CircularProgress 
                    sx={{zIndex : 1000,
                          position : "absolute",
                          top : "55%",
                          left : "45%"}}
                    color="primary" />}
        <Box>
          { documents && documents.length > 0 && <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                {t('common:common.Document Name')}
                </TableCell>
                <TableCell>
                {t('common:common.File Size')}
                </TableCell>
                <TableCell>
                {t('common:common.Submitted Date')}
                </TableCell>
                <TableCell align="right">
                {t('common:common.Actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents && documents.length > 0 && documents.map((assessment) => (
              <TableRow key={assessment.id}>
                  <TableCell>
                    {assessment.isConsent?'Consent_'+_.startCase(_.toLower(assessment.consentStatus)):assessment.description.replaceAll('-',' ')}
                  </TableCell>

                  <TableCell>
                    {assessment.isConsent?'-':parseFloat(assessment.fileSize).toFixed(2) + ' KB'}
                  </TableCell>
                  <TableCell>
                    { getDate(assessment.createdAt)}
                  </TableCell>
                  <TableCell 
                    align="right"
                    >
                    {(!assessment.isConsent && ((signedinOrgType == 3 || signedinOrgType == 4) && (signedinUserRole === 'admin' || signedinUserRole === 'caseworker')))?
                    (<Tooltip title={t('common:common.Delete Document')}>
                      <IconButton onClick={(e)=>{openModal2(assessment.id)}}>
                        <TrashIcon fontSize="small"/> 
                      </IconButton>
                      </Tooltip>):<></>}

                      {!assessment.isConsent && <Tooltip title={t('common:common.Download Document')}>
                      <IconButton
                        href={assessment.fileUrl}
                        target="_blank"
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                      </Tooltip>}
                    </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>}
          { documents && documents.length === 0 &&
          <Box sx={{ width : "100%", ml : "40%", mt : 5,mb :1}}>
            <Box>
                <Grid
                  container
                  // spacing={3}
                >
                      <Grid
                        container
                        item
                        md={3} //6
                        xs={6} //12
                        >
                          <Typography>{t('common:common.No Documents to list')}</Typography>
                      </Grid>
                </Grid>
            </Box>
           </Box>
          }
        </Box>
      </Scrollbar>
      <Box sx={{display:'flex'}} flexDirection="row-reverse"  p={1} m={1}>
        <Box sx={{alignContent: 'flex-end'}}>
          <Pagination onChange={handlePageChange} page={page} count={pageData && Math.ceil(pageData.length/10)} shape="rounded" />
        </Box>
      </Box>
      {/* <TablePagination
        component="div"
        count={documents && documents.length}
        onPageChange={() => {
        }}
        onRowsPerPageChange={() => {
        }}
        page={0}
        rowsPerPage={5}
        rowsPerPageOptions={[5, 10, 25]}
      /> */}
    </Card>
    <Dialog aria-labelledby="simple-dialog-title" fullWidth={true}  //? New Dialog
        maxWidth={'md'} open={modalFlag}>
      <DialogTitle id="simple-dialog-title">
      {t('common:common.Upload Document')}
      </DialogTitle>
      <DialogContent>
            {loading  && <CircularProgress 
                          sx={{
                            zIndex : 1000,
                            position : "absolute",
                            top : "55%",
                            left : "45%"
                          }}
                          color="primary" />}
            <Box sx={{ m: 2, mt: 1 }}>
                      <Grid
                        container
                        spacing={3}
                      >
                        <Grid
                          item
                          md={6}
                          xs={12}
                        >
                          <TextField
                            fullWidth
                            autoFocus
                            label={t('common:common.Document Name')}
                            name="first_name"
                            onChange={(e) => {
                              setFileName(e.target.value)} }
                            required
                            value={filename}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid
                          item
                          md={6}
                          xs={12}
                        >
                          <label htmlFor="upload-photo">
                            <input
                            style={{ display: 'none' ,marginLeft:'40%' }}
                            id="upload-photo"
                            name="upload-photo"
                            type="file"
                            ref={inputEl}
                            onChange={changeHandler}
                            />

                          <Button color="primary" fullWidth  variant="contained" component="span" disabled={uploadFlag && allowedType}>
                          {t('common:common.Select File')}
                          </Button>
                          </label>
                          
                        </Grid>
                        <Grid
                          item
                          md={6}
                          xs={12}
                        >
                          {isFilePicked ? (
                            <>
                            <Typography variant="subtitle1" gutterBottom component="span">
                            {t('common:common.Filename')}: {selectedFile.name}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom component="span">
                            <br/>
					                  {t('common:common.Size')}: {formatBytes(selectedFile.size)}
                            </Typography>
                            {(uploadFlag && !loading) ?(<><Typography variant="subtitle1" style={{color: '#f44336' }} gutterBottom component="span">
                            <br/>
					                  {t('common:common.Sorry Incorrect Filetype to Upload!')}
                            </Typography>
                            <br/>
                             <Typography variant="subtitle1" gutterBottom component="span">
                             {t('common:common.Allowed types')}: <b>pdf, doc, docx, xls, xlsx, csv, jpg, jpeg, png, gif</b>
                             </Typography></>
                            ):(<></>)}
                            </>
			                    ) : (
                            <>
                            <Typography variant="subtitle1" gutterBottom component="span">
					                  {t('common:common.Select a file to show details')}
                            </Typography>
                            <br/>
                            <Typography variant="subtitle1" gutterBottom component="span">
                            {t('common:common.Allowed types')}: <b>pdf, doc, docx, xls, xlsx, csv, jpg, jpeg, png, gif</b>
                            </Typography>
                            <br/>
                            </>
                            
			                    )}
                        </Grid>

                <Grid
                item
                direction="row"
                md={12}
                xs={12}
                sx={{ mt : 4 }}
                >
                  <Button
                  color="primary"
                  sx={{width : 160 }}
                  variant="contained"
                  onClick={handleClose}
                  // style={{backgroundColor : theme.palette.button.primary}}
                  disabled={uploadFlag && allowedType }
                >
                  {t('common:common.Cancel')}
                </Button>    
                {isFilePicked ? (<>
                
                <Button
                  color="primary"
                  sx={{width : 160 , ml:14}}
                  disabled={uploadFlag}
                  variant="contained"
                  onClick={startUpload}
                >
                  {t('common:common.Upload')}
                </Button>
                {/* <Typography variant="subtitle1" gutterBottom component="span">
					        {uploadStatus}
                </Typography> */}
                </>
                ) : <></>}
                </Grid>
                </Grid>  
            </Box>
        </DialogContent>    
    </Dialog>
    <Dialog aria-labelledby="simple-dialog-title" open={modalFlag2}>
          
      <DialogTitle id="simple-dialog-title">{t('common:question.Are you sure')}</DialogTitle>
      <DialogContent>
          {isDeleting && <CircularProgress 
                          sx={{
                            zIndex : 1000,
                            position : "absolute",
                            top : "55%",
                            left : "45%"
                          }}
                          color="primary" />}
          <DialogContentText id="alert-dialog-description">
            <br></br>
            {t('common:child.Confirm Delete Document')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteDocument} color="primary" disabled={isDeleting}>
            {t('common:child.DeleteDocumentYes')}
          </Button>
          <Button onClick={handleClose2} color="primary" autoFocus disabled={isDeleting}>
            {t('common:common.Cancel')}
          </Button>
        </DialogActions>
      
    </Dialog>
    </>
  );
};

export default Documents;
