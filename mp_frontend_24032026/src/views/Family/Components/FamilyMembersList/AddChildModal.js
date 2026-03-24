import { InputAdornment, TablePagination, TextField, Typography ,IconButton} from "@mui/material";
import { Box } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PrimaryButton from "../../../../components/PrimaryButton";
import ChildForFamily from "./ChildForFamily";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import APIS from "../../../../common/hooks/UseApiCalls";
import Loader from "../../../../components/UserComponents/Loader";
import { useDebouncedCallback } from "use-debounce";
import {ModalService} from "../../../../components/Modal";
import AddChildForm from "../../../Child/Components/AddChildForm"

const AddChildModal = ({
    getAddedChild,
    selectedChildId,
    onCloseChildModal,
    familyName,
    familyId,
    caseWorker,
    getNewlyAddedChild,
    caseworkerName,
    address1,
    address2,
    city,
    zip_code,
    state,
    district,
    country,
}) => {
    const { t } = useTranslation(["common"]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [globalSearchQuery, setGlobalSearchQuery] = useState();
    const [childList, setChildList] = useState([]);
    const [loading, setLoading] = useState();
    const scrollableContainerRef = useRef(null);

    const defaultChildrenListpayload = {
        rowCount: "10",
        pageNumber: "1",
        orderByField: [["lastName", "ASC"]],
        globalSearchQuery: "",
        childStatus: "Active",
        TWAccountId: "",
    };

    useEffect(() => {
        getChildList();
        if (scrollableContainerRef.current) {
            scrollableContainerRef.current.scrollTop = 0;
        }
    }, [page, rowsPerPage]);

    const getChildList = async () => {
        const payload = defaultChildrenListpayload;
        payload.pageNumber = page + 1;
        payload.rowCount = rowsPerPage;
        try {
            setLoading(true);
            const data = await APIS.ListChildren(payload);
            setChildList(data?.data?.data);
            setLoading(false);
            setTotalPages(data?.data?.totalCount);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
          const inputValue = e.target.value.trim();
          if (inputValue.length === 1 || inputValue.length === 2) {
            // Do something for string length 1 or 2
            handleQueryChange(e, true);
          }
        }
      };
    
    const handleQueryChange = (event, flag = false) => {
        defaultChildrenListpayload.globalSearchQuery = event.target.value;
        if (event.target.value?.trim()?.length === 0) {
            loadDefaultList()
        }
        else {
            if (event.target?.value?.trim()?.length > 2 || flag) {
                getChildList();
            }
            setGlobalSearchQuery(event.target.value);
            setPage(0);
        }
       
    };

    const loadDefaultList = () => {
        setGlobalSearchQuery("");
        defaultChildrenListpayload.globalSearchQuery ="";
        getChildList();
        setPage(0);
    }

    const debouncedHandleSearch = useDebouncedCallback(
        (event) => {
          handleQueryChange(event);
        },
        800
      );

    const getChildDetails = (child) => {
        getNewlyAddedChild(child);
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setPage(0);
        setRowsPerPage(event.target.value);
    };

    return (
        <div>
            <>
                <Loader loading={loading} blurout={false}></Loader>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        marginTop: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            borderColor: "#C6C4BE",
                        }}
                    >
                        <TextField
                            fullWidth
                            sx={{ flex: 1 }}
                            InputProps={{
                                sx: {
                                    height: 40,
                                },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: globalSearchQuery?.length > 0 && (
                                    <IconButton color="inherit" onClick={() => loadDefaultList()}>
                                        <ClearIcon />
                                    </IconButton>
                                ),
                            }}
                            onChange={(e) => {
                                setGlobalSearchQuery(e.target.value);
                                debouncedHandleSearch(e);
                            }}
                            onKeyDown={handleKeyPress} // Handle "Enter" key press
                            placeholder={t("common:common.Search")}
                            value={globalSearchQuery}
                            variant="outlined"
                            id="search-child-input"
                        />
                        <PrimaryButton
                          onClick={() => {
                            ModalService.open(({ close }) => (
                                <AddChildForm
                                isNewFromFamily={true}
                                family={{
                                    familyName: familyName,
                                    familyId: familyId,
                                    getChildDetails: getChildDetails,
                                    familyCaseWorker: caseWorker,
                                    onClose: close,
                                    onCloseChildModal: onCloseChildModal
                                }}
                                address1={address1}
                                address2={address2}
                                city={city}
                                zip_code={zip_code}
                                state={state}
                                district={district}
                                country={country}
                            />
                            ), {
                              modalTitle: t("common:child.Add Child"),
                              width: "60%",
                              maxHeight: "80%",
                              overflow: "scroll",
                              hideModalFooter: true,
                              enableClose: true,
                            });
                          }}
                          label={t("common:child.Add Child")}
                          id="add-child-modal-btn"
                        />
                    </Box>
                    <Box
                      ref={scrollableContainerRef}
                        display="flex"
                        flexDirection="column"
                        gap={1}
                        sx={{
                            maxHeight: "300px",
                            overflowY: "auto",
                            paddingRight: "8px",
                            "&::-webkit-scrollbar": {
                                width: "8px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "grey",
                                borderRadius: "4px",
                            },
                        }}
                    >
                        {childList?.length > 0 ? childList?.map((child) => (
                            <ChildForFamily key={child.id} child={child} getAddedChild={getAddedChild} selectedChildId={selectedChildId} familyCaseWorker={caseWorker} caseworkerName={caseworkerName} />
                        )) : !loading && <Box
                            gap={1}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "rgba(113, 197, 212, 0.20)",
                                border: "1px solid #71C5D4",
                                padding: 2,
                                borderRadius: 1,
                                my: 2,
                            }}
                        >
                            <Typography variant="body1" color="#000000" id="no-children-msg">
                              {t("common:common.No children to list")}
                            </Typography>
                        </Box>}
                    </Box>
                </Box>
                <Box sx={{ display: "flex" }} flexDirection="row-reverse" px={1} pt={1}>
                    <Box sx={{ alignContent: "flex-end" }}>
                        <TablePagination
                            component="div"
                            count={totalPages}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Box>
                </Box>
            </>
        </div>
    );
};

export default AddChildModal;
