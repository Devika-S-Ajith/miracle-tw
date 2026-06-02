import React, { useState } from "react"
import {
    Box,
    Card,
    Grid,
    TextField,
    Typography,
    Button,
    Divider,
    Container
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from "@material-ui/core/styles";
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router";

const useStyles = makeStyles((theme) => ({
    input: {
        position: 'relative',
        border: '2px solid grey',
        fontSize: 16,
        borderRadius: '4px',
        fontWeight: "bold",
        disableUnderline: true,
        "&::placeholder": {
            textAlign: "center",
        },
    },
}));


const FormNaming = () => {
    const { t } = useTranslation(['common']);
    const classes = useStyles();
    const navigate = useNavigate();
    const [formName,setFormName] = useState('')
    const location = useLocation()
    const form = location?.state?.form
    const [formNameFieldError,setFormNameFieldError] = useState(false)

    


    const handleBuildForm=()=>{
        if(formName === '' || formName === undefined) {
            setFormNameFieldError(true);
            return;
        }
        navigate('/dashboard/forms/buildform',{state:{formName:formName,formDetails:form,createForm:true}})
    }

    const handleNameChange =(e)=>{
        if(e.target.value === '') {
            console.log('textfieldvalue',e.target.value)
            setFormNameFieldError(true);
        }else{
            setFormNameFieldError(false);
        }
        setFormName(e.target.value)
    }

    return (
        <>
            <Box
                sx={{
                    backgroundColor: 'background.default',
                    pt: 2
                }}
            >
                <Container>
                    <Box sx={{ mt: 3 }}>
                        <Card sx={{ borderRadius: '8px' }}>
                            <Box
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    pt: 1,
                                    pb: -1
                                }}
                            >
                                <Grid
                                    container
                                    justifyContent="center"
                                    spacing={3}
                                >
                                    <Grid item >
                                        <Typography
                                            color="textPrimary"
                                            variant="h5"
                                            sx={{
                                                p: 2,
                                                alignContent: 'center', alignItems: 'center'
                                            }}
                                        >
                                            {t('common:question.Add New Assessment Form')}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                            <Divider variant="middle" color='#000000' />
                            <Box
                                sx={{
                                    mt: 2,
                                    textAlign: 'center'
                                }}
                            >
                                <Typography variant="body1" >{t('common:question.Assessment Can Be Duplicated')}</Typography>
                            </Box>
                            <Box
                                sx={{
                                    position: 'relative',
                                    //top: '35%',
                                    left: '16%',
                                    mt: 4,
                                    maxWidth:'60%'   
                                }}
                            >
                                <Typography sx={{ml:3}} variant="body1" >{t('common:question.Assessment Form Filling Instructions Below')}</Typography>
                                <ol type="1">
                                    <li>{t('common:question.Names And Order')}</li>
                                    <li>{t('common:question.Multiple Choice Responses')}</li>
                                    <li>{t('common:question.Question Per Domain Is Required')}</li>
                                    <li>{t('common:question.Interventions Per Question Is Required')}</li>
                                    <li>{t('common:question.Scoring Will Be Automatic')}</li>      
                                </ol>
                                <Typography sx={{ml:3,textAlign:'center'}}><b>{t('common:question.Note')}:</b>{t('common:question.Form Cannot Be Deleted')}</Typography>
                            </Box>
                            <Box
                                sx={{
                                   
                                    mt: 4,
                                    textAlign: 'center',
                                    
                                }}
                            >
                               
                               <Typography>{t('common:question.Continue Customizing Assessment')}</Typography> 
                                <TextField
                                   onChange={handleNameChange}
                                    InputProps={{
                                        sx: {
                                            borderRadius: '5px', mt: 3, background: '#ffffff',
                                            position: 'relative',
                                            fontSize: 16,
                                            disableUnderline: true,
                                            
                                        }
                                    }}
                                    sx={{input: {textAlign: "center",fontWeight:'bold'},maxWidth: '80%' }}
                                    label=""
                                    placeholder={t('common:question.Type The Assessment Form Name')}
                                    fullWidth
                                    value={formName}
                                    variant="outlined"
                                    size="small"
                                    required
                                    error={formNameFieldError}
                                    helperText={formNameFieldError ? t('common:question.Form Name Is Required') : ""}
                                    name="formnamefield"

                                />
                                <Box sx={{ mt: 3, mb:5 }}>
                                    <Button
                                        color="primary"
                                        style={{ borderRadius: 2 }}
                                        variant="outlined"
                                        size='small'
                                        onClick={()=>navigate('/dashboard/forms')}
                                    >
                                        {t('common:common.Cancel')}
                                    </Button>
                                    <Button
                                        color="primary"
                                        style={{ borderRadius: 2, marginLeft: 10 }}
                                        variant="contained"
                                        size='small'
                                        onClick={handleBuildForm}
                                    >
                                        {t('common:common.Continue')}
                                    </Button>
                                </Box>
                            </Box>
                        </Card>
                    </Box>
                </Container>
            </Box>
        </>
    );
}

export default FormNaming