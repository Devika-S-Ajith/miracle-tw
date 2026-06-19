import {
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState, useMemo } from "react";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft"
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import CustomRecipientCondition from "./CustomRecipientCondition";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import {
  OrganizationIcon,
  OrganizationIconGrey,
} from "../../../assets/icons/SideBarIcons";
import * as Yup from "yup";

import { convertUnderscoreToText } from "../../../constants";
import Heading from "../../../components/Heading/Heading";
import BodyText from "../../../components/BodyText/BodyText";
import SubHeading from "../../../components/SubHeading";
import { ModalService } from "../../../components/Modal";

const Recipients = ({
  setActiveStepperIndex,
  onNextPage,
  onSubmit,
  initialValuesForEditing,
  cancelClickHandler,
  setMessageDetailsForEditing,
}) => {
  const { t } = useTranslation(["common"]);
  const { locationList, organizationList: orgListFromContext, roleListFS, roleListHT } =
    useContext(CommonDataContext);
  const userRegionId = localStorage.getItem("userRegion");
  // derive common country ids from locationList
  const indiaId = useMemo(
    () =>
      locationList?.find((l) => l?.countryName?.toLowerCase()?.includes("india"))?.id ??
      orgListFromContext?.find((o) => o?.accountName?.toLowerCase()?.includes("india"))?.MPCountryId,
    [locationList, orgListFromContext]
  );
  const usId = useMemo(
    () =>
      locationList?.find((l) => /united states|usa|us/i.test(l?.countryName))?.id ??
      orgListFromContext?.find((o) => /united states|usa|us/i.test(o?.accountName))?.MPCountryId,
    [locationList, orgListFromContext]
  );
  const ugandaId = useMemo(
    () =>
      locationList?.find((l) => l?.countryName?.toLowerCase()?.includes("uganda"))?.id ??
      orgListFromContext?.find((o) => o?.accountName?.toLowerCase()?.includes("uganda"))?.MPCountryId,
    [locationList, orgListFromContext]
  );

  const userRegionObj = useMemo(
    () => locationList?.find((l) => String(l.id) === String(userRegionId)),
    [locationList, userRegionId]
  );

  const isIndia = String(userRegionId)?.toLowerCase() === "in" ||
    userRegionObj?.countryName?.toLowerCase()?.includes("india");
  const isUS = String(userRegionId)?.toLowerCase() === "us" ||
    /united states|usa|us/i.test(userRegionObj?.countryName);
  const isUganda = String(userRegionId)?.toLowerCase() === "ug" ||
    userRegionObj?.countryName?.toLowerCase()?.includes("uganda");

  const effectiveLocationList = useMemo(() => {
    if (!locationList) return locationList;
    // India users: only India
    if (isIndia) {
      if (indiaId) return locationList.filter((loc) => String(loc.id) === String(indiaId));
      return locationList.filter((loc) => String(loc.id) === String(userRegionId));
    }
    // US or Uganda users: show both US and Uganda
    if (isUS || isUganda) {
      const ids = [usId, ugandaId].filter(Boolean).map((id) => String(id));
      if (ids.length) return locationList.filter((loc) => ids.includes(String(loc.id)));
    }
    // default: show all locations or only user's region when available
    return userRegionId ? locationList.filter((loc) => String(loc.id) === String(userRegionId)) : locationList;
  }, [userRegionId, locationList, isIndia, isUS, isUganda, indiaId, usId, ugandaId]);

  // Effective organization list per requirements:
  // - India: only Indian orgs
  // - US or Uganda: show both US and Uganda orgs
  // - Default: organizations filtered by user's region when available
  const effectiveOrganizationList = useMemo(() => {
    if (!orgListFromContext) return orgListFromContext;
    if (isIndia) {
      if (indiaId) return orgListFromContext.filter((org) => String(org?.MPCountryId) === String(indiaId));
      return orgListFromContext.filter((org) => org?.MPCountryId && String(org?.MPCountryId) === String(userRegionId));
    }
    if (isUS || isUganda) {
      const ids = [usId, ugandaId].filter(Boolean).map((id) => String(id));
      if (ids.length) return orgListFromContext.filter((org) => ids.includes(String(org?.MPCountryId)));
    }
    return orgListFromContext?.filter((org) =>
      userRegionId ? String(org?.MPCountryId) === String(userRegionId) : true
    );
  }, [userRegionId, orgListFromContext, indiaId, usId, ugandaId, isIndia, isUS, isUganda]);
  
  const organizationList = effectiveOrganizationList ?? orgListFromContext;
  const [locations, setLocations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);
  const RecipientsTypes = [
  {
    id: "ALL",
    type: t("common:system messages.All users in all organizations"),
    label: t("common:system messages.Every user will see this message"),
  },
  {
    id: "CUSTOM",
    type: t("common:system messages.Custom"),
    label: t("common:system messages.Define what user should see this message"),
  },
];

  const initialValues = {
    recipientsType: initialValuesForEditing?.receipientType ?? "ALL",
    org_location_condition:
      initialValuesForEditing?.receipientMatchingConditions
        ? initialValuesForEditing?.receipientType === "CUSTOM"
          ? Object?.keys(
              initialValuesForEditing?.receipientMatchingConditions
                ?.accountCountry
            )?.[0]?.toUpperCase() ?? "IS"
          : "IS"
        : "IS",
    org_location:
      initialValuesForEditing?.receipientType === "CUSTOM"
        ? !initialValuesForEditing?.receipientMatchingConditions
            ?.accountCountry[
            Object.keys(
              initialValuesForEditing?.receipientMatchingConditions
                ?.accountCountry
            )
          ].length
          ? effectiveLocationList?.map((obj) => ({
              id: obj.id,
              label: obj.countryName,
            }))
          : effectiveLocationList
              .filter((loc) =>
                initialValuesForEditing?.receipientMatchingConditions?.accountCountry[
                  Object.keys(
                    initialValuesForEditing?.receipientMatchingConditions
                      ?.accountCountry
                  )
                ]?.includes(loc.id)
              )
              ?.map((obj) => ({
                id: obj.id,
                label: obj.countryName,
              })) ?? []
        : effectiveLocationList?.map((obj) => ({
            id: obj.id,
            label: obj.countryName,
          })),
    org_name_condition: initialValuesForEditing?.receipientMatchingConditions
      ? initialValuesForEditing?.receipientType === "CUSTOM"
        ? Object?.keys(
            initialValuesForEditing?.receipientMatchingConditions?.account
          )?.[0]?.toUpperCase() ?? "IS"
        : "IS"
      : "IS",
    org_name: !initialValuesForEditing?.receipientMatchingConditions
      ? effectiveOrganizationList
          ?.filter((org) => org?.isActive)
          ?.map((obj) => ({
            id: obj.id,
            label: obj.accountName,
            MPCountryId: obj?.MPCountryId,
            accessType: obj?.accessType,
          }))
      : initialValuesForEditing?.receipientType === "CUSTOM"
      ? initialValuesForEditing?.receipientMatchingConditions?.account[
          Object.keys(
            initialValuesForEditing?.receipientMatchingConditions?.account
          )
        ]?.length
        ? effectiveOrganizationList
            ?.filter((org) =>
              initialValuesForEditing?.receipientMatchingConditions?.account[
                Object.keys(
                  initialValuesForEditing?.receipientMatchingConditions?.account
                )
              ]?.includes(org.id)
            )
            ?.map((obj) => ({
              id: obj.id,
              label: obj.accountName,
              MPCountryId: obj?.MPCountryId,
              accessType: obj?.accessType,
            })) ?? []
        : effectiveOrganizationList
            ?.filter((org) =>
              Object?.keys(
                initialValuesForEditing?.receipientMatchingConditions
                  ?.accountCountry
              )?.[0] === "is"
                ? (initialValuesForEditing?.receipientMatchingConditions?.accountCountry[
                    Object.keys(
                      initialValuesForEditing?.receipientMatchingConditions
                        ?.accountCountry
                    )
                  ]?.includes(org.MPCountryId) ||
                    !initialValuesForEditing?.receipientMatchingConditions
                      ?.accountCountry[
                      Object.keys(
                        initialValuesForEditing?.receipientMatchingConditions
                          ?.accountCountry
                      )
                    ].length) &&
                  org?.isActive
                : (!initialValuesForEditing?.receipientMatchingConditions?.accountCountry[
                    Object.keys(
                      initialValuesForEditing?.receipientMatchingConditions
                        ?.accountCountry
                    )
                  ]?.includes(org.MPCountryId) ||
                    !initialValuesForEditing?.receipientMatchingConditions
                      ?.accountCountry[
                      Object.keys(
                        initialValuesForEditing?.receipientMatchingConditions
                          ?.accountCountry
                      )
                    ].length) &&
                  org?.isActive
            )
            ?.map((obj) => ({
              id: obj.id,
              label: obj.accountName,
              MPCountryId: obj?.MPCountryId,
              accessType: obj?.accessType,
            }))
      : effectiveOrganizationList
          ?.filter((org) => org?.isActive)
          ?.map((obj) => ({
            id: obj.id,
            label: obj.accountName,
            MPCountryId: obj?.MPCountryId,
            accessType: obj?.accessType,
          })),
    platform:
      initialValuesForEditing?.receipientType === "CUSTOM"
        ? initialValuesForEditing?.receipientMatchingConditions?.viewingFrom ??
          t("common:system messages.WEB_AND_MOBILE")
        : t("common:system messages.WEB_AND_MOBILE"),
    user_role_condition: initialValuesForEditing?.receipientMatchingConditions
      ? initialValuesForEditing?.receipientMatchingConditions?.userRole
        ? initialValuesForEditing?.receipientMatchingConditions?.userRole?.is
          ? "IS"
          : "ISNOT"
        : "IS"
      : "IS",
    user_role: initialValuesForEditing?.receipientMatchingConditions?.userRole
      ? [
          ...(!initialValuesForEditing?.receipientMatchingConditions?.userRole[
            Object.keys(
              initialValuesForEditing?.receipientMatchingConditions?.userRole
            )
          ]?.HTUserRoleId
            ? []
            : initialValuesForEditing?.receipientMatchingConditions?.userRole[
                Object.keys(
                  initialValuesForEditing?.receipientMatchingConditions
                    ?.userRole
                )
              ]?.HTUserRoleId?.length
            ? roleListHT
                ?.filter((obj) =>
                  initialValuesForEditing?.receipientMatchingConditions?.userRole[
                    Object.keys(
                      initialValuesForEditing?.receipientMatchingConditions
                        ?.userRole
                    )
                  ]?.HTUserRoleId?.includes(obj?.id)
                )
                ?.map((obj) => ({
                  id: obj?.id + "HT",
                  id2: obj?.id,
                  label: t(`common:common.${obj.role}`) + " (t(common:common.Thrive Scale))",
                  module: "THRIVE_SCALE",
                }))
            : roleListHT
                ?.filter((item) => item.id != 9)
                ?.map((obj) => ({
                  id: obj?.id + "HT",
                  id2: obj?.id,
                  label: `${t(`common:common.${obj.role}`)} (${t("common:common.Thrive Scale")})`,                  
                  module: "THRIVE_SCALE",
                }))),

          ...(!initialValuesForEditing?.receipientMatchingConditions?.userRole[
            Object.keys(
              initialValuesForEditing?.receipientMatchingConditions?.userRole
            )
          ]?.FSUserRoleId
            ? []
            : initialValuesForEditing?.receipientMatchingConditions?.userRole[
                Object.keys(
                  initialValuesForEditing?.receipientMatchingConditions
                    ?.userRole
                )
              ]?.FSUserRoleId?.length
            ? roleListFS
                ?.filter((obj) =>
                  initialValuesForEditing?.receipientMatchingConditions?.userRole[
                    Object.keys(
                      initialValuesForEditing?.receipientMatchingConditions
                        ?.userRole
                    )
                  ]?.FSUserRoleId?.includes(obj?.id)
                )
                .filter((item) => item.id != 9)
                ?.map((obj) => ({
                  id: obj?.id + "FS",
                  id2: obj?.id,
                  label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,
                  module: "FOSTER_SHARE",
                }))
            : Object?.keys(
                initialValuesForEditing?.receipientMatchingConditions
                  ?.accountCountry
              )?.[0] === "is"
            ? initialValuesForEditing?.receipientMatchingConditions?.accountCountry[
                Object.keys(
                  initialValuesForEditing?.receipientMatchingConditions
                    ?.accountCountry
                )
              ]?.includes("2") ||
              !initialValuesForEditing?.receipientMatchingConditions
                ?.accountCountry[
                Object.keys(
                  initialValuesForEditing?.receipientMatchingConditions
                    ?.accountCountry
                )
              ].length
              ? roleListFS
                  .filter((item) => item.id != 9)
                  ?.map((obj) => ({
                    id: obj?.id + "FS",
                    id2: obj?.id,
                    label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,
                    module: "FOSTER_SHARE",
                  }))
              : []
            : !initialValuesForEditing?.receipientMatchingConditions?.accountCountry[
                Object.keys(
                  initialValuesForEditing?.receipientMatchingConditions
                    ?.accountCountry
                )
              ]?.includes("2")
            ? roleListFS
                .ArrowRightIconfilter((item) => item.id != 9)
                ?.map((obj) => ({
                  id: obj?.id + "FS",
                  id2: obj?.id,
                  label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,
                  module: "FOSTER_SHARE",
                }))
            : []),
        ] ?? []
      : [
          ...roleListHT
            .filter((item) => item.id != 9)
            ?.map((obj) => ({
              id: obj?.id + "HT",
              id2: obj?.id,
              label: `${t(`common:common.${obj.role}`)} (${t("common:common.Thrive Scale")})`,
              module: "THRIVE_SCALE",
            })),
          ...roleListFS
            .filter((item) => item.id != 9)
            ?.map((obj) => ({
              id: obj?.id + "FS",
              id2: obj?.id,
              label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,
              module: "FOSTER_SHARE",
            })),
        ],
  };

  const handlePreviousPageHandler = (data) => {
    // let params = createParams(data);
    // setMessageDetailsForEditing({ ...initialValuesForEditing, ...params });
    ModalService.open(() => <></>, {
      modalTitle: "Unsaved changes",
      width: "30%",
      modalDescription:
        "To continue, you need to discard any changes made on this step. Are you sure?",
      actionButtonText: "Discard changes",
      cancelButtonText:t("common:common.Cancel"),
      onClick: () => setActiveStepperIndex(0),
    });
  };

  const validationSchema = Yup.object().shape({
    org_location: Yup.array().when("recipientsType", {
      is: (recipientsType) => recipientsType && recipientsType === "CUSTOM",
      then: Yup.array().min(1, t("common:system messages.At least one location is required")),
      otherwise: Yup.array(),
    }),
    org_name: Yup.array().when("recipientsType", {
      is: (recipientsType) => recipientsType && recipientsType === "CUSTOM",
      then: Yup.array().min(1, t("common:system messages.At least one organization is required")),
      otherwise: Yup.array(),
    }),
    user_role: Yup.array().when("recipientsType", {
      is: (recipientsType) => recipientsType && recipientsType === "CUSTOM",
      then: Yup.array().min(1, t("common:system messages.At least one user role is required")),
      otherwise: Yup.array(),
    }),
    platform: Yup.string().when("recipientsType", {
      is: (recipientsType) => recipientsType && recipientsType === "CUSTOM",
      then: Yup.string().required(t("common:system messages.Platform type is required")).nullable(),
      otherwise: Yup.string().notRequired().nullable(),
    }),
  });

  const form = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (value) => {
      if (value?.mode === "preview") previewClickHandler(value);
      else if (value?.mode === "previous") handlePreviousPageHandler(value);
      else saveAsDraft(value);
    },
  });
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    isSubmitting,
    handleSubmit,
  } = form;

  useEffect(() => {
    if (effectiveLocationList?.length)
      setLocations([
        { id: -1, label: <Box p>{t("common:system messages.Select all locations")}</Box> },
        { id: -2, label: <Box p>{t("common:system messages.Deselect all locations")}</Box> },
        ...effectiveLocationList.map((obj) => ({
          id: obj.id,
          label: obj.countryName,
        })),
      ]);
  }, [effectiveLocationList]);

  useEffect(() => {
    if (effectiveOrganizationList?.length) {
      let list = [
        {
          id: -1,
          label: (
            <Box
              gap={2}
              sx={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <OrganizationIconGrey />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography>{t("common:system messages.Select all organizations")}</Typography>
                <Typography variant="caption">
                  {effectiveOrganizationList.filter((org) => org?.isActive)?.length}{" "}
                  Organizations
                </Typography>
              </Box>
            </Box>
          ),
        },
        {
          id: -2,
          label: <Box p>{t("common:system messages.Deselect all organizations")}</Box>,
        },
        ...effectiveOrganizationList
          .filter((org) => org?.isActive)
          .map((obj) => ({
            id: obj.id,
            label: obj.accountName,
            MPCountryId: obj?.MPCountryId,
            accessType: obj?.accessType,
          })),
      ];
      setOrganizations(list);
    }
  }, [effectiveOrganizationList]);

  useEffect(() => {
    if (roleListHT?.length && roleListFS?.length)
      setRoles([
        {
          id: -1,
          label: <Box p>{t("common:system messages.Select all roles")}</Box>,
        },
        { id: -2, label: <Box p>{t("common:system messages.Deselect all roles")}</Box> },

        ...roleListHT
          .filter((item) => item.id != 9)
          .map((obj) => ({
            id: obj?.id + "HT",
            id2: obj?.id,
            label: `${t(`common:common.${obj.role}`)} (${t("common:common.Thrive Scale")})`,
            module: "THRIVE_SCALE",
          })),

        ...roleListFS
          .filter((item) => item.id != 9)
          .map((obj) => ({
            id: obj?.id + "FS",
            id2: obj?.id,
            label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,
            module: "FOSTER_SHARE",
          })),
      ]);
  }, [roleListFS, roleListHT]);

  useEffect(() => {
    const el = document.querySelector(".Mui-error, [data-error]");
    (el?.parentElement ?? el)?.scrollIntoView();
    (el?.parentElement ?? el)?.focus();
  }, [isSubmitting]);

  const saveAsDraft = async (values) => {
    let params = {
      messageSubject: initialValuesForEditing?.subject,
      messageContent: initialValuesForEditing?.content,
      // addActionEnabled: initialValuesForEditing?.availableActions,
      messageFreqAdditionalInfo:
        initialValuesForEditing?.messageFreqAdditionalInfo,
      messageFrequency: initialValuesForEditing?.messageFrequency,
      startsAt: initialValuesForEditing?.startDateTime,
      endsAt: initialValuesForEditing?.endDateTime,
      messageType: initialValuesForEditing?.MPSystemMessageTypeId,
      messageStatus: initialValuesForEditing?.messageStatus,
      addActionEnabled: initialValuesForEditing?.availableActions.length
        ? true
        : false,
      buttonUrl: initialValuesForEditing?.availableActions[0]?.link || null,
      buttonLabel: initialValuesForEditing?.availableActions[0]?.label || null,
    };
    // messageSubject,
    // messageType,
    // messageContent,
    // addActionEnabled,
    // buttonLabel,
    // buttonUrl,
    // messageFrequency,
    // startsAt,
    // endsAt,
    // receipientType,
    // receipientMatchingConditions,
    // messageFreqAdditionalInfo,
    setMessageDetailsForEditing({
      ...initialValuesForEditing,
      ...createParams(values),
    });
    await onNextPage({ ...params, ...createParams(values) });
    onSubmit("DRAFT", { ...params, ...createParams(values) });
  };

  useEffect(() => {
    if (values?.org_location.length) {
      if (values?.org_location_condition === "IS") {
        setOrganizations([
          {
            id: -1,
            label: (
              <Box
                gap={2}
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <OrganizationIconGrey />
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography>{t("common:system messages.Select all organizations")}</Typography>
                  <Typography variant="caption">
                    {
                      organizationList?.filter(
                        (org) =>
                          org?.isActive &&
                          values?.org_location
                            ?.map((obj) => obj.id)
                            ?.includes(org.MPCountryId)
                      )?.length
                    }{" "}
                    Organizations
                  </Typography>
                </Box>
              </Box>
            ),
          },
          {
            id: -2,
            label: <Box p>{t("common:system messages.Deselect all organizations")}</Box>,
          },
          ...organizationList
            ?.filter(
              (org) =>
                org?.isActive &&
                values?.org_location
                  ?.map((obj) => obj.id)
                  ?.includes(org.MPCountryId)
            )
            ?.map((obj) => ({
              id: obj.id,
              label: obj.accountName,
              MPCountryId: obj?.MPCountryId,
              accessType: obj?.accessType,
            })),
        ]);
        if (organizations?.length - 2 === values?.org_name?.length) {
          setFieldValue(
            "org_name",
            organizationList
              .filter(
                (org) =>
                  org?.isActive &&
                  values?.org_location
                    ?.map((obj) => obj.id)
                    ?.includes(org.MPCountryId)
              )
              .map((obj) => ({
                id: obj.id,
                label: obj.accountName,
                MPCountryId: obj?.MPCountryId,
                accessType: obj?.accessType,
              }))
          );
          return;
        }
        if (values?.org_name.length) {
          setFieldValue(
            "org_name",
            values?.org_name?.filter((org) =>
              values?.org_location
                ?.map((obj) => obj.id)
                ?.includes(org.MPCountryId)
            )
          );
        }
      } else {
        setOrganizations([
          {
            id: -1,
            label: (
              <Box
                gap={2}
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <OrganizationIconGrey />
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography>{t("common:system messages.Select all organizations")}</Typography>
                  <Typography variant="caption">
                    {
                      organizationList?.filter(
                        (org) =>
                          org?.isActive &&
                          !values?.org_location
                            ?.map((obj) => obj.id)
                            ?.includes(org.MPCountryId)
                      )?.length
                    }{" "}
                    Organizations
                  </Typography>
                </Box>
              </Box>
            ),
          },
          {
            id: -2,
            label: <Box p>{t("common:system messages.Deselect all organizations")}</Box>,
          },
          ...organizationList
            ?.filter(
              (org) =>
                org?.isActive &&
                !values?.org_location
                  ?.map((obj) => obj.id)
                  ?.includes(org.MPCountryId)
            )
            ?.map((obj) => ({
              id: obj.id,
              label: obj.accountName,
              MPCountryId: obj?.MPCountryId,
              accessType: obj?.accessType,
            })),
        ]);
        if (organizations?.length - 2 === values?.org_name?.length) {
          setFieldValue(
            "org_name",
            organizationList
              .filter(
                (org) =>
                  org?.isActive &&
                  !values?.org_location
                    ?.map((obj) => obj.id)
                    ?.includes(org.MPCountryId)
              )
              .map((obj) => ({
                id: obj.id,
                label: obj.accountName,
                MPCountryId: obj?.MPCountryId,
                accessType: obj?.accessType,
              }))
          );
          return;
        }
        if (values?.org_name.length) {
          setFieldValue(
            "org_name",
            values?.org_name?.filter(
              (org) =>
                !values?.org_location
                  ?.map((obj) => obj.id)
                  ?.includes(org.MPCountryId)
            )
          );
        }
      }
    } else {
      setOrganizations([
        {
          id: -1,
          label: (
            <Box
              gap={2}
              sx={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <OrganizationIconGrey />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography>{t("common:system messages.Select all organizations")}</Typography>
                <Typography variant="caption">
                  {organizationList.filter((org) => org?.isActive)?.length}{" "}
                  Organizations
                </Typography>
              </Box>
            </Box>
          ),
        },
        {
          id: -2,
          label: <Box p>{t("common:system messages.Deselect all organizations")}</Box>,
        },
        ...organizationList
          .filter((org) => org?.isActive)
          .map((obj) => ({
            id: obj.id,
            label: obj.accountName,
            MPCountryId: obj?.MPCountryId,
            accessType: obj?.accessType,
          })),
      ]);

      if (organizations?.length - 2 === values?.org_name?.length)
        setFieldValue(
          "org_name",
          organizationList
            .filter((org) => org?.isActive)
            .map((obj) => ({
              id: obj.id,
              label: obj.accountName,
              MPCountryId: obj?.MPCountryId,
              accessType: obj?.accessType,
            }))
        );
    }
  }, [values?.org_location, values?.org_location_condition]);

  useEffect(() => {
    let hasFosterShare = values?.org_location?.some((loc) => loc?.id === "2");

    if (values?.org_location.length) {
      if (values?.org_location_condition === "IS") {
        setRoles([
          {
            id: -1,
            label: <Box p>{t("common:system messages.Select all roles")}</Box>,
          },
          { id: -2, label: <Box p>{t("common:system messages.Deselect all roles")}</Box> },

          ...roleListHT
            .filter((item) => item.id != 9)
            .map((obj) => ({
              id: obj?.id + "HT",
              id2: obj?.id,
              label: `${t(`common:common.${obj.role}`)} (${t("common:common.Thrive Scale")})`,
              module: "THRIVE_SCALE",
            })),

          ...(hasFosterShare
            ? roleListFS
                .filter((item) => item.id != 9)
                .map((obj) => ({
                  id: obj?.id + "FS",
                  id2: obj?.id,
                  label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,
                  module: "FOSTER_SHARE",
                }))
            : []),
        ]);

        if (values?.user_role.length && !hasFosterShare) {
          setFieldValue(
            "user_role",
            values?.user_role?.filter((role) => role?.module === "THRIVE_SCALE")
          );
        }

        if (roles?.length - 2 === values?.user_role?.length) {
          setFieldValue("user_role", [
            ...roleListHT
              .filter((item) => item.id != 9)
              .map((obj) => ({
                id: obj?.id + "HT",
                id2: obj?.id,
                label: `${t(`common:common.${obj.role}`)} (${t("common:common.Thrive Scale")})`,
                module: "THRIVE_SCALE",
              })),
            ...(hasFosterShare
              ? roleListFS
                  .filter((item) => item.id != 9)
                  .map((obj) => ({
                    id: obj?.id + "FS",
                    id2: obj?.id,
                    label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,
                    module: "FOSTER_SHARE",
                  }))
              : []),
          ]);
        }
      } else {
        setRoles([
          {
            id: -1,
            label: <Box p>{t("common:system messages.Select all roles")}</Box>,
          },
          { id: -2, label: <Box p>{t("common:system messages.Deselect all roles")}</Box> },

          // Conditionally include roles from roleListHT
          ...roleListHT
            .filter((item) => item.id != 9)
            .map((obj) => ({
              id: obj?.id + "HT",
              id2: obj?.id,
              label: `${t(`common:common.${obj.role}`)} (${t("common:common.Thrive Scale")})`,
              module: "THRIVE_SCALE",
            })),
          ...(!hasFosterShare
            ? roleListFS
                .filter((item) => item.id != 9)
                .map((obj) => ({
                  id: obj?.id + "FS",
                  id2: obj?.id,
                  label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,
                  module: "FOSTER_SHARE",
                }))
            : []),
        ]);
        if (values?.user_role.length && !hasFosterShare) {
          setFieldValue(
            "user_role",
            values?.user_role?.filter((role) => role?.module === "THRIVE_SCALE")
          );
        }
        if (roles?.length - 2 === values?.user_role?.length) {
          setFieldValue("user_role", [
            ...roleListHT
              .filter((item) => item.id != 9)
              .map((obj) => ({
                id: obj?.id + "HT",
                id2: obj?.id,
                label: `${t(`common:common.${obj.role}`)} (${t("common:common.Thrive Scale")})`,
                module: "THRIVE_SCALE",
              })),
            ...(!hasFosterShare
              ? roleListFS
                  .filter((item) => item.id != 9)
                  .map((obj) => ({
                    id: obj?.id + "FS",
                    id2: obj?.id,
                    label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,
                    module: "FOSTER_SHARE",
                  }))
              : []),
          ]);
        }
      }
    } else {
      setRoles([
        {
          id: -1,
          label: <Box p>{t("common:system messages.Select all roles")}</Box>,
        },
        { id: -2, label: <Box p>{t("common:system messages.Deselect all roles")}</Box> },

        ...roleListHT
          .filter((item) => item.id != 9)
          .map((obj) => ({
            id: obj?.id + "HT",
            id2: obj?.id,
            label: `${t(`common:common.${obj.role}`)} (${t("common:common.Thrive Scale")})`,
            module: "THRIVE_SCALE",
          })),

        ...roleListFS
          .filter((item) => item.id != 9)
          .map((obj) => ({
            id: obj?.id + "FS",
            id2: obj?.id,
            label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,
            module: "FOSTER_SHARE",
          })),
      ]);
      if (roles?.length - 2 === values?.user_role?.length) {
        setFieldValue("user_role", [
          ...roleListHT
            .filter((item) => item.id != 9)
            .map((obj) => ({
              id: obj?.id + "HT",
              id2: obj?.id,
              label: `${t(`common:common.${obj.role}`)} (${t("common:common.Thrive Scale")})`,
              module: "THRIVE_SCALE",
            })),
          ...roleListFS
            .filter((item) => item.id != 9)
            .map((obj) => ({
              id: obj?.id + "FS",
              id2: obj?.id,
              label: `${t(`common:common.${obj.role}`)} (${t("common:common.FosterShare")})`,             
              module: "FOSTER_SHARE",
            })),
        ]);
      }
    }
  }, [values?.org_location, values?.org_location_condition]);

  const previewClickHandler = (data) => {
    let params = createParams(data);
    setMessageDetailsForEditing({ ...initialValuesForEditing, ...params });
    onNextPage(params);
    setActiveStepperIndex(2);
  };

  const createParams = (data) => {
    let params = {
      receipientType: data?.recipientsType,
      receipientMatchingConditions:
        data?.recipientsType === "ALL"
          ? null
          : {
              account:
                data?.org_name_condition === "IS"
                  ? {
                      is:
                        data?.org_name?.length === organizations?.length - 2
                          ? []
                          : data?.org_name?.map((obj) => obj.id),
                    }
                  : {
                      isNot:
                        data?.org_name?.length === organizations?.length - 2
                          ? []
                          : data?.org_name?.map((obj) => obj.id),
                    },
              userRole:
                data?.user_role_condition === "IS"
                  ? {
                      is:
                        data?.user_role?.length === roles?.length - 2
                          ? {
                              FSUserRoleId: [],
                              HTUserRoleId: [],
                            }
                          : {
                              FSUserRoleId: data?.user_role?.filter?.(
                                (role) => role?.module === "FOSTER_SHARE"
                              )?.length
                                ? data?.user_role
                                    ?.filter?.(
                                      (role) => role?.module === "FOSTER_SHARE"
                                    )
                                    ?.map((obj) => obj.id2)
                                : null,

                              HTUserRoleId: data?.user_role?.filter?.(
                                (role) => role?.module === "THRIVE_SCALE"
                              )?.length
                                ? data?.user_role
                                    ?.filter?.(
                                      (role) => role?.module === "THRIVE_SCALE"
                                    )
                                    ?.map((obj) => obj.id2)
                                : null,
                            },
                    }
                  : {
                      isNot:
                        data?.user_role?.length === roles?.length - 2
                          ? {
                              FSUserRoleId: [],
                              HTUserRoleId: [],
                            }
                          : {
                              FSUserRoleId: data?.user_role?.filter?.(
                                (role) => role?.module === "FOSTER_SHARE"
                              )?.length
                                ? data?.user_role
                                    ?.filter?.(
                                      (role) => role?.module === "FOSTER_SHARE"
                                    )
                                    ?.map((obj) => obj.id2)
                                : null,

                              HTUserRoleId: data?.user_role?.filter?.(
                                (role) => role?.module === "THRIVE_SCALE"
                              )?.length
                                ? data?.user_role
                                    ?.filter?.(
                                      (role) => role?.module === "THRIVE_SCALE"
                                    )
                                    ?.map((obj) => obj.id2)
                                : null,
                            },
                    },
              accountCountry:
                data?.org_location_condition === "IS"
                  ? {
                      is:
                        data?.org_location?.length === locations?.length - 2
                          ? []
                          : data?.org_location?.map((obj) => obj.id),
                    }
                  : {
                      isNot:
                        data?.org_location?.length === locations?.length - 2
                          ? []
                          : data?.org_location?.map((obj) => obj.id),
                    },
              viewingFrom: data?.platform,
            },
    };
    return params;
  };

  return (
    <>
      <Heading heading={t("common:system messages.Recipients")} my={3} />
      <form>
        <FormControl component="fieldset">
          <FormLabel id="message-type">
            {/* <BodyText
              value="Who should receive this message?"
              color="#F37123"
              mb
            /> */}
            <SubHeading value={t("common:system messages.Who should receive this message?")} my />
          </FormLabel>
          <RadioGroup
            aria-labelledby="message-type"
            // defaultValue="1"
            value={values?.recipientsType}
            name="radio-buttons-group"
            // sx={{ gap: 3 }}
            onChange={handleChange}
          >
            {RecipientsTypes.map((msg) => (
              <FormControlLabel
                value={msg?.id}
                control={<Radio />}
                sx={{ alignItems: "start", my: "10px" }}
                name="recipientsType"
                label={
                  <Box mt>
                    <Typography fontWeight={600} fontSize="1rem">
                      {msg.type}
                    </Typography>
                    <Typography
                      fontWeight={400}
                      color="#778791"
                      fontSize="1rem"
                    >
                      {msg.label}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>

        {values?.recipientsType == "CUSTOM" && (
          <>
            <Divider variant="middle" sx={{ my: 3, mx: 0 }} />

            <SubHeading value={t("common:system messages.Show message where")} mb />
            <Box display="flex" flexDirection="column" gap={3}>
              {/* <CustomRecipientCondition
              label={"Organization’s location"}
              options={locations}
              subLabel="Select location"
            /> */}

              <CustomRecipientCondition
                id="org_location"
                label={t("common:system messages.Organization location")}
                options={locations}
                subLabel={t("common:system messages.Select location")}
                allSelectShowText={t("common:system messages.Any location")}
                onConditionChange={(value) =>
                  setFieldValue(`org_location_condition`, value)
                }
                onValueChange={(value) => setFieldValue(`org_location`, value)}
                data={values?.org_location}
                condition={values?.org_location_condition}
                disabled={isIndia}
                error={touched?.org_location && Boolean(errors?.org_location)}
                helperText={touched?.org_location && errors?.org_location}
              />
              <CustomRecipientCondition
                id="org_name"
                label={t("common:system messages.Organization name")}
                options={organizations}
                subLabel={t("common:system messages.Select organizations")}
                allSelectShowText={t("common:system messages.Send to all organizations")}
                onConditionChange={(value) =>
                  setFieldValue(`org_name_condition`, value)
                }
                onValueChange={(value) => setFieldValue(`org_name`, value)}
                data={values?.org_name}
                condition={values?.org_name_condition}
                error={touched?.org_name && Boolean(errors?.org_name)}
                helperText={touched?.org_name && errors?.org_name}
              />

              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle1">
                  {t("common:system messages.User is viewing from")}
                </Typography>
                <Autocomplete
                  id="platform"
                  value={values?.platform}
                  disableClearable
                  sx={{ width: 500 }}
                  // required={true}
                  options={[t("common:system messages.WEB"), t("common:system messages.MOBILE"), t("common:system messages.BOTH web and mobile application")]}
                  getOptionLabel={(option) =>
                    option === t("common:system messages.BOTH web and mobile application")
                      ? t("common:system messages.BOTH web and mobile application")
                      : convertUnderscoreToText(option)
                  }
                  isOptionEqualToValue={(option, value) => {
                    return Object.is(
                      JSON.stringify(option),
                      JSON.stringify(value)
                    );
                  }}
                  onChange={(_, newValue) =>
                    setFieldValue("platform", newValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("common:system messages.Select platform")}
                      required
                      error={touched?.platform && Boolean(errors?.platform)}
                      helperText={touched?.platform && errors?.platform}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderWidth: values?.platform ? "1.5px" : undefined,
                            borderColor: values?.platform
                              ? "#34475D"
                              : undefined,
                          },
                          "&:hover fieldset": {
                            borderWidth: values?.platform ? "1.5px" : undefined,
                            // borderColor: values?.platform
                            //   ? "#34475D"
                            //   : undefined,
                          },
                          "&.Mui-focused fieldset": {
                            borderWidth: values?.platform ? "1.5px" : undefined,
                            // borderColor: values?.platform
                            //   ? "#34475D"
                            //   : undefined,
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>

              <CustomRecipientCondition
                id="user_role"
                label={t("common:system messages.User role")}
                options={roles}
                subLabel={t("common:system messages.Select user role")}
                allSelectShowText={t("common:system messages.Any user role")}
                onConditionChange={(value) =>
                  setFieldValue(`user_role_condition`, value)
                }
                onValueChange={(value) => setFieldValue(`user_role`, value)}
                data={values?.user_role}
                condition={values?.user_role_condition}
                error={touched?.user_role && Boolean(errors?.user_role)}
                helperText={touched?.user_role && errors?.user_role}
              />
              {/* <CustomRecipientCondition
              label={"User role"}
              form={form}
              options={organizations}
              subLabel="Select user role"
              conditionFor="user_role"
            /> */}
            </Box>
          </>
        )}

        <Divider variant="" sx={{ my: 2, mx: -4 }} />

        <Box display="flex" pt={1} justifyContent="space-between" gap={2}>
          <Button
            id="cancel"
            sx={{ borderRadius: "4px", height: "48px", color: 'black' }}
            variant="text"
            onClick={() => {
              cancelClickHandler();
            }}
          >
            {t("common:common.Cancel")}
          </Button>
          <Box display="flex" justifyContent="end" gap={2}>
            <Button
              id="previous"
              startIcon={<ArrowLeftIcon />}
              sx={{ borderRadius: "4px", height: "48px", color: 'black', borderColor: 'black' }}
              variant="outlined"
              onClick={() => {
                setFieldValue("mode", "previous");
                handlePreviousPageHandler();
              }}
            >
              {t("common:system messages.Previous Details")}
            </Button>
            <Button
              id="cancel"
              sx={{ borderRadius: "4px", height: "48px", color: 'black', borderColor: 'black' }}
              variant="outlined"
              onClick={() => {
                setFieldValue("mode", "draft");
                handleSubmit();
              }}
            >
              {t("common:system messages.Save draft")}
            </Button>
            <Button
              id="add recipients"
              endIcon={<ArrowRightIcon />}
              sx={{ borderRadius: "4px", height: "48px" }}
              variant="contained"
              onClick={() => {
                setFieldValue("mode", "preview");
                handleSubmit();
              }}
            >
              {t("common:system messages.Next Preview")}
            </Button>
          </Box>
        </Box>
      </form>
    </>
  );
};

export default Recipients;