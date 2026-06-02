import {
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
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import PopupMessageDetails from "./PopupMessageDetails";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import BellNotificationDetails from "./BellNotificationDetails";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import BannerDetails from "./BannerDetails";
import { useFormik } from "formik";
import * as Yup from "yup";

import RichTextEditor from "../RichTextEditor";
import Heading from "../../../components/Heading/Heading";
import SubHeading from "../../../components/SubHeading";
import BodyText from "../../../components/BodyText/BodyText";
import PrimaryButton from "../../../components/PrimaryButton/PrimaryButton";



const MessageDetails = ({
  setActiveStepperIndex,
  onNextPage,
  onSubmit,
  initialValuesForEditing,
  cancelClickHandler,
  setMessageDetailsForEditing,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const MessageTypes = [
    {
      id: "1",
      type: t("common:system messages.Popup dialog"),
      label:t("common:system messages.Popup dialog description")
      },
    // {
    //   id: "2",
    //   type: t("common:system messages.Bell notification"),

    //   label:
    //     "Send users a message through the app’s notification system.They will receive an indicator on the bell in the top right corner. Ideal for longer messages that do not expire.",
    // },
    {
      id: "3",
      type: t("common:system messages.Banner message"),
      label:t("common:system messages.Banner message description")
      },
  ];

  const validationSchema = Yup.object().shape({
    messageSubject: Yup.string()
      .required(t("common:warnings.Message subject is required"))
      .when("messageType", {
        is: "3",
        then: Yup.string().max(25, t("common:warnings.Content must be at most 25 characters")),
        otherwise: Yup.string().max(
          50,
          t("common:warnings.Content must be at most 50 characters")
        ),
      }),
    messageContent: Yup.string().when("messageType", {
      is: "3",
      then: Yup.string()
        .test(
          "max-characters",
          t("common:warnings.Content must be at most 250 characters"),
          (value) => {
            const plainText = value
              ? value
                  .replace(/<\/?[^>]+(>|$)/g, "")
                  .replace(/\n/g, "")
                  .trim()
              : "";
            return plainText.length <= 250;
          }
        )
        .test(
          "required",
          t("common:warnings.Message content is required"),
          (value) => {
            const plainText = value
              ? value.replace(/<\/?[^>]+(>|$)/g, "").trim()
              : "";
            return plainText.length > 0;
          }
        ),
      otherwise: Yup.string()
        .test(
          "max-characters",
          t("common:warnings.Content must be at most 500 characters"),
          (value) => {
            const plainText = value
              ? value
                  .replace(/<\/?[^>]+(>|$)/g, "")
                  .replace(/\n/g, "")
                  .trim()
              : "";
            return plainText.length <= 500;
          }
        )
        .test(
          "required",
          t("common:warnings.Message content is required"),
          (value) => {
            const plainText = value
              ? value.replace(/<\/?[^>]+(>|$)/g, "").trim()
              : "";
            return plainText.length > 0;
          }
        ),
    }),
    buttonLabel: Yup.string()
      .max(20, t("common:warnings.Label must be at most 20 characters"))
      .when("addActionEnabled", {
        is: (val) => val,
        then: (schema) => schema.required(t("common:warnings.Required")),
        otherwise: (schema) => schema.nullable(),
      }),

    buttonUrl: Yup.string()
      .url(t("common:warnings.Invalid URL"))
      .max(255)
      .when("addActionEnabled", {
        is: (val) => val,
        then: (schema) => schema.required(t("common:warnings.URL is required")),
        otherwise: (schema) => schema.nullable(),
      }),
    startsAt: Yup.date()
      .required(t("common:warnings.Starts at is required"))
      .typeError(t("common:warnings.Starts at is required"))
      .nullable()
      .when("messageStatus", {
        is: (status) => {
          return status === "DRAFT";
        },
        then: Yup.date().typeError(t("common:warnings.Starts at is required")).test(
          "is-future",
          t("common:warnings.Past dates are not allowed"),
          (date) => {
            const selectedDate = new Date(date)?.getTime();
            const now = new Date().getTime();
            return selectedDate >= now;
          }
        ),
        otherwise: Yup.date().typeError(t("common:warnings.Starts at is required")), // No additional test if status is 'draft'
      }),
    endsAt: Yup.date()
      .required(t("common:warnings.Ends at is required"))
      .typeError(t("common:warnings.Ends at is required"))
      .nullable()
      .when("startsAt", (startsAt, schema) => {
        return schema.test({
          name: "is-date-after-starts at",
          exclusive: true,
          message: t("common:warnings.Ends at must be after starts at"),
          test: function (endsAt) {
            if (!startsAt || !endsAt) {
              return true;
            }

            // Compare the dates
            return endsAt >= startsAt;
          },
        });
      }),
    messageFreqAdditionalInfo: Yup.array().when("messageFrequency", {
      is: (messageFrequency) =>
        messageFrequency && messageFrequency === "ON_CERTAIN_DAYS",
      then: Yup.array().min(1, "At least one day is required"),
      otherwise: Yup.array(),
    }),
  });

  const initialValues = {
    messageStatus: initialValuesForEditing?.messageStatus ?? "DRAFT",
    messageType: initialValuesForEditing?.MPSystemMessageTypeId ?? "1",
    messageSubject: initialValuesForEditing?.subject ?? "",
    messageContent: initialValuesForEditing?.content ?? "",
    addActionEnabled: !!initialValuesForEditing?.availableActions?.length,
    buttonLabel: initialValuesForEditing?.availableActions?.[0]?.label ?? "",
    buttonUrl: initialValuesForEditing?.availableActions?.[0]?.link ?? "",
    messageFrequency: initialValuesForEditing?.messageFrequency ?? "ONCE",
    startsAt: initialValuesForEditing?.startDateTime ?? null,
    endsAt: initialValuesForEditing?.endDateTime ?? null,
    messageFreqAdditionalInfo:
      initialValuesForEditing?.messageFreqAdditionalInfo ?? [
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT",
        "SUN",
      ],
  };
  const form = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    validateOnChange: true,
    // onSubmit: (values) => handleSubmitHandler(values),
    onSubmit: (value) => {
      if (value?.mode === "draft") saveAsDraft(value);
      else handleSubmitHandler(value);
    },
    enableReinitialize: true,
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
  // useEffect(() => {
  //   if (values?.messageType === "1") setFieldValue("messageFrequency", "ONCE");
  //   else setFieldValue("messageFrequency", "ALWAYS");
  // }, [values?.messageType]);

  useEffect(() => {
    const el = document.querySelector(".Mui-error, [data-error]");
    (el?.parentElement ?? el)?.scrollIntoView();
    (el?.parentElement ?? el)?.focus();
  }, [isSubmitting]);

  const RenderMessageDetails = () => {
    switch (values?.messageType) {
      case "1":
        return <PopupMessageDetails form={form} />;
      case "2":
        return <BellNotificationDetails form={form} />;

      case "3":
        return <BannerDetails form={form} />;
      default:
        break;
    }
  };

  const saveAsDraft = async (values) => {
    await onNextPage(values);
    onSubmit("DRAFT", values);
  };

  const handleSubmitHandler = (values) => {
    setMessageDetailsForEditing({
      ...initialValuesForEditing,
      MPSystemMessageTypeId: values?.messageType,
      subject: values?.messageSubject,
      content: values?.messageContent,
      availableActions: values?.addActionEnabled
        ? [{ label: values?.buttonLabel, link: values?.buttonUrl }]
        : [],
      messageFrequency: values?.messageFrequency,
      startDateTime: values?.startsAt,
      endDateTime: values?.endsAt,
      messageFreqAdditionalInfo: values?.messageFreqAdditionalInfo,
    });
    setActiveStepperIndex(1);
    onNextPage(values);
  };

  return (
    <>
      <Heading heading={t("common:system messages.Details about this message")} my={3} />
      <SubHeading value={t("common:system messages.What type of message do you want to publish?")} mb />

      <FormControl component="fieldset">
        <FormLabel id="message-type">
          <BodyText
            value={t("common:system messages.How do I choose a message type?")}
            color="#F37123"
            mb
          />
        </FormLabel>
        <RadioGroup
          aria-labelledby="message-type"
          // defaultValue="1"
          value={values?.messageType}
          name="radio-buttons-group"
          // sx={{ gap: 3 }}
          onChange={handleChange}
        >
          {MessageTypes.map((msg) => (
            <FormControlLabel
              value={msg?.id}
              control={<Radio />}
              sx={{ alignItems: "start", my: "10px" }}
              name="messageType"
              label={
                <Box mt>
                  <Typography fontWeight={600} fontSize="1rem">
                    {msg.type}
                  </Typography>
                  <Typography fontWeight={400} color="#778791" fontSize="1rem">
                    {msg.label}
                  </Typography>
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Divider variant="middle" sx={{ my: 3, mx: 0 }} />

      <SubHeading value={t(`common:system messages.What should this message say?`)} mb />

      <Box display="flex" flexDirection="column" gap={3}>
        <TextField
          id="message-subject"
          error={Boolean(touched?.messageSubject && errors?.messageSubject)}
          fullWidth
          helperText={
            <Box display="flex" justifyContent="space-between">
              {touched?.messageSubject && errors?.messageSubject}
              <Box display="flex" justifyContent="end" flexGrow={1}>
                <Typography fontSize="0.75rem">
                  {values?.messageSubject.trim()?.length}/
                  {values?.messageType === "3" ? 25 : 50}
                </Typography>
              </Box>
            </Box>
          }
          label={t("common:system messages.Message subject line")}
          name="messageSubject"
          onBlur={handleBlur}
          onChange={handleChange}
          required
          value={values?.messageSubject}
          variant="outlined"
        />
        <RichTextEditor
          name="messageContent"
          id="message-content"
          value={values.messageContent}
          onChange={(content) => setFieldValue("messageContent", content)} // Correctly update Formik's state
          handleBlur={handleBlur} // Pass Formik's handleBlur directly
          helperText={touched.messageContent && errors.messageContent} // Display helper text if there's an error
          error={Boolean(touched.messageContent && errors.messageContent)} // Pass the error status
          maxLength={values?.messageType === "3" ? 250 : 500}
        />
      </Box>
      <Divider variant="middle" sx={{ my: 3, mx: 0 }} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {RenderMessageDetails()}
      </LocalizationProvider>
      <Divider variant="" sx={{ my: 2, mx: -4 }} />
      <Box display="flex" pt justifyContent="space-between" gap={2}>
        <Button
          id="cancel"
          sx={{ borderRadius: "4px", height: "48px" }}
          variant="outlined"
          onClick={() => {
            cancelClickHandler();
          }}
        >
          {t("common:common.Cancel")}
        </Button>
        <Box display="flex" justifyContent="end" gap={2}>
          <Button
            id="draft"
            sx={{ borderRadius: "4px", height: "48px" }}
            variant="outlined"
            onClick={() => {
              // saveAsDraft(values);
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
              // saveAsDraft(values);
              setFieldValue("mode", "recipients");
              handleSubmit();
            }}
          >
            {t("common:system messages.Next Recipients")}
          </Button>
          {/* <PrimaryButton
            label={t("common:system messages.Next Recipients")}
            onClick={handleSubmit}
            id="add recipients"
            endIcon={<ArrowRightIcon />}
          /> */}
        </Box>
      </Box>
    </>
  );
};

export default MessageDetails;