import { useState, useCallback, useEffect } from 'react';
import * as m from 'ml-matrix';

import { linspace } from '../lib/math/utils';
import { sqExpKernel, withJitter } from '../lib/math/kernels';
import { matrixSqrt, randn, sampleMvn } from '../lib/math/matrix';
import { prior, posterior } from '../lib/models/gaussianProcess';
import GpVisualization from '../components/GaussianProcess/GpVisualization';
import GpControls from '../components/GaussianProcess/GpControls';
import GpExplanation from '../components/GaussianProcess/GpExplanation';
import GpAnimation from '../components/GaussianProcess/GpAnimation';
import type { Point } from '../components/GaussianProcess/types';

const GaussianProcessPage: React.FC = () => {
  // State for visualization parameters
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const [points, setPoints] = useState<Point[]>([]);
  const [lengthscale, setLengthscale] = useState<number>(1.0);
  const [variance, setVariance] = useState<number>(1.0);
  const [noiseScale, setNoiseScale] = useState<number>(0.1);  const [sampleCount, setSampleCount] = useState<number>(5);  const [animating, setAnimating] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(0.5); // Default to a moderate speed
  const [samples, setSamples] = useState<m.Matrix | null>(null);
  
  // For user interaction and error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualX, setManualX] = useState<string>('5.0');
  const [manualY, setManualY] = useState<string>('0.0');

  // Grid points for visualization
  const num_grid = 100;
  const xs = linspace(0, 10, num_grid);
  
  // Calculate GP
  const kernel = sqExpKernel(variance, lengthscale);
  const kernelWithJitter = withJitter(kernel, 1e-6);
  
  const gp = points.length > 0
    ? posterior(
        kernelWithJitter,
        points.map(p => p.x),
        points.map(p => p.y),
        noiseScale * noiseScale
      )
    : prior(kernelWithJitter);
  
  const means = gp.mean(xs);
  const covMat = gp.cov(xs);
  const marginalVariances = covMat.diag();
  const covSqrt = matrixSqrt(covMat);
    // Handler for adding points
  const handleAddPoint = useCallback((point: Point) => {
    setPoints(prevPoints => [...prevPoints, point]);
  }, []);
  // Handler for generating samples - moved up to fix reference error
  const handleGenerateSamples = useCallback(() => {
    try {
      // Only generate new samples if we have a valid covariance matrix
      if (covSqrt && covSqrt.columns > 0) {
        const v = randn(covSqrt.columns, sampleCount);
        const newSamples = sampleMvn(means, covSqrt, v);
        setSamples(newSamples);
        
        // Show a success message that automatically disappears
        setErrorMessage(`Successfully generated ${sampleCount} new sample${sampleCount === 1 ? '' : 's'}`);
        setTimeout(() => {
          setErrorMessage(prevMsg => 
            prevMsg === `Successfully generated ${sampleCount} new sample${sampleCount === 1 ? '' : 's'}` 
              ? null 
              : prevMsg
          );
        }, 2000);
      }
    } catch (err) {
      setErrorMessage("Error generating samples: " + (err instanceof Error ? err.message : String(err)));
    }
  }, [covSqrt, means, sampleCount]);
  
  // Handler for manually adding points
  const handleAddManualPoint = useCallback(() => {
    try {
      const x = parseFloat(manualX);
      const y = parseFloat(manualY);
      
      if (isNaN(x) || isNaN(y)) {
        setErrorMessage("Please enter valid numbers for X and Y coordinates");
        return;
      }
      
      if (x < 0 || x > 10) {
        setErrorMessage("X value must be between 0 and 10");
        return;
      }
      
      setPoints(prevPoints => [...prevPoints, { x, y }]);
      
      // Show success message
      setErrorMessage(`Successfully added point (${x.toFixed(2)}, ${y.toFixed(2)})`);
      setTimeout(() => {
        setErrorMessage(prevMsg => 
          prevMsg === `Successfully added point (${x.toFixed(2)}, ${y.toFixed(2)})` 
            ? null 
            : prevMsg
        );
      }, 2000);
      
      // Generate new samples with the new point
      handleGenerateSamples();
    } catch (err) {
      setErrorMessage("Error adding point: " + (err instanceof Error ? err.message : String(err)));
    }
  }, [manualX, manualY, handleGenerateSamples]);
  
  // Handler for updating manual X input
  const handleManualXChange = useCallback((value: string) => {
    setManualX(value);
  }, []);
  
  // Handler for updating manual Y input
  const handleManualYChange = useCallback((value: string) => {
    setManualY(value);
  }, []);
    // Handler for toggling animation
  const handleToggleAnimation = useCallback(() => {
    setAnimating(prev => !prev);
  }, []);
  
  // Handler for changing animation speed
  const handleAnimationSpeedChange = useCallback((speed: number) => {
    setAnimationSpeed(speed);
  }, []);
  
  // Handler for updating samples
  const handleSamplesUpdate = useCallback((newSamples: m.Matrix) => {
    setSamples(newSamples);
  }, []);
    // Initialize samples when component mounts or key dependencies change
  useEffect(() => {
    // Only generate samples if they haven't been generated yet or key parameters changed
    if (!samples && covSqrt && covSqrt.columns > 0) {
      handleGenerateSamples();
    }
  }, [samples, covSqrt, handleGenerateSamples]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      // Responsive sizing based on window width
      const containerWidth = window.innerWidth > 1200 ? 1100 : window.innerWidth - 100;
      setWidth(containerWidth);
      setHeight(Math.min(400, Math.max(300, containerWidth * 0.5)));
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Interactive Gaussian Process Visualization</h1>
        {errorMessage && (
        <div className={`${
          errorMessage.startsWith("Successfully") 
            ? "bg-green-100 border border-green-400 text-green-700" 
            : "bg-red-100 border border-red-400 text-red-700"
          } px-4 py-3 rounded mb-4`}
        >
          <p>
            <strong>{errorMessage.startsWith("Successfully") ? "Success:" : "Error:"}</strong> {errorMessage}
          </p>
          <button 
            onClick={() => setErrorMessage(null)}
            className={`text-sm ${
              errorMessage.startsWith("Successfully") 
                ? "text-green-700 hover:text-green-800" 
                : "text-red-700 hover:text-red-800"
              } underline mt-2`}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
        <GpVisualization
          width={width}
          height={height}
          xs={xs}
          means={means}
          marginalVariances={marginalVariances}
          points={points}
          samples={samples}
          noiseScale={noiseScale}
          onAddPoint={handleAddPoint}
        />
      
        <div className="mt-4 text-sm text-gray-600">
          <p>Click anywhere on the plot to add observations. Samples are automatically redrawn when parameters change.</p>
        </div>
      </div>
        <GpControls
        lengthscale={lengthscale}
        variance={variance}
        noiseScale={noiseScale}
        sampleCount={sampleCount}
        animating={animating}
        animationSpeed={animationSpeed}
        hasPoints={points.length > 0}
        manualX={manualX}
        manualY={manualY}
        onLengthscaleChange={setLengthscale}
        onVarianceChange={setVariance}
        onNoiseScaleChange={setNoiseScale}
        onSampleCountChange={setSampleCount}
        onAnimationSpeedChange={handleAnimationSpeedChange}
        onManualXChange={handleManualXChange}
        onManualYChange={handleManualYChange}
        onAddManualPoint={handleAddManualPoint}
        onGenerateSamples={handleGenerateSamples}
        onToggleAnimation={handleToggleAnimation}
        onClearPoints={() => setPoints([])}
      />
      
      <GpExplanation />
      
      {/* Animation component doesn't render UI, but handles the animation logic */}      <GpAnimation
        animating={animating}
        means={means}
        covSqrt={covSqrt}
        sampleCount={sampleCount}
        animationSpeed={animationSpeed}
        onSamplesUpdate={handleSamplesUpdate}
      />
    </div>
  );
};

export default GaussianProcessPage;