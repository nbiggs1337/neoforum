'use server'

import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Sign in error:', error)
    throw new Error(error.message)
  }

  redirect('/dashboard')
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const displayName = formData.get('displayName') as string

  if (!email || !password || !username) {
    throw new Error('Email, password, and username are required')
  }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `https://neoforum.app/auth/callback`,
      data: {
        username,
        display_name: displayName || username,
      },
    },
  })

  if (error) {
    console.error('Sign up error:', error)
    throw new Error(error.message)
  }

  redirect('/login?message=Check your email to confirm your account')
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    throw new Error(error.message)
  }

  redirect('/')
}
