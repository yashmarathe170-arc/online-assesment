import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, fetchEnrolledCourses, enrollInCourse } from '../../store/courseSlice.js';
import { Search, Loader2, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Star, Clock, BookOpenCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyCourses = () => {
  const dispatch = useDispatch();
  const { courses, enrolledCourses, page, pages, loading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'enrolled'
  const [searchTerm, setSearchTerm] = useState('');
  const [debounceSearch, setDebounceSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Computer Science', 'Ethics', 'Psychology', 'Design System'];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (activeTab === 'catalog') {
      dispatch(fetchCourses({ page: currentPage, search: debounceSearch }));
    } else {
      dispatch(fetchEnrolledCourses());
    }
  }, [dispatch, activeTab, currentPage, debounceSearch]);

  const handleEnroll = async (courseId) => {
    if (window.confirm('Are you sure you want to enroll in this course?')) {
      const result = await dispatch(enrollInCourse(courseId));
      if (enrollInCourse.fulfilled.match(result)) {
        alert('Enrolled successfully!');
        dispatch(fetchEnrolledCourses());
        setActiveTab('enrolled');
      }
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some((c) => c._id === courseId);
  };

  // Helper to generate deterministic mock metadata based on course ID or title
  const getCourseMeta = (course) => {
    const hash = course._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Determine category
    let category = 'Computer Science';
    const titleLower = course.title.toLowerCase();
    if (titleLower.includes('ethics') || titleLower.includes('law')) {
      category = 'Ethics';
    } else if (titleLower.includes('psychology') || titleLower.includes('cognitive') || titleLower.includes('behavior')) {
      category = 'Psychology';
    } else if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('frontend')) {
      category = 'Design System';
    } else if (hash % 3 === 0) {
      category = 'Ethics';
    } else if (hash % 3 === 1) {
      category = 'Psychology';
    }

    // Determine other meta
    const ratings = (4.5 + (hash % 6) * 0.1).toFixed(1);
    const reviewsCount = 42 + (hash % 150);
    const hours = 10 + (hash % 30);
    const difficulty = (hash % 3 === 0) ? 'Advanced' : (hash % 3 === 1) ? 'Intermediate' : 'Beginner';
    const price = (hash % 2 === 0) ? `$${29 + (hash % 80)}.00` : 'Included';

    return { category, ratings, reviewsCount, hours, difficulty, price };
  };

  // Filter courses locally by category if needed
  const filteredCourses = courses.filter((c) => {
    if (selectedCategory === 'All') return true;
    const meta = getCourseMeta(c);
    return meta.category === selectedCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-forest/5 dark:border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-white font-poppins">Explore Knowledge</h1>
          <p className="text-charcoal/80 dark:text-sand/55 mt-1.5 text-sm font-inter">Expand your intellect with peer-reviewed modules in technology and ethics.</p>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex bg-cream/70 dark:bg-surface-dark/60 p-1 rounded-full border border-forest/5 dark:border-white/5 self-start">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-6 py-2 text-xs font-bold rounded-full transition-all cursor-pointer font-poppins ${
              activeTab === 'catalog'
                ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark shadow-sm'
                : 'text-charcoal/85 dark:text-sand/60 hover:text-charcoal dark:hover:text-sand'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => {
              setActiveTab('enrolled');
              dispatch(fetchEnrolledCourses());
            }}
            className={`px-6 py-2 text-xs font-bold rounded-full transition-all cursor-pointer font-poppins ${
              activeTab === 'enrolled'
                ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark shadow-sm'
                : 'text-charcoal/85 dark:text-sand/60 hover:text-charcoal dark:hover:text-sand'
            }`}
          >
            My Enrolled
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH ROW */}
      {activeTab === 'catalog' && (
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          {/* CATEGORY PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer whitespace-nowrap font-poppins ${
                  selectedCategory === cat
                    ? 'bg-sage border-sage text-forest dark:bg-gold dark:border-gold dark:text-forest-dark'
                    : 'bg-transparent border-forest/10 dark:border-white/10 text-charcoal/90 dark:text-sand/70 hover:border-forest/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full lg:max-w-xs shrink-0">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-600">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search curriculum..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-input pl-11 py-2.5 text-xs"
            />
          </div>
        </div>
      )}

      {/* CORE CARDS LIST */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-10 w-10 text-forest dark:text-gold animate-spin" />
        </div>
      ) : activeTab === 'catalog' ? (
        <>
          {filteredCourses.length === 0 ? (
            <div className="premium-card p-16 text-center border-dashed border-forest/15 dark:border-white/10 rounded-2xl">
              <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-xs opacity-85 font-inter">No academic modules found matching current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((c) => {
                const enrolled = isEnrolled(c._id);
                const meta = getCourseMeta(c);

                return (
                  <div key={c._id} className="premium-card premium-card-hover overflow-hidden flex flex-col justify-between p-0 bg-white dark:bg-surface-dark border border-forest/5 dark:border-white/5 rounded-[20px]">
                    <div className="relative">
                      <img
                        src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                        alt={c.title}
                        className="h-44 w-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
                        }}
                      />
                      <span className="absolute top-4 right-4 bg-white/90 dark:bg-charcoal/90 backdrop-blur-sm text-forest dark:text-gold text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                        {meta.price}
                      </span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Rating & Category header */}
                        <div className="flex items-center justify-between text-[9px] font-bold tracking-wider text-slate-600 dark:text-slate-500 uppercase">
                          <span>{meta.category}</span>
                          <div className="flex items-center gap-1 text-gold dark:text-gold/90">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-charcoal dark:text-sand">{meta.ratings} ({meta.reviewsCount})</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-base text-forest dark:text-sand mt-2.5 line-clamp-1 font-poppins">
                          {c.title}
                        </h3>
                        <p className="text-xs opacity-85 mt-2 line-clamp-2 leading-relaxed font-inter">
                          {c.description}
                        </p>

                        {/* Badges info */}
                        <div className="flex items-center gap-4 mt-5 text-[10px] font-bold text-slate-700 dark:text-slate-500">
                          <span className="flex items-center gap-1">
                            <BookOpenCheck className="h-3.5 w-3.5" />
                            {c.lessons.length} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {meta.hours} hours
                          </span>
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {meta.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-forest/5 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.instructor?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                            alt={c.instructor?.name}
                            className="h-8 w-8 rounded-full object-cover border border-forest/10"
                          />
                          <span className="text-[10px] font-bold opacity-75 font-inter">{c.instructor?.name}</span>
                        </div>

                        {enrolled ? (
                          <Link to={`/student/courses/${c._id}`} className="premium-btn-primary py-2 px-5 text-xs font-poppins">
                            Study
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleEnroll(c._id)}
                            className="premium-btn-secondary py-2 px-5 text-xs font-poppins"
                          >
                            Enroll
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-forest/5 dark:border-white/5 rounded-xl bg-white dark:bg-surface-dark disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <span className="text-xs text-charcoal/80 dark:text-sand/55 font-inter">
                Page <span className="text-charcoal dark:text-white font-bold">{currentPage}</span> of {pages}
              </span>
              <button
                disabled={currentPage === pages}
                onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                className="p-2 border border-forest/5 dark:border-white/5 rounded-xl bg-white dark:bg-surface-dark disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {enrolledCourses.length === 0 ? (
            <div className="premium-card p-16 text-center border-dashed border-forest/15 dark:border-white/10 rounded-2xl">
              <GraduationCap className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-xs opacity-85 mb-4 font-inter">You are not enrolled in any programs yet.</p>
              <button onClick={() => setActiveTab('catalog')} className="premium-btn-primary text-xs py-2 px-5 font-poppins">
                Explore Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {enrolledCourses.map((c) => {
                const progress = c.progress?.find((p) => p.student === user?.id || p.student?._id === user?.id);
                const completedCount = progress ? progress.completedLessons.length : 0;
                const totalCount = c.lessons.length;
                const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <div key={c._id} className="premium-card overflow-hidden flex flex-col sm:flex-row p-0 bg-white dark:bg-surface-dark border border-forest/5 dark:border-white/5 rounded-[20px]">
                    <img
                      src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                      alt={c.title}
                      className="h-40 sm:h-auto sm:w-44 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
                      }}
                    />
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base text-forest dark:text-sand line-clamp-1 font-poppins">{c.title}</h3>
                        <p className="text-[10px] opacity-80 mt-1 font-inter">Instructor: {c.instructor?.name}</p>
                        <p className="text-xs opacity-85 mt-3 line-clamp-2 leading-relaxed font-inter">{c.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-forest/5 dark:border-white/5">
                        <div className="flex justify-between text-[10px] font-bold mb-2 font-poppins">
                          <span className="opacity-55">{completedCount} / {totalCount} lessons</span>
                          <span className="text-forest dark:text-gold">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-cream dark:bg-forest-dark h-1.5 rounded-full overflow-hidden mb-4">
                          <div className="bg-forest dark:bg-gold h-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                        </div>

                        <Link to={`/student/courses/${c._id}`} className="premium-btn-primary py-2 w-full text-center text-xs block font-poppins">
                          Resume Learning
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyCourses;
