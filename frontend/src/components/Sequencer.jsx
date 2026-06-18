import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as Tone from "tone";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

const TRACKS = ["kick", "snare", "hat", "bass", "synth", "pad"];

const EMPTY_STEPS = {
  kick: Array(16).fill(false),
  snare: Array(16).fill(false),
  hat: Array(16).fill(false),
  bass: Array(16).fill(false),
  synth: Array(16).fill(false),
  pad: Array(16).fill(false),
};

const TrackIcon = ({ track }) => {
  switch (track) {
    case "kick":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-violet-500"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3"></circle></svg>;
    case "snare":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-500"><path d="M4 14l8-8m-4 8l8-8"></path><circle cx="12" cy="12" r="9"></circle></svg>;
    case "hat":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-cyan-500"><path d="M2 12h20M12 2l-8 10h16z"></path></svg>;
    case "bass":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-fuchsia-500"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;
    case "synth":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M6 8v8M10 8v8M14 8v8M18 8v8"></path></svg>;
    case "pad":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-rose-500"><path d="M2 12h4l3-9 5 18 3-9h5"></path></svg>;
    default:
      return null;
  }
};

export default function Sequencer({ roomId }) {
  const { token, isAuthenticated } = useAuth();
  const isCollab = !!roomId;

  const [steps, setSteps] = useState(EMPTY_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  
  // Collab state
  const [userCount, setUserCount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Recording & Upload state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [form, setForm] = useState({ title: "", genre: "", rate: "", description: "", isForBidding: true });
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ error: "", success: "" });

  // Refs
  const inst = useRef({});
  const sequence = useRef();
  const recorder = useRef();
  const stepsRef = useRef(steps);
  const blob = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => { stepsRef.current = steps; }, [steps]);

  // Socket connection (only in collab mode)
  useEffect(() => {
    if (!isCollab) return;

    const socket = io("https://tune-talent.onrender.com");
    socketRef.current = socket;

    socket.emit("join-room", roomId);

    socket.on("room-state", async (state) => {
      setSteps({ ...EMPTY_STEPS, ...state.steps });
      setBpm(state.bpm);
      if (state.playing) {
        try { await Tone.start(); } catch (e) { console.warn("Tone blocked"); }
        Tone.Transport.start();
        setPlaying(true);
      }
    });

    socket.on("step-update", (newSteps) => {
      setSteps({ ...EMPTY_STEPS, ...newSteps });
    });

    socket.on("bpm-update", (newBpm) => {
      setBpm(newBpm);
    });

    socket.on("play-toggle", async (isPlaying) => {
      try { await Tone.start(); } catch (e) { console.warn("Tone blocked"); }
      if (isPlaying) {
        Tone.Transport.start();
        setPlaying(true);
      } else {
        Tone.Transport.stop();
        setCurrentStep(0);
        setPlaying(false);
      }
    });

    socket.on("user-count", (count) => {
      setUserCount(count);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, isCollab]);

  // One-time setup
  useEffect(() => {
    inst.current = {
      kick: new Tone.MembraneSynth().toDestination(),
      snare: new Tone.NoiseSynth({ noise: { type: "white" } }).toDestination(),
      hat: new Tone.MetalSynth().toDestination(),
      bass: new Tone.FMSynth({
        harmonicity: 0.5,
        modulationIndex: 1.2,
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 1 },
      }).toDestination(),
      synth: new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
      }).toDestination(),
      pad: new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.5, decay: 0.1, sustain: 0.8, release: 2 }
      }).toDestination(),
    };

    recorder.current = new Tone.Recorder();
    Tone.getDestination().connect(recorder.current);

    sequence.current = new Tone.Sequence(
      (time, step) => {
        setCurrentStep(step);
        const s = stepsRef.current;
        if (s.kick[step]) inst.current.kick.triggerAttackRelease("C1", "8n", time);
        if (s.snare[step]) inst.current.snare.triggerAttackRelease("16n", time);
        if (s.hat[step]) inst.current.hat.triggerAttackRelease("16n", time);
        if (s.bass[step]) inst.current.bass.triggerAttackRelease("E1", "16n", time);
        if (s.synth[step]) inst.current.synth.triggerAttackRelease(["C3", "E3", "G3"], "16n", time);
        if (s.pad[step]) inst.current.pad.triggerAttackRelease(["C4", "E4", "G4", "B4"], "4n", time);
      },
      [...Array(16).keys()],
      "16n"
    );
    sequence.current.start(0);

    return () => {
      sequence.current?.dispose();
      Object.values(inst.current).forEach(i => i?.dispose());
      recorder.current?.dispose();
      Tone.Transport.stop();
    };
  }, []);

  useEffect(() => { Tone.Transport.bpm.value = bpm; }, [bpm]);

  // --- Handlers ---

  const toggleStep = (track, index) => {
    const newSteps = {
      ...steps,
      [track]: steps[track].map((v, i) => i === index ? !v : v),
    };
    setSteps(newSteps);
    if (isCollab) socketRef.current?.emit("step-update", newSteps);
  };

  const handleBpmChange = (newBpm) => {
    setBpm(newBpm);
    if (isCollab) socketRef.current?.emit("bpm-update", newBpm);
  };

  const clearAll = () => {
    setSteps(EMPTY_STEPS);
    if (isCollab) socketRef.current?.emit("step-update", EMPTY_STEPS);
  };

  const togglePlay = async () => {
    await Tone.start();
    let newPlayingState = false;
    if (playing) {
      Tone.Transport.stop();
      setCurrentStep(0);
      newPlayingState = false;
    } else {
      Tone.Transport.start();
      newPlayingState = true;
    }
    setPlaying(newPlayingState);
    if (isCollab) socketRef.current?.emit("play-toggle", newPlayingState);
  };

  const handleRecordToggle = async () => {
    await Tone.start();

    if (isRecording) {
      Tone.Transport.stop();
      setPlaying(false);
      if (isCollab) socketRef.current?.emit("play-toggle", false);
      setIsRecording(false);
      try {
        const recorded = await recorder.current.stop();
        blob.current = recorded;
        setAudioUrl(URL.createObjectURL(recorded));
      } catch {
        setMsg({ error: "Failed to capture recording.", success: "" });
      }
    } else {
      blob.current = null;
      setAudioUrl("");
      setMsg({ error: "", success: "" });
      Tone.Transport.stop();
      setCurrentStep(0);
      recorder.current.start();
      Tone.Transport.start();
      setPlaying(true);
      if (isCollab) socketRef.current?.emit("play-toggle", true);
      setIsRecording(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const discardRecording = () => {
    blob.current = null;
    setAudioUrl("");
    setMsg({ error: "", success: "" });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!blob.current || !form.title || !form.genre || (form.isForBidding && !form.rate)) {
      setMsg({ error: "Please fill in all required fields.", success: "" });
      return;
    }

    setUploading(true);
    setMsg({ error: "", success: "" });

    const body = new FormData();
    body.append("file", blob.current, "composition.webm");
    
    // Append form data
    body.append("title", form.title);
    body.append("genre", form.genre);
    body.append("description", form.description);
    body.append("isForBidding", form.isForBidding);
    body.append("rate", form.isForBidding ? form.rate : 0);

    try {
      const res = await fetch("https://tune-talent.onrender.com/music/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (res.ok && data.note) {
        setMsg({ error: "", success: "Composition uploaded successfully to Cloudinary!" });
        setForm({ title: "", genre: "", rate: "", description: "", isForBidding: true });
        blob.current = null;
        setAudioUrl("");
      } else {
        setMsg({ error: data.message || "Failed to upload.", success: "" });
      }
    } catch {
      setMsg({ error: "Upload failed. Please try again.", success: "" });
    } finally {
      setUploading(false);
    }
  };

  const handleInteraction = async () => {
    if (Tone.context.state !== "running") {
      try {
        await Tone.start();
      } catch (e) {
        console.warn("Tone start blocked:", e);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" onClick={handleInteraction}>

      {/* Room Info Bar (Collab Only) */}
      {isCollab && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600">Room:</span>
            <code className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-sm font-mono">{roomId}</code>
            <button
              onClick={copyLink}
              className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-text-primary rounded cursor-pointer transition"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-semibold text-slate-700">{userCount} {userCount === 1 ? "user" : "users"} online</span>
          </div>
        </div>
      )}

      {/* Quick Explainer */}
      <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-2xl flex items-start gap-4 animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-violet-400 mb-1">How to use the Studio</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Click the grid to place notes. Use <strong className="text-text-primary">Kick, Snare & Hat</strong> for rhythm, <strong className="text-text-primary">Bass</strong> for the low-end foundation, and <strong className="text-text-primary">Synth & Pad</strong> for melodies and atmosphere. Hit <strong className="text-text-primary">Play</strong> to hear your loop, and <strong className="text-text-primary">Record</strong> when you're ready to share!
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap bg-surface-elevated border border-border-subtle p-4 rounded-2xl shadow-sm">
        <button onClick={togglePlay} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold cursor-pointer shadow-lg shadow-violet-500/15 transition-all duration-200">
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={clearAll} className="px-6 py-2.5 bg-surface-card hover:bg-surface-hover border border-border-subtle text-text-primary rounded-xl font-semibold cursor-pointer transition-all duration-200">
          Clear
        </button>
        <button
          onClick={handleRecordToggle}
          className={`px-6 py-2.5 rounded-xl text-white font-bold cursor-pointer transition-all duration-200 shadow-lg ${isRecording ? "bg-red-600 animate-pulse shadow-red-600/30" : "bg-red-500 hover:bg-red-600 shadow-red-500/15"}`}
        >
          {isRecording ? "Stop Recording" : "● Record"}
        </button>

        <div className="flex items-center gap-2">
          <span>BPM</span>
          <input type="range" min="60" max="180" value={bpm} onChange={e => handleBpmChange(Number(e.target.value))} />
          <span>{bpm}</span>
        </div>
      </div>

      {/* Step Grid */}
      <div className="space-y-3 bg-surface-elevated border border-border-subtle p-6 rounded-2xl shadow-sm">
        {TRACKS.map(track => (
          <div key={track} className="flex items-center gap-3">
            <div className="w-24 flex items-center justify-between text-sm font-bold text-text-secondary uppercase tracking-wide">
              {track} <TrackIcon track={track} />
            </div>
            <div className="grid grid-cols-16 gap-1.5 flex-1">
              {(steps[track] || Array(16).fill(false)).map((active, index) => (
                <button
                  key={index}
                  onClick={() => toggleStep(track, index)}
                  className={`h-12 rounded-lg border transition-all cursor-pointer ${
                    active 
                      ? "bg-violet-500 border-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]" 
                      : "bg-surface-card border-border-subtle hover:border-violet-500/50"
                  } ${currentStep === index ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-surface-elevated scale-105 z-10" : ""}`}
                  aria-label={`Toggle ${track} step ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recording Preview & Actions */}
      {audioUrl && (
        <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-slate-800">
                {isCollab ? "Session Recording" : "Recording Preview"}
              </h4>
              <p className="text-sm text-slate-500">
                {isCollab ? "Listen or download your collaborative jam session." : "Listen to your recorded pattern before uploading."}
              </p>
            </div>
            {/* Solo mode prevents download, collab mode allows download */}
            <audio 
              src={audioUrl} 
              controls 
              controlsList={isCollab ? undefined : "nodownload"}
              onContextMenu={isCollab ? undefined : (e) => e.preventDefault()}
              className="w-full md:w-auto rounded-lg" 
            />
          </div>

          {isCollab ? (
            <div className="flex items-center gap-3">
              <a
                href={audioUrl}
                download="collab-session.webm"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-text-primary rounded font-semibold text-sm cursor-pointer transition"
              >
                ↓ Download Recording
              </a>
              <button onClick={discardRecording} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-sm font-semibold cursor-pointer transition">
                Discard
              </button>
            </div>
          ) : (
            <>
              {!isAuthenticated ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm">Authentication Required</p>
                    <p className="text-xs text-amber-700">You must be logged in to upload and share your compositions on TuneTalent.</p>
                  </div>
                  <Link to="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-text-primary rounded text-sm font-semibold whitespace-nowrap">
                    Log In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-4 border-t border-slate-200 pt-6">
                  <h4 className="text-md font-bold text-slate-800">Publish to TuneTalent</h4>
                  
                  {/* Bidding Toggle */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="isForBidding"
                      checked={form.isForBidding}
                      onChange={(e) => setForm(prev => ({ 
                        ...prev, 
                        isForBidding: e.target.checked,
                        rate: e.target.checked ? prev.rate : "" 
                      }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="isForBidding" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                      Enable bidding for this composition (Put up for sale)
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">Composition Title *</label>
                      <input 
                        type="text" 
                        required 
                        value={form.title} 
                        onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} 
                        placeholder="e.g. Synth Jam" 
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">Genre *</label>
                      <input 
                        type="text" 
                        required 
                        value={form.genre} 
                        onChange={e => setForm(prev => ({ ...prev, genre: e.target.value }))} 
                        placeholder="e.g. Electronic" 
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    {form.isForBidding && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Starting Bid (₹) *</label>
                        <input 
                          type="number" 
                          required 
                          min={1} 
                          value={form.rate} 
                          onChange={e => setForm(prev => ({ ...prev, rate: e.target.value }))} 
                          placeholder="e.g. 500" 
                          className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">Description</label>
                      <textarea 
                        value={form.description} 
                        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} 
                        placeholder="Briefly describe your beat..." 
                        rows="1" 
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" 
                      />
                    </div>
                  </div>
                  {msg.error && <p className="text-sm font-semibold text-red-600">{msg.error}</p>}
                  {msg.success && <p className="text-sm font-semibold text-green-600">{msg.success}</p>}
                  <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={uploading} className={`px-5 py-2 bg-blue-600 hover:bg-blue-700 text-text-primary rounded font-semibold text-sm shadow cursor-pointer transition ${uploading ? "opacity-60 cursor-not-allowed animate-pulse" : ""}`}>
                      {uploading ? "Uploading to Cloudinary..." : "Publish Composition"}
                    </button>
                    <button type="button" onClick={discardRecording} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-sm font-semibold cursor-pointer transition">
                      Discard
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* Dynamic Background Waveform Left (Visible when playing) */}
      {playing && (
        <div className="fixed top-0 bottom-0 left-0 flex flex-col justify-center gap-2 opacity-30 dark:opacity-20 w-64 pl-2 pointer-events-none overflow-hidden animate-fade-in" style={{ zIndex: 0 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={`wave-l-${i}`}
              className="h-2.5 md:h-3.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-r-full"
              style={{
                width: `${40 + Math.sin(i * 0.4) * 80 + Math.random() * 60}px`,
                animation: `waveform-horizontal ${1 + Math.random() * 1.5}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.05}s`,
                transformOrigin: 'left',
              }}
            />
          ))}
        </div>
      )}

      {/* Dynamic Background Waveform Right (Visible when playing) */}
      {playing && (
        <div className="fixed top-0 bottom-0 right-0 flex flex-col justify-center items-end gap-2 opacity-30 dark:opacity-20 w-64 pr-2 pointer-events-none overflow-hidden animate-fade-in" style={{ zIndex: 0 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={`wave-r-${i}`}
              className="h-2.5 md:h-3.5 bg-gradient-to-l from-violet-500 to-cyan-500 rounded-l-full"
              style={{
                width: `${40 + Math.sin(i * 0.4) * 80 + Math.random() * 60}px`,
                animation: `waveform-horizontal ${1 + Math.random() * 1.5}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.05}s`,
                transformOrigin: 'right',
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
}