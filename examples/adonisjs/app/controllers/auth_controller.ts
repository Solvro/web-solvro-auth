import assert from "node:assert";

import type { HttpContext } from "@adonisjs/core/http";

import User from "#models/user";

export default class AuthController {
  async login(ctx: HttpContext): Promise<void> {
    const driver = ctx.ally.use("solvroAuth");

    return driver.redirect();
  }

  async callback(ctx: HttpContext): Promise<void> {
    const driver = ctx.ally.use("solvroAuth");

    const details = await driver.user();

    assert(details.email !== null, "Invalid user profile. Email is missing");

    const user = await User.firstOrCreate(
      { email: details.email },
      {
        email: details.email,
        fullName: details.name,
      },
    );

    await ctx.auth.use("web").login(user);

    return ctx.response.redirect("/");
  }

  async logout(ctx: HttpContext): Promise<void> {
    await ctx.auth.use("web").logout();

    return ctx.response.redirect("/");
  }
}
