import { Grid } from "@mui/material";
import LabelValue from "../../../../components/LabelValue";

const ParentsDetails = ({ data, tag = "Primary caregiver" }) => {
  return (
    <Grid container rowSpacing={1.5} columnSpacing={1} my>
      <Grid item xs={6}>
        <LabelValue
          label={`${tag} name`}
          value={data ? `${data?.firstName} ${data?.lastName}` : "-"}
        />
      </Grid>
      <Grid item xs={6}>
        <LabelValue label={`${tag} Email`} value={data?.email} />
      </Grid>
    </Grid>
  );
};

export default ParentsDetails;
