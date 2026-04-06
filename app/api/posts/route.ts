import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ensureSupabaseUser } from '@/lib/supabase/auth-helpers'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

const getPostsSchema = z.object({
  swLat: z.coerce.number().min(-90).max(90),
  swLng: z.coerce.number().min(-180).max(180),
  neLat: z.coerce.number().min(-90).max(90),
  neLng: z.coerce.number().min(-180).max(180),
  limit: z.coerce.number().int().min(1).max(200).optional().default(100),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const parsed = getPostsSchema.safeParse({
      swLat: searchParams.get('swLat'),
      swLng: searchParams.get('swLng'),
      neLat: searchParams.get('neLat'),
      neLng: searchParams.get('neLng'),
      limit: searchParams.get('limit'),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'パラメータが不正です', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { swLat, swLng, neLat, neLng, limit } = parsed.data
    const supabase = createServiceRoleClient()

    const { data, error, count } = await supabase
      .from('posts')
      .select('*, users!inner(id, username, avatar_url)', { count: 'exact' })
      .eq('status', 'active')
      .gte('latitude', swLat)
      .lte('latitude', neLat)
      .gte('longitude', swLng)
      .lte('longitude', neLng)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    const posts = (data ?? []).map((row: any) => ({
      id: row.id,
      place_name: row.place_name,
      latitude: row.latitude,
      longitude: row.longitude,
      audio_url: row.audio_url,
      duration_ms: row.duration_ms,
      play_count: row.play_count,
      recorded_at: row.recorded_at,
      created_at: row.created_at,
      user: {
        id: row.users.id,
        username: row.users.username,
        avatar_url: row.users.avatar_url,
      },
    }))

    return NextResponse.json({ posts, total: count ?? posts.length })
  } catch (err) {
    console.error('GET /api/posts error:', err)
    return NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    )
  }
}

const createPostSchema = z.object({
  place_name: z.string().min(1, '場所名は必須です').max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  duration_ms: z.number().int().min(1).max(30000),
  recorded_at: z.string().datetime(),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const supabaseUser = await ensureSupabaseUser()
    if (!supabaseUser) {
      return NextResponse.json({ error: 'ユーザーの同期に失敗しました' }, { status: 500 })
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const metadata = formData.get('metadata') as string | null

    if (!audioFile) {
      return NextResponse.json({ error: '音声ファイルが必要です' }, { status: 400 })
    }

    if (!metadata) {
      return NextResponse.json({ error: 'メタデータが必要です' }, { status: 400 })
    }

    const parsed = createPostSchema.safeParse(JSON.parse(metadata))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'メタデータが不正です', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()
    const postId = crypto.randomUUID()
    const ext = audioFile.type.includes('webm') ? 'webm' : 'mp4'
    const storagePath = `${supabaseUser.id}/${postId}.${ext}`

    const arrayBuffer = await audioFile.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(storagePath, arrayBuffer, {
        contentType: audioFile.type,
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('audio')
      .getPublicUrl(storagePath)

    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert({
        id: postId,
        user_id: supabaseUser.id,
        place_name: parsed.data.place_name,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        audio_url: urlData.publicUrl,
        duration_ms: parsed.data.duration_ms,
        recorded_at: parsed.data.recorded_at,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({ post }, { status: 201 })
  } catch (err) {
    console.error('POST /api/posts error:', err)
    return NextResponse.json(
      { error: '投稿の作成に失敗しました' },
      { status: 500 }
    )
  }
}
