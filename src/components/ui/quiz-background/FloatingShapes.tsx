import React from 'react';

interface FloatingShapesProps {
  animated: boolean;
}

export const FloatingShapes: React.FC<FloatingShapesProps> = ({ animated }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Large circles */}
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

      {/* Medium circles */}
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

      {/* Small circles */}
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
    </div>
  );
};
