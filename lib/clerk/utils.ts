import { auth, currentUser } from '@clerk/nextjs/server'

export async function getCurrentUserId() {
  const { userId } = await auth()
  return userId
}

export async function getCurrentUser() {
  return await currentUser()
}
