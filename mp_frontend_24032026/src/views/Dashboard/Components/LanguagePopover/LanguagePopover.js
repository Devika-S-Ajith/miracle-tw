import { useRef, useState, useContext,useCallback,useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  IconButton,
  Popover,
  Typography,
  List,
} from '@material-ui/core';
import APIS from '../../../../common/hooks/UseApiCalls';
import toast from 'react-hot-toast';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import CollapseList from './CollapseList';


const languageOptions = {
  "languages": [
    {
      "Id": 1,
      "Name": "USA",
      "icon": '/static/icons/icons8-usa-96.png',
      "language": [
        {
          icon: '/static/English.svg',
          label: 'English',
          value : 'en'
        }
      ]
    },
    {
      "Id": 2,
      "Name": "INDIA",
      "icon": '/static/icons/icons8-india-96.png',
      "language": [
        {
          icon: '/static/English.svg',
          label: 'English',
          value : 'en'
        },
        {
          icon: '/static/Hindi.svg',
          label: 'Hindi',
          value : 'hi'
        },
        {
          icon: '/static/Tamil.svg',
          label: 'Tamil',
          value : 'ta'
        },
      ]
    },{
      "Id": 3,
      "Name": "UGANDA",
      "icon": '/static/icons/icons8-uganda-96.png',
      "language": [
        {
          "icon": '/static/English.svg',
          label: 'English',
          value : 'en'
        }
      ]
    }
  ]
}

const AlllanguageOptions = {

  en: {
    icon: '/static/icons/English.png',
    label: 'English',
    value : 'en'
  },
  hi: {
    icon: '/static/icons/Hindi.png',
    label: 'Hindi',
    value : 'hi'
  },
  ta: {
    icon: '/static/icons/Tamil.png',
    label: 'Tamil',
    value : 'ta'
  }
 
};

const LanguagePopover = () => {
  const anchorRef = useRef(null);
  const { t,i18n } = useTranslation('common');
  const [open, setOpen] = useState(false);
  //const [openSection, setOpenSection] = useState(false);
  const [selectedLanguage,setSelectedLanguage] =useState('')
  const {
    getChildStatus,
    getChildPlacementStatus,
    getChildCurrentPlacementStatus,
    getChildEducationLevels,
    getRelationList,
    getMemberTypeList,
    getVisitTypeList,
    getReIntegrationTypeList,
    getLocationList,
    getQuestionDomainList,
    languageChange,
    setLanguageChange,
    languageId,
    curentUserLanguage,
    setCurrentUserlanguage,
    changeLanguageFromAssessment,
    formPageValue
  } = useContext(CommonDataContext);

  // useEffect(() => {
  //   const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
  //   let langId;
  //   if (!languageId || !currentLanguageList?.length) {
  //     langId = "en"
  //   } else {
  //     langId = currentLanguageList.length && currentLanguageList.find(item => item.id == languageId)?.languageCode
  //   }
  //   //i18n.changeLanguage(langId);
  //   localStorage.setItem('language',langId)
  // },[languageId]);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    //setOpenSection(false)
  };

  const getCurrentURL =()=>{
    return window.location.pathname
  }

  const handleChangeLanguage = (language) => {
    setLanguageChange(true)
    setOpen(false);
    setCurrentUserlanguage(language)
    const URL = getCurrentURL()

    if((URL.startsWith('/dashboard/assessment') && (URL.endsWith('view')))!=true){
        i18n.changeLanguage(language);
        setUserLanguage(language,false);
    }else{
      setSelectedLanguage(language)
    }

  };

  useEffect(() => {
    if(changeLanguageFromAssessment){
      console.log("changed from assessment after pressing yes")
      i18n.changeLanguage(selectedLanguage);
      if(window.location.pathname == "/dashboard/assessments/add"){
        if(formPageValue == 1){
          setUserLanguage(selectedLanguage,true)
        }else{
          setUserLanguage(selectedLanguage,false)
        }

      }else{
        setUserLanguage(selectedLanguage,false)
      }

    }

  },[changeLanguageFromAssessment]);

  const setUserLanguage=useCallback(async (currentLanguage,needToReload) => {
      const currentLanguageList = JSON.parse(localStorage.getItem('languageList'));
      let langId;
      if (!currentLanguage || !currentLanguageList?.length) {
        langId = ""
      } else {
        langId = currentLanguageList.length && currentLanguageList.find(item => item.languageCode == currentLanguage)?.id
      }

      const userId = localStorage.getItem('username')
      const payload= {
        "userId": `${userId}`,
        "languageId": `${langId}`
      }

    try {
      const data = await APIS.saveUserLanguage(payload);
      console.log('data', data.data.message)
      if (data.status === 200) {
        toast.success(t(`common:common.${data.data.Message}`));
        localStorage.setItem('language',currentLanguage)
        getChildStatus()
        getChildPlacementStatus()
        getChildCurrentPlacementStatus()
        getChildEducationLevels()
        getRelationList()
        getMemberTypeList()
        getVisitTypeList()
        getReIntegrationTypeList()
        getLocationList()
        getQuestionDomainList()
        setLanguageChange(false)
        if(needToReload){
          window.location.reload();
        }
      } else {
        toast.success(t('common:common.Something went wrong'));
      }

    } catch (err) {
      console.error(err);
    }


  }, [])

  const selectedOption = AlllanguageOptions[i18n.language];
  const languageList = languageOptions.languages;

  return (
    <>
      <IconButton
        onClick={handleOpen}
        ref={anchorRef}
      >
        <Box
          sx={{
            display: 'flex',
            height: 35,
            width: 80,

            // '& img': {
            //   width: '100%'
            // }
          }}
        >
          <img
            alt={selectedOption && selectedOption.label}
            src={selectedOption && selectedOption.icon}
            height="35"
            width="35"
          />
           <Typography
                  color="white"
                  variant="subtitle2"
                  sx={{mt:0.7,ml:1,mr:1}}
            >
              {selectedOption && selectedOption.label}
            </Typography>
        </Box>
      </IconButton>
      <Popover
        anchorEl={anchorRef.current}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom'
        }}
        keepMounted
        onClose={handleClose}
        open={open}
        PaperProps={{
          sx: { width: 240 }
        }}
      >
         <List component='nav' aria-labelledby='nested-list-subheader'>
          {languageList.map(individualLanguage => {
            return (
              <CollapseList selectedOption={selectedOption}  key={individualLanguage.Id} onChangeLanguage={handleChangeLanguage}  individualLanguageSection={individualLanguage} />
            );
          })}
        </List>
      </Popover>
    </>
  );
};

export default LanguagePopover;
