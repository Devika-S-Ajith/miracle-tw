import { useState, useEffect, useContext } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
//import { Helmet } from 'react-helmet-async';
import { Box, Container, Grid, Typography, IconButton} from '@material-ui/core';
// import { customerApi } from '../../../__fakeApi__/customerApi';
import EditMemberForm from '../Components/EditMemberForm';
// import Members from '../Components/Members';
// import Children from '../Components/Children';
// import useMounted from '../../../common/hooks/UseMounted';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
// import APIS from '../../../common/hooks/UseApiCalls';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
//import gtm from '../../lib/gtm';
import { useTranslation } from 'react-i18next';

const EditMember = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const { membersInFamily,signedinUserRole } = useContext(CommonDataContext);
  // const mounted = useMounted();
  const { settings } = useSettings();
  const [member, setMember] = useState(null);
  // const [family, setFamily] = useState(null);
  // const [loading, setLoading] = useState(false);
  let { id } = useParams();

  useEffect(() => {
    //gtm.push({ event: 'page_view' });
    getFamilyAndMember();
    return () => {
    }
  }, []);

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

  const getFamilyAndMember = () => {
      // setLoading(true)
      membersInFamily && membersInFamily.length > 0 && membersInFamily.map((member)=>{
            if(member.id === id){
                setMember(member)
            }
            // setLoading(false)
        })
      
    //}
  }


//   if (!customer) {
//     return null;
//   }

  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer Edit | Material Kit Pro</title>
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
                {t('common:common.Member Edit')}
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
            
          </Grid>

          {/* <Divider /> */}

          {/* <Box mt={3}>
            <EditOrganizationForm organization={customer} />
          </Box> */}

          <Box sx={{ mt: 3 }}>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  //lg={settings.compact ? 6 : 4}
                  lg={12}
                  //md={6}
                  md={12}
                  //xl={settings.compact ? 6 : 3}
                  xl={12}
                  xs={12}
                >
                  {member && <EditMemberForm 
                  member={member}/>}
                </Grid>
              </Grid>
          </Box>


        </Container>
      </Box>
    </>
  );
};

export default EditMember;
