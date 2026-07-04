import { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { useStaff, useAddStaff, useRemoveStaff } from './hooks/useStaff';
import { Trash2, UserPlus, Shield, User, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemberSchema } from '@sellwise/shared';
import type { CreateMemberDTO } from '@sellwise/shared';
import { Badge } from '../../components/ui/badge';

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
      <div className="bg-error-soft text-destructive p-4 rounded-lg border border-destructive/20 text-sm font-medium">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </button>
        )}
      </div>

      {!isOwner && !isLoading && (
        <div className="bg-error-soft text-destructive p-4 rounded-lg border border-destructive/20 text-sm font-medium">
          Only the store owner can manage staff members.
        </div>
      )}

      {error && (
        <div className="bg-error-soft text-destructive p-4 rounded-lg border border-destructive/20 text-sm font-medium">
           {((error as any).response?.data?.error?.message) || 'Failed to load staff members.'}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-vercel-2 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading staff members...</div>
        ) : staffMembers.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-base font-medium text-foreground">No staff found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas-soft/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">Joined</th>
                  <th className="px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffMembers.map((member: any) => (
                  <tr key={member.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {member.email} {member.id === currentUser?.id ? '(You)' : ''}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={member.role === 'owner' ? 'info' : 'success'}>
                        {member.role === 'owner' && <Shield className="h-3 w-3 mr-1" />}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {isOwner && member.id !== currentUser?.id && member.role !== 'owner' ? (
                        <button
                          onClick={() => handleRemove(member.id)}
                          disabled={removeStaffMutation.isPending}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/5 transition-colors disabled:opacity-50"
                          title="Revoke Access"
                        >
                          <Trash2 className="h-4 w-4" />
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
          <div className="bg-card w-full max-w-md rounded-xl shadow-vercel-5 border border-border flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-base font-medium">Invite Employee</h2>
              <button
                onClick={() => { setIsModalOpen(false); reset(); }}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground transition-all"
                  placeholder="employee@store.com"
                />
                {errors.email && <p className="text-destructive text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Temporary Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground transition-all"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-destructive text-xs mt-1.5">{errors.password.message}</p>}
                <p className="text-muted-foreground text-xs mt-1">They can change this later.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Preferred Language</label>
                <select
                  {...register('preferred_lang')}
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground transition-all appearance-none"
                >
                  <option value="en">English</option>
                  <option value="bn">Bangla</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); reset(); }}
                  className="px-4 py-2 border border-border bg-card hover:bg-muted rounded-full text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStaffMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
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
