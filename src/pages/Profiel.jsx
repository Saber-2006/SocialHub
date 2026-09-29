import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase_api';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const targetId = userId || user?.id;
      setIsOwnProfile(targetId === user?.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url')
        .eq('id', targetId)
        .single();
      if (profileData) {
        setProfile(profileData);
        setBioText(profileData.bio || '');
      }

      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id, text, image_url, created_at, user_id,
          profiles ( full_name ),
          likes ( id, user_id ),
          comments ( id )
        `)
        .eq('user_id', targetId)
        .order('created_at', { ascending: false });
      if (postsData) setPosts(postsData);

      const { count: fCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetId);
      setFollowersCount(fCount || 0);

      const { count: fgCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetId);
      setFollowingCount(fgCount || 0);

      if (user && targetId !== user.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetId)
          .single();
        setIsFollowing(!!followData);
      }

      setLoading(false);
    };

    load();
  }, [userId]);

  const handleFollow = async () => {
    if (!currentUser) return;
    const targetId = userId || currentUser.id;

    if (isFollowing) {
      await supabase.from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', targetId);
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
    } else {
      await supabase.from('follows')
        .insert({ follower_id: currentUser.id, following_id: targetId });
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
  };

  const handleSaveBio = async () => {
    if (!currentUser) return;
    setSavingBio(true);

    const { error } = await supabase
      .from('profiles')
      .update({ bio: bioText })
      .eq('id', currentUser.id);

    if (!error) {
      setProfile(prev => ({ ...prev, bio: bioText }));
      setEditingBio(false);
    }
    setSavingBio(false);
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading...</div>;
  if (!profile) return <div className="text-center mt-20 text-gray-500">User not found</div>;

  return (
    <div className="max-w-xl mx-auto mt-24 p-4 flex flex-col gap-4">

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center gap-4">

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-blue-500 text-white text-3xl font-bold flex items-center justify-center">
          {profile.full_name?.[0].toUpperCase()}
        </div>

        {/* Name */}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h1>

        {/* Bio section */}
        {isOwnProfile ? (
          editingBio ? (
            // Edit mode
            <div className="flex flex-col gap-2 w-full">
              <textarea
                value={bioText}
                onChange={e => setBioText(e.target.value)}
                placeholder="Write something about yourself..."
                rows={3}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm outline-none dark:bg-gray-700 dark:text-white resize-none"
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-600 disabled:opacity-50"
                >
                  {savingBio ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingBio(false); setBioText(profile.bio || ''); }}
                  className="text-gray-400 text-sm px-4 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View mode for own profile
            <div className="flex flex-col items-center gap-1 w-full">
              {profile.bio ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">{profile.bio}</p>
              ) : (
                <p className="text-gray-400 text-sm text-center italic">No bio yet</p>
              )}
              <button
                onClick={() => setEditingBio(true)}
                className="text-blue-500 text-xs hover:underline mt-1"
              >
                {profile.bio ? 'Edit bio' : '+ Add bio'}
              </button>
            </div>
          )
        ) : (
          // View mode for other profiles
          profile.bio ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">{profile.bio}</p>
          ) : null
        )}

        {/* Stats */}
        <div className="flex gap-8 mt-2">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{posts.length}</span>
            <span className="text-xs text-gray-500">Posts</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{followersCount}</span>
            <span className="text-xs text-gray-500">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{followingCount}</span>
            <span className="text-xs text-gray-500">Following</span>
          </div>
        </div>

        {/* Follow button — only on other profiles */}
        {!isOwnProfile && (
          <button
            onClick={handleFollow}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              isFollowing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      {/* Posts */}
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mt-2">Posts</h2>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400 text-sm">No posts yet</p>
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