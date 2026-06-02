import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Grid } from "@mui/material";
import useSettings from "../../../common/hooks/UseSettings";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import AddCustomQuestionForm from "../Components/AddCustomQuestionForm/AddCustomQuestionForm";

const AddCustomQuestion = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  // const mounted = useMounted();
  const { signedinUserRoleHT } = useContext(CommonDataContext);
  const { settings } = useSettings();

  useEffect(() => {
    if (signedinUserRoleHT !== null) {
      if (
        signedinUserRoleHT === "superadmin" ||
        signedinUserRoleHT === "admin" ||
        signedinUserRoleHT === "admin+caseworker"
      ) {
        // has access
      } else {
        navigate("/Unauthorized");
      }
    }
    return () => {};
  }, [signedinUserRoleHT]);

  return (
    <>
      {/* <Helmet>
        <title>Dashboard: Customer Edit | Material Kit Pro</title>
      </Helmet> */}
      {/* <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          mt: 2,
          //py: 8
        }}
      > */}
      {/* <Container maxWidth={settings.compact ? 'xl' : false}> */}
      <Box px>
        <Grid container justifyContent="space-between" spacing={3}>
          <Grid item sx={{ display: "flex", flexDirection: "row" }}></Grid>
        </Grid>
        <Box mt={3}>
          <AddCustomQuestionForm />
        </Box>
      </Box>
      {/* </Container> */}
      {/* </Box> */}
    </>
  );
};

export default AddCustomQuestion;
