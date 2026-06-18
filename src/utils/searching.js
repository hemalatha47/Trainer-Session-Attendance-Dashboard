/**
 * searching.js
 * Reusable, stateless search/filter utility for in-memory datasets.
 * Module: B3.4
 *
 * Supports multi-field search with case-insensitive partial matching.
 * Used by service methods (batch, student, attendance) and DataTable components.
 */

// ── Core search function ──────────────────────────────────────────────────────

/**
 * Filters an array of objects by a search query against one or more fields.
 * Performs case-insensitive, partial-string matching.
 * Returns a copy — does not mutate the source array.
 *
 * @template T
 * @param {T[]}      items    - Array of objects to search
 * @param {string}   query    - Search string (empty/null returns all items)
 * @param {string[]} fields   - Object keys to search against
 * @returns {T[]}
 *
 * @example
 *   const results = searchData(students, 'arun', ['name', 'studentCode', 'email']);
 *   const batches = searchData(batches, 'react', ['batchName', 'batchCode']);
 */
export const searchData = (items, query, fields) => {
  if (!Array.isArray(items)) return [];
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [...items];
  }
  if (!Array.isArray(fields) || fields.length === 0) return [...items];

  const q = query.trim().toLowerCase();

  return items.filter((item) =>
    fields.some((field) => {
      const value = item?.[field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(q);
    })
  );
};

// ── Highlight helper (for UI) ─────────────────────────────────────────────────

/**
 * Returns an array of { text, highlight } segments for bolding matched substrings.
 * Use in React components to render <strong>match</strong> within text.
 *
 * @param {string} text   - The full text to segment
 * @param {string} query  - The search query
 * @returns {Array<{ text: string, highlight: boolean }>}
 *
 * @example
 *   highlightMatches('Arun Kumar', 'run')
 *   // → [{ text: 'A', highlight: false }, { text: 'run', highlight: true }, ...]
 */
export const highlightMatches = (text, query) => {
  if (!text || !query || query.trim().length === 0) {
    return [{ text: String(text ?? ''), highlight: false }];
  }

  const q      = query.trim().toLowerCase();
  const str    = String(text);
  const lower  = str.toLowerCase();
  const parts  = [];
  let   cursor = 0;

  while (cursor < str.length) {
    const idx = lower.indexOf(q, cursor);
    if (idx === -1) {
      parts.push({ text: str.slice(cursor), highlight: false });
      break;
    }
    if (idx > cursor) {
      parts.push({ text: str.slice(cursor, idx), highlight: false });
    }
    parts.push({ text: str.slice(idx, idx + q.length), highlight: true });
    cursor = idx + q.length;
  }

  return parts;
};

// ── Debounce helper (for React controlled inputs) ─────────────────────────────

/**
 * Returns a debounced version of a function.
 * Use this in hooks wrapping SearchBar onChange callbacks.
 *
 * @param {Function} fn
 * @param {number}   [delay=300]  - Milliseconds
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ── Normalize query ───────────────────────────────────────────────────────────

/**
 * Normalizes a search query to a trimmed, lower-cased string.
 * Returns empty string if input is not a non-empty string.
 * @param {any} query
 * @returns {string}
 */
export const normalizeQuery = (query) =>
  typeof query === 'string' ? query.trim().toLowerCase() : '';
