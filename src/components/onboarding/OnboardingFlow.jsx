// src/components/onboarding/OnboardingFlow.jsx
import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import ConsentScreen from './ConsentScreen';
import { AnimatePresence } from 'framer-motion';

const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="min-h-screen bg-neutral-100">
      <AnimatePresence mode="wait">
        {currentStep === 0 && <WelcomeScreen key="welcome" onNext={() => setCurrentStep(1)} />}
        {currentStep === 1 && <ConsentScreen key="consent" onComplete={onComplete} />}
      </AnimatePresence>
    </div>
  );
};
export default OnboardingFlow;
