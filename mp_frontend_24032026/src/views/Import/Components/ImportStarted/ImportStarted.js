import { React, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import APIS from '../../../../common/hooks/UseApiCalls';
import {
  Box,
  Table,
  TableRow,
  TableCell,
  TableHead,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';

function ImportStarted(props) {
  const { t } = useTranslation(['common']);
  const { actualImportHeader } = props;
  const navigate = useNavigate();
  //Function call
  const handleContinue = () => {
    actualImport(actualImportHeader)
  }
  //Api call
  const actualImport = useCallback(async (actualImportHeader) => {
    try {
      const data = await APIS.SaveCsvFile(actualImportHeader);
      if (data) {
        toast.success(t('common:common.Import started'));
      }
      else {
        toast.error('An Error occurred');
      }
    }
    catch (err) {
      console.error(err);
    }
  })
  return (
    <Box
      sx={{ m: 2, mt: 3 }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: '15pt' }}>
              <b>{t('common:common.Start Import')}</b>
            </TableCell>
          </TableRow>
        </TableHead>
      </Table>
      <br></br>
      {t('common:common.ImportMsg')} <b>{t('common:common.CONTINUE')}</b> {t('common:common.ImportMsg1')}
      <br></br>
      {t('common:common.ImportMsg2')}
      <br></br>
      <Button
        color="primary"
        sx={{ width: 150, height: 40, m: 2 }}
        //disabled={isSubmitting}
        type="button"
        variant="contained"
        //onClick={handleContinue()}
        onClick={() => { navigate(-1); handleContinue() }}
      >
        {t('common:common.Continue')}
      </Button>
    </Box>
  )
}

export default ImportStarted
