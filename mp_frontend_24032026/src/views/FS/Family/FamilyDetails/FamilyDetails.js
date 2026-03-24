import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ParentsDetails from "./ParentsDetails";
import LabelValue from "../../../../components/LabelValue";
import { useNavigate, useParams } from "react-router";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";

const statusLabels = {
  Pending: "Pending",
  Active: "Active",
  InActive: "Inactive",
};
const FamilyDetails = ({ familyData, setFamilyName }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const { signedinUserRoleFS } = useContext(CommonDataContext);

  useEffect(() => {
    document.title = "Families | ThriveWell";
  }, []);

  useAuthorization(null, signedinUserRoleFS, null, "FSFamily", false);

  const renderStatusColorObject = {
    Pending: {
      value: "Pending",
    },
    Active: {
      value: "Active",
    },
    InActive: {
      value: "Inactive",
    },
  };

  return (
    <Card sx={{ borderRadius: 0.25, width: 1 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography color="textPrimary" fontWeight={700} fontSize="1.25rem">
            Family details
          </Typography>
          <EditIcon
            sx={{ cursor: "pointer" }}
            titleAccess="Edit"
            onClick={() =>
              navigate(`/fostershare/families/family-details/${id}`)
            }
          />
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 120,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <ParentsDetails data={familyData} />
            {/* {familyData?.secondaryParents && (
              <ParentsDetails
                data={familyData?.secondaryParents}
                tag="Secondary careiver"
              />
            )} */}

            {/* Family Details */}
            <Grid container rowSpacing={1.5} columnSpacing={1} my>
              <Grid item xs={6}>
                <LabelValue
                  label={"Location"}
                  value={
                    familyData
                      ? `${familyData?.address}, ${familyData?.city}`
                      : "-"
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <LabelValue
                  label={"Number of Children"}
                  value={familyData?.children?.length || "0"}
                />
              </Grid>
              <Grid item xs={6}>
                <LabelValue
                  label={"Case manager"}
                  value={
                    familyData?.casemanagerId
                      ? `${familyData?.casemanagerFirstName} ${familyData?.casemanagerLastName}`
                      : "-"
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <LabelValue
                  wrap={true}
                  label={"Family status"}
                  value={
                    familyData?.familyStatus == "InActive"
                      ? renderStatusColorObject?.[familyData?.familyStatus]
                          ?.value +
                        " : " +
                        familyData?.disableReason
                      : renderStatusColorObject?.[familyData?.familyStatus]
                          ?.value
                  }
                />

                {/* <LabelValue
                      wrap
                      label="Family status"
                      value={
                        familyData?.familyStatus === "InActive"
                          ? `${statusLabels[familyData.familyStatus]} : ${
                              familyData.disableReason
                            }`
                          : statusLabels[familyData?.familyStatus]
                      }
                    /> */}
              </Grid>
            </Grid>
            {/* Childern list */}
            {/* <ChildrenList children={familyData?.children} /> */}

            <Grid item xs={6} mt={2}>
              <LabelValue
                wrap={true}
                label="When did this family first start serving as a foster family for your organization or any other organization?"
                value={familyData?.DateStartedasFP}
              />
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyDetails;
