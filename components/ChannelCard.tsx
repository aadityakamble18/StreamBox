
import React, { memo } from 'react';
import { IPTVChannel } from '../types';

interface ChannelCardProps {
    channel: IPTVChannel;
    index: number;
    activity: any;
    copyFeedback: string | null;
    onSelect: (channel: IPTVChannel) => void;
    onOpenDetails: (channel: IPTVChannel) => void;
    onShare: (e: React.MouseEvent, channel: IPTVChannel) => void;
    prefetchManifest: (url: string) => void;
}

export const ChannelCard = memo(({
    channel,
    index,
    activity,
    copyFeedback,
    onSelect,
    onOpenDetails,
    onShare,
    prefetchManifest
}: ChannelCardProps) => {
    const avg = activity.reviews?.length > 0
        ? (activity.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / activity.reviews.length).toFixed(1)
        : null;

    return (
        <div
            className="group relative bg-zinc-900/30 border border-zinc-800/40 rounded-lg sm:rounded-3xl p-2 sm:p-5 cursor-pointer hover:bg-zinc-800/60 transition-all duration-500 shadow-xl flex flex-col min-w-0"
            onMouseEnter={() => prefetchManifest(channel.url)}
        >
            <div onClick={() => onSelect(channel)} className="flex flex-col gap-2 sm:gap-4 flex-1">
                <div className="w-10 h-10 sm:w-20 sm:h-20 bg-black rounded-lg sm:rounded-2xl border border-zinc-800/50 flex items-center justify-center overflow-hidden shrink-0 self-center relative">
                    {channel.logo ? (
                        <img
                            src={channel.logo}
                            alt=""
                            loading="lazy"
                            className="max-w-full max-h-full object-contain p-1 sm:p-3"
                            onError={(e) => {
                                e.currentTarget.parentElement!.innerHTML = '<span class="text-lg sm:text-3xl opacity-20">📡</span>';
                            }}
                        />
                    ) : (
                        <span className="text-lg sm:text-3xl opacity-20">📡</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-8 sm:h-8 fill-white opacity-0 md:group-hover:opacity-100 transition-all scale-75 md:group-hover:scale-100">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                <div className="text-center min-w-0">
                    <h4 className="text-[9px] sm:text-sm font-bold text-zinc-100 truncate md:group-hover:text-orange-400 transition-colors px-0.5">
                        {channel.name}
                    </h4>
                    <p className="text-[6px] sm:text-[10px] text-zinc-500 mt-0.5 sm:mt-1 uppercase tracking-wider font-mono truncate px-0.5">{channel.group}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-white/5">
                <div className="flex items-center gap-0.5" onClick={(e) => { e.stopPropagation(); onOpenDetails(channel); }}>
                    <span className={`text-[8px] sm:text-xs font-black ${avg ? 'text-orange-500' : 'text-zinc-700'}`}>
                        {avg || '—'}
                    </span>
                    <svg viewBox="0 0 24 24" className={`w-2 h-2 sm:w-3.5 sm:h-3.5 ${avg ? 'fill-orange-500' : 'fill-zinc-700'}`}>
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={(e) => onShare(e, channel)}
                        className={`p-0.5 sm:p-2 rounded-full transition-all ${copyFeedback === channel.url ? 'bg-green-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
                    >
                        {copyFeedback === channel.url ? (
                            <svg viewBox="0 0 24 24" className="w-2 h-2 sm:w-3.5 sm:h-3.5 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current">
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenDetails(channel); }}
                        className="bg-zinc-800/80 hover:bg-orange-600 text-[6px] sm:text-[8px] font-black uppercase tracking-widest px-1 sm:px-3 py-1 rounded-full transition-all text-zinc-400 hover:text-white"
                    >
                        Rate
                    </button>
                </div>
            </div>
        </div>
    );
}, (prev, next) => {
    return prev.channel.url === next.channel.url &&
        prev.copyFeedback === next.copyFeedback &&
        JSON.stringify(prev.activity) === JSON.stringify(next.activity);
});
