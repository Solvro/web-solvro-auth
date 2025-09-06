# Solvro Auth

**Solvro Auth to serwis do scentralizowanej autentykacji dla wszystkich aplikacji Koła Naukowego Solvro.**

Ten projekt zawiera:

- 🎨 Nowoczesny motyw Keycloak zbudowany z wykorzystaniem [Keycloakify v11](https://keycloakify.dev)
- 🔌 Pakiet do integracji z AdonisJS ([@solvro/auth](packages/ally-solvro-auth))
- 📖 Przewodniki integracji dla różnych frameworków

## 🖼️ Zrzuty ekranu motywu

### Strona logowania

![Login Page](https://github.com/user-attachments/assets/627c270d-fc39-44fd-a086-bfb92723f32d)

### Strona rejestracji

![Register Page](https://github.com/user-attachments/assets/8ad9fd88-6acb-48f3-8e27-145b3a67fe36)

## 🚀 Szybki start

### Wymagania

- Node.js >= 18
- Maven >= 3.1.1 (dla budowania motywu)
- Java >= 7

### Instalacja

```bash
git clone https://github.com/Solvro/web-solvro-auth
cd web-solvro-auth
npm install
```

### Testowanie motywu lokalnie

```bash
npm run start
```

Komenda uruchomi Keycloak w kontenerze Docker z Twoim motywem.

### Budowanie motywu

```bash
npm run build-keycloak-theme
```

### Podgląd komponentów w Storybook

```bash
npm run storybook
```

## 🔧 Integracja z projektami

### 🟢 NestJS

#### 1. Instalacja zależności

```bash
npm install passport passport-jwt @nestjs/passport @nestjs/jwt
npm install -D @types/passport-jwt
```

#### 2. Konfiguracja JWT Strategy

```typescript
// src/auth/jwt.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        // Pobierz klucz publiczny z Keycloak
        const response = await fetch(
          "https://your-keycloak-domain/realms/solvro/protocol/openid-connect/certs",
        );
        const keys = await response.json();
        // Zweryfikuj token i zwróć klucz
        done(null, keys);
      },
      algorithms: ["RS256"],
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.preferred_username,
      email: payload.email,
      roles: payload.realm_access?.roles || [],
    };
  }
}
```

#### 3. Moduł Auth

```typescript
// src/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      // Konfiguracja jest obsługiwana przez strategy
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
```

#### 4. Guard dla ochrony endpointów

```typescript
// src/auth/jwt-auth.guard.ts
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

#### 5. Użycie w kontrolerze

```typescript
// src/app.controller.ts
import { Controller, Get, Request, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "./auth/jwt-auth.guard";

@Controller()
export class AppController {
  @UseGuards(JwtAuthGuard)
  @Get("protected")
  getProtectedData(@Request() req) {
    return {
      message: "To są chronione dane!",
      user: req.user,
    };
  }
}
```

### 🔴 AdonisJS

Dla AdonisJS mamy dedykowany pakiet `@solvro/auth` który znacznie upraszcza integrację.

#### 1. Instalacja

```bash
npm install @solvro/auth
node ace configure @solvro/auth
```

#### 2. Konfiguracja

Podczas konfiguracji zostaniesz poproszony o podanie `CLIENT_ID` i `CLIENT_SECRET`.
Aby je otrzymać, zapytaj na kanale #main i zpinguj @Bartosz Gotowski 😍.

#### 3. Automatyczna konfiguracja

Pakiet automatycznie:

- Tworzy kontroler uwierzytelniania
- Konfiguruje routes dla logowania/wylogowania
- Dodaje zmienne środowiskowe
- Konfiguruje Ally driver

#### 4. Użycie w aplikacji

```typescript
// Przekierowanie do logowania
Route.get("/login", ({ ally }) => {
  return ally.use("solvroAuth").redirect();
});

// Callback po logowaniu
Route.get("/callback", async ({ ally, auth, response }) => {
  const solvroUser = await ally.use("solvroAuth").user();

  // Stwórz lub znajdź użytkownika w bazie danych
  const user = await User.firstOrCreate(
    { email: solvroUser.email },
    {
      email: solvroUser.email,
      name: solvroUser.name,
      solvroId: solvroUser.id,
    },
  );

  await auth.use("web").login(user);
  return response.redirect("/dashboard");
});
```

### 🟡 Django

#### 1. Instalacja django-oauth-toolkit

```bash
pip install django-oauth-toolkit requests
```

#### 2. Konfiguracja settings.py

```python
# settings.py
INSTALLED_APPS = [
    # ... inne aplikacje
    'oauth2_provider',
]

MIDDLEWARE = [
    'oauth2_provider.middleware.OAuth2TokenMiddleware',
    # ... inne middleware
]

AUTHENTICATION_BACKENDS = [
    'oauth2_provider.backends.OAuth2Backend',
    'django.contrib.auth.backends.ModelBackend',
]

# Konfiguracja OAuth2
OAUTH2_PROVIDER = {
    'SCOPES': {
        'read': 'Read scope',
        'write': 'Write scope',
    },
    'ACCESS_TOKEN_EXPIRE_SECONDS': 3600,
    'REFRESH_TOKEN_EXPIRE_SECONDS': 3600 * 24 * 7,  # 7 dni
}

# Solvro Auth settings
SOLVRO_AUTH = {
    'KEYCLOAK_URL': 'https://your-keycloak-domain',
    'REALM': 'solvro',
    'CLIENT_ID': 'your-client-id',
    'CLIENT_SECRET': 'your-client-secret',
}
```

#### 3. Tworzenie widoków uwierzytelniania

```python
# views.py
import requests
from django.shortcuts import redirect
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.conf import settings

def solvro_login(request):
    """Przekierowanie do Keycloak"""
    keycloak_url = f"{settings.SOLVRO_AUTH['KEYCLOAK_URL']}/realms/{settings.SOLVRO_AUTH['REALM']}/protocol/openid-connect/auth"

    params = {
        'client_id': settings.SOLVRO_AUTH['CLIENT_ID'],
        'redirect_uri': request.build_absolute_uri('/auth/callback/'),
        'response_type': 'code',
        'scope': 'openid email profile',
    }

    query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
    return redirect(f"{keycloak_url}?{query_string}")

def solvro_callback(request):
    """Obsługa callback z Keycloak"""
    code = request.GET.get('code')

    if not code:
        return redirect('/login/?error=no_code')

    # Wymiana kodu na token
    token_url = f"{settings.SOLVRO_AUTH['KEYCLOAK_URL']}/realms/{settings.SOLVRO_AUTH['REALM']}/protocol/openid-connect/token"

    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': request.build_absolute_uri('/auth/callback/'),
        'client_id': settings.SOLVRO_AUTH['CLIENT_ID'],
        'client_secret': settings.SOLVRO_AUTH['CLIENT_SECRET'],
    }

    token_response = requests.post(token_url, data=token_data)
    token_json = token_response.json()

    access_token = token_json.get('access_token')

    if not access_token:
        return redirect('/login/?error=no_token')

    # Pobranie informacji o użytkowniku
    userinfo_url = f"{settings.SOLVRO_AUTH['KEYCLOAK_URL']}/realms/{settings.SOLVRO_AUTH['REALM']}/protocol/openid-connect/userinfo"

    headers = {'Authorization': f'Bearer {access_token}'}
    userinfo_response = requests.get(userinfo_url, headers=headers)
    userinfo = userinfo_response.json()

    # Stworzenie lub pobranie użytkownika
    user, created = User.objects.get_or_create(
        username=userinfo['preferred_username'],
        defaults={
            'email': userinfo['email'],
            'first_name': userinfo.get('given_name', ''),
            'last_name': userinfo.get('family_name', ''),
        }
    )

    login(request, user)
    return redirect('/dashboard/')
```

#### 4. URLs

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.solvro_login, name='solvro_login'),
    path('auth/callback/', views.solvro_callback, name='solvro_callback'),
]
```

### ⚛️ Next.js

#### 1. Instalacja next-auth

```bash
npm install next-auth
```

#### 2. Konfiguracja NextAuth.js

```typescript
// pages/api/auth/[...nextauth].ts (App Router: app/api/auth/[...nextauth]/route.ts)
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "solvro",
      name: "Solvro Auth",
      type: "oauth",
      wellKnown: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/.well-known/openid_connect_configuration`,
      authorization: { params: { scope: "openid email profile" } },
      idToken: true,
      checks: ["pkce", "state"],
      client: {
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

export default NextAuth(authOptions);
```

#### 3. Zmienne środowiskowe (.env.local)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
KEYCLOAK_URL=https://your-keycloak-domain
KEYCLOAK_REALM=solvro
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

#### 4. Użycie w komponencie

```tsx
// pages/dashboard.tsx
import { signIn, signOut, useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Ładowanie...</p>;

  if (status === "unauthenticated") {
    return (
      <>
        <p>Nie jesteś zalogowany</p>
        <button onClick={() => signIn("solvro")}>
          Zaloguj się przez Solvro Auth
        </button>
      </>
    );
  }

  return (
    <>
      <p>Zalogowany jako {session.user?.email}</p>
      <button onClick={() => signOut()}>Wyloguj się</button>
    </>
  );
}
```

#### 5. Provider w aplikacji

```tsx
// pages/_app.tsx (lub app/layout.tsx w App Router)
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
```

### ⚡ Vite

#### 1. Instalacja zależności

```bash
npm install @auth/core @auth/sveltekit  # dla SvelteKit
# lub
npm install axios  # dla vanilla JS/React
```

#### 2. Konfiguracja dla Vanilla JS/React z Vite

```typescript
// src/auth/solvroAuth.ts
interface SolvroAuthConfig {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  redirectUri: string;
}

export class SolvroAuth {
  private config: SolvroAuthConfig;
  private accessToken: string | null = null;

  constructor(config: SolvroAuthConfig) {
    this.config = config;
    this.loadTokenFromStorage();
  }

  // Przekierowanie do logowania
  login() {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: "openid email profile",
    });

    const authUrl = `${this.config.keycloakUrl}/realms/${this.config.realm}/protocol/openid-connect/auth?${params}`;
    window.location.href = authUrl;
  }

  // Obsługa callback
  async handleCallback(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      throw new Error("Brak kodu autoryzacyjnego");
    }

    try {
      const tokenResponse = await fetch(
        `${this.config.keycloakUrl}/realms/${this.config.realm}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: this.config.redirectUri,
            client_id: this.config.clientId,
          }),
        },
      );

      const tokens = await tokenResponse.json();

      if (tokens.access_token) {
        this.accessToken = tokens.access_token;
        localStorage.setItem("solvro_access_token", tokens.access_token);

        // Przekieruj po udanym logowaniu
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("Błąd podczas wymiany kodu na token:", error);
      return false;
    }
  }

  // Sprawdzenie czy użytkownik jest zalogowany
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Pobranie informacji o użytkowniku
  async getUserInfo() {
    if (!this.accessToken) {
      throw new Error("Brak tokena dostępu");
    }

    const response = await fetch(
      `${this.config.keycloakUrl}/realms/${this.config.realm}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    return response.json();
  }

  // Wylogowanie
  logout() {
    this.accessToken = null;
    localStorage.removeItem("solvro_access_token");

    const logoutUrl = `${this.config.keycloakUrl}/realms/${this.config.realm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(window.location.origin)}`;
    window.location.href = logoutUrl;
  }

  private loadTokenFromStorage() {
    this.accessToken = localStorage.getItem("solvro_access_token");
  }
}
```

#### 3. Użycie w aplikacji

```typescript
// src/main.ts
import { SolvroAuth } from "./auth/solvroAuth";

const auth = new SolvroAuth({
  keycloakUrl: "https://your-keycloak-domain",
  realm: "solvro",
  clientId: "your-client-id",
  redirectUri: window.location.origin + "/callback",
});

// Sprawdź czy to callback
if (window.location.search.includes("code=")) {
  auth.handleCallback().then((success) => {
    if (success) {
      console.log("Zalogowano pomyślnie!");
      // Przekieruj do głównej strony aplikacji
      window.location.href = "/dashboard";
    }
  });
}

// Eksportuj auth dla użycia w innych częściach aplikacji
export { auth };
```

#### 4. Komponent React z Vite

```tsx
// src/components/AuthButton.tsx
import React, { useEffect, useState } from "react";

import { auth } from "../main";

export function AuthButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());

    if (auth.isAuthenticated()) {
      auth.getUserInfo().then(setUserInfo);
    }
  }, []);

  if (isAuthenticated && userInfo) {
    return (
      <div>
        <p>Zalogowany jako: {userInfo.email}</p>
        <button onClick={() => auth.logout()}>Wyloguj się</button>
      </div>
    );
  }

  return (
    <button onClick={() => auth.login()}>Zaloguj się przez Solvro Auth</button>
  );
}
```

## 🛠️ Rozwój

### Uruchomienie środowiska deweloperskiego

```bash
# Zainstaluj zależności
npm install

# Uruchom Storybook do podglądu komponentów
npm run storybook

# Uruchom Keycloak lokalnie z motywem
npm run start

# Buduj motyw
npm run build
```

### Struktura projektu

```
web-solvro-auth/
├── src/                    # Kod źródłowy motywu Keycloak
│   ├── login/             # Strony logowania
│   ├── components/        # Komponenty UI
│   └── styles/           # Style CSS
├── packages/
│   └── ally-solvro-auth/ # Pakiet AdonisJS Ally
├── examples/             # Przykłady integracji
└── dist_keycloak/       # Zbudowany motyw
```

### Dodawanie nowych stron

1. Utwórz komponent w `src/login/pages/`
2. Dodaj stories w pliku `.stories.tsx`
3. Zarejestruj stronę w `src/login/KcPage.tsx`

### Testowanie

```bash
# Uruchom testy jednostkowe (jeśli istnieją)
npm test

# Sprawdź jakość kodu
npm run lint

# Formatuj kod
npm run format
```

## 📄 Licencja

MIT License - zobacz plik [LICENSE](LICENSE)

## 🤝 Współpraca

1. Fork projektu
2. Stwórz branch dla swojej funkcji (`git checkout -b feature/AmazingFeature`)
3. Commituj zmiany (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📞 Kontakt

W razie pytań dotyczących integracji, zapytaj na kanale #main i zpinguj @Bartosz Gotowski 😍

---

_Stworzono z ❤️ przez Koło Naukowe Solvro_
