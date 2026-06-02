import React, { useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import _ from "lodash";
import {
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
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
import { Box } from "@mui/system";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Scrollbar from "../../views/Dashboard/Components/ScrollBar";
import Loader from "../UserComponents/Loader";
import { CommonDataContext } from "../../common/contexts/CommonDataContext";
//import TrashIcon from "../../../../assets/icons/Trash";
import FileUploadField from "../../views/Dashboard/Components/FileUploadField";
import { ModalService } from "../Modal";

const Documents = (props) => {
  const { t } = useTranslation(["common"]);
  const { care_givers, childId, getSignedURL, ...other } = props;
  const inputEl = useRef(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [modalFlag, setModalFlag] = useState(false);
  const [modalFlag2, setModalFlag2] = useState(false);
  const [filename, setFileName] = useState(""); //? New Line
  const [uploadFlag, setUploadFlag] = useState(false); //? New Line
  const [signedURL, setSignedURL] = useState(""); //? New Line
  const [allowedType, setAllowedType] = useState(true);
  // const [uploadStatus, setUploadStatus] = useState('');
  const { signedinOrgType, signedinUserRoleHT } = useContext(CommonDataContext);
  const [isLoading, setIsLoading] = useState();
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
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

  const openModal = (value) => {
    setModalFlag(!modalFlag);
  };

  const getDate = (payload = null) => {
    let yourDate = payload === null ? new Date() : new Date(payload);
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    let newDate = yourDate.toISOString();
    // console.log(moment(newDate).format('DD/MM/YYYY'),"DD/MM/YYYY")
    return moment(newDate).format("DD/MM/YYYY");
  };

  const openModal2 = (value) => {
    setSelectedDocumentId(value);
    setModalFlag2(!modalFlag2);
  };

  const changeHandler = (files) => {
    //? New Function
    setSelectedFile(files[0]);
    setIsFilePicked(true);
    let filenames = files[0].name.split(".");
    let extension = filenames[filenames.length - 1];
    // if(filename === ''){
    setFileName(files[0].name.split(".")[0]);
    // }
    if (!allowedExtendions.has(extension.toLowerCase())) {
      setUploadFlag(true);
      setAllowedType(false);
    } else {
      setUploadFlag(false);
      setAllowedType(true);
    }
    // getSignedURL(event.target.files[0])
  };

  const startUpload = async () => {
    setIsLoading(true);
    await getSignedURL(selectedFile);
    setIsLoading(false);
  };

  const handleClose = () => {
    // inputEl.current.value = "";
    setIsFilePicked(false);
    setModalFlag(false);
    setSelectedFile();
    setUploadFlag(false);
    setFileName("");
    setSignedURL("");
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
              >
                {t("common:common.Upload Document")}
              </Button>
            ) : (
              <></>
            )
          }
        />
        <Divider />
        <Scrollbar>
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
                          {assessment.isConsent
                            ? "Consent_" +
                              _.startCase(_.toLower(assessment.consentStatus))
                            : // : assessment.description.replaceAll("-", " ")
                              assessment?.originalFileName}
                        </TableCell>

                        <TableCell>
                          {assessment.isConsent
                            ? "-"
                            : parseFloat(assessment.fileSize).toFixed(2) +
                              " KB"}
                        </TableCell>
                        <TableCell>{getDate(assessment.createdAt)}</TableCell>
                        <TableCell align="right">
                          {!assessment.isConsent &&
                          (signedinOrgType == 3 || signedinOrgType == 4) &&
                          (signedinUserRoleHT === "admin" ||
                            signedinUserRoleHT === "caseworker" ||
                            signedinUserRoleHT === "admin+caseworker") ? (
                            <Tooltip title={t("common:common.Delete Document")}>
                              <IconButton
                                onClick={(e) => {
                                  openModal2(assessment.id);
                                }}
                              >
                                {/* <TrashIcon fontSize="small" /> */}
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <></>
                          )}

                          {!assessment.isConsent && (
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
                      <Typography>
                        {t("common:common.No Documents to list")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </Box>
        </Scrollbar>
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
                // sx={{ width: 160 }}
                variant="contained"
                onClick={cancelClickHandler}
                // style={{backgroundColor : theme.palette.button.primary}}
                disabled={uploadFlag && allowedType}
              >
                {t("common:common.Cancel")}
              </Button>
              {/* {isFilePicked ? ( */}
              <>
                <Button
                  color="primary"
                  // sx={{ width: 160, ml: 14 }}
                  disabled={uploadFlag || !isFilePicked}
                  variant="contained"
                  // disabled={!isFilePicked}
                  onClick={startUpload}
                >
                  {t("common:common.Upload")}
                </Button>
                {/* <Typography variant="subtitle1" gutterBottom component="span">
                    {uploadStatus}
                  </Typography> */}
              </>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Documents;
