import React, { useState } from 'react';
import { Play } from 'lucide-react';

export const VideoEmbed = ({ 
  videoId, 
  title = "Depoimento com o Ceruti",
  isPlayingExternal,
  onPlayChange
}: { 
  videoId: string; 
  title?: string;
  isPlayingExternal?: boolean;
  onPlayChange?: (playing: boolean) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    if (onPlayChange) {
      onPlayChange(true);
    }
  };

  if (isPlaying) {
    return (
      <div className="absolute inset-0 z-10 w-full h-full bg-neutral-950">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3`}
          className="w-full h-full border-0 absolute inset-0 z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          loading="lazy"
          data-lenis-prevent="true"
        />
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 z-10 w-full h-full bg-neutral-900 cursor-pointer group flex flex-col items-center justify-center overflow-hidden select-none"
      onClick={handlePlay}
    >
      {/* Cinematic dark thumbnail with overlay */}
      <img 
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
        alt={title} 
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
      />
      
      {/* Radial soft dark overlay/vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      {/* Styled custom play button inspired by premium fitness/streaming players */}
      <div className="relative z-20 flex flex-col items-center gap-4">
        {/* Pulsing play icon container */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring outer */}
          <div className="absolute h-20 w-20 rounded-full bg-[#00a83e]/30 scale-125 animate-pulse" />
          
          {/* Main button circle */}
          <div className="w-16 h-16 bg-gradient-to-tr from-[#00a83e] to-[#00c853] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,168,62,0.6)] group-hover:scale-110 transition-transform duration-300">
            <Play className="w-7 h-7 text-white fill-current ml-1" />
          </div>
        </div>

        {/* Informative tap action text */}
        <span className="text-white font-sans font-extrabold uppercase text-[11px] tracking-[0.15em] bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
          Assistir Depoimento
        </span>
      </div>

      {/* Subtitle at bottom of player */}
      <div className="absolute bottom-6 left-0 right-0 z-20 text-center px-4 pointer-events-none">
        <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-white/50">
          Toque para ver o vídeo
        </p>
      </div>
    </div>
  );
};
