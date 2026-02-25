
import React, { memo } from 'react';
import { IPTVChannel } from '../types';

interface ChannelCardProps {
    channel: IPTVChannel;
    activity: any;
    onSelect: (channel: IPTVChannel) => void;
    layout?: 'grid' | 'sidebar';
}

export const ChannelCard = memo(({
    channel,
    activity,
    onSelect,
    layout = 'grid'
}: ChannelCardProps) => {

    if (layout === 'sidebar') {
        return (
            <div
                onClick={() => onSelect(channel)}
                className="group cursor-pointer flex gap-3 mb-3 p-1 rounded-xl hover:bg-white/5 transition-colors"
            >
                <div className="aspect-video w-[140px] bg-[#000] rounded-lg overflow-hidden shrink-0 relative">
                    {channel.logo ? (
                        <img src={channel.logo} alt="" className="w-full h-full object-contain p-2" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-xl">📡</div>
                    )}
                </div>
                <div className="flex flex-col min-w-0 py-0.5">
                    <h4 className="text-[12px] font-bold text-white line-clamp-2 mb-1 group-hover:text-orange-500 transition-colors">
                        {channel.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 mb-0.5">{channel.group}</p>
                    <span className="text-[10px] text-zinc-600 font-mono truncate">{activity.views || 0} views</span>
                </div>
            </div>
        );
    }

    // Grid Layout (The "Normal" preferred look)
    return (
        <div
            onClick={() => onSelect(channel)}
            className="group relative bg-zinc-900/30 border border-zinc-800/40 rounded-3xl p-4 sm:p-5 cursor-pointer hover:bg-zinc-800/60 transition-all duration-500 shadow-xl flex flex-col min-w-0"
        >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-2xl border border-zinc-800/50 flex items-center justify-center overflow-hidden shrink-0 self-center relative mb-4">
                {channel.logo ? (
                    <img src={channel.logo} alt="" className="max-w-full max-h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <span className="text-3xl opacity-20">📡</span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-orange-600/10 transition-colors"></div>
            </div>

            <div className="text-center min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate group-hover:text-orange-500 transition-colors mb-1">
                    {channel.name}
                </h4>
                <p className="text-[8px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-mono truncate">{channel.group}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-4 text-[8px] sm:text-[10px] font-black text-zinc-600">
                <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                    {activity.views || 0} VISITS
                </span>
                {activity.likes > 0 && (
                    <span className="text-orange-600/60">{activity.likes} LIKES</span>
                )}
            </div>
        </div>
    );
});
