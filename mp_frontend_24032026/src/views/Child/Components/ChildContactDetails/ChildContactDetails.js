import { useState, useEffect,useContext } from 'react';
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
import { customerApi } from '../../../../__fakeApi__/customerApi'; 
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';

const ChildContactDetails = (props) => {
  const { id, 
    name, 
    country, 
    gender, 
    birthdate, 
    isVerified, 
    caseManager, 
    caregiver, 
    organization,
    email, 
    phone, 
    language,
    state, 
    city,
    district,
    zip,
    address1,
    address2,
    education,
    status,
    addDate,
    closedDate,
    educationSpecific,
    placementStatus,
    currentPlacement,
    profileImage, ...other } = props;
  const [typesData, setTypesData] = useState([]);
   const {
    locationList, 
    childEducationList } = useContext(CommonDataContext);
  const { t } = useTranslation(['common']);
  useEffect(() => {
    getTypesFromAPI();
    return () => {
    }
  },[]);

  const stringToDate = (dateString) => { 
    console.log(dateString)
    const [day, month, year] = dateString.split('/');
    return new Date([month, day, year].join('/'));
  };

  const getDate = (dateToFormat = null) => { 
    let yourDate;
    if(dateToFormat=== null){
      yourDate = new Date()
    }else {
      yourDate = new Date(stringToDate(dateToFormat))
    }
    // yourDate.toISOString().split('T')[0];
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    return yourDate.toISOString().split('T')[0]
  }

  const getAge = (datestring) => {
    let startDate = new Date(stringToDate(datestring));
    let endDate = new Date();
    let diffYear =(startDate.getTime() - endDate.getTime()) / 1000;
       diffYear /= (60 * 60 * 24);
      return Math.abs(Math.round(diffYear/365.25));

  }

  const getTypesFromAPI = async () => {
    try {
      const data = await customerApi.getOrganizationType(); 
      setTypesData([...data.organisationTypes]);
    } catch (err) {
      console.error(err);
    }
  }
   if(typesData.length && locationList ) {

    return (
      <>
      < Card {...other}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 0px'}} >
        <CardHeader title={t('common:common.General')} />
        {/* {profileImage ?
          <img 
          // for="photo-upload"
          src={profileImage} 
          // type="image"
          style={{ width: 60, height: 60, borderRadius: '30px' }} />
        :
          <UserIcon fontSize="large" style={{ width: 60, height: 60, borderRadius: '30px', border: '2px solid #172b4d' }} />
        } */}
      </div>
        <Divider />
        <Table>
          <TableBody>
          <TableRow>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Child ID')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {id}
                </Typography>
              </TableCell>
            </TableRow>
          <TableRow>
          <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Name')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {`${name}`}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
            <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Gender')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Box sx={{display : "flex",flexDirection : "row"}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {t(`common:common.${gender}`)}
                </Typography>
                {/* <Label color={isVerified ? 'success' : 'error'} sx={{ml : 2}}>
                  {isVerified ? 'Email verified' : 'Email not verified'}
                </Label> */}
                </Box>
               
              </TableCell>
            </TableRow>
            <TableRow>
            <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Date of Birth')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {getDate(birthdate)}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
            <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Age')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {getAge(birthdate)}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
            <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Education')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {(education && childEducationList) && childEducationList.length && 
                      `${childEducationList.find(item => item.id === education).educationLevel}`}
                </Typography>
              </TableCell>
            </TableRow>
            {education === '20' ?(<TableRow>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Education Details')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {educationSpecific} 
                </Typography>
              </TableCell>
            </TableRow>): <></>}
           
           </TableBody>
           </Table>
           </Card>
           < Card {...other} sx={{mt:3}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 0px'}} >
            <CardHeader title={t('common:common.Contacts')} />
            </div>
            <Divider />
            <Table>
            <TableBody>
            <TableRow>
            <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Phone Number')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {phone}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
            <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Email')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {email}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
            <TableCell style={{width: '30%'}}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Address 1')}
              </Typography>
            </TableCell>
            <TableCell style={{width: '30%'}}>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {address1}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
          <TableCell style={{width: '30%'}}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Address 2')}
              </Typography>
            </TableCell>
            <TableCell style={{width: '30%'}}>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {address2}
              </Typography>
            </TableCell>
          </TableRow>
            
          <TableRow>
          <TableCell style={{width: '30%'}}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.State/Region')}
              </Typography>
            </TableCell>
            <TableCell style={{width: '30%'}}>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                { (state && locationList) && locationList.states && locationList.states.length && 
                        `${locationList.states.find(item => item.id === state).stateName} `}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
          <TableCell style={{width: '30%'}}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.District/County')}
              </Typography>
            </TableCell>
            <TableCell style={{width: '30%'}}>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {/* {`${stateData.find(item => item.id === state).stateName}`} */}
                {/* {state} */}
                {(district && locationList) && locationList.districts && locationList.districts.length && 
                      `${locationList.districts.find(item => item.id === district).districtName}`}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
          <TableCell style={{width: '30%'}}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.City')}
              </Typography>
            </TableCell>
            <TableCell style={{width: '30%'}}>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {city}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
          <TableCell style={{width: '30%'}}>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {t('common:common.Zipcode')}
              </Typography>
            </TableCell>
            <TableCell style={{width: '30%'}}>
              <Typography
                color="textSecondary"
                variant="body2"
              >
                {zip}
              </Typography>
            </TableCell>
          </TableRow>
          </TableBody>
        </Table>
      </Card></>
    );
   }
  
  else {
    return(
      <div>
        
      </div>
    );
  }
};

ChildContactDetails.propTypes = {
  name: PropTypes.string,
  address2: PropTypes.string,
  country: PropTypes.string,
  email: PropTypes.string.isRequired,
  isVerified: PropTypes.bool.isRequired,
  phone: PropTypes.string,
  state: PropTypes.string
};

export default ChildContactDetails;
