
import React, { useState, useRef, useEffect } from 'react';
import { IPTVBrowser } from './components/IPTVBrowser';
import { MediaScreen } from './components/MediaScreen';
import { PlayerOverlay } from './components/PlayerOverlay';
import { ChannelDetailsModal } from './components/ChannelDetailsModal';
import { MediaItem, IPTVChannel } from './types';
import { activityService } from './services/activityService';

type PlayerMode = 'hidden' | 'full' | 'mini';

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [playerMode, setPlayerMode] = useState<PlayerMode>('hidden');
  const [showControls, setShowControls] = useState(true);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const currentMedia = currentIndex >= 0 ? playlist[currentIndex] : null;

  const handleIPTVSelect = (channel: IPTVChannel) => {
    activityService.incrementViews(channel.url);

    const streamItem: MediaItem = {
      id: `iptv-${Date.now()}`,
      url: channel.url,
      name: channel.name,
      type: 'stream',
      group: channel.group,
      thumbnail: channel.logo,
      originalChannel: channel
    };
    
    setPlaylist([streamItem]); // For now, we just replace the one item
    setCurrentIndex(0);
    setPlayerMode('full');
    setIsRatingModalOpen(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (playerMode === 'full' && !isRatingModalOpen) setShowControls(false);
    }, 3000);
  };

  const handleMinimize = () => {
    setPlayerMode('mini');
    setIsRatingModalOpen(false);
  };

  const handleClosePlayer = () => {
    setPlayerMode('hidden');
    setIsRatingModalOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
  };

  return (
    <div 
      className="h-screen w-screen bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden flex flex-col"
      onMouseMove={handleMouseMove}
    >
      <main className="flex-1 relative overflow-hidden">
        {/* Main Channel Browser */}
        <IPTVBrowser 
          onSelectChannel={handleIPTVSelect} 
          activeChannelId={currentMedia?.id}
        />

        {/* Unified Player Container */}
        {playerMode !== 'hidden' && currentMedia && (
          <div 
            className={`fixed transition-all duration-500 ease-in-out z-[60] shadow-2xl overflow-hidden group 
              ${playerMode === 'full' 
                ? 'inset-0 bg-black' 
                : 'bottom-8 right-8 w-80 h-48 rounded-2xl border border-zinc-800 bg-zinc-900 cursor-pointer ring-1 ring-white/5 hover:ring-orange-500/50'
              }`}
            onClick={() => playerMode === 'mini' && setPlayerMode('full')}
          >
            {/* The Video Layer */}
            <MediaScreen 
              media={currentMedia} 
              videoRef={videoRef} 
              onEnded={handleClosePlayer}
              isMini={playerMode === 'mini'}
            />
            
            {/* Fullscreen Controls Layer */}
            {playerMode === 'full' && (
              <>
                <PlayerOverlay 
                  isVisible={showControls || isRatingModalOpen}
                  mediaName={currentMedia.name}
                  mediaUrl={currentMedia.url}
                  videoRef={videoRef}
                  onBack={handleMinimize}
                  onOpenRating={() => setIsRatingModalOpen(true)}
                />

                {isRatingModalOpen && currentMedia.originalChannel && (
                  <ChannelDetailsModal 
                    channel={currentMedia.originalChannel}
                    onClose={() => setIsRatingModalOpen(false)}
                    onPlay={() => setIsRatingModalOpen(false)}
                    isMini={true}
                  />
                )}
              </>
            )}

            {/* Mini Player HUD */}
            {playerMode === 'mini' && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-white text-[10px] font-bold truncate leading-none mb-1">{currentMedia.name}</p>
                    <p className="text-zinc-400 text-[8px] uppercase tracking-wider font-mono truncate">{currentMedia.group}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleClosePlayer(); }}
                    className="bg-black/60 hover:bg-red-600 text-white p-1 rounded-lg transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                  </button>
                </div>
                <div className="flex justify-center">
                  <div className="bg-orange-600/20 text-orange-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-orange-500/20">
                    Click to expand
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
