import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from "yup";
import dayjs from 'dayjs';
import { Box, Grid } from "@mui/material";
import DynamicForm from '../../../views/TWFamily/ManageFamily/Components/DynamicForm';
import { EventsBasicDetails } from './EventsConfig';
import { useTranslation } from "react-i18next";
import SecondaryButton from '../../../components/SecondaryButton/SecondaryButton';
import PrimaryButton from '../../../components/PrimaryButton';

const ManageEventsForm = ({close, eventData}) => {
    console.log("CONFIG:", EventsBasicDetails());
      const { t } = useTranslation(["common"]);
    //   const onSubmit()  => {

    //   }
    
  return (
    <Formik
        enableReinitialize={true}
        validateOnBlur={true}
        validateOnChange={true}
        initialValues={{
            title: eventData?.title || "",
            description: eventData?.description || "",
            venue: eventData?.venue || "",
            streetAddress: eventData?.streetAddress || "",
            eventType: eventData?.eventType || "",
            date: eventData?.date || "",
            startTime: eventData?.startTime || "",
            endTime: eventData?.endTime || "",
            attachLink: eventData?.attachLink || ""
        }}
        validationSchema={Yup.object({
            title:Yup.string().required("Title is required").max(255, "Max 255 characters"),
            description:Yup.string().required("Description is required").max(1000, "Max 1000 characters"),
            venue:Yup.string().required("Venue is required").max(255, "Max 255 characters"),
            date:Yup.mixed().required("Date is required"),
            streetAddress:Yup.string().required("Street address is required").max(500, "Max 500 characters"),
            eventType:Yup.string().required("Event type is required"),
            startTime:Yup.mixed()
                .required("Start time is required")
                .test( "not-in-past", "Start date cannot be in the past",
                    function(value) {
                        if(!value) return true;
                        const today = dayjs().startOf("day");
                        const selected = dayjs(value);
                        return selected.isSame(today) || selected.isAfter(today);
                    }
                ),
            endTime:Yup.mixed()
                .required("End time is required")
                .test("end-after-start", " End date must be after start date",
                    function(endDate) {
                        const { startDate } = this.parent;
                        if(!startDate || !endDate) return true;

                        const start = dayjs(startDate);
                        const end = dayjs(endDate);

                        return end.isSame(start) || end.isAfter(start);
                    }
                ),
            attachLink:Yup.string().url("Enter a valid URL").nullable(),
        })}
        onSubmit={async(values, {setSubmitting}) => {
            try{

               const payload = {
                ...values,
                date: values.date? dayjs(values.date).format("YYYY-MM-DD") : "",
                startTime: values.startTime? dayjs(values.startTime).format("HH:mm"):"",
                endTime: values.endTime? dayjs(values.endTime).format("HH:mm") : "",
               };
               console.log(payload);
            //    await eventsApi.createEvent(payload);
                close();
            } catch(err){
                console.error(err);
            } finally {
                setSubmitting(false);
            }
        }}
    >
        {({values, handleChange, handleBlur, errors, touched, setFieldValue}) => {
            return(
            <Form id="add-child-form">
                <Box mx={-2}>
                <Box sx={{ maxHeight: "70vh", overflowY: "auto", px: 2 }}>
                    <Grid container spacing={2}>
                            <DynamicForm 
                                values={values}
                                errors={errors}
                                touched={touched}
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                setFieldValue={setFieldValue}
                                config={EventsBasicDetails()}
                            />
                        </Grid>
                        <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SecondaryButton
            label={t("common:common.No, Cancel", "No, Cancel")}
            fullWidth
            onClick={close}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PrimaryButton
            label={t("common:common.No, Cancel", "No, Cancel")}
            fullWidth
            // onClick={}
            type="submit"
          />
           
        </Grid>
      </Grid>
                    </Box>
                </Box>
            </Form>
        )}}
        
    </Formik>
  )
}

export default ManageEventsForm