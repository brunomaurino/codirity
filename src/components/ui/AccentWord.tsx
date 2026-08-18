/**
 * The HANDOFF §1.2 one-word-per-headline emphasis technique: renders `text`
 * with the FIRST occurrence of `word` wrapped in the `.accent` utility
 * (Instrument Serif Italic), everything else plain. Falls back to the
 * unmodified `text` if `word` isn't found, so a future copy edit that drops
 * the word degrades gracefully instead of throwing or silently truncating.
 *
 * Extracted from Hero.tsx's H1 logic (redesign-v3 Bundle V1) after that
 * bundle's review battery caught a real bug in an earlier version of this
 * same split (branching on the tail's truthiness instead of an explicit
 * "found" check, and using `String.split` — which silently drops text past
 * a second occurrence of the word). Uses `indexOf`/`slice` instead, which
 * doesn't have either failure mode. Centralizing it here means that fix
 * only had to happen once, not be re-discovered by every bundle that needs
 * the same treatment (V3/V6/V8 per the HANDOFF).
 */
export function AccentWord({ text, word }: { text: string; word: string }) {
  const index = text.indexOf(word);
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <span className="accent">{word}</span>
      {text.slice(index + word.length)}
    </>
  );
}
