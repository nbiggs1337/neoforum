import { createServerSupabaseClient } from "./supabase"

export interface User {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  role: "user" | "moderator" | "admin"
  reputation: number
  post_count: number
  is_banned: boolean
  banned_until?: string
  ban_reason?: string
  created_at: string
  updated_at: string
}

export interface Forum {
  id: string
  name: string
  subdomain: string
  description?: string
  long_description?: string
  category: string
  owner_id: string
  status: "active" | "archived" | "suspended"
  member_count: number
  post_count: number
  thread_count: number
  is_private: boolean
  rules?: string
  banner_url?: string
  icon_url?: string
  created_at: string
  updated_at: string
}

export interface ForumMember {
  id: string
  forum_id: string
  user_id: string
  role: "member" | "moderator" | "admin"
  joined_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  author_id: string
  forum_id: string
  status: "draft" | "published" | "archived" | "deleted"
  upvotes: number
  downvotes: number
  comment_count: number
  view_count: number
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  content: string
  author_id: string
  post_id: string
  parent_id?: string
  upvotes: number
  downvotes: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface PostVote {
  id: string
  post_id: string
  user_id: string
  vote_type: 1 | -1
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id?: string
  post_id?: string
  comment_id?: string
  forum_id?: string
  reason: string
  description?: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  moderator_id?: string
  moderator_notes?: string
  created_at: string
  resolved_at?: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  target_type: string
  target_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Database helper functions
export async function getForumBySubdomain(subdomain: string): Promise<Forum | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("forums")
    .select("*")
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single()

  if (error || !data) {
    return null
  }

  return data as Forum
}

export async function getForumPosts(forumId: string, limit = 20): Promise<Post[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("forum_id", forumId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as Post[]
}

export async function getUserForums(userId: string): Promise<Forum[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("forums")
    .select("*")
    .eq("owner_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as Forum[]
}

export async function isForumMember(forumId: string, userId: string): Promise<ForumMember | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("forum_members")
    .select("*")
    .eq("forum_id", forumId)
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    return null
  }

  return data as ForumMember
}
