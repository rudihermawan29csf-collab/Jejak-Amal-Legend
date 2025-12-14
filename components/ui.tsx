
import React from 'react';
import { audioManager } from '../services/audioService';

// --- ICONS (Styled as Spell Icons) ---
const EpicIconWrapper = ({ children, color = "bg-slate-800", borderColor = "border-slate-600" }: { children: React.ReactNode, color?: string, borderColor?: string }) => (
  <div className={`w-8 h-8 ${color} border ${borderColor} transform rotate-45 flex items-center justify-center shadow-lg`}>
    <div className="transform -rotate-45">
      {children}
    </div>
  </div>
);

export const Icons = {
  Heart: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
  ),
  Star: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  ),
  Warning: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" clipRule="evenodd" />
    </svg>
  ),
  Sword: ({ className }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
    </svg>
  ),
  Play: ({ className }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
  ),
  Shield: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.172-2.67-.485-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  ),
  Trophy: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.603 2.506a11.042 11.042 0 0 1 4.794 0c.381.106.666.446.666.852V6.62a1.5 1.5 0 0 1-.954 1.397c-1.353.54-2.895.833-4.509.833-1.614 0-3.156-.293-4.509-.833a1.5 1.5 0 0 1-.954-1.397V3.358c0-.406.285-.746.666-.852Zm-4.908 6.07c-2.434.787-4.104 2.456-4.603 5.097a.75.75 0 0 0 1.05 1.134c.056-.04.113-.082.17-.126a1.53 1.53 0 0 1 1.884 2.435c.348.33.722.632 1.12.9 1.107.746 2.522 1.234 4.084 1.234 1.562 0 2.977-.488 4.085-1.234.398-.268.772-.57 1.12-.9a1.53 1.53 0 0 1 1.883-2.435c.057.044.114.086.17.126a.75.75 0 0 0 1.051-1.134c-.5-2.64-2.17-4.31-4.603-5.096a12.562 12.562 0 0 1-5.457 0Z" clipRule="evenodd" />
    </svg>
  ),
  Brain: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.644 1.59a.75.75 0 0 1 .712 0c1.268.65 2.69.976 4.144.976 1.73 0 3.312-.6 4.606-1.67a.75.75 0 0 1 .953 1.152c-1.074.887-2.316 1.487-3.655 1.726.852.567 1.543 1.326 2.002 2.222.84 1.636.702 3.655-.415 5.215l-.018.026c-.322.449-.714.856-1.157 1.215.15.534.225 1.087.225 1.648 0 1.706-.69 3.257-1.815 4.382l-.023.023a6.83 6.83 0 0 1-3.616 1.884.75.75 0 0 1-.394-1.448 5.33 5.33 0 0 0 2.822-1.47l.023-.023c.877-.878 1.415-2.088 1.415-3.419 0-.49-.078-.962-.224-1.41a.75.75 0 0 1 .232-.823c.532-.43.916-.957 1.117-1.52.42-1.173.197-2.486-.549-3.475a3.91 3.91 0 0 0-2.365-1.419.75.75 0 0 1-.502-.916 6.002 6.002 0 0 0-4.636-1.41.75.75 0 0 1-.58-.168ZM6 19.5c.828 0 1.5.672 1.5 1.5h-3c0-.828.672-1.5 1.5-1.5Zm-2.25 1.5a2.25 2.25 0 0 0 2.25 2.25h6c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5H9v-1.57c1.396-.19 2.709-.762 3.793-1.652.887.79 1.956 1.325 3.102 1.545a6.834 6.834 0 0 1-1.925 2.657.75.75 0 0 1-1.06-1.06 5.334 5.334 0 0 0 1.503-2.073c.094-.287.16-.583.197-.885-.436.195-.893.337-1.366.42a.75.75 0 0 1-.689-.286c-1.365-1.905-1.226-4.526.33-6.242.457-.504 1.01-.902 1.623-1.168-.21-.84-.707-1.59-1.405-2.12-.907-.69-2.046-1.008-3.178-.916a.75.75 0 0 1-.61-.318c-.803-1.12-2.04-1.92-3.453-2.193a.75.75 0 0 1-.611-.735V2.25A.75.75 0 0 1 6 1.5c2.071 0 3.75 1.679 3.75 3.75V6c0 .828.672 1.5 1.5 1.5h.75c.828 0 1.5.672 1.5 1.5v.75c0 .828-.672 1.5-1.5 1.5h-3A3.75 3.75 0 0 1 5.25 7.5v-1.5H3v1.5c0 2.071 1.679 3.75 3.75 3.75h.75v.75a3.75 3.75 0 0 1-3.75 3.75H3v1.5h.75Z" />
    </svg>
  ),
  Home: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.635 8.635a.75.75 0 1 1-1.06 1.06l-.312-.312v6.793a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-6.793l-.312.312a.75.75 0 0 1-1.06-1.06L11.47 3.84Z" />
    </svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
    </svg>
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  ),
  Sparkle: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813a3.75 3.75 0 0 0 2.576-2.576l.813-2.846A.75.75 0 0 1 9 4.5ZM1.5 1.5a.75.75 0 0 1 1.5 0v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5ZM15 1.5a.75.75 0 0 1 1.5 0v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5ZM15 15a.75.75 0 0 1 1.5 0v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5Z" clipRule="evenodd" />
    </svg>
  ),
  VolumeUp: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 2.485.519 4.953 1.848 7.535.342 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
      <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
    </svg>
  ),
  VolumeOff: ({ className }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
       <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 2.485.519 4.953 1.848 7.535.342 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
     </svg>
  )
};

// --- AVATAR EPIC (Hero Silhouette) ---
export const EpicAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl', color?: string }> = ({ size = 'md', color = '#C9A050' }) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-40 h-40",
    xl: "w-64 h-64"
  };
  
  return (
    <div className={`${sizeClasses[size]} relative mx-auto group transition-all duration-300`}>
      {/* Hexagon Border with Glow */}
      <div 
        className="absolute inset-0 opacity-20 hex-shape blur-md group-hover:opacity-50 transition-opacity" 
        style={{ backgroundColor: color }}
      ></div>
      
      <div 
        className="w-full h-full bg-slate-800 hex-shape border-2 relative overflow-hidden flex items-end justify-center transition-all duration-300"
        style={{ borderColor: color, boxShadow: `0 0 15px ${color}40` }}
      >
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
         
         {/* Hero Vector */}
         <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] z-0 relative top-2">
            <defs>
              <linearGradient id="armorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            {/* Armor/Helm Silhouette */}
            <path d="M50 10 L80 30 L80 60 L50 90 L20 60 L20 30 Z" fill="url(#armorGradient)" stroke={color} strokeWidth="1" />
            <path d="M50 15 L70 30 L70 55 L50 75 L30 55 L30 30 Z" fill="#0f172a" />
            {/* Glowing Eyes */}
            <path d="M40 45 L50 50 L40 52 Z" fill={color} className="animate-pulse" />
            <path d="M60 45 L50 50 L60 52 Z" fill={color} className="animate-pulse" />
         </svg>
      </div>
      
      {/* Level Badge */}
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black border border-white/20 transform rotate-45 flex items-center justify-center z-20">
         <div className="transform -rotate-45 font-bold text-xs" style={{ color: color }}>LVL</div>
      </div>
    </div>
  );
};

export const UstadzEpicAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
   const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-28 h-28",
    lg: "w-40 h-40"
  };
   return (
    <div className={`${sizeClasses[size]} relative mx-auto`}>
      <div className="absolute inset-0 bg-epicBlue opacity-30 hex-shape blur-xl"></div>
      <div className="w-full h-full bg-slate-900 hex-shape border-2 border-epicBlue relative overflow-hidden flex items-end justify-center shadow-[0_0_20px_rgba(0,194,255,0.4)]">
          {/* Sage Silhouette */}
          <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] relative top-1">
             <path d="M50 10 Q 80 10 80 40 L 85 100 L 15 100 L 20 40 Q 20 10 50 10" fill="#1e293b" stroke="#00C2FF" strokeWidth="0.5" />
             <rect x="40" y="30" width="20" height="2" fill="#00C2FF" className="animate-pulse" />
             <circle cx="50" cy="50" r="15" fill="none" stroke="#00C2FF" strokeWidth="1" opacity="0.5" />
          </svg>
      </div>
    </div>
  );
};

// --- HUD COMPONENT (MOBA Style) ---
export const EpicHUD: React.FC<{ iman: number; amal: number; lalai: number; level: number; onToggleMute: () => void; isMuted: boolean; heroColor?: string }> = ({ iman, amal, lalai, level, onToggleMute, isMuted, heroColor = '#C9A050' }) => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      {/* Top Bar Background */}
      <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-black/90 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-start relative">
        
        {/* Left: Player Profile & Level */}
        <div className="flex items-center gap-4 pointer-events-auto transition-transform hover:scale-105">
            {/* Level Badge */}
            <div className="w-12 h-12 bg-slate-800 border-2 border-epicGold hex-shape flex items-center justify-center relative">
               <span className="text-epicGold font-bold text-lg">{level}</span>
               <span className="absolute -bottom-3 text-[8px] uppercase text-slate-400 bg-black px-1">Level</span>
            </div>

            {/* Hero Portrait in HUD */}
            <div className="relative">
                <div className="absolute inset-0 bg-black rounded-full blur-md opacity-50"></div>
                <EpicAvatar size="sm" color={heroColor} />
            </div>
        </div>

        {/* Center: Status Bars */}
        <div className="flex-1 max-w-lg mx-4 mt-2">
           <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">
              <span>HP (Iman)</span>
              <span>{iman}/100</span>
           </div>
           {/* HP Bar */}
           <div className="w-full h-4 bg-slate-800 border border-slate-600 skew-x-[-15deg] relative overflow-hidden">
              <div 
                 className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                 style={{ width: `${iman}%` }}
              >
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30"></div>
              </div>
           </div>
           
           {/* Secondary Stats (Mana/Amal) */}
           <div className="flex gap-2 mt-2">
              <div className="flex-1">
                 <div className="h-2 bg-slate-800 border border-slate-600 skew-x-[-15deg] relative overflow-hidden">
                    <div className="h-full bg-yellow-500 w-full opacity-80" style={{ width: `${Math.min(100, amal)}%` }}></div>
                 </div>
                 <span className="text-[9px] text-yellow-500 uppercase font-bold tracking-wider">Gold: {amal}</span>
              </div>
              {lalai > 0 && (
                <div className="flex-1">
                    <div className="h-2 bg-slate-800 border border-slate-600 skew-x-[-15deg] relative overflow-hidden">
                        <div className="h-full bg-red-600 w-full animate-pulse" style={{ width: `${Math.min(100, lalai * 5)}%` }}></div>
                    </div>
                    <span className="text-[9px] text-red-500 uppercase font-bold tracking-wider">Threat: {lalai}</span>
                </div>
              )}
           </div>
        </div>

        {/* Right: Menu/Settings */}
        <div className="flex gap-2 pointer-events-auto">
           <button onClick={onToggleMute} className="w-8 h-8 bg-slate-800 border border-slate-500 transform rotate-45 flex items-center justify-center hover:bg-slate-700 transition-colors">
              <div className="transform -rotate-45 text-slate-400">
                  {isMuted ? <Icons.VolumeOff className="w-5 h-5" /> : <Icons.VolumeUp className="w-5 h-5" />}
              </div>
           </button>
        </div>

      </div>
    </div>
  );
};

// --- EPIC BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'gold' | 'outline';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const EpicButton: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, size = 'md', className = '', ...props }) => {
  
  let variantClass = "";
  if (variant === 'primary') variantClass = "btn-epic-primary text-blue-100";
  else if (variant === 'gold') variantClass = "btn-epic-gold text-black font-black";
  else if (variant === 'danger') variantClass = "bg-red-900 border-red-500 text-red-100 hover:bg-red-800";
  else variantClass = "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700";

  const sizes = {
    sm: "py-2 px-4 text-xs",
    md: "py-3 px-8 text-sm",
    lg: "py-4 px-10 text-base"
  };

  const widthClass = fullWidth ? "w-full" : "min-w-[150px]";

  const handleMouseEnter = () => {
    audioManager.playHover();
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    audioManager.playClick();
    if (props.onClick) props.onClick(e);
  };

  return (
    <button 
      className={`btn-epic font-bold flex items-center justify-center gap-2 ${variantClass} ${sizes[size]} ${widthClass} ${className}`}
      onMouseEnter={handleMouseEnter}
      {...props}
      onClick={handleClick}
    >
      {/* Decorative side lines */}
      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-1/2 bg-white/20"></span>
      <span className="absolute right-1 top-1/2 -translate-y-1/2 w-0.5 h-1/2 bg-white/20"></span>
      
      {children}
    </button>
  );
};

// --- EPIC CARD ---
export const EpicCard: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
  <div className={`epic-card relative p-1 ${className}`}>
    {/* Tech lines decoration */}
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-epicBlue opacity-50"></div>
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-epicBlue opacity-50"></div>
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-epicBlue opacity-50"></div>
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-epicBlue opacity-50"></div>
    
    <div className="bg-black/40 p-6 clip-path-polygon">
        {title && (
            <div className="text-center mb-6">
                <h3 className="text-xl font-hero text-gold uppercase tracking-widest border-b border-white/10 pb-2 inline-block px-8">
                    {title}
                </h3>
            </div>
        )}
        {children}
    </div>
  </div>
);

// Aliases
export const Button = EpicButton;
export const Card = EpicCard;
