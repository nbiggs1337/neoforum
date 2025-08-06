import { createServerSupabaseClient } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  console.log("Auth callback called with code:", !!code)
  console.log("Request URL:", request.url)

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      
      console.log("Exchanging code for session...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Code exchange error:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        return NextResponse.redirect(`https://neoforum.app/login?error=Please try signing in again`)
      }

      if (data.user) {
        console.log("User authenticated successfully:", data.user.id)
        console.log("Email confirmed:", !!data.user.email_confirmed_at)

        // Check if profile exists, create if it doesn't
        try {
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.user.id)
            .single()

          if (profileCheckError && profileCheckError.code !== 'PGRST116') {
            console.error("Profile check error:", profileCheckError)
          }

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
          } else {
            console.log("Profile already exists")
          }
        } catch (profileError) {
          console.error("Profile handling error:", profileError)
          // Don't fail the auth flow if profile handling fails
        }

        console.log("Redirecting to:", next)
        return NextResponse.redirect(`https://neoforum.app${next}`)
      } else {
        console.error("No user data returned after code exchange")
        return NextResponse.redirect(`https://neoforum.app/login?error=Authentication failed`)
      }
    } catch (error) {
      console.error("Auth callback error:", error)
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
      return NextResponse.redirect(`https://neoforum.app/login?error=Authentication error occurred`)
    }
  }

  console.log("No code provided, redirecting to login")
  return NextResponse.redirect(`https://neoforum.app/login?error=No authentication code provided`)
}
