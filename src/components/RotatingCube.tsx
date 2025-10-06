import { useState, memo } from 'react';
import { StickyNote, FileText, Edit, Bookmark, Star, Heart } from 'lucide-react';

interface RotatingCubeProps {
  size?: number;
  className?: string;
}

const RotatingCube = memo(({ size = 32, className = '' }: RotatingCubeProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        perspective: '200px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main rotating cube container */}
      <div 
        className={`
          relative w-full h-full transform-gpu transition-transform duration-1000 ease-in-out
          ${isHovered ? 'scale-110' : 'scale-100'}
        `}
        style={{
          transformStyle: 'preserve-3d',
          animation: 'rotateCube 8s linear infinite'
        }}
      >
        {/* Front Face */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-lg border border-blue-300/30 shadow-lg backdrop-blur-sm"
          style={{
            transform: `translateZ(${size/2}px)`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <StickyNote className={`text-white drop-shadow-sm`} size={size * 0.4} />
            {/* Geometric patterns */}
            <div className="absolute top-1 left-1 w-1 h-1 bg-white/30 rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/20 rounded-full"></div>
            <div className="absolute top-1 right-1 w-0.5 h-3 bg-white/10 rounded-full transform rotate-45"></div>
          </div>
        </div>

        {/* Back Face */}
        <div 
          className="absolute inset-0 bg-gradient-to-bl from-purple-500 via-purple-600 to-pink-600 rounded-lg border border-purple-300/30 shadow-lg"
          style={{
            transform: `rotateY(180deg) translateZ(${size/2}px)`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <FileText className="text-white drop-shadow-sm" size={size * 0.4} />
            {/* Complex geometric structure */}
            <div className="absolute inset-0">
              <div className="absolute top-2 left-2 w-1.5 h-1.5 border border-white/20 rounded transform rotate-12"></div>
              <div className="absolute bottom-2 right-2 w-1 h-1 bg-white/25 transform skew-x-12"></div>
            </div>
          </div>
        </div>

        {/* Right Face */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-green-500 via-emerald-600 to-teal-600 rounded-lg border border-green-300/30 shadow-lg"
          style={{
            transform: `rotateY(90deg) translateZ(${size/2}px)`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <Edit className="text-white drop-shadow-sm" size={size * 0.4} />
            {/* Intricate patterns */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
            <div className="absolute top-1.5 right-1.5 w-2 h-0.5 bg-white/10 transform -rotate-45"></div>
          </div>
        </div>

        {/* Left Face */}
        <div 
          className="absolute inset-0 bg-gradient-to-tl from-orange-500 via-red-500 to-rose-600 rounded-lg border border-orange-300/30 shadow-lg"
          style={{
            transform: `rotateY(-90deg) translateZ(${size/2}px)`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <Bookmark className="text-white drop-shadow-sm" size={size * 0.4} />
            {/* Complex structural elements */}
            <div className="absolute inset-1 border border-white/10 rounded transform rotate-3"></div>
            <div className="absolute top-1 left-1 bottom-1 w-0.5 bg-white/15"></div>
            <div className="absolute top-1 right-1 bottom-1 w-0.5 bg-white/10"></div>
          </div>
        </div>

        {/* Top Face */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-yellow-400 via-amber-500 to-orange-600 rounded-lg border border-yellow-300/30 shadow-lg"
          style={{
            transform: `rotateX(90deg) translateZ(${size/2}px)`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <Star className="text-white drop-shadow-sm" size={size * 0.4} />
            {/* Detailed top structure */}
            <div className="absolute inset-0">
              <div className="absolute top-1 left-1 right-1 h-0.5 bg-white/20 rounded"></div>
              <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-white/15 rounded"></div>
              <div className="absolute left-1 top-1 bottom-1 w-0.5 bg-white/10 rounded"></div>
              <div className="absolute right-1 top-1 bottom-1 w-0.5 bg-white/10 rounded"></div>
              {/* Corner elements */}
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/25 rounded-full"></div>
              <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-white/15 rounded-full"></div>
              <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-white/15 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Bottom Face */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-indigo-600 via-blue-700 to-purple-700 rounded-lg border border-indigo-300/30 shadow-lg"
          style={{
            transform: `rotateX(-90deg) translateZ(${size/2}px)`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <Heart className="text-white drop-shadow-sm" size={size * 0.4} />
            {/* Bottom structural details */}
            <div className="absolute inset-0.5 border border-dashed border-white/10 rounded"></div>
            <div className="absolute top-2 left-2 w-1.5 h-0.5 bg-white/20 transform rotate-45"></div>
            <div className="absolute bottom-2 right-2 w-1.5 h-0.5 bg-white/15 transform -rotate-45"></div>
            <div className="absolute top-2 right-2 w-0.5 h-1.5 bg-white/10 transform rotate-12"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-1.5 bg-white/10 transform -rotate-12"></div>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-blue-400/60 rounded-full"
            style={{
              top: `${20 + i * 10}%`,
              left: `${15 + i * 12}%`,
              animation: `float${i % 3} ${3 + i * 0.5}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      {/* Enhanced glow effect on hover */}
      {isHovered && (
        <div 
          className="absolute inset-0 bg-gradient-radial from-blue-400/20 via-purple-400/10 to-transparent rounded-lg animate-pulse"
          style={{
            transform: 'scale(1.5)',
            filter: 'blur(8px)'
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes rotateCube {
            0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
            25% { transform: rotateX(90deg) rotateY(90deg) rotateZ(0deg); }
            50% { transform: rotateX(180deg) rotateY(180deg) rotateZ(90deg); }
            75% { transform: rotateX(270deg) rotateY(270deg) rotateZ(180deg); }
            100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
          }

          @keyframes float0 {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-8px) rotate(180deg); opacity: 1; }
          }

          @keyframes float1 {
            0%, 100% { transform: translateY(0px) rotate(120deg); opacity: 0.4; }
            50% { transform: translateY(-12px) rotate(240deg); opacity: 0.8; }
          }

          @keyframes float2 {
            0%, 100% { transform: translateY(0px) rotate(240deg); opacity: 0.5; }
            50% { transform: translateY(-6px) rotate(360deg); opacity: 0.9; }
          }

          .bg-gradient-radial {
            background: radial-gradient(circle at center, var(--tw-gradient-stops));
          }
        `
      }} />
    </div>
  );
});

RotatingCube.displayName = 'RotatingCube';

export default RotatingCube;
