// src/pages/ChatList.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getConversations, getUnreadCounts } from '../lib/supabase_api'



export default function ChatList() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCounts, setUnreadCounts] = useState({})

  const navigate = useNavigate()


  useEffect(() => {
    loadConversations()
  }, [])
const loadConversations = async () => {
  setLoading(true)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const data = await getConversations(user.id)
  setConversations(data)

  const counts = await getUnreadCounts(user.id)
  setUnreadCounts(counts)

  setLoading(false)
}

  const getDisplayName = (conv) => {
    if (conv.is_group) return conv.name || 'Group Chat'
    return conv.otherParticipants[0]?.full_name || 'Unknown User'
  }

  const getPreviewText = (conv) => {
    if (!conv.lastMessage) return 'No messages yet'
    if (conv.lastMessage.image_url) return '📷 Image'
    return conv.lastMessage.content
  }

  if (loading) return <p className='text-center mt-10'>Loading...</p>

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-xl font-bold dark:text-white'>Messages</h1>
        <div className='flex gap-2'>
          <button
            onClick={() => navigate('/chat/new')}
            className='bg-blue-500 text-white px-3 py-1 rounded-md text-sm'
          >
            New Chat
          </button>
          <button
            onClick={() => navigate('/chat/new-group')}
            className='bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm'
          >
            New Group
          </button>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        {conversations.length > 0 ? (
        conversations.map(conv => (
            <div
    key={conv.id}
    onClick={() => navigate(`/chat/${conv.id}`)}
    className='p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex justify-between items-center'
  >
    <div>
      <h2 className='font-semibold text-gray-800 dark:text-white'>
        {getDisplayName(conv)}
      </h2>
      <p className='text-sm text-gray-500 truncate'>{getPreviewText(conv)}</p>
    </div>

    {unreadCounts[conv.id] > 0 && (
      <span className='bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
        {unreadCounts[conv.id]}
      </span>
    )}
  </div>
        ))
        ) : (
          <p>No conversations yet. Start one!</p>
        )}
      </div>
    </div>
  )
}