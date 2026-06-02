import React from "react";
import { Box, Divider, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const FormQuestionsSkelton = () => {
  const { t } = useTranslation(["common"]);
  return (
    <Box m={2} p={2} border={1} borderRadius={1}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        width={1}
        mb={2}
      >
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={150} height={30} />
      </Stack>
      <Stack direction="column" spacing={2}>
        {[...Array(2)].map((_, sectionIndex) => (
          <Box key={sectionIndex}>
            <Typography
              color="textSecondary"
              variant="subtitle1"
              sx={{ mt: 1 }}
            >
              <Skeleton variant="text" width="45%" />
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              width={1}
              mt={2}
            >
              {[...Array(4)].map((__, itemIndex) => (
                <Skeleton key={itemIndex} variant="text" width={200} />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default FormQuestionsSkelton;
