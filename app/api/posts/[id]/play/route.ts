import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceRoleClient()

    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('play_count')
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('posts')
      .update({ play_count: post.play_count + 1 })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ play_count: post.play_count + 1 })
  } catch (err) {
    console.error('PATCH /api/posts/[id]/play error:', err)
    return NextResponse.json(
      { error: '再生回数の更新に失敗しました' },
      { status: 500 }
    )
  }
}
