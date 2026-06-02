import { Typography, Stack, Chip, Tooltip } from "@mui/material";
import ReusableTrendTable from "../../../Dashboard/GovtDashboardOverview/Components/ReusableTrendTable";
import { MoodImageMapping } from "../../../Dashboard/Components/StateGovDashboardComponents/MoodImageMapping";
import { NegativeBehaviorImageMapping } from "../../../Dashboard/Components/StateGovDashboardComponents/NegativeBehaviorImageMapping";

// Dummy data for demonstration
const mockData = [
    {
        date: "2025-10-23",
        mood: { label: "INCRISIS" },
        negativeBehaviors: [
            { label: "AGGRESSION" },
            { label: "DEPRESSION" },
            { label: "ANXIETY" },
            { label: "FRUSTRATED" },
            { label: "ANGER" },
            { label: "SADNESS" }
        ],
        missedMedications: [
            { name: "Adderall" },
            { name: "Allegra" },
            { name: "Tylenol" }
        ],
        activities: ["Soccer", "Drawing"],
        minorIncident: true
    },
    {
        date: "2025-10-22",
        mood: { label: "SAFE" },
        negativeBehaviors: [
            { label: "DEPRESSION" },
            { label: "AGGRESSION" },
        ],
        missedMedications: [],
        activities: [],
        minorIncident: false
    },
    // ...5 more days
];

// Helper to get last 7 days (excluding today)
function getLast7DaysData(data) {
    return data.slice(0, 7);
}

// Pivot the data for the new table layout
function pivotData(days) {
    const dates = days.map(d => d.date).sort();
    const getByDate = (date) => days.find(d => d.date === date) || {};

    return [
        {
            event: "Mood",
            render: (date) => {
                const row = getByDate(date);
                if (row.mood && row.mood.label) {
                    const moodKey = row.mood.label.toUpperCase();
                    const imgSrc = MoodImageMapping[moodKey];
                    if (imgSrc) {
                        return (
                            <Tooltip title={row.mood.label}>
                                <img
                                    src={imgSrc}
                                    alt={row.mood.label}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        verticalAlign: "middle",
                                        objectFit: "contain"
                                    }}
                                />
                            </Tooltip>
                        );
                    }
                }
                return <Typography variant="body2" color="textSecondary">—</Typography>;
            }
        },
        {
            event: "Negative behaviors",
            render: (date) => {
                const row = getByDate(date);
                if (row.negativeBehaviors && row.negativeBehaviors.length > 0) {
                    return (
                        <Tooltip
                            title={row.negativeBehaviors.map(b => b.label).join(", ")}
                            arrow
                        >
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                {row.negativeBehaviors.slice(0, 3).map((b, i) => {
                                    const key = b.label.toUpperCase();
                                    const imgSrc = NegativeBehaviorImageMapping[key];
                                    return imgSrc ? (
                                        <img
                                            key={i}
                                            src={imgSrc}
                                            alt={b.label}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                objectFit: "contain"
                                            }}
                                        />
                                    ) : (
                                        <span key={i}>{b.label}</span>
                                    );
                                })}
                                {row.negativeBehaviors.length > 3 && (
                                    <Chip
                                        size="small"
                                        label={`+${row.negativeBehaviors.length - 3}`}
                                        sx={{ height: 20, fontSize: 12 }}
                                    />
                                )}
                            </Stack>
                        </Tooltip>
                    );
                }
                return <Typography variant="body2" color="textSecondary">—</Typography>;
            }
        },
        {
            event: "Missed medication",
            render: (date) => {
                const row = getByDate(date);
                if (row.missedMedications && row.missedMedications.length > 0) {
                    return (
                        <Tooltip
                            title={row.missedMedications.map(m => m.name).join(", ")}
                            arrow
                        >
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <Typography variant="body2" noWrap maxWidth={60}>
                                    {row.missedMedications[0].name}
                                </Typography>
                                {row.missedMedications.length > 1 && (
                                    <Typography variant="body2" color="textSecondary">
                                        +{row.missedMedications.length - 1} more
                                    </Typography>
                                )}
                            </Stack>
                        </Tooltip>
                    );
                }
                return <Typography variant="body2" color="textSecondary">—</Typography>;
            }
        },
        {
            event: "Activity",
            render: (date) => {
                const row = getByDate(date);
                if (row.activities && row.activities.length > 0) {
                    return (
                        <Tooltip title={row.activities.join(", ")} arrow>
                            <img
                                src="/static/icons/blacktick.svg"
                                alt="Activity"
                                style={{
                                    width: 20,
                                    height: 20,
                                    objectFit: "contain",
                                    display: "inline",
                                    verticalAlign: "middle"
                                }}
                            />
                        </Tooltip>
                    );
                }
                return <Typography variant="body2" color="textSecondary">—</Typography>;
            }
        },
        {
            event: "Minor incident",
            render: (date) => {
                const row = getByDate(date);
                if (row.minorIncident) {
                    return (
                        <Tooltip title="Minor Incident" arrow>
                            <img
                                src="/static/icons/minorIncident.svg"
                                alt="Minor Incident"
                                style={{
                                    width: 20,
                                    height: 20,
                                    objectFit: "contain",
                                    display: "inline",
                                    verticalAlign: "middle"
                                }}
                            />
                        </Tooltip>
                    );
                }
                return <Typography variant="body2" color="textSecondary">—</Typography>;
            }
        }
    ].map(row => {
        const rowObj = { event: row.event };
        dates.forEach(date => {
            rowObj[date] = row.render(date);
        });
        return rowObj;
    });
}

// Build columns: first column is "Event", then one for each date
function buildColumns(dates, t) {
    return [
        {
            label: t ? t("Event", "Event") : "Event",
            id: "event",
            minWidth: 120,
            render: (row) => (
                <Typography variant="body2" fontWeight={600}>
                    {row.event}
                </Typography>
            )
        },
        ...dates.map(date => ({
            label: new Date(date).toLocaleString("en-US", { month: "short", day: "numeric" }),
            id: date,
            minWidth: 80,
            render: (row) => row[date]
        }))
    ];
}

export const ChildOverviewList = ({ data = mockData, t }) => {
    const days = getLast7DaysData(data);
    const dates = days.map(d => d.date).sort();
    const tableData = pivotData(days);
    const columns = buildColumns(dates, t);

    return (
        <ReusableTrendTable
            columns={columns}
            title={t ? t("common:Child overview (last 7 days)", "Child overview (last 7 days)") : "Child overview (last 7 days)"}
            tableData={tableData}
            loading={false}
            skeltonRowcount={3}
            apiError={false}
            t={t || ((_, d) => d)}
            cardSx={{ height: 'unset' }}
        />
    );
};
