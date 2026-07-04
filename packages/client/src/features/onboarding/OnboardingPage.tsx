import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api/client';
import {
  BUSINESS_TYPES,
  BUSINESS_TYPE_LABELS,
  SALES_CHANNELS,
  SALES_CHANNEL_LABELS,
  DEFAULT_CATEGORIES_BY_TYPE,
} from '@sellwise/shared';
import type { BusinessType, SalesChannel } from '@sellwise/shared';
import { Store, MessageCircle, Phone, Globe, MoreHorizontal, Check, ChevronRight, ChevronLeft } from 'lucide-react';

const BUSINESS_TYPE_ICONS: Record<BusinessType, typeof Store> = {
  facebook_seller: MessageCircle,
  small_shop: Store,
  online_store: Globe,
  wholesaler: MoreHorizontal,
};

const SALES_CHANNEL_ICONS: Record<SalesChannel, typeof Store> = {
  facebook: MessageCircle,
  whatsapp: Phone,
  walk_in: Store,
  website: Globe,
  other: MoreHorizontal,
};

const STEPS = ['Business Type', 'Sales Channels', 'Review'];

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [salesChannels, setSalesChannels] = useState<SalesChannel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateStore, activeStoreId } = useAuthStore();
  const suggestedCategories = businessType ? DEFAULT_CATEGORIES_BY_TYPE[businessType] : [];
  const navigate = useNavigate();

  const toggleChannel = (ch: SalesChannel) => {
    setSalesChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const handleComplete = async () => {
    if (!businessType || salesChannels.length === 0 || !activeStoreId) return;
    setIsSubmitting(true);
    try {
      const response = await api.patch(`/stores/${activeStoreId}/onboarding`, {
        business_type: businessType,
        sales_channels: salesChannels,
      });
      if (response.data.success) {
        updateStore({ business_type: businessType, sales_channels: salesChannels });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Onboarding failed', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-soft px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display-xl text-foreground mb-2">Welcome to SellWise</h1>
          <p className="text-body">Let's set up your store. This helps us customize your experience.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i < step ? 'bg-foreground text-primary-foreground' :
                i === step ? 'bg-foreground text-primary-foreground' :
                'bg-canvas-soft text-muted-foreground border border-border'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${i < step ? 'bg-foreground' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-xl shadow-vercel-4 p-8">
          {/* Step 1: Business Type */}
          {step === 0 && (
            <div>
              <h2 className="font-display-md text-foreground mb-1">What kind of business do you run?</h2>
              <p className="text-sm text-body mb-6">This helps us set up the right categories and insights for you.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_TYPES.map((type) => {
                  const Icon = BUSINESS_TYPE_ICONS[type];
                  const isSelected = businessType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setBusinessType(type)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-foreground bg-canvas-soft'
                          : 'border-border hover:border-muted-foreground/30 hover:bg-canvas-soft/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-foreground text-primary-foreground' : 'bg-canvas-soft text-body'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{BUSINESS_TYPE_LABELS[type].en}</div>
                        <div className="text-xs text-muted-foreground">{BUSINESS_TYPE_LABELS[type].bn}</div>
                      </div>
                      {isSelected && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                          <Check size={12} className="text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Sales Channels */}
          {step === 1 && (
            <div>
              <h2 className="font-display-md text-foreground mb-1">How do you take orders?</h2>
              <p className="text-sm text-body mb-6">Select all that apply. This helps with order tracking.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SALES_CHANNELS.map((channel) => {
                  const Icon = SALES_CHANNEL_ICONS[channel];
                  const isSelected = salesChannels.includes(channel);
                  return (
                    <button
                      key={channel}
                      onClick={() => toggleChannel(channel)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-foreground bg-canvas-soft'
                          : 'border-border hover:border-muted-foreground/30 hover:bg-canvas-soft/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-foreground text-primary-foreground' : 'bg-canvas-soft text-body'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm">{SALES_CHANNEL_LABELS[channel].en}</div>
                        <div className="text-xs text-muted-foreground">{SALES_CHANNEL_LABELS[channel].bn}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-foreground border-foreground' : 'border-border'
                      }`}>
                        {isSelected && <Check size={12} className="text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {salesChannels.length === 0 && (
                <p className="text-xs text-muted-foreground mt-3">Select at least one sales channel to continue.</p>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 2 && (
            <div>
              <h2 className="font-display-md text-foreground mb-1">Review your setup</h2>
              <p className="text-sm text-body mb-6">We'll pre-configure your store based on these choices. You can change them later.</p>

              {/* Business Type Summary */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Business Type</label>
                <div className="flex items-center gap-3 p-3 bg-canvas-soft rounded-lg border border-border">
                  {businessType && BUSINESS_TYPE_ICONS[businessType] && (() => {
                    const Icon = BUSINESS_TYPE_ICONS[businessType];
                    return <Icon size={18} className="text-body" />;
                  })()}
                  <span className="font-medium text-foreground">
                    {businessType ? BUSINESS_TYPE_LABELS[businessType].en : ''}
                  </span>
                </div>
              </div>

              {/* Sales Channels Summary */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Sales Channels</label>
                <div className="flex flex-wrap gap-2">
                  {salesChannels.map(ch => (
                    <span key={ch} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-canvas-soft border border-border rounded-full text-sm text-foreground">
                      {SALES_CHANNEL_LABELS[ch].en}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested Categories */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Default Categories</label>
                <div className="flex flex-wrap gap-2">
                  {suggestedCategories.map(cat => (
                    <span key={cat} className="inline-flex items-center px-3 py-1.5 bg-canvas-soft border border-border rounded-full text-sm text-foreground">
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">These will be added to your store. You can add more later.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-body hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={(step === 0 && !businessType) || (step === 1 && salesChannels.length === 0)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full bg-foreground text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full bg-foreground text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                <Check size={16} />
              </button>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
