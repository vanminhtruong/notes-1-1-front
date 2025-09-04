// Simple bell-like sound using Web Audio API
// Plays a short two-tone chime without needing any audio assets.
let audioCtx: AudioContext | null = null;
let unlocked = false;
let ringIntervalId: number | null = null;

const getCtx = () => {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    return audioCtx;
  } catch {
    return null;
  }
};

function tone(freq: number, durationMs: number, startAt: number, volume = 0.25) {
  const ctx = getCtx();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  // Sine is clearer and more audible than triangle at same gain
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.value = 0;
  o.connect(g);
  g.connect(ctx.destination);

  const now = ctx.currentTime + startAt;
  // Quick attack and exponential decay for bell feel
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  o.start(now);
  o.stop(now + durationMs / 1000 + 0.05);
  // Cleanup after stop
  o.onended = () => {
    try { o.disconnect(); } catch {}
    try { g.disconnect(); } catch {}
  };
}

export async function unlockAudioOnce() {
  const ctx = getCtx();
  if (!ctx || unlocked) return;
  const tryResume = async () => {
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      unlocked = ctx.state === 'running';
      if (unlocked) {
        try {
          window.dispatchEvent(new CustomEvent('audio-unlocked'));
        } catch {}
        window.removeEventListener('pointerdown', tryResume);
        window.removeEventListener('keydown', tryResume);
        window.removeEventListener('touchstart', tryResume);
      }
    } catch {}
  };
  window.addEventListener('pointerdown', tryResume, { once: true });
  window.addEventListener('keydown', tryResume, { once: true });
  window.addEventListener('touchstart', tryResume, { once: true });
}

export async function playReminderBell() {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      try { await ctx.resume(); } catch {}
    }
    // Re-check outside the narrowing block so TS doesn't assume it cannot be 'running'
    if (ctx.state !== 'running') return; // blocked by autoplay policy
    // Two quick tones: ding-dong (louder and clearer)
    tone(880, 380, 0, 0.50);
    tone(659.25, 440, 0.20, 0.42);
  } catch {
    // no-op if blocked by autoplay policies
  }
}

export function startReminderRinging(intervalMs = 4500) {
  // If already ringing, do nothing
  if (ringIntervalId !== null) return;
  // Play immediately once
  void playReminderBell();
  // Then keep ringing until stopped
  ringIntervalId = window.setInterval(() => {
    void playReminderBell();
  }, intervalMs);
}

export function stopReminderRinging() {
  if (ringIntervalId !== null) {
    clearInterval(ringIntervalId);
    ringIntervalId = null;
  }
}
