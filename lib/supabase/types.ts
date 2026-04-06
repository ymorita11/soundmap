export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          username: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          username: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          username?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          place_name: string
          latitude: number
          longitude: number
          audio_url: string
          duration_ms: number
          play_count: number
          status: 'active' | 'hidden' | 'deleted'
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          place_name: string
          latitude: number
          longitude: number
          audio_url: string
          duration_ms?: number
          play_count?: number
          status?: 'active' | 'hidden' | 'deleted'
          recorded_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          place_name?: string
          latitude?: number
          longitude?: number
          audio_url?: string
          duration_ms?: number
          play_count?: number
          status?: 'active' | 'hidden' | 'deleted'
          recorded_at?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          post_id: string
          reason: string
          status: 'pending' | 'reviewed' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          reason: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          reason?: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string
        }
      }
    }
  }
}
