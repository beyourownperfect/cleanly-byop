let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function haptic(type: 'light' | 'medium' | 'heavy'): void {
  if (!navigator.vibrate) return;
  const durations = { light: 8, medium: 15, heavy: 30 };
  navigator.vibrate(durations[type]);
}

/** Soft wooden thud — object returns home */
export function playReturnHome(): void {
  const c = getCtx();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.25);
  haptic('medium');
}

/** Gentle ceramic tap — pressing a button */
export function playTap(): void {
  const c = getCtx();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(500, now + 0.04);
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.06);
  haptic('light');
}

/** Soft paper whoosh — sheet or card opening */
export function playWhoosh(): void {
  const c = getCtx();
  const now = c.currentTime;
  const noise = c.createBufferSource();
  const buffer = c.createBuffer(1, c.sampleRate * 0.18, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  noise.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(250, now);
  filter.frequency.exponentialRampToValueAtTime(500, now + 0.12);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  noise.connect(filter).connect(gain).connect(c.destination);
  noise.start(now);
}

/** Gentle warm chime — everything at peace */
export function playPeace(): void {
  const c = getCtx();
  const now = c.currentTime;
  [523, 659, 784].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + i * 0.15);
    gain.gain.linearRampToValueAtTime(0.06, now + i * 0.15 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.6);
    osc.connect(gain).connect(c.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.6);
  });
  haptic('light');
}

/** Notebook closing — journal save complete */
export function playJournalSave(): void {
  const c = getCtx();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.15);
  haptic('light');
}

/** Soft wooden click — object selected, transition applied */
export function playComplete(): void {
  const c = getCtx();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.1);
  haptic('light');
}

/** Mechanical tick — railway station advance */
export function playRailAdvance(): void {
  const c = getCtx();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.05);
  haptic('light');
}

/** Ceramic tap — lifecycle moment completed */
export function playMomentComplete(): void {
  const c = getCtx();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.15);
  haptic('light');
}
