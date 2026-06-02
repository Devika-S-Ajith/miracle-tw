import { useState, useEffect } from 'react';
// import { Link as RouterLink,useParams } from 'react-router-dom';
//import { format } from 'date-fns';
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
  // TablePagination,
  TableRow,
  Typography
} from '@material-ui/core';
// import { customerApi } from '../../../../__fakeApi__/customerApi';
// import useMounted from '../../../../common/hooks/UseMounted';
// import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
// import Label from '../../../../components/Label';
//import MoreMenu from '../../MoreMenu';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { useTranslation } from 'react-i18next';
// import APIS from '../../../../common/hooks/UseApiCalls';
// import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';

const LinkedOrganizationList = (props) => {
    const {linkedOrgList, ...other } = props;
  const { t } = useTranslation(['common']);
  // const mounted = useMounted();
  const [invoices, setInvoices] = useState([]);
  // const { roleList } = useContext(CommonDataContext)
  // let { id } = useParams();


  useEffect(() => {
    setInvoices(linkedOrgList);
    console.log(linkedOrgList)
    return () => {
    }
  }, [linkedOrgList]);

  return (
    <Card {...other}>
      <CardHeader
        //action={<MoreMenu />}
        title={t('common:common.Linked Organizations')}
      />
      <Divider />
      <Scrollbar>
        <Box sx={{ minWidth: 1150 }}>
        {invoices && invoices.length>0 && (<Table>
            <TableHead>
              <TableRow>
                <TableCell>
                {t('common:common.Name')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { invoices && invoices.length && invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                  {invoice.organizationName}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            
          </Table>)}
          { invoices && invoices.length === 0 &&
          <Box sx={{ width : "100%", ml : "40%", mt : 5,mb :1}}>
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
      {/* <TablePagination
        component="div"
        count={invoices.length}
        onPageChange={() => {
        }}
        onRowsPerPageChange={() => {
        }}
        page={0}
        rowsPerPage={5}
        rowsPerPageOptions={[5, 10, 25]}
      /> */}
    </Card>
  );
};

export default LinkedOrganizationList;
