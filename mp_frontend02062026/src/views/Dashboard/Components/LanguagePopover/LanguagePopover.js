import { useRef, useState, useContext, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Popover,
  Typography,
  List,
  ListItemIcon,
  ListItemText,
  ListItem,
  Divider,
  IconButton,
  Collapse,
  Grid,
} from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import APIS from "../../../../common/hooks/UseApiCalls";
import toast from "react-hot-toast";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";

const languageOptions = {
  language: [
    {
      icon: "/static/icons/icons8-usa-96.png",
      label: "English",
      value: "en",
    },
    {
      icon: "/static/icons/icons8-india-96.png",
      label: "हिंदी",
      value: "hi",
    },
    {
      icon: "/static/icons/icons8-india-96.png",
      label: "தமிழ்",
      value: "ta",
    },
    {
      icon: "/static/icons/icons8-india-96.png",
      label: "മലയാളം",
      value: "ml",
    },
    {
      icon: "/static/icons/icons8-india-96.png",
      label: "తెలుగు",
      value: "te",
    },
    {
      icon: "/static/icons/icons8-india-96.png",
      label: "मराठी",
      value: "mr",
    },
    {
      icon: "/static/icons/icons8-india-96.png",
      label: "ಕನ್ನಡ",
      value: "kn",
    },
    {
      icon: "/static/icons/icons8-india-96.png",
      label: "ગુજરાતી",
      value: "gu",
    },
    {
      icon: "/static/icons/icons8-india-96.png",
      label: "বাংলা",
      value: "bn",
    },
  ],
};

const AlllanguageOptions = {
  en: {
    icon: "/static/icons/icons8-usa-96.png",
    label: "English",
    value: "en",
  },
  hi: {
    icon: "/static/icons/icons8-india-96.png",
    label: "हिंदी",
    value: "hi",
  },
  ta: {
    icon: "/static/icons/icons8-india-96.png",
    label: "தமிழ்",
    value: "ta",
  },
  ml: {
    icon: "/static/icons/icons8-india-96.png",
    label: "മലയാളം",
    value: "ml",
  },
  te: {
    icon: "/static/icons/icons8-india-96.png",
    label: "తెలుగు",
    value: "te",
  },
  mr: {
    icon: "/static/icons/icons8-india-96.png",
    label: "मराठी",
    value: "mr",
  },
  kn: {
    icon: "/static/icons/icons8-india-96.png",
    label: "ಕನ್ನಡ",
    value: "kn",
  },
  gu: {
    icon: "/static/icons/icons8-india-96.png",
    label: "ગુજરાતી",
    value: "gu",
  },
  bn: {
    icon: "/static/icons/icons8-india-96.png",
    label: "বাংলা",
    value: "bn",
  },
};

const LanguagePopover = ({
  handleCloseProfilePopover,
  handleOpenProfilePopover,
}) => {
  const anchorRef = useRef(null);
  const { t, i18n } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [showHelperText, setShowHelperText] = useState(false);
  const {
    getChildStatus,
    getChildPlacementStatus,
    getChildCurrentPlacementStatus,
    getChildEducationLevels,
    getRelationList,
    getMemberTypeList,
    getAccountTypesList,
    getRolesList,
    getVisitTypeList,
    getReIntegrationTypeList,
    getLocationList,
    getQuestionDomainList,
    setLanguageChange,
    setCurrentUserlanguage,
    locationList,
  } = useContext(CommonDataContext);

  const handleOpen = () => {
    setOpen(true);
    handleCloseProfilePopover();
  };

  const handleClose = () => {
    setOpen(false);
    setShowHelperText(false);
  };

  const handleChangeLanguage = (language) => {
    setLanguageChange(true);
    const updatedShowHelperText = {};
    languageOptions.language.forEach((indLanguage) => {
      updatedShowHelperText[indLanguage.value] = indLanguage.value === language;
    });
    language === "en"
      ? setShowHelperText(false)
      : setShowHelperText(updatedShowHelperText);
    setCurrentUserlanguage(language);
      i18n.changeLanguage(language);
      setUserLanguage(language, false);
  };
  const setUserLanguage = useCallback(async (currentLanguage, needToReload) => {
    const currentLanguageList = JSON.parse(
      localStorage.getItem("languageList")
    );
    let langId;
    if (!currentLanguage || !currentLanguageList?.length) {
      langId = "1";
    } else {
      langId =
        currentLanguageList.length &&
        currentLanguageList.find((item) => item.languageCode == currentLanguage)
          ?.id;
    }

    const userId = localStorage.getItem("username");
    const payload = {
      id: `${userId}`,
      TWLanguageId : `${langId}`,
    };
    localStorage.setItem("language", currentLanguage);

    try {
      const data = await APIS.saveUserLanguage(payload);
      if (data.status === 200) {
        toast.success(t(`common:common.${data.data.message}`));
        localStorage.setItem("language", currentLanguage);
        getChildStatus();
        getChildPlacementStatus();
        getChildCurrentPlacementStatus();
        getChildEducationLevels();
        getRelationList();
        getAccountTypesList();
        getMemberTypeList();
        getVisitTypeList();
        getReIntegrationTypeList();
        getLocationList();
        getQuestionDomainList();
        setLanguageChange(false);
        getRolesList();
        getRelationList();
        if (needToReload) {
          window.location.reload();
        }
      } else {
        toast.success(t("common:common.Something went wrong"));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleInfoClick = (language) => {
    setShowHelperText((prev) => {
      const updatedState = { ...prev };
      Object.keys(updatedState).forEach((key) => {
        updatedState[key] = key === language ? !prev[language] : false;
      });
      return updatedState;
    });
  };

  const selectedOption = AlllanguageOptions[i18n.language];
  const getUserRegionLanguages = () => {
    const userRegionId = localStorage.getItem("userRegion");
    const userRegion = locationList?.find(
      (location) => location.id === userRegionId
    );
   
    // If user is from US or Uganda, show only English
    if (userRegion?.isoCode === "US" || userRegion?.isoCode === "UGN") {
      return languageOptions.language.filter((lang) => lang.value === "en");
    }
   
    // For other regions, show all languages
    return languageOptions.language;
  };


  const languageList = getUserRegionLanguages();


  return (
    <>
      {/* {icon ? (
        <Box onClick={handleOpen} ref={anchorRef}>
          {icon}
        </Box>
      ) : (
        <IconButton onClick={handleOpen} ref={anchorRef}>
          <Box
            sx={{
              display: "flex",
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
              sx={{ mt: 0.7, ml: 1, mr: 1 }}
            >
              {selectedOption && selectedOption.label}
            </Typography>
          </Box>
        </IconButton>
      )} */}
      <Box
        onClick={handleOpen}
        ref={anchorRef}
        style={{ display: "flex", alignItems: "center" }}
      >
        <Typography
          style={{ cursor: "pointer" }}
          color="primary"
          variant="subtitle1"
        >
          Language preference
        </Typography>
        <img
          alt={selectedOption && selectedOption.label}
          src={selectedOption && selectedOption.icon}
          height="25"
          width="25"
          style={{ marginInline: "4px" }} // Adjust margin as needed
        />
        <ArrowRightIcon style={{ cursor: "pointer" }} fontSize="large" />
      </Box>
      <Popover
        // anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: "top", // Adjusted to top
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        onClose={handleClose}
        open={open}
        PaperProps={{
          sx: { width: 240 },
        }}
      >
        <Box px={2} py={1} sx={{ display: "flex", justifyContent: "end" }}>
          <CloseIcon
            onClick={handleClose}
            sx={{ color: "#C6C4BE", cursor: "pointer" }}
          />
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}
          gap={0.5}
        >
          <ArrowLeftIcon
            onClick={() => {
              handleOpenProfilePopover();
              handleClose();
            }}
            fontSize="large"
          />
          <Typography variant="body1">
            <strong>Language preference</strong>
          </Typography>
        </Box>
        <Divider sx={{ mx: 2 }} />
        <List component="nav" aria-labelledby="nested-list-subheader">
          {languageList.map((language) => {
            return (
              <ListItem key={language?.value}>
                <Grid container>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between", // Align items to the start and end of the box
                      }}
                    >
                      {/* Image and Item Text */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ListItemIcon
                          style={{ cursor: "pointer" }}
                          onClick={() => handleChangeLanguage(language?.value)}
                        >
                          <Box sx={{ display: "flex", height: 30, width: 30 }}>
                            <img
                              alt={language.label}
                              src={language.icon}
                              height="30px"
                              width="30px"
                            />
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primaryTypographyProps={{ fontSize: "14px" }}
                          primary={language.label}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleChangeLanguage(language?.value)}
                        />
                        {language.value !== "en" && (
                          <IconButton
                            onClick={() => handleInfoClick(language.value)}
                          >
                            <InfoIcon fontSize="small" color="disabled" />
                          </IconButton>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {language.value === selectedOption?.value && (
                          <ListItemIcon>
                            <DoneIcon />
                          </ListItemIcon>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Collapse in={showHelperText[language.value]}>
                      <Typography
                        variant="body2"
                        sx={{ color: "textsecondary", m: 1 }}
                      >
                        Our translations are still in progress. You may find
                        pages that have not been translated into your chosen
                        language.
                      </Typography>
                    </Collapse>
                  </Grid>
                </Grid>
              </ListItem>
            );
          })}
        </List>
      </Popover>
    </>
  );
};

export default LanguagePopover;
