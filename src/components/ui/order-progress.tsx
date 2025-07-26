import { Card } from "@/components/ui/card";
import { ProgressStepper } from "@/components/ui/progress-stepper";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface OrderProgressProps {
  currentStep: number;
  className?: string;
}

// Define the standard order flow steps
const ORDER_STEPS: Step[] = [
  { id: 1, title: "Select", description: "Choose tests" },
  { id: 2, title: "Address", description: "Add address" },
  { id: 3, title: "Members", description: "Add members" },
  { id: 4, title: "Schedule", description: "Date & time" },
  { id: 5, title: "Payment", description: "Complete order" }
];

export const OrderProgress = ({ currentStep, className }: OrderProgressProps) => {
  return (
    <Card className={`p-4 ${className || ''}`}>
      <ProgressStepper steps={ORDER_STEPS} currentStep={currentStep} />
    </Card>
  );
};
