import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceRoleClient } from './service-role'

export async function getSupabaseUserByClerkId() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .maybeSingle()

  return data ?? null
}

export async function ensureSupabaseUser() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  if (!user) return null

  const email = user.emailAddresses[0]?.emailAddress
  if (!email) return null

  const username =
    user.username ??
    (`${user.firstName ?? ''}${user.lastName ?? ''}`.trim() ||
    email.split('@')[0])

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_id: userId,
        email,
        username,
        avatar_url: user.imageUrl ?? null,
      },
      { onConflict: 'clerk_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}
