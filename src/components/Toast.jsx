// src/components/Toast.jsx
import React from 'react'

export default function Toast({ message, onClick, onClose }) {
  return (
    <div
      onClick={onClick}
      className='fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 shadow-lg rounded-lg p-3 w-72 cursor-pointer z-50 flex justify-between items-start gap-2'
    >
      <div>
        <p className='font-semibold text-gray-800 dark:text-white text-sm'>{message.senderName}</p>
        <p className='text-sm text-gray-500 truncate'>{message.preview}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className='text-gray-400 hover:text-gray-600 text-sm'
      >
        ✕
      </button>
    </div>
  )
}