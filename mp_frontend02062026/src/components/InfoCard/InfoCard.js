import { Box, Skeleton, Divider } from "@mui/material";
import CommonCard from "../CommonCard/CommonCard";
import SmallText from "../SmallText/SmallText";
import { useTranslation } from "react-i18next";

const InfoCard = ({
  title,
  data,
  loading = true,
  SkeletonCount = 5,
  apiError = false,
  onReload = () => {},
}) => {
  const { t } = useTranslation(["common"]);
  return (
    <CommonCard
      title={t(`common:infoCard.${title}`, title)}
      apiError={apiError}
      onReload={onReload}
    >
      <Box>
        {!loading ? (
          data
            .filter((item) => item.access === undefined || item.access)
            .map((item, index) => (
              <Box key={index}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" }, // Stack on mobile, side-by-side on larger screens
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    p: 2,
                    gap: { xs: 1, sm: 2 }, // Smaller gap on mobile
                    minHeight: "auto",
                  }}
                >
                  <Box
                    sx={{
                      flex: { xs: "none", sm: "0 0 auto" },
                      maxWidth: { xs: "100%", sm: "70%" },
                      wordBreak: "break-word",
                      mb: { xs: 0.5, sm: 0 }, // Small margin bottom on mobile only
                    }}
                  >
                    <SmallText
                      value={t(`common:infoCard.${item.label}`, item.label) + ":"}
                    />
                  </Box>

                  <Box
                    sx={{
                      flex: { xs: "none", sm: "1 1 auto" },
                      textAlign: { xs: "left", sm: "right" },
                      wordBreak: "break-word",
                      minWidth: 0,
                    }}
                  >
                    <SmallText
                      value={item.value}
                    />
                  </Box>
                </Box>
                <Divider />
              </Box>
            ))
        ) : (
          <>
            {Array.from({ length: SkeletonCount }).map((_, index) => (
              <Box key={index}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                  }}
                >
                  <SmallText value={<Skeleton width={100} />} />
                  <SmallText value={<Skeleton width={40} />} />
                </Box>
                <Divider />
              </Box>
            ))}
          </>
        )}
      </Box>
    </CommonCard>
  );
};

export default InfoCard;
