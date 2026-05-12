import React, { useContext, useMemo, useState } from 'react';
import { Typography, Box, IconButton, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReusableTrendTable from '../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable';
import ChipComponent from '../../../../components/ChipComponent';
import { useTranslation } from 'react-i18next';
import { CommonDataContext } from '../../../../common/contexts/CommonDataContext';
import { ModalService } from '../../../../components/Modal';
import ManageChildForm from '../../../Child/Components/ChildListTable/ChildDetailForms/ManageChildForm';
import AddFamilyMemberModal from '../../../TWFamily/ManageFamily/Components/AddFamilyMemberModal';
import FamilyMemberCard from '../../../TWFamily/ManageFamily/Components/FamilyMemberCard';
import { nav } from 'aws-amplify';
import { useNavigate } from 'react-router';





const FamilyMembersTable = ({ members }) => {
  const { t } = useTranslation(['common']);
  const {familyDropdownLists} = useContext(CommonDataContext);
  const [hideChildModal, setHideChildModal] = useState(false);
   const navigate = useNavigate();
  const getRoleBackgroundColor = (roleType) => {
    if (roleType === 'child') return '#F29D64';
    return '#6BC4CE';
  };


  const getRoleTextColor = (roleType) => {
    if (roleType === 'child') return '#000000';
    return '#FFFFFF';
  };

  const handleViewMember = (member) => {
     const modalConfig = {
      width: '30%',
      hideModalFooter: true,
      //modalTitle: member.firstName + ' ' + member.lastName,
      enableClose: true,
    };
    member?.isChild? navigate(`/dashboard/children/${member.id}/view`) :  ModalService.open(
      ({ close }) => (
       <FamilyMemberCard data={member} />
      ),
      modalConfig,
    );
   
    
   

  }


  const handleEditMember = (member) => {
    const modalConfig = {
      width: '30%',
      hideModalFooter: true,
      maxHeight: "90%",
      
    };

    const updatedConfig = !member.isChild
      ? {
        ...modalConfig,
        modalTitle: t('common:family.Family member or caregiver', 'Family member or caregiver'),
        modalExtraTitle: member.isActive
          ? ` ${t('common:common.Active')}`
          : ` ${t('common:common.Deactivated')} ${member?.deactivatedDate ?? ''}`,
        enableClose: true,
      }
      : modalConfig;


    ["3", "9"].includes(member.TWFamilyRelationId)
      ? ModalService.open(
        ({ close }) => (
          <ManageChildForm
            hideChildModal={hideChildModal}
            childInfo={member}
            id={member?.id || null}
            setHideChildModal={setHideChildModal}
          />
        ),
        updatedConfig,
      )
      : ModalService.open(
        ({ close }) => (
          <AddFamilyMemberModal
            onClose={close}
            member={member}
            isMemberActive={member?.isActive}
            dropdownValues={{
              familyRelations: familyDropdownLists?.familyRelations.filter(
                (relation) => relation.groupValue !== "Child",
              ),
            }}
          />
        ),
        updatedConfig,
      );
  };

  const columnDefinition = useMemo(
    () => [
      {
        label: 'Name',
        id: 'name',
        enableSorting: true,
        width: 250,
        minWidth: 250,
        render: (row) => (
          <Box>
            <Typography
              variant="body1"
              fontWeight="medium"
              color="textPrimary">
                {row.firstName} {row.lastName}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary">
                {row.subText}
            </Typography>
          </Box>
        ),
      },
      {
        label: 'Role',
        id: 'role',
        enableSorting: false,
        width: 100,
        minWidth: 100,
        render: (row) => (
          <ChipComponent
            label={familyDropdownLists?.familyRelations?.find(item => item.id === row.TWFamilyRelationId)?.value || row.TWFamilyRelationId}
            sx={{
              backgroundColor: getRoleBackgroundColor(row.roleType),
              color: getRoleTextColor(row.roleType),
              fontWeight: 500,
              width: '100%',
              height: 'auto',
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
             
              padding: '4px 0',


              '& .MuiChip-label': {
                  whiteSpace: 'normal',
                  textAlign: 'center',
                  width: '100%',
                  display: 'block',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  lineHeight: 1.2
              },
              '&:hover': {
                backgroundColor: getRoleBackgroundColor(row.roleType),
              }
            }}
          />
        ),
      },
      {
        label: 'Contact information',
        id: 'contact',
        enableSorting: false,
        width: 100,
        minWidth: 100,
        render: (row) => (
          <Box>
            <Typography variant="body2" color="textPrimary">
              {row.profileInformation?.phoneNumber || '-'}
            </Typography>
            {row.profileInformation?.email && (
              <Typography variant="body2" color="textPrimary" sx={{ wordBreak: 'break-all' }}>
                {row.profileInformation.email}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        label: 'Notes',
        id: 'notes',
        enableSorting: false,
        width: 200,
        minWidth: 200,
        render: (row) => (
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <Typography variant="body2" color="textPrimary">
              {row.profileInformation?.notes || '-'}
            </Typography>
           
            <Stack direction="row" spacing={1}>
              <IconButton size="small" sx={{ color: '#2C3E50' }}>
                <EditIcon fontSize="small" onClick={() => handleEditMember(row)} />
              </IconButton>
              <IconButton size="small" sx={{ color: '#2C3E50' }}>
                <VisibilityIcon fontSize="small" onClick={() => handleViewMember(row)} />
              </IconButton>
            </Stack>
          </Box>
        ),
      },
    ],
    []
  );


  return (
    <ReusableTrendTable
      columns={columnDefinition}
      title={t("common:family.Family members and caregivers", "Family members and caregivers ({{count}})", { count: members?.length || 0 })}
      subheader=""
      tableData={members || []}
      loading={false}
      skeltonRowcount={5}
      apiError={false}
      searchable={false}
      enablePagination={false}
      onReload={() => {}}
      t={t}
      boldHeaders={false}
    />
  );
};


export default FamilyMembersTable;

