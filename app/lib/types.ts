export interface PostUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface Post {
  id: string;
  place_name: string;
  latitude: number;
  longitude: number;
  audio_url: string;
  duration_ms: number;
  play_count: number;
  recorded_at: string;
  created_at: string;
  user: PostUser;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
}
