import { Box, Button, Chip, TextField, Autocomplete } from "@mui/material";
import { useFormik } from "formik";
import React, { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PhoneNumberUtil } from "google-libphonenumber";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import APIS from "../../../common/hooks/UseApiCalls";
import Loader from "../../../components/UserComponents/Loader";
import { SUPER_ADMIN } from "../../../helpers/constant";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { ModalService } from "../../../components/Modal";
import { PhoneTextInput } from "../../../components/PhoneTextInput/PhoneTextInput";
import { validatePhoneNumber } from "../../../helpers/helperFunction";
import { useTranslation } from "react-i18next";

const phoneUtil = PhoneNumberUtil.getInstance();

const ManageSupportServicesForm = ({
  close,
  onSuccess,
  supportServiceDetail = null,
}) => {

    const { t } = useTranslation(["common"]); 
  const [loading, setLoading] = useState(false);
  const { signedinUserRoleFS, organizationList } =
    useContext(CommonDataContext);
  const phoneRef = useRef();
  organizationList.find(
    (agency) => agency?.id === supportServiceDetail?.TWAccountId,
  );

  const [typeFilter, setTypeFilter] = useState(
    supportServiceDetail
      ? organizationList.find(
          (agency) => agency?.id === supportServiceDetail?.TWAccountId,
        )
      : organizationList?.filter((option) =>
          ["FOSTER_SHARE", "BOTH"].includes(option.accessType),
        )[0],
  );
  const initialValues = {
    supportServiceName: supportServiceDetail?.name || "",
    description: supportServiceDetail?.description || "",
    phone: supportServiceDetail?.phoneNumber || "",
    email: supportServiceDetail?.email || "",
    websiteLink: supportServiceDetail?.website || "",
  };

  const validationSchema = Yup.object().shape({
    supportServiceName: Yup.string()
      .max(255)
      .required("Please provide a title"),
    description: Yup.string().max(255).required("Please provide a description"),
    phone: Yup.string().test(
      "phone-format-validation",
      "Invalid Phone number",
      (value) => validatePhoneNumber(value, phoneRef),
    ),
    email: Yup.string().email(),
    websiteLink: Yup.string().url("Invalid").nullable(),
  });

  const formik = useFormik({
    validationSchema: validationSchema,
    initialValues: initialValues,
    onSubmit: (values) => handleSubmitHandler(values),
  });

  const {
    touched,
    errors,
    handleBlur,
    handleChange,
    values,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = formik;

  useEffect(() => {
    const el = document.querySelector(".Mui-error, [data-error]");
    (el?.parentElement ?? el)?.scrollIntoView();
    (el?.parentElement ?? el)?.focus();
  }, [isSubmitting]);

  const handleSubmitHandler = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data?.supportServiceName,
        description: data?.description,
        email: data?.email,
        phoneNumber:
          "+" + phoneRef.current.dialCode === values?.phone
            ? null
            : values?.phone,
        website: data?.websiteLink,
        accountId: [SUPER_ADMIN].includes(signedinUserRoleFS)
          ? typeFilter?.id
          : localStorage.getItem("orgId"),
      };
      let res;
      if (supportServiceDetail?.id) {
        payload.id = supportServiceDetail?.id;
        res = await APIS.UpdateSupportService(payload);
      } else {
        res = await APIS.CreateSupportService(payload);
      }

      if (res?.data) {
        toast.success(res?.data?.message);
        setLoading(false);
        onSuccess();
        close();
      }
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  const cancelClickHandler = () => {
    ModalService.open(() => <></>, {
      modalTitle: t("common:common.Unsaved Changes", "Unsaved Changes"),
      width: "40%",
      modalDescription:
        t("common:common.If you leave this page, any changes you have made will be lost", "If you leave this page, any changes you have made will be lost"),
      actionButtonText: t("common:common.Leave page", "Leave page"),
      cancelButtonText: t("common:common.Cancel", "Cancel"),
      onClick: () => close(),
    });
  };

  return (
    <>
      <Loader loading={loading}></Loader>
      <Box mx={-2}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            overflowY: "auto", // 'auto' will add a scrollbar when needed
            maxHeight: "70vh", // Set a maximum height to limit the scrollable area
          }}
          p={2}
        >
          <TextField
            id="support-service-name"
            error={Boolean(
              touched?.supportServiceName && errors?.supportServiceName,
            )}
            fullWidth
            helperText={
              touched?.supportServiceName && errors?.supportServiceName
            }
            label={t("common:infoCard.Support service name", "Support service name")}
            name="supportServiceName"
            onBlur={handleBlur}
            onChange={handleChange}
            required
            value={values?.supportServiceName}
            variant="outlined"
          />
          <TextField
            id="description"
            error={Boolean(touched?.description && errors?.description)}
            fullWidth
            helperText={touched?.description && errors?.description}
            label={t("common:common.Description", "Description")}
            name="description"
            onBlur={handleBlur}
            onChange={handleChange}
            required
            value={values?.description}
            variant="outlined"
            multiline
            rows={3}
          />
          <PhoneTextInput
            name={"phone"}
            error={Boolean(touched?.phone && errors?.phone)}
            helperText={touched?.phone && errors?.phone}
            value={values.phone}
            onChange={(phone) => setFieldValue(`phone`, phone)}
            required
            onBlur={handleBlur}
            phoneRef={phoneRef}
          />
          <TextField
            id="email"
            error={Boolean(touched?.email && errors?.email)}
            fullWidth
            helperText={touched?.email && errors?.email}
            label={t("common:infoCard.Email", "Email")}
            name="email"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values?.email}
            variant="outlined"
          />
          <TextField
            id="website-link"
            error={Boolean(touched?.websiteLink && errors?.websiteLink)}
            fullWidth
            helperText={touched?.websiteLink && errors?.websiteLink}
            label={t("common:common.Website Link", "Website link")}
            name="websiteLink"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values?.websiteLink}
            variant="outlined"
          />
          {[SUPER_ADMIN].includes(signedinUserRoleFS) && (
            <>
              <Box>
                <Autocomplete
                  id="checkboxes-tags-demo"
                  name="organization_name"
                  options={organizationList.filter((option) =>
                    ["FOSTER_SHARE", "BOTH"].includes(option.accessType),
                  )}
                  disableClearable
                  getOptionLabel={(option) => option?.accountName || ""}
                  value={typeFilter || null}
                  onChange={(event, newValue) => {
                    setTypeFilter(newValue);
                  }}
                  required
                  sx={{ width: 1 }}
                  renderTags={(value, getTagProps) => {
                    const numTags = value?.length;
                    return (
                      <Chip
                        color="primary"
                        key={value}
                        label={
                          value?.length < 2
                            ? value
                                .slice(0, 1)
                                .map((option) => option?.accountName)
                                .join(", ")
                            : numTags > 1 && `${numTags}`
                        }
                        size="medium"
                        sx={{
                          backgroundColor: "#1D334B",
                          borderRadius: "16px",
                          mr: 1,
                          maxWidth: "70%",
                        }}
                        onDelete={() => setTypeFilter([])}
                        deleteIcon={<CloseIcon style={{ fontSize: "17px" }} />}
                      />
                    );
                  }}
                  renderOption={(props, option) => (
                    <li {...props}>{option?.accountName}</li>
                  )}
                  renderInput={(params) => {
                    const selectedCount = typeFilter?.length;
                    const inputProps = {
                      ...params.InputProps,
                    };
                    return (
                      <TextField
                        {...params}
                        label={t("common:common.Organization", "Organization")}
                        sx={{
                          width: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "3px",
                            backgroundColor: "white",
                          },
                        }}
                        error={
                          touched?.organization_name &&
                          Boolean(errors?.organization_name)
                        }
                        helperText={
                          touched?.organization_name &&
                          errors?.organization_name
                        }
                        textFieldProps={{
                          fullWidth: true,
                          borderRadius: "3px",
                          margin: "normal",
                          variant: "outlined",
                          label: "",
                          placeholder: "Select an account",
                        }}
                        placeholder={
                          selectedCount < 1 && "Select an organization" + "*"
                        }
                        variant="outlined"
                        InputProps={inputProps}
                      />
                    );
                  }}
                />
              </Box>
            </>
          )}
        </Box>
        <Box mt px={2} sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
          <Button
            sx={{ borderRadius: "4px" }}
            variant="outlined"
            onClick={cancelClickHandler}
          >
            {t("common:common.Cancel", "Cancel")}
          </Button>
          <Button
            sx={{ borderRadius: "4px" }}
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {t("common:assessment.Submit", "Submit")}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ManageSupportServicesForm;
