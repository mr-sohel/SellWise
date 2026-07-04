import React, { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { useStaff, useAddStaff, useRemoveStaff } from './hooks/useStaff';
import { Trash2, UserPlus, Shield, User, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemberSchema } from '@sellwise/shared';
import type { CreateMemberDTO } from '@sellwise/shared';

export function StaffManagementPage() {
  const { activeStoreId, user: currentUser, role: globalRole } = useAuthStore();
  const storeId = activeStoreId || '';

  const { data: result, isLoading, error } = useStaff(storeId);
  const addStaffMutation = useAddStaff(storeId);
  const removeStaffMutation = useRemoveStaff(storeId);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateMemberDTO>({
    resolver: zodResolver(createMemberSchema) as any,
    defaultValues: {
      preferred_lang: 'en'
    }
  });

  const staffMembers = result?.data || [];

  const handleRemove = (userId: string) => {
    if (window.confirm('Are you sure you want to revoke access for this employee?')) {
      removeStaffMutation.mutate(userId, {
        onSuccess: () => alert('Staff member removed.'),
        onError: (err: any) => {
          alert(err.response?.data?.error?.message || 'Failed to remove staff member');
        }
      });
    }
  };

  const onSubmit = (data: CreateMemberDTO) => {
    addStaffMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
      },
      onError: (err: any) => {
        alert(err.response?.data?.error?.message || 'Failed to add staff member');
      }
    });
  };

  const isOwner = globalRole === 'owner' || staffMembers.find(m => m.id === currentUser?.id)?.role === 'owner';

  if (globalRole && globalRole !== 'owner') {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
        Only the store owner can manage staff members.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center gap-4">
        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow-sm text-sm font-medium transition-opacity"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </button>
        )}
      </div>

      {!isOwner && !isLoading && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
          Only the store owner can manage staff members.
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
           {((error as any).response?.data?.error?.message) || 'Failed to load staff members.'}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading staff members...</div>
        ) : staffMembers.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-foreground">No staff found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffMembers.map((member: any) => (
                  <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {member.email} {member.id === currentUser?.id ? '(You)' : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.role === 'owner'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {member.role === 'owner' ? <Shield className="h-3 w-3 mr-1" /> : null}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isOwner && member.id !== currentUser?.id && member.role !== 'owner' ? (
                        <button
                          onClick={() => handleRemove(member.id)}
                          disabled={removeStaffMutation.isPending}
                          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          title="Revoke Access"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Invite Employee</h2>
              <button
                onClick={() => { setIsModalOpen(false); reset(); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="employee@store.com"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Temporary Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
                <p className="text-muted-foreground text-xs mt-1">They can change this later.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preferred Language</label>
                <select
                  {...register('preferred_lang')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="en">English</option>
                  <option value="bn">Bangla</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); reset(); }}
                  className="px-4 py-2 border border-border bg-transparent hover:bg-muted rounded-md text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStaffMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow-sm text-sm font-medium transition-opacity disabled:opacity-50 flex items-center"
                >
                  {addStaffMutation.isPending ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}