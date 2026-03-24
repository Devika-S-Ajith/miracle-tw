import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import ReusableTrendTable from "../../views/Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import { useTranslation } from "react-i18next";
import StatusFrame from "../StatusFrame/StatusFrame";
import BodyText from "../BodyText/BodyText";
import { CommaseparateString, convertUnderscoreToText, DOMAIN_ICONS, STATUS_ICONS, StatusMapping } from "../../constants";
import { Box, Stack, Typography } from "@mui/material";
import MoodImprovement from "../../views/Dashboard/GovtDashboardInterventions/Components/MoodImprovement";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";



const getStatusIcon = (status) => STATUS_ICONS[status] || "❓";

const getDomainIcon = (id) =>
  DOMAIN_ICONS[id] ? (
    <img
      src={DOMAIN_ICONS[id]}
      alt="domain"
      style={{ width: 20, height: 20 }}
    />
  ) : (
    "-"
  );

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .replace(/,/g, "");
};

const generateExpandedContent = (row) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1.25,
      p: 2,
      backgroundColor: "#f5f5f5",
      position: "relative",
    }}
  >
    <Typography
      sx={{
        whiteSpace: "pre-line",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        flex: 1,
      }}
    >
      {row.interventionNotes
        ? `NOTES: ${row.interventionNotes}`
        : "No notes available."}
    </Typography>
  </Box>
);

const IndividualInterventions = ({ id, getTableData, memberList }) => {
  const { t } = useTranslation(["common"]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [interventionData, setInterventionData] = useState([]);
  
  const fetchInterventions = async (params = {}) => {
    setLoading(true);
    setApiError(null);
    const { page, rowCount } = params || {};
    const payload = {
      pageNumber: page || 1,
      limit: rowCount || 10,
      ...id,
    };
    
    try {
      const res = await getTableData(payload);
      
      let interventionData = res?.data || [];
      
      interventionData.data = (interventionData.data || []).map((item) => ({
        ...item,
        childrenApplied: (item.childrenApplied || []).map((childId) => {
          const member = memberList?.find((m) => m.id === childId);
          return member ? `${member.firstName} ${member.lastName}` : childId;
        }),
        expand: !!item.interventionNotes,
        expandedContent: generateExpandedContent(item),
      }));
      console.log("Intervention Data:", interventionData);
      setInterventionData(interventionData);
    } catch (err) {
      setApiError("Failed to load interventions");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInterventions();
  }, []);

  const getMappedMessage = (message, statusType) => {
    return StatusMapping[statusType]
      ? message + " - " + StatusMapping[statusType].label
      : message;
  };

  const columnDefinition = useMemo(
    () => [
      {
        id: "intervention_status",
        label: "Status",
        render: (row, value, expanded, setExpanded) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            {row.expand &&
              (expanded ? (
                <ExpandLessIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => setExpanded((prev) => !prev)}
                />
              ) : (
                <ExpandMoreIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => setExpanded((prev) => !prev)}
                />
              ))}
            <StatusFrame
              type={value === "Completed" ? "success" : "error"}
              icon={getStatusIcon(value || "Not Started")}
              label={
                value
                  ? getMappedMessage(
                      convertUnderscoreToText(value),
                      row?.followupType
                    )
                  : "Not Started"
              }
              statusType={row?.followupType}
              bgColor={StatusMapping[row?.followupType]?.color || "#BC104133"}
              borderColor={
                StatusMapping[row?.followupType]?.borderColor || "#BC1041"
              }
            />
          </Stack>
        ),
      },
      {
        id: "intervention",
        label: "Intervention",
        width: 500,
        render: (row) => (
          <>
            <BodyText
              value={row.intervention || "-"}
              sx={{
                whiteSpace: "pre-line",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                flex: 1,
              }}
            />
            <BodyText
              value={CommaseparateString(
                row.childrenApplied || [],
                " | ",
                " | "
              )}
              sx={{ fontSize: "0.875rem" }}
            />
          </>
        ),
      },
      {
        id: "HTQuestionDomainId",
        label: "Domain",
        render: (row) => getDomainIcon(row.HTQuestionDomainId),
      },
      {
        id: "milestone_name",
        label: "Milestone",
        width: 250,
        render: (row) => (
          <Stack direction="row" spacing={1}>
            {row.redFlag && (
              <img
                src="/static/icons/redFlag.svg"
                alt="red flag"
                style={{ width: 20, height: 20 }}
              />
            )}
            <BodyText value={row.milestone_name || "-"} />
          </Stack>
        ),
      },
      {
        id: "datesActive",
        label: "Dates active",
        render: (row) => {
          const start = formatDate(row.progressReportStartDate);
          const end = formatDate(row.progressReportSubmitedDate);
          return <BodyText value={`${start} - ${end}`} />;
        },
      },
      {
        id: "type",
        label: "Milestone Status Change",
        render: (row) => (
          <MoodImprovement
            fromEmoji={row?.assessment_modes?.current || ""}
            toEmoji={row?.assessment_modes?.next || "UNKNOWN"}
          />
        ),
      },
    ],
    []
  );

  return (
    <ReusableTrendTable
      columns={columnDefinition}
      title="All interventions"
      tableData={interventionData?.data || []}
      loading={loading}
      skeltonRowcount={6}
      apiError={apiError}
      onReload={fetchInterventions}
      t={t}
      enablePagination
      totalPageCount={interventionData.pageCount}
      totalItems={interventionData.totalCount}
    />
  );
};

IndividualInterventions.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export { getStatusIcon, getDomainIcon, formatDate, generateExpandedContent };

export default IndividualInterventions;
