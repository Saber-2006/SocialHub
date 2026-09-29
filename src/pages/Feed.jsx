import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { getFollowersCount, getFollowingCount, supabase } from "../lib/supabase_api";
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import CreatPost from '../components/CreatPost';
import { useNavigate } from 'react-router-dom';
import Followers from './followers';
import { FaArrowRight } from "react-icons/fa";
export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [followersCount, setFollowersCount] = useState(0)
const [followingCount, setFollowingCount] = useState(0)
  const navigate = useNavigate();

  const loadCounts = async (userId) => {
  const followers = await getFollowersCount(userId)
  const following = await getFollowingCount(userId)
  setFollowersCount(followers)
  setFollowingCount(following)
}

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
         if (user) {
      loadCounts(user.id); // 👈 add this line
    }

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          text,
          image_url,
          created_at,
          user_id,
          profiles ( full_name ),
          likes ( id, user_id ),
          comments ( id )
        `)
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      else setPosts(data);
      setLoading(false);
    };

    init();
  }, []);


  
  const name= currentUser?.user_metadata?.full_name || "guest";
  const email= currentUser?.email || "no email"; 



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
   <div className='w-full min-h-screen bg-gray-100 dark:bg-gray-900 md:grid md:grid-cols-[1fr_2fr_1fr] md:gap-4'>

<div
  className="
    hidden md:flex
    self-start
    sticky top-50
    flex-col gap-4 
    bg-white/5 backdrop-blur-md rounded-lg shadow-lg p-4
  "
>

  <div className="flex flex-col gap-2 items-center justify-center">
  <div className="rounded-full bg-gray-300 h-16 w-16 flex items-center justify-center text-2xl font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
    {name ? name[0].toUpperCase() : '?'}
  </div> 
  

  <div className="text-center">
    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
      {name}
    </h2>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {email}
    </p>
  </div> 
</div> 

<div className="flex flex-col gap-2  justify-center mt-4">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 ">Network</h2>
  <div className="flex flex-row items-center justify-between mt-4">
  <div className='flex gap-4 '>
  <div className='text-center'>
    <p className='font-bold text-lg'>{followersCount}</p>
    <p className='text-sm text-gray-500'>Followers</p>
  </div>
  <div className='text-center'>
    <p className='font-bold text-lg'>{followingCount}</p>
    <p className='text-sm text-gray-500'>Following</p>
  </div>
</div>
<div>
<button
  className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition-colors duration-300"
  onClick={() => navigate("/Followers")}
>
  View All 
<FaArrowRight className="inline ml-1" />
</button>
</div>
</div>
</div>
<div className="flex flex-row gap-2 items-center justify-between mt-4">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">chats </h2>
  <div className="flex flex-row gap-2">
    <button className="bg-blue-500 text-white p-1 
    rounded-lg hover:bg-blue-600 transition-colors"
    onClick={() => navigate("/chat/new")}
    >
      New Chat
    </button>
    <button className="bg-green-500 text-white
     rounded-lg p-1
     hover:bg-green-600 transition-colors"
     onClick={() => navigate("/chat/new-group")}
     >
      New Group
    </button>

  </div>
 

</div>

 <div className="flex flex-row gap-2 items-center justify-between mt-4">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Saved Posts</h2>
    <button
  className="bg-yellow-500 text-white rounded-lg p-1 hover:bg-yellow-600 transition-colors"
  onClick={() => navigate("/saved")}
>
  Saved Posts
</button>
  </div> 
</div>
    <div className="flex flex-col gap-4 w-full mx-auto  p-4">
      <CreatPost
        currentUser={currentUser}
        onPostCreated={(newPost) => {
          setPosts(prev => [{
            ...newPost,
            likes: [],
            comments: [],
          }, ...prev]);
        }}
      />

      {posts.map(post => (
        <PostCard
          key={post.id}
          postId={post.id}
          postUserId={post.user_id}  // 👈 pass post owner id
          username={post.profiles?.full_name || 'Unknown'}
          text={post.text}
          imageUrl={post.image_url}
          createdAt={post.created_at}
          initialLikesCount={post.likes?.length || 0}
          initialCommentsCount={post.comments?.length || 0}
          initialLiked={post.likes?.some(l => l.user_id === currentUser?.id) || false}
          onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
        />
      ))}
    </div>

    <div  className="hidden md:flex
    self-start
    sticky top-30
    flex-col gap-4 
    overflow-y-auto max-h-screen
    bg-white/5 backdrop-blur-md rounded-lg shadow-lg p-4
  ">
      <Followers currentUser={currentUser} />

    </div>

   </div>

  );
}