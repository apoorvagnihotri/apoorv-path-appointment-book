import { Check, TestTube, Users, Calendar, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ProgressStepper = ({ steps, currentStep, className }: ProgressStepperProps) => {
  const getStepIcon = (stepId: number, isCompleted: boolean) => {
    if (isCompleted) return <Check className="h-4 w-4" />;
    
    switch (stepId) {
      case 1: return <TestTube className="h-4 w-4" />;
      case 2: return <Users className="h-4 w-4" />;
      case 3: return <Calendar className="h-4 w-4" />;
      case 4: return <CreditCard className="h-4 w-4" />;
      default: return stepId;
    }
  };
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <div key={step.id} className="flex-1 relative">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    {
                      "bg-primary text-primary-foreground": isCompleted,
                      "bg-primary text-primary-foreground ring-4 ring-primary/20": isCurrent,
                      "bg-muted text-muted-foreground": isUpcoming,
                    }
                  )}
                >
                  {getStepIcon(step.id, isCompleted)}
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px mx-2">
                    <div
                      className={cn(
                        "h-full transition-colors",
                        isCompleted || isCurrent ? "bg-primary" : "bg-muted"
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-xs font-medium",
                    (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    (isCompleted || isCurrent) ? "text-muted-foreground" : "text-muted-foreground/70"
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};