import React from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Feed from './pages/Feed'
import MainLayout from './Layout/MainLayout';
import Profile from './pages/Profiel';
import PostDetails from './pages/Postdetails';
import NotFound from './pages/NotFound';
import AuthLayout from './Layout/AuthLayout';
import Signup from './pages/Signup';
import Singin from './pages/Singin';
import Followers from './pages/followers';
import ProtectedRoute from './components/ProtectedRoute';
import ChatList from './pages/ChatList'
import NewChat from './pages/NewChat'
import NewGroupChat from './pages/NewGroupChat'
import ChatRoom from './pages/ChatRoom'
import SavedPosts from './pages/SavedPosts'
import Settings from './pages/Settings'



function App() {
 const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <ProtectedRoute><Feed /></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: 'profile/:userId', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: 'post-details', element: <ProtectedRoute><PostDetails /></ProtectedRoute> },
      { path: 'followers', element: <ProtectedRoute><Followers /></ProtectedRoute> },
      { path: 'chat', element: <ProtectedRoute><ChatList /></ProtectedRoute> },
      { path: 'chat/new', element: <ProtectedRoute><NewChat /></ProtectedRoute> },
      { path: 'chat/new-group', element: <ProtectedRoute><NewGroupChat /></ProtectedRoute> },
      { path: 'chat/:conversationId', element: <ProtectedRoute><ChatRoom /></ProtectedRoute> },
      { path: 'saved', element: <ProtectedRoute><SavedPosts /></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute><Settings /></ProtectedRoute> }

    ]
  },
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      { path: 'signup', element: <Signup /> },
      { path: 'singin', element: <Singin /> }
    ]
  },
  { path: '*', element: <NotFound /> }
])

return <RouterProvider router={router} />
}

export default App