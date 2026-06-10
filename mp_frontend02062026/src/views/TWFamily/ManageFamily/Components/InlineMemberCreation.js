import { useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Grid,
    Button,
    Radio,
    Typography,
    RadioGroup,
    IconButton,
    Menu,
    CircularProgress,
    Skeleton,
    MenuItem,
    Modal
} from '@mui/material';
import { Stack } from '@mui/system';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Field, FieldArray, useFormikContext } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import { ModalService } from '../../../../components/Modal';
import APIS from '../../../../common/hooks/UseApiCalls';
import toast from 'react-hot-toast';
import DropdownWithExternalLabel from './DropdownWithExternalLabel';
import DynamicForm from '../../../TWFamily/ManageFamily/Components/DynamicForm';
import { InlineChildCreationConfig, InlineMemberCreationConfig } from '../Configs/MemberFormConfig';
import ChildRenderOption from './ChildRenderOption';
import AddFamilyMemberModal from './AddFamilyMemberModal';
import RadioGroupList from './RadioGroupList';
import TextFieldWithExternalLabel from './TextFieldWithExternalLabel';
import PencilEditIcon from '../../../../assets/icons/PencilEditIcon';
import ManageChildForm from '../../../Child/Components/ChildListTable/ChildDetailForms/ManageChildForm';
import DeleteMember from '../../../../assets/icons/DeleteMember';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DateFormatFromRegion } from '../../../../constants';
import SmallText from '../../../../components/SmallText/SmallText';
import CalendarIcon from '../../../../assets/icons/CalendarIcon';


const InlineMemberCreation = ({
    familyId,
    caseWorker,
    setIsLoading,
    familyRelations,
    isFamilyActive = true,
    memberDeleteReasons = [],
    familyChangeReasons = [],
}) => {
    const { t } = useTranslation(['common']);
    const formik = useFormikContext();
    const memberList = formik?.values?.members || [];
    const [selectedCareGiver, setSelectedCareGiver] = useState(() => {
        const primary = memberList.find(member => member?.isPrimaryCaregiver);
        return primary ? (primary.id || primary._rowKey) : null;
    });
    const searchCache = useRef({});
    const searchController = useRef(null);
    const [isAdding, setIsAdding] = useState(false);
    const [menuState, setMenuState] = useState({ anchorEl: null, member: null });
    const open = Boolean(menuState.anchorEl);
    const [childToEdit, setChildToEdit] = useState(null);
    const [childModalOpen, setChildModalOpen] = useState(false);
    const [hideChildModal, setHideChildModal] = useState(false);
    const handleChildModalOpen = () => {
        setChildModalOpen(!childModalOpen);
    };
    const getMemberDetailsRef = useRef(null);
    getMemberDetailsRef.current = (member) => {
        console.log("Updating member details in formik for member:", member,selectedCareGiver);
        formik?.setValues(prev => {
            const currentMembers = prev.members || [];

            const memberIndex = currentMembers.findIndex(m =>
                member._rowKey
                    ? m._rowKey === member._rowKey
                    : m.id === member.id && m.isChild === member.isChild
            );

            if (memberIndex === -1) return prev; // no change, Formik won't re-render

            const existing = currentMembers[memberIndex];
            console.log("Existing member data:", existing);
            const updatedMembers = [...currentMembers];
            updatedMembers[memberIndex] = {
                ...existing,
                ...member,
                profileInformation: {
                    ...existing.profileInformation,
                    ...member.profileInformation,
                },
            };

            return { ...prev, members: updatedMembers };

        });
        setSelectedCareGiver(member.isPrimaryCaregiver ? (member.id || member._rowKey) : selectedCareGiver)
    };

    const getMemberDetails = useCallback((member) => {
        getMemberDetailsRef.current?.(member);
    }, []);
    // ──────────────────────────────────────────────────────────────────────────

    const handleClick = (event, member) => {
        setMenuState({ anchorEl: event.currentTarget, member });
    };
    const handleClose = () => {
        setMenuState({ anchorEl: null, member: null });
    };

    const toUTCMidnight = (dateValue) => {
        if (!dateValue) return null;

        const date = new Date(dateValue);

        // Build UTC midnight from local date parts
        return new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        )).toISOString();
    };

    const menuActions = [
        {
            label: t("common:common.Edit", "Edit"),
            icon: PencilEditIcon,
            onClick: (obj) => handleEditMember(obj),
        },
        {
            label: t("common:common.Remove member", "Remove member"),
            icon: DeleteMember,
            isDisabled: (member) => (member?.isPrimaryCaregiver || !member?.id || member?.newlyAdded) ? true : false,
            onClick: (obj) => handleDeleteMember(obj),
        },
        {
            label: t("common:common.Clear", "Clear"),
            icon: RemoveCircleIcon,
            isDisabled: (member) => member?.id && !member?.newlyAdded ? true : false,
            onClick: (obj) => handleClearMember(obj),
        },
    ];

    const iconSx = {
        cursor: "pointer",
        fontSize: 23,
        color: "midhnightblue",
        "&:hover": { color: "midhnightblue" },
    };

    const handleRadioChange = useCallback((e, member) => {
    const memberKey = member.id || member._rowKey;
    
    // Avoid re-render if same caregiver selected
    if (selectedCareGiver === memberKey) return;
    
    setSelectedCareGiver(memberKey);

    // Batch all field updates in a single setValues call
    const updatedMembers = memberList.map((m, index) => ({
        ...formik.values.members[index],
        isPrimaryCaregiver: (m.id || m._rowKey) === memberKey,
    }));

    formik?.setFieldValue('members', updatedMembers, false); // false = skip validation on change
}, [selectedCareGiver, memberList, formik]);

    const mergedChildAndFamilyInfo = (childInfo, familyInfo) => {

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
            ? handleChildEdit(member)
            : ModalService.open(
                ({ close }) => (
                    <AddFamilyMemberModal
                        onClose={close}
                        getMemberDetails={getMemberDetails}
                        member={member}
                        familyId={familyId}
                        isFamilyActive={isFamilyActive}
                        isMemberActive={member?.isActive}
                        dropdownValues={{
                            familyRelations: familyRelations.filter(
                                (relation) => relation.groupValue !== "Child",
                            ),
                        }}
                    />
                ),
                updatedConfig,
            );
    };

    const handleChildEdit = (child) => {
        setChildToEdit({ ...child, caseWorkerId: formik?.values?.caseWorker ,isNewFamily: !formik?.values?.id});
        setChildModalOpen(true);
    }

    const handleAddMember = async (push) => {
        setIsAdding(true);
        await new Promise(res => setTimeout(res, 1));

        const hasPrimaryCaregiver = memberList.some(m => m.isPrimaryCaregiver && !m.isDeleted);
        const newRowKey = uuidv4();
        push({
            TWFamilyRelationId: "",
            isActive: true,
            isMajor: false,
            isPrimaryCaregiver: !hasPrimaryCaregiver,
            profileInformation: {
                appAccessEnabled: false,
            },
            _rowKey: newRowKey,
        });

        if (!hasPrimaryCaregiver) {
            setSelectedCareGiver(newRowKey);
        }

        setIsAdding(false);
    };

    const handleClearMember = (member) => {
        const currentMembers = formik?.values?.members || [];
        const memberIndex = currentMembers.findIndex(m =>
            member._rowKey
                ? m._rowKey === member._rowKey
                : m.id === member.id && m.isChild === member.isChild
        );

        if (memberIndex === -1) return;

        const updatedMembers = currentMembers.filter((_, idx) => idx !== memberIndex);

        // If cleared member was primary caregiver, assign new one
        if (member?.isPrimaryCaregiver && updatedMembers.length > 0) {
            // Try index + 1 (same index after removal), fallback to index - 1 (last)
            const newPrimaryIndex = memberIndex < updatedMembers.length
                ? memberIndex
                : memberIndex - 1;

            updatedMembers[newPrimaryIndex] = {
                ...updatedMembers[newPrimaryIndex],
                isPrimaryCaregiver: true,
            };

            // Update selectedCareGiver state
            const newPrimary = updatedMembers[newPrimaryIndex];
            setSelectedCareGiver(newPrimary.id || newPrimary._rowKey);
        }

        const currentTouched = formik?.touched?.members || [];
        const updatedTouched = currentTouched.filter((_, idx) => idx !== memberIndex);

        formik?.setFormikState(prev => ({
            ...prev,
            values: { ...prev.values, members: updatedMembers },
            touched: { ...prev.touched, members: updatedTouched },
            errors: {
                ...prev.errors,
                members: (prev.errors?.members || []).filter((_, idx) => idx !== memberIndex),
            },
        }));
    };

    const checkForDuplicateChild = async (index, member, fieldValue = null, fieldName = null) => {
        let { firstName, gender, dateOfBirth, id } = member;
        if (id) return;
        if (fieldValue !== null && fieldName) {
            switch (fieldName) {
                case 'firstName':
                    firstName = fieldValue;
                    break;
                case 'gender':
                    gender = fieldValue;
                    break;
                case 'dateOfBirth':
                    dateOfBirth = fieldValue;
                    break;
                default:
                    break;
            }
        }
        if (!firstName || !gender || !dateOfBirth) return;
        try {
            setIsLoading(true);
            const payload = {
                firstName: firstName.trim(),
                gender: gender,
                birthDate: dateOfBirth,
                filters: {
                    familyId: null
                }
            };

            const response = await APIS.GetDuplicateChildList(payload);
            setIsLoading(false);

            const existingChildIds = new Set(
                (formik?.values?.members || [])
                    .filter((m) => m?.isChild && m?.id)
                    .map((m) => String(m.id))
            );

            const existingChild = (response?.data?.data || []).filter(
                (child) => !existingChildIds.has(String(child?.id))
            );
            if (existingChild.length > 0) {
                const DuplicateModalContent = ({ close }) => {
                    const [localLastName, setLocalLastName] = useState(formik?.values?.members?.[index]?.lastName || '');
                    const [selectedChildOption, setSelectedChildOption] = useState(null);

                    const handleLastNameChange = (e) => {
                        const value = e.target.value;
                        setLocalLastName(value);
                    };

                    return (
                        <Box sx={{ p: 0 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {t('common:child.Is the child you are entering one of the following individuals?', 'Is the child you are entering one of the following individuals?')}
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <RadioGroupList
                                    name="selectedChild"
                                    options={existingChild}
                                    onChange={(e) => {
                                        const selectedValue = e?.target?.value;
                                        const matchedChild = existingChild.find(
                                            (child) => String(child.id) === String(selectedValue)
                                        ) || null;
                                        setSelectedChildOption(matchedChild);
                                    }}
                                />
                            </Box>

                            {!selectedChildOption &&
                                <><Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                    {t('common:child.If this child is not one of the children listed above and is new to the system, please enter a last name for identification purposes.', 'If this child is not one of the children listed above and is new to the system, please enter a last name for identification purposes.')}
                                </Typography>

                                    <TextFieldWithExternalLabel
                                        name='lastName'
                                        label={t('common:child.Last name', 'Last name')}
                                        variant="outlined"
                                        fullWidth
                                        required={false}
                                        value={localLastName}
                                        onChange={handleLastNameChange}
                                    />
                            </>}
                            <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => {
                                        close();
                                    }}
                                >
                                    {t('common:common.Cancel', 'Cancel')}
                                </Button>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={!selectedChildOption && !localLastName}
                                    onClick={() => {
                                        if (selectedChildOption) {
                                            handleChildSelection(selectedChildOption, index);
                                            toast.success(t('common:child.Existing child selected', "Existing child selected"));
                                        } else {
                                            formik?.setFieldValue(`members.${index}.lastName`, localLastName);
                                        }
                                        close();
                                    }}
                                >
                                    {t('common:common.Add this child', 'Add this child')}
                                </Button>
                            </Box>
                        </Box>
                    );
                };

                ModalService.open(({ close }) => <DuplicateModalContent close={close} />, {
                    modalTitle: t('common:child.Child may exist in the system', 'Child may exist in the system'),
                    width: '30%',
                    hideModalFooter: true,
                    enableClose: true,
                });
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error checking for duplicate child:', error);
            toast.error(t('common:common.Error checking for duplicates'));
        }
    };

    const searchChildren = useCallback(async (searchTerm = "", childId) => {
        if (childId) return;
        searchTerm = searchTerm.trim();
        if (searchTerm.length < 3) return [];

        if (searchCache.current[searchTerm]) {
            const existingChildIds = new Set(
                (formik?.values?.members || [])
                    .filter((m) => m?.isChild && m?.id)
                    .map((m) => String(m.id))
            );

            return (searchCache.current[searchTerm] || []).filter(
                (child) => !existingChildIds.has(String(child?.id))
            );
        }

        searchController.current?.abort();
        searchController.current = new AbortController();

        const payload = {
            firstName: searchTerm.trim(),
            filters: {
                familyId: null
            }
        };

        try {
            const response = await APIS.GetDuplicateChildList(payload, {
                signal: searchController.current.signal,
            });
            const existingChildIds = new Set(
                (formik?.values?.members || [])
                    .filter((m) => m?.isChild && m?.id)
                    .map((m) => String(m.id))
            );

            const result = (response?.data?.data || []).filter(
                (child) => child.familyId === null && !existingChildIds.has(String(child?.id))
            );
            searchCache.current[searchTerm] = result;
            return result;
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Error fetching child list:", error);
            }
            return [];
        }
    }, [formik?.values?.members]);

    const handleChildSelection = (child, currentIndex) => {
        if (!child || typeof child !== 'object') return;
        const { firstName = '', lastName = '', gender = '', dateOfBirth = null, id = '', isMajor = false } = child;
        
        formik?.setValues(prev => {
            const members = [...prev.members];
            const { _rowKey, ...currentMember } = members[currentIndex];
            members[currentIndex] = {
                ...currentMember,
                firstName,
                lastName,
                dateOfBirth,
                gender,
                id,
                isChild: true,
                isMajor,
                isExistingChild: true,
                newlyAdded: true,
            };
            return { ...prev, members };
        });
        setSelectedCareGiver(prev => {
            const currentMember = memberList[currentIndex];
            if (currentMember?.isPrimaryCaregiver) {
                return id || currentMember._rowKey;
            }
            return prev;
        });
        
    };

    const handleFieldBlur = (index, fieldName, fieldValue = null) => {
        const member = memberList?.[index];
        if (['firstName', 'gender', 'dateOfBirth'].includes(fieldName)) {
            setTimeout(() => {
                checkForDuplicateChild(index, member, fieldValue, fieldName);
            }, 150);
        }
    };

    const handleDateChange = (index, newValue) => {
        formik?.setFieldValue(`members.${index}.dateOfBirth`, toUTCMidnight(newValue));
        handleFieldBlur(index, 'dateOfBirth', toUTCMidnight(newValue));
    };

    const checkEmptyDataFields = (index) => {
        if (index < 0) return false;
        const member = memberList?.[index];
        if (!member?.TWFamilyRelationId) return true;
        if (["3", "9"].includes(member?.TWFamilyRelationId)) {
            return !member?.firstName || !member?.gender || !member?.dateOfBirth;
        } else {
            return !member?.firstName;
        }
    };
    

    const handleDeleteMember = (member) => {
        ModalService.open(({ close }) => (
            <Box sx={{ p: 2 }}>
                <Typography>
                    {t('common:common.Are you sure you want to remove')} {member.firstName} {member.lastName}{' '}
                    {t('common:common.from this family?')}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button variant="outlined" onClick={close}>
                        {t('common:common.No')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            handleDeleteConfirmation(member);
                            close();
                        }}
                    >
                        {t('common:common.Yes, Remove member', 'Yes, Remove member')}
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

    // Local state for modal fields
    const localDateRef = useRef(null);
    const localReasonRef = useRef("");

    const handleDeleteConfirmation = useCallback((member) => {
        // Find the member index in the Formik array
        const currentMembers = formik?.values?.members || [];
        const memberIndex = currentMembers.findIndex(m =>
            member._rowKey
                ? m._rowKey === member._rowKey
                : m.id === member.id && m.isChild === member.isChild
        );

        localDateRef.current = null;
        localReasonRef.current = "";
        let removeReasonOptions = (member?.isChild ? familyChangeReasons : memberDeleteReasons) || [];

        ModalService.open(({ close }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {t(
                            `common:child.Closing a family's case also closes the cases for all family members and children in the family`,
                            `Closing a family's case also closes the cases for all family members and children in the family.`
                        )}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            {t('common:family.Date of deactivation', 'Date of deactivation')}
                        </Typography>
                        <DatePicker
                            value={localDateRef.current ? dayjs(localDateRef.current) : null}
                            format={DateFormatFromRegion(true)}
                            onChange={(newValue) => {
                                localDateRef.current = newValue ? newValue.toISOString() : null;
                            }}
                            maxDate={dayjs().endOf('day')}
                            slots={{ openPickerIcon: CalendarIcon }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    variant: "outlined",
                                    placeholder: "",
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ p: 2, borderRadius: 1, mb: 3 }}>
                        <SmallText value={t('common:family. Why is this person being deleted?', 'Why is this person being deleted?')} />
                        <RadioGroupList
                            name="deleteReason"
                            options={removeReasonOptions}
                            value={localReasonRef.current}
                            onChange={(e) => {
                                localReasonRef.current = e.target.value;
                            }}
                            renderPrimary={(option) => <SmallText value={option.value} />}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" fullWidth onClick={close}>
                            {t('common:common.No,Cancel', 'No, Cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            type="button"
                            onClick={() => {
                                if (memberIndex !== -1) {
                                    formik?.setFieldValue(`members.${memberIndex}.isDeleted`, true);
                                    formik?.setFieldValue(`members.${memberIndex}.deactivationDate`, localDateRef.current);
                                    formik?.setFieldValue(`members.${memberIndex}.reason`, removeReasonOptions.find(option => option.id === localReasonRef.current)?.value || '');
                                }
                                close();
                            }}
                        >
                            {t('common:common.Yes, Delete', 'Yes, Delete')}
                        </Button>
                    </Box>
                </Box>
            </LocalizationProvider>
        ), {
            modalTitle: t('common:family.Delete this family member?', 'Delete this family member?'),
            width: '30%',
            hideModalFooter: true,
            enableClose: true,
        });
    }, [formik, memberDeleteReasons, familyChangeReasons, t]);

    const nonChildMemberCount = memberList.filter(
        (member) => !member?.isDeleted && member?.isChild !== true
    ).length;
    const shouldDisableNonChildRelations = nonChildMemberCount > 20;

    const buildFamilyOptions = (isChild, memberId, selectedRelationId = null) => {
        const scopedOptions = !memberId
            ? familyRelations
            : isChild
                ? familyRelations.filter(relation => relation.groupValue === "Child")
                : familyRelations.filter(relation => relation.groupValue !== "Child");

        // Keep existing members editable; restrict only brand-new rows.
        if (!shouldDisableNonChildRelations || memberId) {
            return scopedOptions;
        }

        return scopedOptions.map((relation) => {
            const isChildRelation = relation.groupValue === "Child";
            const isSelectedRelation = String(relation.id) === String(selectedRelationId);

            return {
                ...relation,
                disabled: !isChildRelation && !isSelectedRelation,
            };
        });
    };


    return (
        <>
            <Modal
                open={childModalOpen}
                onClose={handleChildModalOpen}
                sx={{ visibility: hideChildModal ? "hidden" : "visible" }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: { xs: "90%", sm: 500, md: 600, lg: 700 },
                        bgcolor: "background.paper",
                        // border: "2px solid #000",
                        p: 3,
                        boxShadow: 24,
                    }}
                >
                    <ManageChildForm
                        handleChildModalOpen={handleChildModalOpen}
                        childInfo={childToEdit}
                        id={childToEdit?.id || null}
                        isFromFamily={true}
                        getMemberDetails={getMemberDetails}
                        setHideChildModal={setHideChildModal}
                    />
                </Box>
            </Modal>
            <FieldArray name="members">
                {({ insert, remove, push }) => (
                    <>
                        {memberList
                            ?.map((obj, trueIndex) => ({ obj, trueIndex }))
                            .filter(({ obj }) => !obj.isDeleted)
                            .map(({ obj, trueIndex: i }) => (

                                <Box key={obj.id || obj._rowKey}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        backgroundColor: "#FFFFFF",
                                        borderRadius: 1,
                                    }}
                                >

                                    <RadioGroup value={selectedCareGiver}>
                                        <Box
                                            sx={{
                                                flex: 1,
                                                backgroundColor: "#F3F6FA",
                                                border: "1px solid #D9D9D9",
                                                borderRadius: 1,
                                                p: 1,
                                                mb: 1,
                                                maxHeight: { xs: "unset", md: 75 },
                                                minHeight: { xs: 75, md: "unset" },
                                            }}
                                        >

                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item md={2} xs={12}>
                                                    <Field
                                                        name={`members.${i}.TWFamilyRelationId`}
                                                        component={DropdownWithExternalLabel}
                                                        options={buildFamilyOptions(obj.isChild, obj?.id, obj?.TWFamilyRelationId)}
                                                        customFunction={(newValue) => {
                                                            formik?.setFieldValue(
                                                                `members.${i}.isChild`,
                                                                ["3", "9"].includes(newValue) ? true : false
                                                            );
                                                        }}
                                                        onClear={() => handleClearMember(obj)}
                                                        disableClearable={true}
                                                        required={true}
                                                        disabled={!(obj?.isActive && isFamilyActive) || !formik?.values?.caseWorker || !formik?.values?.familyName}
                                                        validateOnChange={true}
                                                        labelKey="value"
                                                        grouped={true}
                                                        groupBy="groupValue"
                                                        placeholder="Role in family"
                                                        textFieldProps={{
                                                            disabled: !(obj?.isActive && isFamilyActive) || !formik?.values?.caseWorker || !formik?.values?.familyName,
                                                            variant: "outlined",
                                                            margin: "none",
                                                            size: "small",
                                                            sx: {
                                                                "& .MuiOutlinedInput-root": {
                                                                    backgroundColor: "#FFFFFF",
                                                                },
                                                                "& .MuiAutocomplete-input": {
                                                                    backgroundColor: "transparent",
                                                                },
                                                                "& .MuiFormHelperText-root": {
                                                                    margin: 0,
                                                                    marginTop: "2px",
                                                                    marginLeft: "2px",
                                                                },
                                                            },
                                                        }}
                                                    />

                                                </Grid>
                                                {(!formik?.values?.caseWorker || !formik?.values?.familyName) && memberList?.length < 1 ? (
                                                    <Grid item md={6} xs={6}>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {t('common:family.Please select case worker and enter family name to add members', 'Please select case worker and enter family name to add members')}
                                                        </Typography>
                                                    </Grid>) : null}
                                                {obj.TWFamilyRelationId && (
                                                    ["3", "9"].includes(
                                                        obj.TWFamilyRelationId
                                                    ) ? (
                                                        <DynamicForm
                                                            t={t}
                                                            values={obj}
                                                            errors={formik?.errors?.members?.[i]}
                                                            touched={formik?.touched?.members?.[i]}
                                                            handleChange={formik?.handleChange}
                                                            handleBlur={(e) => {
                                                                formik?.handleBlur(e);
                                                                const fieldName = e.target.name.split('.').pop();
                                                                handleFieldBlur(i, fieldName, e.target.value);
                                                            }}
                                                            key={obj.gender}
                                                            handleDateChange={(newValue) => handleDateChange(i, newValue)}
                                                            setFieldValue={formik?.setFieldValue}
                                                            config={InlineChildCreationConfig}
                                                            searchFunction={(inputvalue) => searchChildren(inputvalue, obj.id)}
                                                            RenderOptionList={ChildRenderOption}
                                                            handleChildSelection={(child) => handleChildSelection(child, i)}
                                                            index={i}
                                                            parentFieldName="members"
                                                            initialTextValue={obj.firstName || ''}
                                                            isDisabled={!(obj?.isActive && isFamilyActive)}
                                                        />
                                                    ) : (
                                                        <DynamicForm
                                                            t={t}
                                                            values={obj}
                                                            errors={formik?.errors?.members?.[i]}
                                                            touched={formik?.touched?.members?.[i]}
                                                            handleChange={formik?.handleChange}
                                                            handleBlur={formik?.handleBlur}
                                                            setFieldValue={formik?.setFieldValue}
                                                            config={InlineMemberCreationConfig}
                                                            index={i}
                                                            parentFieldName="members"
                                                            isDisabled={!(obj?.isActive && isFamilyActive)}
                                                        />
                                                    )
                                                )}
                                                {obj.TWFamilyRelationId &&
                                                    <Grid item xs="auto" sx={{ marginLeft: 'auto', flexShrink: 0 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <Radio
                                                                checked={selectedCareGiver === (obj.id || obj._rowKey)}
                                                                onChange={(e) => handleRadioChange(e, obj)}
                                                                disabled={!(obj?.isActive && isFamilyActive)}
                                                                sx={{
                                                                    color: '#1D334B',
                                                                    '&.Mui-checked': { color: '#1D334B' },
                                                                    padding: 0.5,
                                                                }}
                                                            />
                                                            <Typography sx={{ whiteSpace: 'wrap' }}>
                                                                {t('common:common.Primary contact', 'Primary contact')}
                                                            </Typography>
                                                            <IconButton
                                                                aria-label="more"
                                                                onClick={(e) => handleClick(e, obj)}
                                                            >
                                                                <MoreVertIcon />
                                                            </IconButton>
                                                            <Menu anchorEl={menuState.anchorEl} open={open} onClose={handleClose}>
                                                                <Stack direction="column" spacing={0.5}>
                                                                    {menuActions
                                                                        .filter(({ isDisabled }) => !(isDisabled && isDisabled(menuState.member)))
                                                                        .map(({ label, icon: Icon, onClick }) => (
                                                                            <MenuItem
                                                                                key={label}
                                                                                onClick={() => { onClick(menuState.member, push); handleClose(); }}
                                                                                sx={{ justifyContent: 'flex-start', gap: 1, px: 1.5 }}
                                                                            >
                                                                                <Icon sx={iconSx} />
                                                                                <Typography>{label}</Typography>
                                                                            </MenuItem>
                                                                        ))}
                                                                </Stack>
                                                            </Menu>
                                                        </Box>
                                                    </Grid>}
                                            </Grid>
                                        </Box>
                                    </RadioGroup>
                                </Box>
                            ))}
                        {isAdding ? (
                            <Skeleton variant="rectangular" animation="wave" height={50} width="100%" sx={{ mb: 1 }} />
                        ) : (
                            <Button
                                onClick={() => handleAddMember(push)}
                                disabled={isAdding ||  checkEmptyDataFields(memberList?.length - 1) || !isFamilyActive || !formik?.values?.caseWorker || !formik?.values?.familyName}
                                variant={memberList?.length < 1 ? "contained" : "text"}
                                startIcon={isAdding ? <CircularProgress size={14} /> : null}
                            >
                                {memberList?.length < 1
                                    ? t("common:family.Add a new family member", "Add a new family member")
                                    : t("common:family.Add another family member", "Add another family member")}
                            </Button>
                        )}
                    </>
                )}
            </FieldArray>
        </>
    );
};

export default InlineMemberCreation;