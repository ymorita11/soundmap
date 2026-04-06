'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ensureSupabaseUser } from '@/lib/supabase/auth-helpers'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

const createPostSchema = z.object({
  place_name: z.string().min(1, '場所名は必須です').max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  duration_ms: z.number().int().min(1).max(30000),
  recorded_at: z.string().datetime(),
})

export async function createPost(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: '認証が必要です' }

    const supabaseUser = await ensureSupabaseUser()
    if (!supabaseUser) return { success: false, error: 'ユーザーの同期に失敗しました' }

    const audioFile = formData.get('audio') as File | null
    const metadata = formData.get('metadata') as string | null

    if (!audioFile) return { success: false, error: '音声ファイルが必要です' }
    if (!metadata) return { success: false, error: 'メタデータが必要です' }

    const parsed = createPostSchema.safeParse(JSON.parse(metadata))
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
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

    revalidatePath('/')
    return { success: true, data: post }
  } catch (err) {
    console.error('createPost error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : '投稿の作成に失敗しました',
    }
  }
}

export async function deletePost(postId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: '認証が必要です' }

    const supabase = createServiceRoleClient()

    const { data: post } = await supabase
      .from('posts')
      .select('user_id, users!inner(clerk_id)')
      .eq('id', postId)
      .single()

    if (!post) return { success: false, error: '投稿が見つかりません' }
    if ((post as any).users.clerk_id !== userId) {
      return { success: false, error: '権限がありません' }
    }

    const { error } = await supabase
      .from('posts')
      .update({ status: 'deleted' })
      .eq('id', postId)

    if (error) throw error

    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('deletePost error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : '投稿の削除に失敗しました',
    }
  }
}

export async function incrementPlayCount(postId: string) {
  try {
    const supabase = createServiceRoleClient()

    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('play_count')
      .eq('id', postId)
      .eq('status', 'active')
      .single()

    if (fetchError || !post) {
      return { success: false, error: '投稿が見つかりません' }
    }

    const { error } = await supabase
      .from('posts')
      .update({ play_count: post.play_count + 1 })
      .eq('id', postId)

    if (error) throw error

    return { success: true, play_count: post.play_count + 1 }
  } catch (err) {
    console.error('incrementPlayCount error:', err)
    return {
      success: false,
      error: '再生回数の更新に失敗しました',
    }
  }
}
