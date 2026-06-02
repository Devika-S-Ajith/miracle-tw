import { Card, CardContent, Divider, Grid, Box } from "@mui/material";
import Heading from "../../../../components/Heading";
import Skeleton from "@mui/material/Skeleton";
import ErrorWithReload from "../../GovtDashboardOverview/Components/ErrorWithReload";
import InfoTile from "../../../../components/InfoTile/InfoTile";
import NoDataFoundText from "../../GovtDashboardOverview/Components/NoDataFoundText";

function getMdSize(dataLength) {
  if (dataLength % 4 === 0) return 3; // 4 per row
  if (dataLength % 3 === 0) return 4; // 3 per row
  if (dataLength % 2 === 0) return 6; // 2 per row
  return 12 / dataLength; // fallback: all in one row
}

const OrganizationOverviewCard = ({
  data,
  title,
  loading = false,
  apiError = false,
  onReload,
  colSize = 3,
}) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Heading heading={title} />
    </CardContent>
    <Divider sx={{ mx: 2 }} />
    <Grid container spacing={2} sx={{ p: 2 }}>
      {apiError ? (
        <Grid item xs={12}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight={120}
          >
            <ErrorWithReload
              message="Oops, something went wrong on our end. Please try again"
              onReload={() => onReload()} // Pass the onReload function to handle reload
            />
          </Box>
        </Grid>
      ) : loading ? (
        Array.from({ length: data?.length || 4 }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        ))
      ) : !data || data.length === 0 ? (
        <Box my={3} width="100%">
          <NoDataFoundText />
        </Box>
      ) : (
        data?.map((item, idx) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={colSize}
            key={item.label}
          >
            <InfoTile
              key={idx}
              title={item.value}
              description={item.label}
              subTitle={item.subtitle}
              bgcolor="#F3F6FA"
              height={1}
            />
          </Grid>
        ))
      )}
    </Grid>
  </Card>
);

export default OrganizationOverviewCard;