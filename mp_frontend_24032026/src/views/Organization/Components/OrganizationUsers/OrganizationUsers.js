import { useState, useEffect, useCallback,useContext } from 'react';
import { Link as RouterLink,useParams } from 'react-router-dom';
//import { format } from 'date-fns';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  // TablePagination,
  TableRow,
  Typography,
  CircularProgress
} from '@material-ui/core';
// import { customerApi } from '../../../../__fakeApi__/customerApi';
// import useMounted from '../../../../common/hooks/UseMounted';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import Label from '../../../../components/Label';
//import MoreMenu from '../../MoreMenu';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { useTranslation } from 'react-i18next';
import APIS from '../../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';

const OrganizationUsers = (props) => {
  const { t } = useTranslation(['common']);
  // const mounted = useMounted();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const { staticRoleList } = useContext(CommonDataContext)
  let { id } = useParams();
  

  const getUserListpayloadConstant = {
    "rowCount": "20",
    "pageNumber": "1",
    "orderByField": [
        [
            "firstName",
            "ASC"
        ]
    ],
    "zipCodeLike": "",
    "firstNameLike": "",
    "lastNameLike": "",
    "phoneNumberLike": "",
    "emailLike": "",
    "addressLine1Like": "",
    "addressLine2Like": "",
    "userStatus": "",
    "organizationId":`${id}`
}


  const getInvoices =  useCallback(async () => {
    setLoading(true)
    try {
      console.log("final payload >>",getUserListpayloadConstant)
      const data = await APIS.ListUsers(getUserListpayloadConstant);
      console.log("api call",data) 
      //if (mounted.current) {
        if(data=== undefined){
          // getUserList();
        }
        setInvoices(data && data.data && data.data.users);
        setLoading(false)
      //}
    } catch (err) {
      console.error(err);
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    console.log(`%c${loading}`,"display:none")
    getInvoices();
    return () => {
    }
  }, []);

  return (
    <Card {...props}>
      <CardHeader
        //action={<MoreMenu />}
        title={t('common:common.Users')}
      />
      <Divider />
      <Scrollbar>
      {loading && <CircularProgress 
                    sx={{
                        zIndex : 1000,
                        position : "absolute",
                        top : "55%",
                        left : "45%"
                      }}
                    color="primary" />}
        <Box sx={{ minWidth: 1150 }}>
        {invoices && invoices.length>0 && (<Table>
            <TableHead>
              <TableRow>
                <TableCell>
                {t('common:common.Name')}
                </TableCell>
                <TableCell>
                {t('common:common.Role')}
                </TableCell>
                <TableCell>
                {t('common:common.Phone')}
                </TableCell>
                <TableCell>
                {t('common:common.Email')}
                </TableCell>
                {/* <TableCell>
                  Total
                </TableCell> */}
                <TableCell>
                {t('common:common.Status')}
                </TableCell>
                <TableCell align="right">
                {t('common:common.Actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { invoices && invoices.length && invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                  {invoice.firstName}{' '+invoice.lastName}
                  </TableCell>
                  <TableCell>
                  {`${ staticRoleList && staticRoleList.length && invoice.HTUserRoleId && staticRoleList.find(item => item.id === invoice.HTUserRoleId).role}`}
                  </TableCell>
                  <TableCell>
                    {invoice.phoneNumber}
                  </TableCell>
                  <TableCell>
                    {invoice.email}
                  </TableCell>
                  {/* <TableCell>
                    {invoice.currency}
                    {invoice.value}
                  </TableCell> */}
                  <TableCell>
                    <Label 
                    //color="primary"
                    color={invoice.isActive ? 'success' : 'error'} 
                    >
                      {/* {t(`common:common.${invoice.status}`)} */}
                      {invoice.isActive ? t('common:common.Active') : t('common:common.Inactive')}
                    </Label>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={RouterLink}
                      to={`/dashboard/users/${invoice.id}/view`}
                    >
                      <ArrowRightIcon fontSize="small" />
                    </IconButton>
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
                          <Typography>No Users In Organization</Typography>
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

export default OrganizationUsers;
