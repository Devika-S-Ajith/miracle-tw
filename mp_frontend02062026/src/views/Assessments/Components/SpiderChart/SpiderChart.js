import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './SpiderChart.css';

const SpiderChart = ({ data, levels = 5, maxValue = 100 }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const createChart = () => {
      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = chartRef.current.clientHeight;

      const margin = { top: 0, right: 0, bottom: 40, left: 160 };
      const width = Math.min(containerWidth, containerHeight) - margin.left - margin.right;
      const height = Math.min(containerWidth, containerHeight) - margin.top - margin.bottom;
      const radius = Math.min(width / 2, height / 3);
      const angleSlice = (Math.PI * 2) / data.length;
      const maxWidth = 80;
      const labelOffset = 30;

      d3.select(chartRef.current).select('svg').remove();

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

      // Labels
      axisGrid.each(function (d, i) {
        const g = d3.select(this);

        const x = rScale(maxValue + labelOffset) * Math.cos(angleSlice * i - Math.PI / 2);
        const y = rScale(maxValue + labelOffset) * Math.sin(angleSlice * i - Math.PI / 2);

        const text = g.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', '0.35em')
          .style('font-size', '10px')
          .style('font-weight', 'bold')
          .style('fill', 'black')
          .style('text-anchor', function () {
            if (x > 0) return 'start';
            else if (x < 0) return 'end';
            else return 'middle';
          });

        const valueLabel = d.value !== null && d.value !== undefined ? `${d.value}%` : 'Excluded';
        const words = `${d.axis}: ${valueLabel}`.split(' ');
        let line = [];
        let tspan = text.append('tspan').attr('x', x).attr('y', y);

        words.forEach((word) => {
          if (word === `${d.value}%`) {
            if (line.length > 0) {
              tspan.text(line.join(' '));
            }
            line = [];
            tspan = text.append('tspan')
              .attr('x', x)
              .attr('dy', '1.2em')
              .text(word)
              .style('font-size', '14px');
          } else {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > maxWidth) {
              line.pop();
              tspan.text(line.join(' '));
              line = [word];
              tspan = text.append('tspan')
                .attr('x', x)
                .attr('dy', '1.2em')
                .text(word);
            }
          }
        });

        const textSize = text.node().getBBox();
        const padding = 5;

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
          .lower();
      });

      // Skip null values entirely — use cartesian coords for the path
      const validData = data
        .map((d, i) => ({ ...d, index: i }))
        .filter(d => d.value !== null && d.value !== undefined);

      const points = validData.map(d => ({
        x: rScale(d.value) * Math.cos(angleSlice * d.index - Math.PI / 2),
        y: rScale(d.value) * Math.sin(angleSlice * d.index - Math.PI / 2),
      }));

      const pathD = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`
      ).join(' ') + ' Z';

      svg.append('path')
        .attr('d', pathD)
        .attr('class', 'radar-line')
        .style('stroke', '#F37123')
        .style('fill', '#F37123')
        .style('fill-opacity', 0)
        .style('stroke-width', '2px');

      // Draw dots only for non-null values
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
    window.addEventListener('resize', createChart);
    return () => window.removeEventListener('resize', createChart);

  }, [data, levels, maxValue]);

  return <div ref={chartRef} className="spider-chart" style={{ width: '100%', height: '550px' }}></div>;
};

export default SpiderChart;