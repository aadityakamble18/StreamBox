
import React, { useState, useEffect, useMemo } from 'react';
import { IPTVChannel, ActivityStore } from '../types';
import { fetchIPTVChannels } from '../services/iptvService';
import { activityService } from '../services/activityService';
import { ChannelDetailsModal } from './ChannelDetailsModal';

interface IPTVBrowserProps {
  onSelectChannel: (channel: IPTVChannel) => void;
  activeChannelId?: string;
}

type SortType = 'default' | 'likes' | 'dislikes' | 'views' | 'rating' | 'reviews';

export const IPTVBrowser: React.FC<IPTVBrowserProps> = ({ onSelectChannel, activeChannelId }) => {
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [sortBy, setSortBy] = useState<SortType>('default');
  const [activityStore, setActivityStore] = useState<ActivityStore>(activityService.getStore());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchIPTVChannels().then(data => {
      setChannels(data);
      setLoading(false);
    });

    const interval = setInterval(() => {
      setActivityStore(activityService.getStore());
    }, 5000);
    return () => clearInterval(interval);
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

  const filteredChannels = useMemo(() => {
    let result = [...channels];
    const query = search.toLowerCase();
    
    if (activeGroup !== 'All') {
      result = result.filter(c => c.group === activeGroup);
    }
    
    if (query) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.group.toLowerCase().includes(query)
      );
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
    
    return result.slice(0, 400);
  }, [channels, search, activeGroup, sortBy, activityStore]);

  return (
    <div className="flex h-full w-full bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-900 flex flex-col shrink-0 overflow-hidden bg-zinc-950/50">
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
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all group ${
                activeGroup === group 
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
      </aside>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 flex items-center justify-between px-10 border-b border-zinc-900 bg-black/40 backdrop-blur-2xl sticky top-0 z-20">
          <div className="relative w-full max-w-xl">
            <input 
              type="text" 
              placeholder="Search channels..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800/50 text-white pl-14 pr-6 py-4 rounded-2xl text-sm focus:outline-none focus:border-orange-500/40 transition-all shadow-inner"
            />
            <svg viewBox="0 0 24 24" className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 fill-zinc-600">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>

          <div className="flex items-center gap-4 ml-6">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Sort By</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-orange-500 appearance-none min-w-[140px]"
              >
                <option value="default">Default</option>
                <option value="views">Trending (Views)</option>
                <option value="likes">Fan Favorites (Likes)</option>
                <option value="rating">Top Rated (10/10)</option>
                <option value="reviews">Most Reviewed</option>
                <option value="dislikes">Controversial</option>
              </select>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#0a0a0a]">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-6">
               <div className="w-16 h-16 border-t-2 border-orange-500 rounded-full animate-spin"></div>
               <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Scanning Waves</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredChannels.map((channel, i) => {
                const activity = activityStore[channel.url] || { likes: 0, dislikes: 0, views: 0, reviews: [] };
                const avg = activity.reviews.length > 0 
                  ? (activity.reviews.reduce((acc, r) => acc + r.rating, 0) / activity.reviews.length).toFixed(1)
                  : null;

                return (
                  <div 
                    key={`${channel.url}-${i}`}
                    className="group relative bg-zinc-900/30 border border-zinc-800/40 rounded-3xl p-5 cursor-pointer hover:bg-zinc-800/60 transition-all duration-500 hover:-translate-y-1 shadow-xl overflow-hidden flex flex-col"
                  >
                    <div onClick={() => onSelectChannel(channel)} className="flex flex-col gap-4 flex-1">
                      <div className="w-20 h-20 bg-black rounded-2xl border border-zinc-800/50 flex items-center justify-center overflow-hidden shrink-0 self-center relative">
                        {channel.logo ? (
                          <img src={channel.logo} alt="" className="max-w-full max-h-full object-contain p-3" onError={(e) => {
                             e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl opacity-20">📡</span>';
                          }} />
                        ) : (
                          <span className="text-3xl opacity-20">📡</span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                           <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                             <path d="M8 5v14l11-7z"/>
                           </svg>
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-bold text-zinc-100 truncate group-hover:text-orange-400 transition-colors">
                          {channel.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-mono truncate">{channel.group}</p>
                      </div>
                    </div>

                    {/* Quick Interaction Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5 group/rating" onClick={(e) => { e.stopPropagation(); setSelectedChannel(channel); }}>
                        <span className={`text-xs font-black ${avg ? 'text-orange-500' : 'text-zinc-700'}`}>
                          {avg || '—'}
                        </span>
                        <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 ${avg ? 'fill-orange-500' : 'fill-zinc-700'} group-hover/rating:scale-125 transition-transform`}>
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleShare(e, channel)}
                          className={`p-2 rounded-full transition-all ${copyFeedback === channel.url ? 'bg-green-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
                          title="Share Channel"
                        >
                          {copyFeedback === channel.url ? (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                            </svg>
                          )}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedChannel(channel); }}
                          className="bg-zinc-800/80 hover:bg-orange-600 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all text-zinc-400 hover:text-white"
                        >
                          Rate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
