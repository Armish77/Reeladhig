
import React from 'react';
import { ProcessStatus } from '../types';

interface Props {
  status: ProcessStatus;
}

const ProcessingStatus: React.FC<Props> = ({ status }) => {
  const steps = [
    { key: ProcessStatus.FETCHING_METADATA, label: 'Scanning', icon: '🌐' },
    { key: ProcessStatus.PROCESSING, label: 'Downloading', icon: '📥' },
    { key: ProcessStatus.REFRAMING, label: 'Cropping', icon: '📐' },
    { key: ProcessStatus.GENERATING_CAPTIONS, label: 'Captions', icon: '✍️' },
  ];

  const getCurrentIndex = () => {
      const idx = steps.findIndex(s => s.key === status);
      return idx === -1 ? (status === ProcessStatus.ANALYZING ? 1 : 0) : idx;
  };
  const currentIndex = getCurrentIndex();

  return (
    <div className="flex flex-col gap-8 items-center py-4">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-indigo-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="text-2xl">
           {steps[currentIndex]?.icon || '✨'}
        </div>
      </div>
      
      <div className="w-full space-y-4">
        {steps.map((step, idx) => (
          <div key={step.key} className={`flex items-center gap-3 transition-all duration-500 ${idx > currentIndex ? 'opacity-20 scale-95' : 'opacity-100'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${
              idx < currentIndex ? 'bg-green-500 text-white' : idx === currentIndex ? 'bg-indigo-600 animate-pulse text-white' : 'bg-slate-800 text-slate-600'
            }`}>
              {idx < currentIndex ? '✓' : idx + 1}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <h4 className={`text-[10px] font-bold uppercase tracking-widest ${idx === currentIndex ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {step.label}
                </h4>
              </div>
              <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
                {idx === currentIndex && (
                  <div className="h-full bg-indigo-500 animate-[loading_1s_infinite] w-1/3"></div>
                )}
                {idx < currentIndex && <div className="h-full bg-green-500 w-full"></div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default ProcessingStatus;
