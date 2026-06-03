import { defineConfig } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:3000";
const launchReadinessE2e = process.env.LAUNCH_READINESS_E2E === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  reporter: [["html", { open: "never" }]],
  webServer: launchReadinessE2e
    ? {
        command: "npx --yes serve@14 out -l 3000",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
});
