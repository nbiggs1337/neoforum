'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function reportPost(formData: FormData) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to report posts'
      }
    }

    const postId = formData.get('postId') as string
    const reason = formData.get('reason') as string
    const details = formData.get('details') as string

    if (!postId || !reason) {
      return {
        success: false,
        error: 'Post ID and reason are required'
      }
    }

    const supabase = await createServerSupabaseClient()

    // Check if user has already reported this post
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('post_id', postId)
      .eq('reporter_id', user.id)
      .single()

    if (existingReport) {
      return {
        success: false,
        error: 'You have already reported this post'
      }
    }

    // Create the report
    const { error } = await supabase
      .from('reports')
      .insert({
        post_id: postId,
        reporter_id: user.id,
        reason,
        details: details || null,
        status: 'pending'
      })

    if (error) {
      console.error('Report creation error:', error)
      return {
        success: false,
        error: 'Failed to submit report'
      }
    }

    // Revalidate admin pages
    revalidatePath('/admin')
    revalidatePath('/admin/reports')

    return {
      success: true,
      message: 'Report submitted successfully'
    }
  } catch (error) {
    console.error('Report error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}
