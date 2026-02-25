import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { IPTVBrowser } from './components/IPTVBrowser';
import { YouTubeWatch } from './components/YouTubeWatch';
import { AuthPage } from './components/AuthPage';
import { AboutPage } from './components/AboutPage';
import { Header } from './components/Header';
import { IPTVChannel, MediaItem } from './types';
import { activityService } from './services/activityService';
import { MediaScreen } from './components/MediaScreen';
import { fetchIPTVChannels } from './services/iptvService';

type ViewMode = 'home' | 'watch';

// PERSISTENT PLAYER ENGINE (Never Unmounts during view swaps)
const TeleportingPlayer: React.FC<{
  channel: IPTVChannel;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isMini: boolean;
  viewMode: ViewMode;
  onEnded: () => void;
}> = ({ channel, videoRef, isMini, viewMode, onEnded }) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Determine where to land the player based on current view
    const findTarget = () => {
      const id = viewMode === 'watch' ? 'full-player-portal' : (isMini ? 'mini-player-slot' : null);
      if (!id) return null;
      return document.getElementById(id);
    };

    // Small delay to ensure the component rendering the target has mounted
    const timer = setTimeout(() => {
      setTarget(findTarget());
    }, 50);

    return () => clearTimeout(timer);
  }, [viewMode, isMini]);

  const playerContent = useMemo(() => (
    <MediaScreen
      media={{
        id: channel.url,
        url: channel.url,
        name: channel.name,
        type: 'stream',
        group: channel.group,
        thumbnail: channel.logo
      }}
      videoRef={videoRef}
      onEnded={onEnded}
      isMini={isMini}
    />
  ), [channel.url, isMini, onEnded]);

  if (!target) return null;
  return createPortal(playerContent, target);
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [allChannels, setAllChannels] = useState<IPTVChannel[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);

  // URL SYNC & DEEP LINKING ENGINE
  useEffect(() => {
    const initApp = async () => {
      const channels = await fetchIPTVChannels();
      setAllChannels(channels);

      const syncFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const watchUrl = params.get('v');
        if (watchUrl) {
          const found = channels.find(c => c.url === watchUrl);
          if (found) {
            setSelectedChannel(found);
            setViewMode('watch');
            setIsMiniPlayer(false);
          }
        } else {
          setViewMode('home');
          // Don't clear selectedChannel if it exists (might be in mini player)
        }
      };

      syncFromUrl();
      window.addEventListener('popstate', syncFromUrl);
    };

    initApp();
    return () => window.removeEventListener('popstate', (e) => { });
  }, []);

  const updateUrl = (mode: ViewMode, channel: IPTVChannel | null) => {
    const url = new URL(window.location.href);
    if (mode === 'watch' && channel) {
      url.searchParams.set('v', channel.url);
    } else {
      url.searchParams.delete('v');
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleSelectChannel = (channel: IPTVChannel) => {
    activityService.incrementViews(channel.url);
    setSelectedChannel(channel);
    setViewMode('watch');
    setIsMiniPlayer(false);
    updateUrl('watch', channel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    if (viewMode === 'watch' && selectedChannel) {
      setIsMiniPlayer(true);
    }
    setViewMode('home');
    updateUrl('home', null);
  };

  const closeMiniPlayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMiniPlayer(false);
    setSelectedChannel(null);
  };

  const expandMiniPlayer = () => {
    setViewMode('watch');
    setIsMiniPlayer(false);
  };

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] text-zinc-100 font-sans flex flex-col overflow-hidden">
      <Header
        onSearch={setSearchQuery}
        onOpenAuth={() => setShowAuth(true)}
        onGoHome={handleGoHome}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* THE PERSISTENT HEARTBEAT */}
        {selectedChannel && (
          <TeleportingPlayer
            channel={selectedChannel}
            videoRef={videoRef}
            isMini={isMiniPlayer}
            viewMode={viewMode}
            onEnded={() => setIsMiniPlayer(false)}
          />
        )}

        {viewMode === 'home' && (
          <IPTVBrowser
            onSelectChannel={handleSelectChannel}
            searchQuery={searchQuery}
            isSidebarOpen={isSidebarOpen}
            onOpenAbout={() => setIsAboutOpen(true)}
          />
        )}

        {viewMode === 'watch' && selectedChannel && (
          <YouTubeWatch
            channel={selectedChannel}
            videoRef={videoRef}
            onClose={handleGoHome}
            sidebar={
              <div className="flex flex-col h-full bg-[#0f0f0f] p-2">
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 px-2">More Like This</h3>
                <IPTVBrowser
                  onSelectChannel={handleSelectChannel}
                  layout="sidebar"
                  filterGroup={selectedChannel.group}
                />
              </div>
            }
          />
        )}

        {/* Mini Player Slot */}
        {isMiniPlayer && selectedChannel && viewMode === 'home' && (
          <div
            onClick={expandMiniPlayer}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 w-72 h-48 bg-[#1f1f1f] rounded-xl overflow-hidden shadow-2xl border border-white/5 z-[90] group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div id="mini-player-slot" className="h-[75%] bg-black relative">
              {/* Expansion Catcher: Ensures clicks on the portal video bubble correctly to expand */}
              <div className="absolute inset-0 z-10 cursor-pointer"></div>

              <div className="absolute top-2 right-2 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={closeMiniPlayer} className="p-1.5 bg-black/60 hover:bg-black rounded-full text-white transition-all active:scale-90">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                </button>
              </div>
            </div>
            <div className="h-[25%] p-3 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-white truncate leading-none mb-1">{selectedChannel.name}</p>
                <p className="text-[8px] text-zinc-500 uppercase tracking-tighter">{selectedChannel.group}</p>
              </div>
            </div>
          </div>
        )}

        {showAuth && (
          <AuthPage
            onClose={() => setShowAuth(false)}
            onSuccess={() => setShowAuth(false)}
          />
        )}

        {isAboutOpen && (
          <AboutPage onClose={() => setIsAboutOpen(false)} />
        )}
      </main>


      <footer className="shrink-0 bg-black border-t border-zinc-900 px-4 sm:px-8 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAboutOpen(true)}
            className="text-[10px] text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest"
          >
            About StreamBox
          </button>
          <div className="w-px h-3 bg-zinc-800 hidden sm:block"></div>
          <p className="hidden sm:block text-[10px] text-zinc-600 font-mono">
            © {new Date().getFullYear()} StreamBox Core
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[7px] text-orange-600 font-black uppercase tracking-widest leading-none mb-0.5">Build Verified</span>
            <span className="text-[10px] text-white font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
              v1.8.1-PRO
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
