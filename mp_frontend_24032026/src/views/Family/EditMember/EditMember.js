import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Container, Grid, Typography, IconButton } from "@mui/material";
import EditMemberForm from "../Components/EditMemberForm";
import useSettings from "../../../common/hooks/UseSettings";
import ChevronLeftIcon from "../../../assets/icons/ChevronLeft";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import APIS from "../../../common/hooks/UseApiCalls";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import Loader from "../../../components/UserComponents/Loader";

const EditMember = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const { membersInFamily, signedinOrgType, signedinUserRoleHT } =
    useContext(CommonDataContext);
  const { settings } = useSettings();
  const [member, setMember] = useState(null);
  let { id } = useParams();
  const [isLoading, setIsLoading] = useState();

  const { state: locationState } = useLocation();

  useEffect(() => {
    if (locationState?.data?.familyId)
      getFamilyDetails(locationState?.data?.familyId);
    return () => {};
  }, [locationState?.data?.familyId]);

  const getFamilyDetails = async (familyId) => {
    setIsLoading(true);
    try {
      const data = await APIS.FamilyDetails(familyId);
      if (data && data.data && data.data.familyDetails) {
        if (data.data.familyDetails.HT_familyMembers) {
          let totalMembers = data.data.familyDetails.HT_familyMembers;

          totalMembers.map((member) => {
            if (member.id === id) {
              setMember(member);
            }
          });
        }
        // setCareGiver(care_giver);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  useAuthorization(
    signedinUserRoleHT,
    null,
    signedinOrgType,
    "ManageFamily",
    true
  );

  // useEffect(() => {
  //   getFamilyAndMember();
  //   return () => {};
  // }, []);

  const getFamilyAndMember = () => {
    membersInFamily &&
      membersInFamily.length > 0 &&
      membersInFamily.map((member) => {
        if (member.id === id) {
          setMember(member);
        }
      });
  };

  return (
    <>
      <Loader loading={isLoading} />

      <Grid container spacing={2} width={1}>
        <Grid xs={12} item>
          <Grid
            item
            sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
            my={3}
          >
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
            <Typography
              color="textPrimary"
              variant="h5"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/dashboard/families")}
            >
              {t("common:family.Families")}
            </Typography>
            <Box
              sx={{
                m: 0.75,
              }}
              style={{ cursor: "text" }}
            >
              <ChevronRightIcon color="disabled" fontSize="small" />
            </Box>
            <Typography
              color="textPrimary"
              variant="h5"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/dashboard/families/${locationState?.data?.familyId}/view`
                )
              }
            >
              {locationState?.data?.familyName}
            </Typography>
            <Box
              sx={{
                m: 0.75,
              }}
              style={{ cursor: "text" }}
            >
              <ChevronRightIcon color="disabled" fontSize="small" />
            </Box>

            <Typography color="textPrimary" variant="h5">
            {t("common:common.Edit Member")}
            </Typography>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item lg={12} md={12} xl={12} xs={12}>
                {member && (
                  <EditMemberForm
                    member={{
                      ...member,
                      familyId: locationState?.data?.familyId,
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default EditMember;
