import React, { useState } from 'react';
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
      currentPassword: '',
      newPassword: '',
    }
  });

  const onSubmit = (data: UpdateProfileDTO) => {
    setSuccessMessage('');
    setErrorMessage('');
    
    // Only send the fields that actually changed
    const payload: UpdateProfileDTO = { currentPassword: data.currentPassword };
    if (data.email && data.email !== user?.email) {
      payload.email = data.email;
    }
    if (data.newPassword) {
      payload.newPassword = data.newPassword;
    }

    if (Object.keys(payload).length === 1) {
       setErrorMessage('No changes to update.');
       return;
    }

    updateProfileMutation.mutate(payload, {
      onSuccess: () => {
        setSuccessMessage('Profile updated successfully!');
        reset({ email: data.email || user?.email, currentPassword: '', newPassword: '' });
      },
      onError: (error: any) => {
        setErrorMessage(error.response?.data?.error?.message || 'Failed to update profile');
      }
    });
  };

  return (
    <div className="max-w-2xl bg-card border border-border rounded-lg shadow-sm">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold">Account Security</h2>
        <p className="text-sm text-muted-foreground mt-1">Update your email address and password.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {successMessage && (
          <div className="flex items-center p-4 text-green-800 bg-green-100 rounded-lg dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="flex items-center p-4 text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <h3 className="text-sm font-medium mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password (Required)</label>
                <input
                  {...register('currentPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                />
                {errors.currentPassword && <p className="text-destructive text-sm mt-1">{errors.currentPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  {...register('newPassword')}
                  type="password"
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                />
                {errors.newPassword && <p className="text-destructive text-sm mt-1">{errors.newPassword.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || updateProfileMutation.isPending}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow-sm text-sm font-medium transition-opacity disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
