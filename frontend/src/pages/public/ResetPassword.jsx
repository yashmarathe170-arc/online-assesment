import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, AlertCircle, CheckCircle, Loader2, GraduationCap } from 'lucide-react';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password', '');

  const onSubmit = async (data) => {
    if (!token) {
      setErrorMsg('Reset token is missing in URL.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/reset-password`,
        { token, password: data.password }
      );
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Password reset failed.');
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
            New Password
          </h2>
          <p className="text-xs opacity-85">Enter your new credential configuration</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/5 border border-rose-500/10 text-rose-700 dark:text-rose-355 rounded-xl flex items-center gap-3 text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 dark:text-rose-450" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-450 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Password Updated!</h3>
            <p className="text-xs opacity-75">
              Your password has been changed. You will be redirected to the login page shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-xs opacity-85 text-center leading-relaxed mb-4">
              Enter and confirm your new password below.
            </p>

            {/* PASSWORD */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-600">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`premium-input pl-11 ${errors.password ? 'border-rose-500' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
              </div>
              {errors.password && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.password.message}</span>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-600">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`premium-input pl-11 ${errors.confirmPassword ? 'border-rose-500' : ''}`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button type="submit" disabled={loading} className="premium-btn-primary w-full flex items-center justify-center gap-2 mt-4">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-inherit" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save New Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
