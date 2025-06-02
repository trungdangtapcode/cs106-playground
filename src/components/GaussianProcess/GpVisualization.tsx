import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Matrix } from 'ml-matrix';
import type { Point } from './types';
import { renderAxes } from './visualization/AxesComponent';
import { renderConfidenceBands } from './visualization/ConfidenceBandsComponent';
import { renderSampleLines } from './visualization/SampleLinesComponent';
import { renderDataPoints } from './visualization/DataPointsComponent';
import { renderGuideLine } from './visualization/GuideLineComponent';
import { setupClickInteraction } from './visualization/ClickInteractionComponent';
import { createScales } from './visualization/createScalesComponent';
import { prepareConfidenceData } from './visualization/prepareConfidenceData';

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


    // Avoid Right-click
    svg.on('contextmenu', (event) => {
      event.preventDefault();
    });
    
    // Create scales
    const { xScale, yScale } = createScales({ width, height, padding });
    
    // Render axes and labels
    renderAxes({ svg, width, height, padding, xScale, yScale });
    
    // Prepare confidence interval data
    const confData = prepareConfidenceData({
      xs,
      means,
      marginalVariances,
      noiseScale
    });
    
    // Render confidence bands
    renderConfidenceBands({ svg, confData, xScale, yScale });
    
    // Render samples if available
    if (samples) {
      renderSampleLines({ svg, samples, xs, xScale, yScale });
    }
      // Configure interactions for data points
    renderDataPoints({
      svg,
      points,
      xScale,
      yScale,
      onUpdatePoint,
      onRemovePoint
    });
    
    // Set up click interaction for adding new points
    setupClickInteraction({
      svg,
      xScale,
      yScale,
      onAddPoint,
      useFunctionForY,
      getYValueFromFunction
    });
      // Draw vertical guide line for manualX
    if (manualX !== undefined) {
      const guideLine = parseFloat(manualX);
      if (!isNaN(guideLine) && guideLine >= 0 && guideLine <= 10) {
        renderGuideLine({
          svg,
          guideLine,
          width,
          height,
          padding,
          xScale,
          onManualXChange,
          samples,
          xs
        });
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
