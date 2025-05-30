import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { scaleLinear } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Matrix } from 'ml-matrix';
import type { Point, ConfidenceData, SampleData } from './types';
import { calculateDisagreement, calculateStdDisagreement } from '../../lib/math/disagreement';

interface GpVisualizationProps {
  width: number;
  height: number;
  xs: number[];
  means: number[];
  marginalVariances: number[];
  points: Point[];
  samples: Matrix | null;
  noiseScale: number;
  manualX?: string; // Add manualX prop to show the guide line
  onAddPoint: (point: Point) => void;
  onUpdatePoint?: (index: number, point: Point) => void; // New prop for updating a point
  onRemovePoint?: (index: number) => void; // New prop for removing a point
  onManualXChange?: (value: string) => void; // Callback for updating manualX when dragging the line
  // Function selection props
  useFunctionForY?: boolean;
  getYValueFromFunction?: (x: number) => number;
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
  manualX,
  onAddPoint,
  onUpdatePoint,
  onRemovePoint,
  onManualXChange,
  useFunctionForY,
  getYValueFromFunction,
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
    }    // Create a drag behavior for points
    const dragHandler = d3.drag<SVGCircleElement, Point>()
      .on('start', function(this: SVGCircleElement) {
        d3.select(this).raise().attr('r', 7);
      })
      .on('drag', function(this: SVGCircleElement, event: d3.D3DragEvent<SVGCircleElement, Point, Point>) {
        // Calculate new coordinates within the scales' domains
        const newX = Math.max(0, Math.min(10, xScale.invert(event.x)));
        const newY = Math.max(-3, Math.min(3, yScale.invert(event.y)));
        
        // Update the visual position of the circle
        d3.select(this)
          .attr('cx', xScale(newX))
          .attr('cy', yScale(newY));
      })
      .on('end', function(this: SVGCircleElement, event: d3.D3DragEvent<SVGCircleElement, Point, Point>, d: Point) {
        // Find the point in the array by its original coordinates
        const index = points.findIndex(p => p.x === d.x && p.y === d.y);
        if (index !== -1 && onUpdatePoint) {
          // Calculate final coordinates within the domains
          const newX = Math.max(0, Math.min(10, xScale.invert(event.x)));
          const newY = Math.max(-3, Math.min(3, yScale.invert(event.y)));
          
          // Call the update handler with the new coordinates
          onUpdatePoint(index, { x: newX, y: newY });
        }
        
        // Reset point size
        d3.select(this).attr('r', 5);
      });
    
    // Draw observations with interactive features
    const circles = svg
      .selectAll("circle.observation")
      .data(points)
      .enter()
      .append("circle")
      .attr("class", "observation")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", "black")      // Add hover effect with tooltip
      .on("mouseover", function(this: SVGCircleElement, _: MouseEvent, d: Point) {
        // Make the point bigger
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("stroke", "#0066cc")
          .attr("stroke-width", 2);
          
        // Create a tooltip showing the coordinates
        const tooltip = svg.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${xScale(d.x) + 10}, ${yScale(d.y) - 15})`);
          
        tooltip.append("rect")
          .attr("width", 100)
          .attr("height", 30)
          .attr("fill", "white")
          .attr("stroke", "#ccc")
          .attr("rx", 5);
          
        tooltip.append("text")
          .attr("x", 10)
          .attr("y", 20)
          .attr("text-anchor", "start")
          .text(`(${d.x.toFixed(2)}, ${d.y.toFixed(2)})`)
          .style("font-size", "12px");
      })
      .on("mouseout", function(this: SVGCircleElement) {
        // Reset the point style
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 5)
          .attr("stroke", "none")
          .attr("stroke-width", 0);
          
        // Remove tooltip
        svg.selectAll(".tooltip").remove();
      })// Add right-click to remove
      .on("contextmenu", function(this: SVGCircleElement, event: MouseEvent, d: Point) {
        event.preventDefault(); // Prevent the default context menu
        
        // Highlight the point briefly before removal
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .attr('fill', 'red');
          
        // Find the point in the array by its coordinates  
        const index = points.findIndex(p => p.x === d.x && p.y === d.y);
        
        // Call the remove handler if it exists
        if (index !== -1 && onRemovePoint) {
          // Short delay to show the highlight effect
          setTimeout(() => {
            onRemovePoint(index);
          }, 300);
        }
      });
    
    // Apply drag behavior to circles
    circles.call(dragHandler);
        // Add click handler to add points
    svg      .on("click", (event) => {
        const [x, y] = d3.pointer(event);
        const newX = xScale.invert(x);
        
        // If using function to calculate Y value
        if (useFunctionForY && getYValueFromFunction) {
          // Use the function to get Y value instead of clicked position
          const newY = getYValueFromFunction(newX);
          onAddPoint({ x: newX, y: newY });
        } else {
          // Use clicked Y position as normal
          const newY = yScale.invert(y);
          onAddPoint({ x: newX, y: newY });
        }
      });      // Draw vertical guide line for manualX
    if (manualX !== undefined) {
      const guideLine = parseFloat(manualX);
      if (!isNaN(guideLine) && guideLine >= 0 && guideLine <= 10) {
        // Remove any existing guide line
        svg.selectAll(".guide-line").remove();
        
        // Calculate disagreement at this x position if samples are available
        let disagreementValue = 0;
        let stdDisagreementValue = 0;
        
        if (samples && samples.columns > 1) {
          // Find the closest x index
          const xIndex = xs.reduce((closest, x, index, arr) => {
            return Math.abs(x - guideLine) < Math.abs(arr[closest] - guideLine) ? index : closest;
          }, 0);
          
          // Extract all model predictions at this x
          const predictions: number[] = [];
          for (let i = 0; i < samples.columns; i++) {
            predictions.push(samples.get(xIndex, i));
          }
          
          // Calculate disagreement and standard disagreement
          disagreementValue = calculateDisagreement(predictions);
          stdDisagreementValue = calculateStdDisagreement(predictions);
        }
        
        // Create a group for the guide line and its elements
        const guideGroup = svg.append("g")
          .attr("class", "guide-line")
          .style("cursor", "ew-resize");
        
        // Add a wider semi-transparent background for the line for easier grabbing
        guideGroup.append("rect")
          .attr("x", xScale(guideLine) - 6)
          .attr("y", padding.top)
          .attr("width", 12)
          .attr("height", height - padding.bottom - padding.top)
          .attr("fill", "rgba(255, 0, 0, 0.03)")
          .attr("stroke", "none");
        
        // Add a semi-transparent background for the line (makes it more visible)
        guideGroup.append("rect")
          .attr("x", xScale(guideLine) - 1.5)
          .attr("y", padding.top)
          .attr("width", 3)
          .attr("height", height - padding.bottom - padding.top)
          .attr("fill", "rgba(255, 0, 0, 0.15)");
        
        // Draw new guide line
        guideGroup.append("line")
          .attr("x1", xScale(guideLine))
          .attr("y1", padding.top)
          .attr("x2", xScale(guideLine))
          .attr("y2", height - padding.bottom)
          .attr("stroke", "rgba(255, 0, 0, 0.7)")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "5,5");
          
        // Add grab handles at top and bottom for visual cue that it's draggable
        const handleRadius = 4;
        
        // Top handle
        guideGroup.append("circle")
          .attr("cx", xScale(guideLine))
          .attr("cy", padding.top)
          .attr("r", handleRadius)
          .attr("fill", "white")
          .attr("stroke", "red")
          .attr("stroke-width", 1.5);
          
        // Bottom handle
        guideGroup.append("circle")
          .attr("cx", xScale(guideLine))
          .attr("cy", height - padding.bottom)
          .attr("r", handleRadius)
          .attr("fill", "white")
          .attr("stroke", "red")
          .attr("stroke-width", 1.5);        // Add hover effects
        guideGroup
          .on('mouseenter', function() {
            // Highlight the line on hover
            guideGroup.select('line')
              .attr('stroke', 'rgba(255, 0, 0, 0.9)')
              .attr('stroke-width', 2);
            
            // Make handles more visible
            guideGroup.selectAll('circle')
              .attr('r', 5)
              .attr('stroke-width', 2);
          })
          .on('mouseleave', function() {
            // Return to normal style when not hovering
            guideGroup.select('line')
              .attr('stroke', 'rgba(255, 0, 0, 0.7)')
              .attr('stroke-width', 1.5);
              
            guideGroup.selectAll('circle')
              .attr('r', 4)
              .attr('stroke-width', 1.5);
          });
          
        // Make vertical line draggable
        const dragLine = d3.drag<SVGGElement, unknown>()
          .on('start', function(this: SVGGElement) {
            // Visual feedback when dragging starts
            guideGroup.select('line')
              .attr('stroke', 'rgba(255, 0, 0, 1)')
              .attr('stroke-width', 3)
              .attr('stroke-dasharray', '8,3');
              
            guideGroup.selectAll('circle')
              .attr('r', 6)
              .attr('fill', '#ffdddd')
              .attr('stroke-width', 2.5);
          })
          .on('drag', function(this: SVGGElement, event: d3.D3DragEvent<SVGGElement, unknown, unknown>) {
            // Calculate new X position within boundaries
            const newX = Math.max(0, Math.min(10, xScale.invert(event.x)));
            
            // Update the manualX input value via a callback
            if (onManualXChange) {
              onManualXChange(newX.toFixed(1));
            }
          })
          .on('end', function(this: SVGGElement) {
            // Reset styling after drag ends
            guideGroup.select('line')
              .attr('stroke', 'rgba(255, 0, 0, 0.7)')
              .attr('stroke-width', 1.5)
              .attr('stroke-dasharray', '5,5');
              
            guideGroup.selectAll('circle')
              .attr('r', 4)
              .attr('fill', 'white')
              .attr('stroke-width', 1.5);
          });
            // Apply drag behavior to the entire group
        // TypeScript needs a type assertion here for compatibility
        guideGroup.call(dragLine as unknown as (selection: d3.Selection<SVGGElement, unknown, null, undefined>) => void);
          
        // Add x-value label with background for better visibility
        const labelGroup = guideGroup.append("g")
          .attr("transform", `translate(${xScale(guideLine)}, ${height - padding.bottom + 20})`);
            // Add label background
        labelGroup.append("rect")
          .attr("x", -25)
          .attr("y", -12)
          .attr("width", 50)
          .attr("height", 16)
          .attr("fill", "white")
          .attr("stroke", "red")
          .attr("stroke-width", 1)
          .attr("rx", 3);
          
        // Add text label
        labelGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "red")
          .attr("font-weight", "bold")
          .text(`x = ${guideLine.toFixed(1)}`);
            // Display disagreement value if samples are available
        if (samples && samples.columns > 1) {
          // Create a group for the disagreement label (positioned inside the plot)
          const disagreementGroup = svg.append("g")
            .attr("class", "disagreement-label")
            .attr("transform", `translate(${xScale(guideLine)}, ${padding.top + 15})`);
          
          // Add label background with semi-transparency
          disagreementGroup.append("rect")
            .attr("x", -60)
            .attr("y", -16)
            .attr("width", 120)
            .attr("height", 32)
            .attr("fill", "rgba(255, 255, 255, 0.8)")
            .attr("stroke", "purple")
            .attr("stroke-width", 1)
            .attr("rx", 4);
          
          // Add disagreement value text
          disagreementGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -2)
            .attr("font-size", "11px")
            .attr("fill", "purple")
            .attr("font-weight", "bold")
            .text(`Disagreement: ${disagreementValue.toFixed(3)}`);
          
          // Add standard disagreement value text
          disagreementGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 12)
            .attr("font-size", "11px")
            .attr("fill", "purple")
            .text(`Std: ${stdDisagreementValue.toFixed(3)}`);
        }
      }
    }
      }, [
    width, 
    height, 
    xs, 
    means, 
    marginalVariances, 
    points, 
    samples, 
    noiseScale, 
    manualX,
    onAddPoint,
    onUpdatePoint,
    onRemovePoint,
    onManualXChange,
    useFunctionForY,
    getYValueFromFunction,
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
