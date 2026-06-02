import React, { useState,useCallback,useEffect } from "react"
import {
    Card,
    Divider,
    Typography,
    Button,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
} from '@material-ui/core';
import moment from "moment";
import LoadingButton from '@mui/lab/LoadingButton';
import APIS from "../../../common/hooks/UseApiCalls";
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import atob from 'atob';
import { PrintAsPDF } from "../../../components/UserComponents/ReportGenerator";


const CustomDialogModal = ({ progressReportData,progressReportModal, assessmentIdForReport, setProgressReportModal }) => {
    const { t } = useTranslation(['common']);
    const [loading, setLoading] = useState(false)

    const handleProgressReportExport = useCallback(async () => {
        try {
            setLoading(true)
            let finalPayload;
            let payload = {
                "HTAssessmentId":assessmentIdForReport
            }

            console.log("final payload in export>>", finalPayload)
            //generatePdf()
            const data = await APIS.generateFollowUpProgressPdf(payload);
            if (data && data?.data) {
                //console.log(data?.data)
                PrintAsPDF(data?.data)
                setLoading(false)
            }
            else if (data.data.Message === "Unauthorized") {
              toast.error(t('common:common.Unauthorized'));
            }else{
                console.log('issue fetching data to export')
                toast.error('Error while fetching data to export,Please try again in some time');
                setLoading(false)
            }
        } catch (err) {
            console.error(err);
        }
    })

    function utcToLocal(utcDateTime) {
        const localDateTime = moment.utc(utcDateTime).local();
        return localDateTime.format('DD/MM/YYYY');
      }

    return (
        <Dialog
            fullWidth={true}
            maxWidth='md'
            aria-labelledby="simple-dialog-title"
            scroll='paper'
            overflow='scroll'
            visibleScrollbar={false}
            open={progressReportModal}>
            {<>
                    <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant='body2'>
                                Progress Report Submission Date: {progressReportData?.followUpCompletedOn}
                            </Typography>
                            <Typography variant='body2'>
                                Date of Assessment: {progressReportData?.assessmentCompletionDate}
                            </Typography>
                        </div>
                    </DialogTitle>
                    <DialogContent dividers>
                        <DialogContent>
                            {progressReportData?.domains?.map((domainItem, index) => {
                                return (
                                    <Card id={domainItem.domainId} sx={{ minWidth: 275, ml: -2, mr: -2, mt: index === 0 ? -2 : 1, borderRadius: '8px' }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {domainItem.domainName}
                                            </Typography>
                                            <Divider sx={{ ml: -2, mr: -2, mb: 1 }} />
                                            {domainItem?.questions?.map((QuestionItem, index) => {
                                                return (
                                                    <Card sx={{ borderRadius: '4px', minWidth: 275, mb: domainItem?.Question?.length - 1 === index ? -2 : 0, mt: 1, ml: -1, mr: -1 }}>
                                                        <CardContent>
                                                            <Typography variant='subtitle2' gutterBottom>
                                                                <strong>Question: </strong><span style={{ color: QuestionItem.isRedFlag ? 'red' : '' }}>{QuestionItem?.questionText}</span>
                                                            </Typography>
                                                            <Divider sx={{ ml: -2, mr: -2, mb: 1 }} />
                                                            {QuestionItem?.followUpStatus?.map((InterventionItem, index) => {
                                                                return (
                                                                    <>
                                                                        <Typography sx={{ fontSize: 14, ml: 0.5 }} variant='subtitle2' gutterBottom>
                                                                            <strong>Intervention: </strong>{InterventionItem?.Intervention}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: 14, ml: 0.5 }} variant='subtitle2' gutterBottom>
                                                                            <strong>Status of Intervention: </strong>{InterventionItem?.followUpStatus}
                                                                        </Typography>
                                                                        {InterventionItem?.followupStatusDetail && <><Typography sx={{ fontSize: 14, ml: 0.5 }} variant='subtitle2' gutterBottom>
                                                                            <strong>{InterventionItem?.helperText}</strong>
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: 14, ml: 0.5 }} variant='subtitle2' gutterBottom>
                                                                            {InterventionItem?.followupStatusDetail}
                                                                        </Typography></>}
                                                                        {InterventionItem?.followUpStatusQuestions?.map((QuestionAndChoicesItem, index) => {
                                                                            return (
                                                                                <>
                                                                                    <Typography sx={{ fontSize: 14, ml: 0.5 }} variant='subtitle2' gutterBottom>
                                                                                        <strong>{QuestionAndChoicesItem?.question}</strong>
                                                                                    </Typography>
                                                                                    <Typography sx={{ fontSize: 14, ml: 0.5 }} variant='subtitle2' gutterBottom>
                                                                                        {QuestionAndChoicesItem?.followUpStatusQuestionChoices[0]?.choice}
                                                                                    </Typography>

                                                                                </>)
                                                                        })}

                                                                        {index < QuestionItem?.Intervention?.length - 1 && (
                                                                            <Divider sx={{ ml: 0.5, mb: 1 }} />
                                                                        )}
                                                                    </>
                                                                )
                                                            })}
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}


                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </DialogContent>
                    </DialogContent>
                    <DialogActions>
                        <LoadingButton onClick={handleProgressReportExport} loading={loading}
                            loadingPosition="start"
                            startIcon={<FileUploadIcon />} color="primary" variant="contained">
                            {t('common:common.Export')}
                        </LoadingButton>
                        <Button onClick={() => setProgressReportModal(false)} color="primary" autoFocus>
                            {t('common:common.Close')}
                        </Button>
                    </DialogActions>
                </>}
        </Dialog>
    )
}

export default CustomDialogModal;