import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, MoreVertical, Shield, User, Mail, Calendar, Trash2, Edit2, Ban } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fallback
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (error) {
       // Mock data
       setUsers([
           { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: '2024-01-15' },
           { _id: '2', name: 'Admin Jane', email: 'admin@fitforge.ai', role: 'admin', createdAt: '2023-11-20' },
           { _id: '3', name: 'Mike Ross', email: 'mike@example.com', role: 'user', createdAt: '2024-02-10' },
           { _id: '4', name: 'Harvey Specter', email: 'harvey@example.com', role: 'user', createdAt: '2024-03-01' },
           { _id: '5', name: 'Louis Litt', email: 'louis@example.com', role: 'user', createdAt: '2024-03-05' },
       ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
        toast.success('User deleted successfully (Simulated)');
        setUsers(users.filter(u => u._id !== id));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Review, manage, and audit all platform participants.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-accent text-slate-900 font-bold rounded-xl hover:scale-105 transition-all">
          <UserPlus className="w-5 h-5" /> Add New User
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Table Header / Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between bg-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A2740] border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#021B32] border border-white/10 rounded-lg text-white text-sm hover:bg-white/5 transition-all">Filter</button>
            <button className="px-4 py-2 bg-[#021B32] border border-white/10 rounded-lg text-white text-sm hover:bg-white/5 transition-all">Export</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Joined Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                  <tr><td colSpan="4" className="text-center py-20 text-accent font-bold">Crunching user data...</td></tr>
              ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-20 text-gray-500">No users found match your search.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      user.role === 'admin' 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors border border-transparent hover:border-accent/20" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-orange-500/10 text-orange-400 rounded-lg transition-colors border border-transparent hover:border-orange-500/20" title="Manage Permissions">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-yellow-500/10 text-yellow-400 rounded-lg transition-colors border border-transparent hover:border-yellow-500/20" title="Suspend">
                        <Ban className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default UserManagement;
