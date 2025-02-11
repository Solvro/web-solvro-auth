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
 *  Search keyword "KeycloakDriver" and replace it with a meaningful name
|--------------------------------------------------------------------------
 */
import { Oauth2Driver, type RedirectRequest } from "@adonisjs/ally";
import type {
  AllyDriverContract,
  AllyUserContract,
  ApiRequestContract,
} from "@adonisjs/ally/types";
import type { HttpContext } from "@adonisjs/core/http";

/**
 *
 * Access token returned by your driver implementation. An access
 * token must have "token" and "type" properties and you may
 * define additional properties (if needed)
 */
export type KeycloakDriverAccessToken = {
  token: string;
  type: "bearer";
};

/**
 * Scopes accepted by the driver implementation.
 */
export type KeycloakDriverScopes = "openid profile";

/**
 * The configuration accepted by the driver implementation.
 */
export type KeycloakDriverConfig = {
  clientId: string;
  keycloakUrl?: string;
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
export class KeycloakDriver extends Oauth2Driver implements AllyDriverContract {
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
  protected stateCookieName = "KeycloakDriver_oauth_state";

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
    public config: KeycloakDriverConfig,
  ) {
    super(ctx, config);

    this.config = config;

    if (this.config.keycloakUrl) {
      this.authorizeUrl = this.buildKeycloakUrl("auth");

      this.accessTokenUrl = this.buildKeycloakUrl("token");

      this.userInfoUrl = this.buildKeycloakUrl("userinfo");
    }

    console.log(this.authorizeUrl);

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request.
     *
     * DO NOT REMOVE THE FOLLOWING LINE
     */
    this.loadState();
  }
  protected configureRedirectRequest(request: RedirectRequest) {
    request.scopes(["openid"]);
    request.param("response_type", "code");
  }

  /**
   * Optionally configure the authorization redirect request. The actual request
   * is made by the base implementation of "Oauth2" driver and this is a
   * hook to pre-configure the request.
   */
  // protected configureRedirectRequest(request: RedirectRequest<KeycloakDriverScopes>) {}

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
  async user(callback?: (request: ApiRequestContract) => void): Promise {
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
      ...user,
      token: { ...accessToken },
    };
  }

  async userFromToken(
    accessToken: string,
    callback?: (request: ApiRequestContract) => void,
  ): Promise {
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
   * Fetches the user info from the Keycloak API
   */
  protected async getUserInfo(
    token: string,
    callback?: (request: ApiRequestContract) => void,
  ) {
    const request = this.getAuthenticatedRequest(this.userInfoUrl, token);
    if (typeof callback === "function") {
      callback(request);
    }

    const body = await request.get();

    return {
      id: body.sub,
      nickName: body.preferred_username,
      lastName: body.family_name,
      firstName: body.given_name,
      name: body.name,
      email: body.email,
      avatarUrl: null,
      emailVerificationState: body.email_verified
        ? ("verified" as const)
        : ("unverified" as const),
      original: body,
    };
  }

  /**
   * Build keycloak URL
   */
  protected buildKeycloakUrl(action: string): string {
    if (!this.config.keycloakUrl) {
      throw Error("Missing keycloak URL");
    }
    if (!this.config.realm) {
      throw Error("Missing realm name");
    }

    return this.config.keycloakUrl
      .replace("{realm}", this.config.realm)
      .replace("{action}", action);
  }
}

/**
 * The factory function to reference the driver implementation
 * inside the "config/ally.ts" file.
 */
export function KeycloakDriverService(
  config: KeycloakDriverConfig,
): (ctx: HttpContext) => KeycloakDriver {
  return (ctx) => new KeycloakDriver(ctx, config);
}
