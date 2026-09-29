// ============================================================
// FILE: supabase_api.js
// WHERE TO PUT IT: src/lib/supabase_api.js
// ============================================================
// SETUP REQUIRED:
//   1. Install: npm install @supabase/supabase-js
//   2. Create a .env file in your project root with:
//      VITE_SUPABASE_URL=https://your-project-id.supabase.co
//      VITE_SUPABASE_ANON_KEY=your-anon-key
//      (Find these in: Supabase Dashboard → Settings → API)
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════

/**
 * Sign up a new user.
 * The trigger in the DB will auto-create their profile.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} full_name
 * @param {number} age
 * @param {string} gender  - one of: male | female | other | prefer-not-to-say
 * @returns {object} { user, session }
 */
export async function signUp(email, password, full_name, age, gender) {
const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, age, gender }, // stored in raw_user_meta_data; trigger reads it
    },
});

if (error) throw new Error(error.message);

  // If email confirmation is enabled in Supabase, user.session will be null.
  // The profile is created by the trigger when the user confirms their email.
return data;
}

/**
 * Sign in with email and password.
 * @returns {object} { user, session }
 */
export async function signIn(email, password) {
const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/**
 * Get the currently logged-in user object from Supabase Auth.
 * Returns null if nobody is logged in.
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

/**
 * Listen for auth state changes (login, logout, token refresh).
 * Use this in your root App component.
 *
 * @param {function} callback  - called with (event, session)
 * @returns {object}  subscription — call subscription.unsubscribe() on cleanup
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

/**
 * Change the current user's password.
 * The user must be logged in.
 *
 * @param {string} newPassword
 */


// ════════════════════════════════════════════════════════════
// PROFILES
// ════════════════════════════════════════════════════════════

/**
 * Fetch a single profile by user id.
 * Returns the profile row or throws.
 *
 * @param {string} userId  - UUID
 */
export async function getProfile(userId) {
const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

if (error) throw new Error(error.message);
return data;
}

/**
 * Update the current user's profile fields.
 * Pass only the fields you want to change.
 *
 * @param {string} userId
 * @param {object} updates  - e.g. { full_name: 'Jane', bio: 'Hello' }
 */
export async function updateProfile(userId, updates) {
// Prevent accidental update of protected fields
  const { id, email, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('profiles')
    .update(safeUpdates)
    .eq('id', userId)
    .select()
    .single();

if (error) throw new Error(error.message);
return data;
}

/**
 * Upload a new profile photo and update the profile's avatar_url.
 *
 * @param {string} userId
 * @param {File}   file     - the image File object from an <input type="file">
 * @returns {string}  the new public avatar URL
 *
 * Usage example:
 *   const avatarUrl = await updateProfilePhoto(user.id, fileInputRef.current.files[0]);
 */
export async function updateProfilePhoto(userId, file) {
  // Build a unique file path: avatars/{userId}/avatar.{ext}
const ext      = file.name.split('.').pop();
const filePath = `${userId}/avatar.${ext}`;

  // Upload (upsert: replaces existing file with same name)
 const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

if (uploadError) throw new Error(uploadError.message);

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Save the URL to the profile row
  await updateProfile(userId, { avatar_url: publicUrl });

  return publicUrl;
}

/**
 * Get all page accounts (is_page = true).
 * Used to show "suggested pages to follow" on first login.
 */
export async function getPages() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_page', true)
    .order('full_name');

  if (error) throw new Error(error.message);
  return data;
}

// ════════════════════════════════════════════════════════════
// POSTS
// ════════════════════════════════════════════════════════════

/**
 * Fetch all posts for the global feed.
 * Each post includes the author's profile (full_name, avatar_url)
 * and a count of comments and likes.
 * Sorted newest first.
 *
 * @param {number} [limit=20]   - how many posts to load
 * @param {number} [offset=0]   - for pagination
 */
export async function getFeedPosts(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles ( id, full_name, avatar_url, is_page ),
      comments ( count ),
      likes    ( count )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch posts only from users the current user follows.
 * Falls back to getFeedPosts if the user follows nobody.
 *
 * @param {string} userId  - the logged-in user's id
 * @param {number} [limit=20]
 * @param {number} [offset=0]
 */
export async function getFollowingFeedPosts(userId, limit = 20, offset = 0) {
  // First, get the list of user IDs this user follows
  const { data: followData, error: followError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  if (followError) throw new Error(followError.message);

  // If not following anyone, return the global feed
  if (!followData || followData.length === 0) {
    return getFeedPosts(limit, offset);
  }

  const followingIds = followData.map(f => f.following_id);

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles ( id, full_name, avatar_url, is_page ),
      comments ( count ),
      likes    ( count )
    `)
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch a single post by id, including author, comments, and likes.
 *
 * @param {string} postId
 */
export async function getPostById(postId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles ( id, full_name, avatar_url, is_page ),
      comments (
        *,
        profiles ( id, full_name, avatar_url )
      ),
      likes ( count )
    `)
    .eq('id', postId)
    .order('created_at', { referencedTable: 'comments', ascending: true })
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch all posts by a specific user (for their Profile page).
 *
 * @param {string} userId
 */
export async function getUserPosts(userId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles ( id, full_name, avatar_url, is_page ),
      comments ( count ),
      likes    ( count )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Create a new post (with optional image).
 *
 * @param {string}  userId
 * @param {string}  text       - required
 * @param {File}    [imageFile] - optional image File object
 * @returns {object}  the created post row
 *
 * Usage with image:
 *   await createPost(user.id, "Hello world!", fileInput.files[0]);
 *
 * Usage without image:
 *   await createPost(user.id, "Hello world!");
 */
export async function createPost(userId, text, imageFile = null) {
  let image_url = null;

  // Upload image first if provided
  if (imageFile) {
    const ext      = imageFile.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, imageFile);

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    image_url = publicUrl;
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, text, image_url })
    .select(`
      *,
      profiles ( id, full_name, avatar_url )
    `)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a post (only the owner can do this; enforced by RLS).
 *
 * @param {string} postId
 */
export async function deletePost(postId) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw new Error(error.message);
}

// ════════════════════════════════════════════════════════════
// COMMENTS
// ════════════════════════════════════════════════════════════

/**
 * Fetch all comments for a post, newest first, with author info.
 *
 * @param {string} postId
 */
export async function getComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles ( id, full_name, avatar_url )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Create a comment on a post (with optional image).
 *
 * @param {string}  postId
 * @param {string}  userId
 * @param {string}  text        - required
 * @param {File}    [imageFile] - optional
 * @returns {object}  the created comment row with author profile
 *
 * Usage:
 *   await createComment(post.id, user.id, "Great post!", fileInput.files[0]);
 */
export async function createComment(postId, userId, text, imageFile = null) {
  let image_url = null;

  if (imageFile) {
    const ext      = imageFile.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('comment-images')
      .upload(filePath, imageFile);

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('comment-images')
      .getPublicUrl(filePath);

    image_url = publicUrl;
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: userId, text, image_url })
    .select(`
      *,
      profiles ( id, full_name, avatar_url )
    `)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a comment (only the owner can do this; enforced by RLS).
 *
 * @param {string} commentId
 */
export async function deleteComment(commentId) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw new Error(error.message);
}

// ════════════════════════════════════════════════════════════
// LIKES
// ════════════════════════════════════════════════════════════

/**
 * Like a post. Safe to call even if already liked (does nothing).
 *
 * @param {string} postId
 * @param {string} userId
 */
export async function likePost(postId, userId) {
  const { error } = await supabase
    .from('likes')
    .insert({ post_id: postId, user_id: userId });

  // Error code 23505 = unique violation (already liked) — safe to ignore
  if (error && error.code !== '23505') throw new Error(error.message);
}

/**
 * Unlike a post.
 *
 * @param {string} postId
 * @param {string} userId
 */
export async function unlikePost(postId, userId) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

/**
 * Check if the current user has liked a specific post.
 *
 * @param {string} postId
 * @param {string} userId
 * @returns {boolean}
 */
export async function hasLikedPost(postId, userId) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle(); // returns null instead of error if not found

  if (error) throw new Error(error.message);
  return data !== null;
}

/**
 * Get the total like count for a post.
 *
 * @param {string} postId
 * @returns {number}
 */
export async function getLikeCount(postId) {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) throw new Error(error.message);
  return count;
}

// ════════════════════════════════════════════════════════════
// FOLLOWS
// ════════════════════════════════════════════════════════════

/**
 * Follow a user.
 *
 * @param {string} followerId   - the person doing the following
 * @param {string} followingId  - the person being followed
 */
export async function followUser(followerId, followingId) {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });

  if (error && error.code !== '23505') throw new Error(error.message);
}

/**
 * Unfollow a user.
 *
 * @param {string} followerId
 * @param {string} followingId
 */
export async function unfollowUser(followerId, followingId) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) throw new Error(error.message);
}

/**
 * Check if user A is following user B.
 *
 * @param {string} followerId
 * @param {string} followingId
 * @returns {boolean}
 */
export async function isFollowing(followerId, followingId) {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data !== null;
}

/**
 * Get the follower count for a user (how many people follow them).
 *
 * @param {string} userId
 * @returns {number}
 */
export async function getFollowerCount(userId) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  if (error) throw new Error(error.message);
  return count;
}

/**
 * Get the following count for a user (how many people they follow).
 *
 * @param {string} userId
 * @returns {number}
 */
export async function getFollowingCount(userId) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  if (error) throw new Error(error.message);
  return count;
}

/**
 * Get the list of profiles that follow a user.
 *
 * @param {string} userId
 * @returns {Array}  array of profile objects
 */
export async function getFollowers(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, profiles!follows_follower_id_fkey ( id, full_name, avatar_url )')
    .eq('following_id', userId);

  if (error) throw new Error(error.message);
  return data.map(row => row.profiles);
}

/**
 * Get the list of profiles a user is following.
 *
 * @param {string} userId
 * @returns {Array}  array of profile objects
 */
export async function getFollowing(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id, profiles!follows_following_id_fkey ( id, full_name, avatar_url )')
    .eq('follower_id', userId);

  if (error) throw new Error(error.message);
  return data.map(row => row.profiles);
}

/**
 * Get follow stats and current-user follow status for a profile page.
 * One call instead of three.
 *
 * @param {string} profileUserId  - the profile being viewed
 * @param {string} [currentUserId] - the logged-in user (optional)
 * @returns {{ followerCount, followingCount, isFollowedByCurrentUser }}
 */
export async function getFollowStats(profileUserId, currentUserId = null) {
  const [followerCount, followingCount, alreadyFollowing] = await Promise.all([
    getFollowerCount(profileUserId),
    getFollowingCount(profileUserId),
    currentUserId ? isFollowing(currentUserId, profileUserId) : Promise.resolve(false),
  ]);

  return { followerCount, followingCount, isFollowedByCurrentUser: alreadyFollowing };
}

// ===== CHAT FUNCTIONS =====

// Get everyone the current user follows (for starting a new chat)
export const getFollowingList = async (userId) => {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id, profiles:following_id(id, full_name, bio)')
    .eq('follower_id', userId)

  if (error) throw error
  return data.map(f => f.profiles)
}

// Find an existing 1-on-1 conversation between two users (avoid creating duplicates)
export const findExistingConversation = async (userId, otherUserId) => {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id, conversations!inner(is_group)')
    .eq('user_id', userId)
    .eq('conversations.is_group', false)

  if (error) throw error

  // Check each of my 1-on-1 conversations to see if otherUserId is also in it
  for (const row of data) {
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', row.conversation_id)

    const ids = participants.map(p => p.user_id)
    if (ids.includes(otherUserId) && ids.length === 2) {
      return row.conversation_id
    }
  }
  return null
}

// Create a new conversation (1-on-1 or group)
// export const createConversation = async ({ createdBy, isGroup, name, memberIds }) => {
//   console.log('createdBy passed in:', createdBy)

//   const { data: { user } } = await supabase.auth.getUser()
//   console.log('Actually logged in as:', user?.id)

//   // 1. Create the conversation row
//   const { data: conversation, error: convError } = await supabase
//     .from('conversations')
//     .insert({ created_by: createdBy, is_group: isGroup, name: isGroup ? name : null })
//     .select()
//     .single()

//   if (convError) throw convError

//   // 2. Add all members (including the creator) as participants
//   const allMembers = [...new Set([createdBy, ...memberIds])]
//   const participantRows = allMembers.map(userId => ({
//     conversation_id: conversation.id,
//     user_id: userId
//   }))

//   const { error: participantsError } = await supabase
//     .from('conversation_participants')
//     .insert(participantRows)

//   if (participantsError) throw participantsError

//   return conversation
// }

export const createConversation = async ({ createdBy, isGroup, name, memberIds }) => {
  const { data: sessionData } = await supabase.auth.getSession()
  console.log('Session exists?', !!sessionData?.session)
  console.log('Access token exists?', !!sessionData?.session?.access_token)

  console.log('createdBy passed in:', createdBy)

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({ created_by: createdBy, is_group: isGroup, name: isGroup ? name : null })
    .select()
    .single()

  if (convError) throw convError

  const allMembers = [...new Set([createdBy, ...memberIds])]
  const participantRows = allMembers.map(userId => ({
    conversation_id: conversation.id,
    user_id: userId
  }))

  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert(participantRows)

  if (participantsError) throw participantsError

  return conversation
}
// Get all conversations for the current user, with last message + other participants
export const getConversations = async (userId) => {
  const { data: myParticipations, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id, conversations(id, is_group, name, created_at)')
    .eq('user_id', userId)

  if (error) throw error

  const conversations = []

  for (const row of myParticipations) {
    const conv = row.conversations

    // Get other participants (for showing name/avatar on 1-on-1 chats)
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('profiles(id, full_name)')
      .eq('conversation_id', conv.id)
      .neq('user_id', userId)

    // Get the last message for preview text
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('content, image_url, created_at')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1)

    conversations.push({
      ...conv,
      otherParticipants: participants?.map(p => p.profiles) || [],
      lastMessage: lastMessages?.[0] || null
    })
  }

  // Sort by most recent activity
  conversations.sort((a, b) => {
    const aTime = a.lastMessage?.created_at || a.created_at
    const bTime = b.lastMessage?.created_at || b.created_at
    return new Date(bTime) - new Date(aTime)
  })

  return conversations
}

// Get all messages in a conversation
export const getMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, image_url, sender_id, created_at, profiles:sender_id(full_name)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// Send a text and/or image message
export const sendMessage = async ({ conversationId, senderId, content, imageFile }) => {
  let imageUrl = null

  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${conversationId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(fileName, imageFile)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName)

    imageUrl = urlData.publicUrl

    console.log('Generated image URL:', imageUrl)
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content || null,
      image_url: imageUrl
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Subscribe to new messages in real time
// Subscribe to new messages in real time
export const subscribeToMessages = (conversationId, onNewMessage) => {
  // Safety check: remove any existing connection for this chat before starting a new one
  const existingChannel = supabase.getChannels().find(
    (ch) => ch.topic === `realtime:messages:${conversationId}`
  )
  if (existingChannel) {
    supabase.removeChannel(existingChannel)
  }

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        onNewMessage(payload.new)
      }
    )
    .subscribe()

  return channel
}

// Mark a conversation as read (call this when user opens a chat)
export const markConversationAsRead = async (conversationId, userId) => {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  if (error) throw error
}

// Get unread message counts for all of a user's conversations
export const getUnreadCounts = async (userId) => {
  // 1. Get all conversations + when the user last read each one
  const { data: participations, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

  if (error) throw error

  const unreadCounts = {}

  // 2. For each conversation, count messages sent after last_read_at (and not sent by the user themself)
  for (const p of participations) {
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', p.conversation_id)
      .gt('created_at', p.last_read_at)
      .neq('sender_id', userId)

    unreadCounts[p.conversation_id] = count || 0
  }

  return unreadCounts
}
// Get all conversation IDs a user belongs to (used for the global toast listener)
export const getUserConversationIds = async (userId) => {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId)

  if (error) throw error
  return data.map(row => row.conversation_id)
}

// Get a single profile's name (used to show sender name in the toast)
export const getProfileName = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data.full_name
}
// Save a post
export const savePost = async (userId, postId) => {
  const { error } = await supabase
    .from('saved_posts')
    .insert({ user_id: userId, post_id: postId })

  if (error) throw error
}

// Unsave a post
export const unsavePost = async (userId, postId) => {
  const { error } = await supabase
    .from('saved_posts')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId)

  if (error) throw error
}

// Get all post IDs the current user has saved (to know which posts show "saved" state)
export const getSavedPostIds = async (userId) => {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', userId)

  if (error) throw error
  return data.map(row => row.post_id)
}

// Get full saved post details (for a "Saved Posts" page)
export const getSavedPosts = async (userId) => {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id, posts(*, profiles(full_name), likes(*), comments(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(row => row.posts)
}
// Get how many people follow this user (their followers)
export const getFollowersCount = async (userId) => {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', userId)

  if (error) throw error
  return count || 0
}
// Log the user out
export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Change password
export const changePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

// Permanently delete the account
export const deleteAccount = async () => {
  const { error } = await supabase.rpc('delete_user_account')
  if (error) throw error
}


