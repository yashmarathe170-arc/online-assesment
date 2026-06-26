import React, { useEffect, useState } from 'react';
import api from '../../utils/api.js';
import { Loader2, Users, ShieldAlert, BookOpen, UserCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [coursesCount, setCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const resUsers = await api.get('/users');
        setUsers(resUsers.data.users);

        const resCourses = await api.get('/courses?all=true');
        setCoursesCount(resCourses.data.total || 0);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-10 w-10 text-forest dark:text-gold animate-spin" />
      </div>
    );
  }

  // Calculate accounts metrics
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const instructorCount = users.filter((u) => u.role === 'Instructor').length;
  const studentCount = users.filter((u) => u.role === 'Student').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-white">Admin Control Panel</h1>
          <p className="text-charcoal/80 dark:text-sand/55 text-sm mt-1.5">Supervise user registrations databases, customize permissions, and inspect analytics.</p>
        </div>
      </div>

      {/* METRIC STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card flex items-center gap-5">
          <div className="p-3.5 bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold rounded-xl">
            <Users className="h-6.5 w-6.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest block">
              Total Accounts
            </span>
            <span className="text-2xl font-extrabold mt-1 block text-forest dark:text-white">{totalUsers}</span>
          </div>
        </div>

        <div className="premium-card flex items-center gap-5">
          <div className="p-3.5 bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold rounded-xl">
            <UserCheck className="h-6.5 w-6.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest block">
              Instructors
            </span>
            <span className="text-2xl font-extrabold mt-1 block text-forest dark:text-white">{instructorCount}</span>
          </div>
        </div>

        <div className="premium-card flex items-center gap-5">
          <div className="p-3.5 bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold rounded-xl">
            <Users className="h-6.5 w-6.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest block">
              Students Enrolled
            </span>
            <span className="text-2xl font-extrabold mt-1 block text-forest dark:text-white">{studentCount}</span>
          </div>
        </div>

        <div className="premium-card flex items-center gap-5">
          <div className="p-3.5 bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold rounded-xl">
            <BookOpen className="h-6.5 w-6.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest block">
              Courses
            </span>
            <span className="text-2xl font-extrabold mt-1 block text-forest dark:text-white">{coursesCount}</span>
          </div>
        </div>
      </div>

      {/* QUICK LINKS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT USER LIST CARD */}
        <div className="premium-card lg:col-span-2 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-sm text-forest dark:text-sand">Recent Registrations</h3>
              <Link to="/admin/users" className="text-forest dark:text-gold hover:underline text-xs font-bold flex items-center gap-1">
                <span>Configure Users</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {users.slice(0, 4).map((u) => (
                <div key={u._id} className="p-3 bg-cream/15 dark:bg-forest-dark/25 border border-forest/5 dark:border-white/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={u.name}
                      className="h-8 w-8 rounded-full object-cover border border-forest/5"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-forest dark:text-sand leading-snug">{u.name}</h4>
                      <span className="text-[10px] opacity-45 block mt-0.5">{u.email}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    u.role === 'Admin'
                      ? 'bg-rose-500/5 text-rose-600 border border-rose-500/10'
                      : u.role === 'Instructor'
                      ? 'bg-forest/5 text-forest border border-forest/10 dark:bg-gold/10 dark:text-gold dark:border-gold/25'
                      : 'bg-slate-500/5 text-charcoal/80 border border-slate-500/10 dark:text-sand/80 dark:border-white/10'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECURITY & NAV CARD */}
        <div className="premium-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-forest dark:text-sand mb-4">Administration Policies</h3>
            <p className="text-xs opacity-85 leading-relaxed">
              Maintain workspace directories. You have permissions to manually verify email logs,
              re-configure account roles permissions, and clear locked logs databases.
            </p>
          </div>

          <div className="pt-6 border-t border-forest/5 dark:border-white/5 mt-6 space-y-3">
            <Link to="/admin/users" className="premium-btn-primary w-full py-2.5 text-xs text-center flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span>Configure Users Roles</span>
            </Link>
            <Link to="/admin/analytics" className="premium-btn-secondary w-full py-2.5 text-xs text-center flex items-center justify-center gap-2">
              <ShieldAlert className="h-4 w-4 text-forest dark:text-gold" />
              <span>Inspect Growth Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
