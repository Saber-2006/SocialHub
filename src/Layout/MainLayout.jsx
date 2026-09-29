import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router'
import NaveBare from '../components/NaveBare'
import Toast from '../components/Toast'
import { supabase, getUserConversationIds, getProfileName } from '../lib/supabase_api'

export default function MainLayout() {
  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let channel
    let isActive = true

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const conversationIds = await getUserConversationIds(user.id)
      if (conversationIds.length === 0) return

      channel = supabase
        .channel('global-message-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=in.(${conversationIds.join(',')})`
          },
          async (payload) => {
            if (!isActive) return

            const newMessage = payload.new

            // Don't show a toast for messages I sent myself
            if (newMessage.sender_id === user.id) return

            // Don't show a toast if I'm already looking at that exact chat
            const isViewingThisChat = location.pathname === `/chat/${newMessage.conversation_id}`
            if (isViewingThisChat) return

            const senderName = await getProfileName(newMessage.sender_id)
            const preview = newMessage.image_url ? '📷 Image' : newMessage.content

            const toastId = Date.now()
            setToasts(prev => [...prev, {
              id: toastId,
              conversationId: newMessage.conversation_id,
              senderName,
              preview
            }])

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
              setToasts(prev => prev.filter(t => t.id !== toastId))
            }, 5000)
          }
        )
        .subscribe()
    }

    setup()

    return () => {
      isActive = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [location.pathname])

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const handleToastClick = (conversationId, toastId) => {
    navigate(`/chat/${conversationId}`)
    dismissToast(toastId)
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <NaveBare />
        <Outlet />
      </div>

      {/* Toast notifications, stacked if multiple */}
      <div className='fixed top-4 right-4 flex flex-col gap-2 z-50'>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast}
            onClick={() => handleToastClick(toast.conversationId, toast.id)}
            onClose={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </>
  )
}