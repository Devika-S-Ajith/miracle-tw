import { useState } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import PropTypes from "prop-types";
import { Box, Button, Collapse, ListItem } from "@mui/material";
import ChevronDownIcon from "../../../../assets/icons/ChevronDown";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import { useTranslation } from "react-i18next";
import { FosterShare } from "../../../../helpers/constant";


const NavItem = (props) => {
  const {
    active,
    children,
    depth,
    icon,
    orangeIcon,
    info,
    open: openProp,
    path,
    title,
    parentTitle,
    isOpenDrawer,
    style,
    ...other
  } = props;
  const [open, setOpen] = useState(openProp);
  const { t } = useTranslation(["common"]);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  let paddingLeft = 16;

  if (depth > 0) {
    paddingLeft = 32 + 8 * depth;
  }

  // Branch
  if (children) {
    return (
      <ListItem
        disableGutters
        sx={{
          display: "block",
          py: 0,
        }}
        {...other}
      >
        <Button
          id={title}
          endIcon={
            !open ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronDownIcon fontSize="small" />
            )
          }
          onClick={handleToggle}
          startIcon={icon}
          sx={{
            color: "text.secondary",
            fontWeight: "fontWeightMedium",
            justifyContent: "flex-start",
            pl: `${paddingLeft}px`,
            pr: "8px",
            py: "12px",
            textAlign: "left",
            textTransform: "none",
            width: "100%",
            backgroundColor:"yellow",
          }}
          variant="text"
        >
          {isOpenDrawer && (
            <Box sx={{ flexGrow: 1 }}>{t(`common:common.${title}`)}</Box>
          )}
          {info}
        </Button>
        <Collapse in={open}>{children}</Collapse>
      </ListItem>
    );
  }

  // Leaf
  return (
    <ListItem
      disableGutters
      sx={{
        display: "flex",
        py: 0,
        ml: isOpenDrawer && 2,
      }}
    >
      <Button
        id={title}
        component={path && RouterLink}
        startIcon={active ? orangeIcon : icon}
        sx={{
          "&:hover": active && {
            backgroundColor: "#0C1825",
          },
          color: "white",
          fontWeight: "fontWeightMedium",
          justifyContent: isOpenDrawer ? "flex-start" : "center",
          textAlign: isOpenDrawer ? "left" : "center",
          pl: `${paddingLeft}px`,
          mb: 1,
          border: "none",
          textTransform: "none",
          backgroundColor: active && "#0C1825",
          width: "100%",
          ...(active && {
            color: "primary.main",
            fontWeight: "fontWeightBold",
            "& svg": {
              color: "primary.main",
            },
          }),
          ...(style || {})
        }}
        variant={active && isOpenDrawer ? "contained" : "text"}
        to={path}
      >
        {isOpenDrawer && (
          <Box
            sx={{
              flexGrow: 1,
              whiteSpace: "normal",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              lineHeight: 1.2,
              textAlign: "left",
            }}
          >
            {parentTitle === FosterShare ? title : t(`common:common.${title}`)}
          </Box>
        )}
        {info}
      </Button>
    </ListItem>
  );
};

NavItem.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.node,
  depth: PropTypes.number.isRequired,
  icon: PropTypes.node,
  info: PropTypes.node,
  open: PropTypes.bool,
  path: PropTypes.string,
  title: PropTypes.string.isRequired,
};

NavItem.defaultProps = {
  active: false,
  open: false,
};

export default NavItem;
