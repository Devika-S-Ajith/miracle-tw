import { useState, useCallback, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Divider,
  Button,
  Card,
  MenuItem
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import EditProfileForm from './EditProfileForm';
import useSettings from '../../common/hooks/UseSettings';
import APIS from '../../common/hooks/UseApiCalls';
import { useTranslation } from 'react-i18next';

const ProfileSettings = () => {
  const { t } = useTranslation(['common']);
  const { settings } = useSettings();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const signedinUserId = localStorage.getItem('username');

  const getUsers = useCallback(async () => {
    setLoading(true);
    try {

      const data = await APIS.UserDetails(signedinUserId);

      setUser(data.data.userDetails);
      setLoading(false);

    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, []);

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
            <Grid item lg={6}
              md={6}
              xl={6}
              xs={6}>

              <Typography
                color="textPrimary"
                variant="h5"
              >
                {t('common:user.Profile')}
              </Typography>


              <Divider />
            </Grid>
            <Grid item lg={6}
              md={6}
              xl={6}
              xs={6}>
              <Typography
                color="textPrimary"
                variant="h5"
              >
                {t('common:common.Settings')}
              </Typography>

              <Divider />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              lg={6}
              md={6}
              xl={6}
              xs={6}
            >
              <Box sx={{ mt: 3 }}>
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
                    {loading && <CircularProgress
                      sx={{
                        zIndex: 1000,
                        position: "absolute",
                        top: "55%",
                        left: "45%"
                      }}
                      color="primary" />}
                    {user && (
                      <EditProfileForm user={user} loading={loading} hidden={false} />
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid
              item
              lg={6}
              md={6}
              xl={6}
              xs={6}
            >
              <Box sx={{ mt: 3 }}>
                <Card>
                  <Box>
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
                        <MenuItem
                          component={RouterLink}
                          to="/dashboard/changePassword"
                        >
                          <Box style={{ float: 'left' }}>
                            <Button
                              color="primary"
                              //onClick={handleEdit}
                              variant="text"
                            >{t('common:signin.Change Password')}

                            </Button>
                          </Box>
                          <Box sx={{ ml: 35 }} style={{ float: 'right' }}>
                            <Button
                              color="primary"
                              //onClick={handleEdit}
                              variant="text"
                              startIcon={<ArrowForwardIosIcon fontSize="small" />}
                            ></Button>
                          </Box></MenuItem>
                      </Grid>
                    </Grid>
                  </Box></Card>
              </Box>
            </Grid>
          </Grid>
          {/* <Dialog
            fullWidth
            maxWidth="sm"
            onClose={handleModalClose}
            open={isModalOpen}
          >

            {user && (
              <EditProfileForm user={user} loading={loading} onCancel={handleModalClose} />
            )}
          </Dialog> */}

        </Container>
      </Box>
    </>
  );
};

export default ProfileSettings;
