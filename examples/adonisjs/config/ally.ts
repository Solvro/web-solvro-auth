import { defineConfig } from "@adonisjs/ally";

import env from "#start/env";

import { SolvroAuthDriverService } from "../../../packages/ally-solvro-auth/build/index.js";

const allyConfig = defineConfig({
  solvroAuth: SolvroAuthDriverService({
    callbackUrl: `${env.get("APP_DOMAIN")}/auth/callback`,
    clientId: env.get("SOLVRO_AUTH_CLIENT_ID", "myclient"),
    clientSecret: env.get("SOLVRO_AUTH_CLIENT_SECRET", ""),
    solvroAuthUrl: "http://localhost:8080",
  }),
});

export default allyConfig;

declare module "@adonisjs/ally/types" {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
