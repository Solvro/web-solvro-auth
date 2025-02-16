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

  command.logger.info("Konfiguracja @solvro/auth");
  command.logger.info(
    "Żeby dostać CLIENT_ID i CLIENT_SECRET, zapytaj na #main i zpinguj @Bartosz Gotowski",
  );

  const clientId = await command.prompt.ask("Jaki masz CLIENT_ID? ", {
    hint: "web-planer",
  });
  const clientSecret = await command.prompt.ask("Jaki masz CLIENT_SECRET? ", {
    hint: "a17c54tH8AmWC0yq7FSQbNpPp8wELqeN",
  });

  await codemods.makeUsingStub(
    stubsRoot,
    "controllers/auth_controller.stub",
    {},
  );
  await codemods.makeUsingStub(stubsRoot, "config/ally.stub", {});

  await codemods.defineEnvVariables({
    APP_DOMAIN: "http://localhost:3333",
    SOLVRO_AUTH_CLIENT_ID: clientId,
    SOLVRO_AUTH_CLIENT_SECRET: clientSecret,
  });

  await codemods.defineEnvValidations({
    variables: {
      APP_DOMAIN: `Env.schema.string()`,
      SOLVRO_AUTH_CLIENT_ID: "Env.schema.string()",
      SOLVRO_AUTH_CLIENT_SECRET: "Env.schema.string.optional()",
    },
    leadingComment: "Variables for @solvro/auth",
  });
}
