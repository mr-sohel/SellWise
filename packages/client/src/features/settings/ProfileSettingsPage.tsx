import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@sellwise/shared';
import type { UpdateProfileDTO } from '@sellwise/shared';
import { useUpdateProfile } from './hooks/useProfile';
import { useAuthStore } from '../../stores/auth.store';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ProfileSettingsPage() {
  const { user } = useAuthStore();
  const updateProfileMutation = useUpdateProfile();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<UpdateProfileDTO>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      email: user?.email || '',
      current_password: '',
      new_password: '',
    }
  });

  const onSubmit = (data: UpdateProfileDTO) => {
    setSuccessMessage('');
    setErrorMessage('');

    const payload: UpdateProfileDTO = { current_password: data.current_password };
    if (data.email && data.email !== user?.email) {
      payload.email = data.email;
    }
    if (data.new_password) {
      payload.new_password = data.new_password;
    }

    if (Object.keys(payload).length === 1) {
       setErrorMessage('No changes to update.');
       return;
    }

    updateProfileMutation.mutate(payload, {
      onSuccess: () => {
        setSuccessMessage('Profile updated successfully!');
        reset({ email: data.email || user?.email, current_password: '', new_password: '' });
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.error?.message || 'Failed to update profile');
      }
    });
  };

  return (
    <div className="max-w-2xl bg-card border border-border rounded-xl shadow-vercel-3">
      <div className="p-6 border-b border-border">
        <h2 className="text-base font-medium">Account Security</h2>
        <p className="text-sm text-muted-foreground mt-1">Update your email address and password.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {successMessage && (
          <div className="flex items-center p-4 text-link bg-link-bg-soft rounded-lg text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center p-4 text-destructive bg-error-soft rounded-lg border border-destructive/20 text-sm font-medium">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
            />
            {errors.email && <p className="text-destructive text-sm mt-1.5">{errors.email.message}</p>}
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <h3 className="text-sm font-medium mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Current Password (Required)</label>
                <input
                  {...register('current_password')}
                  type="password"
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
                />
                {errors.current_password && <p className="text-destructive text-sm mt-1.5">{errors.current_password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">New Password</label>
                <input
                  {...register('new_password')}
                  type="password"
                  placeholder="Leave blank to keep current password"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground"
                />
                {errors.new_password && <p className="text-destructive text-sm mt-1.5">{errors.new_password.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || updateProfileMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
