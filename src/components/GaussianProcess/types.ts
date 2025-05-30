/**
 * Common types for Gaussian Process visualization
 */
import { Matrix } from 'ml-matrix';
import type { KernelFunction } from '../../lib/math/kernels';

export interface Point {
  x: number;
  y: number;
}

export interface GaussianProcess {
  mean: (xs: number[]) => number[];
  cov: (xs: number[]) => Matrix;
  kernel: KernelFunction;
}

export interface ConfidenceData {
  x: number;
  mean: number;
  lower1: number;
  upper1: number;
  lower2: number;
  upper2: number;
}

export interface SampleData {
  x: number;
  y: number;
}
