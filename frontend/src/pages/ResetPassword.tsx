import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { authAPI } from '../api/auth';
import Navbar from '../components/common/Navbar';
import { showToast } from '../components/Toast';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type ResetFormData = z.infer<typeof resetSchema>;

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema)
  });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid or missing reset token.');
    }
  }, [token]);

  const onSubmit = async (data: ResetFormData) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, data.newPassword);
      setStatus('success');
      showToast('Password reset successfully!', 'success');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card border border-border rounded-[16px] p-10 shadow-sm text-center min-h-[300px] flex flex-col items-center justify-center"
        >
          {status === 'form' && (
            <div className="w-full">
              <Lock className="w-12 h-12 text-foreground mx-auto mb-6" />
              <h2 className="text-xl font-bold font-heading mb-2">Reset Your Password</h2>
              <p className="text-muted-foreground text-sm mb-8">Enter your new password below.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('newPassword')}
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-background focus:outline-none focus:border-foreground pr-12"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                  <PasswordStrengthMeter password={watch('newPassword')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-background focus:outline-none focus:border-foreground pr-12"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-3.5 mt-2 rounded-full bg-foreground text-background font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                </motion.button>
              </form>
            </div>
          )}

          {status === 'success' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
              <h2 className="text-xl font-bold font-heading mb-2">Password Reset Successful</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Your password has been reset. Redirecting to login...
              </p>
              <Link to="/login" className="px-8 py-3.5 rounded-full bg-foreground text-background font-medium transition-all hover:scale-[1.03]">
                Go to Login →
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
              <XCircle className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-xl font-bold font-heading mb-2">
                {token ? 'Reset Failed' : 'Invalid Reset Link'}
              </h2>
              <p className="text-muted-foreground text-sm mb-8">{errorMessage}</p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="px-8 py-3.5 rounded-full border border-border text-foreground hover:bg-foreground/5 font-medium transition-all hover:scale-[1.03]"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
