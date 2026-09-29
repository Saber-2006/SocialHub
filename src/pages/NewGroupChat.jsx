// src/pages/NewGroupChat.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getFollowingList, createConversation } from '../lib/supabase_api'

export default function NewGroupChat() {
  const [following, setFollowing] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

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

  const toggleSelect = (userId) => {
    setSelectedIds(prev => {
      const updated = new Set(prev)
      if (updated.has(userId)) {
        updated.delete(userId)
      } else {
        updated.add(userId)
      }
      return updated
    })
  }

  const handleCreateGroup = async () => {
    if (selectedIds.size < 2) {
      alert('Select at least 2 people for a group chat.')
      return
    }
    if (!groupName.trim()) {
      alert('Please enter a group name.')
      return
    }

    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()

    const conversation = await createConversation({
      createdBy: user.id,
      isGroup: true,
      name: groupName.trim(),
      memberIds: Array.from(selectedIds)
    })

    navigate(`/chat/${conversation.id}`)
  }

  if (loading) return <p className='text-center mt-10'>Loading...</p>

  return (
    <div className='p-4'>
      <h1 className='text-xl font-bold mb-4 dark:text-white'>New Group Chat</h1>

      <input
        type='text'
        placeholder='Group name'
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className='w-full p-2 border border-gray-300 rounded-md mb-4'
      />

      <p className='text-sm text-gray-500 mb-2'>Select at least 2 people:</p>

      <div className='flex flex-col gap-2 mb-4'>
        {following.length > 0 ? (
          following.map(user => (
            <div
              key={user.id}
              onClick={() => toggleSelect(user.id)}
              className={`p-3 rounded-lg shadow-sm border cursor-pointer flex items-center gap-3 transition-colors
                ${selectedIds.has(user.id) ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-100'}`}
            >
              <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold'>
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <span className='font-medium'>{user.full_name}</span>
              {selectedIds.has(user.id) && <span className='ml-auto text-blue-500'>✓</span>}
            </div>
          ))
        ) : (
          <p>You're not following anyone yet.</p>
        )}
      </div>

      <button
        onClick={handleCreateGroup}
        disabled={creating}
        className='bg-blue-500 text-white px-4 py-2 rounded-md w-full disabled:opacity-50'
      >
        {creating ? 'Creating...' : 'Create Group'}
      </button>
    </div>
  )
}