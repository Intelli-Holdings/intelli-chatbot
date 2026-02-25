import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: "https://d33efcdeca1855b4a4c25b53cf63d0f9@o4510918080462848.ingest.us.sentry.io/4510918092521472",

      integrations: [
        Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
      ],

      enableLogs: true,

      tracesSampleRate: 0.1,

      debug: false,

      environment: process.env.NODE_ENV,

      beforeSend(event) {
        // Scrub sensitive data from server-side events
        if (event.request?.headers) {
          delete event.request.headers["authorization"];
          delete event.request.headers["cookie"];
        }
        // Scrub environment variables from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
            if (breadcrumb.data) {
              const data = { ...breadcrumb.data };
              for (const key of Object.keys(data)) {
                const lowerKey = key.toLowerCase();
                if (
                  lowerKey.includes("token") ||
                  lowerKey.includes("secret") ||
                  lowerKey.includes("key") ||
                  lowerKey.includes("password")
                ) {
                  data[key] = "[REDACTED]";
                }
              }
              return { ...breadcrumb, data };
            }
            return breadcrumb;
          });
        }
        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: "https://d33efcdeca1855b4a4c25b53cf63d0f9@o4510918080462848.ingest.us.sentry.io/4510918092521472",

      integrations: [
        Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
      ],

      enableLogs: true,

      tracesSampleRate: 0.1,

      debug: false,

      environment: process.env.NODE_ENV,
    });
  }
}
