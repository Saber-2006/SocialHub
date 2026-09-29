import { useState } from 'react';
import { supabase } from '../lib/supabase_api';
import { FiImage, FiX } from 'react-icons/fi';

export default function CreatPost({ onPostCreated }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);      // actual file
  const [preview, setPreview] = useState(null);  // preview URL
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file)); // show preview instantly
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    let image_url = null;

    // upload image if one was selected
 if (image) {
  const fileName = `${user.id}-${Date.now()}-${image.name}`;
  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(fileName, image);

  console.log('uploadError:', uploadError); // 👈
  
  if (!uploadError) {
    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);
    
    console.log('image_url:', data.publicUrl); // 👈
    image_url = data.publicUrl;
  }
}

    // insert post
    const { data, error } = await supabase
      .from('posts')
      .insert({ user_id: user.id, text, image_url })
      .select('id, text, image_url, created_at, profiles ( full_name )')
      .single();

    if (!error && data) {
      setText('');
      setImage(null);
      setPreview(null);
      onPostCreated(data); // 👈 tell Feed to add this post to the top
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 dark:bg-gray-800 dark:border-gray-700">
      
      {/* Text input */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full resize-none outline-none text-gray-800 dark:text-gray-200 dark:bg-gray-800 placeholder-gray-400 text-base"
      />

      {/* Image preview */}
    {/* Image preview */}
{preview && (
  <div className="relative w-full">
    <img 
      src={preview} 
      alt="preview" 
      className="w-full rounded-lg object-contain max-h-96" // 👈 contain instead of cover
    />
    <button
      onClick={removeImage}
      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
    >
      <FiX size={16} />
    </button>
  </div>
)}
      <hr className="border-gray-100 dark:border-gray-700" />

      {/* Actions */}
      <div className="flex justify-between items-center">
        
        {/* Image upload button */}
        <label className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-500 cursor-pointer">
          <FiImage size={20} />
          <span>Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {/* Post button */}
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}