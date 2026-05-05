/* SayNubian — Curriculum data. Pure data; no React. */

export const VOWELS = [
  { glyph: 'ⲁ', sound: 'a', hint: 'as in "father"' },
  { glyph: 'ⲉ', sound: 'e', hint: 'as in "bed"' },
  { glyph: 'ⲓ', sound: 'i', hint: 'as in "ski"' },
  { glyph: 'ⲟ', sound: 'o', hint: 'as in "go"' },
  { glyph: 'ⲩ', sound: 'u', hint: 'as in "blue"' },
];

export const CONSONANTS = [
  { glyph: 'ⲃ', sound: 'b', hint: 'as in "boy"' },
  { glyph: 'ⲇ', sound: 'd', hint: 'as in "dog"' },
  { glyph: 'ⲅ', sound: 'g', hint: 'as in "go"' },
  { glyph: 'ⲕ', sound: 'k', hint: 'as in "key"' },
  { glyph: 'ⲙ', sound: 'm', hint: 'as in "moon"' },
  { glyph: 'ⲛ', sound: 'n', hint: 'as in "now"' },
  { glyph: 'ⲣ', sound: 'r', hint: 'rolled' },
  { glyph: 'ⲥ', sound: 's', hint: 'as in "see"' },
  { glyph: 'ⲧ', sound: 't', hint: 'as in "top"' },
  { glyph: 'ⲗ', sound: 'l', hint: 'as in "light"' },
  { glyph: 'ϣ', sound: 'sh', hint: 'as in "shoe"' },
  { glyph: 'ϫ', sound: 'j', hint: 'as in "jam"' },
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

export const DIALOGS = [
  { id: 1, title: 'Meeting Someone', theme: 'First introduction', minutes: 3, lines: 8 },
  { id: 2, title: 'Health & Food', theme: 'A doctor visit', minutes: 2, lines: 9 },
  { id: 3, title: 'Home & People', theme: 'Family at home', minutes: 2, lines: 7 },
  { id: 4, title: 'At the Market', theme: 'Shopping for cloth', minutes: 3, lines: 10 },
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
      { id: 'cv', title: 'CV blends', lessons: 3, done: 0, status: 'locked', desc: 'ba, da, ka, ma…' },
      { id: 'cvc', title: 'CVC blends', lessons: 3, done: 0, status: 'locked', desc: 'man, bag, tol…' },
      { id: 'rhythm', title: 'Stress & rhythm', lessons: 2, done: 0, status: 'locked', desc: 'where the beat falls' },
    ],
  },
  {
    id: 'words', n: 3, title: 'Words', subtitle: 'Your first 60',
    glyph: 'ⲙⲁ', color: 'var(--indigo)',
    why: 'Build a core vocabulary of high-utility words.',
    units: [
      { id: 'basics', title: 'Basics', lessons: 4, done: 0, status: 'locked', desc: 'mother · water · house' },
      { id: 'body', title: 'Your body', lessons: 3, done: 0, status: 'locked', desc: 'eye · hand · foot' },
      { id: 'feelings', title: 'Feelings', lessons: 3, done: 0, status: 'locked', desc: 'happy · tired · sick' },
    ],
  },
  {
    id: 'phrases', n: 4, title: 'Phrases', subtitle: 'Talk to people',
    glyph: 'ⲁϣ', color: 'var(--teal)',
    why: 'Fixed expressions you can use today.',
    units: [
      { id: 'greet', title: 'Greetings', lessons: 3, done: 0, status: 'locked', desc: 'good morning · thank you' },
      { id: 'intro', title: 'Introductions', lessons: 2, done: 0, status: 'locked', desc: 'my name is…' },
    ],
  },
  {
    id: 'talk', n: 5, title: 'Talk', subtitle: 'Real conversations',
    glyph: 'ⲇⲱ', color: 'var(--accent-2)',
    why: 'Listen to native speakers — then take their place.',
    units: [
      { id: 'dialog-1', title: 'Meeting Someone', lessons: 1, done: 0, status: 'locked', desc: '8 lines · 3 min' },
      { id: 'dialog-2', title: 'Health & Food', lessons: 1, done: 0, status: 'locked', desc: '9 lines · 2 min' },
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
  { glyph: 'ⲡ', sound: 'p', hint: 'as in "pen"' },
  { glyph: 'ⲍ', sound: 'z', hint: 'as in "zoo"' },
  { glyph: 'ϭ', sound: 'ch', hint: 'as in "chair"' },
];

export const DICT = [
  ...WORDS.basics.map(w => ({ ...w, cat: 'noun' })),
  ...WORDS.feelings.map(w => ({ ...w, cat: 'adj' })),
  ...PHRASES.map(p => ({ en: p.en, nub: p.nub, script: p.script, cat: 'phrase' })),
];

export const NUBIAN_WORDS = { family: WORDS.basics, feelings: WORDS.feelings };
