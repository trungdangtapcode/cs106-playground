import type { ConfidenceData } from '../types';

interface PrepareDataProps {
  xs: number[];
  means: number[];
  marginalVariances: number[];
  noiseScale: number;
}

/**
 * Prepares confidence interval data from model outputs
 */
export const prepareConfidenceData = ({
  xs,
  means,
  marginalVariances,
  noiseScale
}: PrepareDataProps): ConfidenceData[] => {
  const sigma = marginalVariances.map(v => Math.sqrt(v + (noiseScale * noiseScale)));
  const confidence1Lower = means.map((mean, i) => mean - sigma[i]);
  const confidence1Upper = means.map((mean, i) => mean + sigma[i]);
  const confidence2Lower = means.map((mean, i) => mean - 2 * sigma[i]);
  const confidence2Upper = means.map((mean, i) => mean + 2 * sigma[i]);
  
  // Create data array for confidence bands
  return xs.map((x, i) => ({
    x,
    mean: means[i],
    lower1: confidence1Lower[i],
    upper1: confidence1Upper[i],
    lower2: confidence2Lower[i],
    upper2: confidence2Upper[i]
  }));
};
