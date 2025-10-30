import React from 'react';

const HalloweenTrees: React.FC = () => {
  return (
    <>
      <style>
        {`
          @keyframes treeSwayLeft {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-1.5deg); }
          }
          
          @keyframes treeSwayRight {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(1.5deg); }
          }
          
          @keyframes branchSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-3deg); }
          }
          
          @keyframes eyeGlow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          
          .halloween-tree-left {
            animation: treeSwayLeft 8s ease-in-out infinite;
            transform-origin: bottom center;
          }
          
          .halloween-tree-right {
            animation: treeSwayRight 7s ease-in-out infinite;
            transform-origin: bottom center;
          }
          
          .tree-branch {
            animation: branchSway 5s ease-in-out infinite;
            transform-origin: left center;
          }
          
          .tree-eye {
            animation: eyeGlow 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* Left Halloween Tree */}
      <div className="absolute bottom-0 left-[8%] halloween-tree-left" style={{ width: '280px', height: '600px' }}>
        <svg viewBox="0 0 280 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Complex root system */}
          <g opacity="0.9">
            <path d="M140 600 Q120 590 100 585 Q80 580 60 590 Q40 600 30 610" stroke="#1a1410" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M140 600 Q160 590 180 585 Q200 580 220 590 Q240 600 250 610" stroke="#1a1410" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M140 600 Q130 595 115 598 Q100 601 90 605" stroke="#1a1410" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M140 600 Q150 595 165 598 Q180 601 190 605" stroke="#1a1410" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M100 585 Q95 588 92 595" stroke="#1a1410" strokeWidth="3" fill="none" />
            <path d="M180 585 Q185 588 188 595" stroke="#1a1410" strokeWidth="3" fill="none" />
          </g>

          {/* Gnarled trunk with texture */}
          <g>
            <ellipse cx="140" cy="350" rx="32" ry="250" fill="#2a1f1a" />
            <ellipse cx="140" cy="350" rx="30" ry="248" fill="#3a2f2a" />
            
            {/* Bark texture lines */}
            {[550, 530, 480, 460, 410, 390, 340, 320, 270, 250].map((y, i) => (
              <path key={i} d={`M${115 + (i % 2) * 40} ${y} Q${120 + (i % 2) * 40} ${y - 5} ${125 + (i % 2) * 40} ${y}`} 
                stroke="#1a1410" strokeWidth="1.5" opacity="0.6" />
            ))}
            
            {/* Knots and burls */}
            <ellipse cx="125" cy="450" rx="8" ry="12" fill="#1a1410" opacity="0.7" />
            <ellipse cx="125" cy="450" rx="4" ry="6" fill="#0a0805" />
            <ellipse cx="158" cy="380" rx="10" ry="14" fill="#1a1410" opacity="0.7" />
            <ellipse cx="158" cy="380" rx="5" ry="7" fill="#0a0805" />
            
            {/* Spooky hollow with glowing eyes */}
            <ellipse cx="140" cy="280" rx="25" ry="35" fill="#000000" />
            <ellipse cx="130" cy="270" rx="6" ry="8" fill="#ff6600" className="tree-eye" />
            <ellipse cx="150" cy="270" rx="6" ry="8" fill="#ff6600" className="tree-eye" />
            <ellipse cx="130" cy="270" rx="3" ry="4" fill="#ffaa00" className="tree-eye" />
            <ellipse cx="150" cy="270" rx="3" ry="4" fill="#ffaa00" className="tree-eye" />
            <path d="M125 285 Q130 290 135 288 Q140 286 145 288 Q150 290 155 285" 
              stroke="#ff4400" strokeWidth="2" fill="none" opacity="0.6" />
          </g>

          {/* Complex twisted branches */}
          <g className="tree-branch">
            <path d="M132 180 Q100 170 80 160 Q60 150 45 145 Q30 140 20 142" 
              stroke="#2a1f1a" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M80 160 Q70 155 60 158 Q50 161 45 165" stroke="#2a1f1a" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M60 150 Q55 145 50 148" stroke="#2a1f1a" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M60 158 Q58 153 56 150" stroke="#1a1410" strokeWidth="3" fill="none" />
            <path d="M50 148 Q48 143 46 140" stroke="#1a1410" strokeWidth="3" fill="none" />
          </g>

          <g className="tree-branch" style={{ animationDelay: '0.5s' }}>
            <path d="M148 160 Q180 150 200 145 Q220 140 235 142 Q250 144 260 148" 
              stroke="#2a1f1a" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M200 145 Q210 140 220 143" stroke="#2a1f1a" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M220 140 Q225 135 230 138" stroke="#2a1f1a" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M220 143 Q222 138 224 135" stroke="#1a1410" strokeWidth="3" fill="none" />
          </g>

          <g className="tree-branch" style={{ animationDelay: '1s' }}>
            <path d="M135 120 Q115 110 95 105 Q75 100 60 102" stroke="#2a1f1a" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M95 105 Q85 100 75 103" stroke="#2a1f1a" strokeWidth="7" fill="none" strokeLinecap="round" />
          </g>

          <g className="tree-branch" style={{ animationDelay: '1.5s' }}>
            <path d="M145 110 Q165 100 185 98 Q205 96 220 100" stroke="#2a1f1a" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M185 98 Q195 93 205 96" stroke="#2a1f1a" strokeWidth="7" fill="none" strokeLinecap="round" />
          </g>

          {/* Top crown */}
          <g className="tree-branch" style={{ animationDelay: '2s' }}>
            <path d="M138 100 Q130 85 125 70 Q120 55 118 45" stroke="#2a1f1a" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M142 100 Q150 85 155 70 Q160 55 162 45" stroke="#2a1f1a" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M140 95 Q140 80 140 65 Q140 50 140 40" stroke="#2a1f1a" strokeWidth="9" fill="none" strokeLinecap="round" />
          </g>

          {/* Dead leaves */}
          <ellipse cx="25" cy="145" rx="15" ry="12" fill="#3d2817" opacity="0.8" />
          <ellipse cx="258" cy="150" rx="15" ry="12" fill="#3d2817" opacity="0.8" />
          <ellipse cx="40" cy="110" rx="12" ry="10" fill="#4a3520" opacity="0.7" />
          <ellipse cx="242" cy="112" rx="12" ry="10" fill="#4a3520" opacity="0.7" />
        </svg>
      </div>

      {/* Right Halloween Tree - Split trunk style */}
      <div className="absolute bottom-0 right-[10%] halloween-tree-right" style={{ width: '260px', height: '580px' }}>
        <svg viewBox="0 0 260 580" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Roots */}
          <g opacity="0.9">
            <path d="M130 580 Q110 570 90 568 Q70 566 50 572" stroke="#1a1410" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M130 580 Q150 570 170 568 Q190 566 210 572" stroke="#1a1410" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M130 580 Q120 575 105 578" stroke="#1a1410" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M130 580 Q140 575 155 578" stroke="#1a1410" strokeWidth="6" fill="none" strokeLinecap="round" />
          </g>

          {/* Split trunk */}
          <g>
            <ellipse cx="109" cy="335" rx="18" ry="245" fill="#2a1f1a" />
            <ellipse cx="109" cy="335" rx="16" ry="243" fill="#3a2f2a" />
            <ellipse cx="151" cy="335" rx="18" ry="245" fill="#2a1f1a" />
            <ellipse cx="151" cy="335" rx="16" ry="243" fill="#3a2f2a" />
            
            {/* Bark texture */}
            {[520, 460, 400, 340, 280, 220].map((y, i) => (
              <React.Fragment key={i}>
                <path d={`M95 ${y} Q100 ${y - 5} 105 ${y}`} stroke="#1a1410" strokeWidth="1.5" opacity="0.6" />
                <path d={`M155 ${y - 20} Q160 ${y - 25} 165 ${y - 20}`} stroke="#1a1410" strokeWidth="1.5" opacity="0.6" />
              </React.Fragment>
            ))}
            
            {/* Knots */}
            <ellipse cx="105" cy="420" rx="7" ry="10" fill="#1a1410" opacity="0.7" />
            <ellipse cx="105" cy="420" rx="3" ry="5" fill="#0a0805" />
            <ellipse cx="153" cy="360" rx="8" ry="11" fill="#1a1410" opacity="0.7" />
            <ellipse cx="153" cy="360" rx="4" ry="5" fill="#0a0805" />
            
            {/* Hollow with eyes */}
            <ellipse cx="130" cy="300" rx="20" ry="30" fill="#000000" />
            <ellipse cx="122" cy="292" rx="5" ry="7" fill="#ff6600" className="tree-eye" />
            <ellipse cx="138" cy="292" rx="5" ry="7" fill="#ff6600" className="tree-eye" />
            <ellipse cx="122" cy="292" rx="2" ry="3" fill="#ffaa00" className="tree-eye" />
            <ellipse cx="138" cy="292" rx="2" ry="3" fill="#ffaa00" className="tree-eye" />
          </g>

          {/* Branches */}
          <g className="tree-branch">
            <path d="M112 180 Q90 175 70 172 Q50 169 35 172" stroke="#2a1f1a" strokeWidth="13" fill="none" strokeLinecap="round" />
            <path d="M70 172 Q60 168 50 171" stroke="#2a1f1a" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M50 171 Q48 166 46 163" stroke="#1a1410" strokeWidth="2" fill="none" />
          </g>

          <g className="tree-branch" style={{ animationDelay: '0.8s' }}>
            <path d="M148 170 Q170 165 190 163 Q210 161 225 165" stroke="#2a1f1a" strokeWidth="13" fill="none" strokeLinecap="round" />
            <path d="M190 163 Q200 159 210 162" stroke="#2a1f1a" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M210 162 Q212 157 214 154" stroke="#1a1410" strokeWidth="2" fill="none" />
          </g>

          <g className="tree-branch" style={{ animationDelay: '1.2s' }}>
            <path d="M110 130 Q95 120 80 115 Q65 110 50 113" stroke="#2a1f1a" strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M80 115 Q72 111 64 114" stroke="#2a1f1a" strokeWidth="6" fill="none" strokeLinecap="round" />
          </g>

          <g className="tree-branch" style={{ animationDelay: '1.7s' }}>
            <path d="M150 120 Q165 110 180 108 Q195 106 210 110" stroke="#2a1f1a" strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M180 108 Q188 104 196 107" stroke="#2a1f1a" strokeWidth="6" fill="none" strokeLinecap="round" />
          </g>

          {/* Top crown */}
          <g className="tree-branch" style={{ animationDelay: '2.2s' }}>
            <path d="M113 90 Q108 75 105 60 Q102 45 100 35" stroke="#2a1f1a" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M147 90 Q152 75 155 60 Q158 45 160 35" stroke="#2a1f1a" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M130 95 Q130 80 130 65 Q130 50 130 38" stroke="#2a1f1a" strokeWidth="8" fill="none" strokeLinecap="round" />
          </g>

          {/* Dead leaves */}
          <ellipse cx="15" cy="175" rx="14" ry="11" fill="#3d2817" opacity="0.8" />
          <ellipse cx="245" cy="168" rx="14" ry="11" fill="#3d2817" opacity="0.8" />
          <ellipse cx="52" cy="115" rx="11" ry="9" fill="#4a3520" opacity="0.7" />
          <ellipse cx="208" cy="112" rx="11" ry="9" fill="#4a3520" opacity="0.7" />
        </svg>
      </div>
    </>
  );
};

export default HalloweenTrees;
