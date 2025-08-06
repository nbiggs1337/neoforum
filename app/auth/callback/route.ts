import { createServerSupabaseClient } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  console.log("Auth callback called with code:", !!code)

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      
      console.log("Exchanging code for session...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Code exchange error:", error)
        return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
      }

      if (data.user) {
        console.log("User authenticated successfully:", data.user.id)
        console.log("Email confirmed:", !!data.user.email_confirmed_at)

        // Check if profile exists, create if it doesn't
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (!existingProfile) {
          console.log("Creating user profile...")
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              username: data.user.user_metadata?.username || data.user.email?.split("@")[0] || "user",
              display_name: data.user.user_metadata?.display_name || data.user.user_metadata?.username || data.user.email?.split("@")[0] || "User",
              role: "user"
            })

          if (profileError) {
            console.error("Profile creation error:", profileError)
            // Don't fail the auth flow if profile creation fails
          } else {
            console.log("Profile created successfully")
          }
        }

        console.log("Redirecting to:", next)
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(`${origin}/login?error=server_error`)
    }
  }

  console.log("No code provided, redirecting to login")
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
