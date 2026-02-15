
import React, { useState, useEffect } from 'react';

interface PlayerOverlayProps {
  isVisible: boolean;
  mediaName: string;
  mediaUrl: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  onBack: () => void;
  onOpenRating: () => void;
  showCaptions: boolean;
  onToggleCaptions: () => void;
}

export const PlayerOverlay: React.FC<PlayerOverlayProps> = ({
  isVisible,
  mediaName,
  mediaUrl,
  videoRef,
  onBack,
  onOpenRating,
  showCaptions,
  onToggleCaptions
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updatePlayState = () => setIsPlaying(!video.paused);
    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);
    // Sync initial volume
    setVolume(video.volume);

    return () => {
      video.removeEventListener('play', updatePlayState);
      video.removeEventListener('pause', updatePlayState);
    };
  }, [videoRef]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `Watching ${mediaName} on StreamBox`,
      text: `Join me watching ${mediaName}!`,
      url: mediaUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.debug('Share cancelled', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${mediaName}: ${mediaUrl}`);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current?.paused) videoRef.current.play();
    else videoRef.current?.pause();
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.fullscreenElement) document.exitFullscreen();
    else videoRef.current?.parentElement?.requestFullscreen();
  };

  return (
    <div className={`absolute inset-0 z-10 transition-opacity duration-700 pointer-events-none flex flex-col justify-between p-4 sm:p-10 ${isVisible ? 'opacity-100 cursor-default' : 'opacity-0 cursor-none'
      }`}>
      {/* Top Header */}
      <div className="flex items-center justify-between pointer-events-auto gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 font-bold transition-all border border-white/10 group text-xs sm:text-base"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current group-hover:-translate-y-1 transition-transform rotate-180">
            <path d="M11 5H5v6h2V7h4V5zm1 0h6v6h-2V7h-4V5zM5 19v-6h2v4h4v2H5zm12-2h-4v2h6v-6h-2v4z" />
          </svg>
          <span className="hidden xs:inline">Minimize</span>
        </button>

        <div className="bg-black/40 backdrop-blur-md border border-white/5 px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center min-w-0 flex-1 mx-2">
          <p className="text-orange-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Live Stream</p>
          <h2 className="text-white font-bold text-xs sm:text-lg truncate w-full text-center">{mediaName}</h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleShare}
            className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all border pointer-events-auto shadow-lg ${copyFeedback ? 'bg-green-600 border-green-500 text-white' : 'bg-zinc-800/50 hover:bg-zinc-800 backdrop-blur-md border-white/10 text-white'}`}
          >
            {copyFeedback ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
              </svg>
            )}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onOpenRating(); }}
            className="bg-orange-600 hover:bg-orange-500 text-white p-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 font-bold transition-all border border-orange-500/50 pointer-events-auto shadow-lg shadow-orange-600/30 text-xs sm:text-base"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="hidden sm:inline">Rate</span>
          </button>
        </div>
      </div>

      {/* Central Play Indicator */}
      <div className="flex-1 flex items-center justify-center">
        {!isPlaying && (
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-orange-600/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-orange-500/50 animate-pulse pointer-events-auto" onClick={togglePlay}>
            <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-12 sm:h-12 fill-orange-500 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center pointer-events-auto w-full">
        <div className="bg-zinc-900/60 backdrop-blur-2xl border border-white/10 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl sm:rounded-3xl flex items-center gap-6 sm:gap-10 shadow-2xl max-w-full overflow-hidden">
          <button onClick={togglePlay} className="text-white hover:text-orange-500 transition-colors shrink-0">
            {isPlaying ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 fill-current"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 fill-current"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Volume Slider - Hidden on Mobile, refined design for Desktop */}
          <div className="hidden sm:flex items-center gap-4 group shrink-0 relative">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-zinc-400 group-hover:fill-white transition-colors">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <div className="relative w-24 h-6 flex items-center">
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (videoRef.current) videoRef.current.volume = v;
                }}
                className="absolute inset-0 w-full h-1 bg-zinc-800 rounded-full cursor-pointer appearance-none accent-orange-500 z-10"
                style={{
                  background: `linear-gradient(to right, #ea580c ${volume * 100}%, #27272a ${volume * 100}%)`
                }}
              />
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onToggleCaptions(); }}
            className={`transition-colors shrink-0 flex flex-col items-center gap-0.5 ${showCaptions ? 'text-orange-500' : 'text-zinc-500 hover:text-white'}`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
              <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5V10h-2v4h2v-1H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5V10h-2v4h2v-1H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z" />
            </svg>
            <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-tighter leading-none">CC</span>
          </button>

          <button onClick={toggleFullscreen} className="text-zinc-400 hover:text-white transition-colors shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 2px solid #ea580c;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          transition: transform 0.1s ease;
        }
        input[type=range]:hover::-webkit-slider-thumb {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};
