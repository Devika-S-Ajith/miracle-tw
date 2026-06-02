import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  Button,
  Radio,
  Typography,
  FormControlLabel,
  RadioGroup,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ChildDelete from '../../../../assets/icons/ChildDelete';
import { calculateAge } from '../../../../helpers/helperFunction';
import { ModalService } from '../../../../components/Modal';
import AddMemberModal from './AddMemberModal';
import AddChildForm from '../../../Child/Components/AddChildForm';
import { dateFormatter } from '../../../../constants';
import APIS from '../../../../common/hooks/UseApiCalls';
import toast from 'react-hot-toast';
import SmallText from '../../../../components/SmallText/SmallText';

const FamilyMembersList = ({
  selectedMemberCollection,
  getMemberDetails,
  removeChildFromFamily,
  familyId,
  caseWorker,
  familyName,
  getPrimaryCareGiverDetail,
  getNewlyAddedChild,
  isFamilyActive,
  setIsLoading
}) => {
  const { t } = useTranslation(['common']);
  const [selectedCareGiver, setSelectedCareGiver] = useState(() => {
    // Initialize with the primary caregiver's ID immediately
    return selectedMemberCollection.find(member => member?.isPrimaryCareGiver)?.id || null;
  });


  const handleRemoveChild = async (child) => {
    setIsLoading(true);
    if (child?.isExistingChild && child?.isActive) {
      const deactivationCheck = await APIS.checkDeactivationAllowed(child?.id, familyId, "FAMILY");
      if (!(deactivationCheck.status === 200 && deactivationCheck?.data?.Message === "OK")) {
        setIsLoading(false);
        toast.error(
          "Child cannot be removed as there are pending assessments or progress reports."
        );
        return;
      }
    }

    setIsLoading(false);
    ModalService.open(({ close }) => (
      <Box sx={{ p: 2 }}>
        <Typography>
          {t('common:common.Are you sure you want to remove')} {child.firstName} {child.lastName}{' '}
          {t('common:common.from this family?')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={close}>
            {t('common:common.No')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              removeChildFromFamily(child);
              close();
            }}
          >
            {t('common:common.Yes,Remove child')}
          </Button>
        </Box>
      </Box>
    ), {
      modalTitle: t('common:common.Remove child from family'),
      width: '30%',
      hideModalFooter: true,
      enableClose: true,
    });
  };

  const handleRadioChange = (e, member) => {
    const newValue = member.id;
    setSelectedCareGiver(newValue);
    getPrimaryCareGiverDetail(member);
  }

  const handleEditMember = (member) => {
    const modalConfig = {
      width: member.isChild ? '60%' : '50%',
      modalTitle: member.isChild
        ? t('common:child.Edit Child')
        : t('common:family.Edit family member'),
      hideModalFooter: true,
      enableClose: true,
    };

    if (member.isChild) {
      modalConfig.maxHeight = '80%';
      modalConfig.overflow = 'scroll';
    }

    ModalService.open(({ close }) => (
      member.isChild ? (
        <AddChildForm
          family={{
            onClose: close,
            familyId,
            familyCaseWorker: caseWorker,
            familyName,
            getChildDetails: getNewlyAddedChild
          }}
          childId={member.id}
        />
      ) : (
        <AddMemberModal
          onClose={close}
          getMemberDetails={getMemberDetails}
          member={member}
          id={familyId}
        />
      )
    ), modalConfig);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        borderRadius: 1,
      }}
    >
      <RadioGroup value={selectedCareGiver}>
        {selectedMemberCollection.map((member) => (
          <Box
            key={member.id}
            sx={{
              flex: 1,
              backgroundColor: "#F3F6FA",
              border: "1px solid #D9D9D9",
              borderRadius: 1,
              p: 1,
              mb: 1,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Typography noWrap>
                  {member.firstName} {member.lastName}
                  {member?.isChild ? (
                    <SmallText value={t("common:common.Minor", "Minor")} />
                  ) : !member?.isMinor ? (
                    <SmallText value={t("common:common.Adult", "Adult")} />
                  ) : (
                    <SmallText value={t("common:common.Minor", "Minor")} />
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                {member.isChild ? (
                  <Typography>
                    {t("common:common.Child")},{" "}
                    {calculateAge(member?.birthDate, t)}{" "}
                    {t(`common:common.${member.gender}`, member.gender)}
                  </Typography>
                ) : (
                  <Typography>
                    {member?.otherRelation
                      ? member?.otherRelation
                      : member.relation}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography>{member.phoneNumber}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {member.isChild && !member.isActive && (
                    <Chip
                      color="primary"
                      label={t("common:common.Inactive")}
                      size="small"
                      sx={{
                        backgroundColor: "#f44336",
                      }}
                    />
                  )}
                  {member.isChild &&
                    selectedCareGiver !== member.id &&
                    isFamilyActive && (
                      <ChildDelete
                        onClick={() => handleRemoveChild(member)}
                        color="disabled"
                        sx={{ cursor: "pointer" }}
                      />
                    )}
                 
                  <FormControlLabel
                    control={
                      <Radio
                        disabled={member.isChild && !member.isActive}
                        checked={selectedCareGiver === member.id}
                        onChange={(e) => {
                          handleRadioChange(e, member);
                        }}
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                   {isFamilyActive && (
                    <EditIcon
                      onClick={() => handleEditMember(member)}
                      sx={{ cursor: "pointer" }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        ))}
      </RadioGroup>
    </Box>
  );
};

export default FamilyMembersList;