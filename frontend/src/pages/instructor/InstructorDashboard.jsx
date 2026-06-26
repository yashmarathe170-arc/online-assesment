import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInstructorCourses, deleteCourseById } from '../../store/courseSlice.js';
import { PlusCircle, BookOpen, Users, Play, Edit, Trash2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InstructorDashboard = () => {
  const dispatch = useDispatch();
  const { instructorCourses, loading } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchInstructorCourses());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this course? All progress, grades, and materials will be lost.')) {
      dispatch(deleteCourseById(id));
    }
  };

  // Metrics
  const totalCourses = instructorCourses.length;
  const totalStudents = instructorCourses.reduce((acc, c) => acc + (c.students?.length || 0), 0);
  const activeDrafts = instructorCourses.filter((c) => !c.published).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-white">Instructor Panel</h1>
          <p className="text-charcoal/80 dark:text-sand/55 text-sm mt-1.5">Manage course curriculums and monitor student catalog enrollments.</p>
        </div>
        <Link to="/instructor/create-course" className="premium-btn-primary py-2.5 px-6 text-xs flex items-center gap-2">
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* METRIC STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="premium-card flex items-center gap-5">
          <div className="p-3.5 bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold rounded-xl">
            <BookOpen className="h-6.5 w-6.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest block">
              Curriculums Created
            </span>
            <span className="text-2xl font-extrabold mt-1 block text-forest dark:text-white">{totalCourses}</span>
          </div>
        </div>

        <div className="premium-card flex items-center gap-5">
          <div className="p-3.5 bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold rounded-xl">
            <Users className="h-6.5 w-6.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest block">
              Enrolled Students
            </span>
            <span className="text-2xl font-extrabold mt-1 block text-forest dark:text-white">{totalStudents}</span>
          </div>
        </div>

        <div className="premium-card flex items-center gap-5">
          <div className="p-3.5 bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold rounded-xl">
            <GraduationCap className="h-6.5 w-6.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest block">
              Pending Drafts
            </span>
            <span className="text-2xl font-extrabold mt-1 block text-forest dark:text-white">{activeDrafts}</span>
          </div>
        </div>
      </div>

      {/* CURRICULUM PORTFOLIO */}
      <div className="premium-card">
        <h3 className="font-bold text-base mb-6 text-forest dark:text-sand">Curriculum Portfolio</h3>

        {instructorCourses.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-forest/15 dark:border-white/10 rounded-2xl">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-xs opacity-85 mb-4 font-semibold">You have not created any course curriculums yet.</p>
            <Link to="/instructor/create-course" className="premium-btn-primary py-2 px-5 text-xs inline-block">
              Create First Course
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {instructorCourses.map((c) => (
              <div key={c._id} className="p-4 border border-forest/5 dark:border-white/5 bg-cream/15 dark:bg-forest-dark/20 rounded-[18px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <img
                    src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}
                    alt={c.title}
                    className="h-14 w-24 rounded-xl object-cover bg-slate-900 border border-forest/10 dark:border-white/10"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-sm text-forest dark:text-sand">{c.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        c.published
                          ? 'bg-forest/5 text-forest border border-forest/10 dark:bg-gold/10 dark:text-gold dark:border-gold/20'
                          : 'bg-amber-500/5 text-amber-600 border border-amber-500/10 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {c.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 mt-1">
                      {c.lessons?.length || 0} Lessons • {c.students?.length || 0} Enrolled Students
                    </p>
                  </div>
                </div>

                {/* ACTION TRIGGERS */}
                <div className="flex gap-2 w-full md:w-auto self-stretch md:self-auto justify-end">
                  <Link to={`/instructor/edit-course/${c._id}`} className="p-2.5 bg-forest/5 dark:bg-gold/5 hover:bg-forest/10 dark:hover:bg-gold/10 border border-forest/10 dark:border-white/10 rounded-xl text-forest dark:text-gold" title="Edit course syllabus">
                    <Edit className="h-4.5 w-4.5" />
                  </Link>
                  <button onClick={() => handleDelete(c._id)} className="p-2.5 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 rounded-xl text-rose-600 cursor-pointer" title="Delete course">
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
