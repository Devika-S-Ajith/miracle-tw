import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import  { useContext, useEffect, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useLocation, useNavigate, useParams } from "react-router";
import CareGiverForm from "./CareGiverForm";
import CheckIcon from "@mui/icons-material/Check";
import HouseholdAndAgencyDetailForm from "./HouseholdAndAgencyDetailForm";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";

const FamilyDetailForm = () => {
  useEffect(() => {
    document.title = "Families | ThriveWell";
  }, []);

  const navigate = useNavigate();
  const { id } = useParams();
  const [deletedCaregiverIds, setDeletedCaregiverIds] = useState([]);
  const [isFamilyActive, setIsFamilyActive] = useState(false);
  const [familyData, setFamilyData] = useState();

  useEffect(() => {
    if (id) getFamilyDetailsHandler();
    return () => {};
  }, [id]);

  const getFamilyDetailsHandler = async () => {
    try {
      const res = await APIS.getFsFamily(id);
      if (res?.status === 200) {
        setFamilyData(res.data?.data);
      }
    } catch (error) {}
  };

  const { locationList } = useContext(CommonDataContext);
  useEffect(() => {
    if (familyData && locationList.length) {
      patchData();
    }
  }, [familyData, locationList]);

  const patchData = () => {
    let householdAndAgencyData = {
      firstName: familyData.firstName,
      lastName: familyData.lastName,
      casemanagerId: {
        id: familyData.casemanagerId,
        firstName: familyData.casemanagerFirstName,
        lastName: familyData.casemanagerLastName,
        HTCountryId: familyData.HTCountryId,
      },
      zipCode: familyData.zipCode,
      city: familyData.city,
      stateId: familyData.HTStateId,
      primaryLanguage: familyData.primaryLanguage,
      licenceNumber: familyData.licenceNumber,
      address: familyData.address,
      id: familyData.familyId,
      DateStartedasFP: familyData?.DateStartedasFP,
    };
    setHouseholdAndAgencyInfo(householdAndAgencyData);
    let careGiverData = [
      {
        id: familyData.parentId,
        firstName: familyData.firstName,
        lastName: familyData.lastName,
        email: familyData.email,
        phoneNumber: familyData.phoneNumber,
        occupation: familyData.occupation,
      },
    ];
    if (familyData?.secondaryParents) {
      let secondaryParent = familyData?.secondaryParents;
      if (Array.isArray(secondaryParent)) {
        secondaryParent
          .forEach((parent) => {
            careGiverData.push({
              firstName: parent.firstName,
              lastName: parent.lastName,
              email: parent.email,
              phoneNumber: parent.phoneNumber,
              occupation: parent.occupation,
              id: parent.id,
            });
          });
      } 
    }
    setCaregiverInfo({ parents: careGiverData });
    setIsFamilyActive(familyData?.isActive);
  };

  const [isCareGiverInfo, setIsCareGiverInfo] = useState(false);
  const [caregiverInfo, setCaregiverInfo] = useState();
  const [householdAndAgencyInfo, setHouseholdAndAgencyInfo] = useState();

  const { state: locationState } = useLocation();
  useEffect(() => {
    if (locationState?.data) {
      setCaregiverInfo({ parents: locationState.data.parents });
      setHouseholdAndAgencyInfo(locationState.data.householdAgencyData);
      setIsCareGiverInfo(true);
    }
  }, [locationState]);

  const isXsScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));

  return (
    <Box m={2}>
      <Box
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
        mb={2}
      >
        <Typography
          color="textPrimary"
          fontSize="1.5rem"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/fostershare/dashboard")}
          fontWeight={700}
        >
          FosterShare
        </Typography>
        <ChevronRightIcon color="disabled" fontSize="small" />
        <Typography
          color="textPrimary"
          // variant="subtitle2"
          fontWeight={700}
          fontSize="1.5rem"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/fostershare/families")}
        >
          Families
        </Typography>
        <ChevronRightIcon color="disabled" fontSize="small" />
        <Typography
          color="textPrimary"
            // variant="subtitle2"
            fontWeight={700}
            fontSize="1.5rem"
            sx={{ pointerEvents: "none" }}
          >
            {!id ? "Add a new family" : "Update family"}
          </Typography>
          {householdAndAgencyInfo &&
            <>
            <ChevronRightIcon color="disabled" fontSize="small" />
            <Tooltip title={`${householdAndAgencyInfo?.firstName} ${householdAndAgencyInfo?.lastName}`}>
              <Typography
                color="textPrimary"
                // variant="subtitle2"
                fontWeight={700}
                fontSize="1.5rem"
                sx={{ cursor: "default", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                title={
                  householdAndAgencyInfo?.firstName
                    ? `${householdAndAgencyInfo?.firstName} ${householdAndAgencyInfo?.lastName}`
                    : ""
                }
              >
                {householdAndAgencyInfo?.firstName
                  ? `${householdAndAgencyInfo?.firstName} ${householdAndAgencyInfo?.lastName}`
                  : ""
                }
              </Typography>
            </Tooltip>
            </>
          }
          </Box>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container>
            <Grid item md={9}>
            <Card>
              <CardContent sx={{ p: 3 }}>
              <Box
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"center"}
                alignItems={"center"}
                gap={2}
              >
                <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                >
                <Typography
                  color="textPrimary"
                      // variant="subtitle2"
                      fontWeight={500}
                      fontSize="1rem"
                      sx={{
                        pointerEvents: "none",
                        backgroundColor: !isCareGiverInfo
                          ? "#f37123"
                          : "#9CADB8",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {!isCareGiverInfo ? 1 : <CheckIcon />}
                    </Typography>
                    <Typography
                      color="textPrimary"
                      // variant="subtitle2"
                      fontWeight={700}
                      fontSize="1rem"
                      sx={{
                        mt: 1,
                        pointerEvents: "none",
                        "@media (max-width:600px)": {
                          // Hide on screens smaller than 600px (xs)
                          display: "none",
                        },
                      }}
                      textAlign={"center"}
                    >
                      Household and agency details
                    </Typography>
                  </Box>

                  <Divider sx={{ width: 100, margin: "10px 0" }} />

                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                    alignItems={"center"}
                  >
                    <Typography
                      color="textPrimary"
                      // variant="subtitle2"
                      fontWeight={500}
                      fontSize="1rem"
                      sx={{
                        pointerEvents: "none",
                        backgroundColor: isCareGiverInfo
                          ? "#f37123"
                          : "#9CADB8",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      2{" "}
                    </Typography>
                    <Typography
                      color="textPrimary"
                      // variant="subtitle2"
                      fontWeight={700}
                      fontSize="1rem"
                      sx={{
                        mt: 1,
                        pointerEvents: "none",
                        "@media (max-width:600px)": {
                          // Hide on screens smaller than 600px (xs)
                          display: "none",
                        },
                      }}
                      textAlign={"center"}
                    >
                      Caregiver information
                    </Typography>
                  </Box>
                </Box>
                {isCareGiverInfo ? (
                  <Typography
                    color="textPrimary"
                    // variant="subtitle2"
                    fontWeight={700}
                    fontSize="1.25rem"
                    sx={{ pointerEvents: "none" }}
                    my={2}
                  >
                    Caregiver information
                  </Typography>
                ) : (
                  <Typography
                    color="textPrimary"
                    // variant="subtitle2"
                    fontWeight={700}
                    fontSize="1.25rem"
                    sx={{ pointerEvents: "none" }}
                    my={2}
                  >
                    Household and agency details
                  </Typography>
                )}
                <Grid container spacing={2}>
                  {isCareGiverInfo && (
                    <CareGiverForm
                      setIsCareGiverInfo={setIsCareGiverInfo}
                      setCaregiverInfo={setCaregiverInfo}
                      caregiverInfo={caregiverInfo}
                      householdAndAgencyInfo={householdAndAgencyInfo}
                      deletedCaregiverIds={deletedCaregiverIds}
                      setDeletedCaregiverIds={setDeletedCaregiverIds}
                    />
                  )}
                  {!isCareGiverInfo && (
                    <HouseholdAndAgencyDetailForm
                      setIsCareGiverInfo={setIsCareGiverInfo}
                      setHouseholdAndAgencyInfo={setHouseholdAndAgencyInfo}
                      householdAndAgencyInfo={householdAndAgencyInfo}
                      familyActive={familyData?.isActive}
                      isFamilyActive={isFamilyActive}
                      setIsFamilyActive={setIsFamilyActive}
                    />
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Box>
  );
};

export default FamilyDetailForm;
