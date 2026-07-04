import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@sellwise/shared';
import type { LoginDTO } from '@sellwise/shared';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../../lib/api/client';

import { toast } from 'sonner';

export function LoginPage() {
  const { setAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema)
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginDTO) => {
    try {
      const response = await api.post('/auth/login', data);
      if (response.data.success) {
        const { user, store, role } = response.data.data;
        setAuth(user, store, role);
        if (!store?.business_type) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login failed', error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-soft px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-foreground mb-2">SellWise</h1>
          <p className="text-sm text-body">Welcome back! Please login to your account.</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-vercel-4 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                className="flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-destructive text-sm mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                {...register('password')}
                type="password"
                className="flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-destructive text-sm mt-1.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center h-12 px-4 text-base font-medium rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-body">
          Don't have an account?{' '}
          <Link to="/signup" className="text-link hover:underline underline-offset-4 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
