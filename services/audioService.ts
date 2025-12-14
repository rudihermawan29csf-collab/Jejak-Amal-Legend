
// Audio Service using Web Audio API for procedural SFX
// This avoids the need for external MP3 files for UI sounds

type BGMTrack = 'lobby' | 'battle' | 'calm' | 'victory' | 'defeat';

class AudioService {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  currentAudio: HTMLAudioElement | null = null;
  currentTrackName: BGMTrack | null = null;
  isMuted: boolean = false;
  hasInteracted: boolean = false;

  // Summoning SFX State
  summonOscillators: OscillatorNode[] = [];
  summonGain: GainNode | null = null;

  // URLs for different atmospheres
  // Using high quality royalty free tracks fitting the theme
  tracks: Record<BGMTrack, string> = {
    // Epic Orchestral (Start Screen, Map, Character Select) - "Heroic/Legendary"
    lobby: "https://cdn.pixabay.com/audio/2022/08/29/audio_2984c7866d.mp3", 
    
    // Action/Tension (Gameplay, Choices) - "Dark/Suspenseful"
    battle: "https://cdn.pixabay.com/audio/2022/10/24/audio_024b434447.mp3",
    
    // Peaceful/Piano (Mentor, Cutscene) - "Reflective/Emotional"
    calm: "https://cdn.pixabay.com/audio/2021/09/06/audio_387922e379.mp3",

    // Victory - "Triumphant"
    victory: "https://cdn.pixabay.com/audio/2020/12/04/audio_346914590c.mp3",

    // Defeat - "Sad/Somber"
    defeat: "https://cdn.pixabay.com/audio/2021/11/25/audio_915a31c518.mp3"
  };

  constructor() {
    // Preload not strictly necessary for simple MP3s
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    
    // CRITICAL: Always try to resume context on any interaction call
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        console.log("AudioContext resumed successfully.");
      }).catch(e => console.warn("Audio Context resume failed:", e));
    }
    
    this.hasInteracted = true;
  }

  playBGM(trackName: BGMTrack) {
    this.init(); // Ensure context is ready

    // If requesting the same track that is already playing, do nothing
    if (this.currentTrackName === trackName && this.currentAudio && !this.currentAudio.paused) {
      // Just ensure volume is correct in case it was faded
      this.currentAudio.volume = this.getVolumeForTrack(trackName);
      return;
    }

    // Stop current track with a fade out effect (simulated by just stopping for now to be snappy)
    this.stopBGM();

    // Setup new track
    this.currentTrackName = trackName;
    const url = this.tracks[trackName];
    
    this.currentAudio = new Audio(url);
    
    // Loop everything except victory/defeat jingles if they are short (but these URLs are long, so loop is safer)
    this.currentAudio.loop = true; 
    this.currentAudio.volume = this.getVolumeForTrack(trackName);
    this.currentAudio.crossOrigin = "anonymous"; 

    const playPromise = this.currentAudio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("Autoplay blocked. Waiting for user interaction...", error);
        });
    }
  }

  getVolumeForTrack(track: BGMTrack): number {
      if (this.isMuted) return 0;
      switch (track) {
          case 'calm': return 0.3;
          case 'battle': return 0.25; // Slightly lower as it can be intense
          case 'lobby': return 0.3;
          case 'victory': return 0.4;
          default: return 0.3;
      }
  }

  stopBGM() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.currentTrackName = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    // Handle Web Audio API (SFX)
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    
    // Handle HTML5 Audio (BGM)
    if (this.currentAudio && this.currentTrackName) {
      if (this.isMuted) {
        this.currentAudio.volume = 0;
      } else {
        this.currentAudio.volume = this.getVolumeForTrack(this.currentTrackName);
        if (this.currentAudio.paused) this.currentAudio.play().catch(e => console.log("Unmute play error", e));
      }
    }
    return this.isMuted;
  }

  // --- ANNOUNCER (TTS) ---
  playAnnouncer(text: string) {
    if (this.isMuted || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 0.9; 
    utterance.pitch = 0.8; 

    const voices = window.speechSynthesis.getVoices();
    // Prefer "Google US English" or similar high quality voices
    const preferredVoice = voices.find(v => 
      (v.name.includes('Google') && v.lang.includes('en')) || v.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  // --- SYNTHESIZED SFX ---

  playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1, slideTo: number | null = null) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
    }

    // Envelope
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(vol, this.ctx.currentTime + 0.01); // Fast attack
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration); // Release
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Original Tech Typing Sound
  playTyping() {
    if (this.isMuted) return;
    const randomFreq = 800 + Math.random() * 400; 
    this.playTone(randomFreq, 'square', 0.03, 0.05);
  }

  // NEW: MOBA Battle Typing Sound (Metallic/Percussive)
  playBattleTyping() {
    if (this.isMuted) return;
    // Lower pitch, sawtooth wave for 'gritty' metallic sound
    // Simulates hits or heavy armor clicking
    const randomFreq = 300 + Math.random() * 150; 
    this.playTone(randomFreq, 'sawtooth', 0.03, 0.08);
  }

  playHover() {
    this.playTone(800, 'sine', 0.1, 0.05, 1200);
  }

  playClick() {
    this.playTone(150, 'triangle', 0.15, 0.3, 50);
  }

  playConfirm() {
    this.playTone(440, 'sine', 0.5, 0.2); // A4
    setTimeout(() => this.playTone(554.37, 'sine', 0.5, 0.2), 50); // C#5
    setTimeout(() => this.playTone(659.25, 'sine', 0.8, 0.2), 100); // E5
  }

  playError() {
    this.playTone(150, 'sawtooth', 0.3, 0.2, 100);
    setTimeout(() => this.playTone(120, 'sawtooth', 0.3, 0.2, 80), 150);
  }

  playVictorySFX() {
     // This is the immediate SFX, while BGM handles the ambient music
    const base = 523.25; // C5
    this.playTone(base, 'triangle', 0.2, 0.3);
    setTimeout(() => this.playTone(base, 'triangle', 0.2, 0.3), 150);
    setTimeout(() => this.playTone(base, 'triangle', 0.2, 0.3), 300);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.4, 0.3), 450);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.4, 0.3), 600);
    setTimeout(() => this.playTone(1046.50, 'triangle', 1.5, 0.4), 800);
  }

  // --- SUMMONING CHARGE (Loading 0-100%) ---
  startSummoningSFX() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    this.stopSummoningSFX(); // Clear existing

    this.summonGain = this.ctx.createGain();
    this.summonGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.summonGain.connect(this.masterGain);

    // Create 2 oscillators for a richer "Sci-fi engine" sound
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(50, this.ctx.currentTime); // Base Low

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(100, this.ctx.currentTime); // Harmonic
    osc2.detune.setValueAtTime(10, this.ctx.currentTime); // Slight detune for chorus effect

    osc1.connect(this.summonGain);
    osc2.connect(this.summonGain);

    osc1.start();
    osc2.start();

    this.summonOscillators = [osc1, osc2];
  }

  updateSummoningSFX(progress: number) {
    if (!this.ctx || !this.summonGain || this.isMuted) return;
    
    // Progress is 0 to 100
    const normalized = progress / 100;

    // Ramp Volume
    // Start quiet, get louder
    // Reduced significantly to ~30% of original max
    const volume = Math.min(0.06, 0.015 + (normalized * 0.045));
    this.summonGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);

    // Ramp Frequency (Pitch Up)
    // 50Hz -> 800Hz
    const freq = 50 + (normalized * 750); 
    
    this.summonOscillators.forEach((osc, idx) => {
        const mult = idx + 1; // 2nd osc is higher
        osc.frequency.setTargetAtTime(freq * mult, this.ctx.currentTime, 0.1);
    });
  }

  stopSummoningSFX(playFinish: boolean = false) {
     if (this.summonOscillators.length > 0) {
         this.summonOscillators.forEach(osc => {
             try { osc.stop(); } catch(e) {}
         });
         this.summonOscillators = [];
     }
     if (this.summonGain) {
         this.summonGain.disconnect();
         this.summonGain = null;
     }

     if (playFinish && !this.isMuted) {
         // Play a "Boom" or "Ding" to signify completion
         this.playTone(880, 'sine', 0.5, 0.3); // High ping
         this.playTone(100, 'sawtooth', 0.5, 0.3, 0.01); // Low impact
     }
  }
}

export const audioManager = new AudioService();
