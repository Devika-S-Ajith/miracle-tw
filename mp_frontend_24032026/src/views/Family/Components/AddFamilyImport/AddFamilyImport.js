import React,{useState,useEffect,useCallback} from 'react'
import { useNavigate} from 'react-router-dom';
import axios from "axios";
import { Box,
    Card,
    Table,
    TableRow,
    TableCell,
    TableHead,
    Stepper,
    Step,
    StepLabel,
    Button,
    MenuItem,
    TextField,
    CircularProgress,
    Typography,
    TableBody} from '@material-ui/core';
import APIS from '../../../../common/hooks/UseApiCalls';
import toast from 'react-hot-toast';
const AddChildImport=()=> {
    const [formPage, setFormPage] = useState(1);
    const [csvFile, setCsvFile] = useState(null);
    const [csvHeader, setCSVHeader] = useState([]);
    const [familyHeader, setFamilyHeader] = useState([]);
    const [loading,setLoading] = useState(false);
    const [selectedHeader, setSelectedHeader] = useState([]);
    const [required, setRequired] = useState([]);
    const [count, setCount] = useState(0);
    const navigate = useNavigate();
    const submit = () => {
        if(csvFile.type==="text/csv")
        {
            getSignedURL(csvFile);
      
        setFormPage(formPage+1);
        console.log("csv ",csvFile);
        }
        else{
            toast.error("Please select file with CSV format");
        }
        
    }
    const getSignedURL = useCallback(async (value) => { 
        setLoading(true);
        console.log('filename value now:',value.name);
        try {
            
            let finalPayload = {
                moduleType: 'family',
                documentType: 'csv',
                fileName: `${value.name}`,
                fileSize: `${value.size/1024}`,
                description: `csvfile`
            }
             console.log('payload:', finalPayload)
            const data = await APIS.UploadCSVFile(finalPayload);
             console.log('data', data)
            if (data.status === 200) {
                fileUpload(value,data.data.signedUrl,data.data.id);
                console.log('filename value again',value);
                console.log("signed url :-",data.data.id);
                
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
             console.log('data', data)
            if (data) {
                setCSVHeader(data.data.csvProperties);
                setFamilyHeader(data.data.entityProperties);
                setLoading(false)
             console.log("entity header",data.data.entityProperties);
             console.log("csv header",data.data.csvProperties);
            } else {
                console.log('An Error occurred');
            }
        } catch (err) {
            console.error(err);
        }
    }, [csvFile]);
    const  handleFieldValue=(event,index)=>{
        let data = event.target.value;
        let array=[...selectedHeader]
        let flag=false;
        required.map((item)=>{
         if(item===index){
             if(count!==required.length){
                console.log("if",item)
                setCount(count+1)
             }
            array.forEach((item,i)=>{
                if(item.key === index){
                    array[i] = {key:index,value:data};
                    flag=true;
                }
            })
            if(!flag){
                array.push({key:index,value:data});
            }
         }
        else{
                array.forEach((item,i)=>{
                    if(item.key === index){
                        array[i] = {key:index,value:data};
                        flag=true;
                    }
                })
                if(!flag){
                    array.push({key:index,value:data});
                }
            }
        })
        setSelectedHeader(array); 
       }
       console.log("csv val",selectedHeader) 
       console.log("count",count)
    const handleReq=()=>{
        let reqarray=[...required]
        familyHeader.map((item,index)=>{
            if(item.isMandatory===true){
            console.log("indexof orgHeader",index)
            reqarray.push(index)
            
            }
        })
        setRequired(reqarray);
    }
    console.log("required outside",required)
    useEffect(() => {
       handleReq()
      }, [loading]);
    const handleNextPage=()=>{
        console.log("working",selectedHeader);
          setFormPage(formPage+1)  
         }
    const handleCancel=()=>{
        setSelectedHeader([])
        setCount(0)
    }    
   

     
    return (
        <Box>
            <Card>
                <Box 
                sx={{ m: 2,mt:3 }}
                >
                    <Table>
                        <TableHead>
                                <TableRow>
                                    <TableCell sx={{fontSize: '18pt'}}>
                                    Data Import Wizard
                                    </TableCell> 
                                </TableRow>
                        </TableHead>
                    </Table>
                    {formPage !== 4 &&
                    <Box sx={{ width: '100%', marginTop: '30px', marginBottom: '20px', overflow: 'auto' }}>
                    <Stepper activeStep={formPage-1} alternativeLabel>
                        <Step key="Upload Data" >
                        <StepLabel >Upload Data</StepLabel>
                        </Step>
                        <Step key="Edit Mappings" >
                        <StepLabel>Edit Mappings</StepLabel>
                        </Step>
                        <Step key="Start Import" >
                        <StepLabel >Start Import</StepLabel>
                        </Step>
                    </Stepper>
                    </Box> 

                    }
                    
                </Box>
                    
            </Card>
            <Card sx={{ mt:3 }}>
                {formPage=== 1 &&
                    <Box 
                    sx={{ m: 2,mt:3 }}
                    >
                        <Table>
                            <TableHead>
                                    <TableRow>
                                        <TableCell sx={{fontSize: '15pt' }}>
                                         Please select a CSV file to import
                                        </TableCell> 
                                    </TableRow>
                            </TableHead>
                        </Table>
                        <br></br>
                        <form id='csv-form'>
                        <TextField
                            
                            type='file'
                            accept='.csv'
                            id='csvFile'
                            // ref={hiddenFileInput}
                            onChange={(e) => {
                                setCsvFile(e.target.files[0])
                            }}
                        >
                        </TextField>
                        <Button
                            color="primary"
                            sx={{width : 150, height: 40, m : 2}}
                            //disabled={isSubmitting}
                            type="button"
                            variant="contained"
                            onClick={(e) => {
                                e.preventDefault()
                                if(csvFile)submit()
                            }}>
                            Submit
                        </Button>
                        </form>
                    </Box>
                }
                {formPage=== 2 &&
                    <Box>
                    <Box 
                    sx={{ m: 2,mt:3 }}
                    >
                       <Table>
                           <TableHead>
                                   <TableRow sx={{fontSize: '15pt'}}>
                                       <TableCell sx={{fontSize: '15pt' ,mb:2}}>
                                       Edit Mappings
                                       </TableCell> 
                                       <TableCell/>
                                   </TableRow>
                           </TableHead>
                           {loading && <CircularProgress 
                                   sx={{zIndex : 1000,
                                   position : "absolute",
                                   top : "80%",
                                   left : "45%"}}
                                   color="primary"/>
                           }
                           <TableBody sx={{mb:4}}>
                               <TableRow sx={{mb:4}}>
                                   <TableCell sx={{fontSize: '12pt' ,fontWeight:"bold",ml:4}}>
                                   <TextField inputProps={{style: {fontSize: '12pt',fontWeight:"bold"}}} InputProps={{ disableUnderline: true }} value="Family Field" variant="standard"/>
                                   <TextField inputProps={{style: {fontSize: '12pt',fontWeight:"bold"}}} InputProps={{ disableUnderline: true }} sx={{ml:40}} value="CSV Field" variant = "standard"/>
                                   </TableCell>
                                   <TableCell/>
                               </TableRow>
                           </TableBody>
                           {familyHeader&& familyHeader.length >0 && familyHeader.map((item,index)=>(
                           <TableBody sx={{mt:4}}>
                               { item.isMandatory ? 
                                   <TextField sx={{ width:500,m:2}} value={item.entityLabel +" *"}/>
                                   :<TextField sx={{ width:500,m:2}} value={item.entityLabel}/>
                               }
                               <TextField sx={{ width:500,m:2}}
                                   fullWidth
                                   // helperText={ "This field is required"}
                                   onChange={(event)=>handleFieldValue(event,index)}
                                   name={selectedHeader.length > 0 ? selectedHeader.find(ele=>ele.key===index)?.value :''} 
                                   value={selectedHeader.length > 0 ? selectedHeader.find(ele=>ele.key===index)?.value :''}
                                   label="Select from options"
                                   select
                                   //required={item.isMandatory ? true : false}
                               >
                                   {csvHeader&& csvHeader.length > 0 && csvHeader.map((option)=>(
                                       <MenuItem key={option.id} 
                                       value={option.csvKey}>
                                       {option.csvKey}
                                       </MenuItem>
                                       ))
                                   }               
                               </TextField>
                           </TableBody>
                           ))}
                       </Table> 
                    </Box>
                   <Box>
                    {loading===false && <Typography color="red" variant="subtitle2" sx={{ml:4,mb:2}}>All fields marked * are to be filled</Typography>}
                       <Button
                       color="primary"
                       sx={{width : 200,ml: 4}}
                       disabled={selectedHeader<= 0 ? true:false ||count===required.length?false:true}
                       variant="contained"
                       onClick={()=>handleNextPage()}
                       >
                       Next
                       </Button>
                       <Button
                       color="primary"
                       sx={{width : 200,ml : 21}}
                       type="reset"
                       disabled={selectedHeader<= 0 ? true:false}
                       variant="contained"
                       onClick={handleCancel}
                       >
                       Cancel
                       </Button>
                   </Box>
               </Box> 

                }
                {formPage=== 3 &&
                    <Box 
                    sx={{ m: 2,mt:3 }}
                    >
                    <Table>
                        <TableHead>
                                <TableRow>
                                    <TableCell sx={{fontSize: '15pt' }}>
                                    Start Import
                                    </TableCell> 
                                </TableRow>
                        </TableHead>
                    </Table>
                    <br></br>
                    Your data has been sucessfully uploaded and your fields have been mapped. If you are ready to begin the import process,please select the CONTINUE button below.
                    <br></br>
                    <Button
                       color="primary"
                       sx={{width : 150, height: 40, m : 2}}
                       //disabled={isSubmitting}
                       type="button"
                       variant="contained"
                       //onClick={handleContinue}
                       onClick={()=>navigate(-1)}
                    >   
                      Continue
                    </Button>

                    </Box>
                }   
             </Card>  
                 
                
  
        </Box>

    )
}

export default AddChildImport
