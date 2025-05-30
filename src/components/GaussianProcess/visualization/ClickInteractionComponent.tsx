import * as d3 from 'd3';
import type { Point } from '../types';

interface ClickInteractionProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  onAddPoint: (point: Point) => void;
  useFunctionForY?: boolean;
  getYValueFromFunction?: (x: number) => number;
}

/**
 * Sets up click interactions for adding points to the GP model
 */
export const setupClickInteraction = ({
  svg,
  xScale,
  yScale,
  onAddPoint,
  useFunctionForY,
  getYValueFromFunction
}: ClickInteractionProps): void => {
  // Add click handler to add points
  svg.on("click", (event) => {
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
  });
};
