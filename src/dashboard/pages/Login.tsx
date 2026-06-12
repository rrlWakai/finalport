import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Loader2 } from 'lucide-react';

export function Login() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) setError(signInError);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-outline/40 bg-surface p-6 sm:p-8 shadow-sm">
          <h1 className="font-display-xl text-xl font-semibold text-on-surface text-center mb-1">
            RL Dashboard
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant text-center mb-6">
            Sign in to manage your consultations
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-outline/30 bg-surface text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-outline/30 bg-surface text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-xs text-error">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-9 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
