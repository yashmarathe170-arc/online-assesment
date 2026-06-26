import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { registerUser } from '../../store/authSlice.js';
import { User, Mail, Lock, UserCheck, Image, AlertCircle, CheckCircle, Loader2, GraduationCap } from 'lucide-react';

export const Register = () => {
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: signup, loading } = useAuth();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('role', data.role);
    if (data.avatar && data.avatar[0]) {
      formData.append('avatar', data.avatar[0]);
    }

    try {
      const result = await signup(formData);
      if (registerUser.fulfilled.match(result)) {
        setSuccessMsg(result.payload.message || 'Registration successful! Verification link sent.');
      } else {
        setErrorMsg(result.payload || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-warm-ivory dark:bg-forest-dark text-charcoal dark:text-sand transition-colors duration-300">
      <div className="premium-card w-full max-w-lg p-8 sm:p-10 border border-forest/5 dark:border-white/5 bg-white dark:bg-surface-dark shadow-[0_10px_40px_-10px_rgba(28,67,50,0.03)]">
        <div className="text-center mb-8">
          <div className="h-11 w-11 bg-forest dark:bg-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-6.5 w-6.5 text-white dark:text-forest-dark" />
          </div>
          <h2 className="text-3xl font-extrabold text-forest dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-xs opacity-85">Join Lumina Academic as a Student or Instructor</p>
        </div>

        {/* ERROR STATUS */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/5 border border-rose-500/10 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-3 text-xs leading-relaxed">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SUCCESS STATUS */}
        {successMsg && (
          <div className="mb-6 p-6 bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-2xl flex flex-col gap-3 text-center text-xs">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-450 mx-auto" />
            <span className="font-extrabold text-forest dark:text-white text-sm">Welcome to Lumina Academic!</span>
            <p className="leading-relaxed">{successMsg}</p>
            <Link to="/login" className="premium-btn-primary py-2.5 px-6 text-xs mt-4 self-center font-bold">
              Proceed to Sign In
            </Link>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* FULL NAME */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-700">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  placeholder="Emma Watson"
                  className={`premium-input pl-11 ${errors.name ? 'border-rose-500' : ''}`}
                  {...register('name', { required: 'Full name is required' })}
                />
              </div>
              {errors.name && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.name.message}</span>}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-700">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  placeholder="emma@example.com"
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

            {/* PASSWORD */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-700">
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

            {/* ROLE ACCREDITATION */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                Choose Account Role
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-700">
                  <UserCheck className="h-4.5 w-4.5" />
                </span>
                <select
                  className="premium-input pl-11 appearance-none cursor-pointer text-xs"
                  {...register('role', { required: 'Please select a role' })}
                >
                  <option value="Student">Student (Enroll & Study)</option>
                  <option value="Instructor">Instructor (Create & Teach)</option>
                </select>
              </div>
            </div>

            {/* AVATAR FILE UPLOAD */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-1.5">
                Profile Avatar Photo
              </label>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="h-12 w-12 rounded-full object-cover border border-forest dark:border-gold"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-cream dark:bg-forest-dark border border-forest/10 dark:border-white/10 flex items-center justify-center text-slate-600">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-700">
                    <Image className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="premium-input pl-11 py-2.5 text-xs cursor-pointer"
                    {...register('avatar')}
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
            </div>

            {/* REGISTER BUTTON */}
            <button type="submit" disabled={loading} className="premium-btn-primary w-full flex items-center justify-center gap-2 mt-4">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-inherit" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-forest/5 dark:border-white/5 pt-6">
          <p className="text-xs opacity-85">
            Already have an account?{' '}
            <Link to="/login" className="text-forest dark:text-gold font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
