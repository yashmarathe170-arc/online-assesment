import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/authSlice.js';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotificationById } from '../../store/notificationSlice.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useSocket } from '../../hooks/useSocket.js';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  PlusCircle,
  FileText,
  Users,
  BarChart3,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  CheckCircle,
  Trash2,
} from 'lucide-react';

export const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { toggleTheme, theme } = useTheme();
  
  // Initialize WebSockets
  useSocket();

  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const getRoleLinks = () => {
    switch (user?.role) {
      case 'Admin':
        return [
          { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Manage Users', path: '/admin/users', icon: Users },
          { label: 'System Analytics', path: '/admin/analytics', icon: BarChart3 },
          { label: 'My Profile', path: '/student/profile', icon: User },
        ];
      case 'Instructor':
        return [
          { label: 'Instructor Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
          { label: 'Create Course', path: '/instructor/create-course', icon: PlusCircle },
          { label: 'Grade Assignments', path: '/instructor/assignments', icon: FileText },
          { label: 'My Profile', path: '/student/profile', icon: User },
        ];
      case 'Student':
      default:
        return [
          { label: 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { label: 'My Courses', path: '/student/courses', icon: BookOpen },
          { label: 'Certificates', path: '/student/certificates', icon: Award },
          { label: 'My Profile', path: '/student/profile', icon: User },
        ];
    }
  };

  const links = getRoleLinks();

  return (
    <div className="min-h-screen flex transition-colors duration-300">
      {/* MOBILE SIDEBAR DRAWERS */}
      {sidebarOpenMobile && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/20 dark:bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpenMobile(false)}
        />
      )}

      {/* FLOATING SIDEBAR PANEL */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 my-4 ml-4 mr-0 rounded-[18px] border border-forest/5 dark:border-white/5 bg-white/95 dark:bg-surface-dark/95 shadow-sm backdrop-blur-xl flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } ${sidebarOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${
          !sidebarOpenMobile && 'hidden lg:flex'
        }`}
      >
        {/* LOGO SECTION */}
        <div className="p-5 flex items-center justify-between border-b border-forest/5 dark:border-white/5">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 shrink-0 bg-forest dark:bg-gold rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white dark:text-forest-dark" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-extrabold text-lg tracking-tight text-forest dark:text-gold uppercase">
                Lumina
              </span>
            )}
          </Link>
          <button
            className="hidden lg:block p-1.5 rounded-lg hover:bg-cream dark:hover:bg-forest-dark text-slate-600 hover:text-slate-650 cursor-pointer"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft className={`h-4.5 w-4.5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
          <button className="lg:hidden p-1 rounded-md hover:bg-slate-700/20" onClick={() => setSidebarOpenMobile(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SIDEBAR NAVIGATION LINKS */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  active
                    ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark shadow-sm'
                    : 'text-charcoal/90 dark:text-sand/70 hover:bg-cream dark:hover:bg-forest-dark hover:text-charcoal dark:hover:text-sand'
                }`}
                onClick={() => setSidebarOpenMobile(false)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER (USER & LOGOUT) */}
        <div className="p-4 border-t border-forest/5 dark:border-white/5 space-y-3">
          <div className="flex items-center gap-3 p-1">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={user?.name}
              className="h-9 w-9 rounded-full object-cover border border-forest/10 dark:border-gold/20"
            />
            {!sidebarCollapsed && (
              <div className="overflow-hidden min-w-0">
                <h4 className="font-bold text-xs truncate text-charcoal dark:text-sand">{user?.name}</h4>
                <span className="text-[10px] opacity-80 block mt-0.5 uppercase tracking-wider">{user?.role}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 py-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10 rounded-xl transition-all duration-200 text-xs font-semibold cursor-pointer ${
              sidebarCollapsed ? 'px-0' : 'px-4'
            }`}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* FLOATING TOP NAVIGATION BAR */}
        <header
          className="h-16 mt-4 mx-4 rounded-[18px] border border-forest/5 dark:border-white/5 bg-white/80 dark:bg-surface-dark/85 backdrop-blur-md shadow-[0_2px_15px_rgba(28,67,50,0.02)] flex items-center justify-between px-6 z-30"
        >
          {/* MOBILE TOGGLE CONTROL */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-cream dark:hover:bg-forest-dark"
            onClick={() => setSidebarOpenMobile(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* PAGE TITLE INDICATOR */}
          <div className="hidden sm:block text-xs font-medium text-charcoal/80 dark:text-sand/50">
            Current Workspace: <span className="font-bold text-charcoal dark:text-sand uppercase tracking-wider">{user?.role} portal</span>
          </div>

          {/* QUICK CONTROLS (THEME, NOTIFICATIONS) */}
          <div className="flex items-center gap-3.5 ml-auto">
            {/* THEME SWITCHER */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-cream dark:hover:bg-forest-dark text-slate-600 hover:text-slate-650 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-gold" /> : <Moon className="h-4.5 w-4.5 text-forest" />}
            </button>

            {/* NOTIFICATIONS BELL */}
            <div className="relative">
              <button
                onClick={() => setNotiOpen(!notiOpen)}
                className="p-2.5 rounded-full hover:bg-cream dark:hover:bg-forest-dark text-slate-600 hover:text-slate-650 transition-colors cursor-pointer relative"
              >
                <Bell className="h-4.5 w-4.5 text-inherit" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-forest dark:bg-gold text-white dark:text-forest-dark text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATIONS CONTAINER */}
              {notiOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotiOpen(false)} />
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl shadow-xl border border-forest/8 dark:border-white/5 bg-white dark:bg-surface-dark p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                      <h4 className="font-extrabold text-sm text-charcoal dark:text-sand">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => dispatch(markAllNotificationsAsRead())}
                          className="text-xs text-forest dark:text-gold hover:underline cursor-pointer font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-xs opacity-80">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 relative ${
                              n.read
                                ? 'bg-cream/10 border-transparent opacity-85'
                                : 'bg-forest/5 border-forest/10 dark:bg-gold/5 dark:border-gold/10'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-charcoal dark:text-sand leading-relaxed">{n.message}</p>
                              <span className="text-[9px] opacity-75 block mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 items-end shrink-0">
                              {!n.read && (
                                <button
                                  onClick={() => dispatch(markNotificationAsRead(n._id))}
                                  className="p-1 rounded hover:bg-forest/10 dark:hover:bg-gold/10 text-forest dark:text-gold cursor-pointer"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => dispatch(deleteNotificationById(n._id))}
                                className="p-1 rounded hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE PAGES CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
