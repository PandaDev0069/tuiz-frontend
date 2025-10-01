import React from 'react';

interface GeometricPatternsProps {
  animated: boolean;
}

export const GeometricPatterns: React.FC<GeometricPatternsProps> = ({ animated }) => {
  return (
    <div className="absolute inset-0 opacity-20">
      {/* Rotating squares */}
      <div
        className={`absolute top-10 left-10 w-8 h-8 bg-gradient-to-br from-cyan-300/25 to-blue-400/25 transform rotate-45 ${animated ? 'animate-spin' : ''}`}
        style={animated ? { animationDuration: '20s' } : {}}
      ></div>
      <div
        className={`absolute top-20 right-20 w-6 h-6 bg-gradient-to-br from-purple-300/25 to-pink-400/25 transform rotate-45 ${animated ? 'animate-spin' : ''}`}
        style={animated ? { animationDuration: '15s', animationDirection: 'reverse' } : {}}
      ></div>
      <div
        className={`absolute bottom-20 left-1/3 w-10 h-10 bg-gradient-to-br from-emerald-300/25 to-teal-400/25 transform rotate-45 ${animated ? 'animate-spin' : ''}`}
        style={animated ? { animationDuration: '25s' } : {}}
      ></div>
      <div
        className={`absolute top-1/2 left-1/4 w-7 h-7 bg-gradient-to-br from-orange-300/25 to-red-400/25 transform rotate-45 ${animated ? 'animate-spin' : ''}`}
        style={animated ? { animationDuration: '18s', animationDirection: 'reverse' } : {}}
      ></div>
      <div
        className={`absolute bottom-1/3 right-1/5 w-9 h-9 bg-gradient-to-br from-violet-300/25 to-purple-400/25 transform rotate-45 ${animated ? 'animate-spin' : ''}`}
        style={animated ? { animationDuration: '22s' } : {}}
      ></div>

      {/* Triangle patterns */}
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

      {/* Diamond patterns */}
      <div
        className={`absolute top-1/3 right-1/4 w-6 h-6 bg-gradient-to-br from-rose-300/30 to-pink-400/30 transform rotate-45 ${animated ? 'animate-bounce' : ''}`}
        style={animated ? { animationDelay: '3.8s' } : {}}
      ></div>
      <div
        className={`absolute bottom-1/2 left-1/5 w-8 h-8 bg-gradient-to-br from-amber-300/30 to-yellow-400/30 transform rotate-45 ${animated ? 'animate-bounce' : ''}`}
        style={animated ? { animationDelay: '1.3s' } : {}}
      ></div>
      <div
        className={`absolute top-2/3 right-1/6 w-5 h-5 bg-gradient-to-br from-lime-300/30 to-green-400/30 transform rotate-45 ${animated ? 'animate-bounce' : ''}`}
        style={animated ? { animationDelay: '4.8s' } : {}}
      ></div>
    </div>
  );
};
