import { useState, useCallback, useContext } from "react";
import {
    Box, Button,
    Card,
    Divider,
    Typography,CircularProgress
} from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import APIS from "../../../../common/hooks/UseApiCalls";
import toast from "react-hot-toast";
import { useTranslation } from 'react-i18next';
import { ConvertToXLSX } from "../../../../components/UserComponents/ReportGenerator";


const ProgressReportCard = (props) => {
    const { t } = useTranslation(['common']);
    const { title,...other } = props
    const [loading,setLoading] = useState(false)
    
    const handleExport = useCallback(async () => {
        try {
          let finalPayload;
          let payload = {
            "limit":100,
            "start":1,
            "childName":'',
            "fromDate":'',
            "toDate":'',
            "type":"OVERALL"
          }
          console.log("final payload in export>>", finalPayload)
          setLoading(true)
          const data = await APIS.generarateProgressReportList(payload);
          if (data?.data) { 
            ConvertToXLSX(data?.data,'Progress Report Detailed View')
            setLoading(false)
          }
          else if (data.data.Message === "Unauthorized") {
            toast.error(t('common:common.Unauthorized'));
          }
        } catch (err) {
          console.error(err);
        }
    
      })

      
    return (
        <Card {...other}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 3
                }}
            >
                <div>
                    <Typography
                        color="textPrimary"
                        variant="subtitle2"
                    >
                        {title}
                    </Typography>
                </div>
            </Box>
            <Divider />
            <Box
                sx={{
                    px: 3,
                    py: 2
                }}
            >
                <Button
                    color="primary"
                    disabled={loading}
                    endIcon={loading?<CircularProgress size={20}/>:<ArrowForwardIcon fontSize="small" />}
                    variant="text"
                    onClick={() => { handleExport() }}
                >
                    {t('common:common.View Report')}
                </Button>
            </Box>
        </Card>
    )

}

export default ProgressReportCard