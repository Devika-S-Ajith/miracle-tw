import React from "react";
import APIS from "../../../common/hooks/UseApiCalls";
import IndividualInterventions from "../../../components/IndividualInterventions";
const ChildInterventions = ({childId}) => {
  const getChildInterventions = async (payload) => {
    return await APIS.GetChildInterventionList({...payload, viewClosedIntervention: true});
  };
  return (
     <IndividualInterventions id={{TWChildId: childId}} getTableData={getChildInterventions} />
  );
};
export default ChildInterventions;
