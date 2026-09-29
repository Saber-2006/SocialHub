// src/pages/ChatRoom.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, getMessages, sendMessage, subscribeToMessages, markConversationAsRead } from '../lib/supabase_api'

export default function ChatRoom() {
  const { conversationId } = useParams()
  const [messages, setMessages] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    let channel
    let isActive = true

    const setup = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  setCurrentUser(user)

  const existingMessages = await getMessages(conversationId)
  setMessages(existingMessages)

  // Mark this conversation as read now that the user has opened it
  await markConversationAsRead(conversationId, user.id)

  channel = subscribeToMessages(conversationId, (newMessage) => {
    if (isActive) {
      setMessages(prev => [...prev, newMessage])
    }
  })
}

    setup()

    return () => {
      isActive = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSend = async () => {
    if (!text.trim() && !imageFile) return

    setSending(true)
    try {
      await sendMessage({
        conversationId,
        senderId: currentUser.id,
        content: text.trim(),
        imageFile
      })
      setText('')
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }

  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='flex flex-col '>
      <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-2'>
        {messages.map(msg => {
          const isMine = msg.sender_id === currentUser?.id
          return (
            <div
              key={msg.id}
              className={`max-w-xs p-2 rounded-lg ${
                isMine ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-800 self-start'
              }`}
            >
              {msg.image_url && (
                <img src={msg.image_url} alt='sent' className='rounded-md mb-1 max-w-full' />
              )}
              {msg.content && <p>{msg.content}</p>}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div className='px-3 pt-2 flex items-center gap-2 dark:bg-gray-800 fixed bottom-16 left-0 w-full bg-white
        '>
          <img src={imagePreview} alt='preview' className='h-16 w-16 object-cover rounded-md' />
          <button
            onClick={() => { setImageFile(null); setImagePreview(null) }}
            className='text-red-500 text-sm'
          >
            Remove
          </button>
        </div>
      )}

      <div className='p-3 border-t flex items-center gap-2 dark:bg-gray-800 fixed bottom-0 left-0 w-full bg-white'>
        <label className='cursor-pointer'>
          📷
          <input
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleImageSelect}
          />
        </label>

        <input
          type='text'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={imageFile ? `Image attached: ${imageFile.name}` : 'Type a message...'}
          className='flex-1 p-2 border border-gray-300 rounded-md'
        />

        <button
          onClick={handleSend}
          disabled={sending}
          className='bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50'
        >
          Send
        </button>
      </div>
    </div>
  )
}