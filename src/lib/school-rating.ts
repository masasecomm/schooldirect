/** Deterministic per-school rating between 3.0 and 5.0 (one decimal). */
export const ratingForSchool = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const steps = hash % 21;
  return Math.round((3 + steps / 10) * 10) / 10;
};

/** Pseudo review count derived from the school id. */
export const reviewCountForSchool = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 17 + id.charCodeAt(i)) >>> 0;
  }
  return 12 + (hash % 88);
};