import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Box,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Radio,
  RadioGroup,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Close Case Confirmation Modal
const CloseCaseModal = ({ open, onClose, onConfirm }) => {
  const [closeCaseData, setCloseCaseData] = useState({
    dateCaseClosed: '',
    childFamilyAssociation: 'do-not-associate',
    accessDays: '0',
    reasonForClosing: '',
  });

  const handleChange = (field) => (event) => {
    setCloseCaseData({
      ...closeCaseData,
      [field]: event.target.value,
    });
  };

  const handleConfirm = () => {
    onConfirm(closeCaseData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 2,
        },
      }}
    >
      <DialogTitle sx={{ p: 2, pb: 1, fontSize: '1.25rem', fontWeight: 500 }}>
        Close this child's case?
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Date case was closed"
            type="date"
            value={closeCaseData.dateCaseClosed}
            onChange={handleChange('dateCaseClosed')}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
          />

          <Box>
            <Typography sx={{ mb: 1, fontSize: '0.875rem' }}>
              Child/family association
            </Typography>
            <RadioGroup
              value={closeCaseData.childFamilyAssociation}
              onChange={handleChange('childFamilyAssociation')}
            >
              <FormControlLabel
                value="do-not-associate"
                control={<Radio />}
                label="Do not associate the child with this family"
              />
              <FormControlLabel
                value="leave-associated"
                control={<Radio />}
                label="Leave child associated with this family"
              />
            </RadioGroup>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              Family can access child's records for an additional
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={closeCaseData.accessDays}
                onChange={handleChange('accessDays')}
                variant="outlined"
              >
                <MenuItem value="0">0</MenuItem>
                <MenuItem value="30">30</MenuItem>
                <MenuItem value="60">60</MenuItem>
                <MenuItem value="90">90</MenuItem>
              </Select>
            </FormControl>
            <Typography sx={{ fontSize: '0.875rem' }}>days</Typography>
          </Box>

          <Box>
            <Typography sx={{ mb: 1, fontSize: '0.875rem' }}>
              Why is this child's case being closed?
            </Typography>
            <RadioGroup
              value={closeCaseData.reasonForClosing}
              onChange={handleChange('reasonForClosing')}
            >
              <FormControlLabel value="adopted" control={<Radio />} label="Adopted" />
              <FormControlLabel value="aged-out" control={<Radio />} label="Aged out" />
              <FormControlLabel
                value="chose-not-to-continue"
                control={<Radio />}
                label="Chose not to continue participation"
              />
              <FormControlLabel
                value="graduated"
                control={<Radio />}
                label="Graduated from program"
              />
              <FormControlLabel value="inactive" control={<Radio />} label="Inactive" />
              <FormControlLabel value="lost-contact" control={<Radio />} label="Lost contact" />
              <FormControlLabel
                value="moved-to-kinship"
                control={<Radio />}
                label="Moved to kinship family"
              />
              <FormControlLabel
                value="moved-to-foster"
                control={<Radio />}
                label="Moved to another foster family"
              />
              <FormControlLabel
                value="moved-to-organization"
                control={<Radio />}
                label="Moved to another organization"
              />
              <FormControlLabel value="passed-away" control={<Radio />} label="Passed away" />
              <FormControlLabel
                value="reunified"
                control={<Radio />}
                label="Reunified with family"
              />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          fullWidth
          variant="outlined"
          sx={{
            textTransform: 'none',
            color: '#FF8C42',
            borderColor: '#FF8C42',
            '&:hover': {
              borderColor: '#FF8C42',
              backgroundColor: 'rgba(255, 140, 66, 0.04)',
            },
          }}
        >
          No, cancel
        </Button>
        <Button
          onClick={handleConfirm}
          fullWidth
          variant="contained"
          sx={{
            textTransform: 'none',
            backgroundColor: '#FF8C42',
            '&:hover': {
              backgroundColor: '#E67A35',
            },
          }}
        >
          Yes, close case
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Success Confirmation Modal
const CaseClosedSuccessModal = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 3,
          zIndex: (theme) => theme.zIndex.modal + 10,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
          This child's case has been closed
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          fullWidth
          variant="contained"
          sx={{
            textTransform: 'none',
            backgroundColor: '#FF8C42',
            fontSize: '1rem',
            py: 1.5,
            '&:hover': {
              backgroundColor: '#E67A35',
            },
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Child Modal Component
const ChildModal = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    familyChildIsLivingWith: '',
    currentLivingCondition: '',
    caseWorker: '',
    hasLegallyRecognizedDisability: false,
    addressSameAsFamily: false,
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    email: '',
    primaryLanguage: '',
    ethnicity: '',
    educationLevel: '',
    allergies: '',
    notes: '',
    dateChildEnteredAgency: '',
    dateChildEnteredWelfareSystem: '',
    caseManagementStep: '',
    levelOfCare: '',
    medicaidNumber: '',
    placementId: '',
    numberOfPreviousPlacements: '',
  });

  const [expandedAdditional, setExpandedAdditional] = useState(true);
  const [expandedCaseManagement, setExpandedCaseManagement] = useState(true);
  const [closeCaseModalOpen, setCloseCaseModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleCloseCase = () => {
    setCloseCaseModalOpen(true);
  };

  const handleCloseCaseConfirm = (closeCaseData) => {
    console.log('Case closed with data:', closeCaseData);
    setCloseCaseModalOpen(false);
    setSuccessModalOpen(true);
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    onClose(); // Close the main modal as well
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 2,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              Child <span style={{ color: '#FF8C42' }}>ACTIVE</span>
            </Box>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <TextField
              fullWidth
              required
              label="Child's first name"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Child's last name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              variant="outlined"
            />

            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={handleChange('gender')}
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="Date of birth (MM/DD/YYYY)"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange('dateOfBirth')}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />

            <FormControl fullWidth>
              <InputLabel>Family child is living with</InputLabel>
              <Select
                value={formData.familyChildIsLivingWith}
                onChange={handleChange('familyChildIsLivingWith')}
                label="Family child is living with"
              >
                <MenuItem value="both">Both Parents</MenuItem>
                <MenuItem value="mother">Mother</MenuItem>
                <MenuItem value="father">Father</MenuItem>
                <MenuItem value="guardian">Guardian</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Current living condition</InputLabel>
              <Select
                value={formData.currentLivingCondition}
                onChange={handleChange('currentLivingCondition')}
                label="Current living condition"
              >
                <MenuItem value="stable">Stable</MenuItem>
                <MenuItem value="temporary">Temporary</MenuItem>
                <MenuItem value="transitional">Transitional</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Case worker for this child</InputLabel>
              <Select
                value={formData.caseWorker}
                onChange={handleChange('caseWorker')}
                label="Case worker for this child"
                displayEmpty
              >
                <MenuItem value="">
                  <em>Default to whoever is adding the child</em>
                </MenuItem>
                <MenuItem value="worker1">Case Worker 1</MenuItem>
                <MenuItem value="worker2">Case Worker 2</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasLegallyRecognizedDisability}
                  onChange={handleChange('hasLegallyRecognizedDisability')}
                />
              }
              label="This child has a legally recognized disability"
            />

            {/* Contact Information */}
            <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
              Contact information
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.addressSameAsFamily}
                  onChange={handleChange('addressSameAsFamily')}
                />
              }
              label="Child's address is the same as family's address"
            />

            {/* Conditional Address Fields */}
            {!formData.addressSameAsFamily && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Address 1"
                  value={formData.address1}
                  onChange={handleChange('address1')}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Address 2"
                  value={formData.address2}
                  onChange={handleChange('address2')}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={handleChange('city')}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  onChange={handleChange('state')}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Mailing code / Postal Index Number / ZIP code"
                  value={formData.zipCode}
                  onChange={handleChange('zipCode')}
                  variant="outlined"
                />
              </Box>
            )}

            {/* Additional Profile Information Accordion */}
            <Accordion
              expanded={expandedAdditional}
              onChange={() => setExpandedAdditional(!expandedAdditional)}
              sx={{
                boxShadow: 'none',
                '&:before': { display: 'none' },
                border: 'none',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 0,
                  minHeight: 48,
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Additional profile information (optional)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange('phoneNumber')}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    variant="outlined"
                  />

                  <FormControl fullWidth>
                    <InputLabel>Primary language</InputLabel>
                    <Select
                      value={formData.primaryLanguage}
                      onChange={handleChange('primaryLanguage')}
                      label="Primary language"
                    >
                      <MenuItem value="english">English</MenuItem>
                      <MenuItem value="spanish">Spanish</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Ethnicity (only for US-based orgs)</InputLabel>
                    <Select
                      value={formData.ethnicity}
                      onChange={handleChange('ethnicity')}
                      label="Ethnicity (only for US-based orgs)"
                    >
                      <MenuItem value="hispanic">Hispanic or Latino</MenuItem>
                      <MenuItem value="not-hispanic">Not Hispanic or Latino</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Education level</InputLabel>
                    <Select
                      value={formData.educationLevel}
                      onChange={handleChange('educationLevel')}
                      label="Education level"
                    >
                      <MenuItem value="preschool">Preschool</MenuItem>
                      <MenuItem value="elementary">Elementary</MenuItem>
                      <MenuItem value="middle">Middle School</MenuItem>
                      <MenuItem value="high">High School</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Allergies"
                    multiline
                    rows={3}
                    value={formData.allergies}
                    onChange={handleChange('allergies')}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange('notes')}
                    variant="outlined"
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Case Management Details Accordion */}
            <Accordion
              expanded={expandedCaseManagement}
              onChange={() => setExpandedCaseManagement(!expandedCaseManagement)}
              sx={{
                boxShadow: 'none',
                '&:before': { display: 'none' },
                border: 'none',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 0,
                  minHeight: 48,
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Case management details (optional)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date child entered agency"
                        type="date"
                        value={formData.dateChildEnteredAgency}
                        onChange={handleChange('dateChildEnteredAgency')}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date child entered welfare system"
                        type="date"
                        value={formData.dateChildEnteredWelfareSystem}
                        onChange={handleChange('dateChildEnteredWelfareSystem')}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  <FormControl fullWidth>
                    <InputLabel>Case management step</InputLabel>
                    <Select
                      value={formData.caseManagementStep}
                      onChange={handleChange('caseManagementStep')}
                      label="Case management step"
                    >
                      <MenuItem value="intake">Intake</MenuItem>
                      <MenuItem value="assessment">Assessment</MenuItem>
                      <MenuItem value="planning">Planning</MenuItem>
                      <MenuItem value="implementation">Implementation</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Level of care (US logs only)"
                    value={formData.levelOfCare}
                    onChange={handleChange('levelOfCare')}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    label="Medicaid number (US logs only)"
                    value={formData.medicaidNumber}
                    onChange={handleChange('medicaidNumber')}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    label="Placement ID (US logs only)"
                    value={formData.placementId}
                    onChange={handleChange('placementId')}
                    variant="outlined"
                  />

                  <FormControl fullWidth>
                    <InputLabel># of previous placements (US logs only)</InputLabel>
                    <Select
                      value={formData.numberOfPreviousPlacements}
                      onChange={handleChange('numberOfPreviousPlacements')}
                      label="# of previous placements (US logs only)"
                    >
                      <MenuItem value="0">0</MenuItem>
                      <MenuItem value="1">1</MenuItem>
                      <MenuItem value="2">2</MenuItem>
                      <MenuItem value="3">3</MenuItem>
                      <MenuItem value="4+">4+</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 3, justifyContent: 'space-between' }}>
          <Button
            onClick={handleCloseCase}
            variant="outlined"
            sx={{
              color: '#FF8C42',
              borderColor: '#FF8C42',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#FF8C42',
                backgroundColor: 'rgba(255, 140, 66, 0.04)',
              },
            }}
          >
            Close case
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                textTransform: 'none',
                color: '#FF8C42',
                borderColor: '#FF8C42',
                '&:hover': {
                  borderColor: '#FF8C42',
                  backgroundColor: 'rgba(255, 140, 66, 0.04)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                textTransform: 'none',
                backgroundColor: '#FF8C42',
                '&:hover': {
                  backgroundColor: '#E67A35',
                },
              }}
            >
              Save
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Close Case Modal */}
      <CloseCaseModal
        open={closeCaseModalOpen}
        onClose={() => setCloseCaseModalOpen(false)}
        onConfirm={handleCloseCaseConfirm}
      />

      {/* Success Modal */}
      <CaseClosedSuccessModal
        open={successModalOpen}
        onClose={handleSuccessClose}
      />
    </>
  );
};

export default ChildModal;