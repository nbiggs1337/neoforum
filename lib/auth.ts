import { createServerSupabaseClient, createClient } from "@/lib/supabase"
import type { User } from "@/lib/supabase"

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      // Don't log this as an error since it's normal for unauthenticated users
      return null
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError)
      return null
    }

    return profile
  } catch (error) {
    console.error("getCurrentUser error:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      throw new Error("Authentication required")
    }

    // Get or create user profile
    let { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
          display_name:
            user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split("@")[0] || "User",
          role: "user",
        })
        .select()
        .single()

      if (createError) {
        console.error("Failed to create user profile:", createError)
        throw new Error("Failed to create user profile")
      }

      profile = newProfile
    } else if (profileError) {
      console.error("Profile fetch error:", profileError)
      throw new Error("Failed to fetch user profile")
    }

    if (!profile) {
      throw new Error("User profile not found")
    }

    return profile
  } catch (error) {
    console.error("requireAuth error:", error)
    throw error
  }
}

export class AuthService {
  static async signIn(email: string, password: string) {
    console.log("AuthService.signIn called with email:", email)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("SignIn error:", error)
      throw error
    }

    console.log("SignIn successful:", data)
    return data
  }

  static async signUp(email: string, password: string, username: string) {
    console.log("AuthService.signUp called with:", { email, username })
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      })

      if (error) {
        console.error("SignUp error from Supabase:", error)
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
        })
        throw error
      }

      console.log("SignUp successful:", data)
      return data
    } catch (err) {
      console.error("SignUp catch block error:", err)
      throw err
    }
  }

  static async signOut() {
    console.log("AuthService.signOut called")
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("SignOut error:", error)
      throw error
    }

    console.log("SignOut successful")
  }

  static async resetPassword(email: string) {
    console.log("AuthService.resetPassword called with email:", email)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      console.error("ResetPassword error:", error)
      throw error
    }

    console.log("ResetPassword successful")
  }
}
