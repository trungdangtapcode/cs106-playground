import { create } from 'zustand';
import { Matrix } from 'ml-matrix';
import type { Point } from '../../components/GaussianProcess/types';

// Define available functions
export type FunctionType = 'none' | 'sine' | 'quadratic' | 'linear';

export const FunctionType = {
  NONE: 'none' as FunctionType,
  SINE: 'sine' as FunctionType,
  QUADRATIC: 'quadratic' as FunctionType,
  LINEAR: 'linear' as FunctionType
};

// Define function implementations
export const functions = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [FunctionType.NONE]: (x: number) => 0, // No function, manual Y input
  [FunctionType.SINE]: (x: number) => Math.sin(x),
  [FunctionType.QUADRATIC]: (x: number) => (x * x) / 100,
  [FunctionType.LINEAR]: (x: number) => x / 10
};

// Define the store state interface
interface GaussianProcessState {
  // Visualization parameters
  width: number;
  height: number;
  points: Point[];
  
  // GP parameters
  lengthscale: number;
  variance: number;
  noiseScale: number;
  sampleCount: number;
  
  // Animation state
  animating: boolean;
  animationSpeed: number;
  samples: Matrix | null;
  
  // User interaction
  errorMessage: string | null;
  manualX: string;
  manualY: string;
  
  // Function selection
  selectedFunction: FunctionType;
  useFunctionForY: boolean;
  
  // Actions
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setPoints: (points: Point[]) => void;
  addPoint: (point: Point) => void;
  updatePoint: (index: number, point: Point) => void;
  removePoint: (index: number) => void;
  clearPoints: () => void;
  
  setLengthscale: (value: number) => void;
  setVariance: (value: number) => void;
  setNoiseScale: (value: number) => void;
  setSampleCount: (value: number) => void;
  
  setAnimating: (value: boolean) => void;
  toggleAnimating: () => void;
  setAnimationSpeed: (value: number) => void;
  setSamples: (samples: Matrix | null) => void;
  
  setErrorMessage: (message: string | null) => void;
  setManualX: (value: string) => void;
  setManualY: (value: string) => void;
  
  setSelectedFunction: (functionType: FunctionType) => void;
  setUseFunctionForY: (value: boolean) => void;
  
  // Helper methods
  getYValueFromFunction: (x: number) => number;
  addPointWithFunction: () => void;
}

// Create the store
const useGaussianProcessStore = create<GaussianProcessState>((set, get) => ({
  // Visualization parameters
  width: 800,
  height: 400,
  points: [],
  
  // GP parameters
  lengthscale: 1.0,
  variance: 1.0,
  noiseScale: 0.1,
  sampleCount: 5,
  
  // Animation state
  animating: false,
  animationSpeed: 0.5,
  samples: null,
  
  // User interaction
  errorMessage: null,
  manualX: '5.0',
  manualY: '0.0',
  
  // Function selection
  selectedFunction: FunctionType.NONE,
  useFunctionForY: false,
  
  // Actions
  setWidth: (width) => set({ width }),
  setHeight: (height) => set({ height }),
  setPoints: (points) => set({ points }),
  addPoint: (point) => set((state) => ({ points: [...state.points, point] })),
  updatePoint: (index, point) => set((state) => {
    const newPoints = [...state.points];
    newPoints[index] = point;
    return { points: newPoints };
  }),
  removePoint: (index) => set((state) => {
    const newPoints = [...state.points];
    newPoints.splice(index, 1);
    return { points: newPoints };
  }),
  clearPoints: () => set({ points: [] }),
  
  setLengthscale: (lengthscale) => set({ lengthscale }),
  setVariance: (variance) => set({ variance }),
  setNoiseScale: (noiseScale) => set({ noiseScale }),
  setSampleCount: (sampleCount) => set({ sampleCount }),
  
  setAnimating: (animating) => set({ animating }),
  toggleAnimating: () => set((state) => ({ animating: !state.animating })),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  setSamples: (samples) => set({ samples }),
  
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setManualX: (manualX) => set({ manualX }),
  setManualY: (manualY) => set({ manualY }),
  
  setSelectedFunction: (selectedFunction) => set({ selectedFunction }),
  setUseFunctionForY: (useFunctionForY) => set({ useFunctionForY }),
  
  // Helper methods
  getYValueFromFunction: (x) => {
    const state = get();
    return functions[state.selectedFunction](x);
  },
  addPointWithFunction: () => {
    const state = get();
    try {
      const x = parseFloat(state.manualX);
      console.log('X is:', x);
      
      if (isNaN(x)) {
        state.setErrorMessage("Please enter a valid number for X coordinate");
        return;
      }
      
      if (x < 0 || x > 10) {
        state.setErrorMessage("X value must be between 0 and 10");
        return;
      }
      
      // Calculate Y from function if enabled, otherwise use manual Y
      let y: number;
      if (state.useFunctionForY && state.selectedFunction !== FunctionType.NONE) {
        y = state.getYValueFromFunction(x);
        console.log('auto y is:', y);
      } else {
        y = parseFloat(state.manualY);
        if (isNaN(y)) {
          state.setErrorMessage("Please enter a valid number for Y coordinate");
          return;
        }
      }
      
      state.addPoint({ x, y });
      console.log('state is:', state.points, { x, y })
      
      // Show success message
      state.setErrorMessage(`Successfully added point (${x.toFixed(2)}, ${y.toFixed(2)})`);
      setTimeout(() => {
        const currentMsg = get().errorMessage;
        if (currentMsg === `Successfully added point (${x.toFixed(2)}, ${y.toFixed(2)})`) {
          state.setErrorMessage(null);
        }
      }, 2000);
      
    } catch (err) {
      state.setErrorMessage("Error adding point: " + (err instanceof Error ? err.message : String(err)));
    }
  }
}));

export default useGaussianProcessStore;
