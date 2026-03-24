import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMediaQuery } from '@mui/system';

export default function BasicPie({ series }) {
    const isLargeScreen = useMediaQuery("(min-width: 2000px)");
    const colors = [
        "#4E79A7", "#F28E2B", "#E15759", "#76B7B2",
        "#59A14F", "#EDC948", "#B07AA1", "#FF9DA7", "#9C755F"
    ];

    return (
        <PieChart
            colors={colors}
            series={[{ data: series }]}
            height={250}
            margin={{ left:(isLargeScreen)?100:0,right:(isLargeScreen)? 325:0 }}
            slotProps={{
                legend: {
                    direction: 'column',
                    hidden: !(isLargeScreen),
                    position: {
                        vertical: 'middle',
                        horizontal: 'right',
                    },
                    itemGap:5,
                },
                
            }}
            sx={{ overflow: "hidden" }}

        />
    );
}
