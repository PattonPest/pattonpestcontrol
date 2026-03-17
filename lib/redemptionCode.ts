/**
 * Generates a short, human-readable redemption code for scratch-off tickets.
 *
 * Uses an unambiguous character set (no 0/O or 1/I/L) so codes are easy
 * to read aloud or relay via text message.
 *
 * Format: XXX-XXX  (e.g. "KH3-M7P")
 */

const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateRedemptionCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
    if (i === 2) code += "-"; // insert dash after 3rd char
  }
  return code; // e.g. "KH3-M7P"
}
