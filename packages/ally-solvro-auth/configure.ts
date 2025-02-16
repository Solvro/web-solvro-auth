/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */
import type Configure from "@adonisjs/core/commands/configure";

import { stubsRoot } from "./stubs/main.js";

export async function configure(command: Configure) {
  const codemods = await command.createCodemods();

  await codemods.makeUsingStub(
    stubsRoot,
    "controllers/auth_controller.stub",
    {},
  );
  // env variables: APP_DOMAIN, SOLVRO_AUTH_CLIENT_ID
  // Add environment variables
  await codemods.defineEnvVariables({
    APP_DOMAIN: "http://localhost:3333",
    SOLVRO_AUTH_CLIENT_ID: "MY_CLIENT_ID",
  });

  await codemods.defineEnvValidations({
    variables: {
      APP_DOMAIN: `Env.schema.string()`,
      SOLVRO_AUTH_CLIENT_ID: "Env.schema.string()",
    },
    leadingComment: "Variables for @solvro/auth",
  });
}
