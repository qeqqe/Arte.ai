import type { Metadata } from 'next';
import OnboardingForm from '../../components/onboarding/onboarding-form';

export const metadata: Metadata = {
  title: 'Onboarding | Welcome',
  description: 'Complete your profile setup to get started',
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50/30 to-rose-100/40 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden border border-rose-100 animate-fade-in">
        <div className="p-6 bg-gradient-to-r from-rose-100/70 to-rose-50/60 border-b border-rose-200">
          <h1 className="text-2xl font-bold text-rose-950 tracking-tight">
            Welcome aboard!
          </h1>
          <p className="text-rose-700">
            Let's get your account set up in just a few steps.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
