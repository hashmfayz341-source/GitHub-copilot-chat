/**
 * Assign a delivery direction to every line from its context in the script.
 *
 * One tag per character would produce exactly the audiobook flatness this
 * episode must avoid. Delivery is neutral here ("curious", "dry"); each
 * provider adapter renders it into whatever that vendor understands.
 *
 * The dialogue text itself is never touched.
 */
import fs from 'node:fs';

const P = 'src/v2-ar/voice/lines-ar.json';
const doc = JSON.parse(fs.readFileSync(P, 'utf8'));
const lines = doc.lines;

/** Salem gets the jokes; these are the beats that should land light, not loud. */
const COMIC = /تكفى|القروب|أغنية|الطرب|يا ساتر|خلاص|وش دخل|لا تضيفهم|ولا الأولى|يوافق إصبعك/;
/** an explicit correction, not a new explanation */
const CORRECTS = /^(لا|ولا|مو )|ما يدري|مو صحيح|غلط|مو كذا/;

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  const prev = lines[i - 1];
  const asks = /؟\s*$/.test(l.text);
  let d;

  if (l.idx === 85) {
    // The Abduction memory hook. [singing] was auditioned and measured: its
    // pitch span and note sustain came back identical to Salem's ordinary
    // speech, i.e. the model does not actually sing. Faking a bad song would
    // be worse than not singing, so this is a short exaggerated spoken lament.
    d = 'dramatic';
  } else if (l.speaker === 'Noura') {
    // she is funny because she is flat and correct, never because she pushes
    d = 'dry';
  } else if (asks && l.pauseAfter > 0) {
    // a retrieval question: asked openly, leaving the thinking space to the edit
    d = 'question';
  } else if (asks) {
    d = 'curious';
  } else if (l.speaker === 'Salem' && COMIC.test(l.text)) {
    d = 'amused';
  } else if (l.speaker === 'Salem' && prev?.pauseAfter > 0) {
    // answering a retrieval question he has just worked out
    d = 'confident';
  } else if (CORRECTS.test(l.text.trim())) {
    d = 'correcting';
  } else {
    d = l.speaker === 'Rashid' ? 'calm' : 'casual';
  }
  l.delivery = d;
}

fs.writeFileSync(P, JSON.stringify({...doc, lines}, null, 1));
const tally = lines.reduce((a, l) => ((a[l.delivery] = (a[l.delivery] ?? 0) + 1), a), {});
console.log('delivery assigned:', JSON.stringify(tally));
for (const sp of ['Rashid', 'Salem', 'Noura']) {
  const t = lines.filter((l) => l.speaker === sp).reduce((a, l) => ((a[l.delivery] = (a[l.delivery] ?? 0) + 1), a), {});
  console.log(`  ${sp.padEnd(7)} ${JSON.stringify(t)}`);
}
