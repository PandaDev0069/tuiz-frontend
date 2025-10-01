import React from 'react';

interface LargeCirclesProps {
  animated: boolean;
}

export const LargeCircles: React.FC<LargeCirclesProps> = ({ animated }) => {
  return (
    <>
      <div
        className={`absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-cyan-200/50 to-blue-300/50 rounded-full ${animated ? 'animate-pulse' : ''}`}
      ></div>
      <div
        className={`absolute top-1/4 -right-16 w-32 h-32 bg-gradient-to-br from-purple-200/50 to-pink-300/50 rounded-full ${animated ? 'animate-bounce' : ''}`}
        style={animated ? { animationDelay: '1s' } : {}}
      ></div>
      <div
        className={`absolute -bottom-16 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200/50 to-teal-300/50 rounded-full ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '2s' } : {}}
      ></div>
      <div
        className={`absolute top-1/2 -left-10 w-36 h-36 bg-gradient-to-br from-rose-200/45 to-orange-300/45 rounded-full ${animated ? 'animate-bounce' : ''}`}
        style={animated ? { animationDelay: '2.5s' } : {}}
      ></div>
      <div
        className={`absolute -top-10 right-1/3 w-28 h-28 bg-gradient-to-br from-violet-200/45 to-purple-300/45 rounded-full ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '3.5s' } : {}}
      ></div>
    </>
  );
};
