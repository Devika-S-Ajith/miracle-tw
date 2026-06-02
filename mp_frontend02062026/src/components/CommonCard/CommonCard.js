import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import PropTypes from "prop-types";
import Heading from "../Heading";
import SmallText from "../SmallText/SmallText";
import ErrorWithReload from "../../views/Dashboard/GovtDashboardOverview/Components/ErrorWithReload";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const CommonCard = ({
  title,
  subtitle,
  children,
  apiError,
  flexibleHeight = true,
  onReload = () => {},
}) => {
  const { t } = useTranslation(["common"]);
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #D6DBDE",
        ...(flexibleHeight && {
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }),
      }}
    >
      {/* Header */}
      <CardHeader
        title={
          <>
            <Heading heading={t(`common:infoCard.${title}`, title)} />
            {subtitle && <SmallText value={t(`common:infoCard.${subtitle}`, subtitle)} />}
          </>
        }
      />

      {/* Horizontal divider after header */}
      <Divider sx={{ mx: 2, borderBottomWidth: 2, mb: 1 }} />

      {/* Content */}
      <CardContent sx={{ height: "100%", py: 0 }}>
        {apiError ? (
          <Box
            sx={{
              py: 0,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <ErrorWithReload
              onReload={onReload} // Pass the onReload function to handle reload
            />
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

CommonCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default CommonCard;
