import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { useTranslation } from 'react-i18next';

const LinkedOrganizationList = (props) => {
  const { linkedOrgList, ...other } = props;
  const { t } = useTranslation(['common']);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    setInvoices(linkedOrgList);
    console.log(linkedOrgList)
    return () => {
    }
  }, [linkedOrgList]);

  return (
    <Card {...other}>
      <CardHeader
        title={t('common:common.Linked Organizations')}
      />
      <Divider />
      <Scrollbar>
        <Box sx={{ minWidth: 1150 }}>
          {invoices && invoices.length > 0 && (<Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  {t('common:common.Name')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices && invoices.length && invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    {invoice.organizationName}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>)}
          {invoices && invoices.length === 0 &&
            <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
              <Box>
                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    item
                    md={3} //6
                    xs={6} //12
                  >
                    <Typography>{t('common:common.No')} {t('common:common.Linked Organizations')}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          }
        </Box>
      </Scrollbar>
    </Card>
  );
};

export default LinkedOrganizationList;
