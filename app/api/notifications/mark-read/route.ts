import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { notificationId } = await request.json()
    
    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', currentUser.id)

    if (error) {
      console.error('Mark notification as read error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark notification as read error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
