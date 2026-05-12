import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowDown, Star, Trophy, Share2, Home, Zap, Play } from "lucide-react";
import html2canvas from "html2canvas";

// --- CONFIGURATION ---
const API_BASE_URL = "https://oyster-app-98e3g.ondigitalocean.app";

// --- AESTHETIC COMPONENTS ---

// Animated Lines Background
const AbstractLines = ({ color = "#fff", opacity = 0.3 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(3)].map((_, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 100 100"
          className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
          style={{ opacity: 0.15 }}
        >
          <motion.path
            d={`M -20 ${50 + i * 10} Q 50 ${20 - i * 10} 120 ${50 + i * 10}`}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{ 
              pathLength: [0, 1, 1], 
              pathOffset: [0, 0, 1] 
            }}
            transition={{ 
              duration: 4 + i, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 1
            }}
          />
        </motion.svg>
      ))}
    </div>
  );
};

// Grid Background
const GridBackground = () => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-20"
    style={{
      backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
      backgroundSize: '40px 40px'
    }}
  />
);

// --- SLIDE COMPONENT ---
const Slide = ({ children, bg, textCol = "text-white", accent, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px", once: false });

  return (
    <div 
      ref={ref}
      className={`h-screen w-full flex flex-col justify-center items-center snap-start snap-always relative overflow-hidden px-6 ${className}`}
      style={{ background: bg }}
    >
      <AbstractLines color={accent || "#fff"} />
      
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.8 }}
        className={`w-full max-w-md z-10 flex flex-col relative ${textCol}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

// --- UPDATED INTRO ANIMATION COMPONENT ---
const IntroSequence = ({ onReady }) => {
    const [showButton, setShowButton] = useState(false);

    return (
        <motion.div 
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center overflow-hidden"
            exit={{ opacity: 0, pointerEvents: "none" }}
        >
            {/* NEW: Moving '2025' Text */}
            <motion.div
                className="absolute text-black font-black uppercase text-[250px] sm:text-[300px] md:text-[400px] lg:text-[600px] opacity-10 pointer-events-none"
                style={{ 
                    top: '20%', 
                    scale: 2, 
                }}
                initial={{ 
                    x: '200%', 
                    opacity: 0
                }} 
                animate={{ 
                    x: '-150%', 
                    opacity: 0.15,
                    transition: { 
                        x: { 
                            duration: 7, 
                            repeat: Infinity, 
                            ease: "linear" 
                        } 
                    } 
                }}
                transition={{ 
                    opacity: { delay: 1, duration: 1 },
                    duration: 10,
                    repeat: Infinity,
                }}
            >
                2025
            </motion.div>
            
            {/* Moving Lines on White */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-[2px] bg-black"
                    style={{
                        top: `${15 + i * 15}%`,
                        left: 0,
                        right: 0,
                    }}
                    initial={{ scaleX: 0, transformOrigin: i % 2 === 0 ? "left" : "right" }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: i * 0.2 }}
                />
            ))}

            {/* Logo Pop and Scale */}
            <motion.div
                initial={{ scale: 0 }} 
                animate={{ scale: [0, 1.5, 1] }} 
                transition={{ duration: 1.2, ease: "backOut", delay: 1 }}
                className="w-40 h-40 bg-black text-lime-400 rounded-full flex items-center justify-center z-10 p-4"
            >
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-3" />
            </motion.div>
            
            {/* "WRAPPED" Text -> "READY?" Button Transition */}
            {!showButton ? (
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onAnimationComplete={() => setTimeout(() => setShowButton(true), 1500)} // Wait 1.5s then show button
                    transition={{ delay: 2 }}
                    className="mt-24 mb-30 text-6xl font-black text-black tracking-tighter uppercase"
                >
                    Wrapped
                </motion.h1>
            ) : (
                <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onReady}
                    className="mt-24 mb-30 px-8 py-3 bg-black text-white text-3xl font-black uppercase tracking-tighter rounded-full shadow-xl hover:bg-lime-400 hover:text-black transition-colors flex items-center gap-3"
                >
                    <Play size={24} fill="currentColor" /> READY?
                </motion.button>
            )}
        </motion.div>
    );
};

export default function App() {
  // --- CHANGED: STATE TO HOLD NAME AND MOBILE ---
  const [fullName, setFullName] = useState("");
  const [mobileNum, setMobileNum] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState("intro");

  const audioRef = useRef(new Audio("/music.mp3"));
  const scrollContainerRef = useRef(null);

  // 2. Auto-focus the container when data loads  
  useEffect(() => {
    if (data && scrollContainerRef.current) {
      scrollContainerRef.current.focus();
    }
  }, [data]);

  useEffect(() => {
    // Configure audio settings
    audioRef.current.loop = true; // Loop the music
    audioRef.current.volume = 0.4; // Set volume (0.0 to 1.0)
    
    // Cleanup: Stop music if user closes the tab or component unmounts
    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  const handleReady = () =>{
      audioRef.current.play().catch(error => console.log("Audio playback failed:", error));
      setShowIntro("login"); 
  }

  // --- CHANGED: LOGIC TO FETCH BY NAME AND MOBILE ---
  const handleSearch = async () => {
  if (!fullName || !mobileNum) { 
    setError("Please enter your Full Name and Mobile Number.");
    return; 
  }

  setLoading(true);
  setError(""); 

  // 1. Clean the mobile number (Same logic as your old backend)
  let cleanMobile = mobileNum.toString().replace(/\D/g, ''); 
  if (cleanMobile.startsWith('94') && cleanMobile.length > 9) cleanMobile = cleanMobile.substring(2);
  if (cleanMobile.startsWith('0')) cleanMobile = cleanMobile.substring(1);

  // 2. CHECK FOR DEMO CREDENTIALS
  const isDemoMobile = cleanMobile === '123456789';
  const isDemoName = fullName.toLowerCase().includes('master academy');

  if (isDemoMobile || isDemoName) {
    // Artificial delay to make the "Search" feel real
    await new Promise(resolve => setTimeout(resolve, 2500));

    const demoData = {
      branch: "Headquarters & Wellawatte", 
      name: "Master Academy Demo",
      totalMinutes: 21340,
      totalHours: 355, 
      topSubject: "Grade 11 Maths",
      topTeacher: "Rizlan Hassan", 
      topPercent: 4,
      persona: "THE LEGEND",
      personaDesc: "You basically live at the academy!"
    };

    setData(demoData);
    setLoading(false);
    return; // Stop here, don't call the dead backend
  }

  // 3. ACTUAL BACKEND CALL (Fallback)
  try {
    const response = await fetch(`${API_BASE_URL}/api/wrapped/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, mobile: mobileNum })
    });
    
    const result = await response.json();
    await new Promise(resolve => setTimeout(resolve, 2500));

    if (response.ok) {
      setData(result);
    } else {
      setError(result.error || "Student not found.");
    }
  } catch (err) {
    // Since we know the backend is down, give a helpful prompt
    setError("Database offline. Please use mobile '123456789' for the demo!");
  } finally {
    setLoading(false);
  }
};

  const handleShare = async () => {
    // 1. Target the specific card, NOT the whole scroll container
    const element = document.getElementById("summary-card"); 
    if (!element) return;

    // 2. Hide buttons (optional, but good practice)
    const buttons = document.querySelectorAll("button");
    buttons.forEach(b => b.style.opacity = "0");

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#111", // Match the card background color
        scale: 3, // High resolution for Instagram
        useCORS: true, // Crucial for loading images (like the logo)
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'master-academy-stats.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Master Academy Wrapped',
        });
      } else {
        const link = document.createElement('a');
        link.download = 'wrapped.png';
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      alert("Could not share. Take a screenshot!");
    } finally {
      buttons.forEach(b => b.style.opacity = "1");
    }
  };

  const handleHome = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    
    setData(null);
    // Reset Name fields
    setFullName("");
    setMobileNum("");
    setError("");

    setShowIntro("intro");
  };

  // --- 1. INTRO / LOADING / LOGIN ---
  if (!data) {
    return (
      <>
        {/* Step 1: Intro Sequence (Only show if state is 'intro') */}
        {showIntro === "intro" && (
            <IntroSequence onReady={handleReady} />
        )}

        {/* Step 2: Login Screen (Only show if state is 'login') */}
        {showIntro === "login" && (
            <>
                {loading ? (
                    // --- LOADING SCREEN ---
                    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden p-8">
                        <AbstractLines color="#ccff00" opacity={0.5} />
                        <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-24 h-24 border-8 border-[#333] border-t-[#ccff00] rounded-full mb-8"
                        />
                        <h2 className="text-[#ccff00] font-mono text-xl animate-pulse">ANALYZING DATA...</h2>
                    </div>
                ) : (
                    // --- LOGIN SCREEN ---
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="min-h-[100dvh] w-full bg-[#ccff00] relative flex flex-col font-sans overflow-hidden"
                    >
                        <GridBackground />
                        
                        {/* Header */}
                        <div className="p-6 flex justify-between items-center border-b-2 border-black/10 absolute top-0 w-full z-20">
                            <span className="font-bold tracking-widest text-xs uppercase">Master Academy</span>
                            <div className="text-xs font-mono">2025 EDITION</div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col items-center justify-center px-6 z-10 text-center">
                            <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            >
                            <h1 className="text-6xl font-black leading-[0.85] tracking-tighter mb-6 text-black">
                                MASTER ACADEMY<br/>2025 WRAPPED
                            </h1>
                            </motion.div>

                            <p className="text-black text-xl font-bold mb-6 max-w-[300px]">
                            You Attended. We Counted.
                            </p>

                            {/* CHANGED: 3 INPUTS FOR NAME/MOBILE */}
                            <div className="w-full max-w-sm space-y-4">
                                
                                <div className="bg-white border-4 border-black p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform focus-within:translate-x-1 focus-within:translate-y-1 focus-within:shadow-none">
                                    <input
                                        type="text"
                                        placeholder="FULL NAME"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full p-4 bg-transparent text-black font-bold text-xl placeholder:text-gray-400 outline-none text-center uppercase"
                                    />
                                </div>

                                <div className="bg-white border-4 border-black p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform focus-within:translate-x-1 focus-within:translate-y-1 focus-within:shadow-none">
                                    <input
                                        type="tel"
                                        placeholder="MOBILE NUMBER"
                                        value={mobileNum}
                                        onChange={(e) => setMobileNum(e.target.value)}
                                        className="w-full p-4 bg-transparent text-black font-bold text-xl placeholder:text-gray-400 outline-none text-center uppercase"
                                    />
                                </div>
                                
                                <button
                                    onClick={handleSearch}
                                    className="w-full mt-4 bg-black text-[#ccff00] font-black text-xl py-4 border-4 border-black hover:bg-gray-900 transition-colors uppercase tracking-widest"
                                >
                                    Generate
                                </button>

                                {error && (
                                    <motion.div 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 bg-red-500 text-white font-bold p-3 text-center border-2 border-black"
                                    >
                                    {error}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                      
   
                    </motion.div>
                )}
            </>
        )}
      </>
    );
  }

  // --- 2. WRAPPED RESULTS (EXACTLY AS PROVIDED) ---
  return (

    <div 
      id="wrapped-content"
      // 3. Attach the ref here
      ref={scrollContainerRef}
      // 4. Make it focusable programmatically
      tabIndex="-1" 
      // 5. Remove the default blue focus outline      
      className="h-screen w-full bg-black text-white overflow-y-scroll scroll-smooth font-sans no-scrollbar outline-none"
      style={{ scrollSnapType: "y mandatory" }}
    >

      {/* Slide 1: Welcome */}
 
{/* Slide 1: Welcome */}
<Slide bg="#000000" accent="#ff4500">
    <div className="absolute top-20 left-2 w-full flex justify-center">
        <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
            <Star size={40} className="text-red-500" fill="currentColor" />
        </motion.div>
    </div>
    
    <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none z-0">
        <div 
            className="absolute inset-0"
            style={{
                backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                backgroundSize: '100px 100px'
            }}
        />
    </div>

    <h3 className="font-mono text-white mb-4 text-sm">2025 SUMMARY</h3> 

    {/* --- NEW: BRANCH PILL --- */}
    <div className="mb-6 px-4 py-1 rounded-full border border-white/30 bg-white/10 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-md">
        📍 {data.branch}
    </div>
    
    <h1 className="text-6xl font-black mb-2 tracking-tighter">HELLO</h1>
    
    <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-400 uppercase">
        {data.name} 
    </h1>
    
    <div className="mt-12 bg-red-600/90 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 flex items-center gap-2">
        <span className="text-sm text-white font-bold">Swipe to unwrap</span>
        <ArrowDown size={16} className="animate-bounce text-white" />
    </div>
</Slide>

      {/* Slide 2: Minutes Spent (Spotify Wrapped Style - Bold Typography) */}
      <Slide bg="#18181b" accent="#ec4899"> {/* Dark Zinc Background */}
         <div className="w-full h-full flex flex-col justify-center items-start relative px-8">
             
             {/* Abstract Background Lines (White/Pink) */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 {/* Top White Lines */}
                 <svg className="absolute top-0 left-0 w-full h-1/2 opacity-20" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <path d="M0,50 Q100,150 200,50 T400,50" stroke="white" strokeWidth="2" fill="none" />
                    <path d="M0,80 Q150,180 300,80 T500,80" stroke="white" strokeWidth="2" fill="none" />
                 </svg>
                 {/* Bottom Pink/White Graphic */}
                 <svg className="absolute bottom-0 right-0 w-[80%] h-[80%] opacity-30 pointer-events-none" viewBox="0 0 500 500" preserveAspectRatio="xMaxYMax meet">
                    {/* Radiating from bottom-right corner (500, 500) */}
                    <circle cx="500" cy="500" r="300" stroke="#ec4899" strokeWidth="30" fill="none" />
                    <circle cx="500" cy="500" r="240" stroke="white" strokeWidth="15" fill="none" />
                    <circle cx="500" cy="500" r="180" stroke="#ec4899" strokeWidth="30" fill="none" />
                 </svg>
             </div>

             {/* Main Content - Left Aligned */}
             <div className="relative z-10">
                 <h2 className="text-xl font-bold text-gray-200 mb-4">
                    You have engaged with <br/>Master Academy for
                 </h2>
                 
                 {/* BIG BOLD NUMBER with Stroke Effect */}
                 <motion.h1 
                    className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent leading-none relative"
                    style={{ 
                        WebkitTextStroke: "3px #ec4899", // Pink outline
                        textShadow: "4px 4px 0px #6d28d9" // Purple shadow for depth
                    }}
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                 >
                    {data.totalMinutes.toLocaleString()}
                 </motion.h1>
                 
                 <motion.p 
                    className="text-xl text-gray-300 mt-6 font-medium"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                 >
                    minutes. That’s <span className="text-pink-400 font-bold te">{Math.round(data.totalMinutes / 60)} hours</span>.
                 </motion.p>
                 
                 <motion.p
                    className="text-xl text-gray-400 mt-2"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                 >
                    Great.
                 </motion.p>
             </div>

         </div>
      </Slide>

      {/* Slide 3: Top Subject & Lecturer (Redesigned - Violet/Cyan) */}
      <Slide bg="#2e1065" accent="#22d3ee">
         <div className="w-full h-full flex flex-col justify-center relative max-w-lg mx-auto">
             
             {/* 1. DECORATIVE BACKGROUND LINES (Slanted) */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-[-10%] left-[-10%] w-[120%] h-40 bg-black/20 transform -rotate-6 z-0" />
                 <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-40 bg-black/20 transform -rotate-6 z-0" />
             </div>

             {/* 2. THE SUBJECT (Top Left) */}
             <div className="relative z-20 mb-[-20px] ml-4 self-start">
                 <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                 >
                     <h3 className="text-cyan-400 font-bold tracking-[0.3em] text-xs uppercase mb-2 ml-1">
                        Most Attended
                     </h3>
                     {/* The Subject Title with a solid background highlight */}
                     <span className="bg-white text-[#2e1065] text-5xl z-10 font-black px-4 py-2 leading-tight shadow-xl inline-block transform -rotate-2">
                        {data.topSubject}
                     </span>
                 </motion.div>
             </div>

             {/* 3. THE LECTURER IMAGE (Center/Right) */}
             <div className="relative z-10 self-center mr-[-20px]">
                 <motion.div 
                    initial={{ scale: 0.8, opacity: 0, rotate: 6 }}
                    whileInView={{ scale: 1, opacity: 1, rotate: 3 }}
                    transition={{ type: "spring", bounce: 0.4, delay: 0.3 }}
                    className="relative"
                 >
                     {/* Cyan Border Frame */}
                     <div className="absolute top-4 left-4 w-60 h-72 border-4 border-cyan-400 z-0"></div>
                     
                     {/* Image Container */}
                     <div className="w-60 h-72 bg-black overflow-hidden relative z-30 shadow-2xl grayscale hover:grayscale-0 transition-all duration-500">
                      
                         <img 
                            src={`/lecturers/${data.topTeacher}.png`} 
                            alt={data.topTeacher}
                            className="scale-150 h-full object-cover mt-20 ml-10"
                            onError={(e) => {
                                e.target.style.display = 'none'; 
                                e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-[#1a1a1a]"><span class="text-4xl">👑</span></div>';
                            }}
                         />
                         {/* Name Tag at bottom of image */}
                         <div className="absolute bottom-0 left-0 w-full bg-cyan-400 p-2">
                             <p className="text-[#2e1065] font-black text-center text-lg uppercase tracking-tighter">
                                {data.topTeacher}
                             </p>
                         </div>
                     </div>
                 </motion.div>
             </div>

             {/* 4. FOOTER TEXT (Bottom Right) */}
             <motion.div 
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="self-end mt-8 mr-6 text-right"
             >
                 <p className="text-cyan-200/60 text-sm font-mono">
                     Total Sessions <br/> <span className="text-white text-xl font-bold">MASTERED</span>
                 </p>
             </motion.div>

         </div>
      </Slide>  


      {/* Slide 4: Percentile (Comparison Logic) */}
      <Slide bg="#022c22" accent="#4ade80">
         <div className="relative w-full max-w-lg flex flex-col items-center">
             <Trophy size={160} className="text-green-500 absolute -top-32 -right-10 opacity-20 rotate-12" />
             
             {/* Dynamic Tier Badge */}
             <div className="mb-6 px-4 py-1 rounded-full border border-green-400/30 bg-green-900/30 text-green-300 text-sm font-bold uppercase tracking-widest">
                {data.topPercent <= 10 ? "Elite Tier" : 
                 data.topPercent <= 25 ? "High Achiever" : 
                 data.topPercent <= 50 ? "Above Average" : "Learner"}
             </div>

             <h2 className="text-3xl font-bold mb-2 text-green-100">You are among the</h2>
             <h1 className="text-9xl font-black text-center text-transparent bg-clip-text bg-gradient-to-t from-green-600 to-green-300 tracking-tighter">
                TOP {data.topPercent}%
             </h1>
             <p className="text-lg text-green-100/60 mt-2">global students at Master Academy.</p>
             
             {/* LOGICAL VISUAL: The Spectrum Bar */}
             <div className="w-full mt-12 relative">
                {/* 1. The Track */}
                <div className="w-full h-4 bg-white/10 rounded-full overflow-visible relative flex items-center">
                    
                    {/* 2. The Average Marker (Context) */}
                    <div className="absolute left-[50%] -top-8 flex flex-col items-center z-10">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Avg</span>
                        <div className="w-[2px] h-8 bg-white/20"></div>
                    </div>

                    {/* 3. Your Progress Bar */}
                    <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${100 - parseInt(data.topPercent)}%` }}
                        transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-green-800 to-green-400 rounded-full relative"
                    >
                        {/* 4. The 'YOU' Pill at the end of the bar */}
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                            <div className="bg-white text-black text-xs font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.6)] border-2 border-green-500">
                                YOU
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Labels for the Track */}
                <div className="flex justify-between w-full mt-4 text-xs font-mono text-green-100/30">
                    <span>Bottom</span>
                    <span>Top 1%</span>
                </div>
             </div>
         </div>
      </Slide>

      {/* Slide 5: Persona */}
      <Slide bg="#ffffffff" accent="#facc15">
        <div className="w-full max-w-sm bg-[#facc15] text-black p-1 rounded-3xl transform rotate-2">
           <div className="bg-black text-[#facc15] p-8 rounded-[20px] flex flex-col items-center text-center h-full border-2 border-black">
              <div className="w-32 h-32 mb-6 relative">
                 <motion.div animate={{ rotate: 180 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-dashed border-[#facc15] rounded-full" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={48} fill="currentColor" />
                 </div>
              </div>
              
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-2">Your Persona</h3>
              <h1 className="text-4xl font-black mb-4 uppercase">{data.persona}</h1>
              <p className="text-sm opacity-80 leading-relaxed font-mono">
                 {data.personaDesc}
              </p>
           </div>
        </div>
      </Slide>

      {/* Slide 6: Summary & Share */}
      {/* Slide 6: Summary & Share */}
      <Slide bg="#000" accent="#ccff00">
          <div id="summary-card" className="w-full bg-[#111] border border-gray-800 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              <div className="relative z-10">
                  <div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-4">
                      <h1 className="text-2xl font-black"><span className="text-s">2025</span><br/><span className="text-[#ccff00]">WRAPPED</span></h1>
                      <img src="/Master academy logo - white.png" className="w-30 h-12 opacity-80 mb-2 " alt="Logo" />    
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                      {/* --- NEW: BRANCH ROW (Full Width) --- */}
                      <div className="col-span-3 bg-[#222] p-3 rounded flex justify-between items-center border-l-4 border-[#ccff00]">
                          <span className="text-gray-400 text-xs uppercase font-bold tracking-widest">Studied At</span>
                          <div className="text-sm font-bold text-white uppercase">{data.branch}</div>
                      </div>

                      {/* Top Subject (2 Cols) */}
                      <div className="col-span-2 bg-[#222] p-3 rounded">
                          <span className="text-gray-400 text-xs uppercase">Top subject</span>
                          <div className="text-2xl font-bold text-white leading-none mt-1">{data.topSubject}</div>
                      </div>

                      {/* Total Time (1 Col) */}
                      <div className="bg-[#222] p-3 rounded">
                          <span className="text-gray-400 text-xs uppercase">Minutes</span>
                          <div className="text-lg font-bold text-white whitespace-nowrap mt-1">{data.totalMinutes.toLocaleString()}</div>
                      </div>

                      {/* Global Rank (1 Col) */}
                          <div className="bg-[#222] p-3 rounded">
                          <span className="text-gray-400 text-xs uppercase leading-tight">GLOBAL</span>
                          <div className="text-xl font-bold text-[#ccff00] mt-1">Top {data.topPercent}%</div>
                      </div>

                      {/* Lecturer (2 Cols) */}
                      <div className="col-span-2 bg-[#222] p-3 rounded">
                          <span className="text-gray-400 text-xs uppercase">Fav Lecturer</span>
                          <div className="text-xl font-bold text-white mt-1">{data.topTeacher}</div>
                      </div>
                  
                  </div>

                  <div className="bg-[#ccff00] text-black text-center py-2 font-bold uppercase text-sm rounded-sm">
                      THAT'S A WRAP
                  </div>
              </div>
          </div>

          <div className="text-white text-center py-2 font-bold uppercase text-sm mt-7">
              FLEX YOUR ACADEMY STATS! 🏆 <br/> TAG <span className="lowercase text-[#ccff00]">@MASTERACADEMYcolombo</span> IN YOUR STORIES 👇🏼
          </div>

          <div className="flex justify-center gap-4 mt-8 z-10">
              <button onClick={handleHome} className="bg-gray-800 text-white p-4 rounded-full hover:bg-gray-700 transition-colors">
                  <Home size={24} />
              </button>
              <button onClick={handleShare} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2">
                  Share <Share2 size={18} />
              </button>
          </div>
      </Slide>

    </div>
  );
}