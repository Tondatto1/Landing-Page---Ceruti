import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { VideoTestimonial } from '../types';

interface VideoCarouselProps {
  videos: VideoTestimonial[];
  aspectRatio?: 'landscape' | 'portrait';
}

export const VideoCarousel: React.FC<VideoCarouselProps> = ({ videos, aspectRatio = 'landscape' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const firstCard = scrollRef.current.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth : 320;
    const index = Math.round(scrollLeft / (cardWidth + 24));
    setCurrentIndex(Math.min(Math.max(0, index), videos.length - 1));
  };

  useEffect(() => {
    let tick = false;
    const handleScroll = () => {
      if (!tick) {
        requestAnimationFrame(() => {
          checkScroll();
          tick = false;
        });
        tick = true;
      }
    };

    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [videos]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth : 320;
    const scrollAmount = direction === 'left' ? -(cardWidth + 24) : (cardWidth + 24);
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (idx: number) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth : 320;
    scrollRef.current.scrollTo({ left: idx * (cardWidth + 24), behavior: 'smooth' });
  };

  const isPortrait = aspectRatio === 'portrait';

  return (
    <div className="relative group">
      {/* Controls header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <span className="bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-full text-[11px]">
            {currentIndex + 1} de {videos.length} depoimentos
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Vídeo anterior"
            className={`p-2.5 rounded-full border transition-all ${
              canScrollLeft
                ? 'bg-white border-slate-200/90 text-slate-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-sm cursor-pointer'
                : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Próximo vídeo"
            className={`p-2.5 rounded-full border transition-all ${
              canScrollRight
                ? 'bg-white border-slate-200/90 text-slate-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-sm cursor-pointer'
                : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video, idx) => {
          const isPlaying = playingVideoId === video.id;
          const thumbnailUrl = isPortrait
            ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
            : `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

          return (
            <div
              key={video.id}
              className={`shrink-0 snap-start bg-white border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center ${
                isPortrait 
                  ? 'w-[260px] sm:w-[280px]' 
                  : 'w-[300px] sm:w-[360px] lg:w-[400px]'
              }`}
            >
              <div
                className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 group/thumb ${
                  isPortrait ? 'aspect-[9/16]' : 'aspect-video'
                }`}
              >
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                    title={`${video.title} - ${idx + 1}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <button
                    onClick={() => setPlayingVideoId(video.id)}
                    aria-label={`Assistir ${video.title}`}
                    className="relative w-full h-full block cursor-pointer overflow-hidden group/btn"
                  >
                    <img
                      src={thumbnailUrl}
                      alt={video.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover/btn:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 group-hover/btn:bg-slate-900/20 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover/btn:scale-110 transition-all duration-300">
                        <Play className="w-7 h-7 fill-white ml-1" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
              <div className="mt-3 px-1 w-full flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-emerald-700 truncate">
                  <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 shrink-0" />
                  <span className="truncate">{video.title}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                  #{idx + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        {videos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            aria-label={`Ir para vídeo ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx
                ? 'w-6 bg-emerald-600'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
