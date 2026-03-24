import React, { useContext, useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LabelValue from "../../../../components/LabelValue";
import ChipComponent from "../../../../components/ChipComponent/ChipComponent";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import { useParams } from "react-router";
import APIS from "../../../../common/hooks/UseApiCalls";
import { utcToLocalDate } from "../../../../helpers/helperFunction";
import ResourceDetailForm from "../../Components/ResourceDetailForm";
import { ModalService } from "../../../../components/Modal";
import toast from "react-hot-toast";
import CircularProgress from "@mui/material/CircularProgress";
import CheckIcon from "@mui/icons-material/Check";
import { styled } from "@mui/material/styles";
import Loader from "../../../../components/UserComponents/Loader";

const IconContainer = styled(Box)({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
});

const IconOverlay = styled(Box)({
  position: "absolute",
  transition: "opacity 0.3s ease-in-out",
});

const ResourceDetails = () => {
  const { signedinUserRoleFS, organizationList } =
    useContext(CommonDataContext);
  const { id } = useParams();
  const [resourceDetail, setResourceDetail] = useState([]);
  const [loading, setLoading] = useState(false);
  const actionList = [
    { id: true, value: "Published" },
    { id: false, value: "Draft" },
  ];
  const [action, setAction] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showTick, setShowTick] = useState(false);

  useAuthorization(null, signedinUserRoleFS, null, "Resource", false);

  useEffect(() => {
    if (id) getDetailOfResource(id);
  }, [id]);

  useEffect(() => {
    let tickTimeout;
    if (showTick) {
      tickTimeout = setTimeout(() => {
        setShowTick(false);
      }, 700); // Hide tick icon after 1 second
    }
    return () => {
      if (tickTimeout) {
        clearTimeout(tickTimeout);
      }
    };
  }, [showTick]);

  const getDetailOfResource = async (id) => {
    setLoading(true);
    try {
      const res = await APIS.GetResourceDetail(id);
      setResourceDetail(res?.data?.data);
      setAction(
        actionList.find((action) => action?.id === res?.data?.data?.published)
      );
      setLoading(false);
    } catch (err) {
      console.log("Error on fetching support service detail");
      setLoading(false);
    }
  };

  const handleSubmitHandler = async (data) => {
    setAction(data);
    setUpdateLoading(true);
    try {
      const payload = {
        title: resourceDetail?.title,
        url: resourceDetail?.articleLink,
        published: data?.id,
        summary: resourceDetail?.summary,
        image: resourceDetail?.imageLink,
        accountId: resourceDetail?.organization_name,
        userId: localStorage.getItem("username"),
        categoryIds: resourceDetail?.categories?.map((item) => item.id),
      };
      payload.id = resourceDetail?.id;
      await APIS.UpdateResource(payload);
      setShowTick(true);
    } catch (err) {
      setUpdateLoading(false);
      toast.error("Something went wrong");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Loader loading={loading}></Loader>
      <Grid xs={12} sm={12} md={5} item>
        <Card sx={{ borderRadius: 2 / 8, width: 1 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                color="textPrimary"
                // variant="subtitle2"
                fontWeight={700}
                fontSize="1.25rem"
              >
                {"Article details"}
              </Typography>
              <EditIcon
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  ModalService.open(
                    ({ close }) => (
                      <ResourceDetailForm
                        ResourceDetail={resourceDetail}
                        close={close}
                        onSuccess={() => getDetailOfResource(id)}
                      />
                    ),
                    {
                      modalTitle: "Resource information",
                      hideModalFooter: true,
                    }
                  );
                }}
              />
            </Box>

            {/* Family Details */}
            <Grid container spacing={1.5} my>
              <Grid item xs={12}>
                <LabelValue
                  label="Published by"
                  value={resourceDetail?.createdBy}
                />
              </Grid>
              <Grid item xs={6}>
                <LabelValue
                  label="Published on"
                  value={utcToLocalDate(resourceDetail?.createdAt)}
                />
              </Grid>
              <Grid item xs={6}>
                <LabelValue
                  label="Updated on"
                  value={utcToLocalDate(resourceDetail?.updatedAt)}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ color: "black" }} />
              </Grid>
              <Grid item xs={12}>
                <LabelValue
                  label="Categories"
                  value={
                    <Box
                      my
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      {resourceDetail?.categories?.map((cat) => {
                        return (
                          <>
                            <ChipComponent label={cat?.name} />
                          </>
                        );
                      })}
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={8}>
                <LabelValue
                  label="Agency"
                  value={
                    resourceDetail?.TWAccountId
                      ? organizationList.find(
                          (org) => org.id === resourceDetail?.TWAccountId
                        )?.accountName
                      : "All"
                  }
                />
              </Grid>
              <Grid item xs={4} my={0}>
                <Autocomplete
                  id="action"
                  name="action"
                  disableClearable
                  value={action}
                  options={actionList}
                  getOptionLabel={(option) => option.value}
                  isOptionEqualToValue={(option, value) => {
                    return Object.is(
                      JSON.stringify(option),
                      JSON.stringify(value)
                    );
                  }}
                  sx={{ width: 1 }}
                  onChange={(_, newValue) => handleSubmitHandler(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={"Status"}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            <IconContainer>
                              <IconOverlay
                                style={{ opacity: updateLoading ? 1 : 0 }}
                              >
                                <CircularProgress color="primary" size={20} />
                              </IconOverlay>
                              <IconOverlay
                                style={{ opacity: showTick ? 1 : 0 }}
                              >
                                <CheckIcon color="success" />
                              </IconOverlay>
                            </IconContainer>
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <LabelValue label="URL" value={resourceDetail?.url} />
              </Grid>
              <Grid item xs={12}>
                <Button
                  sx={{ borderRadius: "4px" }}
                  variant="contained"
                  onClick={() => {
                    window.open(resourceDetail?.url, "_blank");
                  }}
                >
                  Preview
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} sm={12} md={7} item>
        <Card sx={{ borderRadius: 2 / 8, width: 1 }}>
          <CardContent>
            <Typography
              color="textPrimary"
              // variant="subtitle2"
              fontWeight={700}
              fontSize="1.25rem"
            >
              {resourceDetail?.title}
            </Typography>

            {/* Family Details */}
            <Grid container spacing={1.5} my>
              <Grid item xs={12}>
                <LabelValue label="Summary" value={resourceDetail?.summary} />
              </Grid>
              <Grid item xs={12}>
                <img
                  alt=""
                  src={resourceDetail?.image}
                  width={"100%"}
                  height={"auto"}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ResourceDetails;
