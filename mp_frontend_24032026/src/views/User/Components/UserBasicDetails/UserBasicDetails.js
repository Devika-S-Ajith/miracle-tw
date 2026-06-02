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
} from '@material-ui/core';
// import LockIcon from '../../../../assets/icons/Lock';
// import UserIcon from '../../../../assets/icons/User';
import Label from '../../../../components/Label';
import { customerApi } from '../../../../__fakeApi__/customerApi';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';

const UserBasicDetails = (props) => {
  console.log(props)
  const { t } = useTranslation(['common']);
  const { country, district, city, address1,address2,zip, email, status, phone, state, organization, name,id, role ,...other } = props;
  const [stateData, setStateData] = useState([]);
  // const [countryData, setCountryData] = useState([]);
  // const [districtData, setDistrictData] = useState([]);
  const [typesData, setTypesData] = useState([]);
  const { locationList,staticRoleList,organizationList } = useContext(CommonDataContext)

  useEffect(() => {
    getLocationsFromAPI();
    getTypesFromAPI();
  },[]);

  const getLocationsFromAPI = async () => {
    try {
      const data = await customerApi.getLocations();
      setStateData([...data.states]);
      // setCountryData([...data.countries]);
      // setDistrictData([...data.districts]);
    } catch (err) {
      console.error(err);
    }
  }
  const getTypesFromAPI = async () => {
    try {
      const data = await customerApi.getOrganizationType(); 
      setTypesData([...data.organisationTypes]);
    } catch (err) {
      console.error(err);
    }
  }
  
  return (
    typesData.length && stateData.length ?
    <Card {...other}>
      <CardHeader title={t('common:user.User Details')} />
      <Divider />
      <Table>
        <TableBody>
        <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.UserId')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {/* {`${typesData.find(item => item.id === organizationType).name}`} */}
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
               {t('common:common.Name')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {/* {`${typesData.find(item => item.id === organizationType).name}`} */}
                {name}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Organization')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2" 
              >
                {` ${organizationList &&  organizationList.length && organizationList.find(item => item.id === organization).organizationName} `}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Role')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {` ${staticRoleList &&  staticRoleList.length && staticRoleList.find(item => item.id === role).role} `}
              </Typography>
            </TableCell>
          </TableRow>
          
          
          
          
          
          
          <TableRow>
            <TableCell sx={{width : 450}}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Email')}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{display : "flex",flexDirection : "row"}}>
              <Typography
                color="textSecondary"
                variant="body2"
              >
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
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Phone Number')}
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
                {` ${locationList && locationList.countries && locationList.countries.length && 
                        locationList.countries.find(item => item.id === country).countryName} `}
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
                { `${locationList && locationList.states && locationList.states.length && 
                        locationList.states.find(item => item.id === state).stateName} `}
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
                {/* {`${stateData.find(item => item.id === state).stateName}`} */}
                {/* {state} */}
                {locationList && locationList.districts && locationList.districts.length && 
                      `${locationList.districts.find(item => item.id === district).districtName}`}
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
                {zip}
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
          {/* <TableRow>
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
                {/* www.placeholder.com
              </Typography>
            </TableCell>
          </TableRow> */} 
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
               {t('common:user.User Status')}  
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                <Label color={status ? 'success' : 'error'} >
                {status ? `${t('common:common.Active')}`:`${t('common:common.Inactive')}`}
                </Label>
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

    </Card> : <></>
  );
};

UserBasicDetails.propTypes = {
  address1: PropTypes.string,
  //address2: PropTypes.string,
  country: PropTypes.string,
  email: PropTypes.string.isRequired,
  phone: PropTypes.string,
  state: PropTypes.string
};

export default UserBasicDetails;
