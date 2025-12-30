
import React, { useState } from 'react';

interface Props {
  onFileSelect: (file: File) => void;
  onUrlPaste: (url: string) => void;
}

const VideoUploader: React.FC<Props> = ({ onFileSelect, onUrlPaste }) => {
  const [url, setUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onUrlPaste(url.trim());
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative border-2 border-dashed border-slate-800 rounded-3xl p-8 bg-slate-900/20">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-indigo-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-sm font-bold mb-6">Upload 16:9 Video</h3>
          <label className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-transform">
            Select File
            <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-slate-800"></div>
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">OR</span>
        <div className="flex-1 h-px bg-slate-800"></div>
      </div>

      <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
        <input 
          type="url" 
          placeholder="Paste Video URL (YouTube...)" 
          className="w-full bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl text-xs outline-none focus:border-indigo-500"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" className="w-full bg-white text-black py-3 rounded-2xl text-xs font-bold active:scale-[0.98] transition-transform">
          Download & Repurpose
        </button>
      </form>
    </div>
  );
};

export default VideoUploader;
