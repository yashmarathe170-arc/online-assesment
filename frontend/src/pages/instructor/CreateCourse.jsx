import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createNewCourse, updateExistingCourse, fetchCourseById } from '../../store/courseSlice.js';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, ArrowLeft, Video, BookOpen } from 'lucide-react';
import api from '../../utils/api.js';

export const CreateCourse = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState(null);

  // Lesson list
  const [lessons, setLessons] = useState([]);
  
  // Single lesson composer inputs
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonVideo, setNewLessonVideo] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('');

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const loadCourse = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/courses/${id}`);
          const c = data.course;
          setCourseData(c);
          setValue('title', c.title);
          setValue('description', c.description);
          setValue('published', c.published);
          setLessons(c.lessons || []);
          if (c.thumbnail) setThumbnailPreview(c.thumbnail);
        } catch (err) {
          alert('Failed to load course details');
          navigate('/instructor/dashboard');
        } finally {
          setLoading(false);
        }
      };
      loadCourse();
    }
  }, [id, isEdit, setValue, navigate]);

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!newLessonTitle || !newLessonDuration) {
      alert('Lesson Title and Duration (minutes) are required!');
      return;
    }

    const payload = {
      title: newLessonTitle,
      content: newLessonContent,
      videoUrl: newLessonVideo,
      duration: parseInt(newLessonDuration, 10),
    };

    setLessons([...lessons, payload]);
    
    // Clear lesson composer inputs
    setNewLessonTitle('');
    setNewLessonContent('');
    setNewLessonVideo('');
    setNewLessonDuration('');
  };

  const handleRemoveLesson = (index) => {
    setLessons(lessons.filter((_, idx) => idx !== index));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('published', data.published);
    formData.append('lessons', JSON.stringify(lessons));
    
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      if (isEdit) {
        await dispatch(updateExistingCourse({ id, formData })).unwrap();
        alert('Course updated successfully!');
      } else {
        await dispatch(createNewCourse(formData)).unwrap();
        alert('Course created successfully!');
      }
      navigate('/instructor/dashboard');
    } catch (err) {
      alert(err || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit && !courseData) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-10 w-10 text-forest dark:text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-3">
        <Link to="/instructor/dashboard" className="p-2 border border-forest/10 rounded-xl hover:bg-cream dark:hover:bg-forest-dark text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-white">
            {isEdit ? 'Edit Program Settings' : 'Create Course Syllabus'}
          </h1>
          <p className="text-charcoal/80 dark:text-sand/55 text-sm mt-1">Design course syllabus lectures, media thumbnails, and lessons details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Course Meta Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <div className="premium-card space-y-5">
            <h3 className="font-bold text-base text-forest dark:text-sand border-b border-forest/5 dark:border-white/5 pb-3">Course Metadata</h3>

            {/* TITLE */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">
                Course Title
              </label>
              <input
                type="text"
                placeholder="Full Stack Engineering with MERN..."
                className={`premium-input ${errors.title ? 'border-rose-500' : ''}`}
                {...register('title', { required: 'Course title is required' })}
              />
              {errors.title && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.title.message}</span>}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">
                Course Syllabus Description
              </label>
              <textarea
                rows={5}
                placeholder="Give a brief summary of what software builders will master..."
                className={`premium-input ${errors.description ? 'border-rose-500' : ''}`}
                {...register('description', { required: 'Course description is required' })}
              />
              {errors.description && (
                <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.description.message}</span>
              )}
            </div>

            {/* COVER THUMBNAIL */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">
                Curriculum Thumbnail
              </label>
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="h-16 w-28 rounded-xl object-cover border border-forest/10 dark:border-white/10 shrink-0"
                  />
                )}
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="premium-input py-2.5 text-xs cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* PUBLISH STATE */}
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="published"
                className="h-4.5 w-4.5 rounded border-forest/20 text-forest dark:border-gold/20 dark:text-gold focus:ring-forest cursor-pointer"
                {...register('published')}
              />
              <label htmlFor="published" className="text-xs font-semibold text-charcoal/90 dark:text-sand/70 cursor-pointer">
                Publish immediately (Make course catalog discoverable)
              </label>
            </div>
          </div>

          {/* SYLLABUS LESSONS PREVIEW LIST */}
          <div className="premium-card space-y-4">
            <h3 className="font-bold text-base text-forest dark:text-sand border-b border-forest/5 dark:border-white/5 pb-3">Lessons Playlist</h3>

            {lessons.length === 0 ? (
              <div className="text-center py-8 text-xs opacity-80">
                No lessons added yet. Use the composer sidebar on the right to populate.
              </div>
            ) : (
              <div className="space-y-2">
                {lessons.map((l, index) => (
                  <div key={index} className="p-3 bg-cream/15 dark:bg-forest-dark/30 border border-forest/5 dark:border-white/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold rounded-lg">
                        <Video className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-forest dark:text-sand">{l.title}</h4>
                        <span className="text-[9px] opacity-75 block mt-0.5">{l.duration}m</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(index)}
                      className="p-1.5 text-slate-600 hover:text-rose-500 rounded cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading} className="premium-btn-primary w-full mt-4 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-inherit" />
                  <span>Saving details...</span>
                </>
              ) : (
                <span>Save Program Syllabus</span>
              )}
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: Sidebar lesson composer */}
        <div className="premium-card h-fit space-y-4">
          <h3 className="font-bold text-sm text-forest dark:text-sand border-b border-forest/5 dark:border-white/5 pb-3">
            Add Syllabus Lesson
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                Lesson Title
              </label>
              <input
                type="text"
                placeholder="Lecture Syllabus Name"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                className="premium-input py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                Lesson Content / Notes
              </label>
              <textarea
                rows={3}
                placeholder="Syllabus notes content detail..."
                value={newLessonContent}
                onChange={(e) => setNewLessonContent(e.target.value)}
                className="premium-input py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                Video Stream link (Optional)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={newLessonVideo}
                onChange={(e) => setNewLessonVideo(e.target.value)}
                className="premium-input py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                placeholder="20"
                value={newLessonDuration}
                onChange={(e) => setNewLessonDuration(e.target.value)}
                className="premium-input py-2 text-xs"
              />
            </div>

            <button
              onClick={handleAddLesson}
              className="premium-btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 font-bold"
            >
              <Plus className="h-4 w-4 text-inherit" />
              <span>Add Lesson to Syllabus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
