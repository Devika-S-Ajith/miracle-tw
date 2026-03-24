import React, { useCallback, useContext, useState } from "react";
import {
  Box,
  Divider,
  Popover,
} from "@mui/material";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";
import FilterPopover from "./FilterPopover";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import APIS from "../../../common/hooks/UseApiCalls";

const DashboardFilterSection = ({openMobile}) => {
  const { t } = useTranslation(["common"]);
  const { navbarFilterValues } =
    useContext(CommonDataContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => setAnchorEl(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
    UpdateDashboardDataViews()
  };

  const UpdateDashboardDataViews = useCallback(async () => {
    try {
      await APIS.UpdateDashboardDataViews();
    } catch (error) {
      console.error("UpdateDashboardDataViews error:", error);
    }
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <Box display="flex" gap={1}  mt={1} borderRadius={1}  onClick={handleClick} sx={{ cursor: "pointer" }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, pl: 2, pt: 2 }}
          aria-describedby={id}
        >
          {/* Use MUI FilterList icon instead of img */}
          <FilterAltIcon
            sx={{ color: !navbarFilterValues?.length ? "#fff" : "#F37123" }}
            color={"#fff"}
            fontSize="small"
          />

          {openMobile&&<Box sx={{ color: !navbarFilterValues?.length ? "#fff" : "#F37123", fontWeight: 500, fontSize: 16 }}>
            {t("common:common.Filters")}
          </Box>}
        </Box>
        

      </Box>
      <Divider sx={{ my: 1, ml: 2, mr: 5, backgroundColor:  !navbarFilterValues?.length ? "#fff" : "#F37123" }} />
      <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          // onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          disableEnforceFocus
          disableAutoFocus
          disableRestoreFocus
          // hideBackdrop
          
          slotProps={{
            paper: {
              sx: {
                boxShadow: "0 0 0 100vmax rgba(0,0,0,0.6)",
                background: "transparent",
              },
            },
          }}
          // disableEscapeKeyDown
          // Prevent closing on outside click
          onClose={(event, reason) => {
            if (reason === "backdropClick") return;
            handleClose();
          }}
        >
          <FilterPopover handleClose={handleClose} />
        </Popover>
    </>
  );
};

export default DashboardFilterSection;
