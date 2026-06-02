import { useContext } from "react";
import PropTypes from "prop-types";
import {
  Box,
  // Button,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
// import LockIcon from '../../../../assets/icons/Lock';
// import UserIcon from '../../../../assets/icons/User';
// import Label from '../../../../components/Label';
// import { customerApi } from '../../../../__fakeApi__/customerApi';
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";

const MemberBasicDetails = (props) => {
  const {
    member_id,
    first_name,
    last_name,
    occupation,
    relation,
    otherRelaion,
    phone,
    email,
    is_primary,
    is_active,
    family_member_type,
    ...other
  } = props;
  // const [stateData, setStateData] = useState([]);
  const { relationList } = useContext(CommonDataContext);
  const { t } = useTranslation(["common"]);
  console.log("otherrr", !otherRelaion);
  return (
    <Card {...other}>
      <CardHeader title={t("common:common.Member Details")}/>
      <Divider />
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography color="textPrimary" variant="subtitle2">
                {t("common:common.Member Name")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography color="textSecondary" variant="body2">
                {first_name} {last_name}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography color="textPrimary" variant="subtitle2">
              {t("common:common.Phone")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography color="textSecondary" variant="body2">
                {phone}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell sx={{ width: 450 }}>
              <Typography color="textPrimary" variant="subtitle2">
                {t("common:common.Email")}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Typography color="textSecondary" variant="body2">
                  {email}
                </Typography>
                {/* <Label color={isVerified ? 'success' : 'error'} sx={{ml : 2}}>
                {isVerified ? 'Email verified' : 'Email not verified'}
              </Label> */}
              </Box>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography color="textPrimary" variant="subtitle2">
                {t("common:common.Occupation")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography color="textSecondary" variant="body2">
                {occupation}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography color="textPrimary" variant="subtitle2">
                {t("common:common.Is Primary")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography color="textSecondary" variant="body2">
                {/* {`${countryData.find(item => item.id === country).countryName} `} */}
                {is_primary === true ? "True" : "False"}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography color="textPrimary" variant="subtitle2">
                {t("common:common.Relation")}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography color="textSecondary" variant="body2">
                {/* {`${stateData.find(item => item.id === state).stateName}`} */}
                {!otherRelaion
                  ? relationList.find((item) => item.id === relation)
                      ?.relation || "-"
                  : otherRelaion}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
};

MemberBasicDetails.propTypes = {
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  phone: PropTypes.string,
  email: PropTypes.string,
  member_id: PropTypes.string,
};

export default MemberBasicDetails;
