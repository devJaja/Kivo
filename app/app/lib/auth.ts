import { getServerSession } from "next-auth"

export async function getSession() {
  return getServerSession()
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }
  return session
}
