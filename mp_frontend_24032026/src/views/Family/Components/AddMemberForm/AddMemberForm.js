// import React, { useState, useEffect } from "react";
// import * as Yup from "yup";
// import { Formik, Form } from "formik";
// import MenuItem from "@mui/material/MenuItem";
// import {
//   Box,
//   Button,
//   Card,
//   Grid,
//   TextField,
//   useTheme,
// } from "@mui/material";
// import { useTranslation } from "react-i18next";

// import { customerApi } from "../../../../__fakeApi__/customerApi";

// const AddMemberForm = (props) => {
//   const theme = useTheme();
//   const { t } = useTranslation(["common"]);
//   const [countryList, setCountryList] = useState([]);
//   const [stateList, setStateList] = useState([]);

//   useEffect(() => {
//     customerApi
//       .getLocations()
//       .then((res) => {
//         if (res && res.countries) {
//           setCountryList(res.countries);
//         }
//         if (res && res.states) {
//           setStateList(res.states);
//         }

//         if (res && res.cities) {
//           // setCityList(res.cities)
//         }
//       })
//       .catch((err) => {
//         console.log("err >>", err);
//       });
//     return () => {};
//   }, []);

//   return (
//     <Formik
//       initialValues={{
//         address1: "",
//         address2: "",
//         country: "",
//         child: "",
//         name: "",
//         phone: "",
//         state: "",
//         city: "",
//         zip_code: "",
//         submit: null,
//       }}
//       validationSchema={Yup.object().shape({
//         first_name: Yup.string().max(255),
//         second_name: Yup.string().max(255),
//         address1: Yup.string().max(255),
//         address2: Yup.string().max(255),
//         country: Yup.string().max(255),
//         city: Yup.string().max(255),
//         zip_code: Yup.string()
//           .required(t("common:warnings.Zipcode is required"))
//           .test(
//             "zip-format-validation",
//             t("common:warnings.Invalid ZIP code format"),
//             (value) => {
//               if (userRegion.toLowerCase() === "india") {
//                 return /^\d{6}$/.test(value);
//               } else {
//                 return /^\d{5}$/.test(value);
//               }
//             }
//           ),
//         email: Yup.string()
//           .email(t("common:warnings.Must be a valid email"))
//           .max(255),
//         organization_name: Yup.string()
//           .max(255)
//           .required(t("common:warnings.Organization name is required")),
//         state: Yup.string().max(255),
//       })}
//       onSubmit={async (
//         values,
//         { resetForm, setErrors, setStatus, setSubmitting }
//       ) => {
//         console.log("AddMemberForm submitted", values);
//       }}
//     >
//       {({
//         errors,
//         handleBlur,
//         handleChange,
//         handleSubmit,
//         isSubmitting,
//         touched,
//         values,
//         setFieldValue,
//       }) => (
//         <Form
//           onSubmit={handleSubmit}
//         >
//           <Card>
//             <Box sx={{ m: 2, mt: 3 }}>
//               <Grid container spacing={3}>
//                 <Grid item md={6} xs={12}>
//                   <TextField
//                     error={Boolean(touched.first_name && errors.first_name)}
//                     fullWidth
//                     helperText={touched.first_name && errors.first_name}
//                     label={t("common:common.Organization Name")}
//                     name="first_name"
//                     onBlur={handleBlur}
//                     onChange={handleChange}
//                     required
//                     select
//                     value={values.first_name}
//                     variant="outlined"
//                   >
//                     <MenuItem key={"1"} value={1}>
//                       {"Org Name"}
//                     </MenuItem>
//                   </TextField>
//                 </Grid>

//                 <Grid item md={6} xs={12}>
//                   <TextField
//                     error={Boolean(touched.address1 && errors.address1)}
//                     fullWidth
//                     helperText={touched.address1 && errors.address1}
//                     label={t("common:common.Address 1")}
//                     name="address1"
//                     onBlur={handleBlur}
//                     onChange={handleChange}
//                     value={values.address1}
//                     variant="outlined"
//                   />
//                 </Grid>

//                 <Grid item md={6} xs={12}>
//                   <TextField
//                     error={Boolean(touched.address2 && errors.address2)}
//                     fullWidth
//                     helperText={touched.address2 && errors.address2}
//                     label={t("common:common.Address 2")}
//                     name="address2"
//                     onBlur={handleBlur}
//                     onChange={handleChange}
//                     value={values.address2}
//                     variant="outlined"
//                   />
//                 </Grid>
//                 <Grid item md={6} xs={12}>
//                   <TextField
//                     error={Boolean(touched.country && errors.country)}
//                     fullWidth
//                     helperText={touched.country && errors.country}
//                     label={t("common:common.Country")}
//                     id="country"
//                     name="country"
//                     select
//                     onChange={handleChange}
//                     value={values.country}
//                     variant="outlined"
//                   >
//                     {countryList.map((item) => {
//                       return (
//                         <MenuItem key={item.id} value={item.id.toString()}>
//                           {item.countryName}
//                         </MenuItem>
//                       );
//                     })}
//                   </TextField>
//                 </Grid>
//                 <Grid item md={6} xs={12}>
//                   <TextField
//                     error={Boolean(touched.state && errors.state)}
//                     fullWidth
//                     helperText={touched.state && errors.state}
//                     label={t("common:common.State/Region")}
//                     name="state"
//                     select
//                     onBlur={handleBlur}
//                     onChange={handleChange}
//                     value={values.state}
//                     variant="outlined"
//                   >
//                     {stateList.map((item) => {
//                       return (
//                         <MenuItem key={item.id} value={item.id.toString()}>
//                           {item.stateName}
//                         </MenuItem>
//                       );
//                     })}
//                   </TextField>
//                 </Grid>
//                 <Grid item md={6} xs={12}>
//                   <TextField
//                     error={Boolean(touched.city && errors.city)}
//                     fullWidth
//                     helperText={touched.city && errors.city}
//                     label={t("common:common.City")}
//                     name="city"
//                     onBlur={handleBlur}
//                     onChange={handleChange}
//                     value={values.city}
//                     variant="outlined"
//                   />
//                 </Grid>
//                 <Grid item md={6} xs={12}>
//                   <NumberFormat
//                     customInput={TextField}
//                     error={Boolean(touched.zip_code && errors.zip_code)}
//                     fullWidth
//                     helperText={touched.zip_code && errors.zip_code}
//                     placeholder={
//                       userRegion.toLowerCase() === "india"
//                         ? "888888"
//                         : "88888-8888"
//                     }
//                     label={t("common:common.Zipcode")}
//                     name="zip_code"
//                     format={
//                       userRegion.toLowerCase() === "india" ? "######" : "#####"
//                     }
//                     type="text"
//                     required
//                     onBlur={handleBlur}
//                     onChange={(e) => {
//                       let zipCode = e.target.value.trim();
//                       setFieldValue("zip_code", zipCode);
//                     }}
//                     value={values.zip_code}
//                   />
//                 </Grid>
//               </Grid>
//               <Box sx={{ mt: 2, display: "flex", flexDirection: "row" }}>
//                 <Button
//                   color="primary"
//                   sx={{ width: 200 }}
//                   variant="contained"
//                   onClick={handleSubmit}
//                 >
//                   {t("common:family.Save Family")}
//                 </Button>

//                 <Button
//                   color="primary"
//                   sx={{ width: 200, ml: 21 }}
//                   disabled={isSubmitting}
//                   type="reset"
//                   variant="contained"
//                   style={{ backgroundColor: theme.palette.button.primary }}
//                 >
//                   {t("common:common.Reset")}
//                 </Button>
//               </Box>
//             </Box>
//           </Card>
//         </Form>
//       )}
//     </Formik>
//   );
// };

// export default AddMemberForm;
