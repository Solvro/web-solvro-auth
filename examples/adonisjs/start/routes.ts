/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from "@adonisjs/core/services/router";

import { middleware } from "./kernel.js";

const AuthController = () => import("#controllers/auth_controller");

router.get("/auth/login", [AuthController, "login"]).use(middleware.guest());
router
  .get("/auth/callback", [AuthController, "callback"])
  .use(middleware.guest());
router.post("/auth/logout", [AuthController, "logout"]).use(middleware.auth());

router
  .get("/", async ({ auth }) => {
    return {
      hello: "world",
      user: auth.user,
    };
  })
  .use(middleware.silentAuth());
