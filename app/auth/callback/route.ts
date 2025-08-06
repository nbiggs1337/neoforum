import { createServerSupabaseClient } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  console.log("Auth callback received:", { code: !!code, next, origin })

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      
      console.log("Exchanging code for session...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`https://neoforum.app/dashboard?error=auth_callback_error&details=${encodeURIComponent(error.message)}`)
      }

      if (!data.user) {
        console.error("No user data received after code exchange")
        return NextResponse.redirect(`https://neoforum.app/dashboard?error=auth_callback_error&details=no_user_data`)
      }

      console.log("Successfully authenticated user:", data.user.id)

      // Check if profile exists
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error checking profile:", profileError)
        }

        if (!profile) {
          console.log("Creating profile for user:", data.user.id)
          // Create profile
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              username: data.user.email?.split("@")[0] || `user_${data.user.id.slice(0, 8)}`,
              display_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
              email: data.user.email,
              avatar_url: data.user.user_metadata?.avatar_url,
              role: "user",
            })

          if (createError) {
            console.error("Error creating profile:", createError)
            // Don't redirect to error page for profile creation issues
            // The user is still authenticated, just without a complete profile
          } else {
            console.log("Profile created successfully")
          }
        } else {
          console.log("Profile already exists for user")
        }
      } catch (profileError) {
        console.error("Profile handling error:", profileError)
        // Continue with authentication even if profile handling fails
      }

      // Successful authentication - redirect to dashboard
      console.log("Redirecting to dashboard")
      return NextResponse.redirect(`https://neoforum.app${next}`)
      
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
      return NextResponse.redirect(`https://neoforum.app/dashboard?error=auth_callback_error&details=unexpected_error`)
    }
  }

  // No code provided - redirect to error
  console.error("No code provided in auth callback")
  return NextResponse.redirect(`https://neoforum.app/dashboard?error=auth_callback_error&details=no_code`)
}
