import React from 'react';

export const WavePatterns: React.FC = () => {
  return (
    <>
      {/* Wave gradients */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cyan-200/20 via-cyan-100/10 to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-purple-200/20 via-purple-100/10 to-transparent"></div>
      <div className="absolute top-1/2 left-0 right-0 h-16 bg-gradient-to-r from-transparent via-blue-100/15 to-transparent"></div>
    </>
  );
};
