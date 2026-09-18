import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration } from './extract.ts';

// Note: decodeVideoAudio/extractAudioAsWav need a real browser AudioContext
// (video demuxing + decoding) and are verified live in the browser instead —
// see PORTFOLIO.md for this app's live-verification method.

test('formatDuration renders m:ss', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(95), '1:35');
  assert.equal(formatDuration(NaN), '0:00');
  assert.equal(formatDuration(-3), '0:00');
});
