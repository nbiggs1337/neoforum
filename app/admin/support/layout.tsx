import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"

export default async function AdminSupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (error || !profile || profile.role !== "admin") {
    redirect("/")
  }

  return <>{children}</>
}
