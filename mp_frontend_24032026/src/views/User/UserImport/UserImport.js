import {React} from 'react';
import { useNavigate} from 'react-router-dom';
import { Box, Container, Grid, Typography, IconButton  } from '@material-ui/core';
import ChevronLeftIcon from '../../../assets/icons/ChevronLeft';
import useSettings from '../../../common/hooks/UseSettings';
import { useTranslation } from 'react-i18next';
import AddImport from '../../Import/AddImport/AddImport';
const UserImport= () => {
    const modulename = "user";
    const navigate = useNavigate();
    const { t } = useTranslation(['common']);
    const { settings } = useSettings();
    return (
        <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          mt : 2
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
                        mt : - 0.5
                    }}
                    >
                    <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <Typography
                        color="textPrimary"
                        variant="h5"
                    >
                     {t('common:common.User')}  {t('common:common.Import')}
                    </Typography>
              </Grid>
          </Grid>
            <Box mt={3}>
            <AddImport modulename={modulename}/>
            </Box>
        </Container>
        </Box>
    )
}

export default UserImport