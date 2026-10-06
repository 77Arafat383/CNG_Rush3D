/**
 * SoundManager - Procedural Web Audio API sound synthesizer
 * Completely self-contained, no external audio files needed, works offline.
 */
class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.engineGain = null;
        this.engineOsc1 = null;
        this.engineOsc2 = null;
        this.engineFilter = null;
        this.rainGain = null;
        this.rainNode = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.setupEngineSound();
            this.setupRainSound();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API initialization failed:', e);
        }
    }

    resume() {
        if (!this.initialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    setupEngineSound() {
        if (!this.ctx) return;
        // Two oscillators for a characteristic 2-stroke / 4-stroke thrum
        this.engineOsc1 = this.ctx.createOscillator();
        this.engineOsc2 = this.ctx.createOscillator();
        this.engineOsc1.type = 'sawtooth';
        this.engineOsc2.type = 'triangle';
        this.engineOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);
        this.engineOsc2.frequency.setValueAtTime(90, this.ctx.currentTime);

        this.engineFilter = this.ctx.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.setValueAtTime(260, this.ctx.currentTime);

        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.engineOsc1.connect(this.engineFilter);
        this.engineOsc2.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);

        this.engineOsc1.start();
        this.engineOsc2.start();
    }

    updateEngine(speedFraction, isRunning = true) {
        if (!this.ctx || !this.engineGain || this.isMuted) return;
        if (!isRunning) {
            this.engineGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.1);
            return;
        }
        // Base frequency 40Hz idle, up to 135Hz at max speed
        const targetFreq = 42 + speedFraction * 95;
        this.engineOsc1.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
        this.engineOsc2.frequency.setTargetAtTime(targetFreq * 2.05, this.ctx.currentTime, 0.08);

        // Filter opens with speed
        this.engineFilter.frequency.setTargetAtTime(240 + speedFraction * 400, this.ctx.currentTime, 0.08);
        // Volume slightly higher when accelerating
        const targetVol = 0.08 + speedFraction * 0.14;
        this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.08);
    }

    setupRainSound() {
        if (!this.ctx) return;
        // Synthesize rain using noise buffer
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const rainFilter = this.ctx.createBiquadFilter();
        rainFilter.type = 'bandpass';
        rainFilter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        rainFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        whiteNoise.connect(rainFilter);
        rainFilter.connect(this.rainGain);
        this.rainGain.connect(this.masterGain);

        whiteNoise.start();
    }

    setRain(isRaining) {
        if (!this.ctx || !this.rainGain) return;
        const target = isRaining && !this.isMuted ? 0.22 : 0.0;
        this.rainGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.4);
    }

    playHorn() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        // Iconic dual-tone auto-rickshaw horn (460Hz and 580Hz)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(466, now);
        osc2.frequency.setValueAtTime(587, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.36);
        osc2.stop(now + 0.36);
    }

    playCrash(severity = 'medium') {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const dur = severity === 'heavy' ? 0.45 : 0.28;

        // Metallic impact thump
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + dur);

        // Noise crunch
        const bufferSize = Math.floor(this.ctx.sampleRate * dur);
        const noiseBuf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(severity === 'heavy' ? 450 : 800, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(severity === 'heavy' ? 0.5 : 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        osc.connect(gain);
        noise.connect(noiseFilter);
        noiseFilter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        noise.start(now);
        osc.stop(now + dur);
        noise.stop(now + dur);
    }

    playPothole() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.2);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.23);
    }

    playPickup() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            gain.gain.setValueAtTime(0.2, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.2);
        });
    }

    playDropOff() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        // Cash register / coin chime
        const freqs = [987.77, 1318.51, 1975.53]; // B5, E6, B6
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.22, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.36);
        });
    }

    playWaterSplash() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const dur = 0.25;
        const bufferSize = Math.floor(this.ctx.sampleRate * dur);
        const noiseBuf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.linearRampToValueAtTime(200, now + dur);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + dur);
    }

    playFanfare() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const chords = [
            { f: 523.25, t: 0.0 }, // C5
            { f: 659.25, t: 0.12 }, // E5
            { f: 783.99, t: 0.24 }, // G5
            { f: 1046.50, t: 0.38 } // C6
        ];
        chords.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, now + item.t);

            gain.gain.setValueAtTime(0.25, now + item.t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + 0.5);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + item.t);
            osc.stop(now + item.t + 0.55);
        });
    }

    playGameOver() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [330, 293.66, 261.63, 220]; // E4, D4, C4, A3
        notes.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now + idx * 0.18);

            gain.gain.setValueAtTime(0.2, now + idx * 0.18);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.18 + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + idx * 0.18);
            osc.stop(now + idx * 0.18 + 0.28);
        });
    }

    playClick() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playRepair() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        // Mechanical ratchet wrench clicks
        [0.0, 0.08, 0.16].forEach((t, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200 + i * 200, now + t);
            gain.gain.setValueAtTime(0.2, now + t);
            gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.04);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + t);
            osc.stop(now + t + 0.05);
        });

        // Satisfying chime
        [523.25, 659.25, 783.99].forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + 0.25 + idx * 0.08);
            gain.gain.setValueAtTime(0.22, now + 0.25 + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25 + idx * 0.08 + 0.3);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + 0.25 + idx * 0.08);
            osc.stop(now + 0.25 + idx * 0.08 + 0.32);
        });
    }

    playLowFuelBeep() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        [0.0, 0.18].forEach(t => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now + t);
            gain.gain.setValueAtTime(0.25, now + t);
            gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.09);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + t);
            osc.stop(now + t + 0.1);
        });
    }

    playEngineStall() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.85);
    }

    playNotificationChime() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        // Two-tone pleasant notification chime (880Hz, 1174Hz)
        [880, 1174.66].forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.1);
            gain.gain.setValueAtTime(0.2, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.32);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.33);
        });
    }
}

window.soundManager = new SoundManager();
