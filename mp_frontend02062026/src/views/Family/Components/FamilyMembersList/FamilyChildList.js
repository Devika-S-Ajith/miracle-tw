import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import ChildDelete from "../../../../assets/icons/ChildDelete";
import { calculateAge } from "../../../../helpers/helperFunction";
import Cursor from "quill/blots/cursor";


const FamilyChildList = ({selectedChildCollection,removeChildFromFamily}) => {

    const triggerRemoveChild = (childId) => {
        removeChildFromFamily(childId);
    }
   
    return (
        <div>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 1,
                }}
            >
                {selectedChildCollection.map((member) => (
                    <Box
                        key={member.childId} // Always add a unique key when mapping over items
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#F3F6FA",
                            border: "1px solid #D9D9D9",
                            padding: 2,
                            borderRadius: 1,
                        }}
                    >
                        {/* Main Content */}
                        <Grid container spacing={4} flex={1}>
                            <Grid item md={3} xs={12}>
                                <Typography>{member.firstName} {member?.lastName}</Typography>
                            </Grid>
                            <Grid item md={3} xs={12}>
                                {member?.isChild ? <Typography>{calculateAge(member?.birthDate,t)} yo {member?.gender}</Typography>:<Typography>{member?.relation}</Typography>}
                            </Grid>
                            <Grid item md={3} xs={12}>
                                <Typography>{member?.phoneNumber}</Typography>
                            </Grid>
                            <Grid item md={3} xs={12}
                                sx={{
                                    display: "flex",
                                    alignItems: "left",
                                    justifyContent: "flex-end",
                                    gap: 2, // Adjust spacing as needed
                                    cursor: "pointer",
                                }}
                            >
                                {member?.isChild && <ChildDelete onClick={()=>triggerRemoveChild(member.childId)} color="disabled" fontSize="medium" />}
                                <EditIcon />
                            </Grid>
                        </Grid>

                        {/* Action Icons */}

                    </Box>
                ))}

            </Box>
        </div>
    );
};


export default FamilyChildList;