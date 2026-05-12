import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Modal,
} from "@mui/material";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import DownloadIcon from "@mui/icons-material/Download";
import APIS from "../../../../../common/hooks/UseApiCalls";
import Loader from "../../../../../components/UserComponents/Loader";
import {
  utcToDateFormat,
  utcToLocalWithoutSecond,
} from "../../../../../helpers/helperFunction";
import {
  renderAnswerColumn,
  renderCommentsColumn,
} from "../../../../FS/Components/helperFunction";
import LabelValue from "../../../../../components/LabelValue";

const BehaviorLogDetails = ({
  moduleName,
  moduleId,
  behavioralLogId,
  close,
}) => {
  const navigate = useNavigate();

  const [behaviorLogDetail, setBehaviorLogDetail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [imagesLoading, setImagesLoading] = useState([]);
  const scrollContainerRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const resetRouter = () => {
    ["dashboard"].includes(moduleName)
      ? navigate(`/dashboard/${moduleName}/view`)
      : navigate(`/dashboard/${moduleName}/${moduleId}/view`);
  };

  useEffect(() => {
    getBehaviourLogDetail();
    getLogImages();
  }, [behavioralLogId]);

  const getBehaviourLogDetail = useCallback(async () => {
    setLoading(true);
    try {
      let payload = {
        logId: behavioralLogId,
      };
      const data = await APIS.DetailRecLog(payload);

      setBehaviorLogDetail(
        data && data.data && data.data.data && data.data.data?.logs,
      );
      //setpageCount(data && data.data && data.data.pageCount);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const scroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += scrollOffset;
    }
  };

  const getLogImages = useCallback(async () => {
    setImagesLoading(true);
    try {
      const payload = {
        adapterName: "Pre-signedDownloadUrlGeneratorAdapter",
        adapterProperties: {
          formResponseId: behavioralLogId,
          moduleType: "BEHAVIOR_LOG_IMAG_FILE",
        },
        userId: localStorage.getItem("username"),
      };

      const data = await APIS.GetLogImages(payload);
      console.log(data?.data?.data?.downloadUrl);
      if (data?.data?.data) {
        setImageList(data?.data?.data?.downloadUrl || []);
      }
      setImagesLoading(false);
    } catch (err) {
      setImagesLoading(false);
      console.error(err);
    }
  });

  return (
    <>
      <Loader loading={loading} />
      <Box
        sx={{
          height: "70vh",
          maxHeight: "600px",
          mr: -2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography
              id="log-overview-table-label"
              color="textPrimary"
              variant="h5"
            >
              Behavior Logs Details
            </Typography>
            <Typography color="textPrimary" variant="h6" sx={{ mt: 1 }}>
              {behaviorLogDetail?.childName}
            </Typography>
          </Box>

          <Typography
            id="log-overview-table-label"
            variant="body2"
            sx={{ color: "text.secondary" }}
            fontWeight="bold"
          >
            {utcToDateFormat(behaviorLogDetail?.date)}
          </Typography>
        </Box>
        <Box
          height="90%"
          overflow="scroll"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            "&::-webkit-scrollbar": {
              width: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "white",
              display: "none",
            },
          }}
        >
          <Box sx={{ mr: 2 }}>
            {behaviorLogDetail && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography
                        fontWeight="bold"
                        variant="subtitle1"
                        sx={{ color: "text.secondary" }}
                      >
                        Question
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        fontWeight="bold"
                        variant="subtitle1"
                        sx={{ color: "text.secondary" }}
                      >
                        Answer
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        fontWeight="bold"
                        variant="subtitle1"
                        sx={{ color: "text.secondary" }}
                      >
                        Comments
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {behaviorLogDetail?.decodedTemplate?.map(
                    (individualItem, index) => {
                      return (
                        <TableRow hover key={individualItem?.page}>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {individualItem?.displayLabel}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {renderAnswerColumn(
                              individualItem?.components[0],
                              true,
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {renderCommentsColumn(individualItem?.components)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            )}
          </Box>

          <Grid container spacing={1}>
            <Grid item xs={8}>
              <Box id="notes">
                <Typography color="textPrimary" variant="h6" mb>
                  Notes
                </Typography>
                <Box
                  border={2}
                  borderColor="#DBE2E7"
                  borderRadius={1}
                  p={1.5}
                  minHeight="10%"
                  maxHeight={200}
                  overflow="scroll"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    "&::-webkit-scrollbar": {
                      width: "3px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      borderRadius: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "white",
                      display: "none",
                    },
                  }}
                >
                  {behaviorLogDetail?.formPostCompleteAnswer?.Notes?.length >
                  0 ? (
                    behaviorLogDetail?.formPostCompleteAnswer?.Notes?.map(
                      (note) => {
                        return (
                          <>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                color="textPrimary"
                                variant="subtitle2"
                                fontWeight={700}
                                fontSize="1rem"
                              >
                                Added by:{" "}
                                {note?.addedBy
                                  ? note.addedBy
                                  : behaviorLogDetail?.submittedBy?.trim() ||
                                    "Unknown"}
                              </Typography>
                              <Typography
                                color="textPrimary"
                                fontWeight="bold"
                                variant="subtitle2"
                                sx={{ color: "text.secondary", mt: 0.5 }}
                              >
                                {note?.date &&
                                  utcToLocalWithoutSecond(note?.date)}
                              </Typography>
                            </Box>
                            <Typography
                              color="textPrimary"
                              variant="subtitle2"
                              fontWeight={500}
                              fontSize="1rem"
                            >
                              {note?.note}
                            </Typography>
                          </>
                        );
                      },
                    )
                  ) : (
                    <>
                      <Typography
                        fontWeight="bold"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          margin: "auto",
                          textAlign: "center",
                          pt: 2,
                        }}
                      >
                        There are no notes
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box id="images" sx={{ mr: 2 }}>
                <Typography color="textPrimary" variant="h6" mb>
                  Images
                </Typography>
                <Box
                  border={2}
                  borderColor="#DBE2E7"
                  borderRadius={1}
                  minHeight="10%"
                  maxHeight={150}
                  overflow="scroll"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    "&::-webkit-scrollbar": {
                      width: "3px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      borderRadius: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "white",
                      display: "none",
                    },
                  }}
                >
                  {imageList?.length > 0 ? (
                    <Box sx={{ position: "relative" }}>
                      {imagesLoading && (
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
                      <img
                        style={{
                          margin: "6px",
                          width: "150px",
                          height: "auto",
                        }}
                        src={imageList}
                        alt="behavior log attachment"
                        onClick={() => {
                          handleImageClick(imageList);
                        }}
                      ></img>
                    </Box>
                  ) : (
                    <>
                      <Typography
                        fontWeight="bold"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          margin: "auto",
                          textAlign: "center",
                          pt: 2,
                        }}
                      >
                        There are no images
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Modal open={!!selectedImage} onClose={handleClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 2,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {selectedImage && (
                <>
                  <img
                    src={selectedImage}
                    alt={"Behavior log attachment"}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "70vh",
                      marginBottom: "20px",
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      width: "100%",
                    }}
                  >
                    <Button
                      variant="text"
                      color="primary"
                      onClick={handleClose}
                    >
                      Close
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      href={selectedImage}
                      download
                      target="_blank"
                    >
                      Download
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Modal>
        </Box>
        <LabelValue
          label="Submitted by"
          value={behaviorLogDetail?.submittedBy}
        />
      </Box>
      <Box mt={2} sx={{ display: "flex", justifyContent: "end", gap: 0 }}>
        <Button
          sx={{ borderRadius: "4px" }}
          variant="contained"
          onClick={() => {
            close();
            resetRouter();
          }}
        >
          Close
        </Button>
      </Box>
    </>
  );
};

export default BehaviorLogDetails;
