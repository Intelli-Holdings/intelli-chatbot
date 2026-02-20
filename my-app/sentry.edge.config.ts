import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://d33efcdeca1855b4a4c25b53cf63d0f9@o4510918080462848.ingest.us.sentry.io/4510918092521472",

  tracesSampleRate: 0.1,

  debug: false,

  environment: process.env.NODE_ENV,
});
