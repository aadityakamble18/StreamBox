import React, { useState, useEffect } from 'react';
import { IPTVChannel, ChannelActivity } from '../types';
import { activityService } from '../services/activityService';
import { authService } from '../services/authService';

interface ChannelDetailsModalProps {
  channel: IPTVChannel;
  onClose: () => void;
  onPlay: () => void;
  isMini?: boolean;
}

export const ChannelDetailsModal: React.FC<ChannelDetailsModalProps> = ({
  channel,
  onClose,
  onPlay,
  isMini = false
}) => {
  const [activity, setActivity] = useState<ChannelActivity>(activityService.getChannelActivity(channel.url));
  const [reviewText, setReviewText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    // 1. Initial sync
    setActivity(activityService.getChannelActivity(channel.url));

    // 2. Subscribe to global updates while modal is open
    const subscription = activityService.subscribe((freshStore) => {
      if (freshStore[channel.url]) {
        setActivity(freshStore[channel.url]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [channel.url]);

  const handleLike = async () => {
    if (!user) return;
    const currentlyLiked = activity.userLiked || false;
    const currentlyDisliked = activity.userDisliked || false;

    // Optimistic Update
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

    // Optimistic Update
    setActivity(prev => ({
      ...prev,
      dislikes: currentlyDisliked ? Math.max(0, prev.dislikes - 1) : prev.dislikes + 1,
      likes: (!currentlyDisliked && currentlyLiked) ? Math.max(0, prev.likes - 1) : prev.likes,
      userDisliked: !currentlyDisliked,
      userLiked: !currentlyDisliked ? false : currentlyLiked
    }));

    await activityService.toggleDislike(channel.url, currentlyDisliked, currentlyLiked);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Watch ${channel.name} on StreamBox`,
      text: `Check out this live channel: ${channel.name}`,
      url: channel.url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.debug('Share cancelled', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${channel.name}: ${channel.url}`);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
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

    // Optimistic Update: Add to local state immediately
    setActivity(prev => ({
      ...prev,
      reviews: [newComment, ...prev.reviews]
    }));

    setReviewText('');
    setIsFocused(false);

    try {
      await activityService.addReview(channel.url, text, 10, { id: user.id, username: user.username });
    } catch (err) {
      console.error("Failed to post comment", err);
    }
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

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200`}>
      <div className="bg-[#0f0f0f] w-full max-w-2xl max-h-[95vh] sm:max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-zinc-800/50 animate-in zoom-in-95 duration-300">

        {/* YT Style Top Banner / Info */}
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center p-3 shrink-0 shadow-xl overflow-hidden">
              {channel.logo ? (
                <img src={channel.logo} alt="" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-3xl">📡</span>
              )}
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2 truncate">{channel.name}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-6">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{channel.group}</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                <span className="text-xs font-mono text-zinc-500">{activity.views || 0} visits</span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={onPlay}
                  className="bg-white hover:bg-zinc-200 text-black font-bold h-10 px-6 rounded-full transition-all flex items-center gap-2 text-sm shadow-lg active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M8 5v14l11-7z" /></svg>
                  Watch Now
                </button>

                <div className="flex items-center bg-zinc-800/60 rounded-full h-10 p-1">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 h-8 rounded-l-full transition-all hover:bg-zinc-700/60 border-r border-zinc-700/50 ${activity.userLiked ? 'text-orange-500' : 'text-zinc-300'}`}
                  >
                    <svg viewBox="0 0 24 24" className={`w-5 h-5 ${activity.userLiked ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                    <span className="text-xs font-black">{activity.likes}</span>
                  </button>
                  <button
                    onClick={handleDislike}
                    className={`flex items-center px-4 h-8 rounded-r-full transition-all hover:bg-zinc-700/60 ${activity.userDisliked ? 'text-orange-500' : 'text-zinc-300'}`}
                  >
                    <svg viewBox="0 0 24 24" className={`w-5 h-5 ${activity.userDisliked ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" /></svg>
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-zinc-800/60 hover:bg-zinc-700/60 text-white font-bold h-10 px-5 rounded-full transition-all text-xs active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                  {copyFeedback ? 'Copied' : 'Share'}
                </button>

                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800/40 hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-all ml-auto"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Comments Region */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-zinc-800/50 bg-[#0f0f0f]">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Comment Stats Header */}
            <div className="flex items-center gap-6">
              <h3 className="text-sm sm:text-lg font-bold text-white tracking-tight">{activity.reviews.length} Comments</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M15 15H3v-1h12v1zm6-6H3v1h18V9zM15 3H3v1h12V3z" /></svg>
                Sort by
              </div>
            </div>

            {/* Comment Input Section */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white text-xs font-black uppercase shrink-0">
                {user?.username?.[0] || '?'}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={reviewText}
                  onFocus={() => setIsFocused(true)}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={user ? "Add a comment..." : "Sign in to join the conversation"}
                  disabled={!user}
                  className="w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-white focus:outline-none focus:border-white transition-all placeholder:text-zinc-600"
                />
                {isFocused && (
                  <div className="flex justify-end gap-2 mt-2 animate-in slide-in-from-top-1 duration-200">
                    <button
                      onClick={() => { setIsFocused(false); setReviewText(''); }}
                      className="px-4 py-2 rounded-full text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitComment}
                      disabled={!reviewText.trim()}
                      className="px-4 py-2 rounded-full text-xs font-bold bg-[#3ea6ff] hover:bg-[#65b8ff] text-black disabled:bg-zinc-800 disabled:text-zinc-600 transition-all"
                    >
                      Comment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comment List */}
            <div className="space-y-6 sm:space-y-8 pb-10">
              {activity.reviews.map(comment => (
                <div key={comment.id} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold uppercase shrink-0 group-hover:bg-orange-600/20 group-hover:text-orange-500 transition-colors">
                    {comment.username?.[0] || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white tracking-tight">@{comment.username}</span>
                      <span className="text-[10px] text-zinc-500 font-medium tracking-tight">{timeAgo(comment.date)}</span>
                    </div>
                    <p className="text-sm text-zinc-200 leading-relaxed mb-3 pr-4">{comment.text}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 cursor-pointer group/action">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-zinc-500 group-hover/action:stroke-white stroke-2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                        <span className="text-[10px] font-bold text-zinc-500 group-hover/action:text-white">Helpful</span>
                      </div>
                      <button className="text-[10px] font-bold text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
              {activity.reviews.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                  <svg viewBox="0 0 24 24" className="w-16 h-16 fill-current text-zinc-600 mb-4"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                  <p className="text-sm font-bold text-zinc-400">No comments yet. Start the conversation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
