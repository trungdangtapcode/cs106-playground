import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { scaleLinear } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Matrix } from 'ml-matrix';
import type { Point, ConfidenceData, SampleData } from './types';

interface GpVisualizationProps {
  width: number;
  height: number;
  xs: number[];
  means: number[];
  marginalVariances: number[];
  points: Point[];
  samples: Matrix | null;
  noiseScale: number;
  onAddPoint: (point: Point) => void;
}

const GpVisualization: React.FC<GpVisualizationProps> = ({
  width,
  height,
  xs,
  means,
  marginalVariances,
  points,
  samples,
  noiseScale,
  onAddPoint,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const padding = { top: 30, right: 30, bottom: 50, left: 50 };
  
  // Draw the GP visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const xScale = scaleLinear()
      .domain([0, 10])
      .range([padding.left, width - padding.right]);
      
    const yScale = scaleLinear()
      .domain([-3, 3])
      .range([height - padding.bottom, padding.top]);
      
    // Draw axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - padding.bottom})`)
      .call(xAxis);
      
    svg
      .append("g")
      .attr("transform", `translate(${padding.left}, 0)`)
      .call(yAxis);
    
    // Draw x and y axis labels
    svg
      .append("text")
      .attr("transform", `translate(${width / 2}, ${height - 10})`)
      .style("text-anchor", "middle")
      .text("x");
      
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .style("text-anchor", "middle")
      .text("f(x)");
      
    // Draw confidence intervals
    const sigma = marginalVariances.map(v => Math.sqrt(v + (noiseScale * noiseScale)));
    const confidence1Lower = means.map((mean, i) => mean - sigma[i]);
    const confidence1Upper = means.map((mean, i) => mean + sigma[i]);
    const confidence2Lower = means.map((mean, i) => mean - 2 * sigma[i]);
    const confidence2Upper = means.map((mean, i) => mean + 2 * sigma[i]);
      // Create data array for confidence bands
    const confData: ConfidenceData[] = xs.map((x, i) => ({
      x,
      mean: means[i],
      lower1: confidence1Lower[i],
      upper1: confidence1Upper[i],
      lower2: confidence2Lower[i],
      upper2: confidence2Upper[i]
    }));
    
    // Draw 2-sigma confidence band
    const area2 = d3.area<typeof confData[0]>()
      .x(d => xScale(d.x))
      .y0(d => yScale(d.lower2))
      .y1(d => yScale(d.upper2));
      
    svg
      .append("path")
      .datum(confData)
      .attr("fill", "rgba(0, 100, 100, 0.1)")
      .attr("d", area2);
      
    // Draw 1-sigma confidence band
    const area1 = d3.area<typeof confData[0]>()
      .x(d => xScale(d.x))
      .y0(d => yScale(d.lower1))
      .y1(d => yScale(d.upper1));
      
    svg
      .append("path")
      .datum(confData)
      .attr("fill", "rgba(0, 100, 100, 0.2)")
      .attr("d", area1);
      
    // Draw mean line
    const line = d3.line<typeof confData[0]>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.mean));
      
    svg
      .append("path")
      .datum(confData)
      .attr("fill", "none")
      .attr("stroke", "rgb(0, 100, 100)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", line);
      
    // Draw samples if available
    if (samples) {
      const sampleColor = d3.scaleOrdinal(schemeCategory10);
        for (let i = 0; i < samples.columns; i++) {
        const sampleData: SampleData[] = xs.map((x, j) => ({
          x,
          y: samples.get(j, i)
        }));
        
        const sampleLine = d3.line<typeof sampleData[0]>()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y));
          
        svg
          .append("path")
          .datum(sampleData)
          .attr("fill", "none")
          .attr("stroke", sampleColor(i.toString()))
          .attr("stroke-width", 1.5)
          .attr("d", sampleLine);
      }
    }
    
    // Draw observations
    svg
      .selectAll("circle.observation")
      .data(points)
      .enter()
      .append("circle")
      .attr("class", "observation")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", "black");
      
    // Add click handler to add points
    svg
      .on("click", (event) => {
        const [x, y] = d3.pointer(event);
        const newX = xScale.invert(x);
        const newY = yScale.invert(y);
        onAddPoint({ x: newX, y: newY });
      });
      
  }, [
    width, 
    height, 
    xs, 
    means, 
    marginalVariances, 
    points, 
    samples, 
    noiseScale, 
    onAddPoint,
    padding.top, 
    padding.right, 
    padding.bottom, 
    padding.left
  ]);
  
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};

export default GpVisualization;
