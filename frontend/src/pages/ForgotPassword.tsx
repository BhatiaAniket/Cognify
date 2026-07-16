import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../api/auth';
import Navbar from '../components/common/Navbar';
import { showToast } from '../components/Toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'form' | 'sent'>('form');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setStatus('sent');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
              <h2 className="text-xl font-bold font-heading mb-2">Forgot Password</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background focus:outline-none focus:border-foreground transition-all focus:shadow-[0_0_0_1px_var(--foreground)]"
                    placeholder="name@company.com"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-foreground text-background font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </motion.button>
              </form>

              <Link to="/login" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground mt-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          )}

          {status === 'sent' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
              <Mail className="w-16 h-16 text-foreground mb-6" />
              <h2 className="text-xl font-bold font-heading mb-2">Check your inbox</h2>
              <p className="text-muted-foreground text-sm mb-8">
                If an account exists with that email, a password reset link has been sent.
              </p>
              <Link to="/login" className="px-8 py-3.5 rounded-full bg-foreground text-background font-medium transition-all hover:scale-[1.03]">
                Back to Login →
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
