import { Stack } from "@mui/system";
import { ProfileCard } from "./ProfileCard";

export const ChildrenProfileStack = ({ familyMembers, childrenAppliedTo, familyAppliedTo }) => {
    // Get child members based on childrenAppliedTo IDs
    const childMembers = childrenAppliedTo
        ?.map(childId => 
            familyMembers.find(
                member => member.memberType === 'Child' && member.id == childId
            )
        )
        .filter(Boolean) || [];

    // Early return if no profiles to display
    if (!childMembers.length && !familyAppliedTo) {
        return null;
    }

    return (
        <Stack
            direction="row"
            spacing={2}
            sx={{
                overflowX: 'auto',
                py: 1
            }}
        >
            {/* Family profile (if applicable) */}
            {familyAppliedTo && (
                <ProfileCard
                    key={`family-${familyAppliedTo}`}
                    imageUrl={familyAppliedTo}
                    name={familyAppliedTo}
                    initials={familyAppliedTo?.[0] || ""}
                />
            )}

            {/* Child member profiles */}
            {childMembers.map((member) => {
                const fullName = `${member.firstName} ${member.lastName}`;
                const initials = !member.fileUrl 
                    ? `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`
                    : "";

                return (
                    <ProfileCard
                        key={member.id}
                        imageUrl={member.fileUrl}
                        name={fullName}
                        initials={initials}
                    />
                );
            })}
        </Stack>
    );
};