import type { ClassKey } from "keycloakify/login";
import DefaultPage from "keycloakify/login/DefaultPage";
import { Suspense, lazy } from "react";

import type { KcContext } from "./KcContext";
import Template from "./Template";
import { TemplateCustom } from "./TemplateCustom";
import { useI18n } from "./i18n";

const Login = lazy(() => import("./pages/Login"));
const UserProfileFormFields = lazy(
  () => import("keycloakify/login/UserProfileFormFields"),
);

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
  const { kcContext } = props;

  const { i18n } = useI18n({ kcContext });

  return (
    <Suspense>
      {(() => {
        switch (kcContext.pageId) {
          case "login.ftl":
            return (
              <Login
                {...{ kcContext, i18n, classes }}
                Template={TemplateCustom}
                doUseDefaultCss={false}
              />
            );
          default:
            return (
              <DefaultPage
                kcContext={kcContext}
                i18n={i18n}
                classes={classes}
                Template={Template}
                doUseDefaultCss={true}
                UserProfileFormFields={UserProfileFormFields}
                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
              />
            );
        }
      })()}
    </Suspense>
  );
}

const classes = {} satisfies { [key in ClassKey]?: string };
