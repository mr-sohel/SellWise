import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api/client';
import { CATEGORY_PRESETS } from '@sellwise/shared';
import type { CategoryPresetId } from '@sellwise/shared';
import { Check, ArrowRight } from 'lucide-react';

export function OnboardingPage() {
  const [selected, setSelected] = useState<CategoryPresetId[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateStore, activeStoreId, store } = useAuthStore();
  const navigate = useNavigate();

  const toggle = (id: CategoryPresetId) => {
    setError(null);
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (selected.length === 0) {
      setError('Please select at least one category.');
      return;
    }
    const storeId = activeStoreId || store?.id;
    if (!storeId) {
      setError('Store session not found. Please log in again.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await api.patch(`/stores/${storeId}/onboarding`, {
        categoryPresetIds: selected,
      });
      if (response.data.success) {
        const newBusinessType = response.data.data.business_type;
        updateStore({ business_type: newBusinessType });
        navigate('/dashboard');
      } else {
        setError('Onboarding failed. Please try again.');
      }
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-soft px-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display-xl text-foreground mb-2">Welcome to SellWise</h1>
          <p className="text-body">What do you sell? Pick your product categories to get started.</p>
        </div>

        {/* Category Grid */}
        <div className="bg-card border border-border rounded-xl shadow-vercel-4 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORY_PRESETS.map((preset) => {
              const isSelected = selected.includes(preset.id);
              return (
                <button
                  key={preset.id}
                  onClick={() => toggle(preset.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-foreground bg-canvas-soft'
                      : 'border-border hover:border-muted-foreground/30 hover:bg-canvas-soft/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                    isSelected ? 'bg-foreground text-primary-foreground' : 'bg-canvas-soft'
                  }`}>
                    {preset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">{preset.label.en}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {preset.categories.slice(0, 3).join(', ')}{preset.categories.length > 3 ? '...' : ''}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                    isSelected ? 'bg-foreground border-foreground' : 'border-border'
                  }`}>
                    {isSelected && <Check size={12} className="text-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview selected categories */}
          {selected.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <label className="block text-xs font-muted-foreground uppercase tracking-wide mb-2 font-medium">
                Categories that will be added
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_PRESETS
                  .filter(p => selected.includes(p.id))
                  .flatMap(p => p.categories)
                  .map(cat => (
                    <span key={cat} className="inline-flex items-center px-3 py-1.5 bg-canvas-soft border border-border rounded-full text-sm text-foreground">
                      {cat}
                    </span>
                  ))
                }
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleComplete}
              disabled={selected.length === 0 || isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full bg-foreground text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Setting up...' : 'Get Started'}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
