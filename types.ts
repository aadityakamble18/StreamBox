
export interface MediaItem {
  id: string;
  file?: File;
  url: string;
  name: string;
  type: 'video' | 'audio' | 'stream';
  duration?: number;
  thumbnail?: string;
  group?: string;
  originalChannel?: IPTVChannel;
}

export interface IPTVChannel {
  name: string;
  logo: string;
  url: string;
  group: string;
  country: string;
  language: string;
}

export interface Review {
  id: string;
  text: string;
  rating: number; // 1-10
  date: string;
}

export interface ChannelActivity {
  likes: number;
  dislikes: number;
  views: number;
  reviews: Review[];
  userLiked?: boolean;
  userDisliked?: boolean;
  userRating?: number;
}

export type ActivityStore = Record<string, ChannelActivity>;

export interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isFullscreen: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;
}

export interface AnalysisResult {
  summary: string;
  genre: string;
  mood: string;
  timestamp: number;
}
