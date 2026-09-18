import { useCallback, useState } from 'react';
import { formatDuration } from './extract';
import { readableSize } from './wav-encoder';

export default function App() {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outInfo, setOutInfo] = useState<{ duration: number; bytes: number } | null>(null);

  const loadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('That is not a video file.');
      return;
    }
    if (file.size > 300 * 1024 * 1024) {
      setError('That video is over 300 MB — try a smaller file.');
      return;
    }
    setError('');
    setOutUrl(null);
    setFileName(file.name);
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { extractAudioAsWav } = await import('./extract');
      const { wav, duration } = await extractAudioAsWav(bytes);
      const blob = new Blob([wav.slice().buffer], { type: 'audio/wav' });
      setOutUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
      setOutInfo({ duration, bytes: blob.size });
    } catch {
      setError("Could not extract audio — this video may have no audio track, or an unsupported format.");
    }
    setBusy(false);
  }, []);

  function reset() {
    setFileName('');
    setError('');
    setOutUrl((u) => { if (u) URL.revokeObjectURL(u); return null; });
    setOutInfo(null);
  }

  return (
    <div className="page">
      <h1>Video to Audio</h1>
      <p className="lede">
        Extract the audio track from a video as a WAV file. Everything runs in your browser;
        nothing is uploaded.
      </p>

      {!outInfo && !busy && (
        <div
          className={`drop${dragOver ? ' over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) loadFile(file);
          }}
        >
          <p>Drag a video here, or</p>
          <label className="filebtn">
            Choose a video
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) loadFile(file);
              }}
            />
          </label>
          {error && <p className="err">{error}</p>}
        </div>
      )}

      {busy && <p className="hint">Extracting audio from {fileName}…</p>}

      {outInfo && outUrl && (
        <div className="result">
          <p className="filelabel">{fileName}</p>
          <audio controls src={outUrl} className="player" />
          <p className="hint">{formatDuration(outInfo.duration)} · {readableSize(outInfo.bytes)} · WAV</p>
          <div className="actions">
            <a className="primary" href={outUrl} download={`${fileName.replace(/\.[^.]+$/, '') || 'audio'}.wav`}>Download</a>
            <button className="ghost" onClick={reset}>Choose a different video</button>
          </div>
        </div>
      )}

      <section className="explainer">
        <h2>How it works</h2>
        <p>
          Your browser's audio decoder reads the audio track directly out of the video file — the
          same decoding path it uses to play the video — and re-encodes it as a WAV file.
        </p>
        <h3>Does this upload my video anywhere?</h3>
        <p>No. Decoding and encoding both happen locally; your file never leaves your device.</p>
        <h3>Why WAV and not MP3?</h3>
        <p>
          Re-encoding to MP3 needs a licensed encoder library, which this tool deliberately
          avoids. WAV is uncompressed but lossless and opens everywhere.
        </p>
      </section>
    </div>
  );
}
