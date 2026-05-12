import { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, Typography, IconButton } from '@mui/material';
import AddFamilyForm from '../Components/AddFamilyForm';
import ChevronRightIcon from '../../../assets/icons/ChevronRight';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';
import useAuthorization from '../../../components/UserComponents/useAuthorization';
import ManageFamilyForm from '../../TWFamily/ManageFamily/ManageFamilyForm';
import PageBreadcrumbs from '../../../components/PageBreadcrumbs/PageBreadcrumbs';


const AddFamily = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const { signedinUserRoleHT, signedinUserRoleFS, signedinOrgType } = useContext(CommonDataContext);
  const { id } = useParams();

  // useAuthorization(signedinUserRoleHT, signedinUserRoleFS, signedinOrgType, 'ManageFamily', true)

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          mt: 2
        }}
      >
        <Grid container width={1} >
          <Grid item xs={12} sx={{ mr: 1 }}>
            <Grid
              container
              justifyContent="space-between"
              spacing={3}
            >
              <Grid item sx={{ display: "flex", flexDirection: "row" }}>
                <PageBreadcrumbs data={[
                   {
                    label: t('common:family.Families'),
                    onClick: () => navigate("/dashboard/families")
                  },
                  {
                    label: t('common:family.Add Family')
                  }  
                ]}/>
              </Grid>
            </Grid>
            <Box mt={3}>
              <ManageFamilyForm childId={id ? id : ''} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AddFamily;
