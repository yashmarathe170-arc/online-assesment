import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseById, completeCourseLesson, resetCurrentCourse } from '../../store/courseSlice.js';
import api from '../../utils/api.js';
import {
  Play,
  CheckCircle,
  FileText,
  HelpCircle,
  Award,
  Loader2,
  Calendar,
  Upload,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const CourseDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentCourse: course, loading, error } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'assignments' | 'quizzes' | 'certificate'
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  // Assignments & Quizzes lists
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Certificate status
  const [certificate, setCertificate] = useState(null);
  const [certGenerating, setCertGenerating] = useState(false);

  useEffect(() => {
    dispatch(fetchCourseById(id));
    return () => {
      dispatch(resetCurrentCourse());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (course) {
      const fetchCourseMaterials = async () => {
        try {
          const resAssign = await api.get(`/assignments/course/${course._id}`);
          setAssignments(resAssign.data.assignments);

          const resQuiz = await api.get(`/quizzes/course/${course._id}`);
          setQuizzes(resQuiz.data.quizzes);
        } catch (err) {
          console.error(err);
        }
      };

      const fetchCert = async () => {
        try {
          const { data } = await api.get('/certificates/my');
          const courseCert = data.certificates.find((c) => c.course?._id === course._id);
          if (courseCert) setCertificate(courseCert);
        } catch (err) {
          console.error(err);
        }
      };

      fetchCourseMaterials();
      fetchCert();
    }
  }, [course]);

  if (loading || !course) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-10 w-10 text-forest dark:text-gold animate-spin" />
      </div>
    );
  }

  const lessons = course.lessons || [];
  const currentLesson = lessons[activeLessonIndex];
  
  const progressObj = course.progress?.find((p) => p.student === user?.id || p.student?._id === user?.id);
  const completedLessons = progressObj ? progressObj.completedLessons : [];

  const isLessonCompleted = (lessonId) => completedLessons.includes(lessonId);

  const handleCompleteLesson = () => {
    if (currentLesson) {
      dispatch(completeCourseLesson({ courseId: course._id, lessonId: currentLesson._id }));
    }
  };

  // Personal Notes functionality
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentLesson) {
      const savedNotes = localStorage.getItem(`notes_${id}_${currentLesson._id}`) || '';
      setNotes(savedNotes);
    }
  }, [currentLesson, id]);

  const handleNotesChange = (value) => {
    setNotes(value);
    if (currentLesson) {
      localStorage.setItem(`notes_${id}_${currentLesson._id}`, value);
    }
  };

  const downloadNotes = () => {
    if (!currentLesson) return;
    const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `Notes_${course?.title.replace(/\s+/g, '_')}_${currentLesson.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Drag and Drop files handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setUploadFile(file);
      } else {
        alert("Only PDF files are supported!");
      }
    }
  };

  const handleAssignmentSubmit = async (e, assignmentId) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a PDF file first!');
      return;
    }

    setSubmittingAssignmentId(assignmentId);
    const formData = new FormData();
    formData.append('assignment', uploadFile);

    try {
      await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Assignment submitted successfully!');
      
      const { data } = await api.get(`/assignments/course/${course._id}`);
      setAssignments(data.assignments);
      setUploadFile(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmittingAssignmentId(null);
    }
  };

  const handleGenerateCertificate = async () => {
    setCertGenerating(true);
    try {
      const { data } = await api.post('/certificates/generate', { courseId: course._id });
      setCertificate(data.certificate);
      alert('Congratulations! Your certificate has been issued.');
    } catch (err) {
      alert(err.response?.data?.message || 'Certificate generation failed');
    } finally {
      setCertGenerating(false);
    }
  };

  const courseFinished = lessons.length > 0 && completedLessons.length === lessons.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-white">{course.title}</h1>
          <p className="text-charcoal/80 dark:text-sand/55 text-sm mt-1">Instructor: {course.instructor?.name}</p>
        </div>
        <div className="flex gap-2.5">
          {courseFinished && !certificate && (
            <button
              onClick={handleGenerateCertificate}
              disabled={certGenerating}
              className="premium-btn-primary flex items-center gap-2"
            >
              {certGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
              <span>Claim Certificate</span>
            </button>
          )}
          {certificate && (
            <a
              href={`http://localhost:5000${certificate.pdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn-primary flex items-center gap-2"
            >
              <Award className="h-4.5 w-4.5" />
              <span>Download PDF Certificate</span>
            </a>
          )}
        </div>
      </div>

      {/* COMPONENT TAB SELECTOR */}
      <div className="flex border-b border-forest/5 dark:border-white/5 space-x-1">
        {['lessons', 'assignments', 'quizzes', 'certificate'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3.5 px-6 font-semibold text-xs capitalize border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-forest dark:border-gold text-forest dark:text-gold'
                : 'border-transparent text-charcoal/80 dark:text-sand/50 hover:text-charcoal dark:hover:text-sand'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CORE DISPLAY */}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PLAY AND DESCRIPTIONS PANEL */}
          <div className="lg:col-span-2 space-y-6">
            {currentLesson ? (
              <>
                <div className="premium-card overflow-hidden p-0 bg-black flex items-center justify-center relative aspect-video shadow-sm">
                  {currentLesson.videoUrl ? (
                    <video
                      key={currentLesson._id}
                      controls
                      className="w-full h-full"
                      src={currentLesson.videoUrl}
                    />
                  ) : (
                    <div className="text-center text-slate-500 flex flex-col items-center gap-2 py-20">
                      <Play className="h-12 w-12 text-slate-700" />
                      <span>No lesson video available.</span>
                    </div>
                  )}
                </div>

                <div className="premium-card">
                  <h3 className="text-lg font-bold text-forest dark:text-sand">{currentLesson.title}</h3>
                  <p className="text-xs opacity-85 leading-relaxed mt-4">{currentLesson.content}</p>

                  <div className="mt-8 pt-5 border-t border-forest/5 dark:border-white/5 flex justify-between items-center text-xs">
                    <span className="opacity-80">Syllabus duration: {currentLesson.duration}m</span>
                    {isLessonCompleted(currentLesson._id) ? (
                      <span className="text-forest dark:text-gold font-bold flex items-center gap-1">
                        <CheckCircle className="h-4.5 w-4.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <button onClick={handleCompleteLesson} className="premium-btn-primary py-2 px-5 text-[10px]">
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>

                {/* DIGITAL NOTEBOOK WIDGET */}
                <div className="premium-card">
                  <div className="flex items-center justify-between pb-4 border-b border-forest/5 dark:border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <h4 className="font-bold text-sm text-forest dark:text-sand">Digital Notebook</h4>
                    </div>
                    {notes.trim() && (
                      <button
                        onClick={downloadNotes}
                        className="text-xs text-forest dark:text-gold hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Download Notes (.txt)</span>
                      </button>
                    )}
                  </div>
                  <div className="mt-4">
                    <textarea
                      value={notes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Capture key concepts, code snippets, or notes from this lecture... (Saved automatically)"
                      className="premium-input h-36 resize-none font-mono text-xs leading-relaxed"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="premium-card p-12 text-center">
                <Play className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs opacity-85">This course syllabus has no lessons registered.</p>
              </div>
            )}
          </div>

          {/* PLAYLIST ACCORDION */}
          <div className="premium-card h-fit">
            <h3 className="font-bold text-sm text-forest dark:text-sand pb-4 border-b border-forest/5 dark:border-white/5">
              Course syllabus lessons
            </h3>
            <div className="mt-4 space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {lessons.map((l, index) => {
                const isCompleted = isLessonCompleted(l._id);
                const isActive = index === activeLessonIndex;
                return (
                  <button
                    key={l._id}
                    onClick={() => setActiveLessonIndex(index)}
                    className={`w-full p-3 rounded-xl text-left flex items-start gap-3 transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-cream/40 dark:bg-forest-dark/40 border-forest/10 dark:border-white/10'
                        : 'bg-transparent border-transparent hover:bg-cream/20 dark:hover:bg-forest-dark/20'
                    }`}
                  >
                    <div className={`mt-0.5 p-1 rounded-lg ${isActive ? 'bg-forest text-white' : 'bg-cream text-forest'}`}>
                      <Play className="h-3 w-3 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-xs truncate ${isActive ? 'text-forest dark:text-gold' : 'text-charcoal/80 dark:text-sand/80'}`}>
                        {l.title}
                      </h4>
                      <span className="text-[9px] opacity-75 mt-0.5 block">{l.duration}m</span>
                    </div>
                    {isCompleted && <CheckCircle className="h-4 w-4 text-forest dark:text-gold shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {assignments.length === 0 ? (
            <div className="premium-card p-12 text-center">
              <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-xs opacity-85">No assignments posted for this course.</p>
            </div>
          ) : (
            assignments.map((a) => {
              const submission = a.submissions?.find((s) => s.student === user?.id || s.student?._id === user?.id);
              return (
                <div key={a._id} className="premium-card grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-extrabold text-lg text-forest dark:text-sand">{a.title}</h3>
                    <p className="text-xs opacity-70 leading-relaxed">{a.description}</p>
                    <span className="inline-block text-[10px] text-charcoal/80 dark:text-sand/55 font-semibold bg-cream/50 dark:bg-forest-dark/50 px-3 py-1 rounded-full">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* PREMIUM FILE DRAG AND DROP BOX */}
                  <div className="p-5 bg-cream/20 dark:bg-forest-dark/20 border border-forest/8 dark:border-white/5 rounded-[18px]">
                    <h4 className="font-bold text-xs text-forest dark:text-sand mb-4 pb-2 border-b border-forest/5">Submission</h4>

                    {submission ? (
                      <div className="space-y-4 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="opacity-55">Status</span>
                          <span className="px-2 py-0.5 rounded-full bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold font-bold text-[9px] uppercase border border-forest/10 dark:border-gold/10">
                            Submitted
                          </span>
                        </div>

                        {submission.grade ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="opacity-55">Evaluation</span>
                              <span className="font-bold text-forest dark:text-gold text-sm">{submission.grade}</span>
                            </div>
                            {submission.feedback && (
                              <div className="p-3 bg-white dark:bg-surface-dark border border-forest/5 rounded-xl text-[11px] leading-relaxed">
                                <span className="text-[9px] font-bold uppercase opacity-75 block">Feedback</span>
                                <p className="opacity-80 mt-1">{submission.feedback}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-gold/90 font-semibold bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>Pending instructor evaluation</span>
                          </div>
                        )}

                        <a
                          href={`http://localhost:5000${submission.pdfUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white dark:bg-surface-dark border border-forest/8 dark:border-white/5 rounded-xl text-[10px] font-bold hover:bg-cream dark:hover:bg-forest-dark transition-all"
                        >
                          <span>Review PDF Upload</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ) : (
                      <form onSubmit={(e) => handleAssignmentSubmit(e, a._id)} className="space-y-4">
                        {/* Drag and Drop Container */}
                        <div
                          className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                            dragActive
                              ? 'border-forest bg-forest/5 dark:border-gold dark:bg-gold/5'
                              : 'border-forest/15 bg-cream/10 dark:border-white/10 hover:border-forest/35 dark:hover:border-gold/30 hover:bg-cream/40 dark:hover:bg-forest-dark/40'
                          }`}
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            id={`file-${a._id}`}
                            onChange={(e) => setUploadFile(e.target.files[0])}
                          />
                          <label htmlFor={`file-${a._id}`} className="cursor-pointer block">
                            <Upload className="h-8 w-8 text-slate-600 mx-auto mb-2.5" />
                            <span className="text-[10px] font-bold text-forest dark:text-gold block mb-1">
                              {uploadFile ? uploadFile.name : 'Select PDF submission'}
                            </span>
                            <span className="text-[9px] opacity-75 block">Or drag & drop file here</span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={submittingAssignmentId === a._id}
                          className="premium-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
                        >
                          {submittingAssignmentId === a._id ? (
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          ) : (
                            <span>Submit Solution</span>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {quizzes.length === 0 ? (
            <div className="premium-card p-12 text-center">
              <HelpCircle className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-xs opacity-85">No quizzes are registered for this course.</p>
            </div>
          ) : (
            quizzes.map((q) => {
              const studentAttempts = q.attempts?.filter((att) => att.student === user?.id || att.student?._id === user?.id);
              const maxScore = studentAttempts?.length > 0 ? Math.max(...studentAttempts.map((a) => a.score)) : null;

              return (
                <div key={q._id} className="premium-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <h3 className="font-extrabold text-base text-forest dark:text-sand">{q.title}</h3>
                    <p className="text-xs opacity-80 mt-1">
                      {q.questions?.length} questions • Time limit: {q.timer} minutes
                    </p>

                    {maxScore !== null && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-forest dark:text-gold font-bold bg-forest/5 dark:bg-gold/10 px-3 py-1 rounded-full mt-3 border border-forest/10 dark:border-gold/10">
                        <CheckCircle className="h-3.5 w-3.5" />
                        High Score: {maxScore} / {q.questions?.length}
                      </span>
                    )}
                  </div>

                  <Link to={`/student/quizzes/${q._id}`} className="premium-btn-primary py-2.5 px-6 text-xs flex items-center gap-1.5 shrink-0">
                    <span>Begin Evaluation</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'certificate' && (
        <div className="premium-card max-w-2xl mx-auto p-12 text-center space-y-6">
          <Award className="h-16 w-16 text-forest dark:text-gold mx-auto" />
          <h2 className="text-2xl font-extrabold text-forest dark:text-white">Program Graduation</h2>

          <div className="text-xs opacity-75 max-w-lg mx-auto leading-relaxed">
            {courseFinished ? (
              <p>
                Congratulations! You have completed all {lessons.length} lessons. You are eligible to generate
                and claim your certificate of completion.
              </p>
            ) : (
              <p>
                Complete all {lessons.length} lessons in the syllabus to unlock your certificate credentials.
                Currently you completed {completedLessons.length} lessons.
              </p>
            )}
          </div>

          <div className="pt-6">
            {certificate ? (
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] text-forest dark:text-gold font-bold bg-forest/5 dark:bg-gold/10 px-3.5 py-1.5 rounded-full border border-forest/15 dark:border-gold/10">
                  <CheckCircle className="h-4.5 w-4.5" />
                  Certificate Number: {certificate.certificateNumber}
                </span>
                <a
                  href={`http://localhost:5000${certificate.pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-btn-primary w-full max-w-xs py-3 block mx-auto font-bold"
                >
                  Download PDF Credentials
                </a>
              </div>
            ) : courseFinished ? (
              <button
                onClick={handleGenerateCertificate}
                disabled={certGenerating}
                className="premium-btn-primary py-3 px-8 flex items-center justify-center gap-2 mx-auto"
              >
                {certGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-inherit" />
                    <span>Issuing credentials...</span>
                  </>
                ) : (
                  <span>Claim Certificate</span>
                )}
              </button>
            ) : (
              <button disabled className="premium-btn-secondary py-3 px-8 opacity-45 cursor-not-allowed">
                Certificate Locked
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
