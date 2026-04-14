import { Typography, Chip, Stack } from "@mui/material";
import ReusableTrendTable from "../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import { useEffect, useState } from "react";
import APIS from "../../../../common/hooks/UseApiCalls";
import { formatDate, getOrdinal } from "../../../../helpers/helperFunction";


const getActionLabel = (row) => {
    switch (row?.type) {
        case "ASSESSMENT":
            return `${getOrdinal(parseInt(row.assessmentNo, 10))} family assessment`;
        case "PROGRESS_REPORT":
        case "FOLLOWUP":
            return `${getOrdinal(parseInt(row.progressReportNo, 10))} family progress report`;
        case "INTERIM_SCHEDULED_FOLLOWUP":
            return "Interim scheduled follow-up";
        default:
            return row?.type;
    }
};


const columnDefinition = [
    {
        label: "Action",
        id: "action",
        render: (row) => (
            <Typography variant="body2" fontWeight="medium">
                {getActionLabel(row) || '-'}
            </Typography>
        ),
    },
    {
        label: "Due",
        id: "dueDate",
        minWidth: 120,
        render: (row) => {
            // Extract only "Jul 14, 2025" from "02:33 PM, Mon, Jul 14, 2025"
            const formattedDate = formatDate(row.dueDate);
            // Match month day, year (e.g., Jul 14, 2025)
            const dateOnly = row.dueDate?formattedDate.match(/([A-Za-z]+ \d{1,2}, \d{4})/)?.[1] || formattedDate:'-';
            return (
                <Stack spacing={0.5} direction="column">
                    <Typography variant="body2">{dateOnly}</Typography>
                    <Chip
                        label={renderItem({ item: row })}
                        size="small"
                        sx={{
                            backgroundColor: "transparent",
                            color: "#BC1041",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            height: "auto",
                            "& .MuiChip-label": {
                                px: 0,
                            },
                        }}
                    />
                </Stack>
            );
        },
    },
    {
        label: "Notes",
        id: "notes",
        render: (row) => (
            <Typography variant="body2">{getItemNote(row) || '-'}</Typography>
        ),
    },
];

const renderItem = ({ item }) => {
    const { overDueDate, type } = item;
    const isdue = new Date(overDueDate) < new Date();
    if (isdue && overDueDate && type === "ASSESSMENT" && item.status === "PENDING") {
        return "OVERDUE";
    }
    if ((type === "FOLLOWUP" || type === "INTERIM_SCHEDULED_FOLLOWUP") && item.status === "PENDING") {
        return "OVERDUE";
    }

    return null;

};

const getItemNote = (item) => {
    const { type, status, prevProgressReportStat } = item;
    if (prevProgressReportStat === "PENDING") {
        return 'Progress report must be completed first'
    }
    if (type === "FOLLOWUP" && status === "PENDING") {
        return 'Must be completed before assessment can be done'
    }

    return null;
};

const ToDoWidget = ({ t, TWFamilyId }) => {

      const [todoData, setTodoData] = useState([]);
      const [loadingTodoList, setLoadingTodoList] = useState(false);
      const [apiError, setApiError] = useState(false);

     useEffect(() => {
         getTodoList()
         return () => { };
       }, []);

       const getTodoList = async () => {
         setLoadingTodoList(true);
         setApiError(false);
         const payload = {
            limit:100,
            start:1,
            TWFamilyId:TWFamilyId
         };
         try {
           const response = await APIS.GetTodoList(payload);
           if (response.data && response.data.data) {
             const todoList = response.data.data;
             const filteredTodoList = todoList.filter(item => item.status === "PENDING");
             setTodoData(
               filteredTodoList
             );
           }
         } catch (error) {
           setApiError(true);
           console.error("Error fetching todo list data:", error);
         } finally {
           setLoadingTodoList(false);
         }
       };

    return (
            <ReusableTrendTable
                columns={columnDefinition}
                title={t(`common:family.To-do (${todoData?.length}) (all actions must be completed in the mobile app)`,`To-do (${todoData?.length}) (all actions must be completed in the mobile app)`)}
                subheader={null}
                tableData={todoData}
                loading={loadingTodoList}
                skeltonRowcount={2}
                apiError={apiError}
                onReload={getTodoList}
                t={t}
            />
      
    );
};

export default ToDoWidget;