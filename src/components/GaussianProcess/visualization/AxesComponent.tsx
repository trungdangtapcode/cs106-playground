import * as d3 from 'd3';

interface AxesComponentProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

/**
 * Renders the axes and labels for the GP visualization
 */
export const renderAxes = ({
  svg,
  width,
  height,
  padding,
  xScale,
  yScale
}: AxesComponentProps): void => {
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
};
