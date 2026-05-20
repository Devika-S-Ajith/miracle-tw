import { useState, useCallback, useEffect, useContext } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import useSettings from "../../../common/hooks/UseSettings";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import APIS from "../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import ManageFamilyForm from "../../TWFamily/ManageFamily/ManageFamilyForm";
import PageLoader from "../../../components/UserComponents/PageLoader";

const EditFamily = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [careGiver, setCareGiver] = useState(null);
  const [loading, setLoading] = useState(false);
  let { id } = useParams();
  const { authStatus, checkAuth } = useAuthorization("ManageFamily");


  const getFamilyDetails = useCallback(async (id) => {
    setLoading(true);
    try {
      const payload = {
        id: id,
        listType: "DETAILED"
      };
      const data = await APIS.GetFamilyDetails(payload);
      if (data && data.data && data.data.data) {
        setFamily(data.data?.data);
        let care_giver = data.data.data.members.find(
          (member) => member.isPrimaryCareGiver === true
        );
        setCareGiver(care_giver);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id && authStatus === 'authorized') {
      getFamilyDetails(id);
    }
    return () => { };
  }, [id, authStatus]);

  useEffect(() => {
    document.title = "Edit Family | ThriveWell";
    checkAuth();
  }, []);


  if (authStatus === 'loading' || authStatus === 'idle') {
    return <PageLoader />;
  }
  if (authStatus === 'unauthorized') {
    return null; // Or a custom message
  }

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          width: "100%",
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
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/dashboard/families")}
                >
                  {t("common:family.Families")}
                </Typography>
                <IconButton color="disabled" sx={{ mt: -0.5 }}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>

                <Typography color="textPrimary" variant="h5">
                  {t("common:family.Edit Family")}
                </Typography>
              </Grid>

            </Grid>

            <Box sx={{ mt: 3 }}>
              <Grid container spacing={1}>
                <Grid
                  item
                  lg={12}
                  md={12}
                  xl={12}
                  xs={12}
                >
                  {family && (
                    <ManageFamilyForm family={family} careGiver={careGiver} loading={loading} />
                  )}
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default EditFamily;
