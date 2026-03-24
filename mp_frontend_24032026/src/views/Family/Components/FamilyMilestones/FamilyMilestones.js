import { useParams } from "react-router-dom";
import APIS from "../../../../common/hooks/UseApiCalls";
import MilestonesTable from "../../../../components/MilestonesTable/MilestonesTable";

/**
 * FamilyMilestones - Entry point for family milestones
 * Uses HTFamilyId to fetch data
 */
const FamilyMilestones = ({ familyMembers, familyName }) => {
  const { id } = useParams(); // HTFamilyId

  // Wrapper function for getting family milestones
 
  const getFamilyMilestones = async (page, rowCount) => {
      return await APIS.GetFamilyMilestoneList({ 
        HTFamilyId: id, 
        limit: rowCount, 
        pageNumber: page
      });
    };

  // Wrapper function for getting interventions for a family milestone
  const getFamilyInterventions = async (milestoneName) => {
    return await APIS.GetInterventionForMilestoneList({ 
      HTFamilyId: id, 
      milestoneName: milestoneName 
    });
  };

  return (
    <MilestonesTable
      entityId={id}
      getMilestonesApi={getFamilyMilestones}
      getInterventionsApi={getFamilyInterventions}
      title="All milestones"
      type="FAMILY_MILESTONE"
      familyMembers={familyMembers}
      familyName={familyName}
    />
  );
};

export default FamilyMilestones;