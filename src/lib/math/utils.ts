/**
 * Basic mathematical utility functions
 */

/**
 * Creates a linearly spaced array between start and stop with num points
 */
export const linspace = (start: number, stop: number, num: number, endpoint = true): number[] => {
  const div = endpoint ? num - 1 : num;
  const step = (stop - start) / div;
  return Array.from({ length: num }, (_, i) => start + step * i);
};

/**
 * Returns a function that evaluates the Gaussian PDF at a given point
 */
export const gaussianPdf = (mean: number, variance: number): ((y: number) => number) => {
  return (y: number) =>
    Math.exp(-Math.pow(y - mean, 2) / (2 * variance)) /
    Math.sqrt(2 * Math.PI * variance);
};
