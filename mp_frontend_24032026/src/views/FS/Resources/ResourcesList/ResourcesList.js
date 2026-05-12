import React, { useContext, useRef } from "react";
import TableComponent from "../../../../components/TableComponent/TableComponent";
import { Box, Button, Card, Chip, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import useAuthorization from "../../../../components/UserComponents/useAuthorization";
import { CommonDataContext } from "../../../../common/contexts/CommonDataContext";
import APIS from "../../../../common/hooks/UseApiCalls";
import ChevronRightIcon from "../../../../assets/icons/ChevronRight";
import ResourceDetailForm from "../../Components/ResourceDetailForm";
import { ModalService } from "../../../../components/Modal";
import { ArrowRight } from "@mui/icons-material";
import PlusIcon from "../../../../assets/icons/Plus";
import { dateFormatter } from "../../../../constants";
import { useTranslation } from "react-i18next";

const ResourcesList = () => {
  const navigate = useNavigate();
  const { signedinUserRoleFS } = useContext(CommonDataContext);
  const gridRef = useRef(null);
  const { t } = useTranslation(["common"]);
  useAuthorization(null, signedinUserRoleFS, null, "Resource", false);

  const columns = [
    {
      field: "title",
      headerName: t("common:resources.Title", "Title"),
      minWidth: 200,
      flex: 1,
    },
    {
      field: "categories",
      headerName: t("common:resources.Categories", "Categories"),
      minWidth: 250,
      flex: 1,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
          }}
        >
          {params?.row?.categories?.map((item) => (
            <Chip key={item?.id} id={item?.id} label={item?.name} />
          ))}
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: t("common:resources.Created at", "Created at"),
      minWidth: 100,
    },
    {
      field: "createdBy",
      headerName: t("common:resources.Created by", "Created by"),
      minWidth: 200,
    },
    {
      field: "published",
      headerName: t("common:resources.Published", "Published"),
      minWidth: 100,
      renderCell: (params) =>
        params?.row?.published
          ? t("common:resources.Published", "Published")
          : t("common:resources.Draft", "Draft"),
    },
    {
      field: "updatedAt",
      headerName: t("common:resources.Updated at", "Updated at"),
      minWidth: 100,
    },
    {
      sortable: false,
      renderCell: (row) => (
        <ArrowRight
          style={{ cursor: "pointer" }}
          fontSize="large"
          id="view-icon"
          onClick={() => navigate(`/fostershare/resources/${row?.id}`)}
          sx={{ cursor: "pointer" }}
        />
      ),
      width: 60,
      align: "right",
    },
  ];

  const getResourceList = async ({
    rowCount,
    pageNumber,
    globalSearchQuery,
    orderByField,
  }) => {
    let params = {
      rowCount,
      pageNumber,
    };
    if (globalSearchQuery?.length) params.globalSearchQuery = globalSearchQuery;
    if (orderByField?.length) params.orderByField = orderByField;
    try {
      const res = await APIS.GetResourceList({
        ...params,
      });

      const { data } = res;
      const { pageCount, totalCount } = data;

      if (Array.isArray(data?.data))
        return {
          items:
            data?.data.map((each) => ({
              id: each?.id,
              title: each?.title,
              categories: each?.categories,
              createdBy: each?.FSAuthor?.createdBy,
              createdAt: dateFormatter(each?.createdAt),
              published: each?.published,
              updatedAt: dateFormatter(each?.updatedAt),
            })) || [],
          meta: {
            pageCount: pageCount,
            totalCount: totalCount,
          },
        };
    } catch (error) {}
  };

  const toolBarExtra = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "end",
        alignItems: "center",
        gap: 1,
        width: "100%",
      }}
    >
      <Button
        id="create-child"
        sx={{ borderRadius: "4px", height: "48px" }}
        variant="contained"
        startIcon={<PlusIcon fontSize="small" />}
        onClick={() => {
          ModalService.open(
            ({ close }) => (
              <ResourceDetailForm
                close={close}
                onSuccess={() => gridRef?.current?.getDataLoader()}
              />
            ),
            {
              modalTitle: t("common:resources.Resource information", "Resource information"),
              hideModalFooter: true,
              width: "35%",
              height: "95%",
            }
          );
        }}
      >
        {t("common:resources.Add resource", "Add resource")}
      </Button>
    </Box>
  );

  return (
    <Box p={1}>
      <Grid item sx={{ display: "flex", flexDirection: "row" }} my={1}>
        <Typography
          color="textPrimary"
          variant="h5"
          onClick={() => navigate("/fostershare/dashboard")}
          sx={{ cursor: "pointer" }}
        >
          {t("common:common.FosterShare", "FosterShare")}
        </Typography>
        <Box
          sx={{
            m: 0.75,
          }}
          style={{ cursor: "text" }}
        >
          <ChevronRightIcon color="disabled" fontSize="small" />
        </Box>
        <Typography
          id="support services-table-label"
          color="textPrimary"
          variant="h5"
        >
          {t("common:common.Resources", "Resources")}
        </Typography>
      </Grid>

      <Card sx={{ borderRadius: 2 / 8 }}>
        <Box p={2}>
          <TableComponent
            id="resources-table"
            showSlno={false}
            columns={columns}
            hideToolbar={false}
            dataLoader={getResourceList}
            parentRef={gridRef}
            toolBarExtra={toolBarExtra}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default ResourcesList;