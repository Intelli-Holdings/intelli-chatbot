type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = [
  "access_token",
  "api_key",
  "apiKey",
  "password",
  "secret",
  "token",
  "authorization",
  "cookie",
  "credential",
  "private_key",
  "privateKey",
];

function redactSensitive(meta: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      redacted[key] = redactSensitive(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  if (meta && Object.keys(meta).length > 0) {
    entry.meta = redactSensitive(meta);
  }
  return entry;
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (!shouldLog("debug")) return;
    const entry = formatLog("debug", message, meta);
    // eslint-disable-next-line no-console
    console.debug(JSON.stringify(entry));
  },

  info(message: string, meta?: Record<string, unknown>) {
    if (!shouldLog("info")) return;
    const entry = formatLog("info", message, meta);
    // eslint-disable-next-line no-console
    console.info(JSON.stringify(entry));
  },

  warn(message: string, meta?: Record<string, unknown>) {
    if (!shouldLog("warn")) return;
    const entry = formatLog("warn", message, meta);
    // eslint-disable-next-line no-console
    console.warn(JSON.stringify(entry));
  },

  error(message: string, meta?: Record<string, unknown>) {
    if (!shouldLog("error")) return;
    const entry = formatLog("error", message, meta);
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(entry));
  },
};
