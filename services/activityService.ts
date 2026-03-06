import { createClient } from '@supabase/supabase-js';
import { ActivityStore, ChannelActivity, Review } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ACTIVITY_TABLE = 'channel_activities';

export const activityService = {
  // Local cache to keep the UI snappy
  privateStore: {} as ActivityStore,
  listeners: [] as ((store: ActivityStore) => void)[],

  notify() {
    this.listeners.forEach(cb => cb({ ...this.privateStore }));
  },

  async fetchAllActivity(): Promise<ActivityStore> {
    const { data, error } = await supabase
      .from(ACTIVITY_TABLE)
      .select('*');

    if (error) {
      console.warn("Supabase Fetch Error (Check RLS Policies):", error);
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
    this.notify();
    return store;
  },

  getStore(): ActivityStore {
    return this.privateStore;
  },

  getChannelActivity(url: string): ChannelActivity {
    return this.privateStore[url] || { likes: 0, dislikes: 0, views: 0, reviews: [] };
  },

  async incrementViews(url: string) {
    // 1. Optimistic local update
    if (!this.privateStore[url]) {
      this.privateStore[url] = { likes: 0, dislikes: 0, views: 0, reviews: [] };
    }
    this.privateStore[url].views += 1;
    this.notify();

    try {
      // 2. Try to get existing views directly
      const { data: existing, error: fetchError } = await supabase
        .from(ACTIVITY_TABLE)
        .select('views')
        .eq('url', url)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        const { error: updateError } = await supabase
          .from(ACTIVITY_TABLE)
          .update({ views: (existing.views || 0) + 1 })
          .eq('url', url);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from(ACTIVITY_TABLE)
          .insert([{ url, views: 1, likes: 0, dislikes: 0, reviews: [] }]);
        if (insertError) throw insertError;
      }
      
      // 3. Background sync
      this.fetchAllActivity();
    } catch (err) {
      console.error("View Sync Failure (Ensure table 'channel_activities' exists and has public RLS policies):", err);
    }
  },

  async toggleLike(url: string, currentlyLiked: boolean, currentlyDisliked: boolean) {
    const { data: existing } = await supabase
      .from(ACTIVITY_TABLE)
      .select('*')
      .eq('url', url)
      .maybeSingle();

    if (!existing) {
      await supabase.from(ACTIVITY_TABLE).insert([{ url, likes: 1, dislikes: 0, views: 0, reviews: [] }]);
    } else {
      let newLikes = currentlyLiked ? Math.max(0, existing.likes - 1) : existing.likes + 1;
      let newDislikes = existing.dislikes;
      if (!currentlyLiked && currentlyDisliked) {
        newDislikes = Math.max(0, existing.dislikes - 1);
      }
      await supabase
        .from(ACTIVITY_TABLE)
        .update({ likes: newLikes, dislikes: newDislikes })
        .eq('url', url);
    }
    await this.fetchAllActivity();
  },

  async toggleDislike(url: string, currentlyDisliked: boolean, currentlyLiked: boolean) {
    const { data: existing } = await supabase
      .from(ACTIVITY_TABLE)
      .select('*')
      .eq('url', url)
      .maybeSingle();

    if (!existing) {
      await supabase.from(ACTIVITY_TABLE).insert([{ url, dislikes: 1, likes: 0, views: 0, reviews: [] }]);
    } else {
      let newDislikes = currentlyDisliked ? Math.max(0, existing.dislikes - 1) : existing.dislikes + 1;
      let newLikes = existing.likes;
      if (!currentlyDisliked && currentlyLiked) {
        newLikes = Math.max(0, existing.likes - 1);
      }
      await supabase
        .from(ACTIVITY_TABLE)
        .update({ dislikes: newDislikes, likes: newLikes })
        .eq('url', url);
    }
    await this.fetchAllActivity();
  },

  async addReview(url: string, text: string, rating: number, user: { id: string, username: string }) {
    const { data: existing } = await supabase
      .from(ACTIVITY_TABLE)
      .select('*')
      .eq('url', url)
      .maybeSingle();

    const newReview: Review = {
      id: Math.random().toString(36).substring(7),
      userId: user.id,
      username: user.username,
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
    await this.fetchAllActivity();
  },

  subscribe(callback: (store: ActivityStore) => void) {
    this.listeners.push(callback);
    
    const channel = supabase
      .channel('public:channel_activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: ACTIVITY_TABLE }, async () => {
        await this.fetchAllActivity();
      })
      .subscribe();

    return {
      unsubscribe: () => {
        this.listeners = this.listeners.filter(l => l !== callback);
        supabase.removeChannel(channel);
      }
    };
  }
};
