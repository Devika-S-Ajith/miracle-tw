import { useState, useEffect, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import moment from "moment";
import TrashIcon from "../../../../assets/icons/Trash";
import _ from "lodash";
import {
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMounted from "../../../../common/hooks/UseMounted";
import APIS from "../../../../common/hooks/UseApiCalls";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import {
  fileUpload,
  generateConsentPdfHandler,
  generateUniqueKeyForImage,
} from "../../../../helpers/helperFunction";
import { ModalService } from "../../../../components/Modal";
import Loader from "../../../../components/UserComponents/Loader";
import Scrollbar from "../../../Dashboard/Components/ScrollBar";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FileUploadField from "../../../Dashboard/Components/FileUploadField";
import { DateFormatFromRegion, dateFormatter } from "../../../../constants";

const FamilyDocuments = (props) => {
  const mounted = useMounted();
  const { t } = useTranslation(["common"]);
  const { care_givers, childId, active, ...other } = props;
  let { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [modalFlag, setModalFlag] = useState(false);
  const [modalFlag2, setModalFlag2] = useState(false);
  const [filename, setFileName] = useState(""); //? New Line
  const [uploadFlag, setUploadFlag] = useState(false); //? New Line
  const [signedURL, setSignedURL] = useState(""); //? New Line
  const [allowedType, setAllowedType] = useState(true);
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState([]);
  const { signedinOrgType, signedinUserRoleHT } = useContext(CommonDataContext);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  // State to track loading for each consent download
  const [consentDownloadLoading, setConsentDownloadLoading] = useState({});
  const [isLoading, setIsLoading] = useState();
  const allowedExtendions = new Set([
    "pdf",
    "doc",
    "docx",
    "jpg",
    "jpeg",
    "gif",
    "xls",
    "xlsx",
    "csv",
    "png",
  ]);

  useEffect(() => {
    getDocumentsList(childId);
    return () => {};
  }, []);

  useEffect(() => {
    if (signedURL !== "") {
      fileUpload();
    }
    return () => {};
  }, [signedURL]);

  const getDate = (payload = null) => {
    let yourDate = payload === null ? new Date() : new Date(payload);
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    let newDate = yourDate.toISOString();
    return moment(newDate).format("DD/MM/YYYY");
  };

  const getDateToSort = (payload = null) => {
    let yourDate = payload === null ? new Date() : new Date(payload);
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    let newDate = yourDate.toISOString();
    return moment(newDate).format("YYYY/MM/DD");
  };
  const changeHandler = (files) => {
    //? New Function
    setSelectedFile(files[0]);
    setIsFilePicked(true);
    let filenames = files[0].name.split(".");
    let extension = filenames[filenames.length - 1];
    setFileName(files[0].name.split(".")[0]);
    if (!allowedExtendions.has(extension.toLowerCase())) {
      setUploadFlag(true);
      setAllowedType(false);
    } else {
      setUploadFlag(false);
      setAllowedType(true);
    }
  };

  const startUpload = async () => {
    setIsLoading(true);
    await getSignedURL(selectedFile);
    setIsLoading(false);
  };

  const getSignedURL = async (selectedFile) => {
    let key = generateUniqueKeyForImage(selectedFile.name);
    try {
      let payload = {
        key: id + "/" + key,
        module: "HT_FAMILY",
      };
      const data = await APIS.generateFileUploadURL(payload);
      if (data && data?.data && data?.data?.data) {
        const response = await fileUpload(selectedFile, data?.data?.data);
        if (response.status === 200) {
          await updateDocOnDataBase(key, selectedFile);
        } else {
          console.log("something went wrong!");
        }
      } else {
        console.log("something went wrong!");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Handler to wrap consent PDF generation with loading state
  const handleConsentDownload = async (consentId, assessment) => {
    setConsentDownloadLoading((prev) => ({ ...prev, [consentId]: true }));
    try {
      await generateConsentPdfHandler(consentId, assessment);
    } finally {
      setConsentDownloadLoading((prev) => ({ ...prev, [consentId]: false }));
    }
  };

  const updateDocOnDataBase = useCallback(async (key, selectedFile) => {
    try {
      let finalPayload = {
        documentType: "doc",
        fileStatus: `Created`,
        key: `${key}`,
        description: "Family document",
        familyId: id,
        fileSize: `${selectedFile.size / 1024}`,
        TWAccountId: localStorage.getItem("orgId"),
      };
      const data = await APIS.AddFamilyDocument(finalPayload);
      if (data && data?.status === 200) {
        toast.success(t(`common:warnings.${data?.data?.Message}`));
        handleClose();
        setTimeout(async () => {
          await getDocumentsList(childId);
        }, 3500);
        console.log("successfully updated!");
      } else {
        console.log("something went wrong!");
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const formatBytes = (bytes, decimals = 2) => {
    //? New Function
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleClose = () => {
    setIsFilePicked(false);
    setModalFlag(false);
    setSelectedFile();
    setUploadFlag(false);
    setFileName("");
    setSignedURL("");
  };

  const handleClose2 = () => {
    setModalFlag2(!modalFlag2);
    setSelectedDocumentId(null);
  };
  const openModal2 = (value) => {
    setSelectedDocumentId(value);
    setModalFlag2(!modalFlag2);
  };

  const deleteDocument = async () => {
    setIsDeleting(true);
    try {
      const statusPayload = {
        id: selectedDocumentId,
      };
      await APIS.DeleteFamilyDocument(statusPayload).then((res) => {
        if (res.data.Message === "file data deleted Successfully") {
          toast.success(t("common:common.File Deleted Successfully"));
          setModalFlag2(false);
          setSelectedDocumentId(null);
          getDocumentsList(childId);
        } else {
          toast.error(t("common:common.Something went wrong"));
          setModalFlag2(false);
          setSelectedDocumentId(null);
          getDocumentsList(childId);
        }
        setIsDeleting(false);
      });
    } catch (err) {
      console.log(err, "error");
      toast.error(t("common:common.Something went wrong"));
    }
  };

  const openModal = (value) => {
    setModalFlag(!modalFlag);
  };

  let getFamListpayload = {
    rowCount: "100",
    pageNumber: "1",
    orderByField: [["id", "DESC"]],
    globalSearchQuery: "",
    HTOrganizationId: "",
    HTChildId: "",
    moduleType: "",
    documentType: "",
  };

  const getDocumentsList = useCallback(
    async (value) => {
      setLoading(true);
      let consentPayload = {
        rowCount: "1000",
        pageNumber: "1",
        orderByField: [["id", "DESC"]],
        globalSearchQuery: "",
        HTOrganizationId: "",
        HTFamilyId: `${id}`,
      };
      try {
        let finalPayload = {
          familyId: `${id}`,
          documentType: "doc",
          TWAccountId: localStorage.getItem("orgId"),
        };
        const data = await APIS.FamilyDocumentList(finalPayload);
        const consentData = await APIS.ListFamilyConsent(consentPayload);
        const combinedDocList = [
          ...(data?.data?.data || []),
          ...(consentData?.data?.data || []),
        ];
        const sortedDocList = combinedDocList.sort((a, b) => {
          return (
            new Date(getDateToSort(b.createdAt)) -
            new Date(getDateToSort(a.createdAt))
          );
        });
        setDocuments(sortedDocList);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [mounted]
  );

  // useEffect(() => {
  //   const currentPageItems = pageData.slice(0, 10);
  //   setDocuments(currentPageItems);
  //   setPage(1);
  // }, [pageData]);

  const handlePageChange = (event, value) => {
    if (page < value) {
      const currentPageItems = pageData.slice(page * 10, value * 10);
      setDocuments(currentPageItems);
    } else if (page > value) {
      const currentPageItems = pageData.slice(
        (value - 1) * 10,
        (page - 1) * 10
      );
      setDocuments(currentPageItems);
    }
    setPage(value);
  };

  const cancelClickHandler = () => {
    ModalService.open(() => <></>, {
      modalTitle: t("common:common.Unsaved Changes"),
      width: "30%",
      modalDescription: t(
        "common:common.If you leave this page, any changes you have made will be lost"
      ),
      actionButtonText: t("common:common.Leave page"),
      cancelButtonText: t("common:common.Cancel"),
      onClick: () => handleClose(),
    });
  };

  const RegionKey = DateFormatFromRegion() === "DD/MM/YYYY" ? "en-GB" : "en-us";

  return (
    <>
      <Loader loading={isLoading} />

      <Card {...other}>
        <CardHeader
          title={t("common:common.Documents")}
          action={
            signedinUserRoleHT === "admin" ||
            signedinUserRoleHT === "caseworker" ||
            signedinUserRoleHT === "admin+caseworker" ? (
              <Button
                color="primary"
                onClick={openModal}
                variant="contained"
                component="span"
                disabled={!active}
              >
                {t("common:common.Upload Document")}
              </Button>
            ) : (
              <></>
            )
          }
        />
        <Divider />
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
          <Box>
            {documents && documents.length > 0 && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("common:common.Document Name")}</TableCell>
                    <TableCell>{t("common:common.File Size")}</TableCell>
                    <TableCell>{t("common:common.Submitted Date")}</TableCell>
                    <TableCell align="right">
                      {t("common:common.Actions")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents &&
                    documents.length > 0 &&
                    documents.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          {assessment.consentId
                            ? `Consent ${_.startCase(
                                _.toLower(assessment.consentStatus),
                              )} - ${
                                assessment.HTChildId
                                  ? `${assessment.childFirstName} ${assessment.childLastName}`
                                  : `${assessment.memberFirstName} ${assessment.memberLastName}`
                              }`
                            : assessment?.originalFileName}
                        </TableCell>

                        <TableCell>
                          {assessment.consentId
                            ? "-"
                            : parseFloat(assessment.fileSize).toFixed(2) +
                              " KB"}
                        </TableCell>
                        <TableCell>
                          {assessment.consentId
                            ? dateFormatter(
                                assessment.submittedDate,
                                "numeric",
                                { region: RegionKey },
                              )
                            : dateFormatter(assessment.createdAt, "numeric", {
                                region: RegionKey,
                              })}
                        </TableCell>
                        <TableCell align="right">
                          {!assessment.consentId &&
                          (signedinUserRoleHT === "admin" ||
                            signedinUserRoleHT === "caseworker" ||
                            signedinUserRoleHT === "admin+caseworker") ? (
                            <Tooltip title={t("common:common.Delete Document")}>
                              <IconButton
                                onClick={(e) => {
                                  openModal2(assessment.id);
                                }}
                              >
                                <TrashIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <></>
                          )}

                          {!assessment.consentId && (
                            <Tooltip
                              title={t("common:common.Download Document")}
                            >
                              <IconButton
                                href={assessment.fileUrl}
                                target="_blank"
                              >
                                <ArrowDownwardIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {assessment.consentId && (
                            <Tooltip
                              title={t("common:common.Download Consent")}
                            >
                              <span>
                                <IconButton
                                  onClick={() =>
                                    handleConsentDownload(assessment?.consentId, assessment)
                                  }
                                  disabled={
                                    !!consentDownloadLoading[
                                      assessment?.consentId
                                    ]
                                  }
                                >
                                  {consentDownloadLoading[
                                    assessment?.consentId
                                  ] ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <ArrowDownwardIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
            {documents && documents.length === 0 && (
              <Box sx={{ width: "100%", ml: "40%", mt: 5, mb: 1 }}>
                <Box>
                  <Grid
                    container
                    // spacing={3}
                  >
                    <Grid
                      container
                      item
                      md={3} //6
                      xs={6} //12
                    >
                      {!loading && (
                        <Typography>
                          {t("common:common.No Documents to list")}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </Box>
      </Card>
      <Dialog
        aria-labelledby="simple-dialog-title"
        fullWidth={true} //? New Dialog
        maxWidth={"sm"}
        open={modalFlag}
      >
        <DialogTitle id="simple-dialog-title">
          {t("common:common.Upload Document")}
        </DialogTitle>
        <DialogContent>
          {loading && (
            <CircularProgress
              sx={{
                zIndex: 1000,
                position: "absolute",
                top: "55%",
                left: "45%",
              }}
              color="primary"
            />
          )}
          <Box mt>
            <Box display="flex" flexDirection="column" gap={1.5}>
              <FileUploadField
                handleChange={changeHandler}
                values={{ filePath: selectedFile?.name }}
                deletable={false}
              />
            </Box>
            <Box display="flex" justifyContent="end" gap={1} mt>
              <Button
                color="primary"
                variant="contained"
                onClick={cancelClickHandler}
                disabled={uploadFlag && allowedType}
              >
                {t("common:common.Cancel")}
              </Button>

              <>
                <Button
                  color="primary"
                  disabled={uploadFlag || !isFilePicked}
                  variant="contained"
                  onClick={startUpload}
                >
                  {t("common:common.Upload")}
                </Button>
              </>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog aria-labelledby="simple-dialog-title" open={modalFlag2}>
        <DialogTitle id="simple-dialog-title">
          {t("common:question.Are you sure")}
        </DialogTitle>
        <DialogContent>
          {isDeleting && (
            <CircularProgress
              sx={{
                zIndex: 1000,
                position: "absolute",
                top: "55%",
                left: "45%",
              }}
              color="primary"
            />
          )}
          <DialogContentText id="alert-dialog-description">
            <br></br>
            {t("common:child.Confirm Delete Document")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={deleteDocument}
            color="primary"
            disabled={isDeleting}
          >
            {t("common:child.DeleteDocumentYes")}
          </Button>
          <Button
            onClick={handleClose2}
            color="primary"
            autoFocus
            disabled={isDeleting}
          >
            {t("common:common.Cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FamilyDocuments;
