'use server'

import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function signUpAction(prevState: any, formData: FormData) {
  if (!formData) {
    return {
      error: 'No form data provided'
    }
  }

  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    if (!email || !password || !username) {
      return {
        error: 'All fields are required'
      }
    }

    const supabase = await createServerSupabaseClient()

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      return {
        error: 'Username already taken'
      }
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    })

    if (error) {
      return {
        error: error.message
      }
    }

    if (data.user) {
      // Use service role client to bypass RLS for user creation
      const serviceSupabase = await createServiceRoleSupabaseClient()
      
      const { error: profileError } = await serviceSupabase
        .from('users')
        .insert({
          id: data.user.id,
          username,
          display_name: username
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return {
          error: 'Failed to create user profile'
        }
      }
    }

    return {
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.'
    }
  } catch (error) {
    console.error('Signup error:', error)
    return {
      error: 'An unexpected error occurred'
    }
  }
}

export async function signInAction(prevState: any, formData: FormData) {
  if (!formData) {
    return {
      error: 'No form data provided'
    }
  }

  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return {
        error: 'Email and password are required'
      }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return {
        error: error.message
      }
    }

    redirect('/dashboard')
  } catch (error) {
    console.error('Signin error:', error)
    return {
      error: 'An unexpected error occurred'
    }
  }
}

export async function signOutAction() {
  try {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
    redirect('/')
  } catch (error) {
    console.error('Signout error:', error)
    redirect('/')
  }
}
