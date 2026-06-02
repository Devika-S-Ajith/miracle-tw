import { useState, useEffect, useContext } from 'react';
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
  Typography
} from '@material-ui/core';
import Label from '../../../../components/Label';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import { customerApi } from '../../../../__fakeApi__/customerApi';
import { useTranslation } from 'react-i18next';

const FamilyBasicDetails = (props) => {
  const { country, city, address1, address2, zip_code, state, child_name , total_children, language, status, district,id,autoid, ...other } = props;
  const { languageList, locationList } = useContext(CommonDataContext);
  const [stateData, setStateData] = useState([]);
  // const [countryData, setCountryData] = useState([]);
  // const [districtData, setDistrictData] = useState([]);
  const [typesData, setTypesData] = useState([]);
  const { t } = useTranslation(['common']);

  useEffect(() => {
    getLocationsFromAPI();
    getTypesFromAPI();
    return () => {
    }
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
    < Card {...other}>
      <CardHeader title={t('common:family.Family Details')} />
      <Divider />
      <Table>
        <TableBody>
        <TableRow>
          </TableRow>


          <TableRow>
              <TableCell>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                {t('common:common.Family ID')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {/* {autoid} */}
                  {`FAMILY-${id}`}
                </Typography>
              </TableCell>
        </TableRow>
          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.TotalNoofChildren')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {total_children}
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell sx={{width : 450}}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Address Line 1')}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{display : "flex",flexDirection : "row"}}>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {address1}
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
               {t('common:common.Address Line 2')} 
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
                {t('common:common.Country')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {/* {`${countryData.find(item => item.id === country).countryName} `} */}
                {locationList && locationList.countries && locationList.countries.length && 
                        locationList.countries.find(item => item.id === country).countryName}
              </Typography>
            </TableCell>
          </TableRow>


          <TableRow>
            <TableCell>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
               {t('common:common.Language')} 
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {languageList && languageList.length > 0 && languageList.find(item=>item.id === language).language}
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
                {locationList && locationList.states && locationList.states.length && 
                        locationList.states.find(item => item.id === state).stateName}
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
                {locationList && locationList.districts && locationList.districts.length && 
                      locationList.districts.find(item => item.id === district).districtName}
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
                {zip_code}
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
             {t('common:family.Family Status')}
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

FamilyBasicDetails.propTypes = {
  address1: PropTypes.string,
  //address2: PropTypes.string,
  country: PropTypes.string,
  phone: PropTypes.string,
  state: PropTypes.string
};

export default FamilyBasicDetails;
