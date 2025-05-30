/**
 * Disagreement calculation utilities for Gaussian Processes
 * 
 * These functions help quantify the disagreement/uncertainty between multiple model predictions
 * at specific input points.
 */
import { Matrix } from 'ml-matrix';

/**
 * Calculate disagreement between multiple model predictions at a specific point.
 * 
 * Disagreement is measured as the variance of predictions across models:
 * Disagreement(x*) = (1/k) * Σ [fᵢ'(x*) - mean(x*)]²
 * 
 * @param predictions Array of predictions from k models at a specific point x*
 * @returns The disagreement value (variance of predictions)
 */
export const calculateDisagreement = (predictions: number[]): number => {
  if (!predictions || predictions.length === 0) {
    return 0;
  }
  
  // Calculate the mean prediction
  const mean = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
  
  // Calculate the variance (average squared deviation from mean)
  const variance = predictions.reduce((sum, pred) => {
    const diff = pred - mean;
    return sum + (diff * diff);
  }, 0) / predictions.length;
  
  return variance;
};

/**
 * Calculate standard deviation form of disagreement between multiple model predictions.
 * 
 * StdDisagreement(x*) = sqrt( (1/k) * Σ [fᵢ'(x*) - mean(x*)]² )
 * 
 * This gives a value on the same scale as the predictions.
 * 
 * @param predictions Array of predictions from k models at a specific point x*
 * @returns The standard deviation of predictions
 */
export const calculateStdDisagreement = (predictions: number[]): number => {
  return Math.sqrt(calculateDisagreement(predictions));
};

/**
 * Calculate disagreement across multiple sample points.
 * 
 * @param samplesMatrix Matrix where each column is a sample function and each row is a point x
 * @returns Array of disagreement values for each point
 */
export const calculateDisagreementFromSamples = (samplesMatrix: Matrix): number[] => {
  if (!samplesMatrix || samplesMatrix.rows === 0 || samplesMatrix.columns === 0) {
    return [];
  }
  
  const disagreements: number[] = [];
  
  // For each point (row), calculate disagreement across all samples (columns)
  for (let i = 0; i < samplesMatrix.rows; i++) {
    const predictions: number[] = [];
    
    // Collect predictions from all models at this point
    for (let j = 0; j < samplesMatrix.columns; j++) {
      predictions.push(samplesMatrix.get(i, j));
    }
    
    // Calculate disagreement for this point
    disagreements.push(calculateDisagreement(predictions));
  }
  
  return disagreements;
};

/**
 * Calculate standard deviation form of disagreement across multiple sample points.
 * 
 * @param samplesMatrix Matrix where each column is a sample function and each row is a point x
 * @returns Array of standard deviation disagreement values for each point
 */
export const calculateStdDisagreementFromSamples = (samplesMatrix: Matrix): number[] => {
  if (!samplesMatrix || samplesMatrix.rows === 0 || samplesMatrix.columns === 0) {
    return [];
  }
  
  const stdDisagreements: number[] = [];
  
  // For each point (row), calculate standard deviation disagreement across all samples (columns)
  for (let i = 0; i < samplesMatrix.rows; i++) {
    const predictions: number[] = [];
    
    // Collect predictions from all models at this point
    for (let j = 0; j < samplesMatrix.columns; j++) {
      predictions.push(samplesMatrix.get(i, j));
    }
    
    // Calculate standard deviation disagreement for this point
    stdDisagreements.push(calculateStdDisagreement(predictions));
  }
  
  return stdDisagreements;
};

/**
 * Calculate Max Disagreement - finds the point with maximum disagreement across models
 * 
 * @param xs Array of x values corresponding to rows in the samplesMatrix
 * @param samplesMatrix Matrix where each column is a sample function and each row is a point x
 * @returns The x value and disagreement value at the point of maximum disagreement
 */
export const findMaxDisagreementPoint = (
  xs: number[], 
  samplesMatrix: Matrix
): { x: number, disagreement: number } => {
  if (!xs || !samplesMatrix || xs.length === 0 || samplesMatrix.rows === 0) {
    return { x: 0, disagreement: 0 };
  }
  
  // Calculate disagreement at each point
  const disagreements = calculateDisagreementFromSamples(samplesMatrix);
  
  // Find the index of maximum disagreement
  let maxIndex = 0;
  let maxValue = disagreements[0];
  
  for (let i = 1; i < disagreements.length; i++) {
    if (disagreements[i] > maxValue) {
      maxValue = disagreements[i];
      maxIndex = i;
    }
  }
  
  // Return the x value and disagreement at that point
  return {
    x: xs[maxIndex],
    disagreement: maxValue
  };
};
