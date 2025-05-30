import React from 'react';

interface GpControlsProps {
  lengthscale: number;
  variance: number;
  noiseScale: number;
  sampleCount: number;
  animating: boolean;
  hasPoints: boolean;
  onLengthscaleChange: (value: number) => void;
  onVarianceChange: (value: number) => void;
  onNoiseScaleChange: (value: number) => void;
  onSampleCountChange: (value: number) => void;
  onGenerateSamples: () => void;
  onToggleAnimation: () => void;
  onClearPoints: () => void;
}

/**
 * Component for GP parameter controls
 */
const GpControls: React.FC<GpControlsProps> = ({
  lengthscale,
  variance,
  noiseScale,
  sampleCount,
  animating,
  hasPoints,
  onLengthscaleChange,
  onVarianceChange,
  onNoiseScaleChange,
  onSampleCountChange,
  onGenerateSamples,
  onToggleAnimation,
  onClearPoints,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Kernel Parameters</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Lengthscale: {lengthscale.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={lengthscale}
              onChange={(e) => onLengthscaleChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Variance: {variance.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={variance}
              onChange={(e) => onVarianceChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Noise: {noiseScale.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={noiseScale}
              onChange={(e) => onNoiseScaleChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Visualization Options</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Number of Samples: {sampleCount}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={sampleCount}
              onChange={(e) => onSampleCountChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={onGenerateSamples}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Generate New Samples
            </button>
            
            <button
              onClick={onToggleAnimation}
              className={`px-4 py-2 ${animating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded`}
            >
              {animating ? 'Stop Animation' : 'Start Animation'}
            </button>
          </div>
          
          {hasPoints && (
            <button
              onClick={onClearPoints}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Points
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default GpControls;
