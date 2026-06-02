import { useRef } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import CustomTooltip from './CustomTooltip'; // Assuming you have a CustomTooltip component


const TrendLineChart = ({ data }) => {
  const lineColor = "#71C5D4";
  const chartRef = useRef(null);

  const renderTooltip = (props) => (
    <CustomTooltip {...props} chartRef={chartRef} />
  );

  return (
   <div
  style={{
    width: '120px',
    height: '45px',      // 👈 Explicit height (instead of just minHeight)
    display: 'flex',
    alignItems: 'center' // Optional: vertical centering of chart
  }}
  ref={chartRef}
>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart
      data={data}
      margin={{ top: 20,right:4,left:4}} // Prevents lines/dots at extreme edges
    >
      <Line
        type="monotone"
        dataKey="value"
        stroke={lineColor}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 4, fill: lineColor, stroke: '#fff', strokeWidth: 2 }}
      />
      <Tooltip
        content={renderTooltip}
        cursor={false}
        position={undefined}
        allowEscapeViewBox={{ x: true, y: true }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>

  );
};

export default TrendLineChart;