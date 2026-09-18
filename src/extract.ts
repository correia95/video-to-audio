import { encodeWav } from './wav-encoder.ts';

export interface DecodedAudio {
  sampleRate: number;
  channels: Float32Array[];
  duration: number;
}

// AudioContext.decodeAudioData can demux and decode the audio track directly
// out of a video file's bytes (MP4/WebM container) in most browsers — no
// real-time playback needed, unlike video capture/mute, which do need it.
export async function decodeVideoAudio(bytes: Uint8Array): Promise<DecodedAudio> {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const buffer = await ctx.decodeAudioData(bytes.slice().buffer as ArrayBuffer);
    const channels: Float32Array[] = [];
    for (let c = 0; c < buffer.numberOfChannels; c++) channels.push(buffer.getChannelData(c));
    return { sampleRate: buffer.sampleRate, channels, duration: buffer.duration };
  } finally {
    ctx.close();
  }
}

export async function extractAudioAsWav(bytes: Uint8Array): Promise<{ wav: Uint8Array; duration: number }> {
  const decoded = await decodeVideoAudio(bytes);
  const wav = encodeWav(decoded.channels, decoded.sampleRate);
  return { wav: new Uint8Array(wav), duration: decoded.duration };
}

export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const s = Math.round(totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}
