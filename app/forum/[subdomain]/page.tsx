import { createServerSupabaseClient } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { JoinForumButton } from "@/components/join-forum-button"
import { FollowForumButton } from "@/components/follow-forum-button"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { VoteButtons } from "@/components/vote-buttons"
import { MessageSquare, Users, Calendar, ArrowLeft, Settings, Info } from 'lucide-react'
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ForumPageProps {
  params: {
    subdomain: string
  }
}

async function getForumData(subdomain: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: forum, error } = await supabase
    .from("forums")
    .select(`
      *,
      owner:profiles!forums_owner_id_fkey(username, display_name)
    `)
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single()

  if (error || !forum) {
    return null
  }

  return forum
}

async function getForumPosts(forumId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey(username, display_name),
      forum:forums!posts_forum_id_fkey(name, subdomain),
      _count_comments:comments(count)
    `)
    .eq("forum_id", forumId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }

  return posts || []
}

async function checkUserMembership(forumId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isMember: false, isOwner: false, isFollowing: false }
  }

  // Check membership
  const { data: membership } = await supabase
    .from("forum_members")
    .select("role")
    .eq("forum_id", forumId)
    .eq("user_id", user.id)
    .single()

  // Check if user is owner
  const { data: forum } = await supabase
    .from("forums")
    .select("owner_id")
    .eq("id", forumId)
    .single()

  // Check if following
  const { data: follow } = await supabase
    .from("forum_follows")
    .select("id")
    .eq("forum_id", forumId)
    .eq("user_id", user.id)
    .single()

  return {
    isMember: !!membership,
    isOwner: forum?.owner_id === user.id,
    isFollowing: !!follow,
    memberRole: membership?.role
  }
}

export default async function ForumPage({ params }: ForumPageProps) {
  const forum = await getForumData(params.subdomain)
  
  if (!forum) {
    notFound()
  }

  const [posts, userStatus] = await Promise.all([
    getForumPosts(forum.id),
    checkUserMembership(forum.id)
  ])

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <Link 
            href="/explore" 
            className="flex items-center gap-1 text-green-400/70 hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
          <span className="text-green-400/50">/</span>
          <span className="text-green-400">{forum.name}</span>
        </nav>

        {/* Forum Header */}
        <Card className="bg-gray-900/50 border-green-500/30 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl text-green-400">{forum.name}</CardTitle>
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    {forum.category}
                  </Badge>
                </div>
                <p className="text-green-400/80 mb-4">{forum.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-green-400/60">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{forum.member_count} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{forum.post_count} posts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDistanceToNow(new Date(forum.created_at))} ago</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {userStatus.isOwner && (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/forum/${forum.subdomain}/settings`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/forum/${forum.subdomain}/about`}>
                        <Info className="w-4 h-4 mr-2" />
                        About
                      </Link>
                    </Button>
                  </>
                )}
                
                <FollowForumButton 
                  forumId={forum.id} 
                  isFollowing={userStatus.isFollowing}
                />
                
                <JoinForumButton 
                  forumId={forum.id} 
                  isMember={userStatus.isMember}
                  memberCount={forum.member_count}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Create Post Section */}
        {userStatus.isMember && (
          <Card className="bg-gray-900/50 border-green-500/30 mb-6">
            <CardContent className="pt-6">
              <CreatePostDialog forumId={forum.id} forumName={forum.name} />
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-green-400 mb-4">Recent Posts</h2>
          
          {posts.length === 0 ? (
            <Card className="bg-gray-900/50 border-green-500/30">
              <CardContent className="pt-6 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-green-400/50" />
                <p className="text-green-400/70 mb-2">No posts yet</p>
                <p className="text-green-400/50 text-sm">
                  {userStatus.isMember 
                    ? "Be the first to create a post in this forum!" 
                    : "Join this forum to start posting and engaging with the community."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="bg-gray-900/50 border-green-500/30 hover:border-green-500/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <VoteButtons 
                      postId={post.id}
                      initialUpvotes={post.upvotes || 0}
                      initialDownvotes={post.downvotes || 0}
                    />
                    
                    <div className="flex-1">
                      <Link 
                        href={`/forum/${forum.subdomain}/post/${post.id}`}
                        className="block hover:text-green-300 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-green-400 mb-2">{post.title}</h3>
                        <p className="text-green-400/80 mb-3 line-clamp-3">{post.content}</p>
                      </Link>
                      
                      <div className="flex items-center justify-between text-sm text-green-400/60">
                        <div className="flex items-center gap-4">
                          <span>
                            by <span className="text-green-400">{post.author?.display_name || post.author?.username}</span>
                          </span>
                          <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post._count_comments?.[0]?.count || 0} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
