import { useEffect, useState } from 'react';

interface Bat {
  id: number;
  startX: number;
  startY: number;
  delay: number;
  duration: number;
  size: number;
  path: string;
}

const BatsSwarm = () => {
  const [bats, setBats] = useState<Bat[]>([]);

  useEffect(() => {
    // Generate bats that fly out from haunted houses
    const housePositions = [
      { x: 8, y: 45 },   // Left house
      { x: 35, y: 38 },  // Center mansion
      { x: 75, y: 44 },  // Right house
    ];

    const generatedBats: Bat[] = [];
    let batId = 0;

    // Generate multiple waves of bats from each house
    housePositions.forEach((house, houseIdx) => {
      // Each house releases 3-5 bats in waves (reduced for performance)
      const batCount = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < batCount; i++) {
        const angle = -60 + Math.random() * 120; // Fly upward and outward
        const distance = 40 + Math.random() * 60;
        const endX = house.x + Math.cos(angle * Math.PI / 180) * distance;
        const endY = house.y - Math.abs(Math.sin(angle * Math.PI / 180) * distance);
        
        // Create complex curved path
        const cp1x = house.x + (endX - house.x) * 0.3 + (Math.random() - 0.5) * 20;
        const cp1y = house.y - 15 - Math.random() * 10;
        const cp2x = house.x + (endX - house.x) * 0.7 + (Math.random() - 0.5) * 20;
        const cp2y = endY + (Math.random() - 0.5) * 15;
        
        generatedBats.push({
          id: batId++,
          startX: house.x,
          startY: house.y,
          delay: houseIdx * 2 + i * 0.3 + Math.random() * 0.5,
          duration: 4 + Math.random() * 3,
          size: 0.6 + Math.random() * 0.8,
          path: `M ${house.x} ${house.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`,
        });
      }
    });

    setBats(generatedBats);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes batFly {
            0% {
              offset-distance: 0%;
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            95% {
              opacity: 1;
            }
            100% {
              offset-distance: 100%;
              opacity: 0;
            }
          }
          
          @keyframes batWingFlap {
            0%, 100% {
              transform: scaleX(1) scaleY(1);
            }
            50% {
              transform: scaleX(1.2) scaleY(0.9);
            }
          }
          
          @keyframes batBodyTilt {
            0%, 100% {
              transform: rotate(0deg);
            }
            50% {
              transform: rotate(-5deg);
            }
          }
          
          .bat-container {
            will-change: transform, opacity;
            transform: translateZ(0);
          }
          
          .bat-wing {
            will-change: transform;
          }
        `}
      </style>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 7 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            {bats.map((bat) => (
              <path
                key={`path-${bat.id}`}
                id={`batPath${bat.id}`}
                d={bat.path}
                fill="none"
              />
            ))}
          </defs>
        </svg>

        {bats.map((bat) => (
          <div
            key={bat.id}
            className="bat-container"
            style={{
              position: 'absolute',
              left: `${bat.startX}%`,
              top: `${bat.startY}%`,
              offsetPath: `path('${bat.path}')`,
              animation: `batFly ${bat.duration}s ease-in-out ${bat.delay}s infinite`,
            }}
          >
            <div
              style={{
                animation: `batBodyTilt 0.6s ease-in-out infinite`,
                transformOrigin: 'center center',
              }}
            >
              <svg
                width={30 * bat.size}
                height={20 * bat.size}
                viewBox="0 0 60 40"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                }}
              >
                <defs>
                  <radialGradient id={`batGrad${bat.id}`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#2a2a2a" />
                    <stop offset="60%" stopColor="#1a1a1a" />
                    <stop offset="100%" stopColor="#0a0a0a" />
                  </radialGradient>
                  <radialGradient id={`batWingGrad${bat.id}`} cx="30%" cy="30%">
                    <stop offset="0%" stopColor="#3a3a3a" />
                    <stop offset="50%" stopColor="#2a2a2a" />
                    <stop offset="100%" stopColor="#1a1a1a" />
                  </radialGradient>
                </defs>

                {/* Left Wing */}
                <g
                  className="bat-wing"
                  style={{
                    animation: `batWingFlap 0.2s ease-in-out infinite`,
                    transformOrigin: '25px 20px',
                  }}
                >
                  {/* Wing membrane simplified */}
                  <path
                    d="M25 20 Q15 12 8 10 Q5 9 2 10 Q5 13 8 15 Q12 18 15 22 Q18 25 20 28 Q22 25 23 22 Z"
                    fill={`url(#batWingGrad${bat.id})`}
                    opacity="0.9"
                  />
                  {/* Wing bones simplified */}
                  <path d="M25 20 L8 10 M23 22 L12 14" stroke="#0a0a0a" strokeWidth="0.5" fill="none" opacity="0.5" />
                </g>

                {/* Right Wing */}
                <g
                  className="bat-wing"
                  style={{
                    animation: `batWingFlap 0.2s ease-in-out infinite`,
                    transformOrigin: '35px 20px',
                  }}
                >
                  {/* Wing membrane simplified */}
                  <path
                    d="M35 20 Q45 12 52 10 Q55 9 58 10 Q55 13 52 15 Q48 18 45 22 Q42 25 40 28 Q38 25 37 22 Z"
                    fill={`url(#batWingGrad${bat.id})`}
                    opacity="0.9"
                  />
                  {/* Wing bones simplified */}
                  <path d="M35 20 L52 10 M37 22 L48 14" stroke="#0a0a0a" strokeWidth="0.5" fill="none" opacity="0.5" />
                </g>

                {/* Bat Body */}
                <g>
                  {/* Body/Torso */}
                  <ellipse
                    cx="30"
                    cy="22"
                    rx="4"
                    ry="6"
                    fill={`url(#batGrad${bat.id})`}
                  />
                  {/* Fur texture */}
                  <g opacity="0.3">
                    <ellipse cx="30" cy="20" rx="3" ry="2" fill="#3a3a3a" />
                    <ellipse cx="30" cy="23" rx="2.5" ry="1.5" fill="#3a3a3a" />
                  </g>

                  {/* Head */}
                  <ellipse
                    cx="30"
                    cy="16"
                    rx="3.5"
                    ry="3.5"
                    fill={`url(#batGrad${bat.id})`}
                  />

                  {/* Ears - simplified */}
                  <g>
                    <path d="M27 14 L26 10 L28 13 Z" fill="#2a2a2a" />
                    <path d="M33 14 L34 10 L32 13 Z" fill="#2a2a2a" />
                  </g>

                  {/* Eyes - small red glowing */}
                  <circle cx="28.5" cy="16" r="0.6" fill="#ff0000" opacity="0.9">
                    <animate
                      attributeName="opacity"
                      values="0.9;0.5;0.9"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="31.5" cy="16" r="0.6" fill="#ff0000" opacity="0.9">
                    <animate
                      attributeName="opacity"
                      values="0.9;0.5;0.9"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Snout/Nose */}
                  <ellipse cx="30" cy="17.5" rx="1" ry="0.8" fill="#1a1a1a" />
                  <circle cx="30" cy="17.2" r="0.3" fill="#0a0a0a" />

                  {/* Fangs */}
                  <g fill="#f0f0f0" opacity="0.9">
                    <path d="M29 18 L28.8 19.5 L29.2 18.5 Z" />
                    <path d="M31 18 L31.2 19.5 L30.8 18.5 Z" />
                  </g>

                  {/* Legs - simplified */}
                  <path d="M28 26 L27 29 M32 26 L33 29" stroke="#1a1a1a" strokeWidth="0.6" fill="none" opacity="0.6" />
                </g>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BatsSwarm;
