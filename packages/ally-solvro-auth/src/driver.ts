/*
|--------------------------------------------------------------------------
| Ally Oauth driver
|--------------------------------------------------------------------------
|
| Make sure you through the code and comments properly and make necessary
| changes as per the requirements of your implementation.
|
*/
/**
|--------------------------------------------------------------------------
 *  Search keyword "SolvroAuthDriver" and replace it with a meaningful name
|--------------------------------------------------------------------------
 */
import { Oauth2Driver, type RedirectRequest } from "@adonisjs/ally";
import type {
  AllyDriverContract,
  AllyUserContract,
  ApiRequestContract,
} from "@adonisjs/ally/types";
import type { HttpContext } from "@adonisjs/core/http";

import { userSchema } from "./user_schema.js";

/**
 *
 * Access token returned by your driver implementation. An access
 * token must have "token" and "type" properties and you may
 * define additional properties (if needed)
 */
export type SolvroAuthDriverAccessToken = {
  token: string;
  type: "bearer";
};

/**
 * Scopes accepted by the driver implementation.
 */
export type SolvroAuthDriverScopes = "openid profile";

/**
 * The configuration accepted by the driver implementation.
 */
export type SolvroAuthDriverConfig = {
  clientId: string;
  solvroAuthUrl?: string;
  realm?: string;
  clientSecret: string;
  callbackUrl: string;
  authorizeUrl?: string;
  accessTokenUrl?: string;
  userInfoUrl?: string;
};

/**
 * Driver implementation. It is mostly configuration driven except the API call
 * to get user info.
 */
export class SolvroAuthDriver
  extends Oauth2Driver<SolvroAuthDriverAccessToken, SolvroAuthDriverScopes>
  implements
    AllyDriverContract<SolvroAuthDriverAccessToken, SolvroAuthDriverScopes>
{
  /**
   * The URL for the redirect request. The user will be redirected on this page
   * to authorize the request.
   *
   * Do not define query strings in this URL.
   */
  protected authorizeUrl = "";

  /**
   * The URL to hit to exchange the authorization code for the access token
   *
   * Do not define query strings in this URL.
   */
  protected accessTokenUrl = "";

  /**
   * The URL to hit to get the user details
   *
   * Do not define query strings in this URL.
   */
  protected userInfoUrl = "";

  /**
   * The param name for the authorization code. Read the documentation of your oauth
   * provider and update the param name to match the query string field name in
   * which the oauth provider sends the authorization_code post redirect.
   */
  protected codeParamName = "code";

  /**
   * The param name for the error. Read the documentation of your oauth provider and update
   * the param name to match the query string field name in which the oauth provider sends
   * the error post redirect
   */
  protected errorParamName = "error";

  /**
   * Cookie name for storing the CSRF token. Make sure it is always unique. So a better
   * approach is to prefix the oauth provider name to `oauth_state` value. For example:
   * For example: "facebook_oauth_state"
   */
  protected stateCookieName = "SolvroAuthDriver_oauth_state";

  /**
   * Parameter name to be used for sending and receiving the state from.
   * Read the documentation of your oauth provider and update the param
   * name to match the query string used by the provider for exchanging
   * the state.
   */
  protected stateParamName = "state";

  /**
   * Parameter name for sending the scopes to the oauth provider.
   */
  protected scopeParamName = "scope";

  /**
   * The separator indentifier for defining multiple scopes
   */
  protected scopesSeparator = " ";

  constructor(
    ctx: HttpContext,
    public config: SolvroAuthDriverConfig,
  ) {
    super(ctx, config);

    this.config = config;

    this.config.realm = this.config.realm || "solvro";

    this.config.solvroAuthUrl =
      this.config.solvroAuthUrl || "https://auth.solvro.com";

    if (this.config.solvroAuthUrl) {
      this.authorizeUrl = this.buildSolvroAuthUrl("auth");

      this.accessTokenUrl = this.buildSolvroAuthUrl("token");

      this.userInfoUrl = this.buildSolvroAuthUrl("userinfo");
    }

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request.
     *
     * DO NOT REMOVE THE FOLLOWING LINE
     */
    this.loadState();
  }
  protected configureRedirectRequest(
    request: RedirectRequest<SolvroAuthDriverScopes>,
  ) {
    request.scopes(["openid"]);
    request.param("response_type", "code");
  }

  /**
   * Optionally configure the authorization redirect request. The actual request
   * is made by the base implementation of "Oauth2" driver and this is a
   * hook to pre-configure the request.
   */
  // protected configureRedirectRequest(request: RedirectRequest<SolvroAuthDriverScopes>) {}

  /**
   * Optionally configure the access token request. The actual request is made by
   * the base implementation of "Oauth2" driver and this is a hook to pre-configure
   * the request
   */
  // protected configureAccessTokenRequest(request: ApiRequest) {}

  /**
   * Update the implementation to tell if the error received during redirect
   * means "ACCESS DENIED".
   */
  accessDenied() {
    return this.ctx.request.input("error") === "user_denied";
  }

  /**
   * Get the user details by query the provider API. This method must return
   * the access token and the user details both. Checkout the google
   * implementation for same.
   *
   * https://github.com/adonisjs/ally/blob/develop/src/Drivers/Google/index.ts#L191-L199
   */
  async user(
    callback?: (request: ApiRequestContract) => void,
  ): Promise<AllyUserContract<SolvroAuthDriverAccessToken>> {
    const accessToken = await this.accessToken();
    const request = this.httpClient(
      this.config.userInfoUrl || this.userInfoUrl,
    );

    /**
     * Allow end user to configure the request. This should be called after your custom
     * configuration, so that the user can override them (if needed)
     */
    if (typeof callback === "function") {
      callback(request);
    }

    const user = await this.getUserInfo(accessToken.token, callback);

    return {
      name: user.name,
      avatarUrl: user.avatarUrl,
      email: user.email,
      emailVerificationState: user.emailVerificationState,
      id: user.id,
      nickName: user.nickName,
      original: user.original,
      token: { ...accessToken },
    };
  }

  async userFromToken(
    accessToken: string,
    callback?: (request: ApiRequestContract) => void,
  ): Promise<AllyUserContract<{ token: string; type: "bearer" }>> {
    const request = this.httpClient(
      this.config.userInfoUrl || this.userInfoUrl,
    );

    /**
     * Allow end user to configure the request. This should be called after your custom
     * configuration, so that the user can override them (if needed)
     */
    if (typeof callback === "function") {
      callback(request);
    }

    const user = await this.getUserInfo(accessToken, callback);

    return {
      ...user,
      token: { token: accessToken, type: "bearer" as const },
    };
  }

  /**
   * Returns the HTTP request with the authorization header set
   */
  protected getAuthenticatedRequest(url: string, token: string) {
    const request = this.httpClient(url);
    request.header("Authorization", `Bearer ${token}`);
    request.header("Accept", "application/json");
    request.parseAs("json");
    return request;
  }

  /**
   * Fetches the user info from the SolvroAuth API
   */
  protected async getUserInfo(
    token: string,
    callback?: (request: ApiRequestContract) => void,
  ): Promise<
    Omit<AllyUserContract<{ token: string; type: "bearer" }>, "token">
  > {
    const request = this.getAuthenticatedRequest(this.userInfoUrl, token);
    if (typeof callback === "function") {
      callback(request);
    }
    const responseBody = await request.get();

    const body = await userSchema.validate(responseBody);

    return {
      id: body.sub,
      name: body.name ?? body.preferred_username,
      nickName: body.preferred_username,
      email: body.email,
      avatarUrl: null,
      emailVerificationState: body.email_verified
        ? ("verified" as const)
        : ("unverified" as const),
      original: body,
    };
  }

  /**
   * Build solvroauth URL
   */
  protected buildSolvroAuthUrl(action: string): string {
    if (!this.config.solvroAuthUrl) {
      throw Error("Missing solvroauth URL");
    }
    if (!this.config.realm) {
      throw Error("Missing realm name");
    }

    const url =
      this.config.solvroAuthUrl +
      `/realms/{realm}/protocol/openid-connect/{action}`;

    return url
      .replace("{realm}", this.config.realm)
      .replace("{action}", action);
  }
}

/**
 * The factory function to reference the driver implementation
 * inside the "config/ally.ts" file.
 */
export function SolvroAuthDriverService(
  config: SolvroAuthDriverConfig,
): (ctx: HttpContext) => SolvroAuthDriver {
  return (ctx) => new SolvroAuthDriver(ctx, config);
}
