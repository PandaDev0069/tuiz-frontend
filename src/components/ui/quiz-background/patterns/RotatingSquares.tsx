import React from 'react';

interface RotatingSquaresProps {
  animated: boolean;
}

export const RotatingSquares: React.FC<RotatingSquaresProps> = ({ animated }) => {
  return (
    <>
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
    </>
  );
};
