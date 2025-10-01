import React from 'react';

interface MediumCirclesProps {
  animated: boolean;
}

export const MediumCircles: React.FC<MediumCirclesProps> = ({ animated }) => {
  return (
    <>
      <div
        className={`absolute top-1/3 left-1/3 w-16 h-16 bg-gradient-to-br from-blue-200/55 to-indigo-300/55 rounded-full ${animated ? 'animate-bounce' : ''}`}
        style={animated ? { animationDelay: '0.5s' } : {}}
      ></div>
      <div
        className={`absolute top-2/3 right-1/3 w-20 h-20 bg-gradient-to-br from-rose-200/55 to-pink-300/55 rounded-full ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '1.5s' } : {}}
      ></div>
      <div
        className={`absolute top-1/6 left-1/2 w-18 h-18 bg-gradient-to-br from-amber-200/50 to-yellow-300/50 rounded-full ${animated ? 'animate-bounce' : ''}`}
        style={animated ? { animationDelay: '4s' } : {}}
      ></div>
      <div
        className={`absolute bottom-1/3 right-1/4 w-14 h-14 bg-gradient-to-br from-lime-200/50 to-green-300/50 rounded-full ${animated ? 'animate-pulse' : ''}`}
        style={animated ? { animationDelay: '1.8s' } : {}}
      ></div>
    </>
  );
};
