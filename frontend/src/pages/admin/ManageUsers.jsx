import React, { useEffect, useState } from 'react';
import api from '../../utils/api.js';
import { Loader2, Trash2, Shield, UserCog, Mail } from 'lucide-react';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Are you sure you want to transition this user to role: ${newRole}?`)) {
      setUpdatingUserId(userId);
      try {
        await api.put(`/users/${userId}/role`, { role: newRole });
        alert('User role updated successfully!');
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update user role');
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user account? This action is irreversible.')) {
      try {
        await api.delete(`/users/${userId}`);
        alert('User account deleted successfully!');
        setUsers(users.filter((u) => u._id !== userId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-10 w-10 text-forest dark:text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-white">User Administration</h1>
        <p className="text-charcoal/80 dark:text-sand/55 text-sm mt-1.5">Review accounts indexes, change workspace access permission levels, or purge profiles.</p>
      </div>

      {/* DATATABLE PANEL */}
      <div className="premium-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-forest/5 bg-cream/15 dark:bg-forest-dark/40 dark:border-white/5 font-semibold uppercase tracking-wider text-charcoal/80 dark:text-sand/50">
                <th className="p-4 sm:p-5">User Details</th>
                <th className="p-4 sm:p-5">Email Address</th>
                <th className="p-4 sm:p-5">Registered Date</th>
                <th className="p-4 sm:p-5">Account Role</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5 dark:divide-white/5 text-charcoal/80 dark:text-sand/80">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-cream/10 dark:hover:bg-forest-dark/10 transition-colors">
                  <td className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={u.name}
                        className="h-9 w-9 rounded-full object-cover border border-forest/5 dark:border-white/5"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                        }}
                      />
                      <div>
                        <span className="font-bold text-forest dark:text-sand block">{u.name}</span>
                        <span className="text-[10px] opacity-45 block mt-0.5 capitalize">{u.role} Account</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 font-mono text-[10px] opacity-75">{u.email}</td>
                  <td className="p-4 sm:p-5 opacity-85">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 sm:p-5">
                    <div className="relative">
                      <select
                        disabled={updatingUserId === u._id}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="premium-input py-1.5 px-3 appearance-none cursor-pointer max-w-36 text-[10px]"
                      >
                        <option value="Student">Student</option>
                        <option value="Instructor">Instructor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 text-right">
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-2 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 rounded-xl text-rose-500 cursor-pointer transition-colors"
                      title="Permanently Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
