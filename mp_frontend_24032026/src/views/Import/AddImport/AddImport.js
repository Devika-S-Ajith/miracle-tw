import React,{useState,useCallback} from 'react'
// import {useNavigate} from 'react-router-dom';
import axios from "axios";
import APIS from '../../../common/hooks/UseApiCalls';
import toast from 'react-hot-toast';
import { Box,Card} from '@material-ui/core';
import ImportStepper from '../Components/ImportStepper/ImportStepper';
import ImportFileAddition from '../Components/ImportFileAddition/ImportFileAddition';
import ImportMapping from '../Components/ImportMapping/ImportMapping';
import ImportStarted from '../Components/ImportStarted/ImportStarted';
import { useTranslation } from 'react-i18next';
const AddImport=(props)=> {
    const { t } = useTranslation(['common']);
    const {modulename}=props;
    const [formPage, setFormPage] = useState(1);
    const [csvFile, setCsvFile] = useState(null); 
    const [csvHeader, setCSVHeader] = useState([]);
    const [entityHeader, setEntityHeader] = useState([]);
    const [loading,setLoading] = useState(false);
    const [signedId, setSignedId] = useState(null);
    const [actualImportHeader,setActualImportHeader] = useState({"mappedData":[]})

    // Function call 
    const actualImportHeaderHandler=(data)=>{
        setActualImportHeader(data);
    }
    const onFileSubmit = () => {
        onSetFile();
        let csvFileName = csvFile.name.split('.')
        let csvFileExtension = csvFileName[csvFileName.length -1]
        if(csvFile && (csvFile.type==="text/csv" || csvFileExtension === 'csv'))
        {
            getSignedURL(csvFile);
            setFormPage(formPage+1);
            console.log("csv ",csvFile);
        }
        else{
            toast.error(t('common:common.Please select file with CSV format'));
        }
    }
    const onSetFile=(data)=>{
        setCsvFile(data)
    }
   
     const handleNextPage=()=>{
         setFormPage(formPage+1)
     }
     const handlePrevPage=()=>{
        setFormPage(formPage-1)
    }
    //  Api call
    const getSignedURL = useCallback(async (value) => { 
        setLoading(true)
        try {
            
            let finalPayload = {
                moduleType: modulename,
                documentType: 'csv',
                fileName: `${value.name}`,
                fileSize: `${value.size/1024}`,
                description: `csvfile`
            }
            // console.log('payload:', finalPayload)
            const data = await APIS.UploadCSVFile(finalPayload);
             console.log('api data Upload CSVFile', data)
            if (data.status === 200) {
            fileUpload(value,data.data.signedUrl,data.data.id);
            // console.log('filename value again',value);
            // console.log("signed url :-",data.data.id);
            } else {
                console.log('An Error occurred');
            }
        } catch (err) {
            console.error(err);
        }
    }, [csvFile]);
    const fileUpload = useCallback(async (selectedFile, signedURL,id) => {
        let config = {
            transformRequest: [(data, headers) => {
                delete headers.common.Authorization;
                return data
            }]
        };
        config.headers = {
        'Content-Type': 'text/csv'
        }
        config.method = "PUT";
        config.url = signedURL;
        config.data = selectedFile;
        const res = await axios(config)
        console.log("res",res);
        getHeaderValue(id);
      })
      const getHeaderValue = useCallback(async (id) => { 
        try {
            const data = await APIS.CSVDataBinding(id);
            setSignedId(id);
            // console.log('data', data)
            if (data) {
                setCSVHeader(data.data.csvProperties);
                setEntityHeader(data.data.entityProperties);
                setLoading(false)
                // console.log("entity header",data.data.entityProperties);
                // console.log("csv header",data.data.csvProperties);
            } else {
                console.log('An Error occurred');
            }
        } catch (err) {
            console.error(err);
        }
    }, [csvFile]);
    return (
        <Box>
            <ImportStepper formPage={formPage}/>
            <Card sx={{ mt:3 }}>
            {formPage=== 1 &&
                <ImportFileAddition 
                    formPage={formPage} 
                    onFileSubmit={onFileSubmit} 
                    onSetFile={onSetFile} 
                    csvFile={csvFile}
                    modulename={modulename}/>
            }
            {formPage=== 2 &&
                <ImportMapping 
                    actualImportHeader = {actualImportHeader}
                    actualImportHeaderCallBack={actualImportHeaderHandler}
                    formPage={formPage} entityHeader={entityHeader} csvHeader={csvHeader} loading={loading} handleNextPage={handleNextPage} handlePrevPage={handlePrevPage} modulename={modulename}signedId={signedId}/>    
            }               
            {formPage=== 3 &&
                <ImportStarted
                    actualImportHeader = {actualImportHeader} handlePrevPage={handlePrevPage}
                />
            }                   
             </Card>  
        </Box>

    )
}
export default AddImport
