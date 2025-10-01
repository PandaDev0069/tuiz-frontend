import React from 'react';

interface TrianglePatternsProps {
  animated: boolean;
}

export const TrianglePatterns: React.FC<TrianglePatternsProps> = ({ animated }) => {
  return (
    <>
      <div
        className={`absolute top-1/2 right-10 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-cyan-300/25 ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '3s' } : {}}
      ></div>
      <div
        className={`absolute bottom-10 right-1/3 w-0 h-0 border-l-6 border-r-6 border-b-10 border-l-transparent border-r-transparent border-b-purple-300/25 ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '1.8s' } : {}}
      ></div>
      <div
        className={`absolute top-1/4 left-1/2 w-0 h-0 border-l-5 border-r-5 border-b-8 border-l-transparent border-r-transparent border-b-emerald-300/25 ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '4.5s' } : {}}
      ></div>
      <div
        className={`absolute bottom-1/4 left-1/3 w-0 h-0 border-l-7 border-r-7 border-b-11 border-l-transparent border-r-transparent border-b-orange-300/25 ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '2.7s' } : {}}
      ></div>
    </>
  );
};
