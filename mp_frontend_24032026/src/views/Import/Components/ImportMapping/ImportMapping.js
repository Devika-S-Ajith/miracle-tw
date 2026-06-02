import{ React,useState,useEffect,useContext }from 'react'
import { Box,
    Table,
    TableRow,
    TableCell,
    TableHead,
    Button,
    MenuItem,
    TextField,
    CircularProgress,
    Typography,
    TableBody} from '@material-ui/core';
import { useTranslation } from 'react-i18next';    
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import Autocomplete from '@mui/material/Autocomplete';
function ImportMapping(props) {
    const { t } = useTranslation(['common']);
    const {entityHeader,csvHeader,loading,modulename,signedId,handleNextPage, formPage, actualImportHeader,actualImportHeaderCallBack}=props;
    const moduleName = modulename.charAt(0).toUpperCase() + modulename.slice(1);
    const [selectedHeader, setSelectedHeader] = useState([]);
    const [required, setRequired] = useState([]);
    const [count, setCount] = useState(0);
    const {userIdData} = useContext(CommonDataContext);
    const [headerName, setHeaderName] = useState("");
    const [inputValue,setInputValue] =useState('')
    const ModuleList = [
        {
            Name:t('common:common.User'),
            moduleHeader:"User",
            id:1
  
        },
        {
            Name:t('common:common.Organization'),
            moduleHeader:"Organization",
            id:2
        },
        {
            Name:t('common:common.Family'),
            moduleHeader:"Family",
            id:3
        },
        {
            Name:t('common:common.Child'),
            moduleHeader:"Child",
            id:4
        }
      ]
    
    useEffect(() =>{
        if(required.length===0)
         handleReq()
         handlemoduleName()
    }, [loading]);
    //Function call 
    const handlemoduleName=()=>{
    ModuleList.map(i=>{
        console.log(moduleName);
        if(moduleName===i.moduleHeader){
            setHeaderName(i.Name);
        }
        console.log(headerName);
    })
    }
    const handleReq=()=>{
        let reqarray=[...required]
        entityHeader.map((item,index)=>{
            if(item.isMandatory===true){
            reqarray.push(index)
            }
        })
        setRequired(reqarray);
    }
    const  handleFieldValue=(event,entityIndex,entityKey)=>{
    let csvCurrentData = event;
    onActualImportHandler(csvCurrentData,entityIndex,entityKey)
    let array=[...selectedHeader]
    let flag=false;
    required.map((item)=>{
        if(item===entityIndex){
            if(count!==required.length){
                setCount(count+1)
            }
            array.forEach((item,i)=>{
            if(item.key === entityIndex){
                array[i] = {key:entityIndex,value:csvCurrentData};
                flag=true;
            }
    })
        if(!flag){
            array.push({key:entityIndex,value:csvCurrentData});
        }
     }
        else{
                array.forEach((item,i)=>{
                    if(item.key ===entityIndex){
                        array[i] = {key:entityIndex,value:csvCurrentData};
                        flag=true;
                    }
                })
                if(!flag){
                    array.push({key:entityIndex,value:csvCurrentData});
                }
            }
    })
    setSelectedHeader(array); 
    }
    const  onActualImportHandler=(csvCurrentData,entityIndex,entityKey)=>{
        let flag=false;
        let actualImportData={...actualImportHeader}
        actualImportData.mappedData.forEach((item)=>{
            if(item.csvProperty.id===entityIndex)
                {
                    item.csvProperty.csvKey=csvCurrentData;
                    flag=true;
                }
            })
        if(!flag){
                actualImportData["documentId"]=signedId;
                actualImportData["userId"]=userIdData;
                actualImportData.mappedData.push({
                "csvProperty": 
                {
                "id": entityIndex,
                "csvKey":csvCurrentData
                },"entityProperty": 
                {
                "entityKey": entityKey
                }});
            
            }
        actualImportHeaderCallBack(actualImportData); 
    }
   const handleCancel=()=>{
    setSelectedHeader([])
    setCount(0)
    }
    const handleNext=()=>{
        handleNextPage();
         }
 
    return (
        <div>
            { formPage === 2 &&
            <Box>
                    <Box 
                    sx={{ m: 2,mt:3 }}
                    >
                        
                        <Table>
                           <TableHead>
                                   <TableRow>
                                       <TableCell sx={{fontSize: '15pt' ,mb:2}}>
                                       <b>{t('common:common.Edit Mappings')}</b>
                                       </TableCell> 
                                       <TableCell/>
                                   </TableRow>
                           </TableHead> 
                            <TableBody>
                                <TableRow>
                                   <TableCell >
                                   <Typography color="black" variant="h6" sx={{ml:2,mb:1}}>{headerName} {t('common:common.Field')}</Typography>
                                   </TableCell>
                                   <TableCell >
                                   <Typography color="black" variant="h6" sx={{ml:1,mb:1}}>{t('common:common.CSV Field')}</Typography>
                                   </TableCell>
                                </TableRow>
                                {entityHeader && entityHeader.map((item,index) => !item.isHidden && (
                                    <TableRow key={index} sx={{mt:2}}>
                                        <TableCell >
                                            { item.isMandatory ? 
                                                <Typography sx={{ width:500,m:1,ml:2}}>{item.entityLabel +" *"}</Typography>
                                                :
                                                <Typography sx={{ width:500,m:1,ml:2}}>{item.entityLabel}</Typography>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {csvHeader &&
                                                // <TextField sx={{ width:450,m:1}} fullWidth
                                                //     onChange={(event)=>handleFieldValue(event,index,item.entityKey)}
                                                //     name={item.entityLabel} 
                                                //     value={selectedHeader.length > 0 ? selectedHeader.find(ele=>ele.key===index) !== undefined ?
                                                //         selectedHeader.find(ele=>ele.key===index).value : "" : ""}
                                                //     label="Select from options"
                                                //     select >
                                                //     { csvHeader.length > 0 && csvHeader.map((option)=>(
                                                //         <MenuItem key={option.id} 
                                                //         value={option.csvKey}>
                                                //         {option.csvKey}
                                                //         </MenuItem>
                                                //         ))
                                                //     }               
                                                // </TextField>
                                                <Autocomplete                                               
                                                   onChange={(event,data)=>handleFieldValue(data?.csvKey,index,item.entityKey)}
                                                   autoHighlight
                                                   getOptionLabel={item => {        
                                                    return  typeof item === "string"
                                                      ? csvHeader.find(i => i.id === item)?csvHeader.find(i => i.id === item).csvKey:""        
                                                      : item.csvKey
                                                  }}                                             
                                                   name={item.entityLabel}
                                                   onBlur={()=>false}                           
                                                   id={item.entityLabel}
                                                   options={csvHeader}
                                                   sx={{ width: 300 }}
                                                   renderInput={(params) => <TextField {...params}  label={t('common:common.Select from options')}/>}
                                                    />
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table> 
                        {loading && <CircularProgress 
                                            sx={{zIndex : 1000,
                                            position : "absolute",
                                            top : "80%",
                                            left : "45%"}}
                                            color="primary"/>
                        }
                    </Box>
                    
                   <Box sx={{mb:2}}>
                   {loading===false && <Typography color="red" variant="subtitle2" sx={{ml:4,mb:2}}>{t('common:common.All fields marked * are to be filled')}</Typography>}
                       <Button
                       color="primary"
                       sx={{width : 200,ml: 4}}
                       disabled={selectedHeader<= 0 ? true:false ||count===required.length?false:true}
                       variant="contained"
                       onClick={()=>handleNext()}
                       >
                       {t('common:assessment.Next Page')}
                       </Button>
                       <Button
                       color="primary"
                       sx={{width : 200,ml : 21}}
                       type="reset"
                       disabled={selectedHeader<= 0 ? true:false}
                       variant="contained"
                       onClick={handleCancel}
                       >
                       {t('common:common.Cancel')}
                       </Button>
                   </Box>
               </Box>    
            } 
        </div>
    
    )
}
export default ImportMapping
