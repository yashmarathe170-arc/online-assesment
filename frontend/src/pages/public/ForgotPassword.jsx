import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, AlertCircle, CheckCircle, Loader2, GraduationCap } from 'lucide-react';

export const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`,
        data
      );
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-warm-ivory dark:bg-forest-dark text-charcoal dark:text-sand transition-colors duration-300">
      <div className="premium-card w-full max-w-md p-8 border border-forest/5 dark:border-white/5 bg-white dark:bg-surface-dark shadow-[0_10px_40px_-10px_rgba(28,67,50,0.03)]">
        <div className="text-center mb-6">
          <div className="h-11 w-11 bg-forest dark:bg-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-6.5 w-6.5 text-white dark:text-forest-dark" />
          </div>
          <h2 className="text-2xl font-extrabold text-forest dark:text-white mb-2">
            Reset Password
          </h2>
          <p className="text-xs opacity-85">Recover access to your learning panel</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/5 border border-rose-500/10 text-rose-700 dark:text-rose-355 rounded-xl flex items-center gap-3 text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 dark:text-rose-450" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="h-12 w-12 text-emerald-650 dark:text-emerald-450 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Check Your Inbox</h3>
            <p className="text-xs opacity-75 leading-relaxed">
              We have sent a secure password reset link to your email address. Please check your inbox.
            </p>
            <Link to="/login" className="premium-btn-primary w-full text-center text-xs block py-2.5">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <p className="text-xs opacity-85 leading-relaxed text-center">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-600">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className={`premium-input pl-11 ${errors.email ? 'border-rose-500' : ''}`}
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address format',
                    },
                  })}
                />
              </div>
              {errors.email && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.email.message}</span>}
            </div>

            <button type="submit" disabled={loading} className="premium-btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-inherit" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
            <Link to="/login" className="text-xs text-forest dark:text-gold block text-center hover:underline mt-2 font-semibold">
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
