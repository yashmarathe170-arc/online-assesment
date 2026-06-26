import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { loginUser } from '../../store/authSlice.js';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, GraduationCap, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('expired');
  const [alertMsg, setAlertMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isAuthenticated, user, loading, error, clearAuthError } = useAuth();

  useEffect(() => {
    if (expired) {
      setAlertMsg('Your session has expired. Please sign in again.');
    }
    clearAuthError();
  }, [expired, clearAuthError]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardRoute =
        user.role === 'Admin'
          ? '/admin/dashboard'
          : user.role === 'Instructor'
          ? '/instructor/dashboard'
          : '/student/dashboard';
      navigate(dashboardRoute);
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setAlertMsg(null);
    const result = await login(data);
    if (loginUser.rejected.match(result)) {
      setAlertMsg(result.payload);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-warm-ivory dark:bg-forest-dark text-charcoal dark:text-sand transition-colors duration-300">
      <div className="premium-card w-full max-w-lg p-8 sm:p-10 border border-forest/5 dark:border-white/5 bg-white dark:bg-surface-dark shadow-[0_10px_40px_-10px_rgba(28,67,50,0.03)]">
        <div className="text-center mb-8">
          <div className="h-11 w-11 bg-forest dark:bg-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-6.5 w-6.5 text-white dark:text-forest-dark" />
          </div>
          <h2 className="text-3xl font-extrabold text-forest dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-xs opacity-85">Access your Lumina Academic learning workspace</p>
        </div>

        {/* SOCIAL SIGN IN */}
        <div className="grid grid-cols-2 gap-3.5 mb-6">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-cream/50 dark:bg-forest-dark/30 hover:bg-cream dark:hover:bg-forest-dark/50 border border-forest/8 dark:border-white/5 rounded-full text-xs font-semibold premium-transition cursor-pointer"
            onClick={() => alert('Social Authentication is not configured for this sandbox environment.')}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-cream/50 dark:bg-forest-dark/30 hover:bg-cream dark:hover:bg-forest-dark/50 border border-forest/8 dark:border-white/5 rounded-full text-xs font-semibold premium-transition cursor-pointer"
            onClick={() => alert('Social Authentication is not configured for this sandbox environment.')}
          >
            <svg className="h-4 w-4 text-charcoal dark:text-sand" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.96-1.41z"/>
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-forest/10 dark:border-white/5"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-surface-dark text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500">Or continue with</span>
        </div>

        {/* ALERT STATUS */}
        {(alertMsg || error) && (
          <div className="mb-6 p-4 bg-rose-500/5 border border-rose-500/10 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-3 text-xs leading-relaxed">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{alertMsg || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* EMAIL */}
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
                placeholder="alex.sterling@lumina.edu"
                className={`premium-input pl-11 ${errors.email ? 'border-rose-500 focus:ring-rose-500' : ''}`}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email format',
                  },
                })}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.email.message}</span>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-forest dark:text-gold hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-600">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`premium-input pl-11 pr-11 ${errors.password ? 'border-rose-500 focus:ring-rose-500' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-forest dark:hover:text-gold cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.password.message}</span>
            )}
          </div>

          {/* SIGN IN TRIGGER */}
          <button type="submit" disabled={loading} className="premium-btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-inherit" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4 text-inherit" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-forest/5 dark:border-white/5 pt-6">
          <p className="text-xs opacity-85">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-forest dark:text-gold font-bold hover:underline">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
