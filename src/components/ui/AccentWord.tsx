/**
 * The HANDOFF §1.2 one-word-per-headline emphasis technique: renders `text`
 * with the FIRST WHOLE-WORD occurrence of `word` wrapped in the `.accent`
 * utility (Instrument Serif Italic), everything else plain. Falls back to
 * the unmodified `text` if `word` isn't found, so a future copy edit that
 * drops the word degrades gracefully instead of throwing or silently
 * truncating.
 *
 * Modelled on Hero.tsx's H1 logic (redesign-v3 Bundle V1) after that
 * bundle's review battery caught a real bug in an earlier version of that
 * split (branching on the tail's truthiness instead of an explicit "found"
 * check, and using `String.split` — which silently drops text past a second
 * occurrence of the word). Uses `indexOf`/`slice` instead, which doesn't
 * have either failure mode — plus a word-boundary check neither Hero.tsx's
 * original nor this component's own first version had (found in V2's own
 * review battery: a raw substring match could split mid-token if a future
 * copy edit lengthened the target word into a longer one that contains it,
 * e.g. accenting "art" inside "party"). NOTE: Hero.tsx itself has NOT been
 * migrated to use this component — it still carries its own independent
 * (behaviorally equivalent) copy of the pre-word-boundary-fix logic. That's
 * an outstanding follow-up, not done here to avoid re-touching an
 * already-shipped, already-reviewed file from a different bundle.
 */
export function AccentWord({ text, word }: { text: string; word: string }) {
  const isWordChar = (c: string | undefined) => c !== undefined && /\w/.test(c);

  let searchFrom = 0;
  let index = -1;
  while (searchFrom <= text.length) {
    const candidate = text.indexOf(word, searchFrom);
    if (candidate === -1) break;
    const before = candidate > 0 ? text[candidate - 1] : undefined;
    const after = text[candidate + word.length];
    if (!isWordChar(before) && !isWordChar(after)) {
      index = candidate;
      break;
    }
    searchFrom = candidate + 1;
  }

  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <span className="accent">{word}</span>
      {text.slice(index + word.length)}
    </>
  );
}
