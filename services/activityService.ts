
import { createClient } from '@supabase/supabase-js';
import { ActivityStore, ChannelActivity, Review } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ACTIVITY_TABLE = 'channel_activities';

export const activityService = {
  // Local cache to keep the UI snappy
  privateStore: {} as ActivityStore,

  async fetchAllActivity(): Promise<ActivityStore> {
    const { data, error } = await supabase
      .from(ACTIVITY_TABLE)
      .select('*');

    if (error) {
      console.error("Supabase Fetch Error:", error);
      return {};
    }

    const store: ActivityStore = {};
    data.forEach((row: any) => {
      store[row.url] = {
        likes: row.likes || 0,
        dislikes: row.dislikes || 0,
        views: row.views || 0,
        reviews: row.reviews || []
      };
    });
    this.privateStore = store;
    return store;
  },

  getStore(): ActivityStore {
    return this.privateStore;
  },

  getChannelActivity(url: string): ChannelActivity {
    return this.privateStore[url] || { likes: 0, dislikes: 0, views: 0, reviews: [] };
  },

  async incrementViews(url: string) {
    // RPC or direct update. For simplicity in v1.4.0, we'll do an upsert logic
    const { data: existing } = await supabase
      .from(ACTIVITY_TABLE)
      .select('*')
      .eq('url', url)
      .single();

    if (existing) {
      await supabase
        .from(ACTIVITY_TABLE)
        .update({ views: (existing.views || 0) + 1 })
        .eq('url', url);
    } else {
      await supabase
        .from(ACTIVITY_TABLE)
        .insert([{ url, views: 1, likes: 0, dislikes: 0, reviews: [] }]);
    }
  },

  async toggleLike(url: string, currentlyLiked: boolean) {
    const { data: existing } = await supabase
      .from(ACTIVITY_TABLE)
      .select('*')
      .eq('url', url)
      .single();

    if (!existing) return;

    const newLikes = currentlyLiked ? Math.max(0, existing.likes - 1) : existing.likes + 1;

    await supabase
      .from(ACTIVITY_TABLE)
      .update({ likes: newLikes })
      .eq('url', url);
  },

  async addReview(url: string, text: string, rating: number) {
    const { data: existing } = await supabase
      .from(ACTIVITY_TABLE)
      .select('*')
      .eq('url', url)
      .single();

    const newReview: Review = {
      id: Math.random().toString(36).substring(7),
      text,
      rating,
      date: new Date().toISOString()
    };

    if (existing) {
      const updatedReviews = [newReview, ...(existing.reviews || [])];
      await supabase
        .from(ACTIVITY_TABLE)
        .update({ reviews: updatedReviews })
        .eq('url', url);
    } else {
      await supabase
        .from(ACTIVITY_TABLE)
        .insert([{ url, reviews: [newReview], likes: 0, dislikes: 0, views: 0 }]);
    }
  },

  subscribe(callback: (store: ActivityStore) => void) {
    return supabase
      .channel('public:channel_activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: ACTIVITY_TABLE }, async () => {
        const freshStore = await this.fetchAllActivity();
        callback(freshStore);
      })
      .subscribe();
  }
};
