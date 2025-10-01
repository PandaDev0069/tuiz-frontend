import React from 'react';

interface BackgroundOverlaysProps {
  animated: boolean;
}

export const BackgroundOverlays: React.FC<BackgroundOverlaysProps> = ({ animated }) => {
  return (
    <>
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
    </>
  );
};
