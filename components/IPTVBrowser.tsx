
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { IPTVChannel, ActivityStore } from '../types';
import { fetchIPTVChannels } from '../services/iptvService';
import { activityService } from '../services/activityService';
import { ChannelCard } from './ChannelCard';

interface IPTVBrowserProps {
  onSelectChannel: (channel: IPTVChannel) => void;
  searchQuery?: string;
  layout?: 'home' | 'sidebar';
  isSidebarOpen?: boolean;
  onOpenAbout?: () => void;
  filterGroup?: string;
}

export const IPTVBrowser: React.FC<IPTVBrowserProps> = ({
  onSelectChannel,
  searchQuery = '',
  layout = 'home',
  isSidebarOpen = true,
  onOpenAbout,
  filterGroup
}) => {
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(filterGroup || 'All');
  const [activityStore, setActivityStore] = useState<ActivityStore>(activityService.getStore());
  const [visibleCount, setVisibleCount] = useState(40);

  useEffect(() => {
    setVisibleCount(40);
  }, [searchQuery, activeGroup]);

  useEffect(() => {
    fetchIPTVChannels().then(data => {
      setChannels(data);
      setLoading(false);
    });
    activityService.fetchAllActivity().then(setActivityStore);
    const subscription = activityService.subscribe(setActivityStore);
    return () => subscription.unsubscribe();
  }, []);

  const groups = useMemo(() => {
    const allGroups = new Set<string>();
    channels.forEach(c => {
      if (c.group) {
        c.group.split(/[;,]/).forEach(g => {
          const trimmed = g.trim();
          if (trimmed) allGroups.add(trimmed);
        });
      }
    });

    const sortedGroups = Array.from(allGroups).sort((a, b) => a.localeCompare(b));
    return ['All', ...sortedGroups];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    let result = [...channels];
    const query = searchQuery.toLowerCase().trim();

    // If searching, search across ALL categories for better discovery
    // but keep showing the filtered list if no search is active
    if (query) {
      const terms = query.split(/\s+/);
      result = result.filter(c => {
        const name = c.name.toLowerCase();
        const group = c.group.toLowerCase();
        const country = (c.country || '').toLowerCase();
        return terms.every(term =>
          name.includes(term) ||
          group.includes(term) ||
          country.includes(term)
        );
      });

      // Rank results: Start-of-name matches first
      result.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aName.localeCompare(bName);
      });
    } else if (activeGroup !== 'All') {
      result = result.filter(c => {
        const channelGroups = c.group.split(/[;,]/).map(g => g.trim());
        return channelGroups.includes(activeGroup);
      });
    }

    return result;
  }, [channels, searchQuery, activeGroup]);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = document.querySelector('main.overflow-y-auto');

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setVisibleCount(prev => {
            const next = Math.min(prev + 60, filteredChannels.length);
            return next;
          });
        }
      },
      {
        threshold: 0,
        root: scrollContainer,
        rootMargin: '800px'
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredChannels.length, loading, activeGroup, searchQuery]);

  const visibleChannels = useMemo(() => {
    return filteredChannels.slice(0, visibleCount);
  }, [filteredChannels, visibleCount]);

  if (layout === 'sidebar') {
    return (
      <div className="flex-1 space-y-2 px-1">
        {visibleChannels.map((channel, i) => (
          <ChannelCard
            key={`${channel.url}-${i}`}
            channel={channel}
            activity={activityStore[channel.url] || { views: 0 }}
            onSelect={onSelectChannel}
            layout="sidebar"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#0a0a0a]">
      {/* Sidebar Categories */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-zinc-900 bg-[#0f0f0f] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 border-r-0'}`}
      >
        <div className={`flex flex-col h-full transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 overflow-hidden'}`}>
          <div className="p-6">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Categories</h3>
            <div className="space-y-1 pr-2 pb-10">
              {groups.map(group => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${activeGroup === group
                    ? 'bg-orange-600/10 text-orange-500 font-bold'
                    : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                    }`}
                >
                  <span className="truncate">{group}</span>
                  <span className="text-[9px] font-mono opacity-40">
                    {group === 'All' ? channels.length : channels.filter(c => c.group === group).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-zinc-900 mt-auto">
            <button
              onClick={onOpenAbout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs text-zinc-500 hover:bg-zinc-800 hover:text-white transition-all font-bold"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
              About
            </button>
          </div>
        </div>
      </aside>

      {/* Grid Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="flex-1 p-4 sm:p-8"
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
              <div className="w-10 h-10 border-2 border-zinc-700 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Synching Stream</p>
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-6 ${isSidebarOpen
              ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'
              }`}>
              {visibleChannels.map((channel, i) => (
                <ChannelCard
                  key={`${channel.url}-${i}`}
                  channel={channel}
                  activity={activityStore[channel.url] || { views: 0 }}
                  onSelect={onSelectChannel}
                  layout="grid"
                />
              ))}
            </div>
          )}
          {/* Intersection Observer Target */}
          <div ref={observerTarget} className="h-20 w-full flex items-center justify-center">
            {visibleCount < filteredChannels.length && (
              <div className="w-6 h-6 border-2 border-zinc-800 border-t-orange-500 rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
