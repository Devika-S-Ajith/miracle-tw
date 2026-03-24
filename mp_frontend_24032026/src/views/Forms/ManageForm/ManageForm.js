import {
  useState, useContext, useEffect
} from 'react';
import {
  useNavigate
} from 'react-router-dom';
import { Box, Container, Grid, Typography, Tab, Tabs, Divider, IconButton, Button } from '@mui/material';
import ManageFormComponent from '../Components/ManageFormComponent';
import useSettings from '../../../common/hooks/UseSettings';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../common/contexts/CommonDataContext';


const ManageForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const { signedinUserRole } = useContext(CommonDataContext);
  const [currentTab, setCurrentTab] = useState('manage');
  const [saveAndRedirect, setSaveAndRedirect] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const { settings } = useSettings();
  const form = { domain: '1' };

  const tabs = [
    { label: 'Manage', value: 'manage' },
  ];

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  useEffect(() => {
    if (signedinUserRole !== null) {
      if (signedinUserRole === 'superadmin') {
      } else {
        navigate('/Unauthorized');
      }
    }
    return () => {
    }
  }, [signedinUserRole]);

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          mt: 2
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <Grid
            container
            justifyContent="space-between"
            spacing={3}
          >
            <Grid item sx={{ display: "flex", flexDirection: "row" }}>
              <IconButton
                color="inherit"
                onClick={() => navigate('/dashboard/forms')}
                sx={{
                  mt: - 0.5
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>

              <Typography
                color="textPrimary"
                variant="h5"
              >
                {t('common:form.manageForm')}
              </Typography>
            </Grid>
            <Grid item>
              <Box>
                <Button
                  sx={{ width: 150 }}
                  variant="contained"
                  onClick={() => setSaveAndRedirect('preview')}
                >
                  {t('common:form.preview')}
                </Button>

                <Button
                  sx={{ ml: 2, width: 150 }}
                  variant="contained"
                  onClick={() => setIsOpen(true)}
                  disabled={!(signedinUserRole == 'superadmin')}
                >
                  {t('common:form.publish')}
                </Button>
              </Box>
            </Grid>

          </Grid>
          <Box sx={{ mt: 3 }}>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={currentTab}
              variant="scrollable"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={t(`common:form.${tab.label}`)}
                  value={tab.value}
                />
              ))}
            </Tabs>
          </Box>
          <Divider />
          <Box sx={{ mt: 3 }}>
            {currentTab === 'manage' && (
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  lg={12}
                  md={12}
                  xl={12}
                  xs={12}
                >
                  <ManageFormComponent
                    form={form}
                    redirectPage={saveAndRedirect}
                  />
                </Grid>
              </Grid>
            )}

          </Box>


        </Container>
      </Box>
      <Dialog aria-labelledby="simple-dialog-title" open={isOpen}>
        <DialogTitle id="simple-dialog-title">{t('common:form.publishForm')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('common:form.confirmPublish')}<br></br>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveAndRedirect('publish')} color="primary">
            {t('common:common.Yes')}
          </Button>
          <Button onClick={() => setIsOpen(false)} color="primary" autoFocus>
            {t('common:common.No')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageForm;
