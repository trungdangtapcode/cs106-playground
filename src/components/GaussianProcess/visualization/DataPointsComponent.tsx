import * as d3 from 'd3';
import type { Point } from '../types';

interface DataPointsProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  points: Point[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  onUpdatePoint?: (index: number, point: Point) => void;
  onRemovePoint?: (index: number) => void;
}

/**
 * Renders interactive data points for the GP visualization
 */
export const renderDataPoints = ({
  svg,
  points,
  xScale,
  yScale,
  onUpdatePoint,
  onRemovePoint
}: DataPointsProps): void => {
  // Create a drag behavior for points
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
    .attr("fill", "black")
    // Add hover effect with tooltip
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
    })
    // Add right-click to remove
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
};
