import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
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
  Typography
} from '@mui/material';
// import LockIcon from '../../../../assets/icons/Lock';
// import UserIcon from '../../../../assets/icons/User';
// import Label from '../../../../components/Label';
import { customerApi } from '../../../../__fakeApi__/customerApi';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';

const RelatedOrganization = (props) => {
  const { id } = props;
  const { locationList } = useContext(CommonDataContext)
  const [organization, setOganization] = useState();

  useEffect(() => {
    //getLocationsFromAPI();
    //getTypesFromAPI();
    getOrganization();
    return () => {
    }

  }, []);

  const getOrganization = async () => {
    try {
      const data = await customerApi.getOrganizationList();
      let organizations = data.organizations;
      organizations.forEach((org) => {
        if (org.id === id) {
          setOganization(org)
        }
      })

    } catch (err) {
      console.error(err);
    }
  }

  return (
    < Card
    //{...other}
    >
      <CardHeader title="Organization Details" />
      <Divider />
      {organization && <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                Organization Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {organization.organizationName}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ width: 450 }}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                Email
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {organization.email}
                </Typography>
                {/* <Label color={isVerified ? 'success' : 'error'} sx={{ml : 2}}>
                {isVerified ? 'Email verified' : 'Email not verified'}
              </Label> */}
              </Box>

            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                Phone
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {organization.phoneNumber}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                Country
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {`${locationList && locationList.countries && locationList.countries.length && locationList.countries.find(item => item.id === organization.HTCountryId).countryName} `}
                {/* {country} */}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                State/Region
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {`${locationList && locationList.states && locationList.states.length && locationList.states.find(item => item.id === organization.HTStateId).stateName}`}
                {/* {state} */}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                District
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {`${locationList && locationList.districts && locationList.districts.length && locationList.districts.find(item => item.id === organization.HTDistrictId).districtName}`}
                {/* {city} */}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                Zip Code
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {organization.zipCode}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                Address 1
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {organization.addressLine1}
              </Typography>
            </TableCell>
          </TableRow>
          {/* <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                Address 2
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
          </TableRow> */}
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                Website
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {/* {address2} */}
                www.placeholder.com
              </Typography>
            </TableCell>
          </TableRow>
          {/* <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                Organization Status
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                <Label color={isVerified ? 'success' : 'error'} >
                {isVerified ? 'Active' : 'InActive'}
                </Label>
              </Typography>
            </TableCell>
          </TableRow> */}
        </TableBody>
      </Table>}

    </Card>
  )
}

RelatedOrganization.propTypes = {
  address1: PropTypes.string,
  address2: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string.isRequired,
  phone: PropTypes.string,
  state: PropTypes.string,
  country: PropTypes.string,
};

export default RelatedOrganization;
