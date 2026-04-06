import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('posts')
      .select('*, users!inner(id, username, avatar_url)')
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    const post = {
      id: data.id,
      place_name: data.place_name,
      latitude: data.latitude,
      longitude: data.longitude,
      audio_url: data.audio_url,
      duration_ms: data.duration_ms,
      play_count: data.play_count,
      recorded_at: data.recorded_at,
      created_at: data.created_at,
      user: {
        id: data.users.id,
        username: data.users.username,
        avatar_url: data.users.avatar_url,
      },
    }

    return NextResponse.json({ post })
  } catch (err) {
    console.error('GET /api/posts/[id] error:', err)
    return NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServiceRoleClient()

    const { data: post } = await supabase
      .from('posts')
      .select('user_id, audio_url, users!inner(clerk_id)')
      .eq('id', id)
      .single()

    if (!post) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    if ((post as any).users.clerk_id !== userId) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { error: updateError } = await supabase
      .from('posts')
      .update({ status: 'deleted' })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/posts/[id] error:', err)
    return NextResponse.json(
      { error: '投稿の削除に失敗しました' },
      { status: 500 }
    )
  }
}
