import {
  Box,
  Button,
  Chip,
  TextField,
  Autocomplete,
  Checkbox,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import APIS from "../../../../common/hooks/UseApiCalls";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Loader from "../../../../components/UserComponents/Loader";
import { SUPER_ADMIN } from "../../../../helpers/constant";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import CloseIcon from "@mui/icons-material/Close";
import { ModalService } from "../../../../components/Modal";
import { useTranslation } from "react-i18next";

const ResourceDetailForm = ({ close, onSuccess, ResourceDetail = null }) => {
  const { t } = useTranslation(["common"]);
  const [loading, setLoading] = useState(false);
  const [resourceList, setResourceList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { signedinUserRoleFS, organizationList } = useContext(CommonDataContext);

  const agencyList = [
    { id: null, accountName: "All", accessType: "FOSTER_SHARE" },
    ...organizationList,
  ];
  const [typeFilter, setTypeFilter] = useState(agencyList[0]);

  const actionList = [
    { id: true, value: t("common:common.Published", "Published") },
    { id: false, value: t("common:common.Draft", "Draft") },
  ];

  const initialValues = {
    title: ResourceDetail?.title || "",
    summary: ResourceDetail?.summary || "",
    categories: ResourceDetail?.categories || [],
    articleLink: ResourceDetail?.url || "",
    imageLink: ResourceDetail?.image || "",
    organization_name:
      agencyList.find((agency) => agency?.id === ResourceDetail?.TWAccountId) ||
      agencyList[0],
    action:
      actionList.find((action) => action?.id === ResourceDetail?.published) ||
      actionList[0],
  };

  const getResourceCategories = async () => {
    setIsLoading(true);
    const data = await APIS.GetResourceCategories({
      rowCount: 1000,
      pageNumber: 1,
    });
    let tempList = data?.data?.data || [];
    setResourceList(tempList);
    setIsLoading(false);
  };

  useEffect(() => {
    getResourceCategories();
  }, []);

  const validationSchema = Yup.object().shape({
    title: Yup.string().max(255).required(t("common:warnings.Title is required", "Title is required")),
    summary: Yup.string().required(t("common:warnings.This is a required field", "Summary is required")),
    articleLink: Yup.string().required(t("common:warnings.URL is required", "Article link is required")),
    imageLink: Yup.string().required(t("common:warnings.This is a required field", "Image link is required")),
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
        title: data?.title,
        url: data?.articleLink,
        published: data?.action?.id,
        summary: data?.summary,
        image: data?.imageLink,
        accountId: data?.organization_name?.id,
        userId: localStorage.getItem("username"),
        categoryIds: data?.categories?.map((item) => item.id),
      };
      let res;
      if (ResourceDetail?.id) {
        payload.id = ResourceDetail?.id;
        res = await APIS.UpdateResource(payload);
      } else {
        res = await APIS.CreateNewResource(payload);
      }

      if (res?.data) {
        toast.success(res?.data?.message);
        setLoading(false);
        onSuccess();
        close();
      }
    } catch (err) {
      setLoading(false);
      toast.error(t("common:common.Something went wrong", "Something went wrong"));
    }
  };

  const cancelClickHandler = () => {
    ModalService.open(() => <></>, {
      modalTitle: t("common:common.Unsaved Changes", "Unsaved Changes"),
      width: "30%",
      modalDescription: t(
        "common:common.If you leave this page, any changes you have made will be lost",
        "If you leave this page, any changes you have made will be lost"
      ),
      actionButtonText: t("common:common.Leave page", "Leave page"),
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
            gap: 1.5,
            overflowY: "auto",
            maxHeight: "70vh",
          }}
          p={2}
        >
          <TextField
            id="title"
            error={Boolean(touched?.title && errors?.title)}
            fullWidth
            helperText={touched?.title && errors?.title}
            label={t("common:resources.Title", "Title")}
            name="title"
            onBlur={handleBlur}
            onChange={handleChange}
            required
            value={values?.title}
            variant="outlined"
          />
          <TextField
            id="summary"
            error={Boolean(touched?.summary && errors?.summary)}
            fullWidth
            helperText={touched?.summary && errors?.summary}
            label={t("common:assessment.Summary", "Summary")}
            name="summary"
            onBlur={handleBlur}
            onChange={handleChange}
            required
            value={values?.summary}
            variant="outlined"
            multiline
            rows={3}
          />
          <TextField
            id="articleLink"
            error={Boolean(touched?.articleLink && errors?.articleLink)}
            fullWidth
            required
            helperText={touched?.articleLink && errors?.articleLink}
            label={t("common:common.Attach link", "Attach link")}
            name="articleLink"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values?.articleLink}
            variant="outlined"
          />
          <TextField
            id="imageLink"
            error={Boolean(touched?.imageLink && errors?.imageLink)}
            fullWidth
            required
            helperText={touched?.imageLink && errors?.imageLink}
            label={t("common:common.Image link", "Image link")}
            name="imageLink"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values?.imageLink}
            variant="outlined"
          />
          {resourceList && (
            <Autocomplete
              multiple
              id="categories"
              options={resourceList || []}
              clearIcon={true}
              disableCloseOnSelect
              limitTags={3}
              getOptionLabel={(option) => option?.name}
              value={values?.categories}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, newValue) => {
                setFieldValue("categories", newValue);
              }}
              sx={{ width: 1 }}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option?.name}
                </li>
              )}
              renderInput={(params) => {
                const selectedCount = values?.categories?.length;
                const inputProps = { ...params.InputProps };
                return (
                  <TextField
                    {...params}
                    label={t("common:resources.Categories", "Categories")}
                    sx={{
                      width: 1,
                      "& .MuiOutlinedInput-root": { borderRadius: "0px" },
                    }}
                    textFieldProps={{
                      fullWidth: true,
                      borderRadius: "0px",
                      margin: "normal",
                      variant: "outlined",
                      label: "",
                      placeholder: t("common:common.Select categories", "Select categories"),
                    }}
                    placeholder={selectedCount < 1 && t("common:common.Select categories","Select categories")}
                    variant="outlined"
                    InputProps={inputProps}
                  />
                );
              }}
            />
          )}
          {[SUPER_ADMIN].includes(signedinUserRoleFS) && (
            <>
              <Box>
                <Autocomplete
                  id="checkboxes-tags-demo"
                  name="organization_name"
                  options={agencyList?.filter((option) =>
                    ["FOSTER_SHARE", "BOTH"].includes(option.accessType)
                  )}
                  disableClearable
                  getOptionLabel={(option) => option?.accountName || ""}
                  value={values?.organization_name}
                  onChange={(event, newValue) => {
                    setFieldValue("organization_name", newValue);
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
                            ? value.slice(0, 1).map((option) => option?.accountName).join(", ")
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
                    const inputProps = { ...params.InputProps };
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
                        error={touched?.organization_name && Boolean(errors?.organization_name)}
                        helperText={touched?.organization_name && errors?.organization_name}
                        textFieldProps={{
                          fullWidth: true,
                          borderRadius: "3px",
                          margin: "normal",
                          variant: "outlined",
                          label: "",
                          placeholder: t("common:common.Select an account", "Select an account"),
                        }}
                        placeholder={
                          selectedCount < 1 &&
                          t("common:common.Select an organization", "Select an organization") + "*"
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
          <Autocomplete
            id="action"
            name="action"
            disableClearable
            value={values?.action}
            options={actionList}
            getOptionLabel={(option) => option.value}
            isOptionEqualToValue={(option, value) =>
              Object.is(JSON.stringify(option), JSON.stringify(value))
            }
            sx={{ width: 1 }}
            onChange={(_, newValue) => setFieldValue("action", newValue)}
            renderInput={(params) => (
              <TextField {...params} label={t("common:common.Action", "Action")} />
            )}
          />
        </Box>
        <Box mt sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
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

export default ResourceDetailForm;