import { useState, useEffect, useContext } from "react";
import {
  Link as RouterLink,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
//import { Helmet } from 'react-helmet-async';
import {
  Box,
  // Breadcrumbs,
  Button,
  Container,
  // Divider,
  Grid,
  // Link,
  // Tab,
  // Tabs,
  Typography,
  IconButton,
} from "@mui/material";
// import { customerApi } from '../../../__fakeApi__/customerApi';
// import Members from '../Components/Members';
// import Children from '../Components/Children';
import CareGiverBasicDetails from "../Components/MemberBasicDetails";
// import useMounted from '../../../common/hooks/UseMounted';
//import ChevronRightIcon from '../../../assets/icons/ChevronRight';
import PencilAltIcon from "../../../assets/icons/PencilAlt";
//import gtm from '../../lib/gtm';
import useSettings from "../../../common/hooks/UseSettings";
import ChevronLeftIcon from "../../../assets/icons/ChevronLeft";
// import APIS from '../../../common/hooks/UseApiCalls';
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import { useTranslation } from "react-i18next";
import APIS from "../../../common/hooks/UseApiCalls";
import Loader from "../../../components/UserComponents/Loader";

// const tabs = [
//   { label: 'Details', value: 'details' },
//   { label: 'Children', value: 'children' }
// ];

const MemberDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);

  // const mounted = useMounted();
  const { state: locationState } = useLocation();
  const { membersInFamily, signedinUserRole } = useContext(CommonDataContext);
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState();

  // const [loading, setLoading] = useState(false);

  const [member, setMember] = useState(null);
  // const [family, setFamily] = useState(null);

  //const [currentTab, setCurrentTab] = useState('details');
  let { id } = useParams();

  // const getMember = useCallback(async () => {
  //   try {
  //     const data = await customerApi.getFamilies();
  //       console.log("data in MemberDetails >>",data)
  //     if (mounted.current) {
  //       data.forEach((family)=>{
  //         let members = family.HT_familyMembers;
  //         members.map((member)=>{
  //             if(member.id === id){
  //                 setMember(member)
  //                 setFamily(family)
  //                 console.timeLog("member found >>",member)
  //             }
  //         })
  //       })
  //       setLoading(false)
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, [mounted]);
  useEffect(() => {
    if (signedinUserRole !== null) {
      if (signedinUserRole !== "viewonly") {
        // has access
      } else {
        navigate("/Unauthorized");
      }
      return () => {};
    }
  }, [signedinUserRole]);

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

  // const handleTabsChange = (event, value) => {
  //   setCurrentTab(value);
  // };

  // if (!user) {
  //   console.log("returning null")
  //   return null;
  // }

  return (
    <>
      <Loader loading={isLoading} />

      {/* <Helmet>
        <title>Dashboard: Customer Details | Material Kit Pro</title>
      </Helmet> */}
      <Grid container spacing={2} width={1}>
        <Grid xs={12} item>
          <Grid container justifyContent="space-between" wrap="wrap" my={3}>
            <Grid
              item
              sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
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
              <Typography color="textPrimary" variant="h5" >
                {member && member.firstName} {member && member.lastName}
              </Typography>
            </Grid>

            <Grid item>
              <Box sx={{ m: -1 }}>
                <Button
                  color="primary"
                  // component={RouterLink}
                  startIcon={<PencilAltIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  // to={`/dashboard/families/member/${member && member.id}/edit`}
                  onClick={() =>
                    navigate(`/dashboard/families/member/${member.id}/edit`, {
                      state: {
                        data: {
                          familyName: locationState?.data?.familyName,
                          familyId: locationState?.data?.familyId,
                        },
                      },
                    })
                  }
                  variant="contained"
                >
                  {t("common:common.Edit")}
                </Button>
              </Box>
            </Grid>
          </Grid>
          {/* <Divider /> */}
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid
                item
                //lg={settings.compact ? 6 : 4}
                lg={10}
                //md={6}
                md={12}
                //xl={settings.compact ? 6 : 3}
                xl={12}
                xs={12}
              >
                {
                  <CareGiverBasicDetails
                    member_id={member?.id}
                    first_name={member?.firstName || "-"}
                    last_name={member?.lastName}
                    is_primary={member?.isPrimaryCareGiver}
                    family_member_type={member?.HT_familyMemberType}
                    occupation={member?.occupation || "-"}
                    phone={member?.phoneNumber || "-"}
                    email={member?.email || "-"}
                    relation={member?.HTFamilyRelationId}
                    otherRelaion={
                      member?.HTFamilyRelationId == "7"
                        ? member?.otherRelation
                        : null
                    }
                    is_active={member?.isActive}
                  />
                }
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default MemberDetails;
