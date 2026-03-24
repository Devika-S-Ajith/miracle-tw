import { useState, useEffect, useCallback, useContext } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
//import { format } from 'date-fns';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  Tooltip,
  TableHead,
  // TablePagination,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
// import { customerApi } from '../../../../__fakeApi__/customerApi';
import useMounted from "../../../../common/hooks/UseMounted";
import ArrowRightIcon from "../../../../assets/icons/ArrowRight";
import PencilAltIcon from "../../../../assets/icons/PencilAlt";
// import Label from '../../../../components/Label';
//import MoreMenu from '../../MoreMenu';
import Scrollbar from "../../../Dashboard/Components/ScrollBar";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import { useTranslation } from "react-i18next";

const Children = (props) => {
  const { t } = useTranslation(["common"]);
  const mounted = useMounted();
  const [children, setChildren] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const { organizationList, signedinUserRole, signedinOrgType } =
    useContext(CommonDataContext);
  const { familyMembers } = props;
  const signedinOrgId = localStorage.getItem("orgId");
  let { id } = useParams();

  useEffect(() => {
    getChildren();
    return () => {};
  }, [familyMembers]);

  const getChildListpayloadConstant = {
    rowCount: "10",
    pageNumber: "1",
    orderByField: [["firstName", "ASC"]],
    HTFamilyId: `${id}`,
  };

  const getChildren = useCallback(
    async (pageNumber = 1) => {
      setLoading(true);
      try {
        let pageNumberPayload = {
          pageNumber: pageNumber,
        };
        console.log("getChildListpayloadConstant", getChildListpayloadConstant);
        let payload = { ...getChildListpayloadConstant, ...pageNumberPayload };
        const data = await APIS.ListChildren(payload);
        console.log("setting children >>", data.data.data);
        setChildren(data.data.data);
        setPageCount(data.data.pageCount);
        console.log("children", children);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    },
    [mounted]
  );

  const handlePageChange = (event, newPage) => {
    getChildren(newPage);
    setPage(newPage);
  };

  return (
    <Card {...props}>
      <CardHeader title={t("common:common.Children")} />
      <Divider />
      <Scrollbar className={children.length ? "scrollListTable" : ""}>
        {loading && (
          <CircularProgress
            sx={{
              zIndex: 1000,
              position: "fixed",
              top: "50%", // Adjusted to 50% to center vertically
              left: "50%", // Adjusted to 50% to center horizontally
              transform: "translate(-50%, -50%)", // Centering trick
            }}
            color="primary"
          />
        )}
        <Box sx={{ minWidth: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("common:common.Child Name")}</TableCell>

                <TableCell>{t("common:common.Caregiver")}</TableCell>

                <TableCell>{t("common:common.Organization")}</TableCell>

                <TableCell>{t("common:common.Case Manager TS")}</TableCell>

                <TableCell align="right">
                  {t("common:common.Actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {children &&
                children.length > 0 &&
                children.map((child) => (
                  <TableRow key={child && child.childId}>
                    <TableCell>
                      {child.firstName} {" " + child.lastName}
                    </TableCell>
                    <TableCell>{child.familyMemberName}</TableCell>
                    <TableCell>
                      {` ${
                        organizationList &&
                        organizationList.length &&
                        organizationList.find(
                          (item) => item.id === child.TWAccountId
                        ).accountName
                      } `}
                    </TableCell>
                    <TableCell>
                      {child.userFirstName === null &&
                      child.userLastName === null
                        ? "UnAssigned"
                        : `${child.userFirstName + " " + child.userLastName}`}
                    </TableCell>
                    <TableCell align="right">
                      {(signedinOrgType == 3 || signedinOrgType == 4) &&
                      (signedinUserRole === "admin" ||
                        signedinUserRole === "caseworker") &&
                      child.HTOrganizationId === signedinOrgId ? (
                        <Tooltip title={t("common:child.Edit Child")}>
                          <IconButton
                            component={RouterLink}
                            to={`/dashboard/children/${child.id}/edit`}
                          >
                            <PencilAltIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <></>
                      )}

                      <Tooltip title={t("common:child.View Child")}>
                        <IconButton
                          component={RouterLink}
                          to={`/dashboard/children/${child && child.id}/view`}
                        >
                          <ArrowRightIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {children && children.length === 0 && (
            <Box sx={{ width: "100%", textAlign: "center", mt: 5, mb: 1 }}>
              <Box>
                <Typography>{t("common:common.No Children")}</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Scrollbar>
      <Box sx={{ display: "flex" }} flexDirection="row-reverse" p={1} m={1}>
        <Box sx={{ alignContent: "flex-end" }}>
          <Pagination
            onChange={handlePageChange}
            page={page}
            count={pageCount}
            shape="rounded"
          />
        </Box>
      </Box>
    </Card>
  );
};

export default Children;
