
import React, { useState, useEffect } from 'react';
import { IPTVChannel, ChannelActivity, Review } from '../types';
import { activityService } from '../services/activityService';

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
  const [rating, setRating] = useState(activity.userRating || 10);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleLike = () => setActivity(activityService.toggleLike(channel.url));
  const handleDislike = () => setActivity(activityService.toggleDislike(channel.url));

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

  const handleQuickRate = (val: number) => {
    setRating(val);
    const newActivity = activityService.addReview(channel.url, reviewText, val);
    setActivity(newActivity);
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const newActivity = activityService.addReview(channel.url, reviewText, rating);
    setActivity(newActivity);
    setReviewText('');
  };

  const avgRating = activity.reviews.length > 0 
    ? (activity.reviews.reduce((acc, r) => acc + r.rating, 0) / activity.reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 ${isMini ? 'pointer-events-auto' : ''}`}>
      <div className={`bg-zinc-900 w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-zinc-800 animate-in zoom-in-95 duration-300 ${isMini ? 'border-orange-500/30' : ''}`}>
        {/* Header Section */}
        <div className={`p-8 border-b border-zinc-800 bg-gradient-to-br from-zinc-800/50 to-transparent flex items-start gap-6 relative ${isMini ? 'py-6' : ''}`}>
          <div className="w-24 h-24 bg-black rounded-2xl border border-zinc-700 flex items-center justify-center p-2 shrink-0">
            {channel.logo ? (
              <img src={channel.logo} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-3xl">📡</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-2xl font-black text-white leading-tight mb-2 truncate">{channel.name}</h2>
              <button 
                onClick={handleShare}
                className={`p-2.5 rounded-xl transition-all shrink-0 ${copyFeedback ? 'bg-green-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
              >
                {copyFeedback ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold">{channel.group}</p>
              <span className="text-zinc-700 font-bold">•</span>
              <p className="text-zinc-500 text-xs font-mono">{activity.views || 0} Visits</p>
            </div>
            <div className="flex items-center gap-4">
              {!isMini && (
                <button 
                  onClick={onPlay}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-2 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M8 5v14l11-7z"/></svg>
                  Watch
                </button>
              )}
              <button onClick={onClose} className="text-zinc-500 hover:text-white text-sm font-bold uppercase tracking-wider px-4">
                {isMini ? 'Back to Stream' : 'Back'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {/* Quick Stats & Interaction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/20 p-6 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Overall Rating</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-orange-500">{avgRating}</span>
                <span className="text-zinc-600 text-sm font-bold">/ 10</span>
              </div>
            </div>

            <div className="bg-black/20 p-6 rounded-2xl border border-zinc-800/50 flex flex-col justify-center gap-4">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1 text-center">Your Feedback</p>
              <div className="flex gap-3">
                <button 
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    activity.userLiked ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-orange-500/50'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.75 0 1.41-.41 1.75-1.03l3.51-8.19c.16-.41.25-.86.25-1.32v-1.5z"/></svg>
                  <span className="font-bold">{activity.likes}</span>
                </button>
                <button 
                  onClick={handleDislike}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    activity.userDisliked ? 'bg-zinc-100 border-white text-black' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-300/30'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>
                  <span className="font-bold">{activity.dislikes}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Rating Bar */}
          <div className="bg-zinc-800/20 border border-zinc-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-center">Rate this Channel</h3>
            <div className="flex justify-between items-center max-w-md mx-auto mb-2">
               <span className="text-[10px] text-zinc-600 font-bold">1</span>
               <span className="text-orange-500 font-black text-lg">{hoverRating || rating || 0}</span>
               <span className="text-[10px] text-zinc-600 font-bold">10</span>
            </div>
            <div className="flex gap-1 justify-center mb-6">
              {[...Array(10)].map((_, i) => {
                const val = i + 1;
                const isActive = (hoverRating !== null ? hoverRating >= val : (rating || 0) >= val);
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => handleQuickRate(val)}
                    className={`flex-1 h-12 rounded-lg transition-all flex items-center justify-center ${
                      isActive 
                        ? 'bg-orange-600 text-white shadow-inner' 
                        : 'bg-zinc-800/50 text-zinc-600 hover:bg-zinc-700'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className={`w-5 h-5 fill-current ${isActive ? 'scale-110' : 'scale-90 opacity-30'} transition-transform`}>
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Optional: Write a quick review..."
                className="w-full bg-black/40 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-orange-500/50 min-h-[80px] transition-colors"
              />
              <button 
                onClick={submitReview}
                className="w-full bg-zinc-100 text-black font-black uppercase text-[10px] tracking-[0.2em] px-6 py-4 rounded-xl hover:bg-white transition-all disabled:opacity-30"
                disabled={!reviewText.trim()}
              >
                Submit Review
              </button>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              Reviews
              <span className="text-[10px] text-zinc-600 font-mono">({activity.reviews.length})</span>
            </h3>
            {activity.reviews.length === 0 ? (
              <p className="text-zinc-700 italic text-sm text-center py-4">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {activity.reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="bg-zinc-800/30 border border-zinc-800/50 rounded-xl p-4 flex items-start gap-4">
                    <div className="bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded h-fit shrink-0">
                      {review.rating}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 text-sm leading-relaxed mb-1">{review.text}</p>
                      <p className="text-zinc-600 text-[9px] uppercase font-mono">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
