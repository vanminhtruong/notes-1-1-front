const PumpkinsLayer = () => (
  <div className="absolute left-0 right-0" style={{ zIndex: 7, height: 160, bottom: '60px' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 160" preserveAspectRatio="none">
      <defs>
        <radialGradient id="pumpkin1" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#ff8c00" />
          <stop offset="60%" stopColor="#ff6b00" />
          <stop offset="100%" stopColor="#cc5500" />
        </radialGradient>
      </defs>
      <g transform="translate(0, -12)">
        <g>
          <ellipse cx="100" cy="128" rx="24" ry="18" fill="url(#pumpkin1)" />
          <path d="M76 128 Q76 110 100 110 Q124 110 124 128 Q124 146 100 146 Q76 146 76 128" fill="url(#pumpkin1)" />
          <path d="M85 112 Q85 128 85 144" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M92 111 Q92 128 92 145" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M100 110 Q100 128 100 146" stroke="#d45500" strokeWidth="2" fill="none" opacity="0.7" />
          <path d="M108 111 Q108 128 108 145" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M115 112 Q115 128 115 144" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M98 108 Q98 102 100 100 Q102 102 102 108" fill="#4a6b2a" stroke="#3a5520" strokeWidth="0.5" />
          <rect x="99" y="100" width="2" height="3" fill="#5a7b3a" />
          <path d="M88 122 L94 116 L100 122 Z" fill="#2b1200" />
          <path d="M100 122 L106 116 L112 122 Z" fill="#2b1200" />
          <path d="M98 128 L100 124 L102 128 Z" fill="#2b1200" />
          <path d="M85 134 Q88 138 92 137 Q96 136 100 138 Q104 136 108 137 Q112 138 115 134" fill="#2b1200" />
          <path d="M88 134 L90 137 L92 134" fill="#ff6b00" />
          <path d="M96 134 L98 137 L100 134" fill="#ff6b00" />
          <path d="M104 134 L106 137 L108 134" fill="#ff6b00" />
          <ellipse cx="100" cy="130" rx="16" ry="12" fill="#ffb300" opacity="0.4" style={{ animation: 'candleFlicker 1.8s infinite' }} />
        </g>

        <g>
          <ellipse cx="280" cy="132" rx="18" ry="14" fill="url(#pumpkin1)" />
          <path d="M265 120 Q265 132 280 132 Q295 132 295 120" stroke="#d45500" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M270 122 Q270 132 270 140" stroke="#d45500" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M280 120 Q280 132 280 142" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M290 122 Q290 132 290 140" stroke="#d45500" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M278 118 Q278 114 280 112 Q282 114 282 118" fill="#4a6b2a" />
          <circle cx="273" cy="128" r="3" fill="#2b1200" />
          <circle cx="287" cy="128" r="3" fill="#2b1200" />
          <ellipse cx="280" cy="137" rx="4" ry="5" fill="#2b1200" />
          <ellipse cx="280" cy="135" rx="10" ry="8" fill="#ffb300" opacity="0.35" style={{ animation: 'candleFlicker 2.2s infinite' }} />
        </g>

        <g>
          <ellipse cx="450" cy="130" rx="22" ry="16" fill="url(#pumpkin1)" />
          <path d="M430 118 Q430 130 450 130 Q470 130 470 118" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M438 120 Q438 130 438 142" stroke="#d45500" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M446 118 Q446 130 446 144" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M454 118 Q454 130 454 144" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M462 120 Q462 130 462 142" stroke="#d45500" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M448 116 Q448 110 450 108 Q452 110 452 116" fill="#4a6b2a" />
          <path d="M438 126 L444 122 L448 126 L442 128 Z" fill="#2b1200" />
          <path d="M452 126 L456 122 L462 126 L458 128 Z" fill="#2b1200" />
          <path d="M436 136 L440 140 L444 136 L448 140 L452 136 L456 140 L460 136 L464 140" stroke="#2b1200" strokeWidth="2.5" fill="none" />
          <ellipse cx="450" cy="135" rx="14" ry="10" fill="#ffb300" opacity="0.4" style={{ animation: 'candleFlicker 1.5s infinite' }} />
        </g>

        <g>
          <ellipse cx="600" cy="133" rx="20" ry="15" fill="url(#pumpkin1)" />
          <path d="M582 124 Q582 133 600 133 Q618 133 618 124" stroke="#d45500" strokeWidth="1.3" fill="none" opacity="0.6" />
          <path d="M590 125 Q590 133 590 141" stroke="#d45500" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M600 124 Q600 133 600 143" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M610 125 Q610 133 610 141" stroke="#d45500" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M598 121 Q598 116 600 114 Q602 116 602 121" fill="#4a6b2a" />
          <path d="M590 128 L595 124 L600 128 Z" fill="#2b1200" />
          <path d="M600 128 L605 124 L610 128 Z" fill="#2b1200" />
          <path d="M598 133 L600 130 L602 133 Z" fill="#2b1200" />
          <path d="M588 139 Q595 144 600 144 Q605 144 612 139" stroke="#2b1200" strokeWidth="2" fill="none" />
          <ellipse cx="600" cy="137" rx="12" ry="9" fill="#ffb300" opacity="0.4" style={{ animation: 'candleFlicker 1.7s infinite' }} />
        </g>

        <g>
          <ellipse cx="750" cy="135" rx="15" ry="12" fill="url(#pumpkin1)" />
          <path d="M738 128 Q738 135 750 135 Q762 135 762 128" stroke="#d45500" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M744 129 Q744 135 744 141" stroke="#d45500" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M750 128 Q750 135 750 142" stroke="#d45500" strokeWidth="1.2" fill="none" opacity="0.7" />
          <path d="M756 129 Q756 135 756 141" stroke="#d45500" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M749 126 Q749 122 750 120 Q751 122 751 126" fill="#4a6b2a" />
          <path d="M742 131 L746 129 L750 131 Z" fill="#2b1200" />
          <path d="M752 131 L760 131" stroke="#2b1200" strokeWidth="2" />
          <path d="M744 139 Q750 142 756 139" stroke="#2b1200" strokeWidth="1.5" fill="none" />
          <ellipse cx="750" cy="137" rx="9" ry="7" fill="#ffb300" opacity="0.35" style={{ animation: 'candleFlicker 2s infinite' }} />
        </g>

        <g>
          <ellipse cx="880" cy="129" rx="24" ry="17" fill="url(#pumpkin1)" />
          <path d="M858 118 Q858 129 880 129 Q902 129 902 118" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M866 120 Q866 129 866 141" stroke="#d45500" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M874 118 Q874 129 874 143" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M880 118 Q880 129 880 144" stroke="#d45500" strokeWidth="1.8" fill="none" opacity="0.7" />
          <path d="M886 118 Q886 129 886 143" stroke="#d45500" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M894 120 Q894 129 894 141" stroke="#d45500" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M878 115 Q878 109 880 107 Q882 109 882 115" fill="#4a6b2a" />
          <path d="M868 124 L872 120 L876 124 L874 126 L870 126 Z" fill="#2b1200" />
          <path d="M884 124 L888 120 L892 124 L890 126 L886 126 Z" fill="#2b1200" />
          <path d="M864 135 L868 139 L872 135 L876 139 L880 135 L884 139 L888 135 L892 139 L896 135" stroke="#2b1200" strokeWidth="3" fill="none" strokeLinecap="square" />
          <ellipse cx="880" cy="134" rx="16" ry="11" fill="#ffb300" opacity="0.45" style={{ animation: 'candleFlicker 1.4s infinite' }} />
        </g>

        <g>
          <ellipse cx="1020" cy="131" rx="19" ry="14" fill="url(#pumpkin1)" />
          <path d="M1003 122 Q1003 131 1020 131 Q1037 131 1037 122" stroke="#d45500" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M1010 123 Q1010 131 1010 140" stroke="#d45500" strokeWidth="1.1" fill="none" opacity="0.6" />
          <path d="M1020 122 Q1020 131 1020 141" stroke="#d45500" strokeWidth="1.4" fill="none" opacity="0.7" />
          <path d="M1030 123 Q1030 131 1030 140" stroke="#d45500" strokeWidth="1.1" fill="none" opacity="0.6" />
          <path d="M1019 119 Q1019 115 1020 113 Q1021 115 1021 119" fill="#4a6b2a" />
          <path d="M1010 127 Q1013 129 1016 127" stroke="#2b1200" strokeWidth="2" fill="none" />
          <path d="M1024 127 Q1027 129 1030 127" stroke="#2b1200" strokeWidth="2" fill="none" />
          <path d="M1008 135 Q1014 140 1020 140 Q1026 140 1032 135" stroke="#2b1200" strokeWidth="2.5" fill="none" />
          <ellipse cx="1020" cy="135" rx="11" ry="8" fill="#ffb300" opacity="0.4" style={{ animation: 'candleFlicker 1.9s infinite' }} />
        </g>

        <g>
          <ellipse cx="1120" cy="134" rx="14" ry="11" fill="url(#pumpkin1)" />
          <path d="M1108 128 Q1108 134 1120 134 Q1132 134 1132 128" stroke="#d45500" strokeWidth="0.9" fill="none" opacity="0.6" />
          <path d="M1114 129 Q1114 134 1114 139" stroke="#d45500" strokeWidth="0.8" fill="none" opacity="0.6" />
          <path d="M1120 128 Q1120 134 1120 140" stroke="#d45500" strokeWidth="1" fill="none" opacity="0.7" />
          <path d="M1126 129 Q1126 134 1126 139" stroke="#d45500" strokeWidth="0.8" fill="none" opacity="0.6" />
          <path d="M1119 126 Q1119 123 1120 121 Q1121 123 1121 126" fill="#4a6b2a" />
          <circle cx="1114" cy="131" r="2" fill="#2b1200" />
          <circle cx="1126" cy="131" r="2" fill="#2b1200" />
          <path d="M1116 137 Q1120 139 1124 137" stroke="#2b1200" strokeWidth="1.5" fill="none" />
          <ellipse cx="1120" cy="135" rx="8" ry="6" fill="#ffb300" opacity="0.35" style={{ animation: 'candleFlicker 2.3s infinite' }} />
        </g>
      </g>
    </svg>
  </div>
);

export default PumpkinsLayer;
