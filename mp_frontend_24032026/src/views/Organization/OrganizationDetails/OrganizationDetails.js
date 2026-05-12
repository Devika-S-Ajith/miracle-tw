import { useCallback, useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Paper,
} from "@mui/material";
import OrganizationUsers from "../Components/OrganizationUsers";
import useMounted from "../../../common/hooks/UseMounted";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import APIS from "../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import AccountDetailsCard from "./AccountDetailsCard";
import FosterShareDetailsCard from "./FosterShareDetailsCard";
import ThriveScaleDetailsCard from "./ThriveScaleDetailsCard";
import { UNASSIGNED } from "../../../helpers/constant";
import OrganizationalOverview from "../../Dashboard/GovtDashboardOverview/OrganizationalOverview";

const OrganizationDetails = () => {
  const { t } = useTranslation(["common"]);
  const { signedinUserRoleHT, signedinUserRoleFS, signedinOrgType } =
    useContext(CommonDataContext);
  const navigate = useNavigate();
  const mounted = useMounted();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { locationList } = useContext(CommonDataContext);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    if (locationList.length) {
      setSelectedCountry(
        locationList.find(
          (obj) => obj.id == localStorage.getItem("userRegion"),
        ),
      );
    }
  }, [locationList]);

  let { id } = useParams();

  const getOrganisation = useCallback(async () => {
    setLoading(true);
    document.title = "Organizations | Details | ThriveWell";
    try {
      const data = await APIS.OrganisationDetails(id);
      if (mounted.current) {
        setAccount(data.data.data);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getOrganisation();
    return () => { };
  }, []);

  const handleRefresh = () => {
    setRefresh(true);
  };

  useEffect(() => {
    if (refresh) {
      getOrganisation();
    }
  }, [refresh]);


  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          mt: 2,
          mr: 2,
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12} sm={12}>
            <Grid container justifyContent="space-between" spacing={3} >
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
                  onClick={() => navigate("/dashboard/organizations")}
                >
                  {t("common:common.Organizations")}
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
                  {account?.accountName}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} style={{ marginTop: "0px" }}>
              <Grid item xs={12}>
                <Grid item xs={12}>
                  {/* ✅ alignItems="stretch" makes both items grow to the tallest sibling */}
                  <Grid container spacing={2} alignItems="stretch">
                    <Grid item xs={6} >
                      <AccountDetailsCard
                        account={account}
                        loading={loading}
                        setRefresh={handleRefresh}
                        getOrganisation={getOrganisation}
                        sx={{  height: "100%" }} // ← pass if AccountDetailsCard uses Box/Card with sx
                      />
                    </Grid>
                    <Grid item xs={6} >
                      <OrganizationalOverview
                        isGeneralDashboard={false}
                        isSuperAdmin={false}
                        sx={{ height: "100%" }} // ← same
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ borderRadius: "8px" }}>
                  <CardHeader
                    title={t("common:common.Users")}
                    sx={{ pb: 0, pl: 3.8 }}
                  />
                  <CardContent sx={{ pt: 0 }}>
                    <Box>
                      <Grid container>
                        <OrganizationUsers
                          accountId={id}
                          selectedCountry={selectedCountry}
                        />
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default OrganizationDetails;
