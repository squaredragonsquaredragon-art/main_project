/**
 * hackerAlarmSound.js — Synthesizer for Cyber Intrusion / Hacker Threat Alert
 * Uses Web Audio API to generate authentic, high-urgency cyber security alarm sirens
 * without relying on external network assets or MP3 files.
 */

class HackerAlarmEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.masterGain = null;
    this._userUnlocked = false;
    this._setupAutoplayUnlock();
  }

  _setupAutoplayUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this._userUnlocked = true;
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
  }

  _ensureContext() {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return false;
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    } catch (e) {
      console.warn('AudioContext initialization failed:', e);
      return false;
    }
  }

  /**
   * Generates a single cycle of the sci-fi hacker cyber attack siren
   */
  _triggerSirenCycle() {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const t = this.ctx.currentTime;

      // ─── 1. Primary Cyber Warble Siren (Sawtooth with rapid frequency modulation) ───
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const filter1 = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      // Emergency alternating frequency sweep: 900Hz -> 1400Hz -> 850Hz -> 1350Hz
      osc1.frequency.setValueAtTime(900, t);
      osc1.frequency.exponentialRampToValueAtTime(1450, t + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(800, t + 0.36);
      osc1.frequency.exponentialRampToValueAtTime(1380, t + 0.54);
      osc1.frequency.exponentialRampToValueAtTime(750, t + 0.72);

      // Lowpass cyber filter
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(2600, t);
      filter1.Q.setValueAtTime(3.0, t);

      gain1.gain.setValueAtTime(0.001, t);
      gain1.gain.linearRampToValueAtTime(0.32, t + 0.05);
      gain1.gain.setValueAtTime(0.32, t + 0.65);
      gain1.gain.linearRampToValueAtTime(0.001, t + 0.75);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.masterGain);

      osc1.start(t);
      osc1.stop(t + 0.76);

      // ─── 2. Deep Sub-Bass Hacker Threat Pulse (Square wave) ───
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'square';
      subOsc.frequency.setValueAtTime(160, t);
      subOsc.frequency.linearRampToValueAtTime(110, t + 0.7);

      subGain.gain.setValueAtTime(0.001, t);
      subGain.gain.linearRampToValueAtTime(0.18, t + 0.08);
      subGain.gain.setValueAtTime(0.18, t + 0.6);
      subGain.gain.linearRampToValueAtTime(0.001, t + 0.75);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(t);
      subOsc.stop(t + 0.76);

      // ─── 3. Rapid Digital Intrusion Data-Stutter Beeps (bip-bip-bip) ───
      const beepOsc = this.ctx.createOscillator();
      const beepGain = this.ctx.createGain();
      beepOsc.type = 'triangle';
      beepOsc.frequency.setValueAtTime(2200, t + 0.8);
      beepOsc.frequency.setValueAtTime(1900, t + 0.95);
      beepOsc.frequency.setValueAtTime(2500, t + 1.1);

      beepGain.gain.setValueAtTime(0.001, t + 0.8);
      beepGain.gain.linearRampToValueAtTime(0.2, t + 0.82);
      beepGain.gain.setValueAtTime(0.001, t + 0.92);
      beepGain.gain.setValueAtTime(0.2, t + 0.96);
      beepGain.gain.setValueAtTime(0.001, t + 1.05);
      beepGain.gain.setValueAtTime(0.22, t + 1.12);
      beepGain.gain.linearRampToValueAtTime(0.001, t + 1.25);

      beepOsc.connect(beepGain);
      beepGain.connect(this.masterGain);

      beepOsc.start(t + 0.8);
      beepOsc.stop(t + 1.28);

    } catch (err) {
      console.warn('Hacker siren cycle error:', err);
    }
  }

  /**
   * Starts the continuous hacker intrusion alarm loop
   */
  start() {
    if (this.isPlaying) return;
    if (!this._ensureContext()) return;

    this.isPlaying = true;
    this._triggerSirenCycle();

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.isPlaying) {
        this._triggerSirenCycle();
      }
    }, 1450);
  }

  /**
   * Stops the alarm immediately
   */
  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Plays a single test burst (for admin preview / test button)
   */
  playTestOnce() {
    if (!this._ensureContext()) return;
    const wasPlaying = this.isPlaying;
    this.isPlaying = true;
    this._triggerSirenCycle();
    setTimeout(() => {
      if (!wasPlaying) {
        this.isPlaying = false;
      }
    }, 1350);
  }

  isAlarmPlaying() {
    return this.isPlaying;
  }
}

export const hackerAlarm = new HackerAlarmEngine();
