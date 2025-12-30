
import React, { useState, useEffect, useRef } from 'react';
import { 
  ProcessStatus, 
  HighlightClip, 
  VideoMetadata,
  BackendProcessResponse
} from './types';
import { processUrl, processUpload, checkJobStatus } from './services/api';
import { fetchVideoContextFromUrl, analyzeVideoHighlights } from './services/geminiService';
import Header from './components/Header';
import VideoUploader from './components/VideoUploader';
import ReelPreview from './components/ReelPreview';
import ProcessingStatus from './components/ProcessingStatus';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [videoMeta, setVideoMeta] = useState<VideoMetadata | null>(null);
  const [clips, setClips] = useState<HighlightClip[]>([]);
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const [demoMode, setDemoMode] = useState(true); 
  const [showSettings, setShowSettings] = useState(false);
  const pollingInterval = useRef<number | null>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-15));

  const runDemoMode = async (meta: VideoMetadata) => {
    addLog("DEMO MODE ACTIVE (Simulated)");
    setStatus(ProcessStatus.ANALYZING);
    await new Promise(r => setTimeout(r, 1500));
    addLog("Gemini AI identifying high-impact segments...");
    
    try {
        const mockClips = await analyzeVideoHighlights(meta);
        // Map to a reliable video URL for the demo preview
        const demoClips = mockClips.map(c => ({
            ...c, 
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
        }));
        setClips(demoClips);
        
        setStatus(ProcessStatus.REFRAMING);
        await new Promise(r => setTimeout(r, 2000));
        addLog("Reframing to vertical 9:16...");
        
        setStatus(ProcessStatus.COMPLETED);
        addLog("Demo processing finished!");
    } catch (e) {
        addLog("AI Error: Falling back to sample data");
        setStatus(ProcessStatus.COMPLETED);
        setClips([{
            id: 'demo',
            title: 'Sample Viral Reel',
            startTime: 0,
            endTime: 10,
            engagementScore: 99,
            subjectPositionX: 50,
            captions: [{startTime: 0, endTime: 5, text: "AI REPURPOSING READY!", isHighlight: true}],
            description: "A placeholder clip for mobile testing.",
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
        }]);
    }
  };

  const startPolling = (jobId: string) => {
    setStatus(ProcessStatus.PROCESSING);
    pollingInterval.current = window.setInterval(async () => {
      try {
        const data: BackendProcessResponse = await checkJobStatus(backendUrl, jobId);
        if (data.status === 'completed') {
          if (pollingInterval.current) clearInterval(pollingInterval.current);
          setClips(data.clips || []);
          setStatus(ProcessStatus.COMPLETED);
          addLog("Processing complete!");
        } else {
          addLog(`Server: ${data.status}`);
        }
      } catch (err) {
        // Handle intermittent server disconnection silently
      }
    }, 2000);
  };

  const handleUrlPaste = async (url: string) => {
    setStatus(ProcessStatus.FETCHING_METADATA);
    setLogs([]);
    addLog(`AI Scanning: ${url}`);
    
    try {
      const context = await fetchVideoContextFromUrl(url);
      const meta: VideoMetadata = {
        id: 'vid_' + Date.now(),
        name: context.name || 'Cloud Video',
        duration: context.duration || 60,
        width: 1920,
        height: 1080,
        originalUrl: url,
        description: context.description
      };
      setVideoMeta(meta);

      if (demoMode) {
        runDemoMode(meta);
      } else {
        const data = await processUrl(backendUrl, url);
        startPolling(data.jobId);
      }
    } catch (err) {
      addLog("Remote Connection Failed. Reverting to Demo...");
      setDemoMode(true);
      const meta: VideoMetadata = { id: 'demo', name: "Sample Clip", duration: 60, width: 1920, height: 1080, originalUrl: url };
      setVideoMeta(meta);
      runDemoMode(meta);
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg text-slate-100 overflow-x-hidden font-sans">
      <Header />
      
      {/* Mobile-Friendly Fixed Settings Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 rounded-full shadow-2xl active:scale-90 transition-transform border-4 border-slate-900"
        aria-label="Settings"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
      </button>

      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[100] flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-bold mb-6">Device Configuration</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Processing Method</label>
                    <button 
                      onClick={() => setDemoMode(!demoMode)}
                      className={`w-full py-3 rounded-2xl font-bold transition-all border ${demoMode ? 'bg-amber-600 border-amber-400' : 'bg-green-600 border-green-400'}`}
                    >
                      {demoMode ? 'DEMO MODE (Simulated)' : 'REMOTE SERVER (Connected)'}
                    </button>
                    <p className="text-[9px] text-slate-500 mt-2 uppercase font-black">Use Demo Mode if you don't have a laptop server running.</p>
                  </div>

                  {!demoMode && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Backend URL</label>
                      <input 
                          type="text" 
                          value={backendUrl} 
                          onChange={(e) => setBackendUrl(e.target.value)}
                          placeholder="http://192.168.1.5:8000"
                          className="w-full bg-slate-800 border border-slate-700 px-5 py-3 rounded-2xl text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>

                <button onClick={() => setShowSettings(false)} className="w-full mt-8 py-4 bg-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest">
                  Save & Return
                </button>
            </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-8 max-w-lg">
        {status === ProcessStatus.IDLE || status === ProcessStatus.FAILED ? (
          <div className="w-full text-center space-y-6">
            <div className="inline-block p-4 bg-indigo-600/10 rounded-3xl mb-4 border border-indigo-500/20">
               <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-none bangers uppercase">
              URL TO <span className="text-indigo-400">REELS</span><br/>
              <span className="text-pink-500">REPURPOSER</span>
            </h1>
            
            <VideoUploader onFileSelect={() => {}} onUrlPaste={handleUrlPaste} />

            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-left">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">How it works</p>
              <ul className="text-[11px] text-slate-400 space-y-3">
                <li className="flex gap-3"><span className="text-indigo-500 font-bold">1.</span> Paste a URL. Gemini AI scans it for high-impact moments.</li>
                <li className="flex gap-3"><span className="text-indigo-500 font-bold">2.</span> The server reframes the 16:9 video to a vertical 9:16 layout.</li>
                <li className="flex gap-3"><span className="text-indigo-500 font-bold">3.</span> Export and share to TikTok, IG Reels, or YouTube Shorts.</li>
              </ul>
            </div>
          </div>
        ) : status !== ProcessStatus.COMPLETED ? (
          <div className="w-full space-y-8 animate-in fade-in duration-500">
            {videoMeta && (
              <div className="text-center">
                <h2 className="text-xl font-black bangers text-indigo-400 uppercase tracking-wide">{videoMeta.name}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Powered by Gemini AI</p>
              </div>
            )}
            
            <ProcessingStatus status={status} />
            
            <div className="bg-black/60 border border-slate-800 rounded-3xl p-5 font-mono text-[10px] text-indigo-400 shadow-2xl">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                 <span className="text-slate-500 font-black uppercase tracking-widest text-[8px]">Live Processing Log</span>
              </div>
              <div className="space-y-1 h-32 overflow-y-auto custom-scrollbar">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-10 duration-700">
             <ReelPreview 
                videoMeta={videoMeta!}
                activeClip={clips[activeClipIndex]}
              />
              
              <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Viral AI Segments</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {clips.map((clip, idx) => (
                        <button
                            key={clip.id}
                            onClick={() => setActiveClipIndex(idx)}
                            className={`flex-shrink-0 w-32 h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-3 text-center ${
                                activeClipIndex === idx ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 border-slate-700'
                            }`}
                        >
                            <span className="text-[14px] font-black bangers leading-none mb-1">CLIP {idx+1}</span>
                            <span className="text-[8px] font-bold opacity-60 uppercase">{clip.engagementScore}% IMPACT</span>
                        </button>
                    ))}
                </div>
              </div>

              <button 
                onClick={() => setStatus(ProcessStatus.IDLE)}
                className="w-full py-5 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors"
              >
                ← New Project
              </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
