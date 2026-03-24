import { Typography, Box, Tooltip, IconButton, FormControl, InputLabel, Select, MenuItem, Button, Grid } from "@mui/material";
import ReusableTrendTable from "../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import { MessagesIconBlack } from "../../../../assets/icons/SideBarIcons";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState } from "react";
import dayjs from "dayjs";

// Demo data
const mockData = [
  {
    date: "2025-01-20",
    type: "mood",
    consecutiveDays: 5,
    startDate: "2025-01-16",
    label: "unhappy moods",
    messageSent: false
  },
  {
    date: "2025-01-17",
    type: "behavior",
    negativeCount: 4,
    label: "negative behaviors",
    messageSent: true
  },
  {
    date: "2025-01-10",
    type: "medication",
    consecutiveDays: 3,
    startDate: "2025-01-08",
    medication: "Adderall",
    label: "missed medication",
  },
];

// Icon mapping
const iconMap = {
  mood: ["/static/icons/inCrisisIcon.png", "In Crisis"],
  behavior: ["/static/icons/negativebehavior.svg", "Negative Behavior"],
  medication: ["/static/icons/missedmedication.svg", "Missed Medication"],
};

function getIcon(type) {
  const icon = iconMap[type];
  return icon ? (
    <img
      src={icon[0]}
      alt={icon[1]}
      style={{
        width: 22,
        height: 22,
        verticalAlign: "middle",
        marginRight: 6,
        objectFit: "contain",
      }}
    />
  ) : null;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildTableData(data) {
  return data.map((item) => ({
    date: item.date,
    concern: item,
    actions: item,
  }));
}

function buildColumns() {
  return [
    {
      label: "Date",
      id: "date",
      minWidth: 120,
      render: (row) => (
        <Typography variant="body2">{formatDate(row.date)}</Typography>
      ),
    },
    {
      label: "Concern",
      id: "concern",
      minWidth: 320,
      render: (row) => {
        const {
          type,
          consecutiveDays,
          startDate,
          label,
          negativeCount,
          medication,
        } = row.concern;
        const highlight = (
          <Box component="span" fontWeight={700}>
            {label}
          </Box>
        );
        if (type === "mood" && consecutiveDays && startDate) {
          return (
            <Typography variant="body2">
              {getIcon(type)}
              <Box component="span">
                {consecutiveDays} consecutive days
              </Box>{" "}
              with {highlight}, starting {formatDate(startDate)}
            </Typography>
          );
        }
        if (type === "behavior" && negativeCount) {
          return (
            <Typography variant="body2">
              {getIcon(type)}
              More than{" "}
              <Box component="span" fontWeight={700}>
                {negativeCount}
              </Box>{" "}
              {highlight}
            </Typography>
          );
        }
        if (
          type === "medication" &&
          consecutiveDays &&
          startDate &&
          medication
        ) {
          return (
            <Typography variant="body2">
              {getIcon(type)}
              <Box component="span">
                {consecutiveDays} consecutive days
              </Box>{" "}
              with{" "}
              <Box component="span" fontWeight={700}>
                missed medication
                {medication}
              </Box>
              , starting {formatDate(startDate)}
            </Typography>
          );
        }
        return (
          <Typography variant="body2" color="textSecondary">
            —
          </Typography>
        );
      },
    },
    {
      label: "Actions",
      id: "actions",
      minWidth: 80,
      render: (row) => (
        <Tooltip title="Comment / View Details">
          <IconButton size="small">
            {row.actions?.messageSent
              ? <VisibilityIcon fontSize="small" style={{ color: "#1D334B" }} />
              : <MessagesIconBlack fontSize="small" />}
          </IconButton>
        </Tooltip>
      ),
    },
  ];
}

const behaviorOptions = [
  { value: "all", label: "All concerning behaviors" },
  { value: "unhappy_moods", label: "Unhappy moods" },
  { value: "negative_behaviors", label: "Negative behaviors" },
  { value: "missed_medication", label: "Missed medication" },
  // Add more as needed
];

export const ConcerningBehaviorList = ({ data = mockData }) => {
  const [behaviorType, setBehaviorType] = useState("all");
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, "day"));
  const [toDate, setToDate] = useState(dayjs());

  // Filter UI to be passed as toolBar
  const filterBar = (
    <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
      
      <Grid item xs={12} md={12}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="behavior-type-label">Behavior</InputLabel>
              <Select
                labelId="behavior-type-label"
                value={behaviorType}
                label="Behavior"
                onChange={(e) => setBehaviorType(e.target.value)}
              >
                {behaviorOptions.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm="auto">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="From"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                maxDate={toDate}
                slotProps={{
                  textField: {
                    size: "small",
                    InputLabelProps: { sx: { top: 0 } },
                    sx: {
                      minWidth: 140,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "4px",
                        height: 40,
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm="auto">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="To"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                minDate={fromDate}
                slotProps={{
                  textField: {
                    size: "small",
                    InputLabelProps: { sx: { top: 0 } },
                    sx: {
                      minWidth: 140,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "4px",
                        height: 40,
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              variant="outlined"
              color="primary"
              disabled={data.length === 0}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <ReusableTrendTable
        columns={buildColumns()}
        title="Concerning behaviors (last 7 days)"
        tableData={buildTableData(data)}
        loading={false}
        skeltonRowcount={3}
        apiError={false}
        t={(_, d) => d}
        cardSx={{ height: "unset" }}
        subToolBar={filterBar}
      />
    </Box>
  );
};
