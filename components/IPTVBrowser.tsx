
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { IPTVChannel, ActivityStore } from '../types';
import { fetchIPTVChannels } from '../services/iptvService';
import { activityService } from '../services/activityService';
import { ChannelDetailsModal } from './ChannelDetailsModal';
import { ChannelCard } from './ChannelCard';
import { AboutPage } from './AboutPage';

interface IPTVBrowserProps {
  onSelectChannel: (channel: IPTVChannel) => void;
  activeChannelId?: string;
}

type SortType = 'default' | 'likes' | 'dislikes' | 'views' | 'rating' | 'reviews';

export const IPTVBrowser: React.FC<IPTVBrowserProps> = ({ onSelectChannel, activeChannelId }) => {
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [sortBy, setSortBy] = useState<SortType>('default');
  const [activityStore, setActivityStore] = useState<ActivityStore>(activityService.getStore());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Debounced Search Algorithm
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchIPTVChannels().then(data => {
      setChannels(data);
      setLoading(false);
    });

    // 1. Initial global sync
    activityService.fetchAllActivity().then(store => {
      setActivityStore(store);
    });

    // 2. Real-time subscription algorithm
    const subscription = activityService.subscribe((freshStore) => {
      setActivityStore(freshStore);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleShare = async (e: React.MouseEvent, channel: IPTVChannel) => {
    e.stopPropagation();
    const shareData = {
      title: `Watch ${channel.name} on StreamBox`,
      text: `Check out this live channel: ${channel.name}`,
      url: channel.url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.debug('Share failed or cancelled', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${channel.name}: ${channel.url}`);
        setCopyFeedback(channel.url);
        setTimeout(() => setCopyFeedback(null), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const handleSelectChannel = async (channel: IPTVChannel) => {
    onSelectChannel(channel);
    await activityService.incrementViews(channel.url);
  };

  const groups = useMemo(() => {
    const counts: Record<string, number> = {};
    channels.forEach(c => {
      counts[c.group] = (counts[c.group] || 0) + 1;
    });
    const sortedGroups = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
    return ['All', ...sortedGroups];
  }, [channels]);

  // 2. Fuzzy Search & Optimized Filtering Logic
  const filteredChannels = useMemo(() => {
    let result = [...channels];
    const query = debouncedSearch.toLowerCase().trim();

    if (activeGroup !== 'All') {
      result = result.filter(c => c.group === activeGroup);
    }

    if (query) {
      // Fuzzy score algorithm: Higher score = better match
      const scoredResults = result.map(c => {
        const name = c.name.toLowerCase();
        const group = c.group.toLowerCase();
        let score = 0;

        if (name === query) score += 100;
        else if (name.startsWith(query)) score += 50;
        else if (name.includes(query)) score += 20;

        if (group.includes(query)) score += 5;

        return { channel: c, score };
      });

      result = scoredResults
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(r => r.channel);
    }

    if (sortBy !== 'default') {
      result.sort((a, b) => {
        const actA = activityStore[a.url] || { likes: 0, dislikes: 0, views: 0, reviews: [] };
        const actB = activityStore[b.url] || { likes: 0, dislikes: 0, views: 0, reviews: [] };

        switch (sortBy) {
          case 'likes': return (actB.likes || 0) - (actA.likes || 0);
          case 'dislikes': return (actB.dislikes || 0) - (actA.dislikes || 0);
          case 'views': return (actB.views || 0) - (actA.views || 0);
          case 'reviews': return (actB.reviews?.length || 0) - (actA.reviews?.length || 0);
          case 'rating': {
            const getAvg = (act: any) => act.reviews.length > 0
              ? act.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / act.reviews.length
              : 0;
            return getAvg(actB) - getAvg(actA);
          }
          default: return 0;
        }
      });
    }

    return result;
  }, [channels, debouncedSearch, activeGroup, sortBy, activityStore]);

  // 3. Simple Virtualization (Infinite Scroll) logic
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      setVisibleCount(prev => Math.min(prev + 40, filteredChannels.length));
    }
  }, [filteredChannels.length]);

  // 4. Adaptive Segment Prefetching
  const prefetchManifest = useCallback((url: string) => {
    if (url.endsWith('.m3u8')) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    }
  }, []);

  const visibleChannels = useMemo(() => {
    return filteredChannels.slice(0, visibleCount);
  }, [filteredChannels, visibleCount]);

  useEffect(() => {
    setVisibleCount(40);
  }, [activeGroup, debouncedSearch]);

  return (
    <div className="flex h-full w-full bg-[#0a0a0a] overflow-hidden">
      {/* Side Curtain (Sidebar) */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-zinc-900 bg-zinc-950/50 transition-all duration-500 ease-in-out relative ${isSidebarOpen ? 'w-72' : 'w-0 border-r-0'
          }`}
      >
        <div className={`flex flex-col h-full transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 overflow-hidden'}`}>
          <div className="p-8">
            <h1 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-2">
              STREAM<span className="text-orange-600">BOX</span>
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-10">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4 mb-2">Categories</p>
            {groups.map(group => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all group ${activeGroup === group
                  ? 'bg-orange-600/10 text-orange-500 font-bold'
                  : 'text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-200'
                  }`}
              >
                <span className="truncate">{group}</span>
                {group !== 'All' && (
                  <span className="text-[9px] font-mono text-zinc-700 group-hover:text-zinc-500">
                    {channels.filter(c => c.group === group).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-zinc-900">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all group"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
              <span className="font-bold">About StreamBox</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Search and Sort */}
        <header className="shrink-0 flex flex-col px-4 sm:px-10 pt-4 pb-3 border-b border-zinc-900 bg-black/40 backdrop-blur-2xl z-20">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              {/* Toggle Sidebar Button (Desktop Only) */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-orange-500 transition-colors"
                title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
              >
                <svg viewBox="0 0 24 24" className={`w-5 h-5 fill-current transition-transform duration-500 ${!isSidebarOpen ? 'rotate-180' : ''}`}>
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                </svg>
              </button>

              <h1 className="md:hidden text-lg font-black italic tracking-tighter text-white shrink-0">
                STREAM<span className="text-orange-600">BOX</span>
              </h1>
            </div>

            <div className="relative w-full max-w-xl mx-2">
              <input
                type="text"
                placeholder="Search channels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800/50 text-white pl-9 sm:pl-14 pr-4 sm:pr-6 py-2 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm focus:outline-none focus:border-orange-500/40 transition-all shadow-inner"
              />
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-6 sm:h-6 absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 fill-zinc-600">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-orange-500 appearance-none min-w-[120px]"
                >
                  <option value="default">Default</option>
                  <option value="views">Trending</option>
                  <option value="likes">Fan Favorites</option>
                  <option value="rating">Top Rated</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Categories - Horizontal Scroll */}
          <div className="md:hidden flex overflow-x-auto gap-1.5 no-scrollbar py-1">
            {groups.map(group => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`shrink-0 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${activeGroup === group
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-900 text-zinc-500'
                  }`}
              >
                {group}
              </button>
            ))}
          </div>
        </header>

        {/* Scrollable Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-2 sm:p-10 custom-scrollbar bg-[#0a0a0a]"
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-t-2 border-orange-500 rounded-full animate-spin"></div>
              <p className="text-zinc-500 font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] animate-pulse">Scanning Waves</p>
            </div>
          ) : (
            <div className={`grid grid-cols-2 gap-2 sm:gap-6 ${isSidebarOpen
              ? 'lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
              : 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
              }`}>
              {visibleChannels.map((channel, i) => (
                <ChannelCard
                  key={`${channel.url}-${i}`}
                  channel={channel}
                  index={i}
                  activity={activityStore[channel.url] || { likes: 0, dislikes: 0, views: 0, reviews: [] }}
                  copyFeedback={copyFeedback}
                  onSelect={handleSelectChannel}
                  onOpenDetails={setSelectedChannel}
                  onShare={handleShare}
                  prefetchManifest={prefetchManifest}
                />
              ))}
            </div>
          )}
        </div>

        {/* Persistent Footer */}
        <footer className="shrink-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-4 sm:px-10 py-3 sm:py-5 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <span className="text-[8px] sm:text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em] whitespace-nowrap">
              Made with ⚡ for the Web
            </span>
            <div className="hidden sm:block w-px h-3 bg-zinc-800"></div>
            <p className="hidden sm:block text-[10px] text-zinc-600 font-mono">
              © {new Date().getFullYear()} StreamBox
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-[7px] sm:text-[9px] text-orange-600 font-black uppercase tracking-widest leading-none mb-0.5">Build Status</span>
              <span className="text-[9px] sm:text-xs text-white font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                v1.5.0
              </span>
            </div>
          </div>
        </footer>
      </div>

      {isAboutOpen && (
        <AboutPage onClose={() => setIsAboutOpen(false)} />
      )}

      {selectedChannel && (
        <ChannelDetailsModal
          channel={selectedChannel}
          onClose={() => {
            setSelectedChannel(null);
            setActivityStore(activityService.getStore());
          }}
          onPlay={() => {
            onSelectChannel(selectedChannel);
            setSelectedChannel(null);
          }}
        />
      )}
    </div>
  );
};
