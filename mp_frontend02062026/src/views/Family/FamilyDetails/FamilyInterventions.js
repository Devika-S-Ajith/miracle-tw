import React from "react";
import APIS from "../../../common/hooks/UseApiCalls";
import IndividualInterventions from "../../../components/IndividualInterventions";
const FamilyInterventions = ({familyId, memberList}) => {
  const getFamilyInterventions = (payload) => {
      return APIS.GetFamilyInterventionList(payload);
    };
  return (
     <IndividualInterventions id={{HTFamilyId: familyId}} getTableData={getFamilyInterventions} memberList={memberList} />
  );
};
export default FamilyInterventions;
