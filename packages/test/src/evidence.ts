const sensitiveField = /(?:identity|mnemonic|seed|private.?key|spending.?key|viewing.?key|secret|password|token|cookie|credential|authorization|auth)/i;
const localPath = /(?:\/home\/[^/\s"']+|\/Users\/[^/\s"']+|\/tmp\/[^/\s"']+)\/[^\s"']*/g;
const ageSecret = /AGE-SECRET-KEY-1[0-9A-Z]+/g;

/** Redact credential-like fields and local identities before test evidence is written. */
export function sanitizeEvidence(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeEvidence);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sensitiveField.test(key) ? "[REDACTED]" : sanitizeEvidence(entry),
      ]),
    );
  }
  if (typeof value === "string") {
    return value.replace(ageSecret, "[REDACTED]").replace(localPath, "[LOCAL_PATH_REDACTED]");
  }
  return value;
}
