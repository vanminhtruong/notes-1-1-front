import React from 'react';

const DeadTrees: React.FC = () => {
  return (
    <>
      <style>
        {`
          @keyframes treeSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-0.8deg); }
          }
          
          .spooky-tree {
            animation: treeSway 10s ease-in-out infinite;
            transform-origin: bottom center;
            filter: drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.5));
          }
        `}
      </style>

      {/* Left Dead Tree - Complex detailed branches */}
      <div className="absolute left-[5%] spooky-tree" style={{ width: '200px', height: '550px', bottom: '80px', zIndex: 10 }}>
        <svg viewBox="0 0 200 550" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main trunk - twisted, curved and gnarled */}
          <path d="M100 550 Q95 520 92 490 Q88 460 86 430 Q83 400 82 370 Q80 340 81 310 Q83 280 86 250 Q88 220 87 190 Q85 160 82 130 Q78 100 75 70 Q72 40 70 20" fill="#0a0a0a" stroke="#000" strokeWidth="1.5" />
          <path d="M100 550 Q105 520 108 490 Q112 460 114 430 Q117 400 118 370 Q120 340 119 310 Q117 280 114 250 Q112 220 113 190 Q115 160 118 130 Q122 100 125 70 Q128 40 130 20" fill="#0a0a0a" stroke="#000" strokeWidth="1.5" />
          
          {/* Trunk bumps, knots and scars */}
          <ellipse cx="92" cy="480" rx="5" ry="8" fill="#000" />
          <ellipse cx="112" cy="440" rx="6" ry="7" fill="#000" />
          <ellipse cx="88" cy="390" rx="4" ry="6" fill="#000" />
          <ellipse cx="116" cy="340" rx="5" ry="7" fill="#000" />
          <ellipse cx="90" cy="280" rx="4" ry="6" fill="#000" />
          <ellipse cx="114" cy="230" rx="5" ry="8" fill="#000" />
          <ellipse cx="86" cy="170" rx="3" ry="5" fill="#000" />
          <ellipse cx="118" cy="120" rx="4" ry="6" fill="#000" />
          {/* Cracks and splits */}
          <path d="M95 500 L93 495 L94 490" stroke="#000" strokeWidth="0.8" fill="none" />
          <path d="M110 450 L112 445 L111 440" stroke="#000" strokeWidth="0.8" fill="none" />
          <path d="M88 380 L86 375 L87 370" stroke="#000" strokeWidth="0.8" fill="none" />

          {/* Major left branch system - level 1 - curved and twisted */}
          <path d="M86 250 Q76 246 66 244 Q56 242 46 243 Q36 244 26 247 L16 251" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M66 244 Q60 241 54 240 Q48 239 42 240 L36 242" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M54 240 Q50 238 46 237 Q42 236 38 237" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M46 237 Q43 235 40 234 L37 233" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M40 234 Q38 232 36 231 L34 230" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M36 231 L33 228" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M34 230 L31 227" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M38 237 L35 234" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M42 240 Q40 237 38 235" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M38 235 L35 232" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M26 247 Q23 244 20 242" stroke="#000" strokeWidth="2.5" fill="none" />
          <path d="M20 242 L17 239" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M17 239 L14 236" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M16 251 Q13 248 10 246" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M10 246 L7 243" stroke="#000" strokeWidth="1" fill="none" />
          {/* Additional twisted sub-branches */}
          <path d="M54 240 Q52 235 50 230 Q48 225 47 220" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M50 230 L48 225" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M47 220 L45 215" stroke="#000" strokeWidth="0.9" fill="none" />
          <path d="M42 240 Q40 236 38 232 Q36 228 35 224" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M38 232 L36 228" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M35 224 L33 220" stroke="#000" strokeWidth="0.7" fill="none" />

          {/* Major right branch system - level 1 - curved and twisted */}
          <path d="M114 250 Q124 246 134 244 Q144 242 154 243 Q164 244 174 247 L184 251" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M134 244 Q140 241 146 240 Q152 239 158 240 L164 242" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M146 240 Q150 238 154 237 Q158 236 162 237" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M154 237 Q157 235 160 234 L163 233" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M160 234 Q162 232 164 231 L166 230" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M164 231 L167 228" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M166 230 L169 227" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M162 237 L165 234" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M158 240 Q160 237 162 235" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M162 235 L165 232" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M174 247 Q177 244 180 242" stroke="#000" strokeWidth="2.5" fill="none" />
          <path d="M180 242 L183 239" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M183 239 L186 236" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M184 251 Q187 248 190 246" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M190 246 L193 243" stroke="#000" strokeWidth="1" fill="none" />
          {/* Additional twisted sub-branches */}
          <path d="M146 240 Q148 235 150 230 Q152 225 153 220" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M150 230 L152 225" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M153 220 L155 215" stroke="#000" strokeWidth="0.9" fill="none" />
          <path d="M158 240 Q160 236 162 232 Q164 228 165 224" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M162 232 L164 228" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M165 224 L167 220" stroke="#000" strokeWidth="0.7" fill="none" />

          {/* Left branch level 2 - upper with curves */}
          <path d="M82 130 Q72 125 62 122 Q52 119 42 120 Q32 121 22 125" stroke="#000" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M62 122 Q56 119 50 118 Q44 117 38 118" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M50 118 Q46 116 42 115 Q38 114 34 115" stroke="#000" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M42 115 Q39 113 36 112 L33 111" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M36 112 Q34 110 32 109 L30 108" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M32 109 L29 106" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M30 108 L27 105" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M34 115 L31 112" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M38 118 Q36 115 34 113" stroke="#000" strokeWidth="1.6" fill="none" />
          <path d="M34 113 L31 110" stroke="#000" strokeWidth="0.9" fill="none" />
          <path d="M22 125 Q19 122 16 120" stroke="#000" strokeWidth="2.2" fill="none" />
          <path d="M16 120 L13 117" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M13 117 L10 114" stroke="#000" strokeWidth="0.9" fill="none" />
          {/* Extra twisted branches */}
          <path d="M50 118 Q48 113 46 108 Q44 103 43 98" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M46 108 L44 103" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M43 98 L41 93" stroke="#000" strokeWidth="0.8" fill="none" />

          {/* Right branch level 2 - upper with curves */}
          <path d="M118 130 Q128 125 138 122 Q148 119 158 120 Q168 121 178 125" stroke="#000" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M138 122 Q144 119 150 118 Q156 117 162 118" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M150 118 Q154 116 158 115 Q162 114 166 115" stroke="#000" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M158 115 Q161 113 164 112 L167 111" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M164 112 Q166 110 168 109 L170 108" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M168 109 L171 106" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M170 108 L173 105" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M166 115 L169 112" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M162 118 Q164 115 166 113" stroke="#000" strokeWidth="1.6" fill="none" />
          <path d="M166 113 L169 110" stroke="#000" strokeWidth="0.9" fill="none" />
          <path d="M178 125 Q181 122 184 120" stroke="#000" strokeWidth="2.2" fill="none" />
          <path d="M184 120 L187 117" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M187 117 L190 114" stroke="#000" strokeWidth="0.9" fill="none" />
          {/* Extra twisted branches */}
          <path d="M150 118 Q152 113 154 108 Q156 103 157 98" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M154 108 L156 103" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M157 98 L159 93" stroke="#000" strokeWidth="0.8" fill="none" />

          {/* Left branch level 3 - middle with curves */}
          <path d="M83 310 Q75 306 67 304 Q59 302 51 304" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M67 304 Q62 302 57 301 Q52 300 47 301" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M57 301 Q53 299 49 299" stroke="#000" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          <path d="M49 299 Q46 298 43 298" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M43 298 L40 296" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M47 301 L44 299" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M51 304 L48 302" stroke="#000" strokeWidth="1.3" fill="none" />
          {/* Extra small branches */}
          <path d="M57 301 Q55 296 53 291" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M53 291 L51 286" stroke="#000" strokeWidth="0.9" fill="none" />

          {/* Right branch level 3 - middle with curves */}
          <path d="M117 310 Q125 306 133 304 Q141 302 149 304" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M133 304 Q138 302 143 301 Q148 300 153 301" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M143 301 Q147 299 151 299" stroke="#000" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          <path d="M151 299 Q154 298 157 298" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M157 298 L160 296" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M153 301 L156 299" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M149 304 L152 302" stroke="#000" strokeWidth="1.3" fill="none" />
          {/* Extra small branches */}
          <path d="M143 301 Q145 296 147 291" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M147 291 L149 286" stroke="#000" strokeWidth="0.9" fill="none" />

          {/* Additional middle branches - more complexity */}
          <path d="M80 190 Q70 186 60 185 Q50 184 40 186" stroke="#000" strokeWidth="3.8" fill="none" strokeLinecap="round" />
          <path d="M60 185 Q55 183 50 183" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M50 183 L45 182" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M40 186 L35 185" stroke="#000" strokeWidth="1.2" fill="none" />
          
          <path d="M120 190 Q130 186 140 185 Q150 184 160 186" stroke="#000" strokeWidth="3.8" fill="none" strokeLinecap="round" />
          <path d="M140 185 Q145 183 150 183" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M150 183 L155 182" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M160 186 L165 185" stroke="#000" strokeWidth="1.2" fill="none" />

          {/* Top crown branches - complex twisted network */}
          <path d="M75 70 Q70 60 66 50 Q62 40 59 30 Q56 20 54 10" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M66 50 Q63 44 60 38 Q57 32 54 26" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M60 38 Q58 33 56 28 Q54 23 52 18" stroke="#000" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          <path d="M56 28 Q54 24 52 20" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M52 20 L50 16" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M54 26 L52 22" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M59 30 Q57 26 55 22" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M55 22 L53 18" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M54 10 L52 6" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M54 10 Q52 8 50 6" stroke="#000" strokeWidth="1.3" fill="none" />
          {/* Extra crown branches */}
          <path d="M66 50 Q64 45 62 40 Q60 35 59 30" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M62 40 L60 35" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M59 30 L57 25" stroke="#000" strokeWidth="0.9" fill="none" />

          <path d="M125 70 Q130 60 134 50 Q138 40 141 30 Q144 20 146 10" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M134 50 Q137 44 140 38 Q143 32 146 26" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M140 38 Q142 33 144 28 Q146 23 148 18" stroke="#000" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          <path d="M144 28 Q146 24 148 20" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M148 20 L150 16" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M146 26 L148 22" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M141 30 Q143 26 145 22" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M145 22 L147 18" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M146 10 L148 6" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M146 10 Q148 8 150 6" stroke="#000" strokeWidth="1.3" fill="none" />
          {/* Extra crown branches */}
          <path d="M134 50 Q136 45 138 40 Q140 35 141 30" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M138 40 L140 35" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M141 30 L143 25" stroke="#000" strokeWidth="0.9" fill="none" />

          <path d="M100 50 Q98 42 97 34 Q96 26 96 18 Q96 10 96 5" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M97 34 Q94 29 91 24 Q88 19 85 14" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M91 24 Q89 21 87 18" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M87 18 L85 15" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M85 14 L83 11" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M97 34 Q100 29 103 24 Q106 19 109 14" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M103 24 Q105 21 107 18" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M107 18 L109 15" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M109 14 L111 11" stroke="#000" strokeWidth="1" fill="none" />
          {/* Extra center branches */}
          <path d="M97 34 Q95 29 93 24" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M93 24 L91 19" stroke="#000" strokeWidth="1" fill="none" />

          {/* Additional small branches scattered */}
          <path d="M85 120 Q80 118 75 117" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M75 117 Q72 115 69 114" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M69 114 L66 112" stroke="#000" strokeWidth="1.2" fill="none" />
          
          <path d="M115 120 Q120 118 125 117" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M125 117 Q128 115 131 114" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M131 114 L134 112" stroke="#000" strokeWidth="1.2" fill="none" />

          <path d="M84 360 Q78 358 72 357" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M72 357 L68 356" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M68 356 L65 354" stroke="#000" strokeWidth="1.2" fill="none" />

          <path d="M116 360 Q122 358 128 357" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M128 357 L132 356" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M132 356 L135 354" stroke="#000" strokeWidth="1.2" fill="none" />

          <path d="M86 420 Q81 418 76 417" stroke="#000" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M76 417 L72 416" stroke="#000" strokeWidth="1.8" fill="none" />

          <path d="M114 420 Q119 418 124 417" stroke="#000" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M124 417 L128 416" stroke="#000" strokeWidth="1.8" fill="none" />
        </svg>
      </div>

      {/* Right Dead Tree - Complex detailed branches */}
      <div className="absolute right-[8%] spooky-tree" style={{ width: '220px', height: '580px', bottom: '80px', animationDelay: '1s', zIndex: 10 }}>
        <svg viewBox="0 0 220 580" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main trunk - twisted, curved and gnarled */}
          <path d="M110 580 Q115 550 118 520 Q122 490 124 460 Q127 430 128 400 Q130 370 129 340 Q127 310 124 280 Q122 250 123 220 Q125 190 128 160 Q132 130 135 100 Q138 70 140 40 Q142 20 143 10" fill="#0a0a0a" stroke="#000" strokeWidth="1.5" />
          <path d="M110 580 Q105 550 102 520 Q98 490 96 460 Q93 430 92 400 Q90 370 91 340 Q93 310 96 280 Q98 250 97 220 Q95 190 92 160 Q88 130 85 100 Q82 70 80 40 Q78 20 77 10" fill="#0a0a0a" stroke="#000" strokeWidth="1.5" />
          
          {/* Trunk bumps, knots and scars */}
          <ellipse cx="102" cy="510" rx="5" ry="8" fill="#000" />
          <ellipse cx="122" cy="470" rx="6" ry="7" fill="#000" />
          <ellipse cx="98" cy="420" rx="4" ry="6" fill="#000" />
          <ellipse cx="126" cy="370" rx="5" ry="7" fill="#000" />
          <ellipse cx="96" cy="310" rx="4" ry="6" fill="#000" />
          <ellipse cx="124" cy="260" rx="5" ry="8" fill="#000" />
          <ellipse cx="94" cy="200" rx="3" ry="5" fill="#000" />
          <ellipse cx="128" cy="150" rx="4" ry="6" fill="#000" />
          {/* Cracks and splits */}
          <path d="M105 520 L107 515 L106 510" stroke="#000" strokeWidth="0.8" fill="none" />
          <path d="M120 480 L118 475 L119 470" stroke="#000" strokeWidth="0.8" fill="none" />
          <path d="M100 410 L102 405 L101 400" stroke="#000" strokeWidth="0.8" fill="none" />

          {/* Left branch system - curved and twisted */}
          <path d="M96 280 Q86 276 76 274 Q66 272 56 274 Q46 276 36 280 L26 285" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M76 274 Q70 272 64 271 Q58 270 52 271 L46 273" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M64 271 Q60 269 56 268 Q52 267 48 268" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M56 268 Q53 266 50 265 L47 264" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M50 265 Q48 263 46 262 L44 261" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M46 262 L43 259" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M44 261 L41 258" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M48 268 L45 265" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M52 271 Q50 268 48 266" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M48 266 L45 263" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M36 280 Q33 277 30 275" stroke="#000" strokeWidth="2.5" fill="none" />
          <path d="M30 275 L27 272" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M27 272 L24 269" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M26 285 Q23 282 20 280" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M20 280 L17 277" stroke="#000" strokeWidth="1" fill="none" />
          {/* Additional twisted sub-branches */}
          <path d="M64 271 Q62 266 60 261 Q58 256 57 251" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M60 261 L58 256" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M57 251 L55 246" stroke="#000" strokeWidth="0.9" fill="none" />
          <path d="M52 271 Q50 267 48 263 Q46 259 45 255" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M48 263 L46 259" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M45 255 L43 251" stroke="#000" strokeWidth="0.7" fill="none" />

          {/* Right branch system - curved and twisted */}
          <path d="M128 160 Q142 155 156 152 Q170 149 184 151 L198 154" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M156 152 Q163 148 170 146 L177 145" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M170 146 Q174 142 178 140" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M184 151 Q188 147 192 145" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M177 145 L180 140" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M178 140 L181 136" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M192 145 L195 141" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M198 154 L201 150" stroke="#000" strokeWidth="1" fill="none" />
          {/* Additional twisted sub-branches */}
          <path d="M170 146 Q172 141 174 136 Q176 131 177 126" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M174 136 L176 131" stroke="#000" strokeWidth="1.3" fill="none" />
          <path d="M177 126 L179 121" stroke="#000" strokeWidth="0.9" fill="none" />

          {/* Left upper branch - curved */}
          <path d="M88 100 Q78 95 68 92 Q58 89 48 91" stroke="#000" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M68 92 Q63 88 58 86" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M58 86 Q55 82 52 80" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M48 91 Q45 87 42 85" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M58 86 L55 81" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M52 80 L49 76" stroke="#000" strokeWidth="0.8" fill="none" />
          <path d="M42 85 L39 81" stroke="#000" strokeWidth="0.8" fill="none" />
          {/* Extra small branches */}
          <path d="M68 92 Q66 87 64 82" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M64 82 L62 77" stroke="#000" strokeWidth="1" fill="none" />

          {/* Right upper branch - curved */}
          <path d="M132 100 Q142 95 152 92 Q162 89 172 91" stroke="#000" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M152 92 Q157 88 162 86" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M162 86 Q165 82 168 80" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M172 91 Q175 87 178 85" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M162 86 L165 81" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M168 80 L171 76" stroke="#000" strokeWidth="0.8" fill="none" />
          <path d="M178 85 L181 81" stroke="#000" strokeWidth="0.8" fill="none" />
          {/* Extra small branches */}
          <path d="M152 92 Q154 87 156 82" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M156 82 L158 77" stroke="#000" strokeWidth="1" fill="none" />

          {/* Top crown branches - left side */}
          <path d="M80 40 Q75 30 71 20 Q67 10 65 5" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M71 20 Q68 15 65 12" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M65 12 L62 8" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M65 5 L62 2" stroke="#000" strokeWidth="1.2" fill="none" />
          {/* Extra crown branches */}
          <path d="M71 20 Q69 15 67 10" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M67 10 L65 6" stroke="#000" strokeWidth="1" fill="none" />

          {/* Top crown branches - right side */}
          <path d="M140 40 Q145 30 149 20 Q153 10 155 5" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M149 20 Q152 15 155 12" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M155 12 L158 8" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M155 5 L158 2" stroke="#000" strokeWidth="1.2" fill="none" />
          {/* Extra crown branches */}
          <path d="M149 20 Q151 15 153 10" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M153 10 L155 6" stroke="#000" strokeWidth="1" fill="none" />

          {/* Center top branch */}
          <path d="M110 35 Q110 25 110 15 Q110 8 110 3" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M110 15 Q107 10 104 7" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M110 15 Q113 10 116 7" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M104 7 L101 4" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M116 7 L119 4" stroke="#000" strokeWidth="1" fill="none" />

          <path d="M93 300 Q86 296 79 294" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M79 294 L75 291" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M125 280 Q132 276 139 274" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M139 274 L143 271" stroke="#000" strokeWidth="1.8" fill="none" />
          <path d="M91 100 Q85 96 79 94" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M79 94 L75 91" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M128 90 Q134 86 140 84" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M140 84 L144 81" stroke="#000" strokeWidth="1.2" fill="none" />
        </svg>
      </div>

      {/* Center Background Tree */}
      <div className="absolute left-[45%] spooky-tree" style={{ width: '180px', height: '500px', bottom: '80px', opacity: 0.6, animationDelay: '2s', zIndex: 8 }}>
        <svg viewBox="0 0 180 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main trunk - twisted and curved */}
          <path d="M90 500 Q85 470 82 440 Q78 410 76 380 Q73 350 74 320 Q76 290 79 260 Q81 230 80 200 Q78 170 75 140 Q72 110 70 80 Q68 50 67 30" fill="#0a0a0a" stroke="#000" strokeWidth="1" />
          <path d="M90 500 Q95 470 98 440 Q102 410 104 380 Q107 350 106 320 Q104 290 101 260 Q99 230 100 200 Q102 170 105 140 Q108 110 110 80 Q112 50 113 30" fill="#0a0a0a" stroke="#000" strokeWidth="1" />
          
          {/* Trunk knots */}
          <ellipse cx="86" cy="450" rx="3" ry="5" fill="#000" />
          <ellipse cx="100" cy="400" rx="4" ry="6" fill="#000" />
          <ellipse cx="84" cy="340" rx="3" ry="4" fill="#000" />
          <ellipse cx="102" cy="280" rx="3" ry="5" fill="#000" />
          <ellipse cx="82" cy="220" rx="2" ry="4" fill="#000" />
          <ellipse cx="104" cy="160" rx="3" ry="5" fill="#000" />
          
          {/* Left branches - curved */}
          <path d="M75 140 Q65 136 55 134 Q45 132 35 134" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M55 134 Q50 131 45 130" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M45 130 L41 127" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M35 134 L31 131" stroke="#000" strokeWidth="1.5" fill="none" />
          {/* Extra small branches */}
          <path d="M55 134 Q53 129 51 124" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M51 124 L49 119" stroke="#000" strokeWidth="0.8" fill="none" />

          {/* Right branches - curved */}
          <path d="M105 140 Q115 136 125 134 Q135 132 145 134" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M125 134 Q130 131 135 130" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M135 130 L139 127" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M145 134 L149 131" stroke="#000" strokeWidth="1.5" fill="none" />
          {/* Extra small branches */}
          <path d="M125 134 Q127 129 129 124" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M129 124 L131 119" stroke="#000" strokeWidth="0.8" fill="none" />

          {/* Middle left branches */}
          <path d="M74 220 Q66 216 58 214 Q50 212 42 214" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M58 214 Q54 211 50 210" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M50 210 L46 207" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M42 214 L38 211" stroke="#000" strokeWidth="1" fill="none" />

          {/* Middle right branches */}
          <path d="M106 220 Q114 216 122 214 Q130 212 138 214" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M122 214 Q126 211 130 210" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M130 210 L134 207" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M138 214 L142 211" stroke="#000" strokeWidth="1" fill="none" />

          {/* Top crown branches - left side */}
          <path d="M70 80 Q65 70 61 60 Q57 50 55 40 Q53 30 52 22" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M61 60 Q58 55 55 50" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M55 50 L52 45" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M55 40 L52 35" stroke="#000" strokeWidth="1" fill="none" />
          {/* Extra crown branches */}
          <path d="M61 60 Q59 55 57 50" stroke="#000" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M57 50 L55 45" stroke="#000" strokeWidth="0.8" fill="none" />

          {/* Top crown branches - right side */}
          <path d="M110 80 Q115 70 119 60 Q123 50 125 40 Q127 30 128 22" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M119 60 Q122 55 125 50" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M125 50 L128 45" stroke="#000" strokeWidth="1" fill="none" />
          <path d="M125 40 L128 35" stroke="#000" strokeWidth="1" fill="none" />
          {/* Extra crown branches */}
          <path d="M119 60 Q121 55 123 50" stroke="#000" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M123 50 L125 45" stroke="#000" strokeWidth="0.8" fill="none" />

          {/* Center top branch */}
          <path d="M90 75 Q88 65 87 55 Q86 45 86 35 Q86 25 86 18" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M87 55 Q84 50 81 47" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M87 55 Q90 50 93 47" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M81 47 L78 43" stroke="#000" strokeWidth="0.8" fill="none" />
          <path d="M93 47 L96 43" stroke="#000" strokeWidth="0.8" fill="none" />
          
          {/* Additional scattered small branches */}
          <path d="M76 300 Q70 296 64 294" stroke="#000" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M64 294 L60 291" stroke="#000" strokeWidth="1.3" fill="none" />
          
          <path d="M104 300 Q110 296 116 294" stroke="#000" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M116 294 L120 291" stroke="#000" strokeWidth="1.3" fill="none" />
        </svg>
      </div>
    </>
  );
};

export default DeadTrees;
