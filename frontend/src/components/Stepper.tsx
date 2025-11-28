import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
    currentStep: number;
    steps: string[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />

                {/* Active Progress Bar */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isCompleted = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;

                    return (
                        <div key={step} className="flex flex-col items-center bg-white px-2">
                            <div
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                                    ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' :
                                        isCurrent ? 'bg-white border-blue-600 text-blue-600' :
                                            'bg-white border-gray-300 text-gray-400'}
                                `}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
                            </div>
                            <span
                                className={`
                                    mt-2 text-sm font-medium transition-colors duration-300
                                    ${isCurrent ? 'text-blue-600' :
                                        isCompleted ? 'text-gray-900' : 'text-gray-400'}
                                `}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;
