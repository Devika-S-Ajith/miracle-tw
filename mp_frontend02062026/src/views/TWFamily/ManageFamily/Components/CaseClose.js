
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import RadioGroupList from './RadioGroupList';
import SmallText from '../../../../components/SmallText/SmallText';
import { DateFormatFromRegion } from '../../../../constants';
import CalendarIcon from '../../../../assets/icons/CalendarIcon';
; // adjust import as needed


// ─── Validation Schema ───────────────────────────────────────────────────────

const buildValidationSchema = (t) =>
  Yup.object({
    familyClosureDate: Yup.mixed()
      .required(
        t('common:family.Closure date is required', 'Closure date is required')
      )
      .test(
        'is-valid-date',
        t('common:family.Please enter a valid date', 'Please enter a valid date'),
        (value) => value && dayjs(value).isValid()
      )
      .test(
        'not-future-date',
        t(
          'common:family.Closure date cannot be in the future',
          'Closure date cannot be in the future'
        ),
        (value) => value && dayjs(value).isBefore(dayjs().endOf('day'))
      ),

    deactivationReason: Yup.string()
      .required(
        t(
          'common:family.Please select a reason for closing the case',
          'Please select a reason for closing the case'
        )
      ),
  });

// ─── Initial Values ───────────────────────────────────────────────────────────

const initialValues = {
  familyClosureDate: null,
  deactivationReason: '',
};

const CloseCaseModal = ({ onClose, onSubmit, deactivationReasons = [] }) => {
  const { t } = useTranslation();

  const handleSubmit = (values, { setSubmitting }) => {
    try {
      onSubmit(values);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Formik
        initialValues={initialValues}
        validationSchema={buildValidationSchema(t)}
        validateOnBlur
        validateOnChange={false}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          setFieldTouched,
          setFieldError,
          isSubmitting,
        }) => (
          <Form noValidate>
            <Box sx={{ p: 3 }}>

              {/* ── Info text ─────────────────────────────────────────── */}
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t(
                  `common:child.Closing a family's case also closes the cases for all family members and children in the family`,
                  `Closing a family's case also closes the cases for all family members and children in the family.`
                )}
              </Typography>

              {/* ── Closure Date ──────────────────────────────────────── */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {t('common:common.Date case was closed', 'Date case was closed')}
                </Typography>

                <DatePicker
                  value={values.familyClosureDate ? dayjs(values.familyClosureDate) : null}
                  format={DateFormatFromRegion(true)}
                  onChange={(newValue) => {
                    setFieldValue('familyClosureDate', newValue);
                    setFieldTouched('familyClosureDate', true, false);
                    setFieldError('familyClosureDate', undefined);
                  }}
                  maxDate={dayjs().endOf('day')}
                  slots={{ openPickerIcon: CalendarIcon }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      variant: 'outlined',
                      placeholder: '',
                      error: touched.familyClosureDate && Boolean(errors.familyClosureDate),
                      helperText: touched.familyClosureDate && errors.familyClosureDate,
                      onBlur: () => setFieldTouched('familyClosureDate', true),
                    },
                  }}
                />
              </Box>
              {/* ── Deactivation Reason ───────────────────────────────── */}
              <Box sx={{ p: 2, borderRadius: 1, mb: 3 }}>
                <SmallText
                  value={t(
                    'common:common.Why is this case being closed?',
                    'Why is this case being closed?'
                  )}
                />

                <RadioGroupList
                  name="deactivationReason"
                  options={deactivationReasons}
                  value={values.deactivationReason}
                  onChange={(e) => {
                    setFieldValue('deactivationReason', e.target.value);
                    setFieldTouched('deactivationReason', true, false);
                    setFieldError('deactivationReason', undefined);

                  }}
                  renderPrimary={(option) => <SmallText value={option.value} />}
                />

                {/* Inline error for radio group (no native helperText) */}
                {touched.deactivationReason && errors.deactivationReason && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.deactivationReason}
                  </Typography>
                )}
              </Box>

              {/* ── Actions ───────────────────────────────────────────── */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" fullWidth onClick={onClose}>
                  {t('common:common.No,Cancel', 'No, Cancel')}
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={isSubmitting}
                >
                  {t('common:common.Yes, close case', 'Yes, close case')}
                </Button>
              </Box>

            </Box>
          </Form>
        )}
      </Formik>
    </LocalizationProvider>
  );
};

export default CloseCaseModal;