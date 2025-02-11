import { defineConfig } from "@adonisjs/ally";

import env from "#start/env";

import { KeycloakDriverService } from "../../../packages/ally-solvro-auth/build/index.js";

const allyConfig = defineConfig({
  keycloak: KeycloakDriverService({
    callbackUrl: "http://localhost:3333/auth/keycloak/callback",
    clientId: env.get("KEYCLOAK_CLIENT_ID", "myclient"),
    clientSecret: env.get("KEYCLOAK_CLIENT_SECRET", ""),
    keycloakUrl:
      "http://localhost:8080/realms/{realm}/protocol/openid-connect/{action}",
    realm: env.get("KEYCLOAK_REALM", "myrealm"),
  }),
});

export default allyConfig;

declare module "@adonisjs/ally/types" {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
