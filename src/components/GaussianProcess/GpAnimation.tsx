import { useEffect, useRef } from 'react';
import * as m from 'ml-matrix';
import { randn, sampleMvn } from '../../lib/math/matrix';

interface GpAnimationProps {
  animating: boolean;
  means: number[];
  covSqrt: m.Matrix;
  sampleCount: number;
  animationSpeed: number; // Added animation speed parameter
  onSamplesUpdate: (samples: m.Matrix) => void;
}

/**
 * Component to handle the GP sample animation
 */
const GpAnimation: React.FC<GpAnimationProps> = ({ 
  animating, 
  means, 
  covSqrt, 
  sampleCount,
  animationSpeed,
  onSamplesUpdate 
}) => {
  // Use refs instead of state to avoid re-renders
  const animationFrameId = useRef<number | null>(null);
  const initialRenderRef = useRef<boolean>(true);
  const lastMeansString = useRef<string>('');
  const lastCovSqrtDimensions = useRef<string>('');
  const lastSampleCount = useRef<number>(sampleCount);
  
  // Ref to track last frame time for timing control
  const lastFrameTimeRef = useRef<number>(0);
  
  // Generate initial samples without causing infinite loops
  useEffect(() => {
    // Track if we need to regenerate samples to avoid infinite loops
    const meansString = JSON.stringify(means);
    const covSqrtDimensions = `${covSqrt.rows}x${covSqrt.columns}`;
    
    // Only generate new samples if it's the first render or if key props changed
    if (
      initialRenderRef.current || 
      meansString !== lastMeansString.current ||
      covSqrtDimensions !== lastCovSqrtDimensions.current ||
      sampleCount !== lastSampleCount.current
    ) {
      const v = randn(covSqrt.columns, sampleCount);
      const newSamples = sampleMvn(means, covSqrt, v);
      onSamplesUpdate(newSamples);
      
      // Update refs to track changes
      lastMeansString.current = meansString;
      lastCovSqrtDimensions.current = covSqrtDimensions;
      lastSampleCount.current = sampleCount;
      initialRenderRef.current = false;
    }
  }, [means, covSqrt, sampleCount, onSamplesUpdate]); 
  
  // Animation effect
  useEffect(() => {
    if (animating) {
      const v = randn(covSqrt.columns, sampleCount);
      const u = randn(covSqrt.columns, sampleCount);
      let frameCount = 0;      // Animation speed affects how many frames we use to complete a full cycle
      // Higher speed = fewer frames = faster animation
      // For very low speeds, we need to set a reasonable maximum number of frames
      // to prevent division by small numbers creating extremely fast animations
      const baseFrameCount = 120;
      const totalFrames = animationSpeed < 0.1 
        ? Math.round(baseFrameCount * 10) // Cap at 10x slower than normal
        : Math.round(baseFrameCount / animationSpeed);      // We'll calculate the frame delay directly in the animation function
        const animate = (timestamp: number) => {
        // For very slow animations, throttle the frame rate using timestamp
        if (animationSpeed < 0.3) {
          const minFrameTime = Math.round(300 * (1/animationSpeed)); // Longer time between frames for slower speeds
          if (timestamp - lastFrameTimeRef.current < minFrameTime) {
            animationFrameId.current = requestAnimationFrame(animate);
            return; // Skip this frame
          }
          lastFrameTimeRef.current = timestamp;
        }
        
        if (frameCount >= totalFrames) {
          frameCount = 0;
          const newV = randn(covSqrt.columns, sampleCount);
          const newSamples = sampleMvn(means, covSqrt, newV);
          onSamplesUpdate(newSamples);
        } else {
          // Interpolate between samples for smooth animation
          const theta = (frameCount / totalFrames) * 2 * Math.PI;
          const cosTheta = Math.cos(theta);
          const sinTheta = Math.sin(theta);
          
          // Create an interpolated v
          const interpolatedV = v.clone();
          for (let i = 0; i < v.rows; i++) {
            for (let j = 0; j < v.columns; j++) {
              const val = v.get(i, j) * cosTheta + u.get(i, j) * sinTheta;
              interpolatedV.set(i, j, val);
            }
          }
          
          const newSamples = sampleMvn(means, covSqrt, interpolatedV);
          onSamplesUpdate(newSamples);
          frameCount++;
        }
        
        animationFrameId.current = requestAnimationFrame(animate);
      };
      
      animationFrameId.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      };
    }
    
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [animating, covSqrt, means, sampleCount, onSamplesUpdate, animationSpeed]);

  // This component doesn't render anything
  return null;
};

export default GpAnimation;
