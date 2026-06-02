import { Box, Button, Grid, TextField, Typography, Skeleton} from "@mui/material";
import { FieldArray, FormikProvider, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import APIS from "../../../../common/hooks/UseApiCalls";
import toast from "react-hot-toast";
import "react-international-phone/style.css";
import { PhoneNumberUtil } from "google-libphonenumber";
import "./AddChildForm.css";
import { useNavigate } from "react-router";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import { ModalService } from "../../../../components/Modal";
import { PhoneTextInput } from "../../../../components/PhoneTextInput/PhoneTextInput";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import Loader from "../../../../components/UserComponents/Loader";
import FSDeleteIcon from "../../../../assets/icons/FSDeleteIcon";


const phoneUtil = PhoneNumberUtil.getInstance();

const CareGiverForm = ({
  familyData,
  setIsCareGiverInfo,
  caregiverInfo,
  setCaregiverInfo,
  householdAndAgencyInfo,
  deletedCaregiverIds,
  setDeletedCaregiverIds
}) => {
  const { locationList } = useContext(CommonDataContext);
  const [isLoading, setIsLoading] = useState();
  const [isAddingCaregiver, setIsAddingCaregiver] = useState(false);
  const navigate = useNavigate();

  const emailValidationCache = new Map();
  const isEmailValidationRunning = new Map();

  const debouncedHandleCheckEmailExistence = 
    // function
    async (email,id) => {
      const res = await APIS.CheckUserEmailExists(email.toLowerCase(),id);
      if (res?.data?.message === "EMAIL_EXIST") {
        return false;
      } else {
        return true;
      }
    }

   // Function to validate duplicate emails in parents array
// function validateParentEmails(parentsArray) {
//     const emailToNames = {};
//     const errors = [];
    
//     parentsArray.forEach((parent, index) => {
//         const email = parent.email?.toLowerCase().trim();
//         const firstName = parent.firstName?.trim() || '';
//         const lastName = parent.lastName?.trim() || '';
//         const fullName = `${firstName} ${lastName}`.trim();
        
//         if (email) {
//             if (emailToNames[email]) {
//                 // Found duplicate email
//                 const existingName = emailToNames[email].name;
//                 const errorMessage = `Duplicate email ID '${email}' found for ${existingName} and ${fullName}. Each parent must have a unique email address.`;
                
//                 // Add error if not already present
//                 if (!errors.find(err => err.email === email)) {
//                     errors.push({
//                         email: email,
//                         message: errorMessage,
//                         indices: [emailToNames[email].index, index]
//                     });
//                 }
//             } else {
//                 emailToNames[email] = { name: fullName, index: index };
//             }
//         }
//     });
    
//     return {
//         isValid: errors.length === 0,
//         errors: errors
//     };
// }

const validateParentEmailOnBlur = async (
  index, 
  email, 
  allParents, 
  setFieldError, 
  setFieldTouched, 
  id
) => {
  // Mark field as touched first
  setFieldTouched(`parents.${index}.email`, true, false);

  // Skip if email is empty
  if (!email || !email?.trim()) {
    setFieldError(`parents.${index}.email`, undefined);
    return true;
  }

  const trimmedEmail = email?.toLowerCase()?.trim();
  const initialEmail = initialValues.parents?.[index]?.email?.toLowerCase()?.trim() || "";

  // Skip validation if email hasn't changed
  if (trimmedEmail === initialEmail) {
    setFieldError(`parents.${index}.email`, undefined);
    return true;
  }

  // Step 1: Check for duplicate emails locally
  let duplicateIndices = [];
  allParents?.forEach((parent, i) => {
    if (i !== index && parent.email?.toLowerCase()?.trim() === trimmedEmail) {
      duplicateIndices.push(i);
    }
  });

  if (duplicateIndices.length > 0) {
    const duplicateNames = duplicateIndices
      .map((dupIdx) => {
        const parent = allParents[dupIdx];
        const name = `${parent?.firstName || ""} ${parent?.lastName || ""}`.trim();
        return name || `Parent ${dupIdx + 1}`;
      })
      .join(", ");
    
    const errorMessage = `Duplicate email with ${duplicateNames}`;
    setFieldError(`parents.${index}.email`, errorMessage);
    return false;
  }

  // Check cache first
  if (emailValidationCache.has(trimmedEmail)) {
    const cachedResult = emailValidationCache.get(trimmedEmail);
    if (Date.now() - cachedResult.timestamp < 30000) {
      if (!cachedResult.isValid) {
        setFieldError(
          `parents.${index}.email`,
          "Email already associated with another user, please use a different email address."
        );
        return false;
      }
      setFieldError(`parents.${index}.email`, undefined);
      return true;
    }
  }

  // Prevent concurrent validations
  if (isEmailValidationRunning.has(trimmedEmail)) {
    try {
      return await isEmailValidationRunning.get(trimmedEmail);
    } catch (error) {
      return true;
    }
  }

  // Step 2: Check database
  try {
    const validationPromise = (async () => {
      const dbExists = await debouncedHandleCheckEmailExistence(trimmedEmail, id);
      
      // Cache the result
      emailValidationCache.set(trimmedEmail, {
        isValid: dbExists,
        timestamp: Date.now()
      });
      
      isEmailValidationRunning.delete(trimmedEmail);
      
      if (!dbExists) {
        setFieldError(
          `parents.${index}.email`,
          "Email already associated with another user, please use a different email address."
        );
        return false;
      }

      setFieldError(`parents.${index}.email`, undefined);
      return true;
    })();

    isEmailValidationRunning.set(trimmedEmail, validationPromise);
    return await validationPromise;
    
  } catch (error) {
    console.error("Error checking email:", error);
    isEmailValidationRunning.delete(trimmedEmail);
    setFieldError(`parents.${index}.email`, undefined);
    return true;
  }
};

  const validationSchema = Yup.object().shape({
    parents: Yup.array().of(
      Yup.object().shape({
        firstName: Yup.string().max(255,"First name cannot exceed 255 characters").required("First name is required"),
        lastName: Yup.string().max(255,"Last name cannot exceed 255 characters").required("Last name is required"),
        email: Yup.string()
          .email("Please enter a valid email address")
          .max(255)
          .required("Please enter a valid email address"),
          // .test(
          //   "email-name-unique",
          //   "This email address is already in use",
          //   async (email, context) => {
          //     try {
          //       if (
          //         email.length &&
          //         caregiverInfo?.parents?.[
          //           context?.options?.index
          //         ]?.email?.toLowerCase() !== email?.toLowerCase()
          //       ) {
          //         const debounceResponse =
          //           debouncedHandleCheckEmailExistence(email);
          //         return debounceResponse;
          //       }
          //       return true;
          //     } catch (error) {
          //       return false; // Handle parsing errors
          //     }
          //   }
          // ),
        phoneNumber: Yup.string()
          .required("Phone number is required")
          .test(
            "phone-format-validation",
            "Please enter a valid phone number",
            (value) => {
              try {
                const phoneNumber = phoneUtil.parseAndKeepRawInput(value);
                return phoneUtil.isValidNumber(phoneNumber);
              } catch (error) {
                return false; // Handle parsing errors
              }
            }
          ),
      })
    ),
  });

  const initialValues = {
    parents: caregiverInfo
      ? caregiverInfo.parents
      : [
          {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            occupation: "",
          },
        ],
  };

  const validate = async (values) => {
    const errors = {};
    const emailMap = {};
    values.parents.forEach((parent, idx) => {
      const email = parent.email?.toLowerCase().trim();
      if (email) {
        if (!emailMap[email]) emailMap[email] = [];
        emailMap[email].push(idx);
      }
    });

    // Duplicate email errors
    Object.entries(emailMap).forEach(([email, indices]) => {
      if (indices.length > 1) {
        const names = indices
          .map(i => `${values.parents[i]?.firstName || ""} ${values.parents[i]?.lastName || ""}`.trim() || `Parent ${i + 1}`)
          .join(", ");
        indices.forEach(i => {
          if (!errors.parents) errors.parents = [];
          errors.parents[i] = errors.parents[i] || {};
          errors.parents[i].email = `Duplicate email with ${names}`;
        });
      }
    });
    return errors;
  }

  const formik = useFormik({
    validationSchema: validationSchema,
    initialValues: initialValues,
    validate,
    onSubmit: (values) => handleSubmitHandler(values),
    validateOnChange: true,
    validateOnBlur: true
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
    setSubmitting,
    setFieldError,
  } = formik;

  useEffect(() => {
    const el = document.querySelector(".Mui-error, [data-error]");
    (el?.parentElement ?? el)?.scrollIntoView();
    (el?.parentElement ?? el)?.focus();
  }, [isSubmitting]);

  useEffect(() => {
    if (caregiverInfo?.parents) {
      setFieldValue("parents", caregiverInfo?.parents);
    } else {
      setFieldValue("parents", [
        {
          firstName: householdAndAgencyInfo.firstName,
          lastName: householdAndAgencyInfo.lastName,
          email: "",
          phoneNumber: "",
          occupation: "",
        },
      ]);
    }
  }, [caregiverInfo, householdAndAgencyInfo]);

  const UnlinkParentOnDeletion = async (parentIds) => {
  try {
    const payload = { parentIds: parentIds };
    const res = await APIS.UnlinkParentsFromFamily(payload);
    if (res?.status === 200) {
      const data = res?.data;
      return {
        success: true,
        message: data.message,
        unlinkedCount: data.data.unlinkedCount,
        unlinkedParentIds: data.data.unlinkedParentIds
      };
    } else {
      return {
        success: false,
        error: res?.data?.message || 'Failed to unlink parents',
      };
    }

  } catch (error) {
    console.error('Error unlinking parents:', error);
    return {
      success: false,
      error: error.message || 'Failed to unlink parents',
    };
  }
}


const UpdateTheFamilyAfterDeletion = async (parentIds) => {
  try {
    const payload = { parentIds: parentIds };
    const res = await APIS.UpdateFamilyAfterDeletion(payload);
    if (res?.status === 200) {
      const data = res?.data;
      return {
        success: true,
        message: data.message,
        unlinkedCount: data.deletedCount,
        unlinkedParentIds: data.deletedIds
      };
    } else {
      return {
        success: false,
        error: res?.data?.message || 'Failed to update family after deletion',
      };
    }
  } catch (error) {
    console.error('Error deleting parents:', error);
    return {
      success: false,
      error: error.message,
      code: error.code || 500
    };
  }
}

  const handleParentDeletion = async () => {
    //const parentIdsToDelete = ["parent-id-1", "parent-id-2", "parent-id-3"];

    const result = await deleteParentsWorkflow(deletedCaregiverIds);
    if (result.success) {
      console.log('Parents deleted successfully!');
    } else {
      console.error(`Failed to delete parents`);
    }
  }

const deleteParentsWorkflow = async (parentIds) => {
  // Step 1: Unlink parents from familie
  const unlinkResult = await UnlinkParentOnDeletion(parentIds);

  if (!unlinkResult.success) {
    return {
      success: false,
      step: 'unlink',
      error: unlinkResult.error
    };
  }

  // Step 2: Delete parents after successful unlinking
  const deleteResult = await UpdateTheFamilyAfterDeletion(unlinkResult?.unlinkedParentIds);

  if (!deleteResult.success) {
    return {
      success: false,
      step: 'delete',
      error: deleteResult.error,
      unlinkInfo: unlinkResult // Include unlink info for reference
    };
  }

  // Both operations successful
  return {
    success: true,
    unlink: {
      message: unlinkResult.message,
      count: unlinkResult.unlinkedCount,
      ids: unlinkResult.unlinkedParentIds
    },
    delete: {
      message: deleteResult.message,
      count: deleteResult.deletedCount,
      ids: deleteResult.deletedIds
    }
  };
}


 const handleSubmitHandler = async (data) => {
  setSubmitting(true);
  
  try {
    const emailsValid = await validateAllParentEmailsBeforeSubmit(
      data.parents,
      setFieldError,
      formik.setFieldTouched,
      initialValues.parents
    );
    
    if (!emailsValid) {
      setSubmitting(false);
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.Mui-error, [data-error]');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    // Proceed with create or update
    if (caregiverInfo?.parents[0]?.id) {
      await updateCaregiverdHandler(data);
    } else {
      await createCaregiverdHandler(data);
    }
  } catch (error) {
    console.error('Error in handleSubmitHandler:', error);
    toast.error('An error occurred. Please try again.');
    setSubmitting(false);
  }
};

  const createCaregiverdHandler = async (data) => {
    setIsLoading(true);
    let params = {
      TWAccountId: localStorage.getItem("orgId"),
      HTCountryId: localStorage.getItem("userRegion"),
      caseManagerId: householdAndAgencyInfo.casemanagerId.id,
      HTLanguageId: "1",
      FSUserRoleId: "8",
      ...data.parents[0],
    };
    params.email = params.email.toLowerCase();
    if (data.parents.length > 1) {
      params.secondaryParents = data.parents
        .slice(1)
        .map((parent) => ({
          ...parent,
          email: parent.email.toLowerCase(),
        }));
  } else params.secondaryParent = null;
    
      try {
        const res = await APIS.createFsParents(params);
        if (res.status === 200) {
          toast.success(res.data.message);         
         // if (params.secondaryParents && params.secondaryParents.length > 0) {
            const linkParentsWithRetry = async (primaryParent, secondaryParents, family, maxRetries = 3) => {
              let attempts = 0;
              let currentSecondaryParents = [...secondaryParents]; // Create a copy to work with
              while (attempts < maxRetries) {
                try {
                  attempts++;
                  console.log(`Attempt ${attempts}/${maxRetries} - Linking ${currentSecondaryParents.length} secondary parent(s)`);
                  const res2 = await APIS.linkFsParents({
                    primaryParent: primaryParent,
                    secondaryParents: currentSecondaryParents,
                    family: family,
                  });

                  // Check if we have failed users in the response
                  const failedUsers = res2?.data?.data?.failedUsers;
                  const hasFailedUsers = failedUsers && failedUsers.length > 0;

                  if (hasFailedUsers) {
                    console.log(`${failedUsers.length} user(s) failed to link:`, failedUsers);

                    // If we have more attempts left, retry with only the failed users
                    if (attempts < maxRetries) {
                      // Extract failed user IDs for retry
                      currentSecondaryParents = failedUsers.map(failedUser => failedUser.userId);
                      console.log(`Retrying with failed users in 100ms... (${attempts}/${maxRetries})`);
                      await new Promise(resolve => setTimeout(resolve, 100));
                      continue;
                    } else {
                      // Last attempt and still have failures
                      console.error(`Failed to link ${failedUsers.length} user(s) after ${maxRetries} attempts:`, failedUsers);
                      return {
                        success: false,
                        partialSuccess: res2?.data?.data?.successfullyLinked > 0,
                        data: res2?.data?.data,
                        error: `Failed to link ${failedUsers.length} user(s) after ${maxRetries} attempts`
                      };
                    }
                  }

                  // Success - all users linked
                  console.log('All users linked successfully');
                  return {
                    success: true,
                    data: res2?.data?.data
                  };

                } catch (error) {
                  console.log(`Attempt ${attempts} failed with error:`, error.message);

                  // If this was the last attempt, return error
                  if (attempts >= maxRetries) {
                    console.error(`Failed to link parents after ${maxRetries} attempts:`, error);
                    return {
                      success: false,
                      error: error.message || 'Unknown error occurred',
                      attempts: attempts
                    };
                  }

                  // Wait before next retry
                  console.log(`Retrying in 100ms... (${attempts}/${maxRetries})`);
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              }

              // Fallback return (should not reach here in normal flow)
              return {
                success: false,
                error: `Max retries (${maxRetries}) reached without successful completion`
              };
            };

            try {
              // Filter parents that DON'T have an ID (either missing property or falsy value)
            
                setTimeout(() => {
                  linkParentsWithRetry(
                    res.data?.data?.parentId,
                    res.data?.data?.secondaryParentIds || [], // Pass the entire parent objects or extract needed data
                    householdAndAgencyInfo.id
                  );
                }, 100);
             
            } catch (error) {
              console.error('Error processing secondary parents:', error);
            }
          
          setTimeout(() => {
            navigate(`/fostershare/families/${householdAndAgencyInfo.id}`);
          }, 1000);
        }
      } catch (error) {
        setIsLoading(false);
      }
      finally{
        setIsLoading(false);
      }
    
  };

 const validateAllParentEmailsBeforeSubmit = async (
  parents, 
  setFieldError, 
  setFieldTouched, 
  initialParents = []
) => {
  // Clear all email errors first
  parents.forEach((_, idx) => {
    setFieldError(`parents.${idx}.email`, undefined);
  });

  // Build email map for duplicate detection
  const emailMap = {};
  let hasDuplicate = false;

  parents.forEach((parent, idx) => {
    const email = parent.email?.toLowerCase()?.trim();
    if (email) {
      if (!emailMap[email]) emailMap[email] = [];
      emailMap[email].push(idx);
    }
  });

  // Check for duplicates and set errors
  Object.entries(emailMap).forEach(([email, indices]) => {
    if (indices.length > 1) {
      hasDuplicate = true;
      const names = indices
        .map(i => {
          const parent = parents[i];
          const name = `${parent?.firstName || ""} ${parent?.lastName || ""}`.trim();
          return name || `Parent ${i + 1}`;
        })
        .join(", ");
      
      indices.forEach(i => {
        setFieldTouched(`parents.${i}.email`, true, false);
        setFieldError(`parents.${i}.email`, `Duplicate email with ${names}`);
      });
    }
  });

  // Return early if duplicates found
  if (hasDuplicate) {
    return false;
  }

  // Check each NEW or CHANGED email against the database
  const validationPromises = parents.map(async (parent, i) => {
    const email = parent.email?.toLowerCase()?.trim();
  
    try {
      const dbExists = await debouncedHandleCheckEmailExistence(email, parent?.id);
      if (!dbExists) {
        setFieldTouched(`parents.${i}.email`, true, false);
        setFieldError(
          `parents.${i}.email`,
          "Email already associated with another user, please use a different email address."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Error validating email at index ${i}:`, error);
      return true;
    }
  });

  // Wait for all validations to complete
  const results = await Promise.all(validationPromises);
  
  // Return true only if ALL validations passed
  return results.every(result => result === true);
};

  const updateCaregiverdHandler = async (data) => {
    setIsLoading(true);
    let params = {
      TWAccountId: localStorage.getItem("orgId"),
      HTCountryId: localStorage.getItem("userRegion"),
      caseManagerId: householdAndAgencyInfo.casemanagerId.id,
      HTLanguageId: "1",
      FSUserRoleId: "8",
      ...data.parents[0],
    };
    params.email = params.email.toLowerCase();

   if (data.parents.length > 1) {
      params.secondaryParents = data.parents
        .slice(1)
        .map((parent) => ({
          ...parent,
        }));
  }  else params.secondaryParent = null;
  
      try {
        const res = await APIS.updateFsParents(params);
        if (res.status === 200) {
          toast.success(res.data.message);         
          if (params.secondaryParents && params.secondaryParents.length > 0) {
            const linkParentsWithRetry = async (primaryParent, secondaryParents, family, maxRetries = 3) => {
              let attempts = 0;
              let currentSecondaryParents = [...secondaryParents]; // Create a copy to work with
              while (attempts < maxRetries) {
                try {
                  attempts++;
                  console.log(`Attempt ${attempts}/${maxRetries} - Linking ${currentSecondaryParents.length} secondary parent(s)`);
                  const res2 = await APIS.linkFsParents({
                    primaryParent: primaryParent,
                    secondaryParents: currentSecondaryParents,
                    family: family,
                  });

                  // Check if we have failed users in the response
                  const failedUsers = res2?.data?.data?.failedUsers;
                  const hasFailedUsers = failedUsers && failedUsers.length > 0;

                  if (hasFailedUsers) {
                    console.log(`${failedUsers.length} user(s) failed to link:`, failedUsers);

                    // If we have more attempts left, retry with only the failed users
                    if (attempts < maxRetries) {
                      // Extract failed user IDs for retry
                      currentSecondaryParents = failedUsers.map(failedUser => failedUser.userId);
                      console.log(`Retrying with failed users in 100ms... (${attempts}/${maxRetries})`);
                      await new Promise(resolve => setTimeout(resolve, 100));
                      continue;
                    } else {
                      // Last attempt and still have failures
                      console.error(`Failed to link ${failedUsers.length} user(s) after ${maxRetries} attempts:`, failedUsers);
                      return {
                        success: false,
                        partialSuccess: res2?.data?.data?.successfullyLinked > 0,
                        data: res2?.data?.data,
                        error: `Failed to link ${failedUsers.length} user(s) after ${maxRetries} attempts`
                      };
                    }
                  }

                  // Success - all users linked
                  console.log('All users linked successfully');
                  return {
                    success: true,
                    data: res2?.data?.data
                  };

                } catch (error) {
                  console.log(`Attempt ${attempts} failed with error:`, error.message);

                  // If this was the last attempt, return error
                  if (attempts >= maxRetries) {
                    console.error(`Failed to link parents after ${maxRetries} attempts:`, error);
                    return {
                      success: false,
                      error: error.message || 'Unknown error occurred',
                      attempts: attempts
                    };
                  }

                  // Wait before next retry
                  console.log(`Retrying in 100ms... (${attempts}/${maxRetries})`);
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              }

              // Fallback return (should not reach here in normal flow)
              return {
                success: false,
                error: `Max retries (${maxRetries}) reached without successful completion`
              };
            };

            try {
              // Filter parents that DON'T have an ID (either missing property or falsy value)
              const parentsWithoutId = params.secondaryParents.filter(parent =>
                !parent.hasOwnProperty('id') || !parent.id
              );

              if (parentsWithoutId.length > 0) {
                console.log(`Found ${parentsWithoutId.length} secondary parents without IDs that need linking`);

                // Use setTimeout to make it non-blocking (similar to original code)
                setTimeout(() => {
                  linkParentsWithRetry(
                    res.data?.data?.parentId,
                    res.data?.data?.secondaryParentIds, // Pass the entire parent objects or extract needed data
                    householdAndAgencyInfo.id
                  );
                }, 100);
              } else {
                console.log('All secondary parents already have IDs - no linking needed');
              }

            } catch (error) {
              console.error('Error processing secondary parents:', error);
            }
          }
        }
        if(deletedCaregiverIds.length > 0){
          handleParentDeletion();
        }
        setTimeout(() => {
          navigate(`/fostershare/families/${householdAndAgencyInfo.id}`);
        }, 1000);
      } 
      catch (error) {
        setIsLoading(false);
      }
       finally{
        setIsLoading(false);
      }
    
  };

  const cancelClickHandler = () => {
    ModalService.open(
      () => (
        <Box mb={2}>
          If you leave now, you can return to this family to update caregiver
          details.
        </Box>
      ),
      {
        modalTitle: "Missing caregiver information",
        width: "30%",
        modalDescription:
          "Caregiver(s) have not been added to this household. At least one caregiver must be created to assign children to this family.",
        actionButtonText: "Leave page",
        cancelButtonText: "Return to form",
        onClick: () => navigate("/fostershare/families"),
      }
    );
  };

  const deleteCareGiver = (deleteFunction, caregiver) => {
    if (caregiver?.id) {
      ModalService.open(
        () => (
          <Box mb={2}>
            Are you sure you want to delete this caregiver? This will remove access to the ThriveWell mobile app for this caregiver.
          </Box>
        ),
        {
          modalTitle: "Delete Caregiver",
          width: "30%",
          actionButtonText: "Yes, delete",
          cancelButtonText: "Cancel",
          onClick: () => {
            deleteFunction();
            setDeletedCaregiverIds((prev) => [...prev, caregiver.id]);
          },
        }
      );
    }else{
      deleteFunction();
    }
  };

  return (
    <>
      <Loader loading={isLoading} />
      <FormikProvider value={formik}>
        <FieldArray name="parents">
          {({ insert, remove, push }) => (
            <>
              {values.parents.map((obj, i) => (
                <>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography
                        id="parent-info"
                        color="textPrimary"
                        variant="subtitle2"
                        fontSize={"1.1rem"}
                        fontWeight={600}
                      >
                        {`${i === 0 ? "Primary" : "Secondary"} caregiver`}
                      </Typography>
                      {values.parents.length > 1 && i >= 1 && (
                        <Button
                          aria-label="delete"
                          onClick={() => deleteCareGiver(() => remove(i), values.parents[i])}
                          sx={{ minWidth: 0, ml: 1 }}
                        >
                          <FSDeleteIcon />
                        </Button>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id={`parent-${i}-first-name`}
                      error={Boolean(
                        touched?.parents?.[i]?.firstName &&
                          errors?.parents?.[i]?.firstName
                      )}
                      fullWidth
                      helperText={
                        touched?.parents?.[i]?.firstName &&
                        errors?.parents?.[i]?.firstName
                      }
                      label="First name"
                      name={`parents.${i}.firstName`}
                      // //onBlur={handleBlur}
                      onChange={handleChange}
                      onBlur={(e) => {
                        handleBlur(e);
                        // Preserve email errors when other fields are blurred
                        if (errors?.parents?.[i]?.email) {
                          setTimeout(() => {
                            setFieldError(`parents.${i}.email`, errors.parents[i].email);
                          }, 0);
                        }
                      }}
                      required
                      value={values?.parents?.[i]?.firstName}
                      variant="outlined"
                      disabled={i === 0 && !caregiverInfo?.parents[0]?.id}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id={`parent-${i}-last-name`}
                      error={Boolean(
                        touched?.parents?.[i]?.lastName &&
                          errors?.parents?.[i]?.lastName
                      )}
                      fullWidth
                      helperText={
                        touched?.parents?.[i]?.lastName &&
                        errors?.parents?.[i]?.lastName
                      }
                      label="Last name"
                      name={`parents.${i}.lastName`}
                      // //onBlur={handleBlur}
                      onChange={handleChange}
                      onBlur={(e) => {
                        handleBlur(e);
                        // Preserve email errors when other fields are blurred
                        if (errors?.parents?.[i]?.email) {
                          setTimeout(() => {
                            setFieldError(`parents.${i}.email`, errors.parents[i].email);
                          }, 0);
                        }
                      }}
                      required
                      value={values?.parents?.[i]?.lastName}
                      variant="outlined"
                      disabled={i === 0 && !caregiverInfo?.parents[0]?.id}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id={`parent-${i}-email`}
                      error={Boolean(
                        touched?.parents?.[i]?.email &&
                          errors?.parents?.[i]?.email
                      )}
                      fullWidth
                      helperText={
                        touched?.parents?.[i]?.email &&
                        errors?.parents?.[i]?.email
                      }
                      label="Email"
                      name={`parents.${i}.email`}
                        //onBlur={handleBlur}
                        onChange={handleChange}
                        onBlur={async (e) => {
                        // Only validate if email has changed from initial value
                       
                          await validateParentEmailOnBlur(
                          i,
                          values?.parents?.[i]?.email,
                          values?.parents,
                          setFieldError,
                          formik.setFieldTouched,
                          values?.parents?.[i]?.id,
                          );
                        
                        }}
                      required
                      value={values?.parents?.[i]?.email}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PhoneTextInput
                      name={`parents.${i}.phoneNumber`}
                      error={Boolean(
                        touched?.parents?.[i]?.phoneNumber &&
                          errors?.parents?.[i]?.phoneNumber
                      )}
                      helperText={
                        touched?.parents?.[i]?.phoneNumber &&
                        errors?.parents?.[i]?.phoneNumber
                      }
                      value={values.parents?.[i]?.phoneNumber}
                      onChange={(phone) =>
                        setFieldValue(`parents.${i}.phoneNumber`, phone)
                      }
                      required
                      onBlur={(e) => {
                        handleBlur(e);
                        // Preserve email errors when other fields are blurred
                        if (errors?.parents?.[i]?.email) {
                          setTimeout(() => {
                            setFieldError(`parents.${i}.email`, errors.parents[i].email);
                          }, 0);
                        }
                      }}
                      defaultCountry={
                        locationList?.find(
                          (obj) =>
                            obj.id ==
                            householdAndAgencyInfo?.casemanagerId?.HTCountryId
                        )?.iso2Code
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      id={`parent-${i}-occupation`}
                      error={Boolean(
                        touched?.parents?.[i]?.occupation &&
                          errors?.parents?.[i]?.occupation
                      )}
                      fullWidth
                      helperText={
                        touched?.parents?.[i]?.occupation &&
                        errors?.parents?.[i]?.occupation
                      }
                      label="Occupation"
                      name={`parents.${i}.occupation`}
                      //onBlur={handleBlur}
                      onChange={handleChange}
                      value={values?.parents?.[i]?.occupation}
                      variant="outlined"
                    />
                  </Grid>
                  {i === values.parents.length - 1 && values.parents.length <= 19 &&  (
                    <Grid item xs={12} sm={6}>
                       {isAddingCaregiver ? (
                         <>
                           <Skeleton animation="wave" height={45} />
                           <Skeleton animation="wave" height={45} />
                           <Skeleton animation="wave" height={45} />
                           <Skeleton animation="wave" height={45} />
                         </>
                       ) : (
                      <Button
                        sx={{
                          borderRadius: "4px",
                          width: 1,
                          height: "56px",
                        }}
                        variant="outlined"
                        onClick={async () => {
                          setIsAddingCaregiver(true);
                          // Small delay to ensure smooth rendering
                          await new Promise(resolve => setTimeout(resolve, 10));
                          push({
                            firstName: "",
                            lastName: "",
                            email: "",
                            phoneNumber: "",
                            occupation: "",
                          });
                          setIsAddingCaregiver(false);
                        }}
                        disabled={isAddingCaregiver}
                      >
                       + Add caregiver
                      </Button>)}
                    </Grid>
                  )}
                </>
              ))}
            </>
          )}
        </FieldArray>

        <Grid item xs={12}>
          <Box
            mt={2}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Button
              sx={{ borderRadius: "4px" }}
              variant="outlined"
              onClick={() => {
                setCaregiverInfo(values);
                setIsCareGiverInfo(false);
              }}
            >
              <Box display="flex">
                <ArrowLeftIcon />
                <Box>Previous</Box>
              </Box>
            </Button>
            <Box display="flex" gap={2}>
              <Button
                sx={{ borderRadius: "4px" }}
                variant="outlined"
                onClick={() => {
                  caregiverInfo?.parents[0]?.id
                    ? navigate(-1)
                    : cancelClickHandler();
                }}
              >
                Cancel
              </Button>
              <Button
                sx={{ borderRadius: "4px" }}
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {caregiverInfo?.parents[0]?.id
                  ? "Update"
                  : "Add and invite family"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </FormikProvider>
    </>
  );
};

export default CareGiverForm;
