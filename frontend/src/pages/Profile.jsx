import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Target, Camera, AlertTriangle, Save, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, updateTokenUser } = useAuth(); // Assuming we have or will add updateTokenUser to context to stay synced
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    fitnessGoals: user?.fitnessGoals || ''
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarBase64, setAvatarBase64] = useState(null);
  
  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image too large! Maximum 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const loadToast = toast.loading('Updating profile...');
      const payload = {
        name: formData.name,
        fitnessGoals: formData.fitnessGoals,
      };
      if (avatarBase64) payload.avatarBase64 = avatarBase64;

      const { data } = await api.put('/users/profile', payload);
      toast.success('Profile updated successfully!', { id: loadToast });
      
      // Update local state and auth context if needed
      if(updateTokenUser) updateTokenUser(data.data);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }
    try {
      toast.loading('Deleting account permanently...');
      await api.delete('/users/profile');
      toast.success('Account deleted.');
      logout();
    } catch (error) {
      toast.error('Error deleting account.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account preferences and personal details.</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-primary">Edit Profile</button>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition flex items-center gap-2"><X className="h-4 w-4"/> Cancel</button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save className="h-4 w-4"/> Save</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Danger Zone */}
        <div className="space-y-6">
          <div className="glass-card flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="h-32 w-32 rounded-full border-4 border-accent overflow-hidden relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                {isEditing && (
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="text-white h-6 w-6 mb-1" />
                    <span className="text-xs font-semibold text-white">Upload</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
            <h2 className="text-xl font-bold text-white text-center">{formData.name}</h2>
            <p className="text-gray-400 text-sm text-center">{user?.email}</p>
          </div>

          <div className="glass-card border-red-500/20">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-3"><AlertTriangle className="h-5 w-5"/> Danger Zone</h3>
            <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={() => setShowDeleteModal(true)} className="w-full py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete Account
            </button>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 glass-card space-y-6">
          <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-4">Personal Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="glass-input pl-10 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="glass-input pl-10 opacity-50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Emails cannot be changed for OAuth security reasons.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Fitness Goals</label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <textarea 
                  value={formData.fitnessGoals}
                  onChange={(e) => setFormData({...formData, fitnessGoals: e.target.value})}
                  disabled={!isEditing}
                  rows="4"
                  placeholder="e.g. Gain 10lbs of muscle, run a marathon..."
                  className="glass-input pl-10 py-3 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-dark border border-red-500/30 p-6 rounded-2xl max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <AlertTriangle className="h-8 w-8" />
                <h2 className="text-2xl font-bold">Delete Account</h2>
              </div>
              <p className="text-gray-300 mb-4">
                This action <strong className="text-white">cannot</strong> be undone. This will permanently delete your account, workouts, nutrition logs, and remove your data from our servers.
              </p>
              <p className="text-gray-400 mb-2 text-sm">Please type <strong>DELETE</strong> to confirm.</p>
              <input 
                type="text" 
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full bg-slate-900 border border-red-500/20 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-red-500 mb-6"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition">Cancel</button>
                <button 
                  onClick={handleDeleteAccount} 
                  disabled={deleteInput !== 'DELETE'}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold disabled:opacity-50 transition"
                >
                  Permanently Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
