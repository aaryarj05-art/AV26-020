import React, { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StrokeGuard() {
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [speechText, setSpeechText] = useState("");
  
  const [facialResult, setFacialResult] = useState<any>(null);
  const [speechResult, setSpeechResult] = useState<any>(null);
  const [finalReport, setFinalReport] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Webcam Logic
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsWebcamActive(true);
      }
    } catch (err) {
      console.error("Webcam access denied", err);
      alert("Could not access webcam. Please upload an image instead.");
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "webcam_capture.jpg", { type: "image/jpeg" });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
          stopWebcam();
        }
      }, 'image/jpeg');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
      stopWebcam();
    }
  };

  const analyzeFace = async () => {
    if (!imageFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", imageFile);
    
    try {
      const res = await fetch("http://localhost:8000/api/personal/stroke-guard/facial", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setFacialResult(data);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze facial asymmetry.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeSpeech = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/personal/stroke-guard/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speechText })
      });
      const data = await res.json();
      setSpeechResult(data);
      setStep(3);
      generateFinalReport();
    } catch (err) {
      console.error(err);
      alert("Failed to analyze speech.");
      setLoading(false);
    }
  };

  const generateFinalReport = async () => {
    try {
      const formData = new FormData();
      formData.append("health_data", JSON.stringify({ bp_systolic: 145 }));
      formData.append("stroke_model_risk", "0.45");
      if (imageFile) formData.append("image", imageFile);
      if (speechText) formData.append("speech_text", speechText);

      const res = await fetch("http://localhost:8000/api/personal/stroke-guard/full", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setFinalReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => stopWebcam();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-helix-text flex items-center gap-3">
          Stroke Guard™ <span className="text-helix-accent">Neural Engine</span>
          <div className="px-3 py-1 rounded-full bg-helix-danger/10 border border-helix-danger/20">
             <span className="text-[10px] text-helix-danger font-bold uppercase tracking-widest">Experimental</span>
          </div>
        </h1>
        <p className="text-helix-text-muted text-sm mt-2">Multimodal real-time diagnostic synthesis (Computer Vision + NLP + ML)</p>
      </div>

      {/* Progress Wizard */}
      <div className="flex gap-4 mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className={`flex-1 h-2 rounded-full ${step >= num ? 'bg-helix-accent shadow-[0_0_8px_#00D4FF]' : 'bg-helix-bg border border-helix-border'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-helix-text">Step 1: Facial Symmetry Check</h2>
                <p className="text-sm text-helix-text-muted mt-1">Look directly at the camera or upload a clear frontal face image.</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-helix-accent/10 flex items-center justify-center border border-helix-accent/20">
                <span className="text-xl">👁️</span>
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-helix-bg border border-helix-border rounded-2xl overflow-hidden relative min-h-[300px] flex items-center justify-center">
              {!isWebcamActive && !imagePreview && (
                <div className="text-center p-6">
                   <p className="text-sm text-helix-text-muted mb-4">No image selected</p>
                   <button 
                     onClick={startWebcam}
                     className="px-6 py-2 bg-helix-accent/10 text-helix-accent font-bold rounded-xl border border-helix-accent/30 hover:bg-helix-accent/20 transition-colors"
                   >
                     Start Webcam
                   </button>
                   <div className="mt-4">
                     <label className="text-xs text-helix-text-muted underline cursor-pointer hover:text-helix-text transition-colors">
                       or upload an image
                       <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                     </label>
                   </div>
                </div>
              )}
              
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className={`absolute inset-0 w-full h-full object-cover ${!isWebcamActive ? 'hidden' : ''}`} 
              />
              
              {imagePreview && !isWebcamActive && (
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>
            
            <div className="w-full md:w-64 space-y-4">
               {isWebcamActive && (
                 <button 
                   onClick={captureImage}
                   className="w-full py-4 bg-helix-accent text-helix-bg font-black rounded-2xl hover:brightness-110 transition-all shadow-[0_0_15px_#00D4FF]"
                 >
                   📸 Capture Frame
                 </button>
               )}
               {imageFile && (
                 <>
                   <button 
                     onClick={analyzeFace}
                     disabled={loading}
                     className={`w-full py-4 bg-helix-success text-helix-bg font-black rounded-2xl transition-all shadow-[0_0_15px_#10B981] ${loading ? 'opacity-50' : 'hover:brightness-110'}`}
                   >
                     {loading ? 'Analyzing Mesh...' : 'Analyze Face'}
                   </button>
                   <button 
                     onClick={() => { setImageFile(null); setImagePreview(null); }}
                     className="w-full py-3 bg-helix-bg text-helix-text-muted font-bold rounded-xl border border-helix-border hover:bg-helix-surface-light transition-colors"
                   >
                     Retake
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-helix-text">Step 2: Speech Fluency Check</h2>
                <p className="text-sm text-helix-text-muted mt-1">Please type the following phrase exactly as you would speak it:</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-helix-warning/10 flex items-center justify-center border border-helix-warning/20">
                <span className="text-xl">🗣️</span>
             </div>
          </div>
          
          <div className="p-4 bg-helix-bg border border-helix-border rounded-xl text-center">
            <p className="text-lg font-bold text-helix-text italic">"The quick brown fox jumps over the lazy dog."</p>
          </div>

          <textarea
            value={speechText}
            onChange={(e) => setSpeechText(e.target.value)}
            placeholder="Type your response here... (e.g., if you stutter, type 'the um quick brown fox...')"
            className="w-full h-32 bg-helix-bg border border-helix-border rounded-2xl p-4 text-helix-text outline-none focus:border-helix-accent transition-colors"
          />

          <div className="flex justify-between items-center pt-4">
             <button 
               onClick={() => setStep(1)}
               className="px-6 py-2 bg-helix-bg text-helix-text font-bold rounded-xl border border-helix-border hover:bg-helix-surface-light transition-colors"
             >
               Back
             </button>
             <button 
               onClick={analyzeSpeech}
               disabled={!speechText || loading}
               className={`px-8 py-3 bg-helix-accent text-helix-bg font-black rounded-xl transition-all ${(!speechText || loading) ? 'opacity-50' : 'hover:brightness-110 shadow-[0_0_15px_#00D4FF]'}`}
             >
               {loading ? 'Synthesizing...' : 'Analyze Speech'}
             </button>
          </div>
        </div>
      )}

      {step === 3 && finalReport && (
        <div className="space-y-8 animate-fade-in">
          {finalReport.risk_level === 'Critical' && (
            <div className="bg-helix-danger/20 border-2 border-helix-danger rounded-3xl p-8 text-center shadow-[0_0_30px_#EF4444] animate-pulse">
              <h2 className="text-3xl font-black text-helix-danger mb-4">CRITICAL RISK DETECTED</h2>
              <p className="text-helix-text text-lg mb-6">{finalReport.recommendation}</p>
              <button className="px-12 py-4 bg-helix-danger text-white font-black text-2xl rounded-2xl hover:bg-red-600 transition-colors">
                CALL 112 IMMEDIATELY
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="bg-helix-surface border border-helix-border rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 ${finalReport.risk_level === 'Low' ? 'bg-helix-success' : finalReport.risk_level === 'Moderate' ? 'bg-helix-warning' : 'bg-helix-danger'}`} />
                <h3 className="text-sm font-bold text-helix-text-muted uppercase tracking-widest mb-2">Neural Risk Synthesis</h3>
                <div className="text-6xl font-black text-helix-text my-4">
                  {(finalReport.neurological_risk_score * 100).toFixed(1)}<span className="text-2xl">%</span>
                </div>
                <div className={`px-4 py-1 rounded-full border text-sm font-bold uppercase tracking-widest ${finalReport.risk_level === 'Low' ? 'bg-helix-success/10 border-helix-success text-helix-success' : finalReport.risk_level === 'Moderate' ? 'bg-helix-warning/10 border-helix-warning text-helix-warning' : 'bg-helix-danger/10 border-helix-danger text-helix-danger'}`}>
                  {finalReport.risk_level} Risk
                </div>
             </div>
             
             <div className="lg:col-span-2 bg-helix-surface border border-helix-border rounded-3xl p-8">
                <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest mb-6">Component Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-helix-bg border border-helix-border rounded-2xl">
                      <p className="text-[10px] text-helix-text-muted uppercase tracking-widest mb-1">Facial Symmetry (CV)</p>
                      <p className="text-lg font-bold text-helix-text">{finalReport.indicators.facial_symmetry}</p>
                   </div>
                   <div className="p-4 bg-helix-bg border border-helix-border rounded-2xl">
                      <p className="text-[10px] text-helix-text-muted uppercase tracking-widest mb-1">Speech Fluency (NLP)</p>
                      <p className="text-lg font-bold text-helix-text">{finalReport.indicators.speech_coherence}</p>
                   </div>
                   <div className="p-4 bg-helix-bg border border-helix-border rounded-2xl">
                      <p className="text-[10px] text-helix-text-muted uppercase tracking-widest mb-1">Vitals (BP/Telemetry)</p>
                      <p className="text-lg font-bold text-helix-text">{finalReport.indicators.blood_pressure_status}</p>
                   </div>
                   <div className="p-4 bg-helix-bg border border-helix-border rounded-2xl">
                      <p className="text-[10px] text-helix-text-muted uppercase tracking-widest mb-1">Historical ML Baseline</p>
                      <p className="text-lg font-bold text-helix-text">{finalReport.indicators.ml_baseline_risk}</p>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-8">
             <h3 className="text-sm font-bold text-helix-text uppercase tracking-widest mb-6">FAST Checklist Alignment</h3>
             <div className="flex flex-col md:flex-row gap-4">
                {['Face (F of FAST)', 'Arms (A of FAST)', 'Speech (S of FAST)', 'Time (T of FAST)'].map((flag, i) => {
                  const isActive = finalReport.fast_flags.includes(flag);
                  return (
                    <div key={i} className={`flex-1 p-4 rounded-2xl border ${isActive ? 'bg-helix-danger/10 border-helix-danger/30 text-helix-danger' : 'bg-helix-bg border-helix-border text-helix-text-muted'}`}>
                       <p className="text-xs font-bold uppercase tracking-widest mb-2">{flag.split(' ')[0]}</p>
                       <p className="text-sm font-medium">{isActive ? 'Anomaly Detected' : 'Normal / Unchecked'}</p>
                    </div>
                  );
                })}
             </div>
             
             <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => { setStep(1); setImageFile(null); setImagePreview(null); setSpeechText(""); }}
                  className="px-6 py-2 bg-helix-bg text-helix-text font-bold rounded-xl border border-helix-border hover:bg-helix-surface-light transition-colors"
                >
                  Run New Assessment
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
