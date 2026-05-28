import React from 'react';

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
  return (
    <div className="absolute inset-0 z-10 w-full h-full bg-neutral-950">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
        className="w-full h-full border-0 absolute inset-0 z-10"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title}
        loading="lazy"
        data-lenis-prevent="true"
      />
    </div>
  );
};

