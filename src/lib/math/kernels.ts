/**
 * Kernel functions for Gaussian Processes
 */

export type KernelFunction = (x1: number, x2: number) => number;

/**
 * Squared exponential (RBF) kernel
 */
export const sqExpKernel = (variance = 1, lengthscale = 1): KernelFunction => {
  const twosqlength = 2 * lengthscale * lengthscale;
  return (x1: number, x2: number) => {
    const sqdist = Math.pow(x1 - x2, 2);
    return variance * Math.exp(-sqdist / twosqlength);
  };
};

/**
 * Linear kernel
 */
export const linearKernel = (variance = 1, bias = 0): KernelFunction => {
  return (x1: number, x2: number) => {
    return variance * (x1 * x2) + bias;
  };
};

/**
 * Periodic kernel
 */
export const periodicKernel = (variance = 1, lengthscale = 1, period = 1): KernelFunction => {
  return (x1: number, x2: number) => {
    const sinComponent = Math.sin(Math.PI * Math.abs(x1 - x2) / period);
    return variance * Math.exp(-2 * sinComponent * sinComponent / (lengthscale * lengthscale));
  };
};

/**
 * Matern 3/2 kernel
 */
export const matern32Kernel = (variance = 1, lengthscale = 1): KernelFunction => {
  return (x1: number, x2: number) => {
    const scaledDist = (Math.sqrt(3) * Math.abs(x1 - x2)) / lengthscale;
    return variance * (1 + scaledDist) * Math.exp(-scaledDist);
  };
};

/**
 * Add jitter to any kernel to improve numerical stability
 */
export const withJitter = (kernel: KernelFunction, jitter = 1e-6): KernelFunction => {
  return (x1: number, x2: number) => {
    return kernel(x1, x2) + (x1 === x2 ? jitter : 0);
  };
};
