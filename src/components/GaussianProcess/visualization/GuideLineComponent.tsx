import * as d3 from 'd3';
import { Matrix } from 'ml-matrix';
import { calculateDisagreement, calculateStdDisagreement } from '../../../lib/math/disagreement';

interface GuideLineProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  guideLine: number;
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  xScale: d3.ScaleLinear<number, number>;
  onManualXChange?: (value: string) => void;
  samples?: Matrix | null;
  xs?: number[];
}

/**
 * Renders the vertical guide line with disagreement display
 */
export const renderGuideLine = ({
  svg,
  guideLine,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  width,
  height,
  padding,
  xScale,
  onManualXChange,
  samples,
  xs
}: GuideLineProps): void => {
  // Remove any existing guide line
  svg.selectAll(".guide-line").remove();
  
  // Calculate disagreement at this x position if samples are available
  let disagreementValue = 0;
  let stdDisagreementValue = 0;
  
  if (samples && samples.columns > 1 && xs) {
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
    // console.log(`Disagreement at x=${guideLine}: ${disagreementValue}, Std: ${stdDisagreementValue}`);
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
    .attr("stroke-width", 1.5);
  
  // Add hover effects
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
    
  // Make vertical line draggable if callback exists
  if (onManualXChange) {
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
        onManualXChange(newX.toFixed(1));
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
  }
    
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
};
