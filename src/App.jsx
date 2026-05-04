import { useState, useRef, useCallback, useEffect } from "react";

// ─── THEMES ──────────────────────────────────────────────────
const DARK = {
  name: "Midnight Atelier",
  bg: "#0D1B2A", bgCard: "#152236", bgDeep: "#091422", bgNav: "#0D1B2A",
  accent: "#D4AF7A", accentLight: "#E8C99A",
  accentDim: "rgba(212,175,122,0.11)", accentBorder: "rgba(212,175,122,0.24)", accentBorderHi: "rgba(212,175,122,0.50)",
  text: "#F5F0E8", textMuted: "rgba(245,240,232,0.42)", textSub: "rgba(245,240,232,0.66)",
  border: "rgba(212,175,122,0.15)", borderHi: "rgba(212,175,122,0.30)",
  heroGlow: "radial-gradient(ellipse at 60% 0%, rgba(212,175,122,0.17) 0%, transparent 65%)",
  splashGlow: "radial-gradient(ellipse at 50% 30%, rgba(212,175,122,0.20) 0%, transparent 60%)",
  btn: "linear-gradient(135deg,#9E7A1E,#D4AF7A,#9E7A1E)", btnText: "#0D1B2A",
  shadow: "0 8px 40px rgba(9,20,34,0.75)", shadowGold: "0 4px 24px rgba(212,175,122,0.28)",
  emoji: "🌙",
};
const LIGHT = {
  name: "Pearl Morning",
  bg: "#F5F0E5", bgCard: "#FFFFFF", bgDeep: "#EDE8DC", bgNav: "#F5F0E5",
  accent: "#8B4A2F", accentLight: "#C0843F",
  accentDim: "rgba(139,74,47,0.07)", accentBorder: "rgba(139,74,47,0.17)", accentBorderHi: "rgba(139,74,47,0.40)",
  text: "#1A0F08", textMuted: "rgba(26,15,8,0.42)", textSub: "rgba(26,15,8,0.63)",
  border: "rgba(139,74,47,0.12)", borderHi: "rgba(139,74,47,0.25)",
  heroGlow: "radial-gradient(ellipse at 60% 0%, rgba(192,132,63,0.10) 0%, transparent 65%)",
  splashGlow: "radial-gradient(ellipse at 50% 30%, rgba(192,132,63,0.14) 0%, transparent 60%)",
  btn: "linear-gradient(135deg,#6B3420,#C0843F,#6B3420)", btnText: "#F5F0E5",
  shadow: "0 8px 40px rgba(139,74,47,0.10)", shadowGold: "0 4px 24px rgba(139,74,47,0.15)",
  emoji: "☀️",
};
const OCC_THEME = { daily:"light", brunch:"light", interview:"light", outdoor:"light", date:"dark", wedding:"dark", party:"dark", graduation:"dark" };
const OCCS = [
  {id:"daily",label:"Daily Work",icon:"☀️",t:"light"},
  {id:"date",label:"Date Night",icon:"🌙",t:"dark"},
  {id:"wedding",label:"Wedding",icon:"💍",t:"dark"},
  {id:"brunch",label:"Brunch",icon:"🥂",t:"light"},
  {id:"party",label:"Girls Night",icon:"✨",t:"dark"},
  {id:"interview",label:"Job Interview",icon:"💼",t:"light"},
  {id:"graduation",label:"Graduation",icon:"🎓",t:"dark"},
  {id:"outdoor",label:"Outdoor Event",icon:"🌿",t:"light"},
];
const GLAM = [
  {id:"casual",label:"Casual",sub:"Natural & Effortless",dot:1},
  {id:"medium",label:"Medium Glam",sub:"Polished & Refined",dot:2},
  {id:"full",label:"Full Glam",sub:"Dramatic & Stunning",dot:3},
];
// ─── SMART PALETTE ENGINE ─────────────────────────────────────
const PALETTE_LIBRARY = {
  daily: {
    title: "Clean Everyday Polish",
    shades: ["Nude Beige", "Taupe", "Soft Peach", "Muted Pink", "Light Brown"],
    lipstick: "Peach nude or muted pink",
    eyeshadow: "Matte nude with light brown definition",
    blush: "Natural peach",
    highlighter: "Soft satin glow",
  },
  date: {
    title: "Romantic Date Night",
    shades: ["Mauve", "Rose Gold", "Warm Brown", "Champagne", "Berry"],
    lipstick: "Mauve nude, rose berry, or soft red",
    eyeshadow: "Rose gold shimmer with warm brown depth",
    blush: "Rose mauve",
    highlighter: "Champagne glow",
  },
  wedding: {
    title: "Soft Glam Wedding Glow",
    shades: ["Rose Gold", "Champagne", "Soft Brown", "Peach", "Mauve"],
    lipstick: "Rose nude, soft berry, or elegant coral",
    eyeshadow: "Rose gold shimmer with soft brown crease",
    blush: "Peachy pink",
    highlighter: "Champagne glow",
  },
  brunch: {
    title: "Fresh Brunch Glow",
    shades: ["Peach", "Soft Coral", "Champagne", "Pink", "Nude"],
    lipstick: "Tinted peach, coral, or fresh pink",
    eyeshadow: "Soft peach wash with champagne shimmer",
    blush: "Fresh coral pink",
    highlighter: "Dewy champagne",
  },
  party: {
    title: "Bold Night Out Look",
    shades: ["Bronze", "Chocolate Brown", "Gold", "Berry", "Black Smoke"],
    lipstick: "Berry, red, or deep nude",
    eyeshadow: "Bronze shimmer with smoky edges",
    blush: "Warm rose",
    highlighter: "Golden glow",
  },
  interview: {
    title: "Confident Professional Look",
    shades: ["Nude Beige", "Taupe", "Light Brown", "Soft Peach", "Muted Pink"],
    lipstick: "Muted rose, peach nude, or soft brown nude",
    eyeshadow: "Matte taupe with clean light brown definition",
    blush: "Natural peach",
    highlighter: "Very soft natural glow",
  },
  graduation: {
    title: "Camera-Ready Graduation Glow",
    shades: ["Bronze", "Soft Gold", "Mauve", "Warm Brown", "Champagne"],
    lipstick: "Mauve, rose nude, or classic soft red",
    eyeshadow: "Warm bronze with soft gold highlight",
    blush: "Rose peach",
    highlighter: "Soft gold",
  },
  outdoor: {
    title: "Fresh Outdoor Radiance",
    shades: ["Peach", "Soft Coral", "Light Bronze", "Nude", "Champagne"],
    lipstick: "Coral tint, peach nude, or glossy pink",
    eyeshadow: "Light bronze or peach wash",
    blush: "Fresh coral",
    highlighter: "Subtle dewy glow",
  },
};

const SHADE_COLORS = {
  "Rose Gold": "#b76e79",
  Champagne: "#f7e7ce",
  "Soft Brown": "#9b6a45",
  Peach: "#ffb07c",
  Mauve: "#b784a7",
  Bronze: "#cd7f32",
  "Chocolate Brown": "#5c4033",
  Gold: "#d4af37",
  Berry: "#8a2042",
  "Black Smoke": "#2b2b2b",
  "Nude Beige": "#d8bfa3",
  Taupe: "#8b8589",
  "Soft Peach": "#ffc4a3",
  "Light Brown": "#b5651d",
  "Muted Pink": "#d8a0a7",
  Pink: "#ffc0cb",
  Nude: "#c68642",
  "Soft Coral": "#f88379",
  "Light Bronze": "#b08d57",
  "Soft Gold": "#e6c56e",
  "Warm Brown": "#8b4513",
};

const SKIN_TONE_TIPS = {
  Fair: "Soft pink, peach, champagne, and rose nude will look fresh.",
  Light: "Peach, rose, mauve, bronze, and coral will create balanced warmth.",
  Medium: "Gold, copper, warm rose, berry, and brown tones will look very flattering.",
  Tan: "Bronze, peach, terracotta, coral, and warm nude shades will enhance your glow.",
  Deep: "Rich berry, gold, copper, chocolate, plum, and warm red shades will look stunning.",
};


// ─── FACE DNA ENGINE ──────────────────────────────────────────
const FACE_DNA_OUTCOMES = [
  { id: "natural", title: "Natural Enhancement", icon: "🌿", purpose: "Enhance the face without changing the natural identity." },
  { id: "occasion", title: "Occasion Optimized", icon: "💍", purpose: "Adapt makeup to the event, lighting, outfit mood, and glam level." },
  { id: "feature", title: "Feature Highlight", icon: "✨", purpose: "Identify and spotlight the strongest facial feature." },
  { id: "experimental", title: "Future Trend Look", icon: "🔮", purpose: "Suggest a bolder look the user may not normally imagine." },
];

function createFaceDNA({ profile, occ, glam, hasFullScan }) {
  const tone = profile?.skinTone || "Unknown";
  const skinType = profile?.skinType || "Unknown";
  const occasion = OCCS.find(o => o.id === occ)?.label || "Not selected";

  return {
    scanQuality: hasFullScan ? "Complete 5-angle scan" : "Incomplete scan",
    faceMap: {
      front: "Primary reference for symmetry, eye spacing, lip balance, and overall proportions.",
      left: "Jawline, cheek projection, nose bridge, and side contour reference.",
      right: "Jawline comparison, facial asymmetry check, and side contour reference.",
      up: "Forehead, brow bone, under-eye shadow, chin length, and highlight zones.",
      down: "Forehead height, brow shape, upper-face balance, and contour placement.",
    },
    knownProfile: { skinTone: tone, skinType, occasion, glam },
    analysisTargets: [
      "Face shape",
      "Skin undertone",
      "Eye shape",
      "Lip shape",
      "Brow balance",
      "Cheekbone and jawline structure",
      "Best contour and blush placement",
      "Most flattering palette family",
    ],
  };
}

const SCAN_ANGLES = [
  { id:"front",      title:"LOOK STRAIGHT AHEAD",   sub:"Center your face in the circle",        icon:"⊙", instruction:"Hold your phone at eye level. Face the camera directly." },
  { id:"left",       title:"TURN SLIGHTLY LEFT",    sub:"Show the right side of your face",      icon:"↶", instruction:"Slowly turn your head 30° to your left." },
  { id:"right",      title:"TURN SLIGHTLY RIGHT",   sub:"Show the left side of your face",       icon:"↷", instruction:"Slowly turn your head 30° to your right." },
  { id:"up",         title:"TILT YOUR CHIN UP",     sub:"Show your jawline & neck",              icon:"↑", instruction:"Lift your chin slightly to reveal your jawline." },
  { id:"down",       title:"TILT YOUR CHIN DOWN",   sub:"Show your forehead & brow",             icon:"↓", instruction:"Lower your chin slightly to show your forehead." },
];
const STEP_OVERLAYS = {
  step1: { name:"Skin Prep",    color:"rgba(255,240,230,0.25)", zone:"all",        duration:5000 },
  step2: { name:"Foundation",   color:"rgba(220,180,150,0.30)", zone:"all",        duration:6000 },
  step3: { name:"Contour",      color:"rgba(120,80,60,0.40)",   zone:"sides",      duration:5000 },
  step4: { name:"Blush",        color:"rgba(220,140,140,0.45)", zone:"cheeks",     duration:4000 },
  step5: { name:"Eye Makeup",   color:"rgba(80,50,90,0.55)",    zone:"eyes",       duration:5000 },
  step6: { name:"Brows",        color:"rgba(80,50,30,0.60)",    zone:"brows",      duration:4000 },
  step7: { name:"Lips",         color:"rgba(180,40,60,0.65)",   zone:"lips",       duration:4000 },
  step8: { name:"Setting",      color:"rgba(255,250,230,0.20)", zone:"all",        duration:4000 },
};

const FF = "'Palatino Linotype','Book Antiqua',Palatino,serif";

const DEFAULT_TUTORIAL = {
  step1: { title: "Skin Prep", instruction: "Cleanse, moisturize, and let skin care settle before makeup. Use a primer matched to your skin type." },
  step2: { title: "Foundation", instruction: "Apply thin layers from the center of the face outward, keeping coverage light where your skin already looks even." },
  step3: { title: "Contour", instruction: "Add soft definition under the cheekbones, around the hairline, and lightly under the jaw, then blend until there are no edges." },
  step4: { title: "Blush", instruction: "Place blush where your cheeks naturally lift, blending slightly upward for a fresh, balanced finish." },
  step5: { title: "Eye Makeup", instruction: "Use your mid-tone shade through the crease, deepen the outer corner, and brighten the inner corner or lid center." },
  step6: { title: "Brows", instruction: "Brush brows upward, fill only sparse areas, and keep the front of the brow softer than the arch and tail." },
  step7: { title: "Lips", instruction: "Define the lip line softly, blend inward, then apply lipstick or gloss that matches the chosen palette." },
  step8: { title: "Setting", instruction: "Set only the areas that crease or get shiny, then mist lightly so the look stays fresh instead of heavy." },
};

function normalizeAnalysis(raw) {
  if (!raw) return null;
  const faceDNA = raw.faceDNA || {};
  const skinTone = faceDNA.skinTone || {};
  const placement = faceDNA.placementMap || {};
  const palette = Array.isArray(faceDNA.paletteFamily) ? faceDNA.paletteFamily : [];

  return {
    ...raw,
    lookName: raw.lookName || "Personalized Lumiere Look",
    faceDNA,
    tutorial: raw.tutorial && Object.keys(raw.tutorial).length ? raw.tutorial : DEFAULT_TUTORIAL,
    faceShape: raw.faceShape || faceDNA.faceShape?.value || "",
    skinTone: raw.skinTone || [skinTone.depth, skinTone.undertone].filter(Boolean).join(" ") || "",
    undertone: raw.undertone || skinTone.undertone || "",
    eyeShape: raw.eyeShape || faceDNA.eyeStructure?.value || "",
    jawline: raw.jawline || placement.contour || "",
    cheekbones: raw.cheekbones || placement.blush || "",
    features: raw.features || [
      faceDNA.eyeStructure?.value && `Eyes: ${faceDNA.eyeStructure.value}`,
      faceDNA.browStructure?.value && `Brows: ${faceDNA.browStructure.value}`,
      faceDNA.lipStructure?.value && `Lips: ${faceDNA.lipStructure.value}`,
    ].filter(Boolean),
    products: raw.products || palette.slice(0, 4).map((shade) => ({
      name: "Palette shade",
      shade,
      why: "Selected by the Face DNA analysis for this occasion and glam level.",
    })),
    proTip: raw.proTip || raw.fourOutcomes?.featureHighlight || placement.highlight || "Blend in thin layers and keep the strongest detail on your best feature.",
  };
}

// ─── STORAGE ─────────────────────────────────────────────────
const STORAGE = {
  load(key, fallback) {
    try {
      const v = localStorage.getItem('lumiere_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  save(key, value) {
    try { localStorage.setItem('lumiere_' + key, JSON.stringify(value)); }
    catch {}
  }
};

// ─── ROOT ────────────────────────────────────────────────────
export default function Lumiere() {
  const [screen, setScreen] = useState("splash");
  const [profile, setProfile] = useState(() => STORAGE.load('profile', {name:"",age:"",skinType:"",skinTone:""}));
  const [pStep, setPStep] = useState(0);
  const [scans, setScans] = useState({});
  const [glam, setGlam] = useState("medium");
  const [occ, setOcc] = useState(null);
  const [result, setResult] = useState(() => normalizeAnalysis(STORAGE.load('lastResult', null)));
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("home");
  const [looks, setLooks] = useState(() => STORAGE.load('looks', []));
  const [events, setEvents] = useState(() => STORAGE.load('events', []));
  const [chatMessages, setChatMessages] = useState(() => STORAGE.load('chatMessages', []));
  const [scanHistory, setScanHistory] = useState(() => STORAGE.load('scanHistory', []));
  const [lastChatOpenedDate, setLastChatOpenedDate] = useState(() => STORAGE.load('lastChatOpened', null));
  const [notif, setNotif] = useState(null);
  const [manual, setManual] = useState("dark");

  const T = occ ? (OCC_THEME[occ]==="light" ? LIGHT : DARK) : (manual==="dark" ? DARK : LIGHT);
  const notify = m => { setNotif(m); setTimeout(()=>setNotif(null),3500); };
  const hasFullScan = SCAN_ANGLES.every(a => scans[a.id]);
  const primaryFace = scans.front || Object.values(scans)[0] || null;

  // Persist
  useEffect(() => STORAGE.save('profile', profile), [profile]);
  useEffect(() => STORAGE.save('looks', looks), [looks]);
  useEffect(() => STORAGE.save('events', events), [events]);
  useEffect(() => STORAGE.save('chatMessages', chatMessages), [chatMessages]);
  useEffect(() => STORAGE.save('scanHistory', scanHistory), [scanHistory]);
  useEffect(() => STORAGE.save('lastChatOpened', lastChatOpenedDate), [lastChatOpenedDate]);
  useEffect(() => { if (result) STORAGE.save('lastResult', result); }, [result]);

  // Skip splash if onboarded
  useEffect(() => {
    if (profile.name && screen === "splash") setScreen("main");
  }, []);

  const analyze = useCallback(async () => {
    if (!hasFullScan || !occ) {
      notify("Please complete your scan and choose an occasion first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const occLabel = OCCS.find(o => o.id === occ)?.label || "General";

      // Backend needs an array, not the scans object.
      const images = SCAN_ANGLES.map(a => scans[a.id]).filter(Boolean);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          occasion: occLabel,
          glam,
          faceDNA: createFaceDNA({ profile, occ, glam, hasFullScan }),
        }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("API RESPONSE:", data);

      if (!res.ok) {
        console.error("API ERROR:", data);
        notify(data?.error || "Analysis failed. Please try a fresh scan.");
        setLoading(false);
        return;
      }

      const normalized = normalizeAnalysis(data);

      const scanEntry = {
        id: "scan_" + Date.now(),
        date: new Date().toISOString(),
        analysis: normalized,
        primaryFace: scans.front,
      };

      setScanHistory(p => [scanEntry, ...p].slice(0, 10));
      setResult(normalized);

      // Go to the dedicated Results screen.
      setScreen("results");
    } catch (error) {
      console.error("Analyze error:", error);
      notify(error?.message || "Network error. Please try again.");
    }

    setLoading(false);
  }, [scans, glam, occ, hasFullScan, profile]);

  const saveLook = () => {
    if (!result) return;
    setLooks(p=>[{id:Date.now(), lookName:result.lookName, occasion:OCCS.find(o=>o.id===occ)?.label, occ, glam, preview:primaryFace, date:new Date().toLocaleDateString(), dk:OCC_THEME[occ]||"dark"},...p]);
    notify("✨ Look saved!");
  };
  const resetScan = () => setScans({});

  const addEvent = (event) => {
    const newEvent = { ...event, id: 'evt_' + Date.now(), createdAt: new Date().toISOString() };
    setEvents(p => [...p, newEvent].sort((a,b)=>new Date(a.date)-new Date(b.date)));
    return newEvent;
  };
  const updateEvent = (id, updates) => {
    setEvents(p => p.map(e => e.id === id ? { ...e, ...updates } : e));
  };
  const removeEvent = (id) => setEvents(p => p.filter(e => e.id !== id));

  const lastScanDate = scanHistory.length > 0 ? scanHistory[0].date : null;

  if (screen==="splash") return <Splash T={DARK} go={()=>setScreen("onboard")}/>;
  if (screen==="onboard") return <Onboard T={DARK} profile={profile} setProfile={setProfile} step={pStep} setStep={setPStep} done={()=>setScreen("main")}/>;
  if (screen==="camera") return <CameraScan T={T} scans={scans} setScans={setScans} onDone={()=>setScreen("main")} onCancel={()=>setScreen("main")} notify={notify}/>;
  if (screen==="player") return <TutorialPlayer T={T} result={result} preview={primaryFace} occ={OCCS.find(o=>o.id===occ)} glam={glam} onClose={()=>setScreen("results")} />;
  if (screen==="results") return <Results T={T} result={result} preview={primaryFace} occ={OCCS.find(o=>o.id===occ)} glam={glam} onSave={saveLook} onBack={()=>setScreen("main")} onNew={()=>{setResult(null); setScreen("main"); setTab("scan");}} onPlay={()=>setScreen("player")}/>;

  return (
    <Shell T={T} manual={manual} setManual={setManual} occ={occ} profile={profile} tab={tab} setTab={setTab} notif={notif} events={events}>
      {tab==="home" && <Home T={T} profile={profile} preview={primaryFace} looks={looks} events={events} setTab={setTab} scanHistory={scanHistory}/>}
      {tab==="scan" && <Scan T={T} scans={scans} hasFullScan={hasFullScan} primaryFace={primaryFace} startCamera={()=>setScreen("camera")} resetScan={resetScan} glam={glam} setGlam={setGlam} occ={occ} setOcc={setOcc} analyze={analyze} loading={loading} profile={profile}/>}
      {tab==="looks" && <Looks T={T} looks={looks}/>}
      {tab==="lumi" && <LumiChat T={T} profile={profile} setProfile={setProfile} faceAnalysis={result} events={events} addEvent={addEvent} updateEvent={updateEvent} removeEvent={removeEvent} chatMessages={chatMessages} setChatMessages={setChatMessages} scanHistory={scanHistory} lastScanDate={lastScanDate} lastChatOpenedDate={lastChatOpenedDate} setLastChatOpenedDate={setLastChatOpenedDate} notify={notify} setTab={setTab}/>}
      {tab==="profile" && <Profile T={T} profile={profile} preview={primaryFace} hasFullScan={hasFullScan} startCamera={()=>setScreen("camera")} scanHistory={scanHistory} events={events}/>}
    </Shell>
  );
}

// ─── 💬 LUMI CHAT — V6 SMARTER + PROACTIVE ──────────────────
function LumiChat({ T, profile, setProfile, faceAnalysis, events, addEvent, updateEvent, removeEvent, chatMessages, setChatMessages, scanHistory, lastScanDate, lastChatOpenedDate, setLastChatOpenedDate, notify, setTab }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const messagesEndRef = useRef();
  const inputRef = useRef();
  const autoGreetingTriggeredRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, sending]);

  // 🌟 PROACTIVE AUTO-GREETING
  // Triggers when:
  // - Empty chat history, OR
  // - More than 4 hours since last open AND there's a relevant context (event coming, stale scan)
  useEffect(() => {
    if (autoGreetingTriggeredRef.current) return;
    autoGreetingTriggeredRef.current = true;

    const now = Date.now();
    const hoursSinceLastOpen = lastChatOpenedDate ? (now - lastChatOpenedDate) / (1000*60*60) : Infinity;
    const hasContext = checkProactiveContext({ events, lastScanDate });
    const shouldAutoGreet = chatMessages.length === 0 || (hoursSinceLastOpen > 4 && hasContext);

    if (shouldAutoGreet) {
      generateAutoGreeting();
    }
    setLastChatOpenedDate(now);
  }, []);

  const generateAutoGreeting = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '[SYSTEM: User just opened Lumi chat. Generate a proactive, context-aware greeting based on their calendar, scan history, and profile completeness. Keep it 1-2 sentences, warm and natural.]' }],
          profile,
          faceAnalysis,
          currentEvents: events,
          scanHistory,
          lastScanDate,
          isAutoGreeting: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setChatMessages(prev => [...prev, { role: 'assistant', content: data.text, timestamp: Date.now(), isProactive: true }]);
        }
      }
    } catch {}
    setSending(false);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || sending) return;
    const userMsg = { role: 'user', content: text.trim(), timestamp: Date.now() };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setInput("");
    setSending(true);

    try {
      // Strip non-API fields when sending
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          profile,
          faceAnalysis,
          currentEvents: events,
          scanHistory,
          lastScanDate,
          isAutoGreeting: false
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        notify(err.error || "Lumi is having trouble. Try again.");
        setSending(false); return;
      }

      const data = await res.json();
      let assistantText = data.text || "";
      const newEventsAdded = [];
      const eventsRemoved = [];
      const eventsUpdated = [];
      const profileUpdates = {};
      const rescanSuggested = [];

      // Process tool calls
      if (data.toolCalls && data.toolCalls.length > 0) {
        for (const tc of data.toolCalls) {
          if (tc.name === 'add_event') {
            const newEvt = addEvent({
              title: tc.input.title,
              date: tc.input.date,
              time: tc.input.time || '',
              occasion: tc.input.occasion,
              glam: tc.input.glam,
              notes: tc.input.notes || ''
            });
            newEventsAdded.push(newEvt);
          } else if (tc.name === 'update_event') {
            const { id, ...updates } = tc.input;
            updateEvent(id, updates);
            eventsUpdated.push({ id, updates });
          } else if (tc.name === 'remove_event') {
            removeEvent(tc.input.id);
            eventsRemoved.push(tc.input.id);
          } else if (tc.name === 'update_profile') {
            const cleaned = Object.fromEntries(Object.entries(tc.input).filter(([_,v]) => v));
            setProfile(p => ({ ...p, ...cleaned }));
            Object.assign(profileUpdates, cleaned);
          } else if (tc.name === 'suggest_rescan') {
            rescanSuggested.push(tc.input.reason);
          } else if (tc.name === 'plan_look') {
            const { eventId, ...lookData } = tc.input;
            updateEvent(eventId, { plannedLook: lookData });
            eventsUpdated.push({ id: eventId, updates: { plannedLook: lookData } });
          }
        }
      }

      const assistantMsg = {
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
        addedEvents: newEventsAdded.length > 0 ? newEventsAdded : null,
        rescanSuggested: rescanSuggested.length > 0 ? rescanSuggested : null,
        profileUpdates: Object.keys(profileUpdates).length > 0 ? profileUpdates : null
      };
      setChatMessages(prev => [...prev, assistantMsg]);

      // User notifications
      if (newEventsAdded.length > 0) notify(`✨ ${newEventsAdded.length} event${newEventsAdded.length>1?'s':''} added`);
      else if (eventsUpdated.length > 0) notify(`✨ Event updated`);
      else if (Object.keys(profileUpdates).length > 0) notify(`✨ Profile updated`);
      else if (rescanSuggested.length > 0) notify(`💡 Rescan suggested`);
    } catch (e) {
      notify("Network error. Please try again.");
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    if (confirm("Clear chat history? Your events and profile stay safe.")) {
      setChatMessages([]);
      autoGreetingTriggeredRef.current = false;
      setTimeout(() => generateAutoGreeting(), 200);
    }
  };

  // Quick action prompts (smart based on context)
  const QUICK_PROMPTS = getQuickPrompts({ events, profile, scanHistory });

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)",position:"relative"}}>
      <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:12,background:T.bgCard}}>
        <div style={{
          width:42, height:42, borderRadius:"50%", background: T.btn,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, color:T.btnText, fontWeight:300, fontFamily:FF,
          boxShadow:T.shadowGold
        }}>L</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,color:T.text,letterSpacing:2,fontWeight:300}}>LUMI</div>
          <div style={{fontSize:8,color:T.accent,letterSpacing:2,marginTop:2}}>YOUR BEAUTY ADVISOR · ONLINE</div>
        </div>
        <button onClick={()=>setShowEvents(s=>!s)} style={{background:showEvents?T.accentDim:"transparent",border:`1px solid ${T.border}`,color:T.accent,fontSize:8,letterSpacing:2,padding:"6px 10px",cursor:"pointer",fontFamily:FF}}>
          📅 {events.length}
        </button>
        <button onClick={clearChat} style={{background:"transparent",border:"none",color:T.textMuted,fontSize:11,cursor:"pointer",padding:6}}>↻</button>
      </div>

      {showEvents && (
        <div style={{background:T.bgDeep,borderBottom:`1px solid ${T.border}`,padding:"12px 16px",maxHeight:240,overflowY:"auto"}}>
          <div style={{fontSize:8,color:T.accent,letterSpacing:3,marginBottom:10}}>📅 BEAUTY CALENDAR</div>
          {events.length === 0 ? (
            <div style={{fontSize:10,color:T.textMuted,textAlign:"center",padding:"16px 0",fontStyle:"italic"}}>No upcoming events. Tell Lumi what's coming up!</div>
          ) : (
            events.map(e => <EventCard key={e.id} event={e} T={T} onRemove={()=>removeEvent(e.id)}/>)
          )}
        </div>
      )}

      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 8px",display:"flex",flexDirection:"column",gap:12}}>
        {chatMessages.map((msg, i) => (
          <Message key={i} message={msg} T={T} setTab={setTab}/>
        ))}
        {sending && (
          <div style={{display:"flex",gap:8,alignItems:"center",padding:"8px 14px",background:T.bgCard,border:`1px solid ${T.border}`,maxWidth:"75%",alignSelf:"flex-start"}}>
            <div style={{display:"flex",gap:4}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"typingDot 1.4s infinite ease-in-out",animationDelay:"0s"}}/>
              <div style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"typingDot 1.4s infinite ease-in-out",animationDelay:"0.2s"}}/>
              <div style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"typingDot 1.4s infinite ease-in-out",animationDelay:"0.4s"}}/>
            </div>
            <span style={{fontSize:9,color:T.textMuted,letterSpacing:1}}>Lumi is thinking</span>
          </div>
        )}
        <div ref={messagesEndRef}/>
        <style>{`
          @keyframes typingDot {
            0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
            30% { opacity: 1; transform: translateY(-3px); }
          }
        `}</style>
      </div>

      {chatMessages.length <= 2 && QUICK_PROMPTS.length > 0 && (
        <div style={{padding:"4px 14px 8px",display:"flex",gap:6,flexWrap:"wrap"}}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={()=>sendMessage(p)} disabled={sending}
              style={{background:T.bgCard,border:`1px solid ${T.border}`,color:T.textSub,fontSize:9,padding:"7px 11px",cursor:"pointer",fontFamily:FF,letterSpacing:0.5,whiteSpace:"nowrap",transition:"all 0.2s"}}>
              {p}
            </button>
          ))}
        </div>
      )}

      <div style={{padding:"10px 14px 14px",borderTop:`1px solid ${T.border}`,background:T.bg,display:"flex",gap:8,alignItems:"flex-end"}}>
        <textarea
          ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Message Lumi..." rows={1}
          style={{flex:1, background:T.bgCard, border:`1px solid ${T.border}`, color:T.text, fontSize:13, padding:"10px 14px", outline:"none", fontFamily:FF, resize:"none", maxHeight:90, lineHeight:1.5, caretColor:T.accent}}
        />
        <button onClick={()=>sendMessage(input)} disabled={!input.trim() || sending}
          style={{background: input.trim() && !sending ? T.btn : "transparent", color: input.trim() && !sending ? T.btnText : T.textMuted, border: input.trim() && !sending ? "none" : `1px solid ${T.border}`, width:42, height:42, cursor: input.trim() && !sending ? "pointer" : "default", fontSize:16, fontWeight:700, transition:"all 0.2s", flexShrink:0}}
        >→</button>
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────
function checkProactiveContext({ events, lastScanDate }) {
  const now = new Date();
  // Has imminent event (next 10 days)?
  const hasImminentEvent = events.some(e => {
    const days = Math.ceil((new Date(e.date) - now) / (1000*60*60*24));
    return days >= 0 && days <= 10;
  });
  // Stale scan?
  const scanIsStale = lastScanDate && (now - new Date(lastScanDate)) / (1000*60*60*24) > 30;
  return hasImminentEvent || scanIsStale;
}

function getQuickPrompts({ events, profile, scanHistory }) {
  const now = new Date();
  const imminentEvent = events.find(e => {
    const days = Math.ceil((new Date(e.date) - now) / (1000*60*60*24));
    return days >= 0 && days <= 10;
  });

  const prompts = [];
  if (imminentEvent) {
    prompts.push(`Plan my ${imminentEvent.title} look`);
  }
  if (events.length === 0) {
    prompts.push("I have a wedding next month");
  }
  if (events.length > 0) {
    prompts.push("What's coming up?");
  }
  if (scanHistory.length === 0) {
    prompts.push("How do I get started?");
  } else {
    prompts.push("Suggest a look for tonight");
  }
  prompts.push("How do I make my eyes pop?");

  return prompts.slice(0, 4);
}

// ─── MESSAGE BUBBLE ──────────────────────────────────────────
function Message({ message, T, setTab }) {
  const isUser = message.role === 'user';
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start",gap:6}}>
      <div style={{
        maxWidth:"82%",
        background: isUser ? T.btn : T.bgCard,
        color: isUser ? T.btnText : T.text,
        border: isUser ? "none" : `1px solid ${T.border}`,
        padding:"11px 15px", fontSize:13, lineHeight:1.55,
        fontWeight: isUser ? 500 : 400,
        boxShadow: isUser ? T.shadowGold : "none",
        whiteSpace:"pre-wrap", wordBreak:"break-word",
        position:"relative"
      }}>
        {message.isProactive && !isUser && (
          <div style={{position:"absolute",top:-7,left:10,fontSize:7,letterSpacing:3,background:T.accent,color:T.btnText==="#0D1B2A"?"#0D1B2A":"#fff",padding:"2px 7px",fontWeight:700}}>
            ✨ PROACTIVE
          </div>
        )}
        {message.content}
      </div>
      {message.addedEvents && message.addedEvents.map(e => (
        <div key={e.id} style={{maxWidth:"82%",background:T.accentDim, border:`1px solid ${T.accentBorder}`,padding:"10px 13px", fontSize:11}}>
          <div style={{fontSize:7,letterSpacing:3,color:T.accent,marginBottom:4}}>✨ ADDED TO CALENDAR</div>
          <div style={{color:T.text,fontWeight:500,marginBottom:3}}>{e.title}</div>
          <div style={{color:T.textSub,fontSize:10}}>
            📅 {formatDate(e.date)}{e.time?` · ${e.time}`:''} · {OCCS.find(o=>o.id===e.occasion)?.icon} {OCCS.find(o=>o.id===e.occasion)?.label}
          </div>
        </div>
      ))}
      {message.rescanSuggested && (
        <button onClick={()=>setTab('scan')} style={{maxWidth:"82%",background:T.accentDim, border:`1px solid ${T.accentBorder}`,padding:"10px 13px", fontSize:11, cursor:"pointer", textAlign:"left",fontFamily:FF}}>
          <div style={{fontSize:7,letterSpacing:3,color:T.accent,marginBottom:4}}>💡 LUMI SUGGESTS</div>
          <div style={{color:T.text,fontWeight:500,marginBottom:3}}>Refresh your face scan</div>
          <div style={{color:T.textSub,fontSize:10}}>{message.rescanSuggested[0]} · Tap to start →</div>
        </button>
      )}
      {message.profileUpdates && (
        <div style={{maxWidth:"82%",background:T.accentDim, border:`1px solid ${T.accentBorder}`,padding:"8px 12px", fontSize:10}}>
          <div style={{fontSize:7,letterSpacing:3,color:T.accent,marginBottom:3}}>✓ PROFILE UPDATED</div>
          <div style={{color:T.textSub,fontSize:10}}>{Object.entries(message.profileUpdates).map(([k,v])=>`${k}: ${v}`).join(' · ')}</div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, T, onRemove }) {
  const occInfo = OCCS.find(o => o.id === event.occasion);
  const daysAway = Math.ceil((new Date(event.date) - new Date()) / (1000*60*60*24));
  return (
    <div style={{background:T.bgCard,border:`1px solid ${T.border}`,marginBottom:6,padding:"10px 12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:11}}>
        <div style={{fontSize:18}}>{occInfo?.icon || "📅"}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,color:T.text,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{event.title}</div>
          <div style={{fontSize:8,color:T.accent,letterSpacing:1}}>
            {daysAway < 0 ? "PAST" : daysAway === 0 ? "TODAY" : daysAway === 1 ? "TOMORROW" : `IN ${daysAway} DAYS`}
            {event.time && ` · ${event.time}`}
          </div>
          <div style={{fontSize:7,color:T.textMuted,marginTop:1}}>{formatDate(event.date)} · {event.glam} glam</div>
        </div>
        <button onClick={onRemove} style={{background:"transparent",border:"none",color:T.textMuted,fontSize:14,cursor:"pointer",padding:4}}>×</button>
      </div>
      {(event.dress || event.hair || event.plannedLook) && (
        <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${T.border}`,fontSize:9,color:T.textSub,lineHeight:1.6}}>
          {event.dress && <div>👗 <strong style={{color:T.text}}>Dress:</strong> {event.dress}</div>}
          {event.hair && <div>💁 <strong style={{color:T.text}}>Hair:</strong> {event.hair}</div>}
          {event.plannedLook?.makeupConcept && <div>💄 <strong style={{color:T.text}}>Look:</strong> {event.plannedLook.makeupConcept}</div>}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

// ─── TUTORIAL PLAYER ─────────────────────────────────────────
function TutorialPlayer({ T, result, preview, occ, glam, onClose }) {
  result = normalizeAnalysis(result);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef(null);
  const progressRef = useRef(null);

  const steps = result ? Object.entries(result.tutorial).map(([key, val]) => ({ key, ...val })) : [];
  const currentStep = steps[stepIdx];
  const overlay = currentStep ? STEP_OVERLAYS[currentStep.key] : null;

  useEffect(() => {
    if (!currentStep || !playing) return;
    window.speechSynthesis.cancel();
    const speakStep = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => /female|samantha|victoria|karen|moira|tessa|fiona|allison|ava/i.test(v.name) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      const text = `Step ${stepIdx + 1}. ${currentStep.title}. ${currentStep.instruction}`;
      const utterance = new SpeechSynthesisUtterance(text);
      if (preferred) utterance.voice = preferred;
      utterance.rate = 0.92; utterance.pitch = 1.05; utterance.volume = 1;
      utterance.onend = () => { setTimeout(() => { setStepIdx(prev => prev < steps.length - 1 ? prev + 1 : prev); }, 800); };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };
    if (window.speechSynthesis.getVoices().length === 0) window.speechSynthesis.onvoiceschanged = () => speakStep();
    else speakStep();
    return () => { window.speechSynthesis.cancel(); };
  }, [stepIdx, playing]);

  useEffect(() => {
    if (!playing || !overlay) return;
    setProgress(0);
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / overlay.duration) * 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(progressRef.current);
    }, 50);
    return () => clearInterval(progressRef.current);
  }, [stepIdx, playing, overlay]);

  const togglePlay = () => { if (playing) window.speechSynthesis.pause(); else window.speechSynthesis.resume(); setPlaying(!playing); };
  const goToStep = (i) => { window.speechSynthesis.cancel(); setStepIdx(i); setPlaying(true); };

  if (!result || !currentStep) return null;

  return (
    <div style={{minHeight:"100vh",background:"#000",fontFamily:FF,maxWidth:480,margin:"0 auto",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:20,background:"linear-gradient(to bottom,rgba(0,0,0,0.85),transparent)",padding:"16px 18px 28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <button style={{background:"transparent",border:"none",color:"#fff",fontSize:11,letterSpacing:2,cursor:"pointer"}} onClick={onClose}>✕ CLOSE</button>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:9,letterSpacing:3,color:T.accent}}>◆ TUTORIAL PLAYER</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.55)",letterSpacing:1,marginTop:2}}>{result.lookName}</div>
          </div>
          <div style={{fontSize:10,color:T.accent,letterSpacing:2}}>{stepIdx+1}/{steps.length}</div>
        </div>
        <div style={{display:"flex",gap:5,justifyContent:"center"}}>
          {steps.map((_, i) => (
            <button key={i} onClick={()=>goToStep(i)} style={{width: i===stepIdx ? 22 : 6, height:4, background: i < stepIdx ? T.accent : i===stepIdx ? "#fff" : "rgba(255,255,255,0.25)", border:"none", padding:0, cursor:"pointer", transition:"all 0.4s"}}/>
          ))}
        </div>
      </div>
      <div style={{position:"relative",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#000"}}>
        {preview && (
          <div style={{position:"relative",width:"100%",height:"100%",overflow:"hidden"}}>
            <img src={preview} alt="Your face" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(1.05)"}}/>
            <FaceOverlay overlay={overlay} stepIdx={stepIdx} progress={progress} accent={T.accent}/>
            <div style={{position:"absolute",inset:0,boxShadow:`inset 0 0 80px rgba(212,175,122,0.3)`,pointerEvents:"none"}}/>
          </div>
        )}
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,background:"linear-gradient(to top,rgba(0,0,0,0.95) 50%,transparent)",padding:"60px 20px 28px"}}>
        <div style={{height:2,background:"rgba(255,255,255,0.12)",marginBottom:16,position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,height:"100%",width:`${progress}%`,background:T.accent,transition:"width 0.05s linear"}}/>
        </div>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{fontSize:8,letterSpacing:4,color:T.accent,marginBottom:6}}>STEP {stepIdx+1} OF {steps.length}</div>
          <div style={{fontSize:18,color:"#fff",fontWeight:300,marginBottom:10,letterSpacing:1}}>{currentStep.title}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.78)",lineHeight:1.7,maxWidth:340,margin:"0 auto"}}>{currentStep.instruction}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24}}>
          <button onClick={()=>stepIdx > 0 && goToStep(stepIdx-1)} disabled={stepIdx===0} style={{background:"transparent",border:`1px solid rgba(255,255,255,0.25)`,color:"#fff",width:42,height:42,borderRadius:"50%",cursor: stepIdx>0 ? "pointer":"default",fontSize:14,opacity: stepIdx>0 ? 1:0.3}}>←</button>
          <button onClick={togglePlay} style={{width:64, height:64, borderRadius:"50%", background: T.accent, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:T.shadowGold, transition:"all 0.3s"}}>
            <span style={{color:"#0D1B2A",fontSize:20}}>{playing ? "❚❚" : "▶"}</span>
          </button>
          <button onClick={()=>stepIdx < steps.length-1 && goToStep(stepIdx+1)} disabled={stepIdx===steps.length-1} style={{background:"transparent",border:`1px solid rgba(255,255,255,0.25)`,color:"#fff",width:42,height:42,borderRadius:"50%",cursor: stepIdx<steps.length-1 ? "pointer":"default",fontSize:14,opacity: stepIdx<steps.length-1 ? 1:0.3}}>→</button>
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2}}>
          {playing ? "🔊 PLAYING · AUTO-ADVANCING" : "⏸ PAUSED · TAP PLAY TO RESUME"}
        </div>
      </div>
    </div>
  );
}

function FaceOverlay({ overlay, stepIdx, progress, accent }) {
  if (!overlay) return null;
  const opacity = Math.min(progress / 100, 0.85);
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
      {overlay.zone === "all" && <div style={{position:"absolute", inset:0, background: overlay.color, opacity: opacity * 0.7, mixBlendMode:"multiply", transition:"opacity 0.5s ease"}}/>}
      {overlay.zone === "sides" && (<>
        <div style={{position:"absolute", top:"32%", left:"12%", width:"18%", height:"40%", background:`linear-gradient(135deg, transparent, ${overlay.color}, transparent)`, opacity: opacity, mixBlendMode:"multiply", transform:"rotate(-15deg)", filter:"blur(20px)", transition:"opacity 0.5s ease"}}/>
        <div style={{position:"absolute", top:"32%", right:"12%", width:"18%", height:"40%", background:`linear-gradient(-135deg, transparent, ${overlay.color}, transparent)`, opacity: opacity, mixBlendMode:"multiply", transform:"rotate(15deg)", filter:"blur(20px)", transition:"opacity 0.5s ease"}}/>
      </>)}
      {overlay.zone === "cheeks" && (<>
        <div style={{position:"absolute", top:"45%", left:"20%", width:"22%", height:"22%", background: `radial-gradient(circle, ${overlay.color} 0%, transparent 70%)`, opacity: opacity, mixBlendMode:"multiply", animation:"pulse 2s ease-in-out infinite", transition:"opacity 0.5s ease"}}/>
        <div style={{position:"absolute", top:"45%", right:"20%", width:"22%", height:"22%", background: `radial-gradient(circle, ${overlay.color} 0%, transparent 70%)`, opacity: opacity, mixBlendMode:"multiply", animation:"pulse 2s ease-in-out infinite", transition:"opacity 0.5s ease"}}/>
      </>)}
      {overlay.zone === "eyes" && (<>
        <div style={{position:"absolute", top:"32%", left:"22%", width:"20%", height:"10%", background: overlay.color, opacity: opacity * 0.9, mixBlendMode:"multiply", borderRadius:"50%", filter:"blur(8px)", transition:"opacity 0.5s ease"}}/>
        <div style={{position:"absolute", top:"32%", right:"22%", width:"20%", height:"10%", background: overlay.color, opacity: opacity * 0.9, mixBlendMode:"multiply", borderRadius:"50%", filter:"blur(8px)", transition:"opacity 0.5s ease"}}/>
      </>)}
      {overlay.zone === "brows" && (<>
        <div style={{position:"absolute", top:"28%", left:"22%", width:"18%", height:"3%", background: overlay.color, opacity: opacity, mixBlendMode:"multiply", borderRadius:"50%", filter:"blur(4px)", transition:"opacity 0.5s ease"}}/>
        <div style={{position:"absolute", top:"28%", right:"22%", width:"18%", height:"3%", background: overlay.color, opacity: opacity, mixBlendMode:"multiply", borderRadius:"50%", filter:"blur(4px)", transition:"opacity 0.5s ease"}}/>
      </>)}
      {overlay.zone === "lips" && <div style={{position:"absolute", top:"66%", left:"36%", width:"28%", height:"7%", background: overlay.color, opacity: opacity * 0.95, mixBlendMode:"multiply", borderRadius:"50%", filter:"blur(6px)", transition:"opacity 0.5s ease"}}/>}
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }`}</style>
    </div>
  );
}

// ─── CAMERA SCAN ─────────────────────────────────────────────
function CameraScan({ T, scans, setScans, onDone, onCancel, notify }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();
  const [angleIdx, setAngleIdx] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const angle = SCAN_ANGLES[angleIdx];
  const captured = scans[angle?.id];
  const allDone = angleIdx >= SCAN_ANGLES.length;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
        if (!mounted) { stream.getTracks().forEach(t=>t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      } catch (e) { setError("Camera access denied. Please allow camera access in your browser settings and refresh."); }
    })();
    return () => { mounted = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current; const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const outputSize = Math.min(size, 768);
    canvas.width = outputSize; canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    const sx = (video.videoWidth - size) / 2; const sy = (video.videoHeight - size) / 2;
    ctx.translate(outputSize, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, outputSize, outputSize);
    return canvas.toDataURL("image/jpeg", 0.72);
  }, []);

  const handleCapture = useCallback(() => {
    if (!cameraReady || capturing || allDone) return;
    setCapturing(true); setCountdown(3);
    let n = 3;
    const interval = setInterval(() => {
      n--;
      if (n > 0) setCountdown(n);
      else {
        clearInterval(interval); setCountdown(null);
        const photo = capturePhoto();
        if (photo) {
          setScans(prev => ({ ...prev, [angle.id]: photo }));
          setTimeout(() => { setCapturing(false); if (angleIdx < SCAN_ANGLES.length - 1) setAngleIdx(i => i + 1); }, 600);
        } else setCapturing(false);
      }
    }, 1000);
  }, [cameraReady, capturing, allDone, angleIdx, angle, capturePhoto, setScans]);

  const finishScan = () => { streamRef.current?.getTracks().forEach(t => t.stop()); notify("✨ Face scan complete!"); onDone(); };

  if (error) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:30,fontFamily:FF,maxWidth:480,margin:"0 auto"}}>
      <div style={{fontSize:40,marginBottom:20}}>📷</div>
      <div style={{fontSize:16,color:T.text,textAlign:"center",marginBottom:10,fontWeight:300}}>Camera Access Needed</div>
      <div style={{fontSize:12,color:T.textMuted,textAlign:"center",lineHeight:1.7,marginBottom:24}}>{error}</div>
      <button style={{background:T.btn,color:T.btnText,border:"none",padding:"14px 28px",fontSize:10,letterSpacing:4,fontWeight:700,cursor:"pointer"}} onClick={onCancel}>← BACK</button>
    </div>
  );

  if (allDone) return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:FF,maxWidth:480,margin:"0 auto",padding:24}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:32,marginBottom:8}}>✨</div>
        <div style={{fontSize:20,color:T.text,fontWeight:300,letterSpacing:3,marginBottom:6}}>SCAN COMPLETE</div>
        <div style={{fontSize:11,color:T.textMuted,letterSpacing:1}}>5 angles captured · Full 360° analysis ready</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:24}}>
        {SCAN_ANGLES.map(a => (
          <div key={a.id} style={{position:"relative",aspectRatio:"1",overflow:"hidden",border:`1px solid ${T.accentBorder}`}}>
            <img src={scans[a.id]} alt={a.id} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)",padding:"12px 6px 4px",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
              <span style={{fontSize:10,color:T.accent}}>{a.icon}</span>
              <span style={{fontSize:7,color:"#fff",letterSpacing:1}}>{a.id.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
      <button style={{width:"100%",background:T.btn,color:T.btnText,border:"none",padding:"17px",fontSize:11,letterSpacing:5,fontWeight:700,cursor:"pointer",marginBottom:8,boxShadow:T.shadowGold}} onClick={finishScan}>◆ USE THIS SCAN</button>
      <button style={{width:"100%",background:"transparent",border:`1px solid ${T.border}`,color:T.textMuted,padding:"15px",fontSize:9,letterSpacing:3,cursor:"pointer"}} onClick={()=>{setAngleIdx(0); setScans({});}}>↻ RESCAN ALL</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#000",fontFamily:FF,maxWidth:480,margin:"0 auto",position:"relative",overflow:"hidden"}}>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:10,background:"linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)",padding:"16px 18px 28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <button style={{background:"transparent",border:"none",color:"#fff",fontSize:11,letterSpacing:2,cursor:"pointer"}} onClick={onCancel}>✕ CANCEL</button>
          <div style={{fontSize:9,letterSpacing:3,color:T.accent}}>{angleIdx+1} OF {SCAN_ANGLES.length}</div>
        </div>
        <div style={{display:"flex",gap:5,justifyContent:"center"}}>
          {SCAN_ANGLES.map((a, i) => (
            <div key={a.id} style={{width: i===angleIdx ? 20 : 6, height:4, background: scans[a.id] ? T.accent : i===angleIdx ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)", transition:"all 0.3s"}}/>
          ))}
        </div>
      </div>
      <div style={{position:"relative",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#000"}}>
        <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover",transform:"scaleX(-1)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{width:280, height:340, borderRadius:"50%", border: capturing ? `3px solid ${T.accent}` : `2px dashed rgba(255,255,255,0.45)`, boxShadow: capturing ? `0 0 60px ${T.accent}` : "0 0 200px rgba(0,0,0,0.7) inset", transition:"all 0.3s"}}/>
        </div>
        {countdown && <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}><div style={{fontSize:120,color:T.accent,fontWeight:300,textShadow:"0 0 30px rgba(0,0,0,0.8)"}}>{countdown}</div></div>}
        {!cameraReady && <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.85)"}}><div style={{textAlign:"center"}}><div style={{fontSize:32,color:T.accent,marginBottom:12}}>◉</div><div style={{fontSize:11,letterSpacing:3,color:"#fff"}}>STARTING CAMERA...</div></div></div>}
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10,background:"linear-gradient(to top,rgba(0,0,0,0.92) 40%,transparent)",padding:"40px 20px 26px"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:36,color:T.accent,marginBottom:6}}>{angle.icon}</div>
          <div style={{fontSize:15,color:"#fff",letterSpacing:3,fontWeight:300,marginBottom:4}}>{angle.title}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",letterSpacing:1,marginBottom:8}}>{angle.sub}</div>
          <div style={{fontSize:11,color:T.accent,fontStyle:"italic",lineHeight:1.5,maxWidth:280,margin:"0 auto"}}>{angle.instruction}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:30}}>
          <button style={{background:"transparent",border:`1px solid rgba(255,255,255,0.25)`,color:"#fff",width:46,height:46,borderRadius:"50%",cursor: angleIdx>0 ? "pointer":"default",fontSize:14,opacity: angleIdx>0 ? 1:0.3}} onClick={() => angleIdx>0 && setAngleIdx(i=>i-1)} disabled={angleIdx===0}>←</button>
          <button style={{width:78, height:78, borderRadius:"50%", background: capturing ? T.accent : "transparent", border: `4px solid ${capturing ? T.accent : "#fff"}`, cursor: cameraReady && !capturing ? "pointer" : "default", transition:"all 0.3s", position:"relative", opacity: cameraReady ? 1 : 0.4}} onClick={handleCapture} disabled={!cameraReady || capturing}>
            <div style={{position:"absolute",inset:6,borderRadius:"50%",background: capturing ? T.accent : "#fff", transition:"all 0.3s"}}/>
          </button>
          <button style={{background:"transparent",border:`1px solid rgba(255,255,255,0.25)`,color:"#fff",width:46,height:46,borderRadius:"50%",cursor:"pointer",fontSize:14}} onClick={() => { if (angleIdx < SCAN_ANGLES.length-1) setAngleIdx(i=>i+1); }}>→</button>
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:2}}>
          {captured ? "✓ CAPTURED · TAP → FOR NEXT ANGLE" : "TAP CIRCLE TO CAPTURE"}
        </div>
      </div>
    </div>
  );
}

// ─── SHELL ───────────────────────────────────────────────────
function Shell({T, manual, setManual, occ, profile, tab, setTab, notif, events, children}) {
  // Calculate Lumi badge: imminent events or stale scan
  const now = new Date();
  const hasImminentEvent = events?.some(e => {
    const days = Math.ceil((new Date(e.date) - now) / (1000*60*60*24));
    return days >= 0 && days <= 3;
  });
  const lumiHasNews = hasImminentEvent;

  const NAV = [
    {id:"home",icon:"⌂",label:"Home"},
    {id:"scan",icon:"◈",label:"Scan"},
    {id:"looks",icon:"♡",label:"Saved"},
    {id:"lumi",icon:"L",label:"Lumi", special:true, badge: lumiHasNews},
    {id:"profile",icon:"◉",label:"Profile"}
  ];
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:T.bg,fontFamily:FF,maxWidth:480,margin:"0 auto",position:"relative",transition:"background 0.7s"}}>
      <div style={{position:"fixed",inset:0,background:T.heroGlow,pointerEvents:"none",zIndex:0,transition:"background 0.7s"}}/>
      {notif && <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:T.btn,color:T.btnText,padding:"12px 28px",fontSize:11,letterSpacing:3,fontWeight:700,zIndex:1000,whiteSpace:"nowrap",boxShadow:T.shadow}}>{notif}</div>}
      <div style={{position:"sticky",top:0,zIndex:10,background:T.bg,backdropFilter:"blur(20px)",padding:"17px 22px 13px",borderBottom:`1px solid ${T.border}`,transition:"background 0.7s",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:15,letterSpacing:7,color:T.accent,fontWeight:300}}>LUMIÈRE</div>
          <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,marginTop:1}}>Welcome, {profile.name||"Beauty"}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {occ && <div style={{background:T.accentDim,border:`1px solid ${T.accentBorder}`,padding:"4px 10px",fontSize:7,letterSpacing:3,color:T.accent}}>{T.emoji} {T.name.split(" ")[0].toUpperCase()}</div>}
          {!occ && <button style={{background:"transparent",border:`1px solid ${T.border}`,color:T.textMuted,padding:"6px 11px",fontSize:9,cursor:"pointer"}} onClick={()=>setManual(m=>m==="dark"?"light":"dark")}>{manual==="dark"?"☀️ Day":"🌙 Night"}</button>}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",paddingBottom:80,position:"relative",zIndex:1}}>{children}</div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:T.bg,backdropFilter:"blur(20px)",borderTop:`1px solid ${T.border}`,display:"flex",zIndex:10,transition:"background 0.7s"}}>
        {NAV.map(n=>(
          <button key={n.id} style={{flex:1,background:"transparent",border:"none",color:tab===n.id?T.accent:T.textMuted,padding:"10px 0 14px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"color 0.2s",position:"relative"}} onClick={()=>setTab(n.id)}>
            {n.special ? (
              <div style={{position:"relative"}}>
                <div style={{
                  width:26, height:26, borderRadius:"50%",
                  background: tab===n.id ? T.btn : T.accentDim,
                  color: tab===n.id ? T.btnText : T.accent,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, fontWeight:300, fontFamily:FF,
                  border: `1px solid ${tab===n.id ? "transparent" : T.accentBorder}`,
                  boxShadow: tab===n.id ? T.shadowGold : "none",
                  transition:"all 0.2s",
                  marginBottom:1
                }}>{n.icon}</div>
                {n.badge && tab !== n.id && (
                  <div style={{position:"absolute",top:-2,right:-2,width:8,height:8,borderRadius:"50%",background:"#FF4D4D",border:`1.5px solid ${T.bg}`,animation:"pulseBadge 2s infinite"}}/>
                )}
              </div>
            ) : (
              <span style={{fontSize:17}}>{n.icon}</span>
            )}
            <span style={{fontSize:8,letterSpacing:2}}>{n.label}</span>
          </button>
        ))}
      </div>
      <style>{`@keyframes pulseBadge { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }`}</style>
    </div>
  );
}

// ─── SPLASH ──────────────────────────────────────────────────
function Splash({T, go}) {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.bg,position:"relative",overflow:"hidden",fontFamily:FF}}>
      <div style={{position:"absolute",inset:0,background:T.splashGlow,pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"10%",left:"6%",width:1,height:"80%",background:`linear-gradient(to bottom,transparent,${T.accentBorder},transparent)`}}/>
      <div style={{position:"absolute",top:"10%",right:"6%",width:1,height:"80%",background:`linear-gradient(to bottom,transparent,${T.accentBorder},transparent)`}}/>
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 32px",textAlign:"center",maxWidth:420}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
          <div style={{height:1,width:36,background:T.accentBorder}}/><span style={{fontSize:9,letterSpacing:6,color:T.accent}}>EST. 2026</span><div style={{height:1,width:36,background:T.accentBorder}}/>
        </div>
        <div style={{fontSize:52,fontWeight:300,color:T.text,letterSpacing:14,marginBottom:4,lineHeight:1}}>LUMIÈRE</div>
        <div style={{fontSize:8,letterSpacing:8,color:T.accent,marginBottom:54}}>AI BEAUTY COMPANION</div>
        <div style={{fontSize:26,fontWeight:300,color:T.text,lineHeight:1.5,marginBottom:20,letterSpacing:1}}>Your face.<br/>Your tutorial.<br/><span style={{color:T.accent}}>Your glow.</span></div>
        <div style={{fontSize:13,color:T.textMuted,lineHeight:1.8,marginBottom:52,maxWidth:280}}>Personalized AI makeup tutorials with voice guidance — and your own beauty advisor, Lumi, who lives a step ahead. ✨</div>
        <button style={{background:T.btn,color:T.btnText,border:"none",padding:"18px 48px",fontSize:10,letterSpacing:5,fontWeight:700,cursor:"pointer",width:"100%",maxWidth:320,marginBottom:22,boxShadow:T.shadowGold}} onClick={go}>BEGIN YOUR JOURNEY</button>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{height:1,width:20,background:T.accentBorder}}/><span style={{fontSize:8,color:T.textMuted,letterSpacing:3}}>POWERED BY AI</span><div style={{height:1,width:20,background:T.accentBorder}}/>
        </div>
      </div>
    </div>
  );
}

function Onboard({T, profile, setProfile, step, setStep, done}) {
  const STEPS = [
    {q:"What's your name?", f:"name", type:"text", ph:"Your first name"},
    {q:"Your age range?", f:"age", opts:["18-24","25-32","33-40","41-50","50+"]},
    {q:"Your skin type?", f:"skinType", opts:["Oily","Dry","Combination","Normal","Sensitive"]},
    {q:"Your skin tone?", f:"skinTone", opts:["Fair","Light","Medium","Tan","Deep"]},
  ];
  const cur = STEPS[step]; const ok = profile[cur.f];
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.bg,position:"relative",fontFamily:FF}}>
      <div style={{position:"absolute",inset:0,background:T.splashGlow}}/>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:440,padding:"40px 30px"}}>
        <div style={{marginBottom:44}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:8,letterSpacing:4,color:T.accent}}>{step+1} OF {STEPS.length}</span>
            <span style={{fontSize:8,letterSpacing:3,color:T.textMuted}}>PROFILE SETUP</span>
          </div>
          <div style={{height:1,background:T.border,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,height:"100%",width:`${((step+1)/STEPS.length)*100}%`,background:T.accent,transition:"width 0.5s"}}/>
          </div>
        </div>
        <div style={{fontSize:10,letterSpacing:6,color:T.accent,marginBottom:26}}>◆ LUMIÈRE</div>
        <div style={{fontSize:28,fontWeight:300,color:T.text,lineHeight:1.3,marginBottom:34}}>{cur.q}</div>
        {cur.type==="text"
          ? <input style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${T.borderHi}`,color:T.text,fontSize:26,padding:"12px 0",outline:"none",fontFamily:FF,boxSizing:"border-box",caretColor:T.accent}} placeholder={cur.ph} value={profile[cur.f]||""} onChange={e=>setProfile(p=>({...p,[cur.f]:e.target.value}))}/>
          : <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {cur.opts.map(o=>(
              <button key={o} style={{background:profile[cur.f]===o?T.accentDim:"transparent",border:`1px solid ${profile[cur.f]===o?T.accent:T.border}`,color:profile[cur.f]===o?T.accent:T.textSub,padding:"12px 20px",fontSize:13,cursor:"pointer",letterSpacing:1,transition:"all 0.2s",fontFamily:FF}} onClick={()=>setProfile(p=>({...p,[cur.f]:o}))}>{o}</button>
            ))}
          </div>}
        <button style={{marginTop:50,background:ok?T.btn:"transparent",color:ok?T.btnText:T.textMuted,border:ok?"none":`1px solid ${T.border}`,padding:"16px 32px",fontSize:10,letterSpacing:5,fontWeight:700,cursor:ok?"pointer":"default",width:"100%",fontFamily:FF,transition:"all 0.3s"}} onClick={()=>ok&&(step<STEPS.length-1?setStep(s=>s+1):done())}>
          {step<STEPS.length-1?"CONTINUE →":"START MY JOURNEY ◆"}
        </button>
      </div>
    </div>
  );
}

// ─── HOME (with smart upcoming events + scan freshness) ──────
function Home({T, profile, preview, looks, events, setTab, scanHistory}) {
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date(now.toDateString())).slice(0, 2);
  const lastScanDate = scanHistory && scanHistory[0]?.date;
  const daysSinceLastScan = lastScanDate ? Math.floor((now - new Date(lastScanDate)) / (1000*60*60*24)) : null;
  const scanIsStale = daysSinceLastScan !== null && daysSinceLastScan > 30;
  const tips = ["Update your face scan after weight changes for better accuracy ◆","Lumi remembers everything — try planning a wedding 10 days ahead 💬","Day occasions reveal Pearl Morning — warm ivory and espresso ☀️","Save your looks to recreate them before every big occasion 💄"];

  return (
    <div style={{padding:"24px 20px"}}>
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:20,marginBottom:20,display:"flex",gap:16,alignItems:"center",boxShadow:T.shadow}}>
        <div style={{flex:1}}>
          <div style={{fontSize:8,letterSpacing:4,color:T.accent,marginBottom:8}}>YOUR BEAUTY COMPANION</div>
          <div style={{fontSize:21,fontWeight:300,color:T.text,lineHeight:1.45,marginBottom:12}}>Every occasion.<br/>Your face.<br/><span style={{color:T.accent}}>Perfected.</span></div>
          <button style={{background:T.btn,color:T.btnText,border:"none",padding:"11px 18px",fontSize:9,letterSpacing:4,fontWeight:700,cursor:"pointer"}} onClick={()=>setTab("scan")}>GET MY LOOK ◆</button>
        </div>
        <div style={{width:88,flexShrink:0}}>
          {preview ? <img src={preview} style={{width:88,height:108,objectFit:"cover",border:`1px solid ${T.border}`}} alt="You"/>
          : <div style={{width:88,height:108,border:`1px dashed ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,background:T.accentDim}}>
            <div style={{fontSize:26,color:T.accent,opacity:0.35}}>◉</div>
            <div style={{fontSize:6,color:T.textMuted,letterSpacing:1,textAlign:"center"}}>SCAN YOUR<br/>FACE</div>
          </div>}
        </div>
      </div>

      {/* Stale scan warning */}
      {scanIsStale && (
        <button onClick={()=>setTab("scan")} style={{width:"100%",background:T.accentDim,border:`1px solid ${T.accent}`,padding:"12px 14px",marginBottom:18,display:"flex",gap:10,alignItems:"center",cursor:"pointer",fontFamily:FF,textAlign:"left"}}>
          <div style={{fontSize:18}}>💡</div>
          <div style={{flex:1}}>
            <div style={{fontSize:9,letterSpacing:2,color:T.accent,marginBottom:2}}>SCAN REFRESH SUGGESTED</div>
            <div style={{fontSize:10,color:T.textSub}}>Last scan was {daysSinceLastScan} days ago. Skin and features change — refresh for accuracy.</div>
          </div>
          <div style={{fontSize:14,color:T.accent}}>→</div>
        </button>
      )}

      {upcomingEvents.length > 0 && (
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <div style={{fontSize:8,letterSpacing:4,color:T.accent}}>📅 UPCOMING EVENTS</div>
            <button onClick={()=>setTab("lumi")} style={{background:"transparent",border:"none",color:T.textMuted,fontSize:8,letterSpacing:2,cursor:"pointer"}}>VIEW ALL →</button>
          </div>
          {upcomingEvents.map(e => {
            const occInfo = OCCS.find(o => o.id === e.occasion);
            const daysAway = Math.ceil((new Date(e.date) - now) / (1000*60*60*24));
            return (
              <button key={e.id} onClick={()=>setTab("lumi")} style={{width:"100%",background:T.bgCard,border:`1px solid ${T.border}`,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontFamily:FF,textAlign:"left"}}>
                <div style={{fontSize:20}}>{occInfo?.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:T.text,marginBottom:2}}>{e.title}</div>
                  <div style={{fontSize:8,color:T.accent,letterSpacing:2}}>
                    {daysAway === 0 ? "TODAY" : daysAway === 1 ? "TOMORROW" : `IN ${daysAway} DAYS`} · {e.glam.toUpperCase()} GLAM
                  </div>
                  {(e.dress || e.hair) && <div style={{fontSize:7,color:T.textMuted,marginTop:2}}>{e.dress?'👗 '+e.dress.slice(0,20):'No dress yet'}{e.hair?' · 💁 '+e.hair.slice(0,15):''}</div>}
                </div>
                <div style={{fontSize:7,color:T.textMuted}}>{formatDate(e.date)}</div>
              </button>
            );
          })}
          <div style={{marginBottom:20}}/>
        </>
      )}

      <div style={{background:T.accentDim,border:`1px solid ${T.accentBorder}`,padding:"13px 15px",marginBottom:20,display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:T.btn,color:T.btnText,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:300,fontFamily:FF,flexShrink:0,boxShadow:T.shadowGold}}>L</div>
        <div style={{flex:1}}>
          <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:3}}>LUMI ✨ — A STEP AHEAD</div>
          <div style={{fontSize:11,color:T.textSub,lineHeight:1.65,marginBottom:8}}>Plan looks 10 days in advance. Lumi remembers your dress, hair, and makeup decisions and reminds you when events approach.</div>
          <button onClick={()=>setTab("lumi")} style={{background:"transparent",border:`1px solid ${T.accent}`,color:T.accent,fontSize:8,letterSpacing:3,padding:"6px 12px",cursor:"pointer",fontFamily:FF}}>CHAT WITH LUMI →</button>
        </div>
      </div>

      <div style={{fontSize:8,letterSpacing:4,color:T.accent,marginBottom:9}}>☀️ DAY OCCASIONS → PEARL MORNING</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
        {OCCS.filter(o=>o.t==="light").map(o=>(
          <button key={o.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:"12px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:9}} onClick={()=>setTab("scan")}>
            <span style={{fontSize:18}}>{o.icon}</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:10,color:T.text,letterSpacing:1}}>{o.label}</div>
              <div style={{fontSize:7,color:T.textMuted,marginTop:2}}>Pearl Morning</div>
            </div>
          </button>
        ))}
      </div>
      <div style={{fontSize:8,letterSpacing:4,color:T.accent,marginBottom:9}}>🌙 NIGHT OCCASIONS → MIDNIGHT ATELIER</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {OCCS.filter(o=>o.t==="dark").map(o=>(
          <button key={o.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:"12px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:9}} onClick={()=>setTab("scan")}>
            <span style={{fontSize:18}}>{o.icon}</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:10,color:T.text,letterSpacing:1}}>{o.label}</div>
              <div style={{fontSize:7,color:T.textMuted,marginTop:2}}>Midnight Atelier</div>
            </div>
          </button>
        ))}
      </div>
      <div style={{fontSize:8,letterSpacing:4,color:T.accent,marginBottom:9}}>TODAY'S TIP</div>
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:"14px 16px",display:"flex",gap:11,marginBottom:20}}>
        <div style={{fontSize:12,color:T.accent,marginTop:2}}>◆</div>
        <div style={{fontSize:13,color:T.text,lineHeight:1.7,fontStyle:"italic"}}>{tips[new Date().getDay()%tips.length]}</div>
      </div>
      {looks.length>0 && <>
        <div style={{fontSize:8,letterSpacing:4,color:T.accent,marginBottom:9}}>RECENT LOOKS</div>
        {looks.slice(0,2).map(l=>(
          <div key={l.id} style={{display:"flex",gap:12,background:T.bgCard,border:`1px solid ${T.border}`,padding:12,marginBottom:8,alignItems:"center"}}>
            {l.preview && <img src={l.preview} style={{width:52,height:64,objectFit:"cover"}} alt={l.lookName}/>}
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:T.text,marginBottom:3}}>{l.lookName}</div>
              <div style={{fontSize:9,color:T.accent,letterSpacing:1,marginBottom:2}}>{l.occasion}</div>
              <div style={{fontSize:8,color:T.textMuted}}>{l.date} · {l.glam} glam</div>
            </div>
            <div style={{fontSize:14}}>{l.dk==="dark"?"🌙":"☀️"}</div>
          </div>
        ))}
      </>}
    </div>
  );
}



function FaceDNACard({ T, profile, occ, glam, hasFullScan }) {
  const dna = createFaceDNA({ profile, occ, glam, hasFullScan });

  return (
    <div style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:15,marginTop:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:12}}>
        <div>
          <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:5}}>FACE DNA ENGINE</div>
          <div style={{fontSize:15,color:T.text,fontWeight:300,letterSpacing:1}}>Structured Beauty Analysis</div>
        </div>
        <div style={{fontSize:20}}>🧬</div>
      </div>

      <div style={{
        background: hasFullScan ? T.accentDim : "rgba(255,80,80,0.08)",
        border:`1px solid ${hasFullScan ? T.accentBorder : "rgba(255,80,80,0.25)"}`,
        padding:10,
        marginBottom:12,
        fontSize:9,
        color:T.textSub,
        lineHeight:1.6
      }}>
        <span style={{color:T.accent}}>Scan Status:</span> {dna.scanQuality}. Lumière uses all angles to build a non-generic facial profile before creating the final tutorial.
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {Object.entries(dna.knownProfile).map(([key, value]) => (
          <div key={key} style={{background:T.accentDim,border:`1px solid ${T.border}`,padding:9}}>
            <div style={{fontSize:7,letterSpacing:2,color:T.accent,marginBottom:4,textTransform:"uppercase"}}>{key}</div>
            <div style={{fontSize:10,color:T.text}}>{value || "Not selected"}</div>
          </div>
        ))}
      </div>

      <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:8}}>4 PERSONALIZED OUTCOMES</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {FACE_DNA_OUTCOMES.map(item => (
          <div key={item.id} style={{background:T.bgDeep,border:`1px solid ${T.border}`,padding:10}}>
            <div style={{fontSize:17,marginBottom:5}}>{item.icon}</div>
            <div style={{fontSize:10,color:T.text,marginBottom:5}}>{item.title}</div>
            <div style={{fontSize:8,color:T.textMuted,lineHeight:1.5}}>{item.purpose}</div>
          </div>
        ))}
      </div>

      <div style={{borderTop:`1px solid ${T.border}`,marginTop:12,paddingTop:10,fontSize:9,color:T.textMuted,lineHeight:1.6}}>
        <span style={{color:T.accent}}>Accuracy Rule:</span> If any angle is missing, Lumière should label the result as estimated rather than claiming perfect accuracy.
      </div>
    </div>
  );
}


function SmartPaletteCard({ T, occ, glam, profile }) {
  if (!occ) {
    return (
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:14,marginTop:18}}>
        <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:7}}>STEP 4 — SMART PALETTE</div>
        <div style={{fontSize:11,color:T.text,marginBottom:4}}>Choose an occasion to unlock your palette.</div>
        <div style={{fontSize:9,color:T.textMuted,lineHeight:1.6}}>Lumière will suggest lipstick, eyeshadow, blush, highlighter, and five signature shades.</div>
      </div>
    );
  }

  const palette = PALETTE_LIBRARY[occ] || PALETTE_LIBRARY.daily;
  const toneTip = SKIN_TONE_TIPS[profile?.skinTone] || "These shades are selected to stay wearable, balanced, and camera-friendly.";

  return (
    <div style={{background:T.bgCard,border:`1px solid ${T.accentBorder}`,padding:15,marginTop:18,boxShadow:T.shadowGold}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:12}}>
        <div>
          <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:5}}>STEP 4 — SMART PALETTE</div>
          <div style={{fontSize:15,color:T.text,fontWeight:300,letterSpacing:1}}>{palette.title}</div>
        </div>
        <div style={{fontSize:20}}>🎨</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7,marginBottom:13}}>
        {palette.shades.map(shade => (
          <div key={shade} style={{textAlign:"center"}}>
            <div style={{
              width:"100%",
              aspectRatio:"1",
              background:SHADE_COLORS[shade] || T.accent,
              border:`1px solid ${T.border}`,
              boxShadow:"0 4px 14px rgba(0,0,0,0.15)"
            }}/>
            <div style={{fontSize:7,color:T.textSub,marginTop:5,lineHeight:1.2}}>{shade}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <div style={{background:T.accentDim,border:`1px solid ${T.border}`,padding:10}}>
          <div style={{fontSize:7,letterSpacing:2,color:T.accent,marginBottom:4}}>LIPSTICK</div>
          <div style={{fontSize:9,color:T.textSub,lineHeight:1.45}}>{palette.lipstick}</div>
        </div>
        <div style={{background:T.accentDim,border:`1px solid ${T.border}`,padding:10}}>
          <div style={{fontSize:7,letterSpacing:2,color:T.accent,marginBottom:4}}>EYES</div>
          <div style={{fontSize:9,color:T.textSub,lineHeight:1.45}}>{palette.eyeshadow}</div>
        </div>
        <div style={{background:T.accentDim,border:`1px solid ${T.border}`,padding:10}}>
          <div style={{fontSize:7,letterSpacing:2,color:T.accent,marginBottom:4}}>BLUSH</div>
          <div style={{fontSize:9,color:T.textSub,lineHeight:1.45}}>{palette.blush}</div>
        </div>
        <div style={{background:T.accentDim,border:`1px solid ${T.border}`,padding:10}}>
          <div style={{fontSize:7,letterSpacing:2,color:T.accent,marginBottom:4}}>HIGHLIGHT</div>
          <div style={{fontSize:9,color:T.textSub,lineHeight:1.45}}>{palette.highlighter}</div>
        </div>
      </div>

      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10,fontSize:9,color:T.textMuted,lineHeight:1.6}}>
        <span style={{color:T.accent}}>Lumi Tip:</span> {toneTip}
        <br/>
        <span style={{color:T.accent}}>Glam Level:</span> {glam === "full" ? "Make the eyes deeper and lips more defined." : glam === "casual" ? "Keep the finish soft, fresh, and wearable." : "Balance polish with visible glow."}
      </div>
    </div>
  );
}


// ─── SCAN TAB ────────────────────────────────────────────────
function Scan({T, scans, hasFullScan, primaryFace, startCamera, resetScan, glam, setGlam, occ, setOcc, analyze, loading, profile}) {
  const ok = hasFullScan && occ && !loading;
  return (
    <div style={{padding:"24px 20px"}}>
      <div style={{fontSize:17,fontWeight:300,color:T.text,letterSpacing:3,marginBottom:3}}>CREATE YOUR LOOK</div>
      <div style={{fontSize:10,color:T.textMuted,marginBottom:14,letterSpacing:1}}>Scan · Occasion · Glam · Generate</div>
      {occ && <div style={{background:T.accentDim,border:`1px solid ${T.accentBorder}`,padding:"9px 13px",marginBottom:14,display:"flex",alignItems:"center",gap:9}}>
        <span style={{fontSize:14}}>{T.emoji}</span>
        <div>
          <div style={{fontSize:8,letterSpacing:3,color:T.accent}}>{T.name.toUpperCase()} ACTIVE</div>
          <div style={{fontSize:9,color:T.textMuted}}>Theme matched to {OCCS.find(o=>o.id===occ)?.label}</div>
        </div>
      </div>}
      <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:8}}>STEP 1 — YOUR FACE SCAN</div>
      {!hasFullScan ? (
        <button onClick={startCamera} style={{width:"100%", background:T.bgCard, border:`1px dashed ${T.borderHi}`, padding:"24px 16px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:10, fontFamily:FF, transition:"all 0.2s"}}>
          <div style={{fontSize:36,color:T.accent,opacity:0.7}}>📷</div>
          <div style={{fontSize:11,letterSpacing:3,color:T.text}}>START 5-ANGLE FACE SCAN</div>
          <div style={{fontSize:9,color:T.textMuted,letterSpacing:1,textAlign:"center",lineHeight:1.5,maxWidth:240}}>Front · Left · Right · Up · Down<br/>Full 360° AI analysis for perfect makeup</div>
          {Object.keys(scans).length > 0 && <div style={{fontSize:8,color:T.accent,letterSpacing:2,marginTop:4}}>{Object.keys(scans).length} OF 5 CAPTURED · TAP TO CONTINUE</div>}
        </button>
      ) : (
        <div style={{background:T.bgCard,border:`1px solid ${T.accentBorder}`,padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{fontSize:14,color:T.accent}}>✓</div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,letterSpacing:2,color:T.accent}}>FACE SCAN COMPLETE</div>
              <div style={{fontSize:9,color:T.textMuted,marginTop:2}}>5 angles · Full 360° analysis ready</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:12}}>
            {SCAN_ANGLES.map(a => (
              <div key={a.id} style={{position:"relative",aspectRatio:"1",overflow:"hidden",border:`1px solid ${T.border}`}}>
                <img src={scans[a.id]} alt={a.id} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.6)",padding:"3px",textAlign:"center"}}>
                  <span style={{fontSize:7,color:"#fff",letterSpacing:1}}>{a.id.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={startCamera} style={{flex:1,background:"transparent",border:`1px solid ${T.border}`,color:T.text,padding:"9px",fontSize:8,letterSpacing:3,cursor:"pointer",fontFamily:FF}}>↻ RESCAN</button>
            <button onClick={resetScan} style={{flex:1,background:"transparent",border:`1px solid ${T.border}`,color:T.textMuted,padding:"9px",fontSize:8,letterSpacing:3,cursor:"pointer",fontFamily:FF}}>✕ CLEAR</button>
          </div>
        </div>
      )}
      <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:8,marginTop:20}}>STEP 2 — YOUR OCCASION</div>
      <div style={{fontSize:7,letterSpacing:3,color:T.textMuted,marginBottom:7}}>☀️ DAY — Pearl Morning</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
        {OCCS.filter(o=>o.t==="light").map(o=>(
          <button key={o.id} style={{background:occ===o.id?T.accentDim:T.bgCard,border:`1px solid ${occ===o.id?T.accent:T.border}`,padding:"10px 9px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.2s"}} onClick={()=>setOcc(o.id)}>
            <span style={{fontSize:17}}>{o.icon}</span>
            <div style={{fontSize:9,color:occ===o.id?T.accent:T.text,letterSpacing:1}}>{o.label}</div>
          </button>
        ))}
      </div>
      <div style={{fontSize:7,letterSpacing:3,color:T.textMuted,marginBottom:7}}>🌙 NIGHT — Midnight Atelier</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:4}}>
        {OCCS.filter(o=>o.t==="dark").map(o=>(
          <button key={o.id} style={{background:occ===o.id?T.accentDim:T.bgCard,border:`1px solid ${occ===o.id?T.accent:T.border}`,padding:"10px 9px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.2s"}} onClick={()=>setOcc(o.id)}>
            <span style={{fontSize:17}}>{o.icon}</span>
            <div style={{fontSize:9,color:occ===o.id?T.accent:T.text,letterSpacing:1}}>{o.label}</div>
          </button>
        ))}
      </div>
      <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:8,marginTop:20}}>STEP 3 — GLAM INTENSITY</div>
      <div style={{display:"flex",gap:7,marginBottom:4}}>
        {GLAM.map(g=>(
          <button key={g.id} style={{flex:1,background:glam===g.id?T.accentDim:T.bgCard,border:`1px solid ${glam===g.id?T.accent:T.border}`,padding:"13px 5px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,transition:"all 0.2s"}} onClick={()=>setGlam(g.id)}>
            <div style={{display:"flex",gap:3}}>
              {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:i<g.dot?T.accent:T.border,transition:"background 0.2s"}}/>)}
            </div>
            <div style={{fontSize:8,letterSpacing:2,color:glam===g.id?T.accent:T.text}}>{g.label}</div>
            <div style={{fontSize:7,color:T.textMuted,letterSpacing:1,textAlign:"center"}}>{g.sub}</div>
          </button>
        ))}
      </div>
      <FaceDNACard T={T} profile={profile} occ={occ} glam={glam} hasFullScan={hasFullScan}/>

      <SmartPaletteCard T={T} occ={occ} glam={glam} profile={profile}/>

      <button style={{width:"100%",background:ok?T.btn:"transparent",color:ok?T.btnText:T.textMuted,border:ok?"none":`1px solid ${T.border}`,padding:"17px",fontSize:10,letterSpacing:5,fontWeight:700,cursor:ok?"pointer":"default",marginTop:22,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.3s",boxShadow:ok?T.shadowGold:"none"}} onClick={ok?analyze:undefined} disabled={!ok}>
        {loading?"◆ ANALYZING ALL 5 ANGLES...":"◆ GENERATE MY TUTORIAL"}
      </button>
      {(!hasFullScan || !occ) && <div style={{textAlign:"center",fontSize:8,color:T.textMuted,marginTop:8,letterSpacing:2}}>{!hasFullScan?"Complete face scan to continue":"Select an occasion to continue"}</div>}
    </div>
  );
}


function AIFaceAnalysisCard({ T, result }) {
  if (!result?.faceDNA) return null;

  const dna = result.faceDNA;
  const placement = dna.placementMap || {};
  const palette = Array.isArray(dna.paletteFamily) ? dna.paletteFamily : [];
  const orientation = dna.orientation || {};
  const orientationRows = [
    ["Front", orientation.front],
    ["Left", orientation.left],
    ["Right", orientation.right],
    ["Chin Up", orientation.up],
    ["Chin Down", orientation.down],
  ].filter(([, value]) => value);

  return (
    <div style={{background:T.bgCard,border:`1px solid ${T.accentBorder}`,padding:16,margin:"18px 0",boxShadow:T.shadowGold}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:14}}>
        <div>
          <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:5}}>AI FACE ANALYSIS</div>
          <div style={{fontSize:18,color:T.text,fontWeight:300,letterSpacing:1}}>Your Face DNA Results</div>
        </div>
        <div style={{fontSize:24}}>🧬</div>
      </div>

      {dna.scanQuality && (
        <div style={{background:T.accentDim,border:`1px solid ${T.border}`,padding:10,marginBottom:12,fontSize:10,color:T.textSub,lineHeight:1.6}}>
          <span style={{color:T.accent}}>Scan Quality:</span> {dna.scanQuality}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <MiniInsight T={T} label="Face Shape" value={dna.faceShape?.value} sub={dna.faceShape?.confidence} />
        <MiniInsight T={T} label="Eyes" value={dna.eyeStructure?.value} sub={dna.eyeStructure?.makeupImplication} />
        <MiniInsight T={T} label="Brows" value={dna.browStructure?.value} sub={dna.browStructure?.makeupImplication} />
        <MiniInsight T={T} label="Lips" value={dna.lipStructure?.value} sub={dna.lipStructure?.makeupImplication} />
        <MiniInsight T={T} label="Skin Depth" value={dna.skinTone?.depth} sub={`Undertone: ${dna.skinTone?.undertone || "Not clear"}`} />
        <MiniInsight T={T} label="Skin Confidence" value={dna.skinTone?.confidence} sub="Lighting can affect undertone." />
      </div>

      {dna.faceShape?.reason && (
        <div style={{background:T.bgDeep,border:`1px solid ${T.border}`,padding:12,marginBottom:12,fontSize:10,color:T.textSub,lineHeight:1.7}}>
          <span style={{color:T.accent}}>Why:</span> {dna.faceShape.reason}
        </div>
      )}

      {orientationRows.length > 0 && (
        <>
          <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:8}}>ANGLE-BY-ANGLE NOTES</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginBottom:12}}>
            {orientationRows.map(([label, value]) => (
              <MiniInsight key={label} T={T} label={label} value={value} />
            ))}
          </div>
        </>
      )}

      <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:8}}>PLACEMENT MAP</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <MiniInsight T={T} label="Contour" value={placement.contour} />
        <MiniInsight T={T} label="Blush" value={placement.blush} />
        <MiniInsight T={T} label="Highlight" value={placement.highlight} />
        <MiniInsight T={T} label="Eyeshadow" value={placement.eyeshadow} />
        <MiniInsight T={T} label="Brows" value={placement.brows} />
        <MiniInsight T={T} label="Lips" value={placement.lips} />
      </div>

      {palette.length > 0 && (
        <>
          <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:8}}>AI PALETTE FAMILY</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
            {palette.map((p, i) => (
              <span key={i} style={{background:T.accentDim,border:`1px solid ${T.accentBorder}`,color:T.textSub,fontSize:9,padding:"7px 10px"}}>
                {p}
              </span>
            ))}
          </div>
        </>
      )}

      {result.fourOutcomes && (
        <>
          <div style={{fontSize:8,letterSpacing:3,color:T.accent,marginBottom:8}}>4 AI OUTCOMES</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8}}>
            <OutcomeLine T={T} title="Natural Enhancement" text={result.fourOutcomes.naturalEnhancement} />
            <OutcomeLine T={T} title="Occasion Optimized" text={result.fourOutcomes.occasionOptimized} />
            <OutcomeLine T={T} title="Feature Highlight" text={result.fourOutcomes.featureHighlight} />
            <OutcomeLine T={T} title="Future Trend" text={result.fourOutcomes.futureTrend} />
          </div>
        </>
      )}
    </div>
  );
}

function MiniInsight({ T, label, value, sub }) {
  return (
    <div style={{background:T.accentDim,border:`1px solid ${T.border}`,padding:10,minHeight:58}}>
      <div style={{fontSize:7,letterSpacing:2,color:T.accent,marginBottom:5,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:10,color:T.text,lineHeight:1.4}}>{value || "Not available"}</div>
      {sub && <div style={{fontSize:8,color:T.textMuted,lineHeight:1.45,marginTop:4}}>{sub}</div>}
    </div>
  );
}

function OutcomeLine({ T, title, text }) {
  if (!text) return null;
  return (
    <div style={{background:T.bgDeep,border:`1px solid ${T.border}`,padding:10}}>
      <div style={{fontSize:9,color:T.accent,letterSpacing:2,marginBottom:5,textTransform:"uppercase"}}>{title}</div>
      <div style={{fontSize:10,color:T.textSub,lineHeight:1.65}}>{text}</div>
    </div>
  );
}


function Results({T, result, preview, occ, glam, onSave, onBack, onNew, onPlay}) {
  result = normalizeAnalysis(result);
  const [step, setStep] = useState(0);
  if (!result) return null;
  const steps = Object.values(result.tutorial);
  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:FF,transition:"background 0.7s"}}>
      <div style={{position:"fixed",inset:0,background:T.heroGlow,pointerEvents:"none"}}/>
      <div style={{position:"sticky",top:0,zIndex:10,background:T.bg,backdropFilter:"blur(20px)",padding:"16px 20px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"background 0.7s"}}>
        <button style={{background:"transparent",border:"none",color:T.textMuted,fontSize:10,letterSpacing:2,cursor:"pointer"}} onClick={onBack}>← BACK</button>
        <div style={{fontSize:11,letterSpacing:5,color:T.accent}}>◆ YOUR LOOK</div>
        <button style={{background:"transparent",border:"none",color:T.accent,fontSize:10,letterSpacing:2,cursor:"pointer"}} onClick={onSave}>SAVE ♡</button>
      </div>
      <div style={{padding:"18px 20px 40px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
          <div style={{background:T.accentDim,border:`1px solid ${T.accentBorder}`,padding:"4px 11px",fontSize:7,letterSpacing:3,color:T.accent}}>{T.emoji} {T.name.toUpperCase()}</div>
        </div>
        <div style={{display:"flex",gap:14,marginBottom:18}}>
          {preview && <img src={preview} style={{width:86,height:105,objectFit:"cover",border:`1px solid ${T.border}`,flexShrink:0}} alt="Face"/>}
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:7}}>
            <div style={{fontSize:17,color:T.text,fontWeight:300,lineHeight:1.3}}>{result.lookName}</div>
            <div style={{fontSize:11,color:T.accent,letterSpacing:2}}>{occ?.icon} {occ?.label}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {[result.faceShape,result.skinTone,`${glam} glam`,result.time,result.level].filter(Boolean).map((v,i)=>(
                <span key={i} style={{fontSize:7,color:T.textMuted,border:`1px solid ${T.border}`,padding:"2px 7px",letterSpacing:1,textTransform:"capitalize"}}>{v}</span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={onPlay} style={{width:"100%",background:T.btn,color:T.btnText,border:"none",padding:"16px",fontSize:11,letterSpacing:4,fontWeight:700,cursor:"pointer",marginBottom:18,boxShadow:T.shadowGold,display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:FF}}>
          <span style={{fontSize:16}}>🎬</span> WATCH GUIDED TUTORIAL
        </button>
        <AIFaceAnalysisCard T={T} result={result}/>
        <div style={{fontSize:8,letterSpacing:4,color:T.accent,marginBottom:10}}>STEP-BY-STEP TUTORIAL</div>
        <div style={{display:"flex",gap:5,marginBottom:11,flexWrap:"wrap"}}>
          {steps.map((_,i)=><button key={i} style={{width:30,height:30,background:step===i?T.accentDim:T.bgCard,border:`1px solid ${step===i?T.accent:T.border}`,color:step===i?T.accent:T.textMuted,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}} onClick={()=>setStep(i)}>{i+1}</button>)}
        </div>
        <div style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:17,marginBottom:17}}>
          <div style={{fontSize:7,letterSpacing:3,color:T.accent,marginBottom:6}}>STEP {step+1} OF {steps.length}</div>
          <div style={{fontSize:15,color:T.text,marginBottom:10}}>{steps[step].title}</div>
          <div style={{fontSize:13,color:T.textSub,lineHeight:1.8}}>{steps[step].instruction}</div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:15}}>
            <button style={{background:"transparent",border:`1px solid ${T.border}`,color:T.textMuted,padding:"7px 13px",fontSize:8,letterSpacing:2,cursor:"pointer"}} onClick={()=>setStep(p=>Math.max(0,p-1))} disabled={step===0}>← PREV</button>
            <button style={{background:"transparent",border:`1px solid ${T.border}`,color:T.textMuted,padding:"7px 13px",fontSize:8,letterSpacing:2,cursor:"pointer"}} onClick={()=>setStep(p=>Math.min(steps.length-1,p+1))} disabled={step===steps.length-1}>NEXT →</button>
          </div>
        </div>
        <div style={{fontSize:8,letterSpacing:4,color:T.accent,marginBottom:10}}>RECOMMENDED PRODUCTS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:17}}>
          {result.products?.map((p,i)=>(
            <div key={i} style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:13}}>
              <div style={{fontSize:8,color:T.accent,marginBottom:5}}>◆</div>
              <div style={{fontSize:11,color:T.text,marginBottom:3}}>{p.name}</div>
              <div style={{fontSize:9,color:T.accent,marginBottom:4}}>{p.shade}</div>
              <div style={{fontSize:8,color:T.textMuted,lineHeight:1.5}}>{p.why}</div>
            </div>
          ))}
        </div>
        <div style={{background:T.accentDim,border:`1px solid ${T.accentBorder}`,padding:"15px 17px",marginBottom:22}}>
          <div style={{fontSize:15,color:T.accent,marginBottom:5}}>★</div>
          <div style={{fontSize:8,letterSpacing:4,color:T.accent,marginBottom:7}}>PRO TIP FOR YOUR FACE</div>
          <div style={{fontSize:13,color:T.text,lineHeight:1.75,fontStyle:"italic"}}>{result.proTip}</div>
        </div>
        <div style={{display:"flex",gap:9}}>
          <button style={{flex:1,background:T.btn,color:T.btnText,border:"none",padding:"15px",fontSize:8,letterSpacing:3,fontWeight:700,cursor:"pointer",boxShadow:T.shadowGold}} onClick={onSave}>♡ SAVE THIS LOOK</button>
          <button style={{flex:1,background:"transparent",border:`1px solid ${T.border}`,color:T.textMuted,padding:"15px",fontSize:8,letterSpacing:3,cursor:"pointer"}} onClick={onNew}>◆ NEW LOOK</button>
        </div>
      </div>
    </div>
  );
}

function Looks({T, looks}) {
  if (!looks.length) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,gap:11,padding:20}}>
      <div style={{fontSize:46,color:T.accent,opacity:0.22}}>♡</div>
      <div style={{fontSize:15,color:T.text,fontWeight:300}}>No saved looks yet</div>
      <div style={{fontSize:11,color:T.textMuted,textAlign:"center"}}>Generate your first look and save it here</div>
    </div>
  );
  return (
    <div style={{padding:"24px 20px"}}>
      <div style={{fontSize:17,fontWeight:300,color:T.text,letterSpacing:3,marginBottom:3}}>SAVED LOOKS</div>
      <div style={{fontSize:10,color:T.textMuted,marginBottom:18}}>Your personal beauty archive</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
        {looks.map(l=>(
          <div key={l.id} style={{position:"relative",overflow:"hidden",aspectRatio:"3/4",background:T.bgCard,border:`1px solid ${T.border}`}}>
            {l.preview && <img src={l.preview} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={l.lookName}/>
            }
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.88) 0%,transparent 55%)",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:11}}>
              <div style={{fontSize:10,marginBottom:3}}>{l.dk==="dark"?"🌙":"☀️"}</div>
              <div style={{fontSize:11,color:"#fff",marginBottom:2}}>{l.lookName}</div>
              <div style={{fontSize:8,color:"rgba(255,255,255,0.55)",letterSpacing:1,marginBottom:1}}>{l.occasion}</div>
              <div style={{fontSize:7,color:"rgba(255,255,255,0.38)"}}>{l.glam} glam · {l.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE (with scan history!) ────────────────────────────
function Profile({T, profile, preview, hasFullScan, startCamera, scanHistory, events}) {
  const lastScanDate = scanHistory && scanHistory[0]?.date;
  const daysSinceLastScan = lastScanDate ? Math.floor((new Date() - new Date(lastScanDate)) / (1000*60*60*24)) : null;
  return (
    <div style={{padding:"24px 20px"}}>
      <div style={{fontSize:17,fontWeight:300,color:T.text,letterSpacing:3,marginBottom:18}}>MY PROFILE</div>
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:"26px 20px",marginBottom:18,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{position:"relative",marginBottom:13}}>
          {preview ? <img src={preview} style={{width:92,height:112,objectFit:"cover",border:`2px solid ${T.border}`}} alt="Your face"/>
          : <div style={{width:92,height:112,border:`2px dashed ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.accent,opacity:0.32,background:T.accentDim,fontSize:34}}>◉</div>}
          <div style={{position:"absolute",bottom:-7,right:-7,background:T.btn,color:T.btnText,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9}}>◆</div>
        </div>
        <div style={{fontSize:21,fontWeight:300,color:T.text,letterSpacing:4,marginBottom:3}}>{profile.name||"Beauty"}</div>
        <div style={{fontSize:7,color:T.accent,letterSpacing:5,marginBottom:16}}>LUMIÈRE MEMBER</div>
        <div style={{display:"flex",gap:10}}>
          <div style={{textAlign:"center",padding:"7px 13px",background:DARK.bgCard,border:`1px solid ${DARK.accentBorder}`}}>
            <div style={{fontSize:10,marginBottom:2}}>🌙</div>
            <div style={{fontSize:6,letterSpacing:2,color:DARK.accent}}>MIDNIGHT</div>
            <div style={{fontSize:6,color:DARK.textMuted}}>Evening</div>
          </div>
          <div style={{textAlign:"center",padding:"7px 13px",background:LIGHT.bgCard,border:`1px solid ${LIGHT.accentBorder}`}}>
            <div style={{fontSize:10,marginBottom:2}}>☀️</div>
            <div style={{fontSize:6,letterSpacing:2,color:LIGHT.accent}}>PEARL</div>
            <div style={{fontSize:6,color:LIGHT.textMuted}}>Daytime</div>
          </div>
        </div>
      </div>

      {/* Stats: scans, events, looks */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
        <div style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:"12px 8px",textAlign:"center"}}>
          <div style={{fontSize:18,color:T.accent,fontWeight:300}}>{scanHistory?.length || 0}</div>
          <div style={{fontSize:7,color:T.textMuted,letterSpacing:2,marginTop:2}}>SCANS</div>
        </div>
        <div style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:"12px 8px",textAlign:"center"}}>
          <div style={{fontSize:18,color:T.accent,fontWeight:300}}>{events?.length || 0}</div>
          <div style={{fontSize:7,color:T.textMuted,letterSpacing:2,marginTop:2}}>EVENTS</div>
        </div>
        <div style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:"12px 8px",textAlign:"center"}}>
          <div style={{fontSize:18,color:T.accent,fontWeight:300}}>{daysSinceLastScan !== null ? daysSinceLastScan + 'd' : '—'}</div>
          <div style={{fontSize:7,color:T.textMuted,letterSpacing:2,marginTop:2}}>SINCE SCAN</div>
        </div>
      </div>

      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,marginBottom:18}}>
        {[["Age Range",profile.age],["Skin Type",profile.skinType],["Skin Tone",profile.skinTone],["Face Scan",hasFullScan?"5 angles · Complete":"Not yet scanned"]].map(([l,v],i,arr)=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 15px",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
            <div style={{fontSize:8,color:T.textMuted,letterSpacing:2}}>{l}</div>
            <div style={{fontSize:12,color:T.text,textTransform:"capitalize"}}>{v||"Not set"}</div>
          </div>
        ))}
      </div>

      {/* Scan history timeline */}
      {scanHistory && scanHistory.length > 0 && (
        <>
          <div style={{fontSize:8,letterSpacing:4,color:T.accent,marginBottom:9}}>SCAN HISTORY</div>
          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,padding:"4px 0",marginBottom:18,maxHeight:240,overflowY:"auto"}}>
            {scanHistory.map((s, i) => {
              const date = new Date(s.date);
              const daysAgo = Math.floor((new Date() - date) / (1000*60*60*24));
              return (
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom: i < scanHistory.length-1 ? `1px solid ${T.border}` : "none"}}>
                  {s.primaryFace && <img src={s.primaryFace} style={{width:36,height:44,objectFit:"cover",border:`1px solid ${T.border}`}}/>}
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:T.text,marginBottom:2}}>{i === 0 ? "Latest scan" : `Scan #${scanHistory.length - i}`}</div>
                    <div style={{fontSize:8,color:T.textMuted,letterSpacing:1}}>
                      {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`} · {date.toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{fontSize:7,color:T.accent,textTransform:"capitalize"}}>{s.analysis?.faceShape}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <button style={{width:"100%",background:hasFullScan?"transparent":T.btn,color:hasFullScan?T.text:T.btnText,border:hasFullScan?`1px solid ${T.borderHi}`:"none",padding:"14px",fontSize:9,letterSpacing:4,cursor:"pointer",marginBottom:7,fontFamily:FF,fontWeight:hasFullScan?400:700}} onClick={startCamera}>
        {hasFullScan ? "◈ UPDATE FACE SCAN" : "📷 START FACE SCAN"}
      </button>
      <div style={{fontSize:8,color:T.textMuted,textAlign:"center",letterSpacing:1,marginBottom:18,lineHeight:1.7}}>Update after weight changes or seasonally for best results</div>
      <div style={{display:"flex",gap:11,alignItems:"flex-start",background:T.accentDim,border:`1px solid ${T.accentBorder}`,padding:13}}>
        <div style={{fontSize:13,flexShrink:0}}>🔒</div>
        <div style={{fontSize:10,color:T.textMuted,lineHeight:1.6}}>Your face scan is stored securely on your device and never shared without your explicit consent.</div>
      </div>
    </div>
  );
}
