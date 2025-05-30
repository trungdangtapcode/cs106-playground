/**
 * Gaussian Process models - prior and posterior
 */

import * as m from 'ml-matrix';
import type { KernelFunction } from '../math/kernels';
import { covMatrix } from '../math/matrix';
import type { GaussianProcess } from '../../components/GaussianProcess/types';

/**
 * Create a GP prior with zero mean function and specified kernel
 */
export const prior = (kernel: KernelFunction): GaussianProcess => {
  const mean = (xs: number[]) => xs.map(() => 0.0);
  
  const cov = (xs: number[]) => covMatrix(kernel, xs);
  
  return { mean, cov, kernel };
};

/**
 * Create a GP posterior conditioned on observations
 */
export const posterior = (
  kernel: KernelFunction, 
  X: number[], 
  Y: number[], 
  noiseVariance = 0.0
): GaussianProcess => {
  const covYf = (xs: number[]) => {
    const kyf = m.Matrix.zeros(X.length, xs.length);
    for (let i = 0; i < X.length; ++i) {
      for (let j = 0; j < xs.length; ++j) {
        kyf.set(i, j, kernel(X[i], xs[j]));
      }
    }
    return kyf;
  };

  const noiseVarianceMatrix = m.Matrix.eye(X.length, X.length, noiseVariance);
  const kyy = covMatrix(kernel, X).add(noiseVarianceMatrix);
  // Using direct solver instead of m.Matrix.solve
  const Y_vector = m.Matrix.columnVector(Y);
  const kyyinv_Y = new m.SingularValueDecomposition(kyy).solve(Y_vector);

  const mean = (xs: number[]) => {
    const kyf = covYf(xs);
    return kyf.transpose().mmul(kyyinv_Y).to1DArray();
  };

  const cov = (xs: number[]) => {
    const kff = covMatrix(kernel, xs);
    const kyf = covYf(xs);
    // Using direct solver instead of m.Matrix.solve
    const kyyinv_kyf = new m.SingularValueDecomposition(kyy).solve(kyf);
    const kfy_kyyinv_kyf = kyf.transpose().mmul(kyyinv_kyf);
    return kff.subtract(kfy_kyyinv_kyf);
  };

  return { 
    mean, 
    cov, 
    kernel: (x1: number, x2: number) => cov([x1, x2]).get(1, 0) 
  };
};
