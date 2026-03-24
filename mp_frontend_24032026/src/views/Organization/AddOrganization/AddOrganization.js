import { useState, useCallback, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import { customerApi } from "../../../__fakeApi__/customerApi";
import useMounted from "../../../common/hooks/UseMounted";
import { useTranslation } from "react-i18next";
import AccountForm from "../Components/AccountForm";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";

const AddOrganization = () => {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const mounted = useMounted();
  const [customer, setCustomer] = useState(null);
  const { signedinOrgType, signedinUserRoleHT, signedinUserRoleFS } = useContext(CommonDataContext);

  const getCustomer = useCallback(async () => {
    try {
      const data = await customerApi.getCustomer();

      if (mounted.current) {
        setCustomer(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [mounted]);

  useEffect(() => {
    getCustomer();
    return () => {};
  }, [getCustomer]);


  useAuthorization(signedinUserRoleHT, signedinUserRoleFS,signedinOrgType, "AddAccount", true);

  //TO DO
  // useEffect(() => {
  //   if (signedinOrgType !== null && (signedinUserRoleHT !== null || signedinUserRoleFS !== null)) {
  //     if (signedinOrgType == 1 && (signedinUserRoleHT === 'superadmin' ||signedinUserRoleFS === 'superadmin')) {
  //       // has access
  //     } else {
  //       navigate("/Unauthorized");
  //     }
  //   }
  //   return () => {
  //   }
  // }, [signedinOrgType, signedinUserRoleHT,signedinUserRoleFS])

  if (!customer) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          mt: 2
        }}
      >
        <Box sx={{ width: "100%" }} px={2}>
          <Grid container justifyContent="space-between" spacing={3}>
            <Grid
              item
              sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
            >
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
                onClick={() => navigate("/admin/organizations")}
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
              <Typography
                color="textPrimary"
                variant="h5"
                id="add_account_button"
              >
                {t("common:organization.Add a new organization")}
              </Typography>
            </Grid>
          </Grid>
          <Box mt={3}>
            <AccountForm />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AddOrganization;
