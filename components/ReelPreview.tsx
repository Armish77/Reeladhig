
import React, { useRef, useState, useEffect } from 'react';
import { HighlightClip, VideoMetadata } from '../types';

interface Props {
  videoMeta: VideoMetadata;
  activeClip: HighlightClip;
}

const ReelPreview: React.FC<Props> = ({ videoMeta, activeClip }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = activeClip.videoUrl;
      videoRef.current.load();
      setIsPlaying(false);
    }
  }, [activeClip]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const currentCaption = activeClip.captions.find(
    c => currentTime >= c.startTime && currentTime <= c.endTime
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      <div className="flex-shrink-0 mx-auto w-full max-w-[320px] aspect-[9/16] relative bg-black rounded-[2.5rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {currentCaption && (
          <div className="absolute inset-x-0 bottom-32 flex items-center justify-center pointer-events-none px-6 z-10">
            <div className="text-center drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
              <span className={`bangers text-3xl leading-tight transition-all duration-300 ${currentCaption.isHighlight ? 'text-yellow-400 scale-110' : 'text-white'}`}>
                {currentCaption.text}
              </span>
            </div>
          </div>
        )}

        <button 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center group z-0"
        >
          {!isPlaying && (
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
               <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                 <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
               </svg>
            </div>
          )}
        </button>
      </div>

      <div className="flex-1 bg-slate-900/40 p-8 rounded-3xl border border-slate-800 self-start">
        <h2 className="text-2xl font-bold mb-4">{activeClip.title}</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          {activeClip.description}
        </p>
        <a 
          href={activeClip.videoUrl} 
          download 
          className="inline-flex items-center gap-2 bg-indigo-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2} />
          </svg>
          Download Processed Reel
        </a>
      </div>
    </div>
  );
};

export default ReelPreview;
