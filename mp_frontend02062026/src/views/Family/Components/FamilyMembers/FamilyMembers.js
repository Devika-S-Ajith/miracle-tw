import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";
import AddChildForm from "../../../Child/Components/AddChildForm";
import { ModalService } from "../../../../components/Modal";
import AddMemberModal from "../FamilyMembersList/AddMemberModal";
import { calculateAge } from "../../../../helpers/helperFunction";
import { dateFormatter } from "../../../../constants";
import PropTypes from "prop-types";

const FamilyMembers = (props) => {
  const {
    familyName,
    familyMembers,
    familyId,
    getFamilyMembers,
    isActiveFamily,
    getChildren,
    type,
    ...other
  } = props;
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const { id: currentId } = useParams();

  const handleClose = (close) => {
    close();
    getFamilyMembers();
    getChildren?.();
  };

  const getMemberSubInfo = (member) => {
    if (member.memberType === "Child") {
      return `${calculateAge(member.birthDate, t)} (${dateFormatter(
        member?.birthDate,
        "short"
      )}) | ${t(`common:common.${member.gender}`, member.gender)} ${
        member.isPrimaryCareGiver
          ? " | " + t("common:common.Primary Caregiver")
          : ""
      }`;
    }
    let info = ((member.memberType !== "Child" &&member.otherRelation) || member.relation) ?? "";
    if (member.isPrimaryCareGiver) {
      info += " | " + t("common:common.Primary Caregiver");
    } else {
      info += member.memberType ? ` | ${member.memberType}` : "";
    }
    return info;
  };

  return (
    <Card {...other}>
      <CardHeader
        title={
          type !== "FAMILY"
            ? familyName?.toUpperCase() +
              " " +
              t("common:common.Family Members") +
              " (" +
              (familyMembers?.length ?? 0) +
              ")"
            : t("common:common.Family Members") +
              " (" +
              (familyMembers?.length ?? 0) +
              ")"
        }
      />
      <Divider sx={{ mx: 2 }} />
      <CardContent sx={{ pt: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 200, width: '30%' }}>{t("common:common.Name")}</TableCell>
                <TableCell>{t("common:family.Contact information")}</TableCell>
                <TableCell>{t("common:common.Notes")}</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {familyMembers
                ?.sort((a, b) => (a.isPrimaryCareGiver ? -1 : 1))
                .map((member) => (
                  <TableRow key={member.id}>
                    {/* Name and sub roles */}
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight={400}>
                        {member.firstName} {member.lastName ?? ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getMemberSubInfo(member)}
                      </Typography>
                    </TableCell>
                    {/* Contact information */}
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Typography variant="subtitle1" fontWeight={400}>
                        {member.phoneNumber || ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.email && (
                          <>
                            {member.email}
                          </>
                        )}
                      </Typography>
                    </TableCell>
                    {/* Notes */}
                    <TableCell>
                      <Typography variant="body2">
                        {member.notes}
                        {member.occupation ? ` ${member.occupation}` : ""}
                      </Typography>
                    </TableCell>
                    {/* Actions */}
                    <TableCell align="right">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="flex-end"
                        gap={1}
                      >
                        {member?.memberType === "Child"
                          ? member.isActive && (
                              <EditIcon
                                onClick={() => {
                                  ModalService.open(
                                    ({ close }) => (
                                      <AddChildForm
                                        family={{
                                          onClose: () => handleClose(close),
                                          familyId: familyId,
                                        }}
                                        childId={member?.id}
                                      />
                                    ),
                                    {
                                      modalTitle: t("common:child.Edit Child"),
                                      width: "60%",
                                      maxHeight: "80%",
                                      overflow: "scroll",
                                      hideModalFooter: true,
                                      enableClose: true,
                                    }
                                  );
                                }}
                                sx={{ cursor: "pointer" }}
                              />
                            )
                          : isActiveFamily && (
                              <EditIcon
                                onClick={() => {
                                  ModalService.open(
                                    ({ close }) => (
                                      <AddMemberModal
                                        onClose={() => handleClose(close)}
                                        member={member}
                                        id={familyId}
                                        isFromChildDetail={true}
                                        isDisabled={false}
                                      />
                                    ),
                                    {
                                      modalTitle: t(
                                        "common:family.Add family member"
                                      ),
                                      width: "50%",
                                      hideModalFooter: true,
                                      enableClose: true,
                                    }
                                  );
                                }}
                                sx={{ cursor: "pointer" }}
                                titleAccess={t("common:common.Edit")}
                              />
                            )}
                        {!(
                          member?.memberType === "Child" &&
                          member?.id === currentId
                        ) && (
                          <RemoveRedEyeIcon
                            id="view-icon"
                            onClick={() =>
                              member?.memberType === "Child"
                                ? navigate(
                                    `/dashboard/children/${member?.id}/view`
                                  )
                                : ModalService.open(
                                    ({ close }) => (
                                      <AddMemberModal
                                        onClose={() => handleClose(close)}
                                        member={member}
                                        id={familyId}
                                        isFromChildDetail={true}
                                        isDisabled={true}
                                      />
                                    ),
                                    {
                                      modalTitle:
                                        member.firstName +
                                        " " +
                                        member.lastName,
                                      width: "50%",
                                      hideModalFooter: true,
                                      enableClose: true,
                                    }
                                  )
                            }
                            sx={{ cursor: "pointer" }}
                            titleAccess={t("common:common.View")}
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

FamilyMembers.propTypes = {
  familyName: PropTypes.string,
  familyMembers: PropTypes.arrayOf(PropTypes.object),
  familyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  getFamilyMembers: PropTypes.func,
  isActiveFamily: PropTypes.bool,
  getChildren: PropTypes.func,
  type: PropTypes.string,
};

export default FamilyMembers;
