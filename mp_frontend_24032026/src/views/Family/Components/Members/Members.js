import { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
//import { format } from 'date-fns';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  IconButton,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Tooltip,
  Pagination,
  TableRow
} from '@material-ui/core';
// import useMounted from '../../../../common/hooks/UseMounted';
import ArrowRightIcon from '../../../../assets/icons/ArrowRight';
import PencilAltIcon from '../../../../assets/icons/PencilAlt';
//import Label from '../../../../components/Label';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
//import MoreMenu from '../../MoreMenu';
import Scrollbar from '../../../Dashboard/Components/ScrollBar';
import { useTranslation } from 'react-i18next';
// import APIS from '../../../../common/hooks/UseApiCalls';

const Members = (props) => {

  const { t } = useTranslation(['common']);
  // const mounted = useMounted();
  const { familyMembers, familyId, pageCount } = props;
  const { setMembersInFamily } = useContext(CommonDataContext);
  const [ members, setMembers] = useState([]);
  // const [ loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);



  useEffect(() => {
    getMembers()
    return () => {
    }
  }, [familyMembers]);


  const getMembers = () =>{
    // setLoading(true);
    let membersList = [];
    familyMembers && familyMembers.forEach((member)=>{
        // if(member.isPrimaryCareGiver === false){
          membersList.push({...member,familyId : familyId})
        // }
      })
      setMembers(membersList);
      setMembersInFamily(membersList)
      // setLoading(false);
  }

  const handlePageChange = (event, newPage) => {
    // getMembers(newPage)
    setPage(newPage);
  };


  return (
    <Card {...props}>
      <CardHeader
        //action={<MoreMenu />}
        title={t('common:common.Members')}
      />
      <Divider />
      <Scrollbar className={members.length ? "scrollListTable" : ""}>
        <Box sx={{ minWidth: 'auto' }}>
          { members && members.length > 0 && <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                {t('common:common.Name')}
                </TableCell>
                <TableCell>
                {t('common:common.Phone')}
                </TableCell>
                <TableCell>
                {t('common:common.Occupation')}
                </TableCell>
                <TableCell>
                {t('common:common.Email')}
                </TableCell>
                <TableCell>
                {t('common:common.Member Type')}
                </TableCell>
                <TableCell align="right">
                {t('common:common.Actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members && members.length > 0 && members.map((member) => (
              <TableRow key={member.id}>
                  <TableCell>
                    {member.firstName} {member.lastName}
                  </TableCell>

                  <TableCell>
                    {member.phoneNumber}
                  </TableCell>

                  <TableCell>
                    {member.occupation}
                  </TableCell>

                  <TableCell>
                    {member.email}
                  </TableCell>

                  <TableCell>
                    {/* <Label sx={{backgroundColor : "#4caf50"}}
                    //color="primary"
                    >
                      {care_giver.relation_with_child}
                    </Label> */}

                    {member.HT_familyMemberType.memberType}
                  </TableCell>
                  <TableCell 
                    align="right"
                    >
                    <Tooltip title={t('common:common.Edit Caregiver')}>
                      <IconButton
                        //disabled={true}
                        component={RouterLink}
                        to={`/dashboard/family/member/${member.id}/edit`}
                      >
                        <PencilAltIcon fontSize="small" />
                      </IconButton>
                      </Tooltip>

                      <Tooltip title={t('common:common.View Caregiver')}>
                      <IconButton
                        //disabled={true}
                        component={RouterLink}
                        to={`/dashboard/family/member/${member.id}/view`}
                      >
                        <ArrowRightIcon fontSize="small" />
                      </IconButton>
                      </Tooltip>
                    </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>}
          { members && members.length === 0 &&
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
                          <Typography>{t('common:common.No Members to list')}</Typography>
                      </Grid>
                </Grid>
            </Box>
           </Box>
          }
        </Box>
      </Scrollbar>
      <Box sx={{display:'flex'}} flexDirection="row-reverse"  p={1} m={1}>
        <Box sx={{alignContent: 'flex-end'}}>
          <Pagination onChange={handlePageChange} page={page} count={pageCount} shape="rounded" />
        </Box>
      </Box>
    </Card>
  );
};

export default Members;
