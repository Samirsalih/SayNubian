/* SayNubian — Curriculum data. Pure data; no React.
   `audio` paths point to native-speaker recordings under public/audio/.
   When absent, screens fall back to system TTS via speak().

   All current curriculum content is tagged dialect="nobiin" — that's
   what every shipped recording is. Architecture is multi-dialect
   ready: see public/audio/manifest.json for available_dialects and
   permission_status per recording. Add Kenzi/Dongolawi by dropping
   files in and updating the manifest; no code change needed. */

export const DIALECTS = [
  { id: 'nobiin',     label: 'Nobiin',             available: true,  notes: 'Most widely spoken Nile Nubian variety. All current recordings.' },
  { id: 'kenzi',      label: 'Kenzi (Mattokki)',   available: false, notes: 'Northern Nile Nubian. No recordings yet.' },
  { id: 'dongolawi',  label: 'Dongolawi (Andaandi)', available: false, notes: 'Southern Nile Nubian. No recordings yet.' },
];

export const DEFAULT_DIALECT = 'nobiin';

const ALPHABET_DIR = 'audio/alphabet';

export const VOWELS = [
  { glyph: 'ⲁ', sound: 'a', hint: 'as in "father"', audio: `${ALPHABET_DIR}/a.mp3` },
  { glyph: 'ⲉ', sound: 'e', hint: 'as in "bed"', audio: `${ALPHABET_DIR}/e.mp3` },
  { glyph: 'ⲓ', sound: 'i', hint: 'as in "ski"', audio: `${ALPHABET_DIR}/i.mp3` },
  { glyph: 'ⲟ', sound: 'o', hint: 'as in "go"', audio: `${ALPHABET_DIR}/o.mp3` },
  { glyph: 'ⲩ', sound: 'u', hint: 'as in "blue"', audio: `${ALPHABET_DIR}/u.mp3` },
];

export const CONSONANTS = [
  { glyph: 'ⲃ', sound: 'b', hint: 'as in "boy"', audio: `${ALPHABET_DIR}/b.mp3` },
  { glyph: 'ⲇ', sound: 'd', hint: 'as in "dog"', audio: `${ALPHABET_DIR}/d.mp3` },
  { glyph: 'ⲅ', sound: 'g', hint: 'as in "go"', audio: `${ALPHABET_DIR}/g.mp3` },
  { glyph: 'ⲕ', sound: 'k', hint: 'as in "key"', audio: `${ALPHABET_DIR}/k.mp3` },
  { glyph: 'ⲙ', sound: 'm', hint: 'as in "moon"', audio: `${ALPHABET_DIR}/m.mp3` },
  { glyph: 'ⲛ', sound: 'n', hint: 'as in "now"', audio: `${ALPHABET_DIR}/n.mp3` },
  { glyph: 'ⲣ', sound: 'r', hint: 'rolled', audio: `${ALPHABET_DIR}/r.mp3` },
  { glyph: 'ⲥ', sound: 's', hint: 'as in "see"', audio: `${ALPHABET_DIR}/s.mp3` },
  { glyph: 'ⲧ', sound: 't', hint: 'as in "top"', audio: `${ALPHABET_DIR}/t.mp3` },
  { glyph: 'ⲗ', sound: 'l', hint: 'as in "light"', audio: `${ALPHABET_DIR}/l.mp3` },
  { glyph: 'ϣ', sound: 'sh', hint: 'as in "shoe"' /* no native file */ },
  { glyph: 'ϫ', sound: 'j', hint: 'as in "jam"', audio: `${ALPHABET_DIR}/j.mp3` },
];

export const MINIMAL_PAIRS = [
  { a: { script: 'ⲕⲁⲃ', nub: 'kab', en: 'jaw' },
    b: { script: 'ⲕⲁⲁⲃ', nub: 'kaab', en: 'hungry' },
    note: 'Vowel length is meaningful' },
  { a: { script: 'ⲇⲟⲗ', nub: 'dol', en: 'place' },
    b: { script: 'ⲧⲟⲗ', nub: 'tol', en: 'top' },
    note: 'Voiced vs voiceless' },
  { a: { script: 'ⲣⲁⲙ', nub: 'ram', en: 'eat' },
    b: { script: 'ⲗⲁⲙ', nub: 'lam', en: 'meet' },
    note: 'r vs l — common confusion' },
];

export const SYLLABLES = [
  { script: 'ⲃⲁ', nub: 'ba' }, { script: 'ⲇⲁ', nub: 'da' },
  { script: 'ⲕⲁ', nub: 'ka' }, { script: 'ⲙⲁ', nub: 'ma' },
  { script: 'ⲛⲁ', nub: 'na' }, { script: 'ⲥⲁ', nub: 'sa' },
  { script: 'ⲗⲓ', nub: 'li' }, { script: 'ⲣⲓ', nub: 'ri' },
  { script: 'ⲧⲟ', nub: 'to' }, { script: 'ⲛⲟ', nub: 'no' },
];

export const WORDS = {
  basics: [
    { en: 'mother', nub: 'eeni', ipa: '[eː.ni]', script: 'ⲉⲉⲛⲓ' },
    { en: 'father', nub: 'baaba', ipa: '[baː.ba]', script: 'ⲃⲁⲁⲃⲁ' },
    { en: 'water', nub: 'aman', ipa: '[a.man]', script: 'ⲁⲙⲁⲛ' },
    { en: 'house', nub: 'noog', ipa: '[noːg]', script: 'ⲛⲟⲟⲅ' },
    { en: 'sun', nub: 'masil', ipa: '[ma.sil]', script: 'ⲙⲁⲥⲓⲗ' },
    { en: 'friend', nub: 'gondi', ipa: '[gon.di]', script: 'ⲅⲟⲛⲇⲓ' },
  ],
  body: [
    { en: 'eye', nub: 'maan', ipa: '[maːn]', script: 'ⲙⲁⲁⲛ' },
    { en: 'hand', nub: 'eddi', ipa: '[ed.di]', script: 'ⲉⲇⲇⲓ' },
    { en: 'foot', nub: 'osseg', ipa: '[os.seg]', script: 'ⲟⲥⲥⲉⲅ' },
    { en: 'head', nub: 'ur', ipa: '[uɾ]', script: 'ⲩⲣ' },
  ],
  feelings: [
    { en: 'happy', nub: 'duumin', ipa: '[duː.min]', script: 'ⲇⲩⲩⲙⲓⲛ' },
    { en: 'tired', nub: 'gaaru', ipa: '[gaː.ru]', script: 'ⲅⲁⲁⲣⲩ' },
    { en: 'hungry', nub: 'kaab', ipa: '[kaːb]', script: 'ⲕⲁⲁⲃ' },
    { en: 'sick', nub: 'koongir', ipa: '[koː.ŋir]', script: 'ⲕⲟⲟⲛⲅⲓⲣ' },
  ],
};

export const PHRASES = [
  { en: 'good morning', nub: 'masha sirri', script: 'ⲙⲁϣⲁ ⲥⲓⲣⲣⲓ', use: 'before noon' },
  { en: 'thank you', nub: 'ashri', script: 'ⲁϣⲣⲓ', use: 'always polite' },
  { en: 'how are you?', nub: 'ma arrik?', script: 'ⲙⲁ ⲁⲣⲣⲓⲕ?', use: 'casual greeting' },
  { en: 'I am fine', nub: 'sirri-ai', script: 'ⲥⲓⲣⲣⲓ-ⲁⲓ', use: 'standard reply' },
  { en: 'my name is…', nub: 'aiyi nem-ai…', script: 'ⲁⲓⲩⲓ ⲛⲉⲙ-ⲁⲓ…', use: 'introduction' },
];

/* DIALOGS — wired up to the actual Napata recordings (page 1-6 from
   napata.org's Nubian Language CD). Titles and English glosses below
   were derived from the original site's text-image filenames; the
   `audio` paths point to MP3s in public/audio/dialogs/ that ship in
   both the web bundle and the Capacitor native apps. */
const DIALOG_DIR = 'audio/dialogs';

export const DIALOGS = [
  {
    id: 1,
    title: 'Meeting Someone',
    theme: 'First introduction',
    minutes: 2,
    audio: `${DIALOG_DIR}/page2/dial2.mp3`,
    lines: [
      { en: 'Come here.',                  audio: `${DIALOG_DIR}/page2/ds21.mp3` },
      { en: 'What is your name?',          audio: `${DIALOG_DIR}/page2/ds22.mp3` },
      { en: 'What do you want?',           audio: `${DIALOG_DIR}/page2/ds23.mp3` },
      { en: 'Where did you come from?',    audio: `${DIALOG_DIR}/page2/ds24.mp3` },
      { en: 'When did you come?',          audio: `${DIALOG_DIR}/page2/ds25.mp3` },
      { en: 'Why did you come?',           audio: `${DIALOG_DIR}/page2/ds26.mp3` },
      { en: 'With what did you come?',     audio: `${DIALOG_DIR}/page2/ds27.mp3` },
      { en: 'Who came with you?',          audio: `${DIALOG_DIR}/page2/ds28.mp3` },
    ],
  },
  {
    id: 2,
    title: 'Health & Food',
    theme: 'A doctor visit',
    minutes: 2,
    audio: `${DIALOG_DIR}/page1/dial1.mp3`,
    lines: [
      { en: 'How are you?',                audio: `${DIALOG_DIR}/page1/ds11.mp3` },
      { en: 'What is hurting you?',        audio: `${DIALOG_DIR}/page1/ds12.mp3` },
      { en: 'Have you been to a doctor?',  audio: `${DIALOG_DIR}/page1/ds13.mp3` },
      { en: 'What did the doctor say?',    audio: `${DIALOG_DIR}/page1/ds14.mp3` },
      { en: 'Are you hungry?',             audio: `${DIALOG_DIR}/page1/ds15.mp3` },
      { en: 'Are you thirsty for water?',  audio: `${DIALOG_DIR}/page1/ds16.mp3` },
      { en: 'Bring me some water.',        audio: `${DIALOG_DIR}/page1/ds17.mp3` },
      { en: 'A lot of water.',             audio: `${DIALOG_DIR}/page1/ds18.mp3` },
      { en: 'Not enough food.',            audio: `${DIALOG_DIR}/page1/ds19.mp3` },
    ],
  },
  {
    id: 3,
    title: 'Home & People',
    theme: 'Family and friends',
    minutes: 2,
    audio: `${DIALOG_DIR}/page3/dial3.mp3`,
    lines: [
      { en: 'Where do you live?',          audio: `${DIALOG_DIR}/page3/ds31.mp3` },
      { en: 'With whom do you live?',      audio: `${DIALOG_DIR}/page3/ds32.mp3` },
      { en: 'Is your dad home?',           audio: `${DIALOG_DIR}/page3/ds33.mp3` },
      { en: 'He is travelling.',           audio: `${DIALOG_DIR}/page3/ds34.mp3` },
      { en: 'Have you seen Ali?',          audio: `${DIALOG_DIR}/page3/ds35.mp3` },
      { en: 'Where is he now?',            audio: `${DIALOG_DIR}/page3/ds36.mp3` },
      { en: 'What is he doing?',           audio: `${DIALOG_DIR}/page3/ds37.mp3` },
    ],
  },
  {
    id: 4,
    title: 'Plans & Money',
    theme: 'Daily life and visits',
    minutes: 2,
    audio: `${DIALOG_DIR}/page4/dial4.mp3`,
    lines: [
      { en: 'Can you write?',              audio: `${DIALOG_DIR}/page4/ds41.mp3` },
      { en: 'Can you swim?',               audio: `${DIALOG_DIR}/page4/ds42.mp3` },
      { en: "Why didn't you learn?",       audio: `${DIALOG_DIR}/page4/ds43.mp3` },
      { en: 'Do you have money?',          audio: `${DIALOG_DIR}/page4/ds44.mp3` },
      { en: 'What did you buy?',           audio: `${DIALOG_DIR}/page4/ds45.mp3` },
      { en: 'How much did it cost?',       audio: `${DIALOG_DIR}/page4/ds46.mp3` },
      { en: 'I will visit you tomorrow.',  audio: `${DIALOG_DIR}/page4/ds47.mp3` },
      { en: 'I will come at night.',       audio: `${DIALOG_DIR}/page4/ds48.mp3` },
      { en: 'Wait for me at the house.',   audio: `${DIALOG_DIR}/page4/ds49.mp3` },
    ],
  },
  {
    id: 5,
    title: 'The Dog and the Cat',
    theme: 'Pets and animals',
    minutes: 2,
    audio: `${DIALOG_DIR}/page6/dial6.mp3`,
    lines: [
      { en: 'The dog hates the cat.',      audio: `${DIALOG_DIR}/page6/ds61.mp3` },
      { en: 'Get that dog out.',           audio: `${DIALOG_DIR}/page6/ds62.mp3` },
      { en: 'Let it go out.',              audio: `${DIALOG_DIR}/page6/ds63.mp3` },
      { en: 'Let it sleep.',               audio: `${DIALOG_DIR}/page6/ds64.mp3` },
      { en: 'The dog is better than the cat.', audio: `${DIALOG_DIR}/page6/ds65.mp3` },
      { en: 'Who killed the cat?',         audio: `${DIALOG_DIR}/page6/ds66.mp3` },
      { en: 'Who hit the cat?',            audio: `${DIALOG_DIR}/page6/ds67.mp3` },
      { en: 'Do not hit.',                 audio: `${DIALOG_DIR}/page6/ds68.mp3` },
      { en: 'Let it live.',                audio: `${DIALOG_DIR}/page6/ds69.mp3` },
    ],
  },
];

export const STAGES = [
  {
    id: 'sounds', n: 1, title: 'Sounds', subtitle: 'Train your ear',
    glyph: 'ⲁ', color: 'var(--accent)',
    why: "You can't say what you can't hear.",
    units: [
      { id: 'vowels', title: '5 Vowels', lessons: 3, done: 3, status: 'done', desc: 'a · e · i · o · u' },
      { id: 'consonants', title: '12 Consonants', lessons: 4, done: 2, status: 'active', desc: 'b · d · g · k · m · n …' },
      { id: 'pairs', title: 'Minimal Pairs', lessons: 2, done: 0, status: 'unlocked', desc: 'long vs. short, r vs. l' },
    ],
  },
  {
    id: 'syllables', n: 2, title: 'Syllables', subtitle: 'Blend the sounds',
    glyph: 'ⲃⲁ', color: 'var(--gold)',
    why: 'Sounds combine into syllables — the building block of every word.',
    units: [
      { id: 'cv', title: 'CV blends', lessons: 3, done: 0, status: 'unlocked', desc: 'ba, da, ka, ma…' },
      { id: 'cvc', title: 'CVC blends', lessons: 3, done: 0, status: 'unlocked', desc: 'man, bag, tol…' },
      { id: 'rhythm', title: 'Stress & rhythm', lessons: 2, done: 0, status: 'unlocked', desc: 'where the beat falls' },
    ],
  },
  {
    id: 'words', n: 3, title: 'Words', subtitle: 'Your first 60',
    glyph: 'ⲙⲁ', color: 'var(--indigo)',
    why: 'Build a core vocabulary of high-utility words.',
    units: [
      { id: 'basics', title: 'Basics', lessons: 4, done: 0, status: 'unlocked', desc: 'mother · water · house' },
      { id: 'body', title: 'Your body', lessons: 3, done: 0, status: 'unlocked', desc: 'eye · hand · foot' },
      { id: 'feelings', title: 'Feelings', lessons: 3, done: 0, status: 'unlocked', desc: 'happy · tired · sick' },
    ],
  },
  {
    id: 'phrases', n: 4, title: 'Phrases', subtitle: 'Talk to people',
    glyph: 'ⲁϣ', color: 'var(--teal)',
    why: 'Fixed expressions you can use today.',
    units: [
      { id: 'greet', title: 'Greetings', lessons: 3, done: 0, status: 'unlocked', desc: 'good morning · thank you' },
      { id: 'intro', title: 'Introductions', lessons: 2, done: 0, status: 'unlocked', desc: 'my name is…' },
    ],
  },
  {
    id: 'talk', n: 5, title: 'Talk', subtitle: 'Real conversations',
    glyph: 'ⲇⲱ', color: 'var(--accent-2)',
    why: 'Listen to native speakers — then take their place.',
    units: [
      { id: 'dialog-1', title: 'Meeting Someone',         lessons: 1, done: 0, status: 'unlocked', desc: '8 lines · native voice' },
      { id: 'dialog-2', title: 'Health & Food',           lessons: 1, done: 0, status: 'unlocked', desc: '9 lines · native voice' },
      { id: 'dialog-3', title: 'Home & People',           lessons: 1, done: 0, status: 'unlocked', desc: '7 lines · native voice' },
      { id: 'dialog-4', title: 'Plans & Money',           lessons: 1, done: 0, status: 'unlocked', desc: '9 lines · native voice' },
      { id: 'dialog-5', title: 'The Dog and the Cat',     lessons: 1, done: 0, status: 'unlocked', desc: '9 lines · native voice' },
    ],
  },
];

export const REVIEW_DUE = [
  { kind: 'sound', label: 'ⲁ', detail: 'vowel · "a"', due: 'now' },
  { kind: 'sound', label: 'ⲩ', detail: 'vowel · "u"', due: '2m' },
  { kind: 'word', label: 'ⲉⲉⲛⲓ', detail: '"mother"', due: '5m' },
  { kind: 'word', label: 'ⲁⲙⲁⲛ', detail: '"water"', due: '8m' },
];

export const ALPHABET = [
  ...VOWELS,
  ...CONSONANTS,
  { glyph: 'ⲡ', sound: 'p', hint: 'as in "pen"', audio: `${ALPHABET_DIR}/p.mp3` },
  { glyph: 'ⲍ', sound: 'z', hint: 'as in "zoo"', audio: `${ALPHABET_DIR}/z.mp3` },
  { glyph: 'ϭ', sound: 'ch', hint: 'as in "chair"' /* no native file */ },
];

export const DICT = [
  ...WORDS.basics.map(w => ({ ...w, cat: 'noun' })),
  ...WORDS.feelings.map(w => ({ ...w, cat: 'adj' })),
  ...PHRASES.map(p => ({ en: p.en, nub: p.nub, script: p.script, cat: 'phrase' })),
];

export const NUBIAN_WORDS = { family: WORDS.basics, feelings: WORDS.feelings };
