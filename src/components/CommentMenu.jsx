import { useState } from 'react';
import { supabase } from '../lib/supabase_api';
import { BsThreeDotsVertical } from 'react-icons/bs';

export default function CommentMenu({ commentId, commentText, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(commentText);

  const handleDelete = async () => {
    await supabase.from('comments').delete().eq('id', commentId);
    onDelete(commentId);
    setOpen(false);
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    await supabase.from('comments').update({ text: editText }).eq('id', commentId);
    onEdit(commentId, editText);
    setEditing(false);
    setOpen(false);
  };

  if (editing) return (
    <div className="flex gap-2 items-center w-full">
      <input
        value={editText}
        onChange={e => setEditText(e.target.value)}
        className="flex-1 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-sm outline-none dark:bg-gray-600 dark:text-white"
      />
      <button onClick={handleEdit} className="text-xs text-blue-500 font-medium">Save</button>
      <button onClick={() => setEditing(false)} className="text-xs text-gray-400">Cancel</button>
    </div>
  );

  return (
    <div className="relative">
      {/* Three dots button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="text-blue-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full"
      >
        <BsThreeDotsVertical size={14} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg z-10 w-28">
          <button
            onClick={() => { setEditing(true); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}