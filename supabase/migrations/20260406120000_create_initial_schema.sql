-- ============================================
-- Migration: 初期スキーマ作成
-- Purpose: SoundMap の基本テーブル構造を作成 (MVP)
-- Tables: users, posts
-- ============================================

-- -------------------------------------------------
-- users テーブル
-- Clerk 認証と連携するユーザー情報を管理
-- -------------------------------------------------
create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  username text unique not null,
  email text unique not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.users is 'アプリケーションのユーザー情報。Clerk 認証と同期して管理する。';

-- updated_at 自動更新トリガー
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

-- users インデックス (UNIQUE 制約で自動作成されるが明示)
create index idx_users_clerk_id on public.users(clerk_id);

-- RLS 有効化
alter table public.users enable row level security;

-- users RLS ポリシー
-- SELECT: 全ユーザーの公開情報 (username, avatar_url) は誰でも閲覧可能
create policy "users_select_all"
  on public.users for select
  to authenticated, anon
  using (true);

-- INSERT: service_role のみ (ensureSupabaseUser 経由)
create policy "users_insert_service"
  on public.users for insert
  to service_role
  with check (true);

-- UPDATE: 自分のレコードのみ更新可能 (service_role も可)
create policy "users_update_own"
  on public.users for update
  to authenticated
  using (clerk_id = auth.jwt() ->> 'sub')
  with check (clerk_id = auth.jwt() ->> 'sub');

create policy "users_update_service"
  on public.users for update
  to service_role
  using (true)
  with check (true);

-- -------------------------------------------------
-- posts テーブル
-- 音声投稿のメタデータを管理。音声ファイルは Supabase Storage に保存
-- -------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  place_name text not null,
  latitude double precision not null check (latitude >= -90 and latitude <= 90),
  longitude double precision not null check (longitude >= -180 and longitude <= 180),
  audio_url text not null,
  duration_ms integer not null default 30000 check (duration_ms > 0 and duration_ms <= 30000),
  play_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted')),
  recorded_at timestamptz not null,
  created_at timestamptz not null default now()
);
comment on table public.posts is '音声投稿のメタデータ。位置情報・場所名・音声URLを保持する。';

-- posts インデックス
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_location on public.posts(latitude, longitude);
create index idx_posts_status on public.posts(status);
create index idx_posts_created_at on public.posts(created_at desc);

-- RLS 有効化
alter table public.posts enable row level security;

-- posts RLS ポリシー
-- SELECT: アクティブな投稿は誰でも閲覧可能
create policy "posts_select_active"
  on public.posts for select
  to authenticated, anon
  using (status = 'active');

-- INSERT: 認証済みユーザーのみ投稿可能 (service_role 経由)
create policy "posts_insert_service"
  on public.posts for insert
  to service_role
  with check (true);

-- UPDATE: 投稿者のみ自分の投稿を更新可能
create policy "posts_update_own"
  on public.posts for update
  to authenticated
  using (
    user_id in (
      select id from public.users where clerk_id = auth.jwt() ->> 'sub'
    )
  )
  with check (
    user_id in (
      select id from public.users where clerk_id = auth.jwt() ->> 'sub'
    )
  );

create policy "posts_update_service"
  on public.posts for update
  to service_role
  using (true)
  with check (true);

-- DELETE: 投稿者のみ自分の投稿を削除可能
create policy "posts_delete_own"
  on public.posts for delete
  to authenticated
  using (
    user_id in (
      select id from public.users where clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- -------------------------------------------------
-- Supabase Storage: audio バケット
-- -------------------------------------------------
-- NOTE: Storage バケットの作成は Supabase Dashboard または CLI で行う
-- バケット名: audio
-- パス規則: audio/{user_id}/{post_id}.webm
-- ポリシー:
--   SELECT (public): 全ユーザーが音声ファイルを取得可能
--   INSERT (authenticated): 認証済みユーザーのみアップロード可能
--   DELETE (authenticated): 投稿者のみ自分のファイルを削除可能
