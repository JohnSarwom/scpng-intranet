import { WizardStep } from '../types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgressStepsProps {
  steps: WizardStep[];
  currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex mb-8 relative">
      <div className="absolute h-0.5 bg-gray-200 top-4 left-0 right-0 z-0"></div>
      {steps.map((step) => (
        <div key={step.id} className="flex-1 text-center relative z-10">
          <div 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors",
              currentStep === step.id ? "bg-primary text-white" : 
              currentStep > step.id ? "bg-green-500 text-white" : 
              "bg-gray-200 text-gray-400"
            )}
          >
            {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id + 1}
          </div>
          <div className={cn(
            "text-xs font-medium",
            currentStep === step.id ? "text-primary" : 
            currentStep > step.id ? "text-green-500" : 
            "text-gray-400"
          )}>
            {step.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps; 