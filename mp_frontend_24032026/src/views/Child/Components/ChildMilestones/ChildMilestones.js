
import { useParams } from "react-router-dom";
import APIS from "../../../../common/hooks/UseApiCalls";
import MilestonesTable from "../../../../components/MilestonesTable/MilestonesTable";

/**
 * ChildMilestones - Entry point for child milestones
 * Uses HTChildId to fetch data
 */
const ChildMilestones = ({familyMembers, familyName}) => {
  const { id } = useParams(); // HTChildId

  // Wrapper function for getting child milestones
  const getChildMilestones = async (page, rowCount) => {
    return await APIS.GetChildMilestoneList({ 
      HTChildId: id, 
      limit: rowCount, 
      pageNumber: page
    });
  };

  // Wrapper function for getting interventions for a child milestone
  const getChildInterventions = async (milestoneName) => {
    return await APIS.GetInterventionForMilestoneListChild({ 
      HTChildId: id, 
      milestoneName: milestoneName 
    });
  };

  return (
    <MilestonesTable
      entityId={id}
      getMilestonesApi={getChildMilestones}
      getInterventionsApi={getChildInterventions}
      title="All milestones"
      type="CHILD_MILESTONE"
      familyMembers={familyMembers}
      familyName={familyName}

    />
  );
};

export default ChildMilestones;