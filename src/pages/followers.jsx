import React, { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase_api'
import Followerscard from '../components/Followerscard';


export default function Followers() {
const [currentUser, setCurrentUser] = useState(null)
const [followers, setFollowers] = useState([])
const [otherPages, setOtherPages] = useState([])
const [followingIds, setFollowingIds] = useState(new Set())
const [loading, setLoading] = useState(true)

useEffect(() => {
fetchData()
}, [])

const fetchData = async () => {
setLoading(true)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  setCurrentUser(user)

  // 1. Get the profiles the current user IS following
  const { data: myFollowing, error: followingError } = await supabase
    .from('follows')
    .select('following_id, profiles:following_id(id, full_name, bio)')
    .eq('follower_id', user.id)

  console.log('myFollowing:', myFollowing, 'error:', followingError)

  const followingProfiles = myFollowing?.map(f => f.profiles) || []
  setFollowers(followingProfiles) // reuse this state, or rename it (see note below)

  const followingIdSet = new Set(followingProfiles.map(p => p.id))
  setFollowingIds(followingIdSet)

  // 2. Get all other profiles (excluding self and excluding people already followed)
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, bio')
    .neq('id', user.id)

  const others = allProfiles?.filter(p => !followingIdSet.has(p.id)) || []
  setOtherPages(others)

  setLoading(false)
}



  const handleToggleFollow = async (pageId, isCurrentlyFollowing) => {
    // optimistic update
    setFollowingIds(prev => {
      const updated = new Set(prev)
      if (isCurrentlyFollowing) {
        updated.delete(pageId)
      } else {
        updated.add(pageId)
      }
      return updated
    })

    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', pageId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: currentUser.id, following_id: pageId })

        if (error) throw error
      }
    } catch (err) {
      console.error('Follow toggle failed:', err)
      // revert on failure
      setFollowingIds(prev => {
        const reverted = new Set(prev)
        if (isCurrentlyFollowing) {
          reverted.add(pageId)
        } else {
          reverted.delete(pageId)
        }
        return reverted
      })
    }
  }

  if (loading) {
    return <p className='text-center mt-10'>Loading...</p>
  }

  return (
    <div className='flex flex-col gap-8 p-4'>
      <div>
        <h1 className='text-xl font-bold mb-4 dark:text-white'>Accounts You Follow</h1>
        <div className='flex flex-wrap gap-4'>
          {followers.length > 0 ? (
            followers.map(page => (
              <Followerscard
                key={page.id}
                page={page}
                isFollowing={followingIds.has(page.id)}
                onToggleFollow={handleToggleFollow}
              />
            ))
          ) : (
            <p>No accounts followed yet.</p>
          )}
        </div>
      </div>

      <div>
        <h1 className='text-xl font-bold mb-4 dark:text-white'>Other Pages</h1>
        <div className='flex flex-wrap gap-4'>
          {otherPages.length > 0 ? (
            otherPages.map(page => (
              <Followerscard
                key={page.id}
                page={page}
                isFollowing={followingIds.has(page.id)}
                onToggleFollow={handleToggleFollow}
              />
            ))
          ) : (
            <p>No other pages to show.</p>
          )}
        </div>
      </div>
    </div>
  )
}