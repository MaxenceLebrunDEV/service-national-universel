const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

let snuApiUrl = "http://localhost:8080";
let supportApiUrl = "http://localhost:3000";
let adminURL = "http://localhost:8082";
let appURL = "http://localhost:8081";
let supportURL = "http://localhost:8083";
let baseDeConnaissanceURL = "http://localhost:8084";

if (environment === "staging") {
  snuApiUrl = "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
  adminURL = "https://app-735c50af-69c1-4a10-ac30-7ba11d1112f7.cleverapps.io";
  appURL = "https://app-66aba4d6-e5fc-4c74-b252-f55fb0e9d37f.cleverapps.io";
}
if (environment === "production") {
  snuApiUrl = "https://api.snu.gouv.fr";
  supportApiUrl = "https://support-snu-api.cleverapps.io";
  adminURL = "https://admin.snu.gouv.fr";
  appURL = "https://moncompte.snu.gouv.fr";
  supportURL = "https://support-snu-app.cleverapps.io";
  baseDeConnaissanceURL = "https://support.snu.gouv.fr";
}

const S3PREFIX = "";
const SENTRY_URL = "https://415a2c2d9246422fa05cd5e96dd39c23@o348403.ingest.sentry.io/5557988";

let franceConnectUrl = "https://fcp.integ01.dev-franceconnect.fr/api/v1";

if (environment === "production") {
  franceConnectUrl = "https://app.francecon0nect.gouv.fr/api/v1";
}

export { snuApiUrl, supportApiUrl, S3PREFIX, SENTRY_URL, environment, franceConnectUrl, adminURL, appURL, supportURL, baseDeConnaissanceURL };