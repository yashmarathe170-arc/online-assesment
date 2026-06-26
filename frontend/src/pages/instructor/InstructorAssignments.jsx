import React, { useEffect, useState } from 'react';
import api from '../../utils/api.js';
import { Loader2, FileText, CheckCircle, Clock, ExternalLink, Award } from 'lucide-react';

export const InstructorAssignments = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Grading state
  const [activeGradeStudentId, setActiveGradeStudentId] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradingSubmit, setGradingSubmit] = useState(false);

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        const { data } = await api.get('/courses/instructor/me');
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourseId(data.courses[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructorCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const fetchCourseAssignments = async () => {
        try {
          const { data } = await api.get(`/assignments/course/${selectedCourseId}`);
          setAssignments(data.assignments);
          setSelectedAssignment(null);
          setActiveGradeStudentId(null);
        } catch (err) {
          console.error(err);
        }
      };
      fetchCourseAssignments();
    }
  }, [selectedCourseId]);

  const handleGradeSubmit = async (e, assignmentId, studentId) => {
    e.preventDefault();
    if (!grade) {
      alert('Grade value is required!');
      return;
    }

    setGradingSubmit(true);
    try {
      await api.put(`/assignments/${assignmentId}/grade`, {
        studentId,
        grade,
        feedback,
      });

      alert('Submission graded successfully!');
      
      const { data } = await api.get(`/assignments/course/${selectedCourseId}`);
      setAssignments(data.assignments);
      
      const updated = data.assignments.find((a) => a._id === assignmentId);
      setSelectedAssignment(updated);
      
      setActiveGradeStudentId(null);
      setGrade('');
      setFeedback('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade submission');
    } finally {
      setGradingSubmit(false);
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
        <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-white">Solution Evaluation</h1>
        <p className="text-charcoal/80 dark:text-sand/55 text-sm mt-1.5">Review student PDF uploads and provide grading and comments feedback.</p>
      </div>

      {courses.length === 0 ? (
        <div className="premium-card p-12 text-center">
          <p className="text-xs opacity-85">Create a course curriculum first to post assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT COLUMN: Sidebar selecting course & tasks */}
          <div className="space-y-4 lg:col-span-1">
            <div className="premium-card p-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="premium-input py-2 text-xs cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="premium-card p-4">
              <h3 className="font-bold text-xs text-forest dark:text-sand border-b border-forest/5 dark:border-white/5 pb-2 mb-3">Tasks List</h3>
              {assignments.length === 0 ? (
                <p className="text-[10px] opacity-75 py-4">No assignments posted.</p>
              ) : (
                <div className="space-y-1.5">
                  {assignments.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => {
                        setSelectedAssignment(a);
                        setActiveGradeStudentId(null);
                      }}
                      className={`w-full p-2.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer truncate ${
                        selectedAssignment?._id === a._id
                          ? 'bg-forest/5 dark:bg-gold/10 border-forest/10 dark:border-gold/20 text-forest dark:text-gold font-bold'
                          : 'bg-transparent border-transparent hover:bg-cream/30 dark:hover:bg-forest-dark/20 text-charcoal/85 dark:text-sand/85'
                      }`}
                    >
                      {a.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Details list */}
          <div className="lg:col-span-3 space-y-6">
            {!selectedAssignment ? (
              <div className="premium-card p-16 text-center">
                <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs opacity-85">Select an assignment task from the sidebar to review submissions.</p>
              </div>
            ) : (
              <div className="premium-card space-y-6">
                <div>
                  <h2 className="font-extrabold text-base text-forest dark:text-white">{selectedAssignment.title}</h2>
                  <p className="text-[10px] opacity-75 mt-1">
                    Due Date: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="border-t border-forest/5 dark:border-white/5 pt-6">
                  <h3 className="font-bold text-xs text-forest dark:text-sand mb-4">Student Solutions</h3>
                  {selectedAssignment.submissions?.length === 0 ? (
                    <p className="text-xs opacity-80 py-6 text-center">No student submissions submitted yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedAssignment.submissions?.map((sub) => {
                        const studentData = sub.student;
                        const isGraded = !!sub.grade;
                        const isGradingNow = activeGradeStudentId === sub.student?._id || activeGradeStudentId === sub.student;

                        return (
                          <div key={sub._id} className="p-4 border border-forest/5 dark:border-white/5 bg-cream/15 dark:bg-forest-dark/25 rounded-xl space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                              <div>
                                <span className="font-bold text-forest dark:text-sand block">
                                  {studentData?.name || 'Anonymous Student'}
                                </span>
                                <span className="opacity-45 block mt-0.5">{studentData?.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="opacity-75">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  isGraded
                                    ? 'bg-forest/5 text-forest border border-forest/10 dark:bg-gold/10 dark:text-gold dark:border-gold/20'
                                    : 'bg-amber-500/5 text-amber-600 border border-amber-500/10'
                                }`}>
                                  {isGraded ? `Graded: ${sub.grade}` : 'Awaiting Grade'}
                                </span>
                              </div>
                            </div>

                            {/* GRADING ACTIONS ROW */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-forest/5 dark:border-white/5 justify-end">
                              <a
                                href={`http://localhost:5000${sub.pdfUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 py-1.5 px-3 border border-forest/10 dark:border-white/10 rounded-xl text-[10px] font-semibold hover:bg-cream/40 dark:hover:bg-forest-dark/40"
                              >
                                <span>Review Uploaded PDF</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>

                              {!isGradingNow && (
                                <button
                                  onClick={() => {
                                    setActiveGradeStudentId(studentData?._id || studentData);
                                    setGrade(sub.grade || '');
                                    setFeedback(sub.feedback || '');
                                  }}
                                  className="premium-btn-primary py-1.5 px-4 text-[10px] font-bold"
                                >
                                  {isGraded ? 'Edit Grade' : 'Evaluate'}
                                </button>
                              )}
                            </div>

                            {/* GRADING FORM */}
                            {isGradingNow && (
                              <form onSubmit={(e) => handleGradeSubmit(e, selectedAssignment._id, studentData?._id || studentData)} className="p-4 bg-white dark:bg-surface-dark border border-forest/8 dark:border-white/5 rounded-xl space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                  <div className="sm:col-span-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                                      Grade Points
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="A, 90/100"
                                      value={grade}
                                      onChange={(e) => setGrade(e.target.value)}
                                      className="premium-input py-1.5 text-xs"
                                    />
                                  </div>
                                  <div className="sm:col-span-3">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                                      Instructor Feedback
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Provide comments..."
                                      value={feedback}
                                      onChange={(e) => setFeedback(e.target.value)}
                                      className="premium-input py-1.5 text-xs"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-2 justify-end text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => setActiveGradeStudentId(null)}
                                    className="premium-btn-secondary py-1.5 px-3"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={gradingSubmit}
                                    className="premium-btn-primary py-1.5 px-4 font-bold"
                                  >
                                    {gradingSubmit ? 'Saving...' : 'Submit Evaluation'}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorAssignments;
