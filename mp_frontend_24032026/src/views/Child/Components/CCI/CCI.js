import { useState, useEffect,useContext } from 'react';
import {
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@material-ui/core';
import { customerApi } from '../../../../__fakeApi__/customerApi'; 
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import { useTranslation } from 'react-i18next';

const CCI = (props) => {
  const { 
    childId,
    userFirstName,
    userLastName,
    HTChildPlacementStatusId,
    HTChildCurrentPlacementStatusId,
    dateOfEntry,
    HTChildStatusId,
    dateOfExit,
    HTOrganizationId,
    ...other } = props.cciInfo;
  const [typesData, setTypesData] = useState([]);
  const { organizationList,
    childStatusList,
    childPlacementList,
    locationList,
    childCurrentPlacementList } = useContext(CommonDataContext);
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
      yourDate = ''
      return yourDate
    }else {
      yourDate = new Date(stringToDate(dateToFormat))
      const offset = yourDate.getTimezoneOffset()
      yourDate = new Date(yourDate.getTime() - (offset*60*1000))
      return yourDate.toISOString().split('T')[0]
    }
    // yourDate.toISOString().split('T')[0];
   
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
        <CardHeader title={t('common:common.CCI Details')} />
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
                  {childId}
                </Typography>
              </TableCell>
            </TableRow>
          
           
            <TableRow>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Added Date')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {getDate(dateOfEntry)}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Closed Date')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {getDate(dateOfExit)}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:child.Child Status')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {(HTChildStatusId && childStatusList) && childStatusList.length && 
                      `${childStatusList.find(item => item.id === HTChildStatusId).status}`}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Placement Status')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {(HTChildPlacementStatusId && childPlacementList) && childPlacementList.length && 
                      `${childPlacementList.find(item => item.id === HTChildPlacementStatusId).placementStatus}`}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Current Placement')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {(HTChildCurrentPlacementStatusId && childCurrentPlacementList) && childCurrentPlacementList.length && 
                      `${childCurrentPlacementList.find(item => item.id === HTChildCurrentPlacementStatusId).currentPlacementStatus}`}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Case Manager')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {((userFirstName?userFirstName+" ":'Unassigned')+(userLastName?userLastName:''))}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textPrimary"
                  variant="subtitle2"
                >
                  {t('common:common.Organization')}
                </Typography>
              </TableCell>
              <TableCell style={{width: '30%'}}>
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  {` ${organizationList &&  organizationList.length && organizationList.find(item => item.id === HTOrganizationId).organizationName} `}
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



export default CCI;
