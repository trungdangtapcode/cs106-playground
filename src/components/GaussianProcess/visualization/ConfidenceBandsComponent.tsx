import * as d3 from 'd3';
import type { ConfidenceData } from '../types';

interface ConfidenceBandsProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  confData: ConfidenceData[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

/**
 * Renders confidence bands and mean line for the GP visualization
 */
export const renderConfidenceBands = ({
  svg,
  confData,
  xScale,
  yScale
}: ConfidenceBandsProps): void => {
  // Draw 2-sigma confidence band
  const area2 = d3.area<ConfidenceData>()
    .x(d => xScale(d.x))
    .y0(d => yScale(d.lower2))
    .y1(d => yScale(d.upper2));
    
  svg
    .append("path")
    .datum(confData)
    .attr("fill", "rgba(0, 100, 100, 0.1)")
    .attr("d", area2);
    
  // Draw 1-sigma confidence band
  const area1 = d3.area<ConfidenceData>()
    .x(d => xScale(d.x))
    .y0(d => yScale(d.lower1))
    .y1(d => yScale(d.upper1));
    
  svg
    .append("path")
    .datum(confData)
    .attr("fill", "rgba(0, 100, 100, 0.2)")
    .attr("d", area1);
    
  // Draw mean line
  const line = d3.line<ConfidenceData>()
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
};
