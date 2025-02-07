import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useState } from "react";

import { PasswordWrapper } from "@/components/password-wrapper";
import { SocialProviders } from "@/components/social-providers";

import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function Login(
  props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>,
) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { kcClsx } = getKcClsx({
    doUseDefaultCss,
    classes,
  });

  const {
    social,
    realm,
    url,
    usernameHidden,
    login,
    auth,
    registrationDisabled,
    messagesPerField,
  } = kcContext;

  const { msg, msgStr } = i18n;

  const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!messagesPerField.existsError("username", "password")}
      headerNode={msg("loginAccountTitle")}
      displayInfo={
        realm.password && realm.registrationAllowed && !registrationDisabled
      }
      infoNode={
        <div id="kc-registration" className="">
          <span className="text-foreground">
            {msgStr("noAccount")}{" "}
            <a
              tabIndex={8}
              href={url.registrationUrl}
              className="link-style mx-5"
            >
              {msgStr("doRegister")}
            </a>
          </span>
        </div>
      }
      socialProvidersNode={
        <SocialProviders
          social={social ?? {}}
          kcClsx={kcClsx}
          msg={msg}
          realm={realm}
        />
      }
    >
      <div id="kc-form">
        <div id="kc-form-wrapper">
          {realm.password && (
            <form
              id="kc-form-login"
              onSubmit={() => {
                setIsLoginButtonDisabled(true);
                return true;
              }}
              action={url.loginAction}
              method="post"
              className="space-y-6"
            >
              {!usernameHidden && (
                <div>
                  <Label htmlFor="username">
                    {!realm.loginWithEmailAllowed
                      ? msg("username")
                      : !realm.registrationEmailAsUsername
                        ? msg("usernameOrEmail")
                        : msg("email")}
                  </Label>
                  <Input
                    tabIndex={2}
                    id="username"
                    className=""
                    name="username"
                    defaultValue={login.username ?? ""}
                    type="text"
                    autoFocus
                    autoComplete="username"
                    aria-invalid={messagesPerField.existsError(
                      "username",
                      "password",
                    )}
                  />
                  {messagesPerField.existsError("username", "password") && (
                    <div
                      id="input-error"
                      className="input-error py-3"
                      aria-live="polite"
                      dangerouslySetInnerHTML={{
                        __html: messagesPerField.getFirstError(
                          "username",
                          "password",
                        ),
                      }}
                    />
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="password">{msg("password")}</Label>
                <PasswordWrapper
                  kcClsx={kcClsx}
                  i18n={i18n}
                  passwordInputId="password"
                >
                  <Input
                    tabIndex={3}
                    id="password"
                    className="text-foreground"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={messagesPerField.existsError(
                      "username",
                      "password",
                    )}
                  />
                </PasswordWrapper>
                {usernameHidden &&
                  messagesPerField.existsError("username", "password") && (
                    <span
                      id="input-error"
                      className={kcClsx("kcInputErrorMessageClass")}
                      aria-live="polite"
                      dangerouslySetInnerHTML={{
                        __html: messagesPerField.getFirstError(
                          "username",
                          "password",
                        ),
                      }}
                    />
                  )}
              </div>

              <div className="space-y-2 md:flex md:justify-between md:space-y-0">
                <div>
                  {realm.rememberMe && !usernameHidden && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        tabIndex={5}
                        id="rememberMe"
                        name="rememberMe"
                        defaultChecked={!!login.rememberMe}
                      />
                      <label htmlFor="rememberMe">{msgStr("rememberMe")}</label>
                    </div>
                  )}
                </div>
                <div className="link-style">
                  {realm.resetPasswordAllowed && (
                    <span>
                      <a tabIndex={6} href={url.loginResetCredentialsUrl}>
                        {msgStr("doForgotPassword")}
                      </a>
                    </span>
                  )}
                </div>
              </div>

              <div id="kc-form-buttons" className={kcClsx("kcFormGroupClass")}>
                <Input
                  type="hidden"
                  id="id-hidden-input"
                  name="credentialId"
                  value={auth.selectedCredential}
                />

                <Button
                  tabIndex={7}
                  disabled={isLoginButtonDisabled}
                  type="submit"
                  className="w-full"
                >
                  {msgStr("doLogIn")}
                </Button>
              </div>
              <Separator />
            </form>
          )}
        </div>
      </div>
    </Template>
  );
}
