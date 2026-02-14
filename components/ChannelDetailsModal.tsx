
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
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 ${isMini ? 'pointer-events-auto' : ''}`}>
      <div className={`bg-zinc-900 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-zinc-800 animate-in zoom-in-95 duration-300 ${isMini ? 'border-orange-500/30' : ''}`}>
        {/* Header Section */}
        <div className={`p-4 sm:p-8 border-b border-zinc-800 bg-gradient-to-br from-zinc-800/50 to-transparent flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative`}>
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-black rounded-xl sm:rounded-2xl border border-zinc-700 flex items-center justify-center p-2 shrink-0">
            {channel.logo ? (
              <img src={channel.logo} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-2xl sm:text-3xl">📡</span>
            )}
          </div>
          <div className="flex-1 min-w-0 w-full text-center sm:text-left">
            <div className="flex justify-between items-center sm:items-start gap-4 mb-2">
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight truncate flex-1">{channel.name}</h2>
              <button 
                onClick={handleShare}
                className={`p-2 rounded-xl transition-all shrink-0 ${copyFeedback ? 'bg-green-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
              >
                {copyFeedback ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <p className="text-zinc-500 text-[10px] sm:text-sm uppercase tracking-widest font-bold">{channel.group}</p>
              <span className="text-zinc-700 font-bold">•</span>
              <p className="text-zinc-500 text-[9px] sm:text-xs font-mono">{activity.views || 0} Visits</p>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
              {!isMini && (
                <button 
                  onClick={onPlay}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 sm:px-8 py-2 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20 text-xs sm:text-base"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current"><path d="M8 5v14l11-7z"/></svg>
                  Watch
                </button>
              )}
              <button onClick={onClose} className="text-zinc-500 hover:text-white text-[10px] sm:text-sm font-bold uppercase tracking-wider px-2 sm:px-4">
                {isMini ? 'Return' : 'Back'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar space-y-6 sm:space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-black/20 p-4 sm:p-6 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center text-center">
              <p className="text-[8px] sm:text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Rating</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-5xl font-black text-orange-500">{avgRating}</span>
                <span className="text-zinc-600 text-xs sm:text-sm font-bold">/ 10</span>
              </div>
            </div>

            <div className="bg-black/20 p-4 sm:p-6 rounded-2xl border border-zinc-800/50 flex flex-col justify-center gap-3 sm:gap-4">
              <p className="text-[8px] sm:text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1 text-center">Feedback</p>
              <div className="flex gap-2 sm:gap-3">
                <button 
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl border transition-all ${
                    activity.userLiked ? 'bg-orange-600 border-orange-500 text-white shadow-lg' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.75 0 1.41-.41 1.75-1.03l3.51-8.19c.16-.41.25-.86.25-1.32v-1.5z"/></svg>
                  <span className="font-bold text-xs sm:text-sm">{activity.likes}</span>
                </button>
                <button 
                  onClick={handleDislike}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl border transition-all ${
                    activity.userDisliked ? 'bg-zinc-100 border-white text-black' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>
                  <span className="font-bold text-xs sm:text-sm">{activity.dislikes}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Rating */}
          <div className="bg-zinc-800/20 border border-zinc-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="text-[10px] sm:text-sm font-bold text-white uppercase tracking-widest mb-4 text-center">Your Rating</h3>
            <div className="flex gap-1 justify-center mb-6 overflow-x-auto no-scrollbar pb-2">
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
                    className={`shrink-0 w-8 h-8 sm:w-10 sm:h-12 rounded-lg transition-all flex items-center justify-center ${
                      isActive 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-zinc-800/50 text-zinc-600'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-black">{val}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write a quick review..."
                className="w-full bg-black/40 border border-zinc-800 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500/50 min-h-[80px] transition-colors"
              />
              <button 
                onClick={submitReview}
                className="w-full bg-zinc-100 text-black font-black uppercase text-[8px] sm:text-[10px] tracking-[0.2em] px-6 py-3 sm:py-4 rounded-xl hover:bg-white transition-all disabled:opacity-30"
                disabled={!reviewText.trim()}
              >
                Submit Review
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              Recent Reviews
              <span className="text-[8px] sm:text-[10px] text-zinc-600 font-mono">({activity.reviews.length})</span>
            </h3>
            {activity.reviews.length === 0 ? (
              <p className="text-zinc-700 italic text-xs sm:text-sm text-center py-4">Be the first to review.</p>
            ) : (
              <div className="space-y-3">
                {activity.reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="bg-zinc-800/30 border border-zinc-800/50 rounded-xl p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                    <div className="bg-orange-600 text-white text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded h-fit shrink-0">
                      {review.rating}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-1">{review.text}</p>
                      <p className="text-zinc-600 text-[8px] uppercase font-mono">{new Date(review.date).toLocaleDateString()}</p>
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
