import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginResetPassword(
  props: PageProps<
    Extract<KcContext, { pageId: "login-reset-password.ftl" }>,
    I18n
  >,
) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { kcClsx } = getKcClsx({
    doUseDefaultCss,
    classes,
  });

  const { url, realm, auth, messagesPerField } = kcContext;

  const { msg, msgStr } = i18n;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayInfo
      displayMessage={!messagesPerField.existsError("username")}
      infoNode={
        realm.duplicateEmailsAllowed
          ? msg("emailInstructionUsername")
          : msg("emailInstruction")
      }
      headerNode={msg("emailForgotTitle")}
    >
      <form
        id="kc-reset-password-form"
        className={kcClsx("kcFormClass")}
        action={url.loginAction}
        method="post"
      >
        <div className={kcClsx("kcFormGroupClass")}>
          <div className={kcClsx("kcLabelWrapperClass")}>
            <label htmlFor="username" className={kcClsx("kcLabelClass")}>
              {!realm.loginWithEmailAllowed
                ? msg("username")
                : !realm.registrationEmailAsUsername
                  ? msg("usernameOrEmail")
                  : msg("email")}
            </label>
          </div>
          <div className={kcClsx("kcInputWrapperClass")}>
            <Input
              type="text"
              id="username"
              name="username"
              autoFocus
              defaultValue={auth.attemptedUsername ?? ""}
              aria-invalid={messagesPerField.existsError("username")}
            />
            {messagesPerField.existsError("username") && (
              <span
                id="input-error-username"
                className={kcClsx("kcInputErrorMessageClass")}
                aria-live="polite"
                dangerouslySetInnerHTML={{
                  __html: kcSanitize(messagesPerField.get("username")),
                }}
              />
            )}
          </div>
        </div>
        <div>
          <div id="kc-form-options">
            <div>
              <span>
                <a
                  href={url.loginUrl}
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "p-0 underline",
                  )}
                >
                  {msg("backToLogin")}
                </a>
              </span>
            </div>
          </div>

          <div id="kc-form-buttons" className="">
            <input
              className={cn(buttonVariants({ variant: "default" }), "w-full")}
              type="submit"
              value={msgStr("doSubmit")}
            />
          </div>
        </div>
      </form>
    </Template>
  );
}
