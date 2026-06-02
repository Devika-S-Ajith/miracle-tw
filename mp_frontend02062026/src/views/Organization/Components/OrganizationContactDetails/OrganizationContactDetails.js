import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Switch
} from '@mui/material';
import UserIcon from '../../../../assets/icons/User';
import Label from '../../../../components/Label';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import APIS from '../../../../common/hooks/UseApiCalls';

const OrganizationContactDetails = (props) => {
  const { t } = useTranslation(['common']);
  const { address1, address2, country, email, isVerified, phone, state, organizationType, city, district, website, profileImage, zipCode, id, isDCPU, consentRequired, orgId, ...other } = props;
  const { userRegion, signedinUserRoleHT, locationList, typeList } = useContext(CommonDataContext);
  const [consentChecked, setConsentChecked] = useState(consentRequired);
  const signedinOrgId = localStorage.getItem('orgId');

  const handleConsentStatusChange = async (value) => {
    try {
      const Payload = {
        "organization_id": orgId,
        "status": `${value}`,
      }
      await APIS.ChangeConsentStatus(Payload)
        .then((res) => {
          if (res.data.Message !== "Consent status updated Successfully") {
            toast.error(t('common:warnings.failed to change consent status'));
            // setConsentChecked(consentChecked);
          }
          else if (res.data.Message === "Consent status updated Successfully") {
            toast.success(t('common:warnings.Consent Status Updated Successfully'));
          }
          else {
            toast.error(t('common:common.Something went wrong'));
          }
        })

    } catch (err) {
      toast.error(t('common:common.Something went wrong'));
    }
  }



  return (
    < Card {...other}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 0px' }} >
        <CardHeader title={t('common:organization.Organization Details')} />
        {profileImage ?
          <img
            src={profileImage}
            style={{ width: 60, height: 60, borderRadius: '30px' }} />
          :
          <UserIcon fontSize="large" style={{ width: 60, height: 60, borderRadius: '30px', border: '2px solid #172b4d' }} />
        }
      </div>
      <Divider />
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.OrganizationId')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {id}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Type')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {typeList && `${t(`common:common.${typeList.find(item => item.id === organizationType)?.name}`)}`}
              </Typography>
            </TableCell>
          </TableRow>
          {organizationType == 2 ? (<TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Is a DCPU')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {isDCPU ? 'Yes' : 'No'}
              </Typography>
            </TableCell>
          </TableRow>) : <></>}
          <TableRow>
            <TableCell sx={{ width: 450 }}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Email')}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {email}
                </Typography>
              </Box>

            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Phone')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {phone}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Country')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {`${locationList && locationList.countries && locationList.countries.find(item => item.id === country).countryName} `}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.State/Region')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {`${locationList && locationList.states && locationList.states.find(item => item.id === state).stateName}`}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.District/County')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {`${locationList && locationList.districts && locationList.districts.find(item => item.id === district).districtName}`}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.City')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {city}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Zipcode')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {zipCode}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Address 1')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {address1}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Address 2')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {address2}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Website')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {website}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:organization.Organization Status')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                <Label color={isVerified ? 'success' : 'error'} >
                  {isVerified ? t('common:common.Active') : t('common:common.Inactive')}
                </Label>
              </Typography>
            </TableCell>
          </TableRow>
          {<TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                gutterBottom
                variant="subtitle2"
              >
                {t('common:organization.Consent enabled')}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: "flex", flex: 1 }}>
                <Switch disabled={!(signedinUserRoleHT === 'admin' && signedinOrgId == orgId && userRegion != 'india')} size="small" color="orange" checked={consentChecked} onChange={() => { setConsentChecked(!consentChecked); handleConsentStatusChange(!consentChecked) }} />
                <Typography
                  color={consentChecked ? "#43AA8B" : "#F94144"}
                  variant="subtitle2"
                  sx={{ marginRight: 2 }}
                >
                  {consentChecked ? `${t('common:common.Enabled')}` : `${t('common:common.Disabled')}`}
                </Typography>
              </Box>
            </TableCell>
          </TableRow>}
        </TableBody>
      </Table>

    </Card>
  );
};

OrganizationContactDetails.propTypes = {
  address1: PropTypes.string,
  address2: PropTypes.string,
  country: PropTypes.string,
  email: PropTypes.string.isRequired,
  isVerified: PropTypes.bool.isRequired,
  phone: PropTypes.string,
  state: PropTypes.string
};

export default OrganizationContactDetails;
