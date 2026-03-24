import { useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { CommonDataContext } from "./common/contexts/CommonDataContext";

const PageChangeHandler = () => {
  const location = useLocation();
  const { getUserRegion } = useContext(CommonDataContext);

  useEffect(() => {
    // Only call getUserRegion when pathname changes
    getUserRegion();
  }, [location.pathname]);

  return null;
};

export default PageChangeHandler;
