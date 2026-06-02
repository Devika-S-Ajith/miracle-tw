import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardHeader,
} from '@mui/material';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import APIS from '../../../../common/hooks/UseApiCalls';
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';

const OrganizationLink = (props) => {
  const { orgList, linkedOrgList, ...other } = props;
  const { t } = useTranslation(['common']);
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false);
  const [selected1, setSelected] = useState([])
  let { id } = useParams();

  const onChange1 = (selected1) => {
    setSelected(selected1)
  }


  const parseOrgList = () => {
    let finalOrglist = orgList.length ? orgList.map(item => ({ ...item, value: item.id, label: item.organizationName })) : [];
    if (linkedOrgList.length) {
      let parsedLinkedOrgList;
      parsedLinkedOrgList = linkedOrgList.map(item => ({ value: item.LinkedOrganizationId, label: item.organizationName }));
      let finalLinkedOrgList = linkedOrgList.map(item => (`${item.LinkedOrganizationId}`))
      setOptions([...finalOrglist, ...parsedLinkedOrgList])
      setSelected(finalLinkedOrgList)
    } else {
      setOptions(finalOrglist)
    }

  }

  const saveOrganizationLinkage = async () => {
    try {
      setLoading(true);
      const statusPayload = {
        'organizationId': id,
        'linkedOrganizationId': selected1
      }
      await APIS.LinkOrganization(statusPayload)
        .then((res) => {
          setLoading(false);
          if (res.status === 200) {
            toast.success(t('common:warnings.Organization Links have been saved Successfully'));
          }
          else {
            toast.error(t('common:common.Something went wrong'));
          }
        })
    } catch (err) {
      setLoading(false);
      toast.error(t('common:common.Something went wrong'));

    }
  }

  useEffect(() => {
    parseOrgList()
    return () => {
    }
  }, []);

  return (
    <Card {...other}>
      <CardHeader
        title={t('common:common.Link Organizations')}
      />
      <Box sx={{ m: 2 }}>
        <DualListBox
          options={options}
          selected={selected1}
          onChange={onChange1}
          style={{ height: '300px' }}
          showHeaderLabels={true}
          lang={{
            availableHeader: t('common:common.Available Organizations'),
            selectedHeader: t('common:common.Linked Organizations')
          }}
          icons={{
            moveLeft: <ChevronLeftIcon />,
            moveAllLeft: [
              <ChevronLeftIcon key={0} />,
              <ChevronLeftIcon key={1} />,
            ],
            moveRight: <ChevronRightIcon />,
            moveAllRight: [
              <ChevronRightIcon key={0} />,
              <ChevronRightIcon key={1} />,
            ],
          }}
        />
      </Box>
      <Box sx={{ float: 'right', m: 2 }} >
        <Button color="primary" variant="contained" onClick={saveOrganizationLinkage} component="span">
          {t('common:common.Save Changes')}
        </Button>
      </Box>
    </Card>
  );
};

export default OrganizationLink;
