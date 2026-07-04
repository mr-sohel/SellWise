import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@sellwise/shared';
import type { SignupDTO } from '@sellwise/shared';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api/v1';

export function SignupPage() {
  const { setAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupDTO>({
    resolver: zodResolver(signupSchema) as any,
    defaultValues: {
      preferred_lang: 'en'
    }
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: SignupDTO) => {
    try {
      const response = await axios.post('/auth/signup', data);
      if (response.data.success) {
        const { user, storeId, role } = response.data.data;
        setAuth(user, storeId, role);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup failed', error);
      alert('Signup failed. Email might already be in use.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">SellWise</h1>
          <p className="text-muted-foreground mt-2">Create your account to get started.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Language</label>
            <select
              {...register('preferred_lang')}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="en">English</option>
              <option value="bn">Bangla</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}