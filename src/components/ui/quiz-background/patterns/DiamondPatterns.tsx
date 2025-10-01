import React from 'react';

interface DiamondPatternsProps {
  animated: boolean;
}

export const DiamondPatterns: React.FC<DiamondPatternsProps> = ({ animated }) => {
  return (
    <>
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
    </>
  );
};
