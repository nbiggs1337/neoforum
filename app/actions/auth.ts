'use server'

import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export async function signUpAction(prevState: any, formData: FormData) {
  console.log("signUpAction called")
  
  if (!formData) {
    console.error("FormData is null or undefined")
    return { error: "Form data is missing" }
  }

  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const username = formData.get("username") as string

    console.log("Signup attempt:", { email, username })

    if (!email || !password || !username) {
      return { error: "All fields are required" }
    }

    // Use regular client for signup to enable email confirmation
    const supabase = await createServerSupabaseClient()

    console.log("Creating user with email confirmation...")

    // Create the user with email confirmation required
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    if (authError) {
      console.error("Auth error:", authError)
      return { error: authError.message }
    }

    if (!authData.user) {
      console.error("No user returned from auth")
      return { error: "Failed to create user" }
    }

    console.log("User created successfully:", authData.user.id)
    console.log("Email confirmation required:", !authData.user.email_confirmed_at)

    // Profile will be created automatically via trigger after email confirmation
    console.log("Signup completed successfully - email confirmation required")
    
    return { 
      success: true, 
      message: "Account created successfully! Please check your email to verify your account before signing in." 
    }
    
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "An unexpected error occurred during signup" }
  }
}

export async function signInAction(prevState: any, formData: FormData) {
  console.log("signInAction called")
  
  if (!formData) {
    console.error("FormData is null or undefined")
    return { error: "Form data is missing" }
  }

  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log("Login attempt:", { email })

    if (!email || !password) {
      return { error: "Email and password are required" }
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error:", error)
      
      // Check if it's an email not confirmed error
      if (error.message.includes("Email not confirmed")) {
        return { error: "Please check your email and click the confirmation link before signing in." }
      }
      
      return { error: error.message }
    }

    console.log("Login successful")
    
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred during login" }
  }

  redirect("/dashboard")
}
