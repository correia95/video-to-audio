# Video to Audio

Extract the audio track from a video as a WAV file, entirely in the browser. Covers "Video → MP3"
(output is WAV instead — see the FAQ for why). React + TypeScript + Vite, deployed as a static
Cloudflare Worker.

- Drag-and-drop or file picker upload
- Uses `AudioContext.decodeAudioData()` directly on the video file's bytes — the browser's media
  framework demuxes and decodes the audio track without needing real-time playback
- Nothing is uploaded

## Dev

```
npm install
npm run dev
npm run build
npm run deploy
```
