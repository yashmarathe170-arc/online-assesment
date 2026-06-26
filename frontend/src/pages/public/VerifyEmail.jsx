import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-email?token=${token}`
        );
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-warm-ivory dark:bg-forest-dark text-charcoal dark:text-sand transition-colors duration-300">
      <div className="premium-card w-full max-w-md p-8 text-center border border-forest/5 dark:border-white/5 bg-white dark:bg-surface-dark shadow-[0_10px_40px_-10px_rgba(28,67,50,0.03)]">
        <h2 className="text-3xl font-extrabold tracking-tight text-forest dark:text-gold mb-6 uppercase">
          Lumina Academic
        </h2>

        {status === 'loading' && (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-forest dark:text-gold animate-spin" />
            <p className="text-sm opacity-85">Verifying your email address, please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 flex flex-col items-center gap-4">
            <CheckCircle className="h-16 w-16 text-emerald-600 dark:text-emerald-450" />
            <h3 className="text-xl font-bold text-forest dark:text-white">Verification Successful!</h3>
            <p className="text-xs opacity-85 mb-6">{message}</p>
            <Link to="/login" className="premium-btn-primary w-full text-center">
              Proceed to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 flex flex-col items-center gap-4">
            <AlertTriangle className="h-16 w-16 text-rose-500" />
            <h3 className="text-xl font-bold text-forest dark:text-white">Verification Failed</h3>
            <p className="text-xs opacity-85 mb-6">{message}</p>
            <Link to="/register" className="premium-btn-primary w-full text-center">
              Register Again
            </Link>
            <Link to="/login" className="text-xs text-forest dark:text-gold hover:underline mt-4 font-semibold">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
