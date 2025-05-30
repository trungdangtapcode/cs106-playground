/**
 * Matrix operations for Gaussian Processes
 */

import * as m from 'ml-matrix';
import type { KernelFunction } from './kernels';

/**
 * Constructs a covariance matrix from kernel evaluations
 */
export const covMatrix = (kernel: KernelFunction, xs: number[]): m.Matrix => {
  const dim = xs.length;
  const kernelMatrix = new m.Matrix(dim, dim);
  for (let i = 0; i < dim; ++i) {
    for (let j = i; j < dim; ++j) {
      const k = kernel(xs[i], xs[j]);
      kernelMatrix.set(i, j, k);
      kernelMatrix.set(j, i, k);
    }
  }
  return kernelMatrix;
};

/**
 * Computes the matrix square root using SVD
 */
export const matrixSqrt = (A: m.Matrix): m.Matrix => {
  const svd = new m.SingularValueDecomposition(A);
  const u = svd.leftSingularVectors;
  const s = svd.diagonal;
  const sqrt_s = s.map(Math.sqrt);
  const sqrt_s_mat = m.Matrix.zeros(A.rows, A.columns);
  const min_dim = Math.min(A.rows, A.columns);
  for (let i = 0; i < min_dim; ++i) {
    sqrt_s_mat.set(i, i, sqrt_s[i]);
  }
  return u.mmul(sqrt_s_mat);
};

/**
 * Generates random normal values as a matrix
 */
export const randn = (rows: number, cols: number): m.Matrix => {
  const v = m.Matrix.zeros(rows, cols);
  
  for (let j = 0; j < cols; ++j) {
    for (let i = 0; i < rows; ++i) {
      // Using a simple Box-Muller transform for gaussian random numbers
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      v.set(i, j, z);
    }
  }
  
  return v;
};

/**
 * Sample from multivariate normal distribution with given mean vector and covariance matrix square root
 */
export const sampleMvn = (meanVec: number[], covSqrt: m.Matrix, v: m.Matrix): m.Matrix => {
  // Returns samples from a multivariate normal distribution N(meanVec, covSqrt covSqrtᵀ)
  // v is a Matrix in which each column vector is ~ N(0, I)
  if (!v || covSqrt.columns !== v.rows) {
    return m.Matrix.zeros(meanVec.length, 1);
  }
  
  const Lv = covSqrt.mmul(v);
  const result = Lv.clone();
  
  for (let i = 0; i < result.rows; i++) {
    for (let j = 0; j < result.columns; j++) {
      result.set(i, j, result.get(i, j) + meanVec[i]);
    }
  }
  
  return result;
};
