import JSZip from 'jszip';
import { listEntries, getAudio, extFromMime } from './adminDB.js';

/* ── CSV writer ──────────────────────────────────────────── */
function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function toCSV(rows, columns) {
  const head = columns.join(',');
  const body = rows.map(r => columns.map(c => csvEscape(r[c])).join(',')).join('\n');
  return head + '\n' + body + '\n';
}

/* Save a Blob as a download — no file-saver dep. */
function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Build the export ZIP and trigger a browser download.

   Layout:
     audio/<id>.<ext>           — raw recordings
     manifest.csv               — nubian_audio_pipeline-compatible
     dictionary.json            — saynubian-app compatible
     README.md                  — drop-in instructions

   Returns the chosen filename so the UI can flash it.            */
export async function downloadZip() {
  const entries = await listEntries();
  if (entries.length === 0) throw new Error('Nothing to export.');

  const zip = new JSZip();
  const audioFolder = zip.folder('audio');

  // Pipeline manifest columns (subset of DATASET_SCHEMA + a few app-side extras)
  const pipelineColumns = [
    'recording_id', 'raw_audio_path', 'transcript_path', 'transcript',
    'language', 'dialect', 'speaker_id', 'gender',
    'source_name', 'source_url', 'license', 'permission_status',
    'split', 'notes',
    // app-side extras (pipeline ignores unknown columns)
    'script', 'english', 'arabic', 'category', 'duration_sec',
  ];

  const manifestRows = [];
  const dictEntries = [];

  for (const e of entries) {
    let audioRel = '';
    if (e.has_audio) {
      const blob = await getAudio(e.id);
      if (blob) {
        const ext = extFromMime(blob.type || e.mime || '');
        const fname = `${e.id}.${ext}`;
        audioFolder.file(fname, blob);
        audioRel = `audio/${fname}`;
      }
    }

    manifestRows.push({
      recording_id: e.id,
      raw_audio_path: audioRel,
      transcript_path: '',
      transcript: e.nub || '',
      language: 'Nubian',
      dialect: e.dialect || '',
      speaker_id: e.speaker_id || '',
      gender: '',
      source_name: 'SayNubian admin tool',
      source_url: '',
      license: 'User-owned / explicit speaker consent required',
      permission_status: 'owned_recording',
      split: 'train',
      notes: e.notes || '',
      script: e.script || '',
      english: e.en || '',
      arabic: e.ar || '',
      category: e.category || '',
      duration_sec: e.duration_sec ?? '',
    });

    dictEntries.push({
      nub: e.nub || '',
      script: e.script || '',
      en: e.en || '',
      ar: e.ar || '',
      cat: e.category || '',
      dialect: e.dialect || 'nobiin',
      source: 'SayNubian admin tool',
      audio: audioRel ? audioRel.replace(/^audio\//, 'audio/words/') : '',
    });
  }

  zip.file('manifest.csv', toCSV(manifestRows, pipelineColumns));
  zip.file('dictionary.json', JSON.stringify({
    language: 'Nubian',
    dialect: 'mixed',
    source: 'SayNubian admin tool export',
    exported_at: new Date().toISOString(),
    total: dictEntries.length,
    entries: dictEntries,
  }, null, 0));

  zip.file('README.md', readme(entries.length));

  const blob = await zip.generateAsync({ type: 'blob' });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const fname = `saynubian-admin-export-${stamp}.zip`;
  saveBlob(blob, fname);
  return fname;
}

function readme(count) {
  return `# SayNubian admin export

Generated ${new Date().toISOString()}

Contents
- audio/                       Raw recordings (${count} max — only entries with audio)
- manifest.csv                 Manifest in nubian_audio_pipeline schema
- dictionary.json              SayNubian app schema (entries with romanized "nub", script, en, ar, cat, audio path)
- README.md                    This file

## To feed into the training pipeline

1. Copy audio/* to nubian_audio_pipeline/data/raw/audio/
2. Append manifest.csv rows to configs/manual_files.csv
3. python scripts/run_pipeline.py

## To add into the SayNubian app

1. Copy audio/*.{webm,m4a,mp3} to public/audio/words/ (or transcode to mp3 first
   for smaller bundles; ffmpeg -i in.webm -codec:a libmp3lame -b:a 48k out.mp3)
2. Merge dictionary.json entries into public/data/dictionary.json's "entries" array
3. Rebuild & deploy
`;
}
