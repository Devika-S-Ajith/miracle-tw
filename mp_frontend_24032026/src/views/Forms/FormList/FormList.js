import { useEffect, useContext } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FormListTable from "../Components/FormListTable";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";

const FormList = () => {
  const navigate = useNavigate();
  const {
    setCurrentQuestionData,
    signedinUserRoleHT,
    signedinOrgType,
    setCurrentlySelectedDomain,
  } = useContext(CommonDataContext);

  useEffect(() => {
    document.title = "Forms | ThriveWell";
    setCurrentQuestionData([]);
    setCurrentlySelectedDomain(1);
  }, []);

  useAuthorization(signedinUserRoleHT, null, signedinOrgType, "FormList", true);

  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          pt: 2,
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12}>
            <Box sx={{ mt: 3 }}>
              <FormListTable />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default FormList;
