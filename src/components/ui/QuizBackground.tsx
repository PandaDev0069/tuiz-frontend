'use client';

import React from 'react';

interface QuizBackgroundProps {
  className?: string;
  variant?: 'default' | 'question' | 'answer' | 'leaderboard';
  animated?: boolean;
}

export const QuizBackground: React.FC<QuizBackgroundProps> = ({
  className = '',
  variant = 'default',
  animated = true,
}) => {
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'question':
        return 'bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400';
      case 'answer':
        return 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400';
      case 'leaderboard':
        return 'bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400';
      default:
        return 'bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400';
    }
  };

  return (
    <div className={`absolute inset-0 ${getBackgroundStyle()} ${className}`}>
      {/* Floating shapes - conditionally animated */}
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

      {/* Geometric patterns */}
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

      {/* Wave patterns */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cyan-200/20 via-cyan-100/10 to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-purple-200/20 via-purple-100/10 to-transparent"></div>
      <div className="absolute top-1/2 left-0 right-0 h-16 bg-gradient-to-r from-transparent via-blue-100/15 to-transparent"></div>

      {/* Hexagonal grid pattern */}
      <div className="absolute inset-0 opacity-15">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px),
              radial-gradient(circle at 50% 50%, #06b6d4 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 60px 60px, 80px 80px',
            backgroundPosition: '0 0, 20px 20px, 10px 10px',
          }}
        ></div>
      </div>

      {/* Dotted pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '15px 15px',
          }}
        ></div>
      </div>

      {/* Additional floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating lines */}
        <div
          className={`absolute top-1/4 left-1/6 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent transform rotate-12 ${animated ? 'animate-pulse' : ''}`}
          style={animated ? { animationDelay: '5s' } : {}}
        ></div>
        <div
          className={`absolute bottom-1/3 right-1/4 w-24 h-1 bg-gradient-to-r from-transparent via-purple-300/40 to-transparent transform -rotate-12 ${animated ? 'animate-pulse' : ''}`}
          style={animated ? { animationDelay: '3.5s' } : {}}
        ></div>
        <div
          className={`absolute top-2/3 left-1/3 w-20 h-1 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent transform rotate-45 ${animated ? 'animate-pulse' : ''}`}
          style={animated ? { animationDelay: '4.2s' } : {}}
        ></div>

        {/* Floating dots */}
        <div
          className={`absolute top-1/5 right-1/3 w-2 h-2 bg-cyan-400/50 rounded-full ${animated ? 'animate-bounce' : ''}`}
          style={animated ? { animationDelay: '6s' } : {}}
        ></div>
        <div
          className={`absolute bottom-1/5 left-1/4 w-3 h-3 bg-purple-400/50 rounded-full ${animated ? 'animate-bounce' : ''}`}
          style={animated ? { animationDelay: '2.3s' } : {}}
        ></div>
        <div
          className={`absolute top-3/5 right-1/5 w-1 h-1 bg-emerald-400/50 rounded-full ${animated ? 'animate-bounce' : ''}`}
          style={animated ? { animationDelay: '5.5s' } : {}}
        ></div>
      </div>
    </div>
  );
};
