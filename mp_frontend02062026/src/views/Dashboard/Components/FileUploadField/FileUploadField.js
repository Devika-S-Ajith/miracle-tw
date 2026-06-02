import React, { useRef } from "react";
import { Typography, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

const FileUploadField = ({
  setFieldValue,
  handleChange,
  values,
  deletable = true,
}) => {
  const { t, i18n } = useTranslation(["common"]);
  const hiddenFileInput = useRef(null);
  const handleClick = (event) => {
    event.preventDefault();
    // if (filesData.length >= 1) {
    //   Toast.warning('You have already uploaded one file!');
    //   return false;
    // }
    hiddenFileInput?.current?.click();
  };
  const handleDrop = (event) => {
    event.preventDefault(); // Prevent the default behavior
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleChange(droppedFiles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <>
      {/* <FormControl fullWidth variant="outlined">
        <TextField
          id="title"
          type="text"
          name="file"
          inputProps={{ readOnly: true }}
          onBlur={handleBlur}
          onChange={handleChange}
          required
          // value={values?.filePath}
          label="Upload file"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    width: "100%",
                    //paddingLeft: "30px",
                  }}
                >
                  <span style={{ fontSize: "14px", textAlign: "center" }}>
                    To add a file, drag and drop or
                  </span>

                  <Typography
                    variant="text"
                    component="label"
                    htmlFor="fileInput"
                    color="primary"
                    style={{
                      fontSize: "14px",
                      color: "primary",
                      cursor: values?.url?.length ? "not-allowed" : "pointer",
                    }}
                  >
                    upload
                    <input
                      id="fileInput"
                      type="file"
                      style={{ display: "none" }}
                      onChange={handleChange} // Handle file selection
                      disabled={values?.url?.length ? true : false}
                      accept=".pdf,.doc,.docx,.jpeg,.png,.jpg,.csv"
                    />
                  </Typography>
                </Box>
              </InputAdornment>
            ),
          }}
        />
      </FormControl>
      {!values?.url?.length && (
        <Box display={"flex"} gap={1}>
          <Typography>Current file :</Typography>
          <Typography>{values?.filePath || "No file added"}</Typography>
        </Box>
      )} */}

      <input
        id="fileInput"
        type="file"
        style={{ display: "none" }}
        onChange={(e) => {
          handleChange(e.target.files);
          e.target.value = "";
        }} // Handle file selection
        disabled={values?.articleLink?.length ? true : false}
        ref={hiddenFileInput}
        accept=".pdf,.doc,.docx,.jpeg,.png,.jpg,.csv"
      />

      <Box
        sx={{
          position: "relative",
          border: "1px dashed #6b778c",
          borderRadius: 1,
          p: 2,
          pointerEvents: values?.articleLink?.length ? "none" : "initial",
          opacity: values?.articleLink?.length ? 0.5 : 1,
        }}
        onClick={handleClick}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Typography
          sx={{
            position: "absolute",
            top: -10,
            left: 10,
            backgroundColor: "#fff",
            px: 1,
            // fontWeight: "bold",
          }}
          color="#6b778c"
          fontWeight={400}
          fontSize="0.75rem"
          lineHeight="1.4375em"
        >
          {t("common:common.Upload File")}{" "}
        </Typography>
        {/* {children} */}
        <Typography
          variant="subtitle2"
          component="label"
          htmlFor="fileInput"
          sx={{
            fontSize: "14px",
            cursor: values?.articleLink?.length ? "not-allowed" : "pointer",
          }}
          display={"flex"}
          justifyContent={"center"}
        >
          {t("common:common.To add a file")}
          <Typography
            variant="subtitle2"
            component="label"
            htmlFor="fileInput"
            color="#f37123"
            ml={0.5}
            sx={{
              fontSize: "14px",
              cursor: values?.articleLink?.length ? "not-allowed" : "pointer",
            }}
          >
            {t("common:common.Upload")}
          </Typography>
        </Typography>
      </Box>

      <Box>
        <Typography
          color="#6b778c"
          fontWeight={400}
          fontSize="0.75rem"
          lineHeight="1.4375em"
        >
          {t("common:common.Supported formats")}{" "}
        </Typography>
        <Typography
          color="#6b778c"
          fontWeight={400}
          fontSize="0.75rem"
          lineHeight="1.4375em"
        >
          {t("common:common.Maximum size")}{" "}
        </Typography>
        {!values?.url?.length && (
          <Box display={"flex"} gap={1} mb>
            <Typography>{t("common:common.Current file")} :</Typography>
            <Typography>
              {values?.filePath || t("common:common.No file added")}
            </Typography>
            {values?.filePath?.length > 0 && deletable && (
              <DeleteIcon
                onClick={() => setFieldValue("filePath", null)}
                titleAccess={t("common:common.Remove file")}
                sx={{
                  color: "#586171",
                  cursor: "pointer",
                }}
              />
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default FileUploadField;
