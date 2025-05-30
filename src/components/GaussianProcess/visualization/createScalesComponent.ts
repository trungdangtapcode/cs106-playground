import { scaleLinear } from 'd3-scale';

interface ScalesProps {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

/**
 * Creates D3 scales for x and y axes
 */
export const createScales = ({ width, height, padding }: ScalesProps) => {
  const xScale = scaleLinear()
    .domain([0, 10])
    .range([padding.left, width - padding.right]);
    
  const yScale = scaleLinear()
    .domain([-3, 3])
    .range([height - padding.bottom, padding.top]);
    
  return { xScale, yScale };
};
