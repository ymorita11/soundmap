-- ============================================
-- Migration: Phase 2 スキーマ作成
-- Purpose: いいね (likes) と通報 (reports) テーブルを追加
-- Tables: likes, reports
-- NOTE: Phase 2 で実行。MVP では不要
-- ============================================

-- -------------------------------------------------
-- likes テーブル
-- ユーザーが気に入った音声を保存する機能
-- -------------------------------------------------
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);
comment on table public.likes is 'ユーザーの「いいね（保存）」を管理。同一投稿への重複を防止。';

create index idx_likes_user_id on public.likes(user_id);
create index idx_likes_post_id on public.likes(post_id);

-- RLS 有効化
alter table public.likes enable row level security;

-- likes RLS ポリシー
create policy "likes_select_own"
  on public.likes for select
  to authenticated
  using (
    user_id in (
      select id from public.users where clerk_id = auth.jwt() ->> 'sub'
    )
  );

create policy "likes_insert_auth"
  on public.likes for insert
  to authenticated
  with check (
    user_id in (
      select id from public.users where clerk_id = auth.jwt() ->> 'sub'
    )
  );

create policy "likes_delete_own"
  on public.likes for delete
  to authenticated
  using (
    user_id in (
      select id from public.users where clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- -------------------------------------------------
-- reports テーブル
-- 不適切な音声投稿の通報を管理
-- -------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);
comment on table public.reports is '不適切な投稿の通報を管理。ステータスで審査状況を追跡。';

create index idx_reports_post_id on public.reports(post_id);
create index idx_reports_status on public.reports(status);

-- RLS 有効化
alter table public.reports enable row level security;

-- reports RLS ポリシー
create policy "reports_insert_auth"
  on public.reports for insert
  to authenticated
  with check (
    user_id in (
      select id from public.users where clerk_id = auth.jwt() ->> 'sub'
    )
  );

create policy "reports_select_service"
  on public.reports for select
  to service_role
  using (true);

create policy "reports_update_service"
  on public.reports for update
  to service_role
  using (true)
  with check (true);
