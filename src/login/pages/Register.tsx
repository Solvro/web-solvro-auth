import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import { type KcClsx, getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { JSX } from "keycloakify/tools/JSX";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { clsx } from "keycloakify/tools/clsx";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { checkboxVariants } from "@/components/ui/checkbox";

import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type RegisterProps = PageProps<
  Extract<KcContext, { pageId: "register.ftl" }>,
  I18n
> & {
  UserProfileFormFields: LazyOrNot<
    (props: UserProfileFormFieldsProps) => JSX.Element
  >;
  doMakeUserConfirmPassword: boolean;
};

export default function Register(props: RegisterProps) {
  const {
    kcContext,
    i18n,
    doUseDefaultCss,
    Template,
    classes,
    UserProfileFormFields,
    doMakeUserConfirmPassword,
  } = props;

  const { kcClsx } = getKcClsx({
    doUseDefaultCss,
    classes,
  });

  const {
    messageHeader,
    url,
    messagesPerField,
    recaptchaRequired,
    recaptchaVisible,
    recaptchaSiteKey,
    recaptchaAction,
    termsAcceptanceRequired,
  } = kcContext;

  const { msg, msgStr, advancedMsg } = i18n;

  const [isFormSubmittable, setIsFormSubmittable] = useState(false);
  const [areTermsAccepted, setAreTermsAccepted] = useState(false);

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      headerNode={
        messageHeader !== undefined
          ? advancedMsg(messageHeader)
          : msg("registerTitle")
      }
      displayMessage={messagesPerField.exists("global")}
      displayRequiredFields
    >
      <form id="kc-register-form" action={url.registrationAction} method="post">
        <UserProfileFormFields
          kcContext={kcContext}
          i18n={i18n}
          kcClsx={kcClsx}
          onIsFormSubmittableValueChange={setIsFormSubmittable}
          doMakeUserConfirmPassword={doMakeUserConfirmPassword}
        />
        {termsAcceptanceRequired && (
          <TermsAcceptance
            i18n={i18n}
            kcClsx={kcClsx}
            messagesPerField={messagesPerField}
            areTermsAccepted={areTermsAccepted}
            onAreTermsAcceptedValueChange={setAreTermsAccepted}
          />
        )}
        {recaptchaRequired &&
          (recaptchaVisible || recaptchaAction === undefined) && (
            <div className="form-group pt-7">
              <div className="mx-5">
                <div
                  className="g-recaptcha"
                  data-size="compact"
                  data-sitekey={recaptchaSiteKey}
                  data-action={recaptchaAction}
                ></div>
              </div>
            </div>
          )}
        <div>
          <div className="mx-2">
            <div>
              <span>
                <a
                  href={url.loginUrl}
                  className={buttonVariants({ variant: "link" })}
                >
                  {msg("backToLogin")}
                </a>
              </span>
            </div>
          </div>

          {recaptchaRequired &&
          !recaptchaVisible &&
          recaptchaAction !== undefined ? (
            <div id="kc-form-buttons" className="mt-4 px-5">
              <button
                className={clsx(
                  kcClsx(
                    "kcButtonClass",
                    "kcButtonPrimaryClass",
                    "kcButtonBlockClass",
                    "kcButtonLargeClass",
                  ),
                  "g-recaptcha",
                )}
                data-sitekey={recaptchaSiteKey}
                data-callback={() => {
                  (
                    document.getElementById(
                      "kc-register-form",
                    ) as HTMLFormElement
                  ).submit();
                }}
                data-action={recaptchaAction}
                type="submit"
              >
                {msg("doRegister")}
              </button>
            </div>
          ) : (
            <div id="kc-form-buttons" className="px-5">
              <Button
                disabled={
                  !isFormSubmittable ||
                  (termsAcceptanceRequired && !areTermsAccepted)
                }
                className="w-full"
                variant={"default"}
                type="submit"
              >
                {msgStr("doRegister")}
              </Button>
            </div>
          )}
        </div>
      </form>
    </Template>
  );
}

function TermsAcceptance(props: {
  i18n: I18n;
  kcClsx: KcClsx;
  messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get">;
  areTermsAccepted: boolean;
  onAreTermsAcceptedValueChange: (areTermsAccepted: boolean) => void;
}) {
  const {
    i18n,
    kcClsx,
    messagesPerField,
    areTermsAccepted,
    onAreTermsAcceptedValueChange,
  } = props;

  const { msg } = i18n;

  return (
    <>
      <div className="form-group">
        <div className={kcClsx("kcInputWrapperClass")}>
          {msg("termsTitle")}
          <div id="kc-registration-terms-text">{msg("termsText")}</div>
        </div>
      </div>
      <div className="form-group">
        <div className={kcClsx("kcLabelWrapperClass")}>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              className={checkboxVariants({})}
              checked={areTermsAccepted}
              onChange={(e) => onAreTermsAcceptedValueChange(e.target.checked)}
              aria-invalid={messagesPerField.existsError("termsAccepted")}
            />
            <label htmlFor="termsAccepted" className={kcClsx("kcLabelClass")}>
              {msg("acceptTerms")}
            </label>
          </div>
        </div>
        {messagesPerField.existsError("termsAccepted") && (
          <div className={kcClsx("kcLabelWrapperClass")}>
            <span
              id="input-error-terms-accepted"
              className={kcClsx("kcInputErrorMessageClass")}
              aria-live="polite"
              dangerouslySetInnerHTML={{
                __html: messagesPerField.get("termsAccepted"),
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
