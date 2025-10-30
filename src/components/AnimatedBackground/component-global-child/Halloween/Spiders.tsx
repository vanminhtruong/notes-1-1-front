const Spiders = () => (
  <div className="absolute inset-0" style={{ zIndex: 6 }}>
    {[
      { left: '8%', top: '15%', delay: 0 },
      { left: '30%', top: '12%', delay: 1.5 },
      { left: '88%', top: '18%', delay: 3 },
      { left: '50%', top: '8%', delay: 2.2 },
      { left: '72%', top: '22%', delay: 4 },
    ].map((spider, idx) => (
      <div key={idx} className="absolute" style={{ left: spider.left, top: spider.top }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', top: -40, left: -40 }}>
          <defs>
            <radialGradient id={`webGlow${idx}`} cx="50%" cy="30%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="35" r="45" fill={`url(#webGlow${idx})`} opacity="0.3" />
          <g stroke="rgba(220,220,220,0.4)" strokeWidth="0.6" fill="none">
            <circle cx="60" cy="35" r="8" />
            <circle cx="60" cy="35" r="16" />
            <circle cx="60" cy="35" r="24" />
            <circle cx="60" cy="35" r="32" />
            <circle cx="60" cy="35" r="40" />
          </g>
          <g stroke="rgba(220,220,220,0.45)" strokeWidth="0.7" fill="none">
            <line x1="60" y1="0" x2="60" y2="70" />
            <line x1="30" y1="10" x2="90" y2="60" />
            <line x1="15" y1="35" x2="105" y2="35" />
            <line x1="30" y1="60" x2="90" y2="10" />
            <line x1="45" y1="5" x2="75" y2="65" />
            <line x1="20" y1="20" x2="100" y2="50" />
            <line x1="20" y1="50" x2="100" y2="20" />
            <line x1="75" y1="5" x2="45" y2="65" />
          </g>
          <g fill="rgba(200,230,255,0.6)">
            <circle cx="50" cy="27" r="1.2" />
            <circle cx="70" cy="30" r="1" />
            <circle cx="45" cy="40" r="0.8" />
            <circle cx="75" cy="42" r="1.1" />
            <circle cx="60" cy="48" r="0.9" />
          </g>
        </svg>

        <svg width="3" height="150" viewBox="0 0 3 150" style={{ position: 'absolute', left: '50%', top: -10, marginLeft: -1.5, pointerEvents: 'none' }}>
          <defs>
            <linearGradient id={`threadFixed${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(240,240,240,0.2)" />
              <stop offset="30%" stopColor="rgba(240,240,240,0.7)" />
              <stop offset="70%" stopColor="rgba(240,240,240,0.7)" />
              <stop offset="100%" stopColor="rgba(240,240,240,0.3)" />
            </linearGradient>
          </defs>
          <line x1="1.5" y1="0" x2="1.5" y2="150" stroke={`url(#threadFixed${idx})`} strokeWidth="1.2" />
          <line x1="1.5" y1="5" x2="1.5" y2="145" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
        </svg>

        <div style={{ animation: `spiderDrop 5s ease-in-out ${spider.delay}s infinite`, position: 'relative' }}>
          <svg width="35" height="40" viewBox="0 0 35 40">
            <defs>
              <radialGradient id={`spiderBody${idx}`} cx="40%" cy="40%">
                <stop offset="0%" stopColor="#2a2a2a" />
                <stop offset="60%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#0a0a0a" />
              </radialGradient>
              <filter id={`spiderShadow${idx}`}>
                <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                <feOffset dx="0" dy="1" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter={`url(#spiderShadow${idx})`}>
              <g stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round">
                <path d="M12 18 Q8 16 5 14 Q3 13 1 11" opacity="0.9" style={{ animation: 'spiderLegLeft1 5s ease-in-out infinite', transformOrigin: '12px 18px' }} />
                <path d="M11 20 Q7 20 4 19 Q2 18 0 16" opacity="0.9" style={{ animation: 'spiderLegLeft2 5s ease-in-out 0.1s infinite', transformOrigin: '11px 20px' }} />
                <path d="M11 23 Q7 25 4 27 Q2 28 0 30" opacity="0.9" style={{ animation: 'spiderLegLeft3 5s ease-in-out 0.2s infinite', transformOrigin: '11px 23px' }} />
                <path d="M12 25 Q8 28 5 31 Q3 33 1 36" opacity="0.9" style={{ animation: 'spiderLegLeft4 5s ease-in-out 0.3s infinite', transformOrigin: '12px 25px' }} />
                <path d="M23 18 Q27 16 30 14 Q32 13 34 11" opacity="0.9" style={{ animation: 'spiderLegRight1 5s ease-in-out 0.15s infinite', transformOrigin: '23px 18px' }} />
                <path d="M24 20 Q28 20 31 19 Q33 18 35 16" opacity="0.9" style={{ animation: 'spiderLegRight2 5s ease-in-out 0.25s infinite', transformOrigin: '24px 20px' }} />
                <path d="M24 23 Q28 25 31 27 Q33 28 35 30" opacity="0.9" style={{ animation: 'spiderLegRight3 5s ease-in-out 0.35s infinite', transformOrigin: '24px 23px' }} />
                <path d="M23 25 Q27 28 30 31 Q32 33 34 36" opacity="0.9" style={{ animation: 'spiderLegRight4 5s ease-in-out 0.45s infinite', transformOrigin: '23px 25px' }} />
              </g>
              <g fill="#2a2a2a">
                <circle cx="8" cy="16" r="0.8" />
                <circle cx="7" cy="20" r="0.8" />
                <circle cx="7" cy="25" r="0.8" />
                <circle cx="8" cy="28" r="0.8" />
                <circle cx="27" cy="16" r="0.8" />
                <circle cx="28" cy="20" r="0.8" />
                <circle cx="28" cy="25" r="0.8" />
                <circle cx="27" cy="28" r="0.8" />
              </g>
              <ellipse cx="17.5" cy="25" rx="7" ry="9" fill={`url(#spiderBody${idx})`} />
              <ellipse cx="17.5" cy="25" rx="6" ry="8" fill="#1a1a1a" opacity="0.6" />
              <g opacity="0.3">
                <ellipse cx="17.5" cy="22" rx="3" ry="2" fill="#3a3a3a" />
                <ellipse cx="17.5" cy="26" rx="2.5" ry="1.5" fill="#3a3a3a" />
                <ellipse cx="17.5" cy="29" rx="2" ry="1" fill="#3a3a3a" />
              </g>
              <ellipse cx="17.5" cy="16" rx="5.5" ry="6" fill={`url(#spiderBody${idx})`} />
              <ellipse cx="17.5" cy="16" rx="4.5" ry="5" fill="#2a2a2a" opacity="0.7" />
              <ellipse cx="17.5" cy="13" rx="3" ry="2.5" fill="#2a2a2a" />
              <g>
                <circle cx="15" cy="12.5" r="0.9" fill="#ff0000" opacity="0.9" style={{ animation: 'eyeGlow 2s infinite' }} />
                <circle cx="17.5" cy="12" r="1.1" fill="#ff0000" style={{ animation: 'eyeGlow 2s infinite' }} />
                <circle cx="17.5" cy="12" r="0.6" fill="#ff3333" />
                <circle cx="20" cy="12.5" r="0.9" fill="#ff0000" opacity="0.9" style={{ animation: 'eyeGlow 2s infinite' }} />
                <circle cx="14" cy="14" r="0.6" fill="#cc0000" opacity="0.7" />
                <circle cx="16.5" cy="14.5" r="0.5" fill="#cc0000" opacity="0.7" />
                <circle cx="18.5" cy="14.5" r="0.5" fill="#cc0000" opacity="0.7" />
                <circle cx="21" cy="14" r="0.6" fill="#cc0000" opacity="0.7" />
              </g>
              <g stroke="#0a0a0a" strokeWidth="0.8" fill="#1a1a1a">
                <path d="M16 13 L15.5 11 L16.5 11.5 Z" />
                <path d="M19 13 L19.5 11 L18.5 11.5 Z" />
              </g>
              <g stroke="#1a1a1a" strokeWidth="1" fill="none">
                <path d="M14 14 Q12 13 11 12" />
                <path d="M21 14 Q23 13 24 12" />
              </g>
              <g stroke="#3a3a3a" strokeWidth="0.3" opacity="0.4">
                <line x1="13" y1="24" x2="11" y2="23" />
                <line x1="13" y1="27" x2="11" y2="28" />
                <line x1="22" y1="24" x2="24" y2="23" />
                <line x1="22" y1="27" x2="24" y2="28" />
                <line x1="17.5" y1="32" x2="17.5" y2="34" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    ))}
  </div>
);

export default Spiders;
