import React from 'react';

interface SmallCirclesProps {
  animated: boolean;
}

export const SmallCircles: React.FC<SmallCirclesProps> = ({ animated }) => {
  return (
    <>
      <div
        className={`absolute top-1/6 right-1/4 w-8 h-8 bg-gradient-to-br from-cyan-300/60 to-blue-400/60 rounded-full ${animated ? 'animate-bounce' : ''}`}
        style={animated ? { animationDelay: '0.8s' } : {}}
      ></div>
      <div
        className={`absolute bottom-1/4 left-1/6 w-12 h-12 bg-gradient-to-br from-purple-300/60 to-indigo-400/60 rounded-full ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '2.2s' } : {}}
      ></div>
      <div
        className={`absolute top-3/4 left-1/2 w-6 h-6 bg-gradient-to-br from-emerald-300/60 to-teal-400/60 rounded-full ${animated ? 'animate-bounce' : ''}`}
        style={animated ? { animationDelay: '1.2s' } : {}}
      ></div>
      <div
        className={`absolute top-1/4 left-1/4 w-10 h-10 bg-gradient-to-br from-orange-300/55 to-red-400/55 rounded-full ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '3.2s' } : {}}
      ></div>
      <div
        className={`absolute bottom-1/6 right-1/6 w-7 h-7 bg-gradient-to-br from-pink-300/55 to-rose-400/55 rounded-full ${animated ? 'animate-bounce' : ''}`}
        style={animated ? { animationDelay: '2.8s' } : {}}
      ></div>
      <div
        className={`absolute top-2/3 left-1/5 w-9 h-9 bg-gradient-to-br from-indigo-300/55 to-violet-400/55 rounded-full ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '4.2s' } : {}}
      ></div>
    </>
  );
};
