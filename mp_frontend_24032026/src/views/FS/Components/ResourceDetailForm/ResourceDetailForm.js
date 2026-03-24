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

const ResourceDetailForm = ({ close, onSuccess, ResourceDetail = null }) => {
  const [loading, setLoading] = useState(false);
  const [resourceList, setResourceList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { signedinUserRoleFS, organizationList } =
    useContext(CommonDataContext);
  const agencyList = [
    { id: null, accountName: "All", accessType: "FOSTER_SHARE" },
    ...organizationList,
  ];
  const [typeFilter, setTypeFilter] = useState(agencyList[0]);
  const actionList = [
    { id: true, value: "Published" },
    { id: false, value: "Draft" },
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
    title: Yup.string().max(255).required("Title is required"),
    summary: Yup.string().required("Summary is required"),
    articleLink: Yup.string().required("Article link is required"),
    imageLink: Yup.string().required("Image link is required"),
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
      toast.error("Something went wrong");
    }
  };

  const cancelClickHandler = () => {
    ModalService.open(() => <></>, {
      modalTitle: "Unsaved Changes",
      width: "30%",
      modalDescription:
        "If you leave this page, any changes you have made will be lost",
      actionButtonText: "Leave page",
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
            overflowY: "auto", // 'auto' will add a scrollbar when needed
            maxHeight: "70vh", // Set a maximum height to limit the scrollable area
          }}
          p={2}
        >
          <TextField
            id="title"
            error={Boolean(touched?.title && errors?.title)}
            fullWidth
            helperText={touched?.title && errors?.title}
            label="Title"
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
            label="Summary"
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
            label="Attach link"
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
            label="Image link"
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
                const inputProps = {
                  ...params.InputProps,
                };

                return (
                  <TextField
                    {...params}
                    label={"Categories"}
                    sx={{
                      width: 1,
                      // ml: 1,

                      "& .MuiOutlinedInput-root": {
                        borderRadius: "0px",
                      },
                    }}
                    textFieldProps={{
                      fullWidth: true,
                      borderRadius: "0px",
                      margin: "normal",
                      variant: "outlined",
                      label: "",
                      placeholder: "Select categories",
                    }}
                    placeholder={selectedCount < 1 && "Select categories"}
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
                        label={"Organization"}
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
          <Autocomplete
            id="action"
            name="action"
            disableClearable
            value={values?.action}
            options={actionList}
            getOptionLabel={(option) => option.value}
            isOptionEqualToValue={(option, value) => {
              return Object.is(JSON.stringify(option), JSON.stringify(value));
            }}
            sx={{ width: 1 }}
            onChange={(_, newValue) => setFieldValue("action", newValue)}
            renderInput={(params) => <TextField {...params} label={"Action"} />}
          />
        </Box>
        <Box mt sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
          <Button
            sx={{ borderRadius: "4px" }}
            variant="outlined"
            onClick={cancelClickHandler}
          >
            {"Cancel"}
          </Button>
          <Button
            sx={{ borderRadius: "4px" }}
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ResourceDetailForm;
