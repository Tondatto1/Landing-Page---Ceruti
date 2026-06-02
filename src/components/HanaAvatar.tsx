import React from 'react';

interface HanaAvatarProps {
  className?: string;
}

export function HanaAvatar({ className = 'w-full h-full' }: HanaAvatarProps) {
  return (
    <svg 
      className={`${className} select-none`} 
      viewBox="0 0 320 320" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background - Soft radial light gradient for portrait pop */}
      <defs>
        <radialGradient id="avatarBg" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3f4f6" />
        </radialGradient>
        
        {/* Soft hair gradient for premium 3D feeling */}
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#854d0e" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Soft skin gradient to give depth */}
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#ffedd5" />
        </linearGradient>
      </defs>

      {/* Main outer boundary base */}
      <circle cx="160" cy="160" r="160" fill="url(#avatarBg)" />

      {/* Grid Pattern inside background (to evoke the checkered grid alignment in the original attachment) */}
      <g opacity="0.15">
        <line x1="40" y1="0" x2="40" y2="320" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="80" y1="0" x2="80" y2="320" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="120" y1="0" x2="120" y2="320" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="160" y1="0" x2="160" y2="320" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="200" y1="0" x2="200" y2="320" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="240" y1="0" x2="240" y2="320" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="280" y1="0" x2="280" y2="320" stroke="#cbd5e1" strokeWidth="1" />

        <line x1="0" y1="40" x2="320" y2="40" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="0" y1="80" x2="320" y2="80" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="0" y1="120" x2="320" y2="120" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="0" y1="160" x2="320" y2="160" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="0" y1="200" x2="320" y2="200" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="0" y1="240" x2="320" y2="240" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="0" y1="280" x2="320" y2="280" stroke="#cbd5e1" strokeWidth="1" />
      </g>

      {/* HAIR BACK (Bun on the upper back of head) */}
      <circle cx="160" cy="55" r="32" fill="url(#hairGrad)" />
      {/* Bun highlights and rings */}
      <path d="M140 45 C150 40, 170 40, 180 45" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M136 55 C146 50, 174 50, 184 55" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

      {/* HEADPHONES HEADBAND */}
      <path d="M100 110 C100 50, 220 50, 220 110" stroke="#1f2937" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M100 110 C100 50, 220 50, 220 110" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />

      {/* NECK */}
      <path d="M142 170 C142 170, 142 205, 142 210 C142 210, 160 215, 178 210 C178 205, 178 170, 178 170" fill="#fed7aa" />
      <path d="M142 180 C150 190, 170 190, 178 180" fill="#fca5a5" opacity="0.4" /> {/* Soft neck shadow */}

      {/* FACE */}
      <path d="M96 128 C96 175, 114 205, 160 205 C206 205, 224 175, 224 128 C224 95, 206 90, 160 90 C114 90, 96 95, 96 128 Z" fill="url(#skinGrad)" />

      {/* CHEEKS BLUSH */}
      <ellipse cx="118" cy="155" rx="14" ry="10" fill="#f87171" opacity="0.25" />
      <ellipse cx="202" cy="155" rx="14" ry="10" fill="#f87171" opacity="0.25" />

      {/* FRECKLES (Identical cute detail from the attachment) */}
      <g fill="#a16207" opacity="0.7">
        <circle cx="118" cy="153" r="1.2" />
        <circle cx="122" cy="150" r="1" />
        <circle cx="125" cy="155" r="1" />
        <circle cx="132" cy="155" r="1" />
        <circle cx="138" cy="158" r="1.2" />
        
        <circle cx="202" cy="153" r="1.2" />
        <circle cx="198" cy="150" r="1" />
        <circle cx="195" cy="155" r="1" />
        <circle cx="188" cy="155" r="1.2" />
        <circle cx="182" cy="158" r="1" />
      </g>

      {/* NOSE */}
      <path d="M155 148 C155 148, 160 152, 165 148" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />

      {/* EYES */}
      {/* Left eye base & Iris */}
      <ellipse cx="124" cy="132" rx="14" ry="16" fill="#ffffff" />
      <ellipse cx="125" cy="132" rx="10" ry="11" fill="#78350f" /> {/* Caramel Brown Iris */}
      <ellipse cx="125" cy="132" rx="7" ry="8" fill="#1c1917" /> {/* Pupil */}
      {/* Highlights for anime/cartoon eyes */}
      <circle cx="121" cy="127" r="3.2" fill="#ffffff" />
      <circle cx="128" cy="137" r="1.5" fill="#ffffff" />
      {/* Eyelashes & Brow */}
      <path d="M108 126 C114 120, 134 118, 140 128" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M110 110 C116 104, 130 104, 136 108" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Right eye base & Iris */}
      <ellipse cx="196" cy="132" rx="14" ry="16" fill="#ffffff" />
      <ellipse cx="195" cy="132" rx="10" ry="11" fill="#78350f" /> {/* Caramel Brown Iris */}
      <ellipse cx="195" cy="132" rx="7" ry="8" fill="#1c1917" /> {/* Pupil */}
      {/* Highlights */}
      <circle cx="191" cy="127" r="3.2" fill="#ffffff" />
      <circle cx="198" cy="137" r="1.5" fill="#ffffff" />
      {/* Eyelashes & Brow */}
      <path d="M212 126 C206 120, 186 118, 180 128" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M210 110 C204 104, 190 104, 184 108" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* MOUTH - BIG CHEERFUL SMILE (Just like original attachment) */}
      {/* Mouth open area */}
      <path d="M128 165 C128 165, 160 195, 192 165 C192 165, 160 168, 128 165 Z" fill="#991b1b" />
      {/* Teeth (Elegant upper white arch) */}
      <path d="M131 165.5 C142 171, 178 171, 189 165.5 C186 161.5, 134 161.5, 131 165.5" fill="#ffffff" />
      {/* Tongue (Cute dark pink lower touch) */}
      <path d="M144 182 C148 175, 172 175, 176 182 C168 186, 152 186, 144 182 Z" fill="#f43f5e" />
      {/* Smile dimples / core outlines */}
      <path d="M128 165 C125 163, 126 168, 127 169" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M192 165 C195 163, 194 168, 193 169" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* HAIR FRONT (Lovely side parts, bangs falling elegantly framing head) */}
      <path d="M96 120 C105 105, 130 96, 160 102 C190 96, 215 105, 224 120 C224 120, 228 110, 220 100 C210 90, 185 86, 160 88 C135 86, 110 90, 100 100 C92 110, 96 120, 96 120 Z" fill="url(#hairGrad)" />
      {/* Left side locks */}
      <path d="M96 112 C90 125, 92 145, 96 155 C98 145, 98 128, 96 112 Z" fill="url(#hairGrad)" />
      {/* Right side locks */}
      <path d="M224 112 C230 125, 228 145, 224 155 C222 145, 222 128, 224 112 Z" fill="url(#hairGrad)" />

      {/* HEADPHONES EAR CUPS (Deep dark stylish support headphones matching original) */}
      {/* Left ear cup */}
      <rect x="83" y="110" width="14" height="38" rx="7" fill="#111827" />
      <rect x="91" y="113" width="6" height="32" rx="3" fill="#374151" />
      <rect x="79" y="122" width="4" height="14" rx="2" fill="#4b5563" />
      
      {/* Right ear cup */}
      <rect x="223" y="110" width="14" height="38" rx="7" fill="#111827" />
      <rect x="223" y="113" width="6" height="32" rx="3" fill="#374151" />
      <rect x="237" y="122" width="4" height="14" rx="2" fill="#4b5563" />

      {/* CLOTHES: CRISP WHITE COLLAR BUTTON SHIRT */}
      <path d="M102 240 L218 240 L234 320 L86 320 Z" fill="#ffffff" />
      
      {/* Collar Left */}
      <path d="M142 210 L146 235 L120 220 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Collar Right */}
      <path d="M178 210 L174 235 L200 220 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Inner neckline shadows and buttons */}
      <path d="M146 235 L160 252 L174 235" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
      <circle cx="160" cy="270" r="2.5" fill="#cbd5e1" />
      <circle cx="160" cy="295" r="2.5" fill="#cbd5e1" />

      {/* Gold Necklace / Pendant matching the attachment */}
      <path d="M148 190 C154 204, 166 204, 172 190" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.8" />
      <rect x="158" y="200" width="4" height="4" rx="1" fill="#d97706" transform="rotate(45 160 202)" />

      {/* THE CROSSED COMFORTABLE ARMS (Identical pose to attachment) */}
      {/* Left arm sleeve */}
      <path d="M78 300 Q110 270, 160 280 Q110 320, 74 320 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      {/* Right arm sleeve */}
      <path d="M242 300 Q210 270, 160 280 Q210 320, 246 320 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      
      {/* Left wrist sleeve cuffs */}
      <path d="M110 273 L118 290" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      {/* Right wrist sleeve cuffs */}
      <path d="M210 273 L202 290" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

      {/* Clean hands tucked/placed over arms */}
      <path d="M114 278 C118 274, 134 278, 134 286 C134 288, 126 292, 114 288 Z" fill="#ffedd5" stroke="#fed7aa" strokeWidth="1" />
      <path d="M206 278 C202 274, 186 278, 186 286 C186 288, 194 292, 206 288 Z" fill="#ffedd5" stroke="#fed7aa" strokeWidth="1" />

      {/* MICROPHONE (Tilted operator microphone curving towards her lips) */}
      <path d="M86 138 C86 160, 110 185, 128 178" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="129" cy="177" r="3.5" fill="#111827" /> {/* Microphone Foam Tip */}
      <circle cx="129" cy="177" r="1.5" fill="#4b5563" />
    </svg>
  );
}
