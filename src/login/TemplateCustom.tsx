import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { clsx } from "keycloakify/tools/clsx";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { Globe2Icon } from "lucide-react";
import { useEffect } from "react";

import { ModeToggle } from "../components/mode-toggle";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";

export function TemplateCustom(props: TemplateProps<KcContext, I18n>) {
  const {
    displayInfo = false,
    displayMessage = true,
    displayRequiredFields = false,
    headerNode,
    socialProvidersNode = null,
    infoNode = null,
    documentTitle,
    bodyClassName,
    kcContext,
    i18n,
    doUseDefaultCss,
    classes,
    children,
  } = props;

  const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

  const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;

  const { realm, auth, url, message, isAppInitiatedAction } = kcContext;

  useEffect(() => {
    document.title =
      documentTitle ?? msgStr("loginTitle", kcContext.realm.displayName);
  }, []);

  useSetClassName({
    qualifiedName: "html",
    className: kcClsx("kcHtmlClass"),
  });

  useSetClassName({
    qualifiedName: "body",
    className: bodyClassName ?? kcClsx("kcBodyClass"),
  });

  const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

  if (!isReadyToRender) {
    return null;
  }
  const languageSelector = () => {
    return (
      <div>
        {realm.internationalizationEnabled && enabledLanguages.length > 1 && (
          <div className="-mr-3 mt-0.5 justify-end">
            <div id="kc-locale-wrapper" className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    tabIndex={1}
                    variant="secondary"
                    size="sm"
                    aria-label={msgStr("languages")}
                    aria-haspopup="true"
                    aria-expanded="false"
                    aria-controls="language-switch1"
                    className="px-3 py-0"
                  >
                    <div className="flex space-x-2">
                      <Globe2Icon className="h-5 w-5" />
                      <span>{currentLanguage.label}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent id="language-switch1" role="menu">
                  {enabledLanguages.map(({ languageTag, href, label }, i) => (
                    <DropdownMenuItem key={languageTag} role="none">
                      <a role="menuitem" id={`language-${i + 1}`} href={href}>
                        {label}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="prose flex min-h-screen max-w-none flex-col items-center justify-center bg-background dark:prose-invert">
      <Card className="md:-[40rem] min-h-screen w-full px-3 py-0 shadow-2xl sm:min-h-fit md:w-[30rem]">
        <CardContent className="space-y-8 pb-5">
          <div className="flex justify-end space-x-4 pt-2">
            {languageSelector()}
          </div>
          <header className="text-center">
            {(() => {
              const node = !(
                auth !== undefined &&
                auth.showUsername &&
                !auth.showResetCredentials
              ) ? (
                <h1 id="kc-page-title">{headerNode}</h1>
              ) : (
                <div id="kc-username" className={kcClsx("kcFormGroupClass")}>
                  <label id="kc-attempted-username">
                    {auth.attemptedUsername}
                  </label>
                  <a
                    id="reset-login"
                    href={url.loginRestartFlowUrl}
                    aria-label={msgStr("restartLoginTooltip")}
                  >
                    <div className="kc-login-tooltip">
                      <i className={kcClsx("kcResetFlowIcon")}></i>
                      <span className="kc-tooltip-text">
                        {msg("restartLoginTooltip")}
                      </span>
                    </div>
                  </a>
                </div>
              );

              if (displayRequiredFields) {
                return (
                  <div className="text-sm">
                    <div
                      className={clsx(
                        kcClsx("kcLabelWrapperClass"),
                        "subtitle",
                      )}
                    >
                      <span className="subtitle">
                        <span className="required">*</span>
                        {msg("requiredFields")}
                      </span>
                    </div>
                    <div className="col-md-10">{node}</div>
                  </div>
                );
              }

              return node;
            })()}
          </header>
          <div id="kc-content" className="">
            <div id="kc-content-wrapper">
              {/* App-initiated actions should not see warning messages about the need to complete the action during login. */}
              {displayMessage &&
                message !== undefined &&
                (message.type !== "warning" || !isAppInitiatedAction) && (
                  <div
                    className={clsx(
                      `alert-${message.type}`,
                      kcClsx("kcAlertClass"),
                      `pf-m-${message?.type === "error" ? "danger" : message.type}`,
                    )}
                  >
                    <div className="pf-c-alert__icon">
                      {message.type === "success" && (
                        <span
                          className={kcClsx("kcFeedbackSuccessIcon")}
                        ></span>
                      )}
                      {message.type === "warning" && (
                        <span
                          className={kcClsx("kcFeedbackWarningIcon")}
                        ></span>
                      )}
                      {message.type === "error" && (
                        <span className={kcClsx("kcFeedbackErrorIcon")}></span>
                      )}
                      {message.type === "info" && (
                        <span className={kcClsx("kcFeedbackInfoIcon")}></span>
                      )}
                    </div>
                    <span
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: message.summary,
                      }}
                    />
                  </div>
                )}
              {children}
              {auth !== undefined && auth.showTryAnotherWayLink && (
                <form
                  id="kc-select-try-another-way-form"
                  action={url.loginAction}
                  method="post"
                >
                  <div className={kcClsx("kcFormGroupClass")}>
                    <input type="hidden" name="tryAnotherWay" value="on" />
                    <a
                      href="#"
                      id="try-another-way"
                      onClick={() => {
                        document.forms[
                          "kc-select-try-another-way-form" as never
                        ].submit();
                        return false;
                      }}
                    >
                      {msg("doTryAnotherWay")}
                    </a>
                  </div>
                </form>
              )}
              {socialProvidersNode}
            </div>
          </div>
          {displayInfo && (
            <div className="w-full">
              <div className="text-foreground">{infoNode}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
