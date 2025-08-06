'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export interface SupportMessage {
  id: string
  name: string
  email: string
  subject: string
  category: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  user_id?: string
  assigned_to?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export async function submitSupportMessage(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser()
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const category = formData.get('category') as string
    const message = formData.get('message') as string
    
    if (!name || !email || !subject || !category || !message) {
      return { success: false, error: 'All fields are required' }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' }
    }
    
    // Validate category
    const validCategories = ['account', 'technical', 'billing', 'content', 'feature', 'other']
    if (!validCategories.includes(category)) {
      return { success: false, error: 'Please select a valid category' }
    }
    
    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        category,
        message: message.trim(),
        user_id: user?.id || null,
        status: 'open',
        priority: 'normal'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error submitting support message:', error)
      return { success: false, error: 'Failed to submit support message. Please try again.' }
    }
    
    return { success: true, message: 'Support message submitted successfully! We will get back to you soon.', data }
  } catch (error) {
    console.error('Error submitting support message:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function getSupportMessages() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Authentication required' }
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Admin access required' }
    }
    
    // First get support messages
    const { data: messages, error: messagesError } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (messagesError) {
      console.error('Error fetching support messages:', messagesError)
      return { success: false, error: 'Failed to fetch support messages' }
    }
    
    // Then get user profiles for messages that have user_id
    const userIds = messages?.filter(m => m.user_id).map(m => m.user_id) || []
    let userProfiles: any[] = []
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', userIds)
      
      userProfiles = profiles || []
    }
    
    // Combine the data
    const messagesWithProfiles = messages?.map(message => ({
      ...message,
      user_profile: message.user_id ? userProfiles.find(p => p.id === message.user_id) : null,
      assigned_admin: message.assigned_to ? userProfiles.find(p => p.id === message.assigned_to) : null
    })) || []
    
    return { success: true, data: messagesWithProfiles }
  } catch (error) {
    console.error('Error fetching support messages:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateSupportMessage(id: string, updates: Partial<SupportMessage>) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Authentication required' }
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Admin access required' }
    }
    
    const updateData: any = { ...updates }
    
    // Set resolved_at when status changes to resolved
    if (updates.status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
    } else if (updates.status && updates.status !== 'resolved') {
      updateData.resolved_at = null
    }
    
    const { error } = await supabase
      .from('support_messages')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      console.error('Error updating support message:', error)
      return { success: false, error: 'Failed to update support message' }
    }
    
    revalidatePath('/admin/support')
    return { success: true, message: 'Support message updated successfully' }
  } catch (error) {
    console.error('Error updating support message:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
