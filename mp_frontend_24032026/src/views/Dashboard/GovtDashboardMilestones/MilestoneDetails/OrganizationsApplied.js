import React, { useContext, useEffect, useState } from "react";
import { Box, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import CommonCard from "../../../../components/CommonCard";
import SmallText from "../../../../components/SmallText/SmallText";
import OrganizationAppliedSkeleton from "./OrganizationAppliedSkelton";
import { getNavbarFilterPayload } from "../../../../constants";
import { useNavigate, useParams } from "react-router";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
// Example decryption function (replace with your actual logic)
export const decryptId = (encryptedId) => {
  try {
    return decodeURIComponent(atob(encryptedId));
  } catch (e) {
    return "";
  }
};

const OrganizationsApplied = () => {
  const { t } = useTranslation(["common"]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [organizationsApplied, setOrganizationsApplied] = useState([]);
  const { navbarFilterValues, linkedAccounts, signedinOrgType } = useContext(CommonDataContext);
  const { id } = useParams();
  const decryptedId = decryptId(id);

  const getOrganizationsApplied = async (params = {}) => {
    setLoading(true);
    setApiError(null);

    const payload = {
      ...getNavbarFilterPayload(navbarFilterValues, linkedAccounts),
      ...(signedinOrgType !== "6" ? { accountFilter: [localStorage.getItem("orgId")] } : {}),
      milestoneNameFilter: decryptedId,
    };
    if (payload.countryFilter === null) {
      return;
    }
    try {
      const response = await APIS.GetOrganizationsApliedForMilestone(payload);
      let data = response.data?.data;

      setOrganizationsApplied(data || []);

      setApiError(null);
    } catch (err) {
      setApiError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userRegion") && signedinOrgType) getOrganizationsApplied();
  }, [localStorage.getItem("userRegion"), signedinOrgType]);

  return (
    <CommonCard
      title={`${t(
        "common:infoCard.Organizations this milestone is applied to",
        "Organizations this milestone is applied to"
      )} (${loading ? 0 : organizationsApplied.length})`}
    >
      {loading ? (
        <OrganizationAppliedSkeleton />
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          sx={{
            minHeight: 300,
            maxHeight: {
              xs: 300,
              sm: 400,
              md: 600,
              lg: 1000,
            },
            overflowY: "auto",
            pr: 2,
            py: 1,
          }}
        >
          {organizationsApplied?.map((item, index) => (
            <React.Fragment key={index}>
              <SmallText
                value={item.accountName}
                sx={{ cursor: "pointer", color: "#F37123" }}
                onClick={() =>
                  navigate(
                    `/governmentDashboardOrganizations/${
                      item.TWAccountId
                    }?accountName=${encodeURIComponent(item.accountName)}`
                  )
                }
              />
              <Divider sx={{ my: 2 }} />
            </React.Fragment>
          ))}
        </Box>
      )}
    </CommonCard>
  );
};

export default OrganizationsApplied;
