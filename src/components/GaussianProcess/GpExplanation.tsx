import React from 'react';

/**
 * Component for explaining Gaussian Process concepts
 */
const GpExplanation: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">About Gaussian Processes</h2>
      
      <p className="text-gray-700">
        A Gaussian process (GP) is a collection of random variables, any finite number of which have a joint Gaussian distribution.
        GPs are specified by a mean function and a covariance function (kernel), which defines the smoothness properties of the functions we're modeling.
      </p>
      
      <p className="mt-2 text-gray-700">
        In this visualization, we're using a squared exponential kernel with adjustable lengthscale and variance parameters.
        The lengthscale controls how quickly the function can vary, and the variance controls the amplitude of the function.
      </p>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Key Parameters:</h3>
        <ul className="list-disc pl-6 text-gray-700">
          <li><strong>Lengthscale:</strong> Controls how quickly the function changes. Smaller values allow for more rapid variation.</li>
          <li><strong>Variance:</strong> Controls the overall amplitude of the function. Larger values increase the magnitude of the samples.</li>
          <li><strong>Noise:</strong> Represents observation uncertainty. Increasing this expands the confidence intervals.</li>
        </ul>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">How to Use:</h3>
        <ul className="list-disc pl-6 text-gray-700">          <li><strong>Click on the plot</strong> to add observations (data points).</li>
          <li>The <strong>confidence bands</strong> represent the uncertainty (1 and 2 standard deviations).</li>
          <li>The <strong>dashed line</strong> represents the mean prediction.</li>
          <li>The <strong>colored lines</strong> are random samples from the posterior distribution.</li>
          <li>Adjust sliders to change characteristics of the Gaussian process.</li>
          <li>When animation is active, use the <strong>Animation Speed</strong> slider to control how fast samples change.</li>
        </ul>
      </div>
    </div>
  );
};

export default GpExplanation;
