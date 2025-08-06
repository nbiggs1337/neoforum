'use server'

import { createServerSupabaseClient } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"
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

    // Use service role client for signup to bypass RLS
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log("Creating user with service role client...")

    // Create the user with email confirmation required
    const { data: authData, error: authError } = await serviceRoleClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        username,
        display_name: username,
      },
      email_confirm: false // Require email confirmation
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

    // Create profile using service role client
    const { error: profileError } = await serviceRoleClient
      .from("profiles")
      .insert({
        id: authData.user.id,
        username,
        display_name: username,
        role: "user"
      })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Don't fail the signup if profile creation fails
      console.log("Profile creation failed but user was created successfully")
    } else {
      console.log("Profile created successfully")
    }

    console.log("Signup completed successfully")
    
    // Return success state instead of redirecting
    return { 
      success: true, 
      message: "Account created successfully! Please check your email to verify your account." 
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
      return { error: error.message }
    }

    console.log("Login successful")
    
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred during login" }
  }

  redirect("/dashboard")
}
