
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IPTVChannel, ChannelActivity, MediaItem } from '../types';
import { activityService } from '../services/activityService';
import { authService } from '../services/authService';
import { MediaScreen } from './MediaScreen';

interface YouTubeWatchProps {
    channel: IPTVChannel;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    onClose: () => void;
    sidebar: React.ReactNode;
}

export const YouTubeWatch: React.FC<YouTubeWatchProps> = ({
    channel,
    videoRef,
    onClose,
    sidebar
}) => {
    const [activity, setActivity] = useState<ChannelActivity>(activityService.getChannelActivity(channel.url));
    const [reviewText, setReviewText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

    // Player specific states
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        authService.getCurrentUser().then(setUser);
    }, []);

    useEffect(() => {
        setActivity(activityService.getChannelActivity(channel.url));
        const subscription = activityService.subscribe((freshStore) => {
            if (freshStore[channel.url]) {
                setActivity(freshStore[channel.url]);
            }
        });
        return () => subscription.unsubscribe();
    }, [channel.url]);

    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            if (document.fullscreenElement) {
                setShowControls(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const handleMouseMove = () => {
        if (isFullscreen) return;
        setShowControls(true);
        if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = window.setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    const toggleFullscreen = () => {
        const container = document.getElementById('player-container');
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
            setIsMuted(val === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            videoRef.current.muted = nextMuted;
            if (!nextMuted && volume === 0) {
                setVolume(0.5);
                videoRef.current.volume = 0.5;
            }
        }
    };

    const triggerToast = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast({ message: '', visible: false }), 3000);
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            triggerToast('Link copied to clipboard!');
        });
    };

    const handleToggleFavorite = () => {
        const nextState = !isFavorite;
        setIsFavorite(nextState);
        triggerToast(nextState ? `Added to Favorites` : 'Removed from Favorites');
    };

    const handleTogglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };


    const handleLike = async () => {
        if (!user) return;
        const currentlyLiked = activity.userLiked || false;
        const currentlyDisliked = activity.userDisliked || false;
        setActivity(prev => ({
            ...prev,
            likes: currentlyLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1,
            dislikes: (!currentlyLiked && currentlyDisliked) ? Math.max(0, prev.dislikes - 1) : prev.dislikes,
            userLiked: !currentlyLiked,
            userDisliked: !currentlyLiked ? false : currentlyDisliked
        }));
        await activityService.toggleLike(channel.url, currentlyLiked, currentlyDisliked);
    };

    const handleDislike = async () => {
        if (!user) return;
        const currentlyDisliked = activity.userDisliked || false;
        const currentlyLiked = activity.userLiked || false;
        setActivity(prev => ({
            ...prev,
            dislikes: currentlyDisliked ? Math.max(0, prev.dislikes - 1) : prev.dislikes + 1,
            likes: (!currentlyDisliked && currentlyLiked) ? Math.max(0, prev.likes - 1) : prev.likes,
            userDisliked: !currentlyDisliked,
            userLiked: !currentlyDisliked ? false : currentlyLiked
        }));
        await activityService.toggleDislike(channel.url, currentlyDisliked, currentlyLiked);
    };

    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !reviewText.trim()) return;
        const text = reviewText.trim();
        const newComment: any = {
            id: 'temp-' + Date.now(),
            userId: user.id,
            username: user.username,
            text,
            rating: 10,
            date: new Date().toISOString()
        };
        setActivity(prev => ({ ...prev, reviews: [newComment, ...prev.reviews] }));
        setReviewText('');
        setIsFocused(false);
        try {
            await activityService.addReview(channel.url, text, 10, { id: user.id, username: user.username });
        } catch (err) { console.error("Failed to post comment", err); }
    };

    const timeAgo = (date: string) => {
        const now = new Date().getTime();
        const past = new Date(date).getTime();
        if (isNaN(past)) return "recently";
        const seconds = Math.floor((now - past) / 1000);
        if (seconds < 5) return "just now";
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const mediaItem: MediaItem = useMemo(() => ({
        id: channel.url,
        url: channel.url,
        name: channel.name,
        type: 'stream',
        group: channel.group,
        thumbnail: channel.logo
    }), [channel.url, channel.name, channel.group, channel.logo]);

    return (
        <div className={`flex-1 flex flex-col ${isTheaterMode ? '' : 'lg:flex-row'} bg-[#0f0f0f]`}>
            {/* Main Column: Player, Info, and integrated theater recommendations */}
            <div className={`transition-all duration-500 ${isTheaterMode ? 'w-full' : 'flex-1 min-w-0'}`}>
                {/* 1. Player Section */}
                <div
                    id="player-container"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => setShowControls(false)}
                    className={`bg-black relative group flex items-center justify-center transition-all duration-500 ease-in-out ${isTheaterMode
                        ? 'w-full h-[60vh] sm:h-[70vh] lg:h-[80vh]'
                        : 'aspect-video w-full lg:max-w-[1280px] lg:mx-auto sm:p-4'
                        }`}
                >
                    <div id="full-player-portal" className="w-full h-full"></div>

                    {/* Ghost Interaction Layer: Captures mouse events even if portal content blocks them */}
                    <div
                        className="absolute inset-0 z-[40] cursor-pointer"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setShowControls(true)}
                        onClick={handleTogglePlay}
                    ></div>

                    {/* Premium YouTube-Style Overlay Controls */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-[60] flex flex-col justify-end transition-all duration-300 ${showControls && !isFullscreen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                        <div className="p-4 sm:p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={handleTogglePlay}
                                        className="text-white hover:text-orange-500 active:scale-90 transition-all duration-300 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                        title={isPlaying ? "Pause (k)" : "Play (k)"}
                                    >
                                        {isPlaying ? (
                                            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-current"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-current"><path d="M8 5v14l11-7z" /></svg>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-3 group/volume relative">
                                        <button onClick={toggleMute} className="text-white/90 hover:text-white transition-colors drop-shadow-md">
                                            {isMuted || volume === 0 ? (
                                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.38.28-.79.52-1.25.71v2.06c1.02-.22 1.97-.62 2.8-1.14L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                            )}
                                        </button>
                                        <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300 ease-out flex items-center pr-2">
                                            <input
                                                type="range" min="0" max="1" step="0.05" value={volume}
                                                onChange={handleVolumeChange}
                                                className="w-24 h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer accent-white hover:accent-orange-500 transition-all shadow-sm"
                                                style={{ background: `linear-gradient(to right, white ${(volume * 100)}%, rgba(255,255,255,0.2) ${(volume * 100)}%)` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.6)]"></div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setIsTheaterMode(!isTheaterMode)} className={`p-2.5 rounded-xl transition-all duration-300 group/btn ${isTheaterMode ? 'bg-orange-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`} title="Theater mode (t)">
                                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current transition-transform group-hover/btn:scale-110"><path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z" /></svg>
                                    </button>
                                    <button onClick={toggleFullscreen} className="p-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 group/btn" title="Full screen (f)">
                                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current transition-transform group-hover/btn:scale-110"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Channel Title & Actions */}
                <div className={`mt-6 px-4 md:px-8 lg:px-12 transition-all max-w-[1400px] mx-auto w-full`}>
                    <h1 className="text-lg sm:text-xl font-bold text-white mb-3">{channel.name} | StreamBox Live</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden border border-zinc-700">
                                {channel.logo ? <img src={channel.logo} className="w-full h-full object-contain" /> : <span>📡</span>}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">{channel.group}</span>
                                <span className="text-[10px] text-zinc-500 uppercase font-black">{activity.views || 0} visits</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <div className="flex items-center bg-zinc-800/60 rounded-full h-9 p-0.5 shrink-0">
                                <button onClick={handleLike} className={`flex items-center gap-2 px-4 h-8 rounded-l-full hover:bg-zinc-700 transition-all border-r border-zinc-700/50 ${activity.userLiked ? 'text-orange-500' : 'text-zinc-200'}`}>
                                    <svg viewBox="0 0 24 24" className={`w-5 h-5 ${activity.userLiked ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                                    <span className="text-xs font-bold">{activity.likes}</span>
                                </button>
                                <button onClick={handleDislike} className={`flex items-center px-4 h-8 rounded-r-full hover:bg-zinc-700 transition-all ${activity.userDisliked ? 'text-orange-500' : 'text-zinc-200'}`}>
                                    <svg viewBox="0 0 24 24" className={`w-5 h-5 ${activity.userDisliked ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" /></svg>
                                </button>
                            </div>
                            <button onClick={handleShare} className="flex items-center gap-2 px-4 h-9 rounded-full bg-zinc-800/60 hover:bg-zinc-700 text-white font-bold text-xs shrink-0 transition-all active:scale-95">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                                Share
                            </button>
                            <button onClick={handleToggleFavorite} className={`flex items-center gap-2 px-4 h-9 rounded-full transition-all active:scale-95 text-xs font-bold shrink-0 ${isFavorite ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]' : 'bg-zinc-800/60 text-white hover:bg-zinc-700'}`}>
                                <svg viewBox="0 0 24 24" className={`w-5 h-5 ${isFavorite ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}>
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                {isFavorite ? 'Favorited' : 'Favorite'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Description Block */}
                <div className={`mt-4 p-5 bg-zinc-800/40 rounded-2xl mx-4 md:mx-8 lg:mx-12 transition-all max-w-[1400px] mx-auto w-full`}>
                    <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                        <span>{activity.views} views</span>
                        <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">Streaming live from {channel.country}. Experience high-fidelity {channel.language} content on StreamBox.</p>
                </div>

                {/* 4. Comments Section */}
                <div id="comments-section" className={`mt-12 px-4 md:px-8 lg:px-12 pb-10 transition-all max-w-[1400px] mx-auto w-full border-t border-zinc-900 pt-12`}>
                    <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{activity.reviews.length} Comments</h3>
                        <div className="h-px flex-1 bg-zinc-900"></div>
                    </div>
                    <div className="flex gap-4 mb-8">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-black shrink-0">
                            {user?.username?.[0] || '?'}
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <input
                                type="text" value={reviewText} onFocus={() => setIsFocused(true)}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder={user ? "Add a comment..." : "Sign in to join the conversation"}
                                disabled={!user}
                                className="w-full bg-transparent border-b border-zinc-800 py-1.5 text-sm text-white focus:outline-none focus:border-white transition-all placeholder:text-zinc-600"
                            />
                            {isFocused && (
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={() => { setIsFocused(false); setReviewText(''); }} className="px-4 py-2 rounded-full text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-colors">Cancel</button>
                                    <button onClick={submitComment} disabled={!reviewText.trim()} className="px-4 py-2 rounded-full text-xs font-bold bg-[#3ea6ff] hover:bg-[#65b8ff] text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all">Comment</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-6">
                        {activity.reviews.map(comment => (
                            <div key={comment.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs font-bold shrink-0">
                                    {comment.username?.[0] || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-white tracking-tight">@{comment.username}</span>
                                        <span className="text-[10px] text-zinc-500 font-medium">{timeAgo(comment.date)}</span>
                                    </div>
                                    <p className="text-sm text-zinc-200 leading-relaxed mb-1">{comment.text}</p>
                                    <div className="flex items-center gap-4">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-zinc-500 stroke-2 cursor-pointer"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                                        <span className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer">Reply</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. Theater Recommendations (Below Comments) */}
                {isTheaterMode && (
                    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 mt-12 pb-20 space-y-6">
                        <div className="flex items-center gap-2 mb-6 border-t border-zinc-900 pt-8">
                            <span className="text-xs font-black text-white uppercase tracking-widest px-2 py-1 bg-white/5 rounded">More Like This</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {sidebar}
                        </div>
                    </div>
                )}
            </div>

            {/* Standard Sidebar (Visible only when NOT in theater mode) */}
            {!isTheaterMode && (
                <div className="w-full lg:w-[400px] shrink-0 p-4 sm:p-6 space-y-4 lg:border-l border-zinc-900 bg-[#0a0a0a]">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-black text-white uppercase tracking-widest px-2 py-1 bg-white/5 rounded">More Like This</span>
                    </div>
                    {sidebar}
                </div>
            )}

            {/* Toast Notification */}
            {toast.visible && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900/90 text-white text-xs font-bold py-3 px-6 rounded-2xl border border-white/10 shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-2">
                    {toast.message}
                </div>
            )}
        </div>
    );
};
