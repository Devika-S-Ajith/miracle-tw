import { useState, useCallback, useEffect, useContext, useRef } from "react";
import {
  Link as RouterLink,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import * as Yup from "yup";
import { Formik, Field } from "formik";
import toast from "react-hot-toast";
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  CircularProgress,
  Grid,
  Link,
  Typography,
  TextField,
  Tab,
  Tabs,
  Divider,
  IconButton,
  Popover,
  Switch,
  useTheme,
} from "@mui/material";
import NumberFormat from "react-number-format";
import EditFamilyForm from "../Components/EditFamilyForm";
import AddFamilyForm from "../Components/AddFamilyForm";
import Members from "../Components/Members";
import Children from "../Components/Children";
import useMounted from "../../../common/hooks/UseMounted";
import useSettings from "../../../common/hooks/UseSettings";
import ChevronRightIcon from "../../../assets/icons/ChevronRight";
import APIS from "../../../common/hooks/UseApiCalls";
import PlusIcon from "../../../assets/icons/Plus";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import AutoCompleteDropdown from "../../../components/UserComponents/AutoCompleteDropdown";
import AutoCompleteDropdownMultiNames from "../../../components/UserComponents/AutoCompleteDropdownMultiNames";
import {
  formatPhone,
  placeholderPhone,
} from "../../../components/UserComponents/ValidatePhoneAndZip";
import useAuthorization from "../../../components/UserComponents/useAuthorization";
import { PhoneTextInput } from "../../../components/PhoneTextInput/PhoneTextInput";
import { PhoneNumberUtil } from "google-libphonenumber";
import { Man } from "@mui/icons-material";
import ManageFamilyForm from "../../TWFamily/ManageFamily/ManageFamilyForm";
const phoneUtil = PhoneNumberUtil.getInstance();

const EditFamily = () => {
  const { t } = useTranslation(["common"]);
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const addMember =
    location.state &&
    location.state.addMember !== null &&
    location.state.addMember === true
      ? "members"
      : "details";
  const fetchFamilyDetails = location?.state?.fetchFamilyDetails ? true : false;
  const {
    familyList,
    getFamilyList,
    relationList,
    memberTypeList,
    childFamilyList,
    signedinUserRoleHT,
    signedinOrgType,
    userRegion,
  } = useContext(CommonDataContext);
  const [currentTab, setCurrentTab] = useState(addMember);
  const mounted = useMounted();
  const { settings } = useSettings();
  const [family, setFamily] = useState(null);
  const [careGiver, setCareGiver] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [addMemberPopUp, setAddMemberPopUp] = useState(false);
  const [addChildPopUp, setAddChildPopUp] = useState(false);
  const [checked, setChecked] = useState(false);
  const [child, setChild] = useState(null);
  const [children, setChildren] = useState();
  const [loading, setLoading] = useState(false);
  const [updateChildlist, setUpdateChildlist] = useState(false);
  let { id } = useParams();

  const tabs = [
    { label: "Details", value: "details" },
    // { label: "Members", value: "members" },
    // { label: "Children", value: "children" },
  ];

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  useAuthorization(
    signedinUserRoleHT,
    null,
    signedinOrgType,
    "ManageFamily",
    true
  );

  useEffect(() => {
    if (id) {
      //getFamily(id);
      getFamilyDetails(id);
    }
    return () => {};
  }, [id, updateChildlist]);

  const getFamilyDetails = useCallback(async (id) => {
    setLoading(true);
    try {
      // setFamily([{
      //   "id": "f1218bbc-b287-4938-83c0-8500752d68c3",
      //   "familyName": "Gokuls Family",
      //   "isActive": true,
      //   "TWUserId": "8f6b0025-f606-4174-9d92-a7951fef74cc",
      //   "contactInformation": {
      //     "TWCountryId": "1",
      //     "TWStateId": "1",
      //     "TWDistrictId": "1",
      //     "addressLine1": "abc",
      //     "addressLine2": "def",
      //     "city": "efg",
      //     "zipCode": "12345"
      //   },
      //   "additionalInformation": {
      //     "TWLanguageId": "1",
      //     "TWFamilyGoalId": "1",
      //     "TWFamilyTypeId": "1",
      //     "TWFamilySituationId": "2",
      //     "licenceNo": "3545",
      //     "dateStartedasFP": "2025-09-08"
      //   },
      //   "familyMembers": [
      //     {
      //       "id": "m1",
      //       "firstName": "Harry",
      //       "lastName": "Member",
      //       "isMinor": false,
      //       "isActive": true, 
      //       "isChild": false,
      //       "TWFamilyRelationId": "2",
      //       "isPrimaryCaregiver": true,
      //       "profileInformation": {
      //         "phoneNumber": "9876543210",
      //         "occupation": "Engineer",
      //         "note": "Primary contact for the family",
      //         "appAccessEnabled": true,
      //         "email": "harry.member@example.com"
      //       }
      //     },
      //     {
      //       "id": "m2",
      //       "firstName": "Krish",
      //       "lastName": "Child",
      //       "isMinor": true,
      //       "isActive": true,
      //       "isChild": true,
      //       "TWFamilyRelationId": "1",
      //       "dateOfBirth": "2020-01-01",
      //       "isPrimaryCaregiver": false,
      //       "gender": "Male"
      //     },
      //     {
      //       "id": "m3",
      //       "firstName": "Sara",
      //       "lastName": "Member",
      //       "isMinor": false,
      //       "isActive": false,
      //       "isChild": false,
      //       "TWFamilyRelationId": "3",
      //       "isPrimaryCaregiver": false,
      //       "profileInformation": {
      //         "phoneNumber": "9876501234",
      //         "occupation": "Teacher",
      //         "note": "Works part-time",
      //         "appAccessEnabled": true,
      //         "email": "sara.member@example.com"
      //       }
      //     },
      //     {
      //       "id": "m4",
      //       "firstName": "Liam",
      //       "lastName": "Child",
      //       "isMinor": false,
      //       "isActive": true,
      //       "isChild": true,
      //       "TWFamilyRelationId": "1",
      //       "dateOfBirth": "2018-05-15",
      //       "isPrimaryCaregiver": false,
      //       "gender": "Male"
      //     },
      //     {
      //       "id": "m5",
      //       "firstName": "Meera",
      //       "lastName": "Member",
      //       "isMinor": false,
      //       "isActive": false,
      //       "isChild": true,
      //       "TWFamilyRelationId": "1",
      //       "dateOfBirth": "2022-11-20",
      //       "isPrimaryCaregiver": false,
      //       "gender": "Female"
      //     },
      //     {
      //       "id": "m6",
      //       "firstName": "Tom",
      //       "lastName": "Member",
      //       "isMinor": false,
      //       "isActive": true,
      //       "isChild": false,
      //       "TWFamilyRelationId": "4",
      //       "isPrimaryCaregiver": false,
      //       "profileInformation": {
      //         "phoneNumber": "9123456780",
      //         "occupation": "Retired",
      //         "note": null,
      //         "appAccessEnabled": false
      //       }
      //     }
      //   ]
      // }]);
      
      const payload = {
        id: id,
        listType: "DETAILED"
      };
      const data = await APIS.GetFamilyDetails(payload);
      console.log("Family Details Data: ", data?.data?.data);
      if (data && data.data && data.data.data) {
        setFamily(data.data?.data);
        if (data.data.data.members) {
          let totalMembers = data.data.data.members;
          setFamilyMembers(totalMembers);
        }
        let care_giver = data.data.data.members.find(
          (member) => member.isPrimaryCareGiver === true
        );
        setCareGiver(care_giver);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const getFamily = (id) => {
    setLoading(true);
    familyList &&
      familyList.forEach((family) => {
        if (family.id === id) {
          setFamily(family);
        }
      });

    setLoading(false);
  };


  return (
    <>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          width: "100%",
          mt: 2,
        }}
      >
        <Grid container width={1}>
          <Grid item xs={12} sx={{ mr: 1 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item sx={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  color="textPrimary"
                  variant="h5"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/dashboard")}
                >
                  {t("common:common.Thrive Scale")}
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
                  onClick={() => navigate("/dashboard/families")}
                >
                  {t("common:family.Families")}
                </Typography>
                <IconButton color="disabled" sx={{ mt: -0.5 }}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>

                <Typography color="textPrimary" variant="h5">
                  {t("common:family.Edit Family")}
                </Typography>
              </Grid>
            
            </Grid>
            
            <Box sx={{ mt: 3 }}>
                <Grid container spacing={1}>
                  <Grid
                    item
                    lg={12}
                    md={12}
                    xl={12}
                    xs={12}
                  >
                    {family && (
                      <ManageFamilyForm family={family} careGiver={careGiver} />
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

export default EditFamily;
