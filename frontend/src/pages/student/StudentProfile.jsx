import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../../store/authSlice.js';
import { Link } from 'react-router-dom';
import { 
  User, Lock, Mail, Image, AlertCircle, CheckCircle, Loader2, Award, 
  ChevronRight, Flame, Shield, Bell, CreditCard, BookOpen, GraduationCap, MapPin, Eye, EyeOff
} from 'lucide-react';

export const StudentProfile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { enrolledCourses } = useSelector((state) => state.courses);

  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeSection, setActiveSection] = useState('personal'); // 'personal' | 'notifications' | 'security' | 'billing'
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setSuccess(false);
    const formData = new FormData();
    formData.append('name', data.name);
    
    if (data.avatar && data.avatar[0]) {
      formData.append('avatar', data.avatar[0]);
    }
    if (data.password) {
      formData.append('password', data.password);
    }

    const result = await dispatch(updateUserProfile(formData));
    if (updateUserProfile.fulfilled.match(result)) {
      setSuccess(true);
      reset({ name: result.payload.name });
      setAvatarPreview(null);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  // Weekly momentum hours for the profile page
  const weeklyHours = [
    { day: 'MON', pct: 30 },
    { day: 'TUE', pct: 70 },
    { day: 'WED', pct: 45 },
    { day: 'THU', pct: 85 },
    { day: 'FRI', pct: 95 },
    { day: 'SAT', pct: 55 },
    { day: 'SUN', pct: 35 },
  ];

  // Academic Milestones data
  const milestones = [
    { name: 'Course Master', value: '12 COMPLETED', locked: false },
    { name: 'Deep Reader', value: '50+ RESOURCES', locked: false },
    { name: 'Published', value: '3 PEER REVIEWS', locked: false },
    { name: "Dean's List", value: 'LOCKED', locked: true },
    { name: 'Mentor', value: '0 HELPED', locked: true },
    { name: 'Early Adopter', value: 'BETA PHASE', locked: false },
  ];

  // Dynamic Current Focus data based on actual enrollments (fallback to mockup data)
  const getFocusCourses = () => {
    if (enrolledCourses && enrolledCourses.length > 0) {
      return enrolledCourses.slice(0, 3).map((c) => {
        const progress = c.progress?.find((p) => p.student === user?.id || p.student?._id === user?.id);
        const completed = progress ? progress.completedLessons.length : 0;
        const total = c.lessons.length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 15;
        return { id: c._id, title: c.title, progressPct: pct };
      });
    }
    return [
      { id: '1', title: 'Advanced Algorithms', progressPct: 82 },
      { id: '2', title: 'Digital Ethics & Law', progressPct: 45 },
      { id: '3', title: 'Cognitive Psychology', progressPct: 12 },
    ];
  };

  const focusCourses = getFocusCourses();

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      
      {/* PROFILE HEADER CARD */}
      <div className="premium-card p-8 flex flex-col items-center text-center relative overflow-hidden bg-white dark:bg-surface-dark border border-forest/5 rounded-[24px]">
        {/* Banner decorative line */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-forest via-sage to-gold" />
        
        {/* Avatar */}
        <div className="relative group mt-4">
          <img
            src={avatarPreview || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={user?.name}
            className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-forest-dark shadow-md"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
            }}
          />
          <label className="absolute bottom-0 right-0 p-1.5 bg-forest hover:bg-forest/90 dark:bg-gold text-white dark:text-forest-dark rounded-full shadow cursor-pointer border border-white dark:border-forest-dark transition-all">
            <Image className="h-3.5 w-3.5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>

        {/* User identification */}
        <h2 className="text-2xl font-extrabold text-forest dark:text-white mt-4 font-poppins">{user?.name || 'Alex Sterling'}</h2>
        <span className="inline-block bg-[#eaf2ea] dark:bg-gold/10 text-forest dark:text-gold text-[10px] font-bold px-3.5 py-1.5 rounded-full tracking-wider mt-2 uppercase font-poppins">
          Level 4 Scholar
        </span>

        {/* Profile Bio details */}
        <p className="text-xs opacity-85 max-w-md mt-4 leading-relaxed font-inter">
          Pursuing Excellence in Computer Science & Digital Ethics. Member since Fall 2023.
        </p>

        {/* Meta badges (Premium, Oxford) */}
        <div className="flex items-center justify-center gap-4 mt-5 text-[10px] font-bold text-slate-600 dark:text-slate-500 font-poppins">
          <span className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4" />
            Premium Member
          </span>
          <span className="w-1.5 h-1.5 bg-slate-350 rounded-full" />
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Oxford, UK
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Momentum & Milestones */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* WEEKLY MOMENTUM GRAPH CARD */}
          <div className="premium-card p-6 bg-white dark:bg-surface-dark border border-forest/5 rounded-[24px]">
            <h3 className="font-bold text-sm tracking-wide text-forest dark:text-sand uppercase mb-1 font-poppins">
              Weekly Momentum
            </h3>
            <p className="text-[10px] opacity-80 mb-5 font-inter">You're in the top 5% of active learners this week.</p>
            
            {/* Minimalist Bar Graph */}
            <div className="flex items-end justify-between h-20 px-2">
              {weeklyHours.map((w, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className="w-5 bg-forest/[0.04] dark:bg-white/[0.03] rounded h-14 flex items-end overflow-hidden mb-2">
                    <div
                      className="w-full bg-[#e5eee5] dark:bg-white/10 rounded h-full transition-all"
                      style={{ height: `${w.pct}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-slate-600 dark:text-slate-500 tracking-wider">
                    {w.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 14 DAY LEARNING STREAK CARD */}
          <div className="p-6 bg-forest text-white rounded-[24px] shadow-sm relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white">
                <Flame className="h-8 w-8 fill-current" />
              </div>
              <div>
                <span className="text-[32px] font-extrabold font-poppins leading-none block">14</span>
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-85 block mt-0.5 font-poppins">
                  Day Learning Streak
                </span>
              </div>
            </div>
            {/* Background design elements */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
              <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="80" cy="50" r="25" />
              </svg>
            </div>
          </div>

          {/* ACADEMIC MILESTONES */}
          <div className="premium-card p-6 bg-white dark:bg-surface-dark border border-forest/5 rounded-[24px]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-sm tracking-wide text-forest dark:text-sand uppercase font-poppins">
                Academic Milestones
              </h3>
              <button onClick={() => alert('Viewing all milestones...')} className="text-forest dark:text-gold hover:underline text-[10px] font-bold font-poppins">
                View All
              </button>
            </div>

            {/* Grid of milestones */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[105px] transition-all ${
                    m.locked
                      ? 'bg-cream/10 border-forest/2 dark:bg-forest-dark/10 dark:border-white/2 opacity-75'
                      : 'bg-cream/20 border-forest/5 dark:bg-forest-dark/20 dark:border-white/5 hover:border-forest/15'
                  }`}
                >
                  <div className={`p-2 rounded-full mb-2.5 ${
                    m.locked ? 'bg-slate-100 text-slate-600 dark:bg-white/5' : 'bg-forest/5 text-forest dark:bg-gold/10 dark:text-gold'
                  }`}>
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="font-extrabold text-[10px] text-charcoal dark:text-sand font-poppins">{m.name}</h4>
                  <span className="text-[8px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-wider block mt-1">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Account Settings & Current Focus */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ACCOUNT SETTINGS COLLAPSABLE FORM */}
          <div className="premium-card p-6 bg-white dark:bg-surface-dark border border-forest/5 rounded-[24px] space-y-4">
            <div>
              <h3 className="font-bold text-sm tracking-wide text-forest dark:text-sand uppercase font-poppins">
                Account Settings
              </h3>
              <p className="text-[10px] opacity-80 font-inter mt-0.5">Manage your academic profile, notifications, and security preferences.</p>
            </div>

            {/* Alert systems inside forms */}
            {success && (
              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-350 rounded-xl flex items-center gap-2.5 text-[10px] font-semibold font-poppins">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}
            {error && (
              <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 text-rose-700 dark:text-rose-350 rounded-xl flex items-center gap-2.5 text-[10px]">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Settings links */}
            <div className="space-y-2">
              
              {/* PERSONAL INFO BUTTON */}
              <div className="border border-forest/5 dark:border-white/5 rounded-2xl overflow-hidden bg-cream/10 dark:bg-forest-dark/10">
                <button
                  onClick={() => setActiveSection(activeSection === 'personal' ? '' : 'personal')}
                  className="w-full flex items-center justify-between p-4 text-xs font-bold text-charcoal dark:text-sand hover:bg-cream/35 dark:hover:bg-forest-dark/20 font-poppins"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="h-4.5 w-4.5 text-slate-600" />
                    <span>Personal Information</span>
                  </div>
                  <ChevronRight className={`h-4.5 w-4.5 text-slate-700 transition-transform ${activeSection === 'personal' ? 'rotate-90' : ''}`} />
                </button>

                {activeSection === 'personal' && (
                  <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t border-forest/5 dark:border-white/5 space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        className={`premium-input py-2.5 text-xs ${errors.name ? 'border-rose-500' : ''}`}
                        {...register('name', { required: 'Name is required' })}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 opacity-85">Email Address (Read-only)</label>
                      <input
                        type="email"
                        disabled
                        value={user?.email}
                        className="premium-input py-2.5 text-xs opacity-80 bg-slate-100 cursor-not-allowed border-transparent"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="premium-btn-primary w-full py-2.5 text-xs font-poppins font-semibold">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin text-white mx-auto" /> : 'Save Changes'}
                    </button>
                  </form>
                )}
              </div>

              {/* SECURITY & PRIVACY BUTTON */}
              <div className="border border-forest/5 dark:border-white/5 rounded-2xl overflow-hidden bg-cream/10 dark:bg-forest-dark/10">
                <button
                  onClick={() => setActiveSection(activeSection === 'security' ? '' : 'security')}
                  className="w-full flex items-center justify-between p-4 text-xs font-bold text-charcoal dark:text-sand hover:bg-cream/35 dark:hover:bg-forest-dark/20 font-poppins"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="h-4.5 w-4.5 text-slate-600" />
                    <span>Security & Privacy</span>
                  </div>
                  <ChevronRight className={`h-4.5 w-4.5 text-slate-700 transition-transform ${activeSection === 'security' ? 'rotate-90' : ''}`} />
                </button>

                {activeSection === 'security' && (
                  <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t border-forest/5 dark:border-white/5 space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Update Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="New password"
                          className="premium-input py-2.5 pr-11 text-xs"
                          {...register('password', { minLength: { value: 6, message: 'At least 6 chars' } })}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="premium-btn-primary w-full py-2.5 text-xs font-poppins font-semibold">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin text-white mx-auto" /> : 'Update Password'}
                    </button>
                  </form>
                )}
              </div>

              {/* NOTIFICATION PREFERENCES BUTTON */}
              <div className="border border-forest/5 dark:border-white/5 rounded-2xl overflow-hidden bg-cream/10 dark:bg-forest-dark/10">
                <button
                  onClick={() => setActiveSection(activeSection === 'notifications' ? '' : 'notifications')}
                  className="w-full flex items-center justify-between p-4 text-xs font-bold text-charcoal dark:text-sand hover:bg-cream/35 dark:hover:bg-forest-dark/20 font-poppins"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="h-4.5 w-4.5 text-slate-600" />
                    <span>Notification Preferences</span>
                  </div>
                  <ChevronRight className={`h-4.5 w-4.5 text-slate-700 transition-transform ${activeSection === 'notifications' ? 'rotate-90' : ''}`} />
                </button>

                {activeSection === 'notifications' && (
                  <div className="p-4 border-t border-forest/5 dark:border-white/5 text-[10px] opacity-85 font-inter">
                    Notification settings are managed automatically for student evaluation modules in Oxford workspaces.
                  </div>
                )}
              </div>

              {/* BILLING & SUBSCRIPTIONS BUTTON */}
              <div className="border border-forest/5 dark:border-white/5 rounded-2xl overflow-hidden bg-cream/10 dark:bg-forest-dark/10">
                <button
                  onClick={() => setActiveSection(activeSection === 'billing' ? '' : 'billing')}
                  className="w-full flex items-center justify-between p-4 text-xs font-bold text-charcoal dark:text-sand hover:bg-cream/35 dark:hover:bg-forest-dark/20 font-poppins"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="h-4.5 w-4.5 text-slate-600" />
                    <span>Billing & Subscriptions</span>
                  </div>
                  <ChevronRight className={`h-4.5 w-4.5 text-slate-700 transition-transform ${activeSection === 'billing' ? 'rotate-90' : ''}`} />
                </button>

                {activeSection === 'billing' && (
                  <div className="p-4 border-t border-forest/5 dark:border-white/5 text-[10px] opacity-85 font-inter">
                    Billing details are handled through the Lumina Oxford Institutional Registrar portal.
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* CURRENT FOCUS SECTION */}
          <div className="premium-card p-6 bg-white dark:bg-surface-dark border border-forest/5 rounded-[24px] space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-500 font-poppins">
              Current Focus
            </h3>
            
            <div className="space-y-4">
              {focusCourses.map((focus) => (
                <div key={focus.id} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold font-poppins">
                    <span className="text-charcoal dark:text-sand truncate pr-2 max-w-[200px]">{focus.title}</span>
                    <span className="text-forest dark:text-gold shrink-0">{focus.progressPct}%</span>
                  </div>
                  <div className="w-full bg-[#f2ecf2] dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-forest dark:bg-gold h-full transition-all duration-500"
                      style={{ width: `${focus.progressPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/student/courses"
              className="premium-btn-primary w-full py-3.5 text-xs font-poppins font-bold block text-center"
            >
              Continue Learning
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentProfile;
