import CustomCircularProgress from "./CustomCircularProgress";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const SummaryCount = (props) => {
  const { summaryCountLoading, count, label, redirectLink, filter } = props;
  const { t } = useTranslation(["common"]);

  return (
    <>
      {summaryCountLoading ? (
        <CustomCircularProgress />
      ) : (
        <>
          {redirectLink? <Link
            sx={{ flex: 1 }}
            style={{
              fontWeight: "bold",
              color: "#F37123",
              textDecoration: "none",
            }}
            color="textSecondary"
            to={redirectLink}
            underline="none"
            variant="h6"
            state={filter}
          >
            {count || 0}
          </Link> :
            <Typography variant="body2" color="textSecondary">
              {count || 0}
            </Typography>}
          <Typography variant="body2" color="textSecondary">
            {t(`${label}`)}
          </Typography>
        </>
      )}
    </>
  );
};

export default SummaryCount;
