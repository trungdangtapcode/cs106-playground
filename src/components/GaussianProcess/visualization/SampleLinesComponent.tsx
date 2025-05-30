import * as d3 from 'd3';
import { Matrix } from 'ml-matrix';
import { schemeCategory10 } from 'd3-scale-chromatic';
import type { SampleData } from '../types';

interface SampleLinesProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  samples: Matrix;
  xs: number[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

/**
 * Renders sample lines from the GP simulation
 */
export const renderSampleLines = ({ 
  svg,
  samples,
  xs,
  xScale,
  yScale
}: SampleLinesProps): void => {
  if (!samples || samples.columns === 0) return;
  
  const sampleColor = d3.scaleOrdinal(schemeCategory10);
  
  for (let i = 0; i < samples.columns; i++) {
    const sampleData: SampleData[] = xs.map((x, j) => ({
      x,
      y: samples.get(j, i)
    }));
    
    const sampleLine = d3.line<SampleData>()
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
};
