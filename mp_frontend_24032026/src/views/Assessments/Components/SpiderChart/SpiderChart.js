import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './SpiderChart.css';

const SpiderChart = ({ data, levels = 5, maxValue = 100 }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const createChart = () => {
      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = chartRef.current.clientHeight;

      // Adjust margins and reduce overall dimensions
      const margin = { top: 0, right: 0, bottom: 40, left: 160 }; // Reduced margins
      const width = Math.min(containerWidth, containerHeight) - margin.left - margin.right;
      const height = Math.min(containerWidth, containerHeight) - margin.top - margin.bottom;
      const radius = Math.min(width / 2, height / 3); // Further scale radius down
      const angleSlice = (Math.PI * 2) / data.length;
      const maxWidth = 80; // Max width for the label boxes
      const labelOffset = 30; // Adjusted offset for labels outside the chart

      // Remove existing chart on re-render
      d3.select(chartRef.current).select('svg').remove();

      // Create the SVG container with margins applied
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .append('g')
        .attr('transform', `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

      const rScale = d3.scaleLinear().range([0, radius]).domain([0, maxValue]);

      // Draw spider net
      for (let level = 0; level < levels; level++) {
        const levelFactor = radius * ((level + 1) / levels);
        svg.selectAll('.levels')
          .data([1])
          .enter()
          .append('polygon')
          .attr('class', 'grid-polygon')
          .attr('points', () => {
            return data.map((d, i) => {
              const x = levelFactor * Math.cos(angleSlice * i - Math.PI / 2);
              const y = levelFactor * Math.sin(angleSlice * i - Math.PI / 2);
              return [x, y].join(',');
            }).join(' ');
          })
          .style('stroke', '#778791')
          .style('fill', 'none');
      }

      // Draw the axes
      const axisGrid = svg.selectAll('.axis')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'axis');

      axisGrid.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => rScale(maxValue) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y2', (d, i) => rScale(maxValue) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr('class', 'line')
        .style('stroke', '#778791')
        .style('stroke-width', '1.5px');

      // Add the rectangle and text outside the chart at consistent distances
      axisGrid.each(function (d, i) {
        const g = d3.select(this);
        
        // Calculate x and y positions for the label (text and rectangle)
        const x = rScale(maxValue + labelOffset) * Math.cos(angleSlice * i - Math.PI / 2);
        const y = rScale(maxValue + labelOffset) * Math.sin(angleSlice * i - Math.PI / 2);

        // Append the text first so we can measure it
        const text = g.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', '0.35em')
          .style('font-size', '10px')
          .style('font-weight', 'bold')
          .style('fill', 'black')
          .style('text-anchor', function() {
            // Set anchor based on angle for better positioning
            if (x > 0) return 'start';
            else if (x < 0) return 'end';
            else return 'middle';
          });

        // Handle line breaks for long text
        const valueLabel = d.value !== null && d.value !== undefined ? `${d.value}%` : 'Excluded';
        const words = `${d.axis}: ${valueLabel}`.split(' ');
        let line = [];
        let tspan = text.append('tspan').attr('x', x).attr('y', y);

        words.forEach((word, index) => {
          if (word === `${d.value}%`) {
            // If the current word is d.value, start a new line
            if (line.length > 0) {
              tspan.text(line.join(' ')); // Complete the current line
            }
            line = []; // Clear the line

            // Append a new tspan for d.value on the next line
            tspan = text.append('tspan')
              .attr('x', x)
              .attr('dy', '1.2em') // New line spacing
              .text(word)
              .style('font-size', '14px');
          } else {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > maxWidth) {
              line.pop(); // Remove the last word
              tspan.text(line.join(' ')); // Complete the current line
              line = [word]; // Start a new line with the current word

              // Append a new tspan for the next line
              tspan = text.append('tspan')
                .attr('x', x)
                .attr('dy', '1.2em')
                .text(word);
            }
          }
        });

        // Get text size to position the rectangle correctly
        const textSize = text.node().getBBox();
        const padding = 5; // Add padding around the text

        // Append the rectangle behind the text and ensure correct alignment
        g.insert('rect', 'text')
          .attr('x', textSize.x - padding)
          .attr('y', textSize.y - padding)
          .attr('width', textSize.width + padding * 2)
          .attr('height', textSize.height + padding * 2)
          .attr('rx', 5)
          .attr('ry', 5)
          .style('fill', 'white')
          .style('stroke', '#ccc')
          .style('stroke-width', '1px')
          .lower(); // Send the rectangle behind the text
      });

      // Prepare data for the radar line: interpolate nulls
      const interpolatedData = data.map((d, i, arr) => {
        if (d.value !== null && d.value !== undefined) return d;
        // Find previous and next non-null values for interpolation
        let prevIdx = i, nextIdx = i;
        while (prevIdx > 0 && (arr[prevIdx].value === null || arr[prevIdx].value === undefined)) prevIdx--;
        while (nextIdx < arr.length - 1 && (arr[nextIdx].value === null || arr[nextIdx].value === undefined)) nextIdx++;
        const prev = arr[prevIdx].value;
        const next = arr[nextIdx].value;
        if (prev !== null && prev !== undefined && next !== null && next !== undefined && prevIdx !== nextIdx) {
          // Linear interpolation
          const t = (i - prevIdx) / (nextIdx - prevIdx);
          return { ...d, value: prev + t * (next - prev) };
        }
        // If cannot interpolate, use null (will break the line)
        return { ...d, value: null };
      });

      // Radar line function (span gaps)
      const radarLine = d3.lineRadial()
        .defined(d => d.value !== null && d.value !== undefined)
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);

      // Draw the radar chart blob (data lines)
      svg.append('path')
        .datum(interpolatedData)
        .attr('d', radarLine)
        .attr('class', 'radar-line')
        .style('stroke', '#F37123')
        .style('fill', '#F37123')
        .style('fill-opacity', 0)
        .style('stroke-width', '2px');

      // Add the bullet dots at each data point (only for non-null)
      // Draw dots only for non-null values, at correct angular positions
      data.forEach((d, i) => {
        if (d.value !== null && d.value !== undefined) {
          svg.append('circle')
            .attr('class', 'radar-circle')
            .attr('cx', rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('cy', rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr('r', 10)
            .style('fill', '#F37123')
            .style('fill-opacity', 0.8);
        }
      });
    };

    createChart();

    // Add resize event listener
    window.addEventListener('resize', createChart);

    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', createChart);

  }, [data, levels, maxValue]);

  return <div ref={chartRef} className="spider-chart" style={{ width: '100%', height: '550px' }}></div>; // Fixed height for the chart
};

export default SpiderChart;
