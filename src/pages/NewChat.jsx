// src/pages/NewChat.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getFollowingList, findExistingConversation, createConversation } from '../lib/supabase_api'

export default function NewChat() {
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()


  useEffect(() => {
  const testAuth = async () => {
    const { data, error } = await supabase.rpc('debug_auth_uid')
    console.log('auth.uid() resolved as:', data, error)
  }
  testAuth()
}, [])

  useEffect(() => {
    loadFollowing()
  }, [])

  const loadFollowing = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const data = await getFollowingList(user.id)
    setFollowing(data)
    setLoading(false)
  }

  const handleSelectUser = async (otherUser) => {
    const { data: { user } } = await supabase.auth.getUser()

    // Check if a conversation already exists so we don't create duplicates
    const existingId = await findExistingConversation(user.id, otherUser.id)

    if (existingId) {
      navigate(`/chat/${existingId}`)
      return
    }

    const conversation = await createConversation({
      createdBy: user.id,
      isGroup: false,
      memberIds: [otherUser.id]
    })

    navigate(`/chat/${conversation.id}`)
  }

  if (loading) return <p className='text-center mt-10'>Loading...</p>

  return (
    <div className='p-4'>
      <h1 className='text-xl font-bold mb-4 dark:text-white'>Start a Chat</h1>
      <div className='flex flex-col gap-2'>
        {following.length > 0 ? (
          following.map(user => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className='p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-3'
            >
              <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold'>
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <span className='font-medium dark:text-white'>{user.full_name}</span>
            </div>
          ))
        ) : (
          <p>You're not following anyone yet.</p>
        )}
      </div>
    </div>
  )
}

// Subscribe to new messages in real time
export const subscribeToMessages = (conversationId, onNewMessage) => {
  // Safety check: remove any existing connection for this chat before starting a new one
  const existingChannel = supabase.getChannels().find(
    (ch) => ch.topic === `realtime:messages:${conversationId}`
  )
  if (existingChannel) {
    supabase.removeChannel(existingChannel)
  }

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        onNewMessage(payload.new)
      }
    )
    .subscribe()

  return channel
}