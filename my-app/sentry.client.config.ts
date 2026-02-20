import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://d33efcdeca1855b4a4c25b53cf63d0f9@o4510918080462848.ingest.us.sentry.io/4510918092521472",

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // Adjust in production to a lower value for cost control.
  tracesSampleRate: 0.1,

  // Capture Replay for 10% of all sessions, plus 100% of sessions with errors.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while setting up Sentry.
  debug: false,

  environment: process.env.NODE_ENV,

  // Filter out noisy errors
  ignoreErrors: [
    "ResizeObserver loop",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
    "Load failed",
    "Failed to fetch",
  ],

  beforeSend(event) {
    // Scrub sensitive data from events
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }
    return event;
  },
});
