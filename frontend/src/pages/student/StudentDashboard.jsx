import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEnrolledCourses } from '../../store/courseSlice.js';
import { fetchNotifications } from '../../store/notificationSlice.js';
import api from '../../utils/api.js';
import { Link } from 'react-router-dom';
import { BookOpen, Award, CheckCircle, ArrowRight, PlayCircle, Clock, Loader2, Calendar, Flame } from 'lucide-react';

export const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { enrolledCourses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  
  const [certsCount, setCertsCount] = useState(0);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    dispatch(fetchEnrolledCourses());
    dispatch(fetchNotifications());

    // Fetch student certificates
    const fetchCerts = async () => {
      try {
        const { data } = await api.get('/certificates/my');
        setCertsCount(data.count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    // Load upcoming assignments across courses
    const fetchUpcomingTasks = async () => {
      try {
        setLoadingTasks(true);
        const tasksList = [];
        for (const course of enrolledCourses) {
          const { data } = await api.get(`/assignments/course/${course._id}`);
          if (data.assignments) {
            data.assignments.forEach((a) => {
              const submitted = a.submissions?.some(
                (s) => s.student === user?.id || s.student?._id === user?.id
              );
              if (!submitted) {
                tasksList.push({
                  id: a._id,
                  title: a.title,
                  courseTitle: course.title,
                  dueDate: new Date(a.dueDate),
                  type: 'assignment',
                  path: `/student/courses/${course._id}`,
                });
              }
            });
          }
        }
        // Sort by due date ascending
        tasksList.sort((a, b) => a.dueDate - b.dueDate);
        setUpcomingTasks(tasksList.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchCerts();
    if (enrolledCourses.length > 0) {
      fetchUpcomingTasks();
    } else {
      setLoadingTasks(false);
    }
  }, [dispatch, enrolledCourses.length, user?.id]);

  // Calculate totals
  const totalCourses = enrolledCourses.length;
  let totalLessons = 0;
  let completedLessons = 0;

  enrolledCourses.forEach((c) => {
    totalLessons += c.lessons.length;
    const progress = c.progress?.find((p) => p.student === user?.id || p.student?._id === user?.id);
    if (progress) {
      completedLessons += progress.completedLessons.length;
    }
  });

  // Calculate completion percentage
  const completedPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 75;

  // Custom circular progress ring properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completedPercentage / 100) * circumference;

  // Weekly momentum data (mocked study hours)
  const weeklyHours = [
    { day: 'MON', hours: 2.0, pct: 30 },
    { day: 'TUE', hours: 4.5, pct: 70 },
    { day: 'WED', hours: 3.0, pct: 45 },
    { day: 'THU', hours: 5.5, pct: 85 },
    { day: 'FRI', hours: 6.0, pct: 95 },
    { day: 'SAT', hours: 3.5, pct: 55 },
    { day: 'SUN', hours: 2.2, pct: 35 },
  ];

  // Helper to determine deadline urgency colors
  const getDeadlineStyle = (dueDate) => {
    const diffTime = dueDate - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 2) {
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/20',
        border: 'border-rose-100 dark:border-rose-900/30',
        text: 'text-rose-700 dark:text-rose-300',
        badge: 'bg-rose-500 text-white',
        label: 'Urgent',
      };
    } else if (diffDays <= 5) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        border: 'border-amber-100 dark:border-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
        badge: 'bg-amber-500 text-white',
        label: 'Upcoming',
      };
    } else {
      return {
        bg: 'bg-emerald-50/50 dark:bg-emerald-950/10',
        border: 'border-emerald-100/50 dark:border-emerald-900/20',
        text: 'text-emerald-800 dark:text-emerald-300',
        badge: 'bg-sage text-forest',
        label: 'Scheduled',
      };
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-forest to-[#0f2824] p-8 text-white shadow-[0_12px_30px_rgba(22,56,50,0.15)]">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
            Lumina Workspace
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-poppins">
            Welcome back, {user?.name || 'Scholar'}!
          </h1>
          <p className="text-sm text-sage/80 leading-relaxed font-inter">
            Pursuing Excellence in Computer Science & Digital Ethics. Keep up the high momentum to reach your milestones.
          </p>
        </div>
        {/* Abstract organic design elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
          <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 90 Q 50 10 90 90" />
            <path d="M20 90 Q 50 20 80 90" />
            <path d="M30 90 Q 50 30 70 90" />
          </svg>
        </div>
      </div>

      {/* METRICS & ANALYSIS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: PROGRESS RING */}
        <div className="premium-card flex flex-col justify-between p-7">
          <div>
            <h3 className="font-bold text-sm tracking-wide text-forest dark:text-sand uppercase mb-6 font-poppins">
              Syllabus Mastery
            </h3>
            
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  {/* Track circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-forest/5 dark:stroke-white/5 fill-none"
                    strokeWidth="10"
                  />
                  {/* Active circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-forest dark:stroke-gold fill-none transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-charcoal dark:text-sand font-poppins">
                    {completedPercentage}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-500 tracking-wider">
                    Complete
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-forest/5 dark:border-white/5 flex items-center justify-between text-xs">
            <div className="text-center flex-1 border-r border-forest/5 dark:border-white/5">
              <span className="block font-extrabold text-forest dark:text-gold text-lg font-poppins">
                {completedLessons}
              </span>
              <span className="text-[10px] opacity-80 font-medium">Completed</span>
            </div>
            <div className="text-center flex-1 border-r border-forest/5 dark:border-white/5">
              <span className="block font-extrabold text-forest dark:text-sand text-lg font-poppins">
                {totalLessons}
              </span>
              <span className="text-[10px] opacity-80 font-medium">Total Lessons</span>
            </div>
            <div className="text-center flex-1">
              <span className="block font-extrabold text-forest dark:text-sand text-lg font-poppins">
                {certsCount}
              </span>
              <span className="text-[10px] opacity-80 font-medium">Certificates</span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: WEEKLY ENGAGEMENT BAR CHART */}
        <div className="premium-card flex flex-col justify-between p-7">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm tracking-wide text-forest dark:text-sand uppercase font-poppins">
                Weekly Momentum
              </h3>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Flame className="h-3.5 w-3.5 fill-current" />
                <span>14d Streak</span>
              </div>
            </div>
            <p className="text-[11px] opacity-85 mb-6 font-inter">
              You're in the top 5% of active learners this week.
            </p>

            {/* Custom bar chart */}
            <div className="flex items-end justify-between h-32 px-2 mt-4">
              {weeklyHours.map((w, idx) => (
                <div key={idx} className="flex flex-col items-center group relative flex-1">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-charcoal text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {w.hours} hrs
                  </div>
                  {/* Bar wrapper */}
                  <div className="w-6 bg-forest/[0.04] dark:bg-white/[0.03] rounded-full h-24 flex items-end overflow-hidden mb-2">
                    <div
                      className="w-full bg-forest dark:bg-gold rounded-full transition-all duration-700 ease-out"
                      style={{ height: `${w.pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 dark:text-slate-500 tracking-wider">
                    {w.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-forest/5 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Avg Daily: 3.9 hrs</span>
            <span>Total: 26.7 hrs</span>
          </div>
        </div>

        {/* COLUMN 3: URGENT DEADLINES */}
        <div className="premium-card flex flex-col justify-between p-7">
          <div className="flex-1 flex flex-col">
            <h3 className="font-bold text-sm tracking-wide text-forest dark:text-sand uppercase mb-5 font-poppins">
              Urgent Deadlines
            </h3>
            
            {loadingTasks ? (
              <div className="py-12 flex justify-center items-center flex-1">
                <Loader2 className="h-6 w-6 animate-spin text-forest" />
              </div>
            ) : upcomingTasks.length === 0 ? (
              <div className="text-center py-12 text-xs opacity-80 flex-1 flex flex-col justify-center">
                All assignments submitted! No pending deadlines.
              </div>
            ) : (
              <div className="space-y-3.5 flex-1">
                {upcomingTasks.map((t) => {
                  const style = getDeadlineStyle(t.dueDate);
                  return (
                    <div
                      key={t.id}
                      className={`p-3 border rounded-xl flex items-center gap-3 transition-all ${style.bg} ${style.border}`}
                    >
                      <div className={`p-2 rounded-lg ${style.badge} shrink-0`}>
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-[11px] truncate text-charcoal dark:text-sand leading-snug">
                          {t.title}
                        </h4>
                        <span className="text-[9px] opacity-80 block truncate mt-0.5 font-medium">
                          {t.courseTitle}
                        </span>
                        <span className={`text-[9px] font-bold block mt-1 ${style.text}`}>
                          Due: {t.dueDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} ({style.label})
                        </span>
                      </div>
                      <Link
                        to={t.path}
                        className="p-1 text-slate-600 hover:text-forest dark:hover:text-gold cursor-pointer"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to="/student/courses"
            className="premium-btn-secondary py-2.5 w-full text-xs mt-6 text-center font-bold font-poppins"
          >
            Browse Syllabus Library
          </Link>
        </div>
      </div>

      {/* CURRICULUMS ROW */}
      <div className="premium-card p-7">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-base text-forest dark:text-sand font-poppins">Active Courses</h3>
          <Link
            to="/student/courses"
            className="text-forest dark:text-gold hover:underline text-xs font-bold flex items-center gap-1 font-poppins"
          >
            <span>Manage All Programs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-forest/15 dark:border-white/10 rounded-2xl">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-xs opacity-85 mb-4 font-inter">You are not enrolled in any programs yet.</p>
            <Link to="/student/courses" className="premium-btn-primary py-2 px-5 text-xs font-poppins">
              Open Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.slice(0, 4).map((c) => {
              const progress = c.progress?.find((p) => p.student === user?.id || p.student?._id === user?.id);
              const completed = progress ? progress.completedLessons.length : 0;
              const total = c.lessons.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div
                  key={c._id}
                  className="p-5 border border-forest/5 dark:border-white/5 bg-cream/20 dark:bg-forest-dark/20 rounded-[18px] flex flex-col justify-between transition-all hover:shadow-[0_4px_15px_-3px_rgba(28,67,50,0.03)]"
                >
                  <div>
                    <h4 className="font-bold text-sm text-forest dark:text-sand line-clamp-1 font-poppins">
                      {c.title}
                    </h4>
                    <span className="text-[10px] opacity-80 block mt-1 font-inter">
                      Instructor: {c.instructor?.name}
                    </span>
                    <p className="text-xs opacity-85 mt-3.5 line-clamp-2 leading-relaxed font-inter">
                      {c.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-forest/5 dark:border-white/5">
                    <div className="flex justify-between text-[10px] font-bold mb-2 font-poppins">
                      <span className="opacity-55">Syllabus Completion</span>
                      <span className="text-forest dark:text-gold">{pct}%</span>
                    </div>
                    <div className="w-full bg-cream dark:bg-surface-dark h-2 rounded-full overflow-hidden mb-4">
                      <div
                        className="bg-forest dark:bg-gold h-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <Link
                      to={`/student/courses/${c._id}`}
                      className="premium-btn-secondary w-full py-2 flex items-center justify-center gap-1.5 text-xs font-bold font-poppins"
                    >
                      <PlayCircle className="h-4 w-4 text-forest dark:text-gold" />
                      <span>Resume Study</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
