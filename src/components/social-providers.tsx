import type { KcClsx } from "keycloakify/login/lib/kcClsx";
import { clsx } from "keycloakify/tools/clsx";
import React from "react";

import type { I18nMessage } from "@/login/i18n";

import { Button } from "./ui/button";

export interface SocialProvidersProps {
  social: {
    providers?: Array<{
      alias: string;
      loginUrl: string;
      displayName: string;
      iconClasses?: string;
    }>;
  };
  kcClsx: KcClsx;

  msg: I18nMessage;
  realm: {
    password: boolean;
  };
}

export const SocialProviders: React.FC<SocialProvidersProps> = ({
  social,
  msg,
  realm,
}) => {
  const providers = social.providers || [];

  return (
    realm.password &&
    providers.length > 0 && (
      <>
        {realm.password &&
          social.providers !== undefined &&
          social.providers.length !== 0 && (
            <div id="kc-social-providers" className="mt-5 space-y-7">
              <h2 className="mt-7 text-center text-lg">
                {msg("identity-provider-login-label")}
              </h2>
              <div
                className={clsx(
                  "grid grid-cols-1 gap-2 text-lg",
                  social.providers.length > 1
                    ? "md:grid-cols-2"
                    : "grid-cols-1",
                )}
              >
                {social.providers.map((...[p]) => (
                  <Button
                    asChild
                    variant="secondary"
                    key={p.alias}
                    className="not-prose my-1.5 w-full items-center rounded-lg border px-3 py-1"
                  >
                    <a
                      id={`social-${p.alias}`}
                      className="flex w-full flex-row items-center justify-center py-2"
                      type="button"
                      href={p.loginUrl}
                    >
                      {p.iconClasses && (
                        <i
                          className={clsx(p.iconClasses)}
                          aria-hidden="true"
                        ></i>
                      )}
                      <span
                        className="mx-3"
                        dangerouslySetInnerHTML={{
                          __html: p.displayName,
                        }}
                      ></span>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
      </>
    )
  );
};
