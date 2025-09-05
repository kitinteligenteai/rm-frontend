// src/components/common/LoadingSkeleton.jsx
import React from 'react';

const LoadingSkeleton = () => (
  <div className="w-full h-full p-8 animate-pulse">
    <div className="h-8 bg-neutral-200 rounded-lg w-1/3 mb-6"></div>
    <div className="space-y-4">
      <div className="h-4 bg-neutral-200 rounded-lg w-full"></div>
      <div className="h-4 bg-neutral-200 rounded-lg w-5/6"></div>
      <div className="h-4 bg-neutral-200 rounded-lg w-3/4"></div>
    </div>
  </div>
);

export default LoadingSkeleton;
