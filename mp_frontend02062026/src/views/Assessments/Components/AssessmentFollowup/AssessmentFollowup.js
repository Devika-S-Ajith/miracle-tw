import React from "react";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Grid,
  FormGroup,
  RadioGroup,
  FormLabel,
} from "@mui/material";

function AssessmentFollowup({
  followUpData,
  domains,
  recommendationQuestionOptions,
  visitInterval,
  CustomFormControlLabel,
  CustomCheckbox,
  CustomRadio,
  formQuestions,
  primaryChoices,
}) {
  const { t } = useTranslation(["common"]);
  const followUpDomains = followUpData?.domains || [];

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    paddingTop: "4px",
  };
  const labelStyle = {
    fontSize: "16px",
    fontWeight: "bold",
    lineHeight: "17px",
    paddingTop: "9px",
  };
  const subtextStyle = { color: "#778791", fontSize: "14px", fontWeight: 600 };
  const countStyle = { fontSize: "14px", fontWeight: 600 };

  const getDomainStandardInterventionCount = (value) => {
    const redFlagOptionIds =
      primaryChoices &&
      primaryChoices.length > 0 &&
      primaryChoices
        .map((c) => {
          if (
            c.choiceName == t("common:assessment.In-crisis") ||
            c.choiceName == t("common:assessment.Vulnerable")
          ) {
            return c.id;
          }
        })
        .filter((c) => c);
    let count = 0;
    formQuestions &&
      formQuestions.length > 0 &&
      formQuestions.map((item) => {
        if (
          item.TW_question &&
          item.TW_question.TWQuestionDomainId === value &&
          !item.TW_question.isRedFlag &&
          (item.TW_question.TW_responses?.find(
            (resp) => redFlagOptionIds[0] == resp.TWChoiceId
          ) ||
            item.TW_question.TW_responses?.find(
              (resp) => redFlagOptionIds[1] == resp.TWChoiceId
            ))
        ) {
          count = count + 1;
        }
        return item;
      });
    return count;
  };

  const getDomainRedflagInterventionCount = (value) => {
    let count = 0;
    formQuestions &&
      formQuestions.length > 0 &&
      formQuestions.map((item) => {
        if (
          item.TW_question &&
          item.TW_question.TWQuestionDomainId === value &&
          item.TW_question.isRedFlag &&
          ["1", "2"].includes(
            item.TW_question.TW_responses.find((c) => !c.isInterResp)
              ?.TWChoiceId
          )
        ) {
          count = count + 1;
        }
      });
    return count;
  };

  return (
    <>
      <Typography color="black" variant="h6" textAlign="center">
        {t("common:assessment.Follow up")}
      </Typography>

      <Typography color="textSecondary" variant="subtitle1">
        {followUpDomains.length
          ? t(
              "common:assessment.Which domains do you plan to focus on before the next Thrive Scale assessment?"
            )
          : t("common:assessment.No domains chosen for follow-up")}
      </Typography>

      <Grid item md={12} xs={12} sx={{ mt: 2 }}>
        {followUpDomains.length ? (
          <FormGroup>
            {domains?.length > 0 &&
              domains.map((domain) => {
                const domainData = followUpDomains.find(
                  (item) => item.TWDomainId == domain.id
                );
                const standardCount = getDomainStandardInterventionCount(
                  domain.id
                );
                const redFlagCount = getDomainRedflagInterventionCount(
                  domain.id
                );

                return standardCount || redFlagCount ? (
                  <CustomFormControlLabel
                    key={domain.id}
                    control={<CustomCheckbox sx={{ paddingTop: 0 }} />}
                    checked={!!domainData}
                    value={domain.id}
                    label={
                      <div style={containerStyle}>
                        <span
                          style={{
                            ...labelStyle,
                            color: domainData ? undefined : "#778791",
                          }}
                        >
                          {domain.domainName}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <small style={subtextStyle}>
                            {t(
                              "common:assessment.Questions with interventions"
                            )}
                            :
                          </small>
                          {standardCount ? (
                            <span
                              style={{
                                ...countStyle,
                                color: domainData ? undefined : "#778791",
                              }}
                            >
                              {standardCount} {t("common:assessment.standard")}
                            </span>
                          ) : (
                            <></>
                          )}
                          {redFlagCount ? (
                            <>
                              <span
                                style={{
                                  ...countStyle,
                                  color: domainData ? undefined : "#778791",
                                }}
                              >
                                {standardCount ? " |" : <></>}
                                {redFlagCount} {t("common:assessment.critical")}
                              </span>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    }
                    disabled
                  />
                ) : (
                  <></>
                );
              })}

            {/* Add 'No domains will be prioritized' option */}
            <CustomFormControlLabel
              key="no-domains"
              control={<CustomCheckbox sx={{ paddingTop: 2 }} />}
              checked={!followUpDomains?.length}
              value="no-domains"
              label={
                <div style={containerStyle}>
                  <span
                    style={{
                      ...labelStyle,
                      color: !followUpDomains?.length ? undefined : "#778791",
                      paddingTop: 1,
                    }}
                  >
                    {t("common:assessment.No domains will be prioritized")}
                  </span>
                </div>
              }
              disabled
            />
          </FormGroup>
        ) : (
          <></>
        )}

        <hr
          style={{
            width: "100%",
            borderTop: "1px solid #ccc",
            margin: "18px 0 16px",
          }}
        />

        <FormGroup>
          <FormLabel sx={{ color: "black", fontWeight: "bold" }}>
            {t(
              "common:assessment.How often do you plan to follow up on this case?"
            )}
          </FormLabel>
          <RadioGroup row value={visitInterval}>
            {recommendationQuestionOptions?.map((item) => (
              <CustomFormControlLabel
                key={item.option}
                value={item.value}
                control={<CustomRadio />}
                label={t(`common:assessment.${item.option}`)}
                disabled
              />
            ))}
          </RadioGroup>
        </FormGroup>
      </Grid>
    </>
  );
}

export default AssessmentFollowup;
