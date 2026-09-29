import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase_api';
import CommentMenu from './CommentMenu';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

export default function PostCard({
  postId,
  postUserId,
  username,
  text,
  imageUrl,
  createdAt,
  initialLikesCount,
  initialCommentsCount,
  initialLiked,
  onDelete,
}) {
  const navigate = useNavigate();
  const date = new Date(createdAt).toLocaleDateString();

  const [currentUser, setCurrentUser] = useState(null);
  const [isPostOwner, setIsPostOwner] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postText, setPostText] = useState(text);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setCurrentUser(user);
      setIsPostOwner(user?.id === postUserId);

      if (user) {
        const { data } = await supabase
          .from('saved_posts')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .maybeSingle();

        setSaved(!!data);
      }
    });
  }, [postUserId, postId]);

  const handleDeletePost = async () => {
    await supabase.from('posts').delete().eq('id', postId);
    onDelete(postId);
  };

  const handleEditPost = async () => {
    if (!editText.trim()) return;
    await supabase.from('posts').update({ text: editText }).eq('id', postId);
    setPostText(editText);
    setEditing(false);
    setMenuOpen(false);
  };

  const handleLike = async () => {
    if (!currentUser) return;
    if (liked) {
      await supabase.from('likes').delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
      setLikesCount(prev => prev - 1);
      setLiked(false);
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: currentUser.id });
      setLikesCount(prev => prev + 1);
      setLiked(true);
    }
  };

  const handleSavePost = async () => {
    if (!currentUser) return;

    // optimistic update
    setSaved(prev => !prev);

    try {
      if (saved) {
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', postId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_posts')
          .insert({ user_id: currentUser.id, post_id: postId });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
      // revert on failure
      setSaved(prev => !prev);
    }
  };

  const handleShowComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next) {
      const { data } = await supabase
        .from('comments')
        .select('id, text, created_at, user_id, profiles ( full_name )')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (data) setComments(data);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: currentUser.id, text: newComment })
      .select('id, text, created_at, user_id, profiles ( full_name )')
      .single();
    if (!error && data) {
      setComments(prev => [...prev, data]);
      setCommentsCount(prev => prev + 1);
      setNewComment('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 dark:bg-gray-800 dark:border-gray-700">


      {/* Header */}
      <div className="flex items-center justify-between w-full">

        {/* Left: clickable avatar + name */}
        <div
          className="flex items-center cursor-pointer gap-3"
          onClick={() => navigate(`/profile/${postUserId}`)}
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center">
            {username[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white hover:underline">{username}</h2>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>

        {/* Right: three dots — only for post owner */}
        {isPostOwner && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full"
            >
              <BsThreeDotsVertical size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg z-10 w-28">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeletePost(); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <hr className="border-gray-100 dark:border-gray-700" />

      {/* Content */}
      <div>
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm outline-none dark:bg-gray-700 dark:text-white resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleEditPost} className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-600">Save</button>
              <button onClick={() => setEditing(false)} className="text-gray-400 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">{postText}</p>
        )}
        {imageUrl && (
          <img src={imageUrl} alt="Post" className="mt-3 w-full object-contain rounded-lg max-h-96" />
        )}
      </div>

      <hr className="border-gray-100 dark:border-gray-700" />

      {/* Actions */}
      <div className="flex justify-between items-center px-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400 dark:text-gray-400'}`}
        >
          ❤️ <span>{likesCount} Likes</span>
        </button>

        <button
          onClick={handleShowComments}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400"
        >
          💬 <span>{commentsCount} Comments</span>
        </button>

        <button
          onClick={handleSavePost}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${saved ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-400 dark:text-gray-400'}`}
        >
          🔖 <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="flex flex-col gap-3 mt-2">
          <hr className="border-gray-100 dark:border-gray-700" />

          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No comments yet</p>
          ) : (
            comments.map(comment => {
              const isCommentOwner = currentUser?.id === comment.user_id;
              return (
                <div key={comment.id} className="flex gap-3 items-start">

                  {/* Clickable comment avatar */}
                  <div
                    className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${comment.user_id}`)}
                  >
                    {comment.profiles?.full_name?.[0].toUpperCase() || '?'}
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 flex-1">
                    <div className="flex justify-between items-center">

                      {/* Clickable comment name */}
                      <p
                        className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:underline"
                        onClick={() => navigate(`/profile/${comment.user_id}`)}
                      >
                        {comment.profiles?.full_name}
                      </p>

                      {/* Three dots — only for comment owner */}
                      {isCommentOwner && (
                        <CommentMenu
                          commentId={comment.id}
                          commentText={comment.text}
                          onDelete={(id) => {
                            setComments(prev => prev.filter(c => c.id !== id));
                            setCommentsCount(prev => prev - 1);
                          }}
                          onEdit={(id, newText) => {
                            setComments(prev => prev.map(c => c.id === id ? { ...c, text: newText } : c));
                          }}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{comment.text}</p>
                  </div>
                </div>
              );
            })
            
          )}

          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2 text-sm outline-none dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}