import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { redirect } from "next/navigation"

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Sign out error:", error)
      return NextResponse.json({ error: "Failed to sign out" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Sign out error:", error)
    }

    redirect("/")
  } catch (error) {
    console.error("Sign out error:", error)
    redirect("/")
  }
}
