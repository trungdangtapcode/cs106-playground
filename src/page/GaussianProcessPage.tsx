  import { useState, useCallback, useEffect } from 'react';
import * as m from 'ml-matrix';

import { linspace } from '../lib/math/utils';
import { sqExpKernel, withJitter } from '../lib/math/kernels';
import { matrixSqrt } from '../lib/math/matrix';
import { prior, posterior } from '../lib/models/gaussianProcess';
import GpVisualization from '../components/GaussianProcess/GpVisualization';
import GpControls from '../components/GaussianProcess/GpControls';
import GpExplanation from '../components/GaussianProcess/GpExplanation';
import GpAnimation from '../components/GaussianProcess/GpAnimation';
import type { Point } from '../components/GaussianProcess/types';

const GaussianProcessPage: React.FC = () => {
  // console.log("GaussianProcessPage rendering");
  
  // State for visualization parameters
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const [points, setPoints] = useState<Point[]>([]);
  const [lengthscale, setLengthscale] = useState<number>(1.0);
  const [variance, setVariance] = useState<number>(1.0);
  const [noiseScale, setNoiseScale] = useState<number>(0.1);
  const [sampleCount, setSampleCount] = useState<number>(5);
  const [animating, setAnimating] = useState<boolean>(false);
  const [samples, setSamples] = useState<m.Matrix | null>(null);
  
  // For debugging
  const [error, setError] = useState<string | null>(null);

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
  
  // Handler for toggling animation
  const handleToggleAnimation = useCallback(() => {
    setAnimating(prev => !prev);
  }, []);
  
  // Handler for generating samples
  const handleGenerateSamples = useCallback(() => {
    // The actual sample generation is handled by the GpAnimation component
    // but we can force a refresh by toggling the animation briefly
    setAnimating(true);
    setTimeout(() => setAnimating(false), 100);
  }, []);
  
  // Handler for updating samples
  const handleSamplesUpdate = useCallback((newSamples: m.Matrix) => {
    setSamples(newSamples);
  }, []);
  
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
  // Try-catch to catch any rendering errors
  try {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Interactive Gaussian Process Visualization</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p><strong>Error:</strong> {error}</p>
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
        hasPoints={points.length > 0}
        onLengthscaleChange={setLengthscale}
        onVarianceChange={setVariance}
        onNoiseScaleChange={setNoiseScale}
        onSampleCountChange={setSampleCount}
        onGenerateSamples={handleGenerateSamples}
        onToggleAnimation={handleToggleAnimation}
        onClearPoints={() => setPoints([])}
      />
        <GpExplanation />
      
      {/* Animation component doesn't render UI, but handles the animation logic */}
      <GpAnimation
        animating={animating}
        means={means}
        covSqrt={covSqrt}
        sampleCount={sampleCount}
        onSamplesUpdate={handleSamplesUpdate}
      />
    </div>
  );
  } catch (err) {
    // Capture any rendering errors
    console.error("Error rendering GaussianProcessPage:", err);
    setError(err instanceof Error ? err.message : String(err));
    
    // Fallback UI
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gaussian Process Visualization Error</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> An error occurred while rendering the visualization.</p>
          <p>{error}</p>
        </div>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(err, null, 2)}
        </pre>
      </div>
    );
  }
};

export default GaussianProcessPage;