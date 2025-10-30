import { memo } from 'react';

const GlobalHalloweenAnimations = memo(() => (
  <style>
    {`
          @keyframes fogMoveSlow { 0% { transform: translateX(0); } 100% { transform: translateX(-20%); } }
          @keyframes fogMoveFast { 0% { transform: translateX(0); } 100% { transform: translateX(-35%); } }
          @keyframes ghostFloat { 0% { transform: translateY(0) } 50% { transform: translateY(-16px) } 100% { transform: translateY(0) } }
          @keyframes candleFlicker { 0%, 100% { opacity: 0.9; filter: drop-shadow(0 0 8px rgba(255,180,0,0.8)); } 50% { opacity: 0.6; filter: drop-shadow(0 0 4px rgba(255,150,0,0.6)); } }
          @keyframes lightning { 0%, 90%, 100% { opacity: 0; } 91%, 93%, 95% { opacity: 0.8; } }
          @keyframes owlBlink { 0%, 48%, 52%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
          @keyframes witchFly { 0% { transform: translateX(-100px) translateY(0); } 100% { transform: translateX(1300px) translateY(-30px); } }
          @keyframes spiderDrop { 0% { transform: translateY(0); } 50% { transform: translateY(40px); } 100% { transform: translateY(0); } }
          @keyframes spiderLegLeft1 { 
            0%, 100% { transform: rotate(0deg); } 
            25% { transform: rotate(-8deg); }
            50% { transform: rotate(5deg); } 
            75% { transform: rotate(-3deg); }
          }
          @keyframes spiderLegLeft2 { 
            0%, 100% { transform: rotate(0deg); } 
            25% { transform: rotate(-10deg); }
            50% { transform: rotate(6deg); } 
            75% { transform: rotate(-4deg); }
          }
          @keyframes spiderLegLeft3 { 
            0%, 100% { transform: rotate(0deg); } 
            25% { transform: rotate(8deg); }
            50% { transform: rotate(-5deg); } 
            75% { transform: rotate(3deg); }
          }
          @keyframes spiderLegLeft4 { 
            0%, 100% { transform: rotate(0deg); } 
            25% { transform: rotate(10deg); }
            50% { transform: rotate(-6deg); } 
            75% { transform: rotate(4deg); }
          }
          @keyframes spiderLegRight1 { 
            0%, 100% { transform: rotate(0deg); } 
            25% { transform: rotate(8deg); }
            50% { transform: rotate(-5deg); } 
            75% { transform: rotate(3deg); }
          }
          @keyframes spiderLegRight2 { 
            0%, 100% { transform: rotate(0deg); } 
            25% { transform: rotate(10deg); }
            50% { transform: rotate(-6deg); } 
            75% { transform: rotate(4deg); }
          }
          @keyframes spiderLegRight3 { 
            0%, 100% { transform: rotate(0deg); } 
            25% { transform: rotate(-8deg); }
            50% { transform: rotate(5deg); } 
            75% { transform: rotate(-3deg); }
          }
          @keyframes spiderLegRight4 { 
            0%, 100% { transform: rotate(0deg); } 
            25% { transform: rotate(-10deg); }
            50% { transform: rotate(6deg); } 
            75% { transform: rotate(-4deg); }
          }
          @keyframes leafFall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(600px) rotate(360deg); opacity: 0; } }
          @keyframes catWalk { 0% { transform: translateX(0); } 100% { transform: translateX(-150px); } }
          @keyframes eyeGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        `}
  </style>
));

GlobalHalloweenAnimations.displayName = 'GlobalHalloweenAnimations';

export default GlobalHalloweenAnimations;
