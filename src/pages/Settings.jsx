// src/pages/Settings.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, changePassword, deleteAccount } from '../lib/supabase_api';

export default function Settings() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/singin');
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.');
      return;
    }
    try {
      await changePassword(newPassword);
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
    } catch (err) {
      setPasswordMessage('Failed to update password: ' + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate('/auth/singin');
    } catch (err) {
      alert('Failed to delete account: ' + err.message);
    }
  };

  return (
    <div className="max-w-xl  p-4 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Settings</h1>

      {/* Account Actions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Account</h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Change Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="border border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={handleChangePassword}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 self-start"
          >
            Update Password
          </button>
          {passwordMessage && (
            <p className="text-sm text-gray-500">{passwordMessage}</p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 self-start"
        >
          Log Out
        </button>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-500 text-sm self-start hover:underline"
          >
            Delete My Account
          </button>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex flex-col gap-2">
            <p className="text-sm text-red-600 dark:text-red-400">
              This will permanently delete your account and all your data. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
              >
                Yes, Delete Permanently
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Help & About */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Help & About</h2>
        <p className="text-sm text-gray-500">SocialHub v1.0.0</p>
        <a href="mailto:mostafamohamedsaber971@gmail.com" className="text-sm text-blue-500 hover:underline">
          Contact Support
        </a>
      </section>
    </div>
  );
}