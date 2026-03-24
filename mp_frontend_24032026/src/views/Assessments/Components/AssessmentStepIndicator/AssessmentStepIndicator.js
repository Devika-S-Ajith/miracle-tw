import React from "react";
import { useTranslation } from "react-i18next";
import { Stepper, Step, StepLabel } from "@mui/material";

function AssessmentStepIndicator({ formPage, domains = [], score, handleClickPage }) {
  const { t } = useTranslation(["common"]);

  // Conditionally include the Summary step based on score
  const steps = [
    { key: "Details", label: t("common:assessment.Details and pre-assessment") },
    ...(score ? [{ key: "Summary", label: t("common:assessment.Summary") }] : []),
    ...domains.map((domain) => ({ key: domain.domainName, label: domain.domainName })),
    { key: "ImmediateIntervention", label: t("common:assessment.Areas Needing Immediate Intervention") },
    { key: "FollowUp", label:  t("common:assessment.Follow up") },
    { key: "Observations", label: t("common:assessment.Observations") }
  ];

  // Adjust page values dynamically
  const staticSteps = steps.map((step, index) => ({
    ...step,
    page: index + 1
  }));

  return (
    <Stepper activeStep={formPage - 1} alternativeLabel>
      {staticSteps.map(({ key, label, page }) => (
        <Step key={key} onClick={() => handleClickPage(page)}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

export default AssessmentStepIndicator;
