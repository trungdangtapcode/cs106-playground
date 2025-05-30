import { useEffect, useState } from 'react';
import * as m from 'ml-matrix';
import { randn, sampleMvn } from '../../lib/math/matrix';

interface GpAnimationProps {
  animating: boolean;
  means: number[];
  covSqrt: m.Matrix;
  sampleCount: number;
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
  onSamplesUpdate 
}) => {
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  // Generate initial samples
  useEffect(() => {
    // Generate new samples regardless of animation state 
    // when means, covSqrt or sampleCount changes
    const v = randn(covSqrt.columns, sampleCount);
    const newSamples = sampleMvn(means, covSqrt, v);
    onSamplesUpdate(newSamples);
  }, [means, covSqrt, sampleCount, onSamplesUpdate]);

  // Animation effect
  useEffect(() => {
    if (animating) {
      const v = randn(covSqrt.columns, sampleCount);
      const u = randn(covSqrt.columns, sampleCount);
      let frameCount = 0;
      const totalFrames = 60;
      
      const animate = () => {
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
        
        const id = requestAnimationFrame(animate);
        setAnimationFrameId(id);
      };
      
      const id = requestAnimationFrame(animate);
      setAnimationFrameId(id);
      
      return () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
    
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animating, covSqrt, means, sampleCount, onSamplesUpdate, animationFrameId]);

  // This component doesn't render anything
  return null;
};

export default GpAnimation;
