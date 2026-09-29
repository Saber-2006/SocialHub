// src/pages/SavedPosts.jsx
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { getSavedPosts, supabase } from '../lib/supabase_api';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const data = await getSavedPosts(user.id);
        setPosts(data);
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleUnsave = (postId) => {
    // remove it from this list immediately when unsaved, since it no longer belongs here
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const skeleton = (
    <div className="flex flex-col gap-4 max-w-xl mx-auto mt-20 p-4">
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="rectangular" width={510} height={60} />
        <Skeleton variant="rounded" width={510} height={60} />
      </Stack>
    </div>
  );

  if (loading || currentUser === undefined) return skeleton;

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Saved Posts</h1>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">You haven't saved any posts yet.</p>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            postId={post.id}
            postUserId={post.user_id}
            username={post.profiles?.full_name || 'Unknown'}
            text={post.text}
            imageUrl={post.image_url}
            createdAt={post.created_at}
            initialLikesCount={post.likes?.length || 0}
            initialCommentsCount={post.comments?.length || 0}
            initialLiked={post.likes?.some(l => l.user_id === currentUser?.id) || false}
            onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
          />
        ))
      )}
    </div>
  );
}