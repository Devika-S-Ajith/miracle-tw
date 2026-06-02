import React, { useContext, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { calculateAgeReverseOrder, getLocationNames } from "../../../../helpers/helperFunction";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import ChildIcon from "../../../../assets/icons/childIcon";
import { ModalService } from "../../../../components/Modal";
import { dateFormatter, dateFormatterRevers } from "../../../../constants";

const ChildForFamily = ({ child, selectedChildId, getAddedChild, familyCaseWorker,caseworkerName }) => {
    const { locationList } = useContext(CommonDataContext);
    const { t } = useTranslation(["common"]);
    const [addedChildren, setAddedChildren] = useState(selectedChildId ?? []);
   
    const stringToDate = (dateString) => {
        const [day, month, year] = dateString.split("/");
        return new Date([month, day, year].join("/"));
      };


    const triggerAction = (isCaseUpdated = false) => {
        const updatedChild = { ...child , birthDate: stringToDate(child.birthDate),isExistingChild:false };
        setAddedChildren((prevAddedChildren) => [...prevAddedChildren, child.id]);
        isCaseUpdated ? getAddedChild({ ...updatedChild, TWUserId: familyCaseWorker }) : getAddedChild(updatedChild);
    };

    const handleOnClickChildAdd = () => {
        if (child?.TWUserId !== familyCaseWorker) {
            ModalService.open(({ close }) => (
                <Box sx={{ padding: 2 }}>
                    {child.userFirstName && child.userLastName && (
                        <Typography>
                            {t("common:common.This child is currently assigned to Case Worker")} {child.userFirstName} {child.userLastName}.
                        </Typography>
                    )}
                    <Typography>
                        {t("common:common.By adding this child to this family, this child will automatically be reassigned to the family’s Case Worker")} {caseworkerName}.
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, marginTop: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={close}
                            id="update-caseworker-no-btn"
                        >
                            {t("common:common.No")}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => { triggerAction(true); close(); }}
                            id="update-caseworker-yes-btn"
                        >
                            {t("common:common.Yes,Update case worker")}
                        </Button>
                    </Box>
                </Box>
            ), {
                modalTitle: t("common:common.Update case worker"),
                width: "30%",
                hideModalFooter: true,
                enableClose: true,
            });
        } else {
            triggerAction();
        }
    }

    const isChildAdded = addedChildren.includes(child.id);

    return (
        <Box
            display="flex"
            gap={2}
            alignItems="center"
            justifyContent="space-between"
            border={1}
            borderColor="#778791"
            borderRadius="5px"
            px={2}
            py="2px"
            sx={{
                width: "100%",
                backgroundColor: child?.familyName || isChildAdded ? "#f5f5f5" : "#ffffff", // Greyed-out background
                opacity: child?.familyName || isChildAdded ? 0.6 : 1, // Lower opacity if already in family
                pointerEvents: child?.familyName || isChildAdded ? "none" : "auto", // Disable interaction
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="center" width="40px" height="40px">
                {child?.fileUrl ? (
                    <img src={child.fileUrl} alt="Child profile picture" width="40" height="40" style={{ borderRadius: "50%" }} />
                ) : (
                    <ChildIcon color="disabled" fontSize="large" />
                )}
            </Box>
            <Box flexGrow={1} display="flex" flexDirection="column" gap="0px">
                <Typography
                    fontWeight={500}
                    color="#1E1C1C"
                    variant="h6"
                >
                    {`${child.firstName} ${child.lastName ?? ""} (${child.gender})`}
                </Typography>
                <Typography variant="body1">
                    {`${calculateAgeReverseOrder(child?.birthDate)} (${dateFormatterRevers(
                        child?.birthDate,
                        "short"
                    )})`}
                </Typography>

               
                <Typography variant="body1">
                    {`${child.city}, ${getLocationNames(locationList, child.HTCountryId, child.HTStateId)}`}
                </Typography>
                {child?.familyName && (
                    <Typography variant="body1" color="textSecondary">
                        Member of: {child?.familyName}
                    </Typography>
                )}
            </Box>
            {!(child?.familyName || isChildAdded) && (
                <Button
                    variant="contained"
                    onClick={handleOnClickChildAdd}
                    id="add-child-to-family-btn"
                >
                    {t("common:common.Add")}
                </Button>
            )}
        </Box>

    );
};

export default ChildForFamily;
