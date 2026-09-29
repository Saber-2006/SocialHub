import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Followerscard({ page, isFollowing, onToggleFollow }) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/profile/${page.id}`)
  }

  const handleFollowClick = (e) => {
    e.stopPropagation() // prevent card click (navigation) from firing
    onToggleFollow(page.id, isFollowing)
  }

  return (
    <div
      onClick={handleCardClick}
      className='w-full p-4 bg-white rounded-lg shadow-md 
      flex flex-col gap-2 dark:bg-gray-800 dark:border-gray-700 
      border border-gray-100 hover:shadow-lg transition-shadow 
      duration-300 cursor-pointer 
       md:flex-row gap-4 justify-between
      '
    >
      <div className='flex items-center gap-3 h-full'>
        <div className='w-10 h-10 bg-gray-300 rounded-full inline-flex items-center justify-center text-gray-600 font-bold'>
          {page.full_name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-white'>
            {page.full_name}
          </h2>

        </div>
      </div>
      <div className='flex items-center gap-2 mt-2'>
        {isFollowing ? (
          <button
            onClick={handleFollowClick}
            className='bg-gray-200 text-gray-800 px-4 py-1 rounded-md hover:bg-gray-300 transition-colors duration-300'
          >
            Unfollow
          </button>
        ) : (
          <button
            onClick={handleFollowClick}
            className='bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition-colors duration-300'
          >
            Follow
          </button>
        )}
      </div>
    </div>
  )
}