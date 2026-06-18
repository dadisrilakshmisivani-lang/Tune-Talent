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
  const [form, setForm] = useState({ title: "", genre: "", rate: "", description: "" });
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

    const socket = io("http://localhost:3000");
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
    if (!blob.current || !form.title || !form.genre || !form.rate) {
      setMsg({ error: "Please fill in all required fields.", success: "" });
      return;
    }

    setUploading(true);
    setMsg({ error: "", success: "" });

    const body = new FormData();
    body.append("file", blob.current, "composition.webm");
    Object.entries(form).forEach(([k, v]) => body.append(k, v));

    try {
      const res = await fetch("http://localhost:3000/music/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (res.ok && data.note) {
        setMsg({ error: "", success: "Composition uploaded successfully to Cloudinary!" });
        setForm({ title: "", genre: "", rate: "", description: "" });
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
              className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer transition"
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

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={togglePlay} className="px-4 py-2 bg-black text-white rounded cursor-pointer">
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={clearAll} className="px-4 py-2 border rounded cursor-pointer">
          Clear
        </button>
        <button
          onClick={handleRecordToggle}
          className={`px-4 py-2 rounded text-white font-semibold cursor-pointer transition ${isRecording ? "bg-red-600 animate-pulse" : "bg-red-500 hover:bg-red-600"}`}
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
      <div className="space-y-3">
        {TRACKS.map(track => (
          <div key={track} className="flex items-center gap-3">
            <div className="w-16 uppercase text-sm">{track}</div>
            <div className="grid grid-cols-16 gap-1 flex-1">
              {(steps[track] || Array(16).fill(false)).map((active, index) => (
                <button
                  key={index}
                  onClick={() => toggleStep(track, index)}
                  className={`h-10 rounded border transition cursor-pointer ${active ? "bg-black" : "bg-white"} ${currentStep === index ? "ring-2 ring-blue-500" : ""}`}
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
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm cursor-pointer transition"
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
                  <Link to="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold whitespace-nowrap">
                    Log In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-4 border-t border-slate-200 pt-6">
                  <h4 className="text-md font-bold text-slate-800">Publish to TuneTalent</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "title", label: "Composition Title *", placeholder: "e.g. Synth Jam", type: "text" },
                      { name: "genre", label: "Genre *", placeholder: "e.g. Electronic", type: "text" },
                      { name: "rate", label: "Starting Bid (₹) *", placeholder: "e.g. 500", type: "number" },
                    ].map(({ name, label, placeholder, type }) => (
                      <div key={name} className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">{label}</label>
                        <input type={type} required min={type === "number" ? 1 : undefined} value={form[name]} onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))} placeholder={placeholder} className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    ))}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">Description</label>
                      <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Briefly describe your beat..." rows="1" className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
                    </div>
                  </div>
                  {msg.error && <p className="text-sm font-semibold text-red-600">{msg.error}</p>}
                  {msg.success && <p className="text-sm font-semibold text-green-600">{msg.success}</p>}
                  <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={uploading} className={`px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm shadow cursor-pointer transition ${uploading ? "opacity-60 cursor-not-allowed animate-pulse" : ""}`}>
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

    </div>
  );
}