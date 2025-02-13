/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from "@adonisjs/core/services/router";

import User from "#models/user";

router.get("/auth/keycloak/redirect", ({ ally }) => {
  return ally.use("keycloak").redirect();
});

router.get("/auth/keycloak/callback", async ({ ally, auth }) => {
  const keycloak = ally.use("keycloak");
  /**
   * User has denied access by canceling
   * the login flow
   */
  if (keycloak.accessDenied()) {
    return "You have cancelled the login process";
  }

  /**
   * OAuth state verification failed. This happens when the
   * CSRF cookie gets expired.
   */
  if (keycloak.stateMisMatch()) {
    return "We are unable to verify the request. Please try again";
  }

  /**
   * GitHub responded with some error
   */
  if (keycloak.hasError()) {
    return keycloak.getError();
  }

  /**
   * Access user info
   */
  const keycloakUser = await keycloak.user();

  const user = await User.firstOrCreate(
    { email: keycloakUser.email },
    {
      email: keycloakUser.email,
    },
  );

  auth.use("web").login();
  return user;
});

router.get("/", async () => {
  return {
    hello: "world",
  };
});
