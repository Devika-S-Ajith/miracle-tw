import { useState,useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Tab,
  Tabs,
  Divider,
  IconButton,
} from "@mui/material";
import ChildFamilyListing from "../Components/ChildFamilyListing";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import AddChildForm from "../Components/AddChildForm";

const EditChild = () => {
  const { t } = useTranslation(["common"]);
  const { signedinOrgType, signedinUserRoleHT } = useContext(CommonDataContext);
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("edit");
  let { id } = useParams();
  const tabs = [{ label: "Details", value: "edit" }];
  useAuthorization(
    signedinUserRoleHT,
    null,
    signedinOrgType,
    "EditChild",
    true
  );
  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };
 
  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          mt: 2,
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12} sx={{ mr: 1 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item sx={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  color="textPrimary"
                  variant="h5"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/dashboard")}
                >
                  {t("common:common.Thrive Scale")}
                </Typography>
                <Box
                  sx={{
                    m: 0.75,
                  }}
                  style={{ cursor: "text" }}
                >
                  <ChevronRightIcon color="disabled" fontSize="small" />
                </Box>
                <Grid item>
                  <Typography
                    color="textPrimary"
                    variant="h5"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate('/dashboard/children')}
                  >
                    {t("common:common.Children")}
                  </Typography>
                </Grid>
                <IconButton
                  color="disabled"
                  onClick={() => navigate(-1)}
                  sx={{ mt: -0.5 }}
                >
                  {/* Todo - Change the color so that both right icons looks exactly the same */}
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
                <Typography color="textPrimary" variant="h5">
                  {t("common:child.Child Edit")}
                </Typography>
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
                    label={t(`common:common.${tab.label}`)}
                    value={tab.value}
                  />
                ))}
              </Tabs>
            </Box>
            <Divider />
            <Box sx={{ mt: 3 }}>
              {currentTab === "edit" && (
                <Grid container spacing={3}>
                  <Grid item lg={12} md={12} xl={12} xs={12}>
                    {id && <AddChildForm childId={id} />}
                  </Grid>
                </Grid>
              )}
              {currentTab === "Family" && <ChildFamilyListing />}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
export default EditChild;
