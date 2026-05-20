import { useEffect, useContext } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FormListTable from "../Components/FormListTable";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import PageLoader from "../../../components/UserComponents/PageLoader";

const FormList = () => {
  const navigate = useNavigate();
  const {
    setCurrentQuestionData,
    setCurrentlySelectedDomain,
  } = useContext(CommonDataContext);
  const { authStatus, checkAuth } = useAuthorization("FormList");

  useEffect(() => {
    if (authStatus === 'authorized') {
      setCurrentQuestionData([]);
      setCurrentlySelectedDomain(1);
    }
  }, [authStatus]);

   useEffect(() => {
       document.title = "Forms | ThriveWell";
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
