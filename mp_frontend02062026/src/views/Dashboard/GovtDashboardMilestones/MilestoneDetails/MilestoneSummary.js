import React, { useContext, useState } from "react";
import CommonCard from "../../../../components/CommonCard";
import InfoTile from "../../../../components/InfoTile/InfoTile";
import SmallText from "../../../../components/SmallText/SmallText";
import RatingComponent from "../../../../components/RatingComponent/RatingComponent";
import { useTranslation } from "react-i18next";
import { Box, Skeleton } from "@mui/material";
import MoodImprovement from "../../GovtDashboardInterventions/Components/MoodImprovement";
import { useParams } from "react-router";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import {
  CommaseparateString,
  getNavbarFilterPayload,
} from "../../../../constants";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useEffect } from "react";

const colorMap = {
  thriving: "#E2F4F7",
  safe: "#F3F7E2",
  vulnerable: "#FFE7C6",
  "In crisis": "#F7DFE6",
};
const defaultCategories = [
  {
    label: "Incrisis",
    key: "inCrisisPercent",
    color: colorMap["In crisis"],
  },
  {
    label: "Vulnerable",
    key: "vulnerablePercent",
    color: colorMap["Vulnerable"],
  },
  {
    label: "Safe",
    key: "safePercent",
    color: colorMap["Safe"],
  },
  {
    label: "Thriving",
    key: "thrivingPercent",
    color: colorMap["Thriving"],
  },
];

const MilestoneSummary = ({ summaryMilestones }) => {
  console.log("summaryMilestones", summaryMilestones);
  const { t } = useTranslation(["common"]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  // Example decryption function (replace with your actual logic)
  const decryptId = (encryptedId) => {
    try {
      return decodeURIComponent(atob(encryptedId));
    } catch (e) {
      return "";
    }
  };

  const decryptedId = decryptId(id);
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);
  const [apiError, setApiError] = useState(false);
  const [summaryData, setSummaryData] = useState([]);

  const getAllInterventions = async () => {
    setLoading(true);
    setApiError(null);

    const payload = {
      ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
      ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
      milestoneNameFilter: decryptedId,
      orderByField: [["interventionRating", "DESC"]],
      pageNumber: 1,
    };
    if (payload.countryFilter === null) {
      return;
    }
    try {
      setLoading(true);
      const resp = await APIS.GetAllInterventionsForMilestone(payload);
      if (resp?.data?.data?.length) {
        const sorted = resp.data.data
          .filter((item) => item.interventionRating != null)
          .sort((a, b) => b.interventionRating - a.interventionRating);
        const highestRating = sorted[0]?.interventionRating;
        let highestRated = [];
        if (highestRating && highestRating > 0) {
          highestRated = sorted.filter(
            (item) => item.interventionRating === highestRating
          );
          // Use highestRated as needed
        }
        setSummaryData(highestRated);
      }
      setLoading(false);
    } catch (error) {
      setApiError(true);
    } finally {
      setLoading(false);
    };
  }
  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType) {
      getAllInterventions();
    }
  }, [localStorage.getItem("userRegion"), signedinOrgType]);
  const SummaryTitle = (
    <MoodImprovement
      fromEmoji={summaryMilestones[0]?.mode?.toUpperCase() || "UNKNOWN"}
      toEmoji={summaryMilestones[1]?.mode?.toUpperCase() || "UNKNOWN"}
    />
  );
  
  const SummaryDescription = (
    <>
      <SmallText
        sx={{ fontSize: 16, mb: 1 }}
        value={
          summaryData?.length
            ? t("common:infoCard.Intervention summary", {
                interventions: CommaseparateString(
                  summaryData.map((item) => item.intervention),
                  " and "
                ),
              })
            : t(
                "common:infoCard.There are no interventions associated with this milestone"
              )
        }
      />
      {summaryData?.length > 0 && (
        <RatingComponent rating={summaryData[0]?.interventionRating} readOnly />
      )}
    </>
  );

  const generateSubtitle = () => {
    if (summaryMilestones.length === 2) {
      const startMode = summaryMilestones[0]?.mode;
      const endMode = summaryMilestones[1]?.mode;

      const startIndex = defaultCategories.findIndex(
        (cat) => cat.label.toUpperCase() === startMode?.toUpperCase()
      );
      const endIndex = defaultCategories.findIndex(
        (cat) => cat.label.toUpperCase() === endMode?.toUpperCase()
      );
      if (startIndex === -1 || endIndex === -1) return "";

      if (endIndex > startIndex) {
        if (endIndex - startIndex > 1) {
          return t(
            "common:infoCard.Milestone improves significantly over time",
            "This milestone tends to improve significantly over time"
          );
        }
        return t(
          "common:infoCard.Milestone improves over time",
          "This milestone tends to improve over time"
        );
      } else if (endIndex === startIndex) {
        return t(
          "common:infoCard.Milestone remains stable over time",
          "This milestone tends to remain stable over time"
        );
      } else {
        return t(
          "common:infoCard.Milestone gets worse over time",
          "This milestone tends to get worse over time"
        );
      }
    } else if (summaryMilestones.length === 1) {
      const mode = summaryMilestones[0]?.mode;
      if (mode) {
        const modeUpper = mode.toUpperCase();
        if (modeUpper === "IN CRISIS" || modeUpper === "VULNERABLE") {
          return t("common:infoCard.The majority of cases need some assistance with this milestone");
        } else if (modeUpper === "SAFE" || modeUpper === "THRIVING") {
          return t("common:infoCard.This milestone is off to a good start for the majority of cases");
        }
      }
    }
  };

  return (
    <CommonCard title="Summary" apiError={apiError} onReload={getAllInterventions}>
      {loading ? (
        <Skeleton
          variant="rectangular"
          width={"100%"}
          height={200}
          sx={{ borderRadius: 2 }}
        />
      ) : (
        <Box mt>
          <InfoTile
            bgcolor={colorMap[summaryMilestones[0]?.mode] || "#F0F0F0"}
            // height={200}
            title={SummaryTitle}
            subTitle={generateSubtitle()}
            description={SummaryDescription}
          />
        </Box>
      )}
    </CommonCard>
  );
};

export default MilestoneSummary;
