import { useCallback, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import {
    Box,
    Typography,
    useTheme,
    useMediaQuery,
    Skeleton,
    Divider,
    Grid
} from "@mui/material";
import CommonCard from "../CommonCard";
import { useTranslation } from "react-i18next";

const MultiLineGraph = ({
    title = "Title placeholder",
    data = [],
    categories = [],
    loading = false,
    apiError = false,
    onReload = () => { console.log("Reload function not provided") },
}) => {
    const theme = useTheme();
    const { t } = useTranslation(["common"]);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Memoize computed values to prevent unnecessary recalculations
    const computedValues = useMemo(() => {
        const getStrokeDashArray = (lineType) => {
            switch (lineType) {
                case "solid": return "0";
                case "dotted": return "3 3";
                case "dashed": return "5 5";
                case "longdash": return "10 5";
                default: return "0";
            }
        };

        const areAllLinesSolid = () => {
            return categories.every((category) => category?.lineType === "solid");
        };

        // Calculate minimum width for mobile scroll
        const getMinChartWidth = () => {
            if (!isMobile || !data?.length) return "100%";
            const minWidth = Math.max(300, data.length * 60);
            return `${minWidth}px`;
        };

        // Calculate legend height based on number of categories
        const getLegendHeight = () => {
            if (!categories.length) return 0;
            const itemsPerRow = isMobile ? 1 : Math.min(categories.length, 3);
            const rows = Math.ceil(categories.length / itemsPerRow);
            return isMobile ? rows * 40 : rows * 32;
        };

        // Responsive chart height (for the actual graph area only)
        const getChartHeight = () => {
            if (isMobile) return 300;
            if (isTablet) return 280;
            return 300;
        };

        // Total container height (chart + legend + spacing)
        const getTotalHeight = () => {
            const chartHeight = getChartHeight();
            const legendHeight = getLegendHeight();
            const spacing = isMobile ? 20 : 30;
            return chartHeight + legendHeight + spacing;
        };

        // Responsive margins
        const getChartMargins = () => {
            if (isMobile) {
                return {
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 40,
                };
            }
            return {
                top: 20,
                right: 50,
                left: 30,
                bottom: 30,
            };
        };

        // Calculate Y-axis domain with padding
        const getYAxisDomain = () => {
            if (!data?.length || !categories?.length) return [0, 'auto'];
            
            let allValues = [];
            
            // Collect all numeric values from the data
            data.forEach(point => {
                categories.forEach(category => {
                    if (category?.key) {
                        const value = point[category.key];
                        if (value != null && value !== '' && !isNaN(Number(value))) {
                            allValues.push(Number(value));
                        }
                    }
                });
            });

            // If no valid values found, use auto scaling
            if (allValues.length === 0) {
                return [0, 'auto'];
            }

            const minValue = Math.min(...allValues);
            const maxValue = Math.max(...allValues);
            
            // If all values are the same, add some range
            if (minValue === maxValue) {
                return [Math.max(0, minValue - 10), maxValue + 10];
            }
            
            const range = maxValue - minValue;
            
            // Add 15% padding on top and 5% on bottom for better visibility
            const topPadding = range * 0.15;
            const bottomPadding = range * 0.05;
            
            const yMin = Math.max(0, Math.floor(minValue - bottomPadding));
            const yMax = Math.ceil(maxValue + topPadding);

            return [yMin, yMax];
        };

        return {
            getStrokeDashArray,
            areAllLinesSolid: areAllLinesSolid(),
            minChartWidth: getMinChartWidth(),
            chartHeight: getChartHeight(),
            totalHeight: getTotalHeight(),
            legendHeight: getLegendHeight(),
            chartMargins: getChartMargins(),
            yAxisDomain: getYAxisDomain(),
        };
    }, [categories, data, isMobile, isTablet]);

    // Memoize tick formatter to prevent recreation on every render
    const formatTick = useCallback((tickItem) => {
        if (!tickItem) return '';
        const maxLength = isMobile ? 8 : 15;
        if (tickItem.length <= maxLength) return tickItem;

        const words = tickItem.split(' ');
        if (words.length === 1) {
            return tickItem.length > maxLength ? `${tickItem.substring(0, maxLength - 3)}...` : tickItem;
        }

        let lines = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + word).length <= maxLength) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine) lines.push(currentLine);

        return lines.slice(0, 2).join('\n');
    }, [isMobile]);

    // Memoize custom tick component
    const CustomizedAxisTick = useCallback((props) => {
        const { x, y, payload } = props;
        if (!payload?.value) return null;

        const lines = formatTick(payload.value).split('\n');

        return (
            <g transform={`translate(${x},${y})`}>
                {lines.map((line, index) => (
                    <text
                        key={index}
                        x={0}
                        y={index * (isMobile ? 12 : 14)}
                        dy={16}
                        textAnchor="middle"
                        lineHeight={isMobile ? 1 : 1.25}
                        fontWeight={500}
                        fontSize={isMobile ? 10 : 14}
                        fill="#000"
                    >
                        {line}
                    </text>
                ))}
            </g>
        );
    }, [formatTick, isMobile]);

    // Memoize custom legend to prevent unnecessary re-renders
    const renderCustomLegend = useCallback((props) => {
        const { payload } = props;
        if (!payload?.length) return null;

        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: isMobile ? 1 : 2,
                    px: isMobile ? 1 : 2,
                    py: isMobile ? 1.5 : 1,
                    width: "100%",
                }}
            >
                {payload.map((entry, index) => {
                    const category = categories.find((c) => c?.label === entry?.value);
                    if (!entry?.value) return null;

                    return (
                        <Box
                            key={`${entry.value}-${index}`}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                minWidth: 0,
                                width: isMobile ? "100%" : "auto",
                                p: isMobile ? 0.5 : 0,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                                {computedValues.areAllLinesSolid ? (
                                    <Box
                                        sx={{
                                            width: isMobile ? 10 : 12,
                                            height: isMobile ? 10 : 12,
                                            backgroundColor: entry.color,
                                            marginRight: 1,
                                            flexShrink: 0,
                                        }}
                                    />
                                ) : (
                                    <svg
                                        width={isMobile ? "16" : "20"}
                                        height="3"
                                        style={{ marginRight: 8, flexShrink: 0 }}
                                    >
                                        <line
                                            x1="0"
                                            y1="1.5"
                                            x2={isMobile ? "16" : "20"}
                                            y2="1.5"
                                            stroke={entry.color}
                                            strokeWidth="2"
                                            strokeDasharray={computedValues.getStrokeDashArray(category?.lineType) || "0"}
                                        />
                                    </svg>
                                )}
                                <Typography
                                    variant={isMobile ? "caption" : "body2"}
                                    sx={{
                                        maxWidth: isMobile ? "none" : 120,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: isMobile ? "normal" : "wrap",
                                        fontSize: isMobile ? "10px" : "14px",
                                        fontWeight: 400,
                                        lineHeight: isMobile ? 1.2 : 1.25,
                                    }}
                                    title={t(`common:infoCard.${entry.value}`, entry.value)}
                                >
                                    {t(`common:infoCard.${entry.value}`, entry.value)}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    }, [categories, computedValues, isMobile, t]);

    // Memoize tooltip formatters
    const tooltipLabelFormatter = useCallback((label) => {
        const point = data?.find(d => d?.shortLabel === label);
        return (
            <>
                <Typography
                    variant={isMobile ? "body2" : "body1"}
                    sx={{
                        fontWeight: 500,
                        mb: 0.5,
                        fontSize: isMobile ? "0.8rem" : "1rem"
                    }}
                >
                    {point?.longLabel || label}
                </Typography>
                <Divider sx={{ my: 0.5 }} />
            </>
        );
    }, [data, isMobile]);

    const tooltipFormatter = useCallback((value, name, props) => {
        const category = categories.find(c => c?.key === props?.dataKey);
        return [
            <Box
                key={`tooltip-${name}-${value}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={0}
                minHeight={isMobile ? 18 : 24}
                sx={{ mb: 0.5 }}
            >
                <Box
                    color="#222"
                    fontWeight={500}
                    display="flex"
                    alignItems="center"
                    flex={1}
                    sx={{
                        fontSize: isMobile ? "0.7rem" : "0.875rem",
                        pr: 1
                    }}
                >
                    <svg
                        width={isMobile ? "16" : "20"}
                        height="12"
                        style={{
                            marginRight: isMobile ? 4 : 6,
                            verticalAlign: "middle",
                            flexShrink: 0
                        }}
                    >
                        <line
                            x1="0"
                            y1="6"
                            x2={isMobile ? "16" : "20"}
                            y2="6"
                            stroke={category?.color}
                            strokeWidth="3"
                            strokeDasharray={computedValues.getStrokeDashArray(category?.lineType) || "0"}
                        />
                    </svg>
                    {!isMobile && (
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.2,
                                wordBreak: "break-word"
                            }}
                        >
                            {t(`common:infoCard.${category?.label}`, category?.label) || name} 
                        </Typography>
                    )}
                </Box>
                <Box
                    color="#222"
                    fontWeight={600}
                    ml={1}
                    flexShrink={0}
                    sx={{
                        fontSize: isMobile ? "0.8rem" : "1rem"
                    }}
                >
                    {value}
                </Box>
            </Box>
        ];
    }, [categories, computedValues, isMobile, t]);

    // Early return for loading state
    if (loading) {
        return (
            <CommonCard title={title} loading={loading} apiError={apiError} onReload={onReload}>
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={computedValues.totalHeight}
                    animation="wave"
                />
            </CommonCard>
        );
    }

    // Early return for error state
    if (apiError) {
        return (
            <CommonCard title={title} loading={loading} apiError={apiError} onReload={onReload}>
                <Grid item xs={12}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        minHeight={120}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Error loading data
                        </Typography>
                    </Box>
                </Grid>
            </CommonCard>
        );
    }

    // Early return for no data
    if (!data?.length) {
        return (
            <CommonCard title={title} loading={loading} apiError={apiError} onReload={onReload}>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        minHeight: computedValues.totalHeight,
                        height: '100%',
                        width: '100%',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        No data available
                    </Typography>
                </Box>
            </CommonCard>
        );
    }

    return (
        <CommonCard title={title} loading={loading} apiError={apiError} onReload={onReload}>
            <Grid item xs={12} sm={12} md={12}>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    {/* Legend at the top, outside chart */}
                    {categories.length > 0 && (
                        <Box sx={{ width: "100%", minHeight: computedValues.legendHeight }}>
                            {renderCustomLegend({ payload: categories.map(cat => ({ value: cat.label, color: cat.color })) })}
                        </Box>
                    )}
                    
                    {/* Chart area */}
                    <Box
                        sx={{
                            width: "100%",
                            height: computedValues.chartHeight,
                            overflowX: isMobile ? "auto" : "visible",
                            overflowY: "hidden",
                        }}
                    >
                        <Box
                            sx={{
                                width: computedValues.minChartWidth,
                                height: "100%",
                                minWidth: isMobile ? computedValues.minChartWidth : "100%"
                            }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={data}
                                    margin={computedValues.chartMargins}
                                >
                                    <XAxis
                                        dataKey="shortLabel"
                                        axisLine={true}
                                        tickLine={true}
                                        tick={<CustomizedAxisTick />}
                                        tickSize={isMobile ? 4 : 6}
                                        interval={0}
                                        height={isMobile ? 50 : 40}
                                    />
                                    <YAxis
                                        hide={true}
                                        domain={computedValues.yAxisDomain}
                                        allowDataOverflow={false}
                                        scale="linear"
                                        type="number"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #E0E0E0",
                                            borderRadius: "8px",
                                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                            fontSize: isMobile ? "12px" : "14px",
                                            maxWidth: isMobile ? "200px" : "400px",
                                            padding: isMobile ? "8px" : "12px",
                                        }}
                                        labelFormatter={tooltipLabelFormatter}
                                        formatter={tooltipFormatter}
                                        wrapperStyle={{ zIndex: 1000 }}
                                    />
                                    {categories.map((category, index) => {
                                        if (!category?.key) return null;

                                        return (
                                            <Line
                                                key={`${category.key}-${index}`}
                                                type={category.linearOrMonotone || "linear"}
                                                dataKey={category.key}
                                                stroke={category.color}
                                                strokeWidth={isMobile ? 1.5 : 2}
                                                strokeDasharray={computedValues.getStrokeDashArray(category.lineType)}
                                                name={category.label}
                                                dot={false}
                                                activeDot={true}
                                            />
                                        );
                                    })}
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>
                </Box>
            </Grid>
        </CommonCard>
    );
};

export default MultiLineGraph;