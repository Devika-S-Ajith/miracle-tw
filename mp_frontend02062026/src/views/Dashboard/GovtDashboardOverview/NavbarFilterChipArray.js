import React, { useContext } from "react";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import ChipComponent from "../../../components/ChipComponent";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const NavbarFilterChipArray = () => {
  const { t } = useTranslation(["common"]);
  const { navbarFilterValues, setNavbarFilterValues } =
    useContext(CommonDataContext);
  // Function to remove a filter chip by its label and value
  const handleDelete = (chipToDelete) => {
    setNavbarFilterValues((prev) =>
      prev.filter((item) => {
        // If deleting a STATE chip, only remove REGION chips with matching stateId
        if (chipToDelete.key === "STATE") {
          if (item.key === "REGION" && item.stateId === chipToDelete.id) {
            return false;
          }
        }
        // Remove the chip itself
        return !(
          item.label === chipToDelete.label && item.value === chipToDelete.value
        );
      })
    );
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, px: 2 }}>
      {navbarFilterValues?.map((item) => (
        <ChipComponent
          key={`${item.label}-${item.value}`}
          label={`${t(`common:common.${item.label}`, item.label)} : ${
            item.value
          }`}
          onDelete={() => handleDelete(item)}
          sx={{
            backgroundColor: "#1D334B",
            color: "#fff",
          }}
        />
      ))}
      {navbarFilterValues?.length > 0 && (
        <Box
          component="span"
          sx={{
            cursor: "pointer",
            color: "#F37123",
            alignSelf: "center",
            fontWeight: 600,
          }}
          onClick={() => setNavbarFilterValues([])}
        >
          {t("common:common.Clear Filters", "Clear Filters")}
        </Box>
      )}
    </Box>
  );
};

export default NavbarFilterChipArray;
