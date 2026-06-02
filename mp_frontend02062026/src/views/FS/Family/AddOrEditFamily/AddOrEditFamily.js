import React, { useEffect } from "react";
import FamilyDetailForm from "../../Components/FamilyDetailForm/FamilyDetailForm";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";

const AddOrEditFamily = ({ close }) => {
  const { signedinUserRoleFS } = useContext(CommonDataContext)
  useAuthorization(
    null,
    signedinUserRoleFS,
    null,
    "FSFamily",
    false
  );
  
  return <FamilyDetailForm close={close} />;
};

export default AddOrEditFamily;
