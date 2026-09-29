import React from 'react'
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-blue-500 dark:text-blue-400">404</h1>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-4">
          Page Not Found
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mt-2">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex gap-3 justify-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}