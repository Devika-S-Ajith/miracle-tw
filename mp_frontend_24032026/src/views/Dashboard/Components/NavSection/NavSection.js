import PropTypes from "prop-types";
import { matchPath } from "react-router-dom";
import { List, ListSubheader } from "@mui/material";
import NavItem from "../NavItem";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import Collapse from "@mui/material/Collapse";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import {
  Admin,
  FosterShare,
  ThriveScale,
  UNASSIGNED,
} from "../../../../helpers/constant";

const renderNavItems = ({
  depth = 0,
  title: parentTitle,
  items,
  pathname,
  isOpenDrawer,
  open,
  setOpen,
  t,
}) => (
  <List disablePadding dense>
    {items.reduce(
      (acc, item) =>
        reduceChildRoutes({
          acc,
          parentTitle,
          item,
          pathname,
          depth,
          open,
          isOpenDrawer,
          setOpen,
          t,
        }),
      []
    )}
  </List>
);

const reduceChildRoutes = ({ acc,parentTitle, pathname, item, depth, isOpenDrawer }) => {
  const key = `${item.title}-${depth}`;
  const exactMatch = item.path
    ? !!matchPath(
        {
          path: item.path,
          end: true,
        },
        pathname
      )
    : false;

  if (item.path === "/dashboard") {
    acc.push(
      <NavItem
        active={exactMatch}
        depth={depth}
        icon={item.icon}
        orangeIcon={item.orangeIcon}
        info={item.info}
        key={key}
        id={item.title}
        path={item.path}
        title={item.title}
        parentTitle={parentTitle}
        isOpenDrawer={isOpenDrawer}
      />
    );
  } else {
    const partialMatch = item.path
      ? !!matchPath(
          {
            path: item.path,
            end: false,
          },
          pathname
        )
      : false;
    acc.push(
      <NavItem
        active={partialMatch}
        depth={depth}
        icon={item.icon}
        orangeIcon={item.orangeIcon}
        info={item.info}
        key={key}
        id={item.title}
        path={item.path}
        title={item.title}
        parentTitle={parentTitle}
        isOpenDrawer={isOpenDrawer}
        style={item?.style}
      />
    );
  }

  return acc;
};

const NavSection = (props) => {
  const {
    items,
    pathname,
    title,
    isDefault,
    titleShortName,
    isOpenDrawer,
    currentSection,
    drawerOpenHandler,
    style,
    ...other
  } = props;
  const { t } = useTranslation(["common"]);
  const { signedinUserRoleHT, signedinUserRoleFS } =
    useContext(CommonDataContext);
  const [open, setOpen] = useState(isDefault);

  const toggleList = (title) => {
    setOpen(!open);
    drawerOpenHandler(title);
  };

  useEffect(() => {
    if (currentSection) {
      if (currentSection.title === title) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    }
  }, [currentSection]);

    const [showBox, setShowBox] = useState(false);
      useEffect(() => {
        let timer;
        if (isOpenDrawer) {
          timer = setTimeout(() => setShowBox(true), 100);
        } else {
          setShowBox(false);
        }
        return () => clearTimeout(timer);
      }, [isOpenDrawer]);
  return (
    ((title == FosterShare && signedinUserRoleFS !== UNASSIGNED) ||
      (title == ThriveScale && signedinUserRoleHT !== UNASSIGNED) ||
      title == Admin) ? (
      <List
        subheader={
          <ListSubheader
            id={title}
            disableGutters
            disableSticky
            sx={{
              color: open ? "#F37123" : "white",
              fontSize: "1rem",
              lineHeight: 2,
              //fontWeight: 100,
              ml: 2,
              cursor: "pointer",
              display: "flex",
              alignItems: "center", // Aligns items vertically in the center
            }}
            onClick={() => toggleList(title)}
          >
            {/* <span>
              {isOpenDrawer ? t(`common:common.${title}`) : titleShortName}
            </span> */}
            <span>
              {isOpenDrawer && showBox
                ? (title === FosterShare ? title : t(`common:common.${title}`, title)) 
                : titleShortName}
            </span>
            <span
              style={{
                position: isOpenDrawer && "absolute",
                // position: isOpenDrawer,
                // right: isOpenDrawer && "8px",
                right: isOpenDrawer && "-15px",
              }}
            >
              {open ? (
                <ArrowDropUpIcon sx={{ mt: 1.3 }} fontSize="large" />
              ) : (
                <ArrowDropDownIcon sx={{ mt: 1.3 }} fontSize="large" />
              )}
            </span>
          </ListSubheader>
        }
        {...other}
      >
        <Collapse in={open} unmountOnExit>
          {renderNavItems({
            items,
            title,
            pathname,
            open,
            setOpen,
            t,
            isOpenDrawer,
          })}
        </Collapse>
      </List>
    ) : <>{renderNavItems({
            items,
            title,
            pathname,
            open,
            setOpen,
            t,
            isOpenDrawer,
          })}</>
  );
};

NavSection.propTypes = {
  items: PropTypes.array,
  pathname: PropTypes.string,
  title: PropTypes.string,
};

export default NavSection;
