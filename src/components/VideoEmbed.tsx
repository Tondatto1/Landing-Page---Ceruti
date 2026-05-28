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
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  
  const isPlaying = isPlayingExternal !== undefined ? isPlayingExternal : localIsPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayChange) {
      onPlayChange(true);
    } else {
      setLocalIsPlaying(true);
    }
  };

  if (isPlaying) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0`}
        className="w-full h-full border-0 absolute inset-0 z-10"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title}
        data-lenis-prevent="true"
      />
    );
  }

  return (
    <div 
      className="absolute inset-0 z-10 w-full h-full bg-neutral-900 cursor-pointer group"
      onClick={handlePlay}
    >
      <img 
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} 
        alt="Thumbnail" 
        loading="lazy"
        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-14 h-14 bg-[#ff0000] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.5)] group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 text-white fill-current ml-1" />
        </div>
      </div>
    </div>
  );
};
