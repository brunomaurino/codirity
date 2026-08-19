/** ⚠️ v4 W0: the four blob gradients are RETIRED — every blob-* class now
 * aliases ONE flat interim surface (ground-2 under chalk), so the rotation
 * apparatus below is a NO-OP kept only so consumers compile until their own
 * bundles (W2–W5) rework them. W6 deletes this file.
 *
 * The 4 blob-gradient utility classes shipped in globals.css (HANDOFF-
 * redesign-v3 §1.3, V0). A shared, typed list rather than each consumer
 * writing its own string literals — a typo in a bare `string` prop compiles
 * clean and silently renders an unstyled card (Tailwind emits nothing for
 * an unknown class name), which `BlobClass` catches at compile time instead.
 */
export const BLOB_CLASSES = ["blob-1", "blob-2", "blob-3", "blob-4"] as const;

export type BlobClass = (typeof BLOB_CLASSES)[number];
