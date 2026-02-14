
import { ActivityStore, ChannelActivity, Review } from '../types';

const STORAGE_KEY = 'streambox_activities';

export const activityService = {
  getStore(): ActivityStore {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  getChannelActivity(url: string): ChannelActivity {
    const store = this.getStore();
    return store[url] || { likes: 0, dislikes: 0, views: 0, reviews: [] };
  },

  updateActivity(url: string, update: Partial<ChannelActivity>) {
    const store = this.getStore();
    store[url] = { ...(store[url] || { likes: 0, dislikes: 0, views: 0, reviews: [] }), ...update };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  },

  incrementViews(url: string) {
    const activity = this.getChannelActivity(url);
    activity.views = (activity.views || 0) + 1;
    this.updateActivity(url, activity);
    return activity;
  },

  toggleLike(url: string) {
    const activity = this.getChannelActivity(url);
    if (activity.userLiked) {
      activity.likes = Math.max(0, activity.likes - 1);
      activity.userLiked = false;
    } else {
      activity.likes += 1;
      activity.userLiked = true;
      if (activity.userDisliked) {
        activity.dislikes = Math.max(0, activity.dislikes - 1);
        activity.userDisliked = false;
      }
    }
    this.updateActivity(url, activity);
    return activity;
  },

  toggleDislike(url: string) {
    const activity = this.getChannelActivity(url);
    if (activity.userDisliked) {
      activity.dislikes = Math.max(0, activity.dislikes - 1);
      activity.userDisliked = false;
    } else {
      activity.dislikes += 1;
      activity.userDisliked = true;
      if (activity.userLiked) {
        activity.likes = Math.max(0, activity.likes - 1);
        activity.userLiked = false;
      }
    }
    this.updateActivity(url, activity);
    return activity;
  },

  addReview(url: string, text: string, rating: number) {
    const activity = this.getChannelActivity(url);
    const newReview: Review = {
      id: Math.random().toString(36).substring(7),
      text,
      rating,
      date: new Date().toISOString()
    };
    activity.reviews = [newReview, ...activity.reviews];
    activity.userRating = rating;
    this.updateActivity(url, activity);
    return activity;
  }
};
