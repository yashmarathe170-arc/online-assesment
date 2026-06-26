import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api.js';
import { Loader2, AlertTriangle, Award, X, Timer, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

export const QuizPlayPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Play States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [submitting, setSubmitting] = useState(false);
  const [scoreReport, setScoreReport] = useState(null);

  const timerRef = useRef(null);
  const autoSubmitTriggered = useRef(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/${id}`);
        setQuiz(data.quiz);
        setTimeLeft(data.quiz.timer * 60);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (loading || quizSubmitted() || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!autoSubmitTriggered.current) {
            autoSubmitTriggered.current = true;
            handleAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, timeLeft]);

  const quizSubmitted = () => !!scoreReport;

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleAutoSubmit = () => {
    alert('Time is up! Submitting answers automatically.');
    submitAnswers(true);
  };

  const submitAnswers = async (isAuto = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    const answersArray = quiz.questions.map((_, index) =>
      selectedAnswers[index] !== undefined ? selectedAnswers[index] : -1
    );

    try {
      const { data } = await api.post(`/quizzes/${quiz._id}/submit`, { answers: answersArray });
      setScoreReport(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center bg-warm-ivory dark:bg-forest-dark min-h-screen items-center">
        <Loader2 className="h-10 w-10 text-forest dark:text-gold animate-spin" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-ivory dark:bg-forest-dark px-4">
        <div className="premium-card p-8 text-center max-w-md">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <p className="text-xs opacity-80">{error || 'Quiz not found'}</p>
          <button onClick={() => navigate(-1)} className="premium-btn-primary mt-6 py-2 px-5 text-xs font-poppins">
            Return to Course
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const hasSelected = selectedAnswers[currentQuestionIndex] !== undefined;

  // Split question text into main question & sub-instructions if applicable
  const text = currentQuestion?.questionText || '';
  const qMarkIndex = text.indexOf('?');
  let mainQuestion = text;
  let subQuestion = '';
  if (qMarkIndex !== -1 && qMarkIndex < text.length - 1) {
    mainQuestion = text.slice(0, qMarkIndex + 1);
    subQuestion = text.slice(qMarkIndex + 1).trim();
  }

  // Determine a deterministic Category based on quiz title
  const quizTitle = quiz.title.toLowerCase();
  let quizCategory = 'NEUROLOGY';
  if (quizTitle.includes('algorithm') || quizTitle.includes('data structure') || quizTitle.includes('code')) {
    quizCategory = 'ALGORITHMS';
  } else if (quizTitle.includes('ethic') || quizTitle.includes('law')) {
    quizCategory = 'DIGITAL ETHICS';
  } else if (quizTitle.includes('psych') || quizTitle.includes('cognitive') || quizTitle.includes('behavior')) {
    quizCategory = 'COGNITIVE PSYCHOLOGY';
  } else if (quizTitle.includes('design') || quizTitle.includes('ui') || quizTitle.includes('ux')) {
    quizCategory = 'DESIGN SYSTEMS';
  }

  // Refresher module detail
  let refresherText = "Review the 'Synaptic Mechanics' module for a quick recap of receptor trafficking.";
  if (quizCategory === 'ALGORITHMS') {
    refresherText = "Review the 'Complexity Analysis' module for a quick recap of asymptotic bounds.";
  } else if (quizCategory === 'DIGITAL ETHICS') {
    refresherText = "Review the 'Moral Frameworks' module for a quick recap of deontological ethics.";
  } else if (quizCategory === 'COGNITIVE PSYCHOLOGY') {
    refresherText = "Review the 'Sensory Inputs' module for a quick recap of neuron pathways.";
  } else if (quizCategory === 'DESIGN SYSTEMS') {
    refresherText = "Review the 'Color Contrast' module for a quick recap of accessibility rules.";
  }

  return (
    <div className="min-h-screen bg-warm-ivory dark:bg-forest-dark text-charcoal dark:text-sand flex flex-col justify-between transition-colors duration-300">
      
      {/* TOP HUD BAR */}
      <div className="w-full max-w-3xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to exit the quiz? Your current answers will not be saved.')) {
              navigate(-1);
            }
          }}
          className="p-2 rounded-full hover:bg-forest/5 dark:hover:bg-white/5 text-charcoal/80 dark:text-sand/85 cursor-pointer"
        >
          <X className="h-5.5 w-5.5" />
        </button>

        {/* Progress Bar & Text */}
        <div className="flex-1 max-w-md mx-6 flex flex-col items-center">
          <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-2 font-poppins">
            Question {currentQuestionIndex + 1 < 10 ? `0${currentQuestionIndex + 1}` : currentQuestionIndex + 1} of {questions.length < 10 ? `0${questions.length}` : questions.length}
          </span>
          <div className="w-full bg-forest/10 dark:bg-white/5 h-1 rounded-full overflow-hidden">
            <div
              className="bg-forest dark:bg-gold h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* User avatar */}
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
          alt={user?.name}
          className="h-9 w-9 rounded-full object-cover border border-forest/10 dark:border-gold/20 shrink-0"
        />
      </div>

      {scoreReport ? (
        /* RESULTS REPORT */
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="premium-card max-w-lg w-full p-8 text-center space-y-6 bg-white dark:bg-surface-dark shadow-[0_10px_40px_-15px_rgba(28,67,50,0.04)] animate-fade-in-up">
            <Award className="h-16 w-16 text-forest dark:text-gold mx-auto" />
            <h2 className="text-2xl font-extrabold text-forest dark:text-white font-poppins">
              Quiz Completed
            </h2>

            <div className="py-6 border-y border-forest/5 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block font-poppins">
                Result Score
              </span>
              <span className="text-5xl font-extrabold text-forest dark:text-gold block font-poppins">
                {scoreReport.score} / {scoreReport.totalQuestions}
              </span>
              <span className="text-xs opacity-85 block font-inter">
                Percentage Rate: {Math.round((scoreReport.score / scoreReport.totalQuestions) * 100)}%
              </span>
            </div>

            <button onClick={() => navigate(-1)} className="premium-btn-primary w-full py-3 font-poppins font-semibold">
              Back to Course Details
            </button>
          </div>
        </div>
      ) : (
        /* DISTRACTION-FREE PLAY */
        <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto px-4 py-8">
          
          {/* HEADER METRICS */}
          <div className="flex flex-col items-center mb-8 relative">
            {/* Category */}
            <span className="bg-sage/20 text-forest dark:bg-gold/10 dark:text-gold text-[9px] font-extrabold px-3 py-1.5 rounded-md tracking-wider uppercase mb-5 font-poppins">
              CATEGORY: {quizCategory}
            </span>

            {/* Floating Timer Pill */}
            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-poppins shadow-sm border ${
              timeLeft < 60
                ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                : 'bg-forest border-forest-dark text-white dark:bg-gold dark:border-gold dark:text-forest-dark'
            }`}>
              <Timer className="h-4 w-4 shrink-0" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* QUESTION BOX */}
          <div className="space-y-6 mb-8 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-extrabold text-forest dark:text-white leading-relaxed font-poppins">
              {mainQuestion}
            </h2>
            {subQuestion && (
              <p className="text-xs opacity-85 leading-relaxed font-inter">
                {subQuestion}
              </p>
            )}
          </div>

          {/* OPTIONS LIST */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion?.options?.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full p-5 rounded-[16px] border text-left transition-all cursor-pointer flex items-center justify-between bg-white dark:bg-surface-dark ${
                    isSelected
                      ? 'border-forest ring-1 ring-forest dark:border-gold dark:ring-gold text-forest dark:text-gold shadow-sm'
                      : 'border-forest/5 dark:border-white/5 hover:border-forest/15 hover:bg-cream/20 dark:hover:bg-forest-dark/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Radio element */}
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-forest bg-forest text-white dark:border-gold dark:bg-gold dark:text-forest-dark'
                        : 'border-slate-300 dark:border-white/20'
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white dark:bg-forest-dark" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-0.5">
                        Option {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs font-medium text-charcoal dark:text-sand font-inter leading-relaxed">
                        {option}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* REFRESHER BOX */}
          <div className="bg-cream/40 dark:bg-surface-dark/40 border border-forest/5 dark:border-white/5 rounded-2xl p-4 flex items-start gap-3.5 mb-6 text-left">
            <div className="p-2 rounded bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold shrink-0 mt-0.5">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h5 className="text-xs font-bold text-forest dark:text-sand font-poppins">Need a refresher?</h5>
                <p className="text-[10px] opacity-85 font-inter mt-0.5 leading-relaxed">
                  {refresherText}
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert('Accessing Study Room Notes...')}
                className="text-[10px] font-bold text-forest dark:text-gold hover:underline shrink-0 font-poppins self-start sm:self-center"
              >
                View Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CONTROLS */}
      {!scoreReport && (
        <div className="w-full border-t border-forest/5 dark:border-white/5 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md py-4">
          <div className="max-w-3xl mx-auto px-4 flex justify-between items-center text-xs">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-forest/10 hover:bg-cream dark:border-white/10 dark:hover:bg-forest-dark/30 font-bold text-forest dark:text-sand cursor-pointer disabled:opacity-75 disabled:pointer-events-none transition-all font-poppins"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                disabled={submitting}
                onClick={() => submitAnswers(false)}
                className="px-6 py-2.5 rounded-full bg-forest hover:bg-forest/90 text-white dark:bg-gold dark:text-forest-dark dark:hover:bg-gold/90 font-bold font-poppins cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Finish & Submit'}
              </button>
            ) : (
              <button
                disabled={!hasSelected}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-forest hover:bg-forest/90 text-white dark:bg-gold dark:text-forest-dark dark:hover:bg-gold/90 font-bold font-poppins cursor-pointer disabled:opacity-75 disabled:pointer-events-none transition-all"
              >
                <span>Next Question</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPlayPage;
