// 使用 Web Audio API 合成遊戲音效與音樂
export const AudioSettings = {
  sfxMuted: false,
  bgmMuted: false
};

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

const getCtx = () => {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
};

// 基礎：播放一個音調
const playTone = (freq, type = 'sine', duration = 0.1, volume = 0.15, attack = 0.01, decay = duration) => {
  if (AudioSettings.sfxMuted) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + decay);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration + 0.05);
};

// 噪音產生器（用於衝擊/爆裂音效）
const playNoise = (duration = 0.1, volume = 0.1, filterFreq = 1000) => {
  if (AudioSettings.sfxMuted) return;
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  const source = c.createBufferSource();
  source.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(filterFreq, c.currentTime);

  const gain = c.createGain();
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  source.start(c.currentTime);
  source.stop(c.currentTime + duration + 0.05);
};

// ========== 遊戲音效 ==========

// 🖱️ 滑鼠懸停卡片：輕柔的「嗒」
export const sfxHover = () => {
  playTone(1200, 'sine', 0.06, 0.06, 0.005, 0.06);
};

// 🃏 卡片放置到場上：俐落的「啪」
export const sfxPlace = () => {
  playNoise(0.08, 0.2, 2000);
  playTone(400, 'triangle', 0.1, 0.12, 0.005, 0.1);
};

// ⚔️ 發動攻擊：有力的衝擊音
export const sfxAttack = () => {
  playTone(200, 'sawtooth', 0.15, 0.15, 0.01, 0.15);
  setTimeout(() => {
    playTone(150, 'square', 0.2, 0.12, 0.01, 0.2);
    playNoise(0.15, 0.18, 800);
  }, 50);
};

// 💥 造成傷害：爆裂碎擊感
export const sfxDamage = () => {
  playNoise(0.2, 0.25, 1200);
  playTone(100, 'sawtooth', 0.25, 0.15, 0.005, 0.25);
  setTimeout(() => playNoise(0.15, 0.15, 600), 80);
};

// 🔄 結束回合：柔和的過場音
export const sfxEndTurn = () => {
  playTone(523, 'sine', 0.2, 0.1, 0.02, 0.2);
  setTimeout(() => playTone(659, 'sine', 0.2, 0.1, 0.02, 0.2), 100);
  setTimeout(() => playTone(784, 'sine', 0.3, 0.08, 0.02, 0.3), 200);
};

// 🏆 獲勝：上行勝利旋律
export const sfxVictory = () => {
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 'triangle', 0.3, 0.15, 0.02, 0.3), i * 150);
  });
  setTimeout(() => {
    playTone(1047, 'triangle', 0.6, 0.18, 0.02, 0.6);
    playTone(784, 'sine', 0.6, 0.1, 0.02, 0.6);
  }, 600);
};

// ❌ 操作失敗/提示音
export const sfxError = () => {
  playTone(300, 'square', 0.12, 0.1, 0.01, 0.12);
  setTimeout(() => playTone(200, 'square', 0.15, 0.1, 0.01, 0.15), 100);
};

// ========== 8-bit 背景音樂引擎 ==========

let bgmInterval = null;
let currentStep = 0;

// 簡單的寶可夢風格冒險和弦行進 (C -> F -> G -> C)
const melody = [
  523, 0, 659, 0, 784, 0, 1047, 0, // C E G C
  698, 0, 880, 0, 1047, 0, 1396, 0, // F A C F
  784, 0, 987, 0, 1175, 0, 1568, 0, // G B D G
  523, 659, 784, 1047, 523, 659, 784, 0 // C E G C (快速琶音)
];

const bass = [
  130, 130, 130, 130, // C3
  174, 174, 174, 174, // F3
  196, 196, 196, 196, // G3
  130, 130, 130, 0    // C3
];

const playBGMStep = () => {
  if (AudioSettings.bgmMuted) return;
  const c = getCtx();
  const time = c.currentTime + 0.1; // 預排程一點點時間以確保穩定

  // 主旋律
  const mFreq = melody[currentStep % melody.length];
  if (mFreq) {
    const mOsc = c.createOscillator();
    const mGain = c.createGain();
    mOsc.type = 'square'; // 8-bit 靈魂波形
    mOsc.frequency.setValueAtTime(mFreq, time);
    mGain.gain.setValueAtTime(0.04, time); // 背景音量小一點
    mGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    mOsc.connect(mGain);
    mGain.connect(c.destination);
    mOsc.start(time);
    mOsc.stop(time + 0.15);
  }

  // 低音節奏 (速度是主旋律的一半)
  if (currentStep % 2 === 0) {
    const bFreq = bass[(currentStep / 2) % bass.length];
    if (bFreq) {
      const bOsc = c.createOscillator();
      const bGain = c.createGain();
      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(bFreq, time);
      bGain.gain.setValueAtTime(0.08, time);
      bGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
      bOsc.connect(bGain);
      bGain.connect(c.destination);
      bOsc.start(time);
      bOsc.stop(time + 0.3);
    }
  }

  currentStep++;
};

export const startBGM = () => {
  if (bgmInterval) return; // 已經在播放
  currentStep = 0;
  getCtx().resume(); // 喚醒 AudioContext
  AudioSettings.bgmMuted = false;
  bgmInterval = setInterval(playBGMStep, 150); // 150ms 的 step (節奏輕快)
};

export const stopBGM = () => {
  AudioSettings.bgmMuted = true;
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
};
