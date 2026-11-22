/**
 * Sanitizzazione difensiva contro XSS, HTML injection e caratteri di controllo.
 */
export function sanitizeText(input: string, maxLength = 300): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEmail(input: string): string {
  return input
    .replace(/[\u0000-\u001F\u007F\s<>]/g, "")
    .toLowerCase()
    .slice(0, 160);
}

export function sanitizePromoCode(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toUpperCase()
    .slice(0, 32);
}
