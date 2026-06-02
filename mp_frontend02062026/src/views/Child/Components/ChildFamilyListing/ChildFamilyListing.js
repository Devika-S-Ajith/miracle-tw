import { useState, useEffect, useCallback, useContext } from "react";
import {
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  Grid,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import IndividualCards from "../IndividualCards";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import {
  getDistrictList,
  getLocationNames,
} from "../../../../helpers/helperFunction";

const ChildFamilyListing = (props) => {
  const { t } = useTranslation(["common"]);
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(false);
  const { languageList, relationList, locationList } =
    useContext(CommonDataContext);
  const { id, childId, ...other } = props;

  const getFamily = useCallback(async () => {
    setLoading(true);
    try {
      if (id) {
        const data = await APIS.FamilyDetails(id);
        console.log("getFamilyDetails called in ChildFamilyListing >>");
        setFamily(data.data.familyDetails);
        console.log(data.data.familyDetails);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    getFamily();
    return () => {};
  }, []);
  if (family?.familyName) {
    return (
      <>
        <Card {...other}>
          <CardHeader title={t("common:common.General")} />
          <Divider />
          <Table>
            <TableBody>
              <IndividualCards
                name={t("common:common.Family Name")}
                value={family.familyName}
              />
              <IndividualCards
                name={t("common:common.No of Children")}
                value={family.numberOfChildren}
              />
              <IndividualCards
                name={t("common:common.Language")}
                value={` ${
                  family.HTLanguageId &&
                  languageList &&
                  languageList.length &&
                  languageList.find((item) => item.id === family.HTLanguageId)
                    ?.language
                } `}
              />
            </TableBody>
          </Table>
        </Card>
        <Card {...other} sx={{ mt: 3 }}>
          <CardHeader title={t("common:common.Contacts")} />
          <Divider />
          <Table>
            <TableBody>
              <IndividualCards
                name={t("common:common.Address 1")}
                value={family.addressLine1}
              />
              <IndividualCards
                name={t("common:common.Address 2")}
                value={family.addressLine2}
              />
              <IndividualCards
                name={t("common:common.District/County")}
                value={
                  family.HTDistrictId
                    ? getDistrictList(
                        locationList,
                        family?.HTCountryId,
                        family?.HTStateId
                      )?.find((dis) => dis.id == family?.HTDistrictId)
                        ?.districtName
                    : "-"
                }
              />

              <IndividualCards
                name={t("common:common.City")}
                value={family.city}
              />
              <IndividualCards
                name={t("common:common.State/Region")}
                value={getLocationNames(
                  locationList,
                  family?.HTCountryId,
                  family?.HTStateId
                )}
              />
              <IndividualCards
                name={t("common:common.Zipcode")}
                value={family.zipCode}
              />
            </TableBody>
          </Table>
        </Card>
        {family?.HT_familyMembers?.map(
          (
            member = family?.HT_familyMembers?.find(
              (item) => item.HTFamilyMemberTypeId == 1
            ),
            index
          ) => (
            <Card {...other} sx={{ mt: 3 }}>
              <CardHeader
                title={t("common:common.Caregiver") + " " + (index + 1)}
              />
              <Divider />
              <Table>
                <TableBody>
                  <IndividualCards
                    name={t("common:common.Name")}
                    value={member.firstName + " " + member.lastName}
                  />
                  <IndividualCards
                    name={t("common:common.Relation")}
                    value={` ${
                      relationList &&
                      relationList.length &&
                      relationList.find(
                        (item) => item.id === member.HTFamilyRelationId
                      )?.relation
                    } `}
                  />
                  <IndividualCards
                    name={t("common:common.mobile")}
                    value={member.phoneNumber}
                  />
                </TableBody>
              </Table>
            </Card>
          )
        )}
        {family?.siblingsDetails?.map((sibling, index) =>
          sibling.childId !== childId ? (
            <Card {...other} sx={{ mt: 3 }}>
              <CardHeader title={t("common:common.Sibling")} />
              <Divider />
              <Table>
                <TableBody>
                  <IndividualCards
                    name={t("common:common.Name")}
                    value={sibling.name}
                  />
                  <IndividualCards
                    name={t("common:common.Relation")}
                    value={sibling.relationship}
                  />
                  <IndividualCards
                    name={t("common:common.mobile")}
                    value={sibling.phoneNumber}
                  />
                </TableBody>
              </Table>
            </Card>
          ) : (
            <></>
          )
        )}
      </>
    );
  } else {
    return (
      <>
        <Card {...other} sx={{ mt: 3 }}>
          <CardHeader title={t("common:common.Family")} />
          <Divider />
          <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
            <Box>
              {loading && (
                <CircularProgress
                sx={{
                  zIndex: 1000,
                  position: "fixed",
                  top: "50%",   // Adjusted to 50% to center vertically
                  left: "50%",  // Adjusted to 50% to center horizontally
                  transform: "translate(-50%, -50%)"  // Centering trick
                }}
                  color="primary"
                />
              )}
              <Grid container spacing={3}>
                <Grid
                  item
                  md={3} //6
                  xs={6} //12
                >
                  <Typography sx={{ mt: -3.5 }}>
                    {t("common:common.No Family to list")}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Card>
      </>
    );
  }
};

export default ChildFamilyListing;
