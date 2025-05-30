import React from 'react';
import useGaussianProcessStore, { FunctionType } from '../../lib/store/gaussianProcessStore';

// We'll still keep some props for components that haven't been converted yet
interface GpControlsProps {
  lengthscale: number;
  variance: number;
  noiseScale: number;
  sampleCount: number;
  animating: boolean;
  animationSpeed: number;
  hasPoints: boolean;
  manualX: string;
  manualY: string;
  onLengthscaleChange: (value: number) => void;
  onVarianceChange: (value: number) => void;
  onNoiseScaleChange: (value: number) => void;
  onSampleCountChange: (value: number) => void;
  onAnimationSpeedChange: (value: number) => void;
  onManualXChange: (value: string) => void;
  onManualYChange: (value: string) => void;
  onAddManualPoint: () => void;
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
  animationSpeed,
  hasPoints,
  manualX,
  manualY,
  onLengthscaleChange,
  onVarianceChange,
  onNoiseScaleChange,
  onSampleCountChange,
  onAnimationSpeedChange,
  onManualXChange,
  onManualYChange,
  onAddManualPoint,
  onGenerateSamples,
  onToggleAnimation,
  onClearPoints,
}) => {
  // Get store values and actions
  const selectedFunction = useGaussianProcessStore(state => state.selectedFunction);
  const setSelectedFunction = useGaussianProcessStore(state => state.setSelectedFunction);
  const useFunctionForY = useGaussianProcessStore(state => state.useFunctionForY);
  const setUseFunctionForY = useGaussianProcessStore(state => state.setUseFunctionForY);
  const getYValueFromFunction = useGaussianProcessStore(state => state.getYValueFromFunction);
  const addPointWithFunction = useGaussianProcessStore(state => state.addPointWithFunction);
    // Calculate Y value from function if needed
  const calculatedY = React.useMemo(() => {
    if (useFunctionForY && selectedFunction !== FunctionType.NONE) {
      try {
        const x = parseFloat(manualX);
        if (!isNaN(x)) {
          return getYValueFromFunction(x).toFixed(2);
        }
      } catch (error) {
        console.error("Error calculating Y value:", error);
      }
    }
    return 'N/A';
  }, [useFunctionForY, selectedFunction, manualX, getYValueFromFunction]);
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
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Animation Speed: {animationSpeed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.01"
              max="5"
              step="0.01"
              value={animationSpeed}
              onChange={(e) => onAnimationSpeedChange(parseFloat(e.target.value))}
              className={`w-full ${animating ? '' : 'opacity-50'}`}
              disabled={!animating}
              title={animating ? 'Adjust animation speed' : 'Start animation to adjust speed'}
            />
          </div>
            <div className="flex space-x-4">
            <button
              onClick={onGenerateSamples}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 flex items-center font-medium shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generate New Samples
            </button>
            
            <button
              onClick={onToggleAnimation}
              className={`px-4 py-2 ${animating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md transition duration-200 flex items-center shadow-md`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {animating ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                )}
              </svg>
              {animating ? 'Stop Animation' : 'Start Animation'}
            </button>
          </div>          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h3 className="font-medium mb-3">Add Data Point</h3>
            
            {/* Function Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Function Selection:</label>              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedFunction(FunctionType.NONE)}
                  className={`px-3 py-2 border rounded text-sm ${
                    selectedFunction === FunctionType.NONE
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Manual Input
                </button>
                <button
                  onClick={() => setSelectedFunction(FunctionType.SINE)}
                  className={`px-3 py-2 border rounded text-sm ${
                    selectedFunction === FunctionType.SINE
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  sin(x)
                </button>
                <button
                  onClick={() => setSelectedFunction(FunctionType.QUADRATIC)}
                  className={`px-3 py-2 border rounded text-sm ${
                    selectedFunction === FunctionType.QUADRATIC
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  x²/100
                </button>
                <button
                  onClick={() => setSelectedFunction(FunctionType.LINEAR)}
                  className={`px-3 py-2 border rounded text-sm ${
                    selectedFunction === FunctionType.LINEAR
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  x/10
                </button>
              </div>
                {/* Use function for Y toggle */}
              <div className="mt-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-500 transition duration-150 ease-in-out"
                    checked={useFunctionForY}
                    onChange={(e) => setUseFunctionForY(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Use function to calculate Y value</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">When enabled, Y coordinate will be calculated automatically from the selected function</p>
              </div>
            </div>
            
            {/* X and Y coordinates */}
            <div className="flex gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">X Coordinate:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={manualX}
                  onChange={(e) => onManualXChange(e.target.value)}
                  className="px-3 py-2 border rounded w-28 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="0-10"
                />
                <p className="text-xs text-red-500 mt-1">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Shows as dashed red line on plot
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Y Coordinate:</label>                <input
                  type="number"
                  step="0.1"
                  value={manualY}
                  onChange={(e) => onManualYChange(e.target.value)}
                  className={`px-3 py-2 border rounded w-28 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                    useFunctionForY && selectedFunction !== FunctionType.NONE
                      ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                      : ''
                  }`}
                  placeholder="Any value"
                  disabled={useFunctionForY && selectedFunction !== FunctionType.NONE}
                />
                {useFunctionForY && selectedFunction !== FunctionType.NONE && (
                  <p className="text-xs text-blue-500 mt-1">
                    Auto: {calculatedY}
                  </p>
                )}
              </div>
            </div>
              {/* Add point button */}            <button
              onClick={() => {
                // If using function to calculate Y, use the store's method
                if (useFunctionForY && selectedFunction !== FunctionType.NONE) {
                  addPointWithFunction();
                  // Call the onGenerateSamples prop to update samples
                  onGenerateSamples();
                } else {
                  // Otherwise use the original method
                  onAddManualPoint();
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Point
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
