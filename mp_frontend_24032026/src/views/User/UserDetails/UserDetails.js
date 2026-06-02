import { useCallback, useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import UserBasicDetails from "../Components/UserBasicDetails";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import useSettings from "../../../common/hooks/UseSettings";
import APIS from "../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import PageLoader from "../../../components/UserComponents/PageLoader";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const UserDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const [user, setUser] = useState(null);
  let { id } = useParams();
  const { locationList } = useContext(CommonDataContext);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { authStatus, checkAuth } = useAuthorization("ListUser");
    
    useEffect(() => {
        document.title = "Team | Thrivewell";;
        checkAuth();
      }, []);
    
  useEffect(() => {
    if (locationList.length) {
      setSelectedCountry(
        locationList.find((obj) => obj.id == localStorage.getItem("userRegion"))
      );
    }
  }, [locationList]);

 
  const getUsers = useCallback(async () => {
    try {
      const data = await APIS.UserDetails(id);
      setUser(data.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'authorized') {
      getUsers();
    }
  }, [authStatus]);

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
          mt: 2,
          //py: 8
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item sx={{ display: "flex", flexDirection: "row" }}>
                <Typography color="textPrimary" variant="h5">
                  {t("common:common.Admin")}
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
                  onClick={() => navigate(-1)}
                >
                  {t("common:common.Team")}
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
                  {user && user.firstName + " " + user.lastName}
                </Typography>
              </Grid>
            </Grid>
            {/* <Box display="flex" gap={2} mt>
              <Autocomplete
                id="country"
                options={locationList || []}
                required
                clearIcon={false}
                getOptionLabel={(option) => option?.countryName}
                value={selectedCountry}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, newValue) => {
                  setSelectedCountry(newValue);
                }}
                // disabled={!values?.date}
                // onBlur={() => setFieldTouched("recurringType", true)}
                sx={{ width: 200, backgroundColor: "#fff" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    // label={t("common:message.Recurring Type")}
                  />
                )}
              />
            </Box> */}
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid
                  item
                  //lg={settings.compact ? 6 : 4}
                  lg={12}
                  //md={6}
                  md={12}
                  //xl={settings.compact ? 6 : 3}
                  xl={12}
                  xs={12}
                >
                  {user && (
                    <UserBasicDetails
                      selectedCountry={selectedCountry}
                      address1={user.addressLine1}
                      id={user.id}
                      firstName={user.firstName}
                      lastName={user.lastName}
                      country={user.HTCountryId}
                      district={user.HTDistrictId}
                      state={user.HTStateId}
                      email={user.email}
                      phone={user.phoneNumber}
                      organization={user.TWAccountId}
                      city={user.city}
                      HTRole={user.HTUserRoleId}
                      FSRole={user.FSUserRoleId}
                      status={user.status}
                      zip={user.zipCode}
                      address2={user.addressLine2}
                      cognitoId={user.cognitoId}
                      getUsers={getUsers}
                    />
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

export default UserDetails;
