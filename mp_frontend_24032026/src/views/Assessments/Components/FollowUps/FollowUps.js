import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReusableTrendTable from "../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import { useTranslation } from "react-i18next";
import DateRangePicker from "../../../../components/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LoadingButton } from "@mui/lab";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { ModalService } from "../../../../components/Modal";
import LabelValue from "../../../../components/LabelValue";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useFormik } from "formik";
import BodyText from "../../../../components/BodyText/BodyText";
import {
  convertUnderscoreToText,
  dateFormatter,
  timeFormatter,
} from "../../../../constants";
import { useNavigate } from "react-router";
const FollowUps = ({ id, type }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const [followUps, setFollowUps] = useState();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const form = useFormik({
    initialValues: { from: null, to: null },
  });
  const values = form?.values || { from: null, to: null };
  const columnDefinition = [
    {
      id: "dateOfFollowup",
      label: "Date & time of follow-up",
      render: (_, value) => (
        <>
          <BodyText
            sx={{
              fontSize: "0.875rem",
              color: "#172b4d",
            }}
            value={dateFormatter(value, "short")}
          />
          <BodyText
            sx={{
              fontSize: "0.875rem",
              color: "#172b4d",
            }}
            value={timeFormatter(value, { hideSeconds: true })}
          />
        </>
      ),
    },
    {
      id: "contactMethod",
      label: "Contact method",
      render: (_, value) => (
        <BodyText
          sx={{
            fontSize: "0.875rem",
            color: "#172b4d",
          }}
          value={t(`common:common.${value}`)}
        />
      ),
    },
    { id: "caseWorker", label: "Case worker" },
    {
      id: "type",
      label: "Type",
      minWidth: 200,
      maxWidth: 200,
      render: (row, value) =>
        row.type === "AD_HOC" ? (
          <BodyText
            sx={{
              fontSize: "0.875rem",
              color: "#172b4d",
            }}
            value={t(`common:infoCard.${value}`, convertUnderscoreToText(value))}
          />
        ) : (
          <>
            <BodyText
              sx={{
                fontSize: "0.875rem",
                color: "#172b4d",
              }}
              value={`${t(`common:assessment.scheduled`, "Scheduled")} ${t(
                `common:assessment.${row?.frequency}`,
                row?.frequency
              )}`}
            />
            <BodyText
              sx={{
                fontSize: "0.875rem",
                color: "#F37123",
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={() =>
                navigate(`/dashboard/assessments/${row.TWAssessmentId}/view`, {
                  state: {
                    viewAssessment: true,
                  },
                })
              }
              value={`Assessment #${row?.assessmentNo} (${dateFormatter(
                row?.dateOfAssessmentSubmission,
                "short"
              )})`}
            />
          </>
        ),
    },
    {
      id: "notes",
      label: "Notes",
      minWidth: 250,
      maxWidth: 250,
      render: (row) => (
        <BodyText
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
            wordBreak: "break-all",
            fontSize: "0.875rem",
            color: "#172b4d",
          }}
          value={row.notes}
          title={row.notes}
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (row) => (
        <RemoveRedEyeIcon
          data-testid={`actions-btn-${row.id}`}
          sx={{ cursor: "pointer" }}
          onClick={() =>
            ModalService.open(
              ({ close }) => (
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={2}
                  mb={2}
                  sx={{
                    overflowY: "auto",
                    maxHeight: "70vh",
                  }}
                >
                  <Box mt={2}>
                    <LabelValue
                      label={t(
                        "common:tableColumn.Date & time of follow-up",
                        "Date & time of follow-up"
                      )}
                      value={
                        <>
                          <BodyText
                            sx={{
                              fontSize: "0.875rem",
                              color: "#172b4d",
                            }}
                            value={dateFormatter(row.dateOfFollowup, "short")}
                          />
                          <BodyText
                            sx={{
                              fontSize: "0.875rem",
                              color: "#172b4d",
                            }}
                            value={timeFormatter(row.dateOfFollowup, {
                              hideSeconds: true,
                            })}
                          />
                        </>
                      }
                      descriptionFontWeight={400}
                      tooltip={false}
                    />
                  </Box>
                  <Box>
                    <LabelValue
                      label={t(
                        "common:tableColumn.Contact method",
                        "Contact method"
                      )}
                      value={t(`common:common.${row.contactMethod}`)}
                      descriptionFontWeight={400}
                      tooltip={false}
                    />
                  </Box>
                  <Box>
                    <LabelValue
                      label={t("common:tableColumn.Case worker", "Case worker")}
                      value={row.caseWorker}
                      descriptionFontWeight={400}
                      tooltip={false}
                    />
                  </Box>
                  <Box>
                    <LabelValue
                      label={t("common:tableColumn.Type", "Type")}
                      value={
                        row.type === "AD_HOC" ? (
                          <BodyText
                            sx={{
                              fontSize: "0.875rem",
                              color: "#172b4d",
                            }}
                            value={t(`common:infoCard.${row.type}`, convertUnderscoreToText(row.type))}
                          />
                        ) : (
                          <>
                            <BodyText
                              sx={{
                                fontSize: "0.875rem",
                                color: "#172b4d",
                              }}
                              value={`${t(
                                `common:assessment.scheduled`,
                                "Scheduled"
                              )} ${t(
                                `common:assessment.${row?.frequency}`,
                                row?.frequency
                              )}`}
                            />
                            <BodyText
                              sx={{
                                fontSize: "0.875rem",
                                color: "#F37123",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                close();
                                navigate(
                                  `/dashboard/assessments/${row.HTAssessmentId}/view`,
                                  {
                                    state: {
                                      viewAssessment: true,
                                    },
                                  }
                                );
                              }}
                              value={`Assessment #${
                                row?.assessmentNo
                              } (${dateFormatter(
                                row?.dateOfAssessmentSubmission,
                                "short"
                              )})`}
                            />
                          </>
                        )
                      }
                      descriptionFontWeight={400}
                      tooltip={false}
                    />
                  </Box>
                  <Box>
                    <LabelValue
                      label={t("common:tableColumn.Notes", "Notes")}
                      value={row.notes}
                      wrap
                      descriptionFontWeight={400}
                      tooltip={false}
                    />
                  </Box>
                </Box>
              ),
              {
                modalTitle: t(
                  "common:common.Follow-up details",
                  "Follow-up details"
                ),
                width: "30%",
                cancelButtonText: t("common:common.Close"),
                hideActionButton: true,
                height: "95%",
              }
            )
          }
        />
      ),
    },
  ];

  const followUpToolbar = (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" mt={2} mb gap={2} alignItems="center">
        <DateRangePicker form={form} />
        {followUps?.data?.length > 0 && (
          <Box marginLeft="auto">
            <LoadingButton
              onClick={(e) => {
                exportFollowUps();
              }}
              loading={isExporting}
              loadingPosition="start"
              startIcon={<FileUploadIcon />}
              color="primary"
              variant="contained"
            >
              {t("common:common.Export")}
            </LoadingButton>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );

  const formatDateOnly = (date) => (date ? date.format("YYYY-MM-DD") : null);

  const getFollowUpData = async (params = {}) => {
    try {
      setLoading(true);
      setApiError(false);
      // Extract params
      const {
        page,
        rowCount,
      } = params || {};

      const payload = {
        page: page || 1,
        limit: rowCount || 10,
        fromDate: values?.from ? formatDateOnly(values?.from) + " 00:00:00" : null,
        toDate: values?.to ? formatDateOnly(values?.to) + " 23:59:59" : null,
        HTChildId: type === "CHILD" ? id : null,
        HTFamilyId: type === "FAMILY" ? id : null,
      };
      if (payload.countryFilter === null) {
        return;
      }
      const response = await APIS.GetFollowUpList(payload);
      let interventionListData = response.data?.data?.followups || [];
      interventionListData = interventionListData.map((each) => ({
        ...each,
        frequency: each.frequency === "Fortnightly (Bi-weekly)" ? "Every two weeks" : each.frequency,
      }));
      const tableData = {
        data: interventionListData,
        pageCount: response.data?.data?.pagination?.totalPages || 0,
        total: response.data?.data?.pagination?.totalCount || 0,
      };

      setFollowUps(tableData);
      setLoading(false);
      setApiError(null);
    } catch (error) {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  const exportFollowUps = async () => {
    setIsExporting(true);
    try {
      const res = await APIS.ExportFollowUps({
        fromDate: values?.from ? formatDateOnly(values?.from) + " 00:00:00" : null,
        toDate: values?.to ? formatDateOnly(values?.to) + " 23:59:59" : null,
        HTChildId: type === "CHILD" ? id : null,
        HTFamilyId: type === "FAMILY" ? id : null,
      });
      const linkSource = `data:application/xlsx;base64,${res.data}`;
      const downloadLink = document.createElement("a");
      const fileName = `Followup_report_${type}-${id}-${new Date()}.xlsx`;
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.target = "_blank";
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setIsExporting(false);
    } catch (error) {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    getFollowUpData();
  }, [values.from, values.to]);

  return (
    <ReusableTrendTable
      columns={columnDefinition}
      title="Follow - ups"
      tableData={followUps?.data}
      loading={loading}
      skeltonRowcount={6}
      apiError={apiError}
      onReload={getFollowUpData}
      t={t}
      enablePagination
      totalPageCount={followUps?.pageCount}
      totalItems={followUps?.total || 0}
      toolBar={followUpToolbar}
      boldHeaders={false}
    />
  );
};

export default FollowUps;
