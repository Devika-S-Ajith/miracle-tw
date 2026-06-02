import { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import {
  Box,
  // Breadcrumbs,
  Button,
  Container,
  // Divider,
  Grid,
  // Link,
  // Tab,
  // Tabs,
  Typography,
  IconButton
} from '@material-ui/core';
// import { customerApi } from '../../../__fakeApi__/customerApi';
// import Members from '../Components/Members';
// import Children from '../Components/Children';
import CareGiverBasicDetails from '../Components/MemberBasicDetails';
//import OrganizationUsers from '../Components/OrganizationUsers';
// import useMounted from '../../../common/hooks/UseMounted';
//import ChevronRightIcon from '../../../assets/icons/ChevronRight';
import PencilAltIcon from '../../../assets/icons/PencilAlt';
//import gtm from '../../lib/gtm';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
// import APIS from '../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';

// const tabs = [
//   { label: 'Details', value: 'details' },
//   { label: 'Children', value: 'children' }
// ];

const MemberDetails = () => {
  const navigate = useNavigate();
  // const mounted = useMounted();
  const { membersInFamily,signedinUserRole } = useContext(CommonDataContext);
  const { settings } = useSettings();
  // const [loading, setLoading] = useState(false);

  const [member, setMember] = useState(null);
  // const [family, setFamily] = useState(null);

  //const [currentTab, setCurrentTab] = useState('details');
  let { id } = useParams();

  // const getMember = useCallback(async () => {
  //   try {
  //     const data = await customerApi.getFamilies();
  //       console.log("data in MemberDetails >>",data)
  //     if (mounted.current) {
  //       data.forEach((family)=>{
  //         let members = family.HT_familyMembers;
  //         members.map((member)=>{
  //             if(member.id === id){
  //                 setMember(member)
  //                 setFamily(family)
  //                 console.timeLog("member found >>",member)
  //             }
  //         })
  //       })
  //       setLoading(false)
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, [mounted]);
  useEffect(() => {
    if(signedinUserRole !== null){
      if( signedinUserRole !== 'viewonly'){
        // has access
      } else {
        navigate('/Unauthorized');
      }
      return () =>{

      }
    }
  },[signedinUserRole])


  const getMember = () => {
    // setLoading(true)
    membersInFamily && membersInFamily.length > 0 && membersInFamily.map((member)=>{
          if(member.id === id){
              setMember(member)
              console.log("member found >>",member)
          }
          // setLoading(false)
      })
    
  //}
}
  
    useEffect(()=>{
      getMember();
      return () => {
      }
    },[])

  // const handleTabsChange = (event, value) => {
  //   setCurrentTab(value);
  // };

  // if (!user) {
  //   console.log("returning null")
  //   return null;
  // }

  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer Details | Material Kit Pro</title>
      </Helmet> */}

      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          mt : 2
          //py: 8
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <Grid
            container
            justifyContent="space-between"
            spacing={3}
          >
             <Grid item sx={{display : "flex",flexDirection : "row"}}>
             <IconButton
              color="inherit"
              onClick={()=>navigate(-1)}
              sx={{
                // display: {
                //   md: 'none'
                // }
                mt : - 0.5
              }}
            >
            <ChevronLeftIcon fontSize="small" />
            </IconButton>

              <Typography
                color="textPrimary"
                variant="h5"
              >
                {member && member.firstName } {member && member.lastName }
              </Typography>
              {/* <Breadcrumbs
                aria-label="breadcrumb"
                separator={<ChevronRightIcon fontSize="small" />}
                sx={{ mt: 1 }}
              >
                <Link
                  color="textPrimary"
                  component={RouterLink}
                  to="/dashboard"
                  variant="subtitle2"
                >
                  Dashboard
                </Link>
                <Link
                  color="textPrimary"
                  component={RouterLink}
                  to="/dashboard"
                  variant="subtitle2"
                >
                  Management
                </Link>
                <Typography
                  color="textSecondary"
                  variant="subtitle2"
                >
                  Customers
                </Typography>
              </Breadcrumbs> */}
            </Grid>
            <Grid item>
              <Box sx={{ m: -1 }}>
                <Button
                  color="primary"
                  component={RouterLink}
                  startIcon={<PencilAltIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  to={`/dashboard/family/member/${member && member.id}/edit`}
                  variant="contained"
                >
                  Edit
                </Button>
              </Box>
            </Grid>
          </Grid>
          {/* <Divider /> */}
          <Box sx={{ mt: 3 }}>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  //lg={settings.compact ? 6 : 4}
                  lg={10}
                  //md={6}
                  md={12}
                  //xl={settings.compact ? 6 : 3}
                  xl={12}
                  xs={12}
                >
                  {member && <CareGiverBasicDetails
                    member_id={member.id}
                    first_name={member.firstName}
                    last_name={member.lastName}
                    is_primary={member.isPrimaryCareGiver}
                    family_member_type={member.HT_familyMemberType}
                    occupation={member.occupation}
                    phone={member.phoneNumber}
                    email={member.email}
                    other_relation={member.HTFamilyRelationId}
                    is_active={member.isActive}
                  />}
                </Grid>
              </Grid>
            
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default MemberDetails;
