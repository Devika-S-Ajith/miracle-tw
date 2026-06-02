import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
//import { format } from 'date-fns';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow
} from '@material-ui/core';
import { customerApi } from '../../../../__fakeApi__/customerApi';
import useMounted from '../../../../common/hooks/UseMounted';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
// import Label from '../../../../components/Label';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';

const Cases = (props) => {
  const mounted = useMounted();
  const [cases, setCases] = useState([]);

  const getUserCases = useCallback(async () => {
    try {
      const data = await customerApi.getUserCases();

      if (mounted.current) {
        setCases(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  useEffect(() => {
    getUserCases();
    return () => {
    }
  }, []);

  return (
    <Card
    //{...props}
    >
      <CardHeader
        //action={<MoreMenu />}
        title="Cases"
      />
      <Divider />
      <Scrollbar>
        <Box sx={{ minWidth: 1150 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Child Name
                </TableCell>
                <TableCell>
                  Organization Name
                </TableCell>
                <TableCell>
                  Assessments Done
                </TableCell>
                <TableCell>
                  Case ID
                </TableCell>
                <TableCell>
                  Date
                </TableCell>
                {/* <TableCell>
                  Status
                </TableCell> */}
                <TableCell 
                align="right" 
                //padding="checkbox"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {cases.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    
                    {invoice.child_name}
                  </TableCell>
                  <TableCell>
                    {/* {format(invoice.issueDate, 'dd/MM/yyyy | HH:mm')} */}
                    {invoice.organization_name}
                  </TableCell>
                  <TableCell>
                    {invoice.assessments_done}
                  </TableCell>
                  <TableCell>
                  {invoice.id}
                  </TableCell>
                  <TableCell>
                  {invoice.date}
                  </TableCell>
                    
                  {/* <TableCell>
                    {invoice.currency}
                    {invoice.value}
                  </TableCell> */}
                  {/* <TableCell>
                    <Label sx={{backgroundColor : "#4caf50"}}
                    //color="primary"
                    >
                      {invoice.status}
                    </Label>
                  </TableCell> */}
                  <TableCell align="right">
                    <IconButton
                      component={RouterLink}
                      to="/dashboard/invoices/1"
                    >
                      <ArrowRightIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      <TablePagination
        component="div"
        count={cases.length}
        onPageChange={() => {
        }}
        onRowsPerPageChange={() => {
        }}
        page={0}
        rowsPerPage={5}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};

export default Cases;
