import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  Modal,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DownloadIcon from "@mui/icons-material/Download";
import "react-slideshow-image/dist/styles.css";
import APIS from "../../../../common/hooks/UseApiCalls";
import { useParams } from "react-router";
import "./UploadImage.css";

const UploadedImages = () => {
  const [imageList, setImageList] = useState([]);
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollContainerRef = useRef(null);
  const [imagesLoading, setImagesLoading] = useState(false);

  const scroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += scrollOffset;
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    getFamilyImages();
  }, []);

  const getFamilyImages = useCallback(async () => {
    setImagesLoading(true);
    try {
      const data = await APIS.GetFamilyImages(id);
      if (data?.data?.data) {
        setImageList(data?.data?.data || []);
      }
      setImagesLoading(false);
    } catch (err) {
      setImagesLoading(false);
      console.error(err);
    }
  });

  return (
    <Card sx={{ borderRadius: 1 }}>
      <CardContent>
        <Typography color="textPrimary" fontWeight={700} fontSize="1.25rem">
          Uploaded images
        </Typography>
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
            <IconButton
              onClick={() => scroll(-100)}
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: "50%",
                border: "2px solid white",
                position: "absolute",
                left: 2,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
              }}
            >
              <ArrowBackIosIcon
                sx={{
                  color: "white",
                  ml: 1,
                }}
              />
            </IconButton>
            <ImageList
              ref={scrollContainerRef}
              sx={{
                flexWrap: "nowrap",
                width: "100%",
                overflowX: "scroll",
                overflowY: "hidden",
                scrollbarWidth: "none", // For Firefox
                msOverflowStyle: "none", // For Internet Explorer and Edge
                "&::-webkit-scrollbar": {
                  display: "none", // For Chrome, Safari, and Opera
                },
              }}
              cols={imageList.length}
              gap={8}
            >
              {imageList.map((image) => (
                <ImageListItem
                  onClick={() => handleImageClick(image)}
                  key={image.id}
                  sx={{ minWidth: "150px", height: "150px", flexShrink: 0 }}
                >
                  <img
                    srcSet={`${image.downloadUrl}?w=100&h=100&fit=crop&auto=format&dpr=2 2x`}
                    src={image.downloadUrl}
                    alt={image.title}
                    loading="lazy"
                    style={{ width: "150px", height: "150px" }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
            <IconButton
              onClick={() => scroll(100)}
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: "50%",
                border: "2px solid white",
                position: "absolute",
                right: 2,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
              }}
            >
              <ArrowForwardIosIcon
                sx={{
                  color: "white",

                  mr: 0,
                }}
              />
            </IconButton>
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
      </CardContent>
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
                src={selectedImage?.downloadUrl}
                alt={selectedImage?.file}
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
                <Button variant="text" color="primary" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  href={selectedImage?.downloadUrl}
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
    </Card>
  );
};

export default UploadedImages;
