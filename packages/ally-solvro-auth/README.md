# @solvro/auth

> AdonisJS Ally driver dla Solvro Auth

Oficjalny pakiet do integracji Solvro Auth z aplikacjami AdonisJS. Umożliwia łatwą autentykację użytkowników przez scentralizowany system uwierzytelniania Koła Naukowego Solvro.

## Instalacja

```bash
npm install @solvro/auth
```

## Konfiguracja

```bash
node ace configure @solvro/auth
```

Podczas konfiguracji zostaniesz poproszony o podanie `CLIENT_ID` i `CLIENT_SECRET`.
Aby je otrzymać, zapytaj na kanale #main i zpinguj @Bartosz Gotowski 😍.

## Automatyczna konfiguracja

Pakiet automatycznie skonfiguruje:

- ✅ Kontroler uwierzytelniania (`AuthController`)
- ✅ Trasy logowania/wylogowania
- ✅ Zmienne środowiskowe
- ✅ Konfigurację Ally driver

## Użycie

Po konfiguracji możesz używać Solvro Auth w swojej aplikacji:

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

// Wylogowanie
Route.post("/logout", async ({ auth, response }) => {
  await auth.use("web").logout();
  return response.redirect("/");
});
```

## Struktura użytkownika

Pakiet zwraca obiekt użytkownika z następującymi polami:

```typescript
{
  id: string; // UUID użytkownika w Keycloak
  email: string; // Adres email
  name: string; // Pełne imię i nazwisko
  emailVerified: boolean;
  original: {
    // Surowe dane z Keycloak
    sub: string;
    email: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    // ... inne pola z Keycloak
  }
}
```

## Zmienne środowiskowe

Po konfiguracji w pliku `.env` znajdziesz:

```env
APP_DOMAIN=http://localhost:3333
SOLVRO_AUTH_CLIENT_ID=your-client-id
SOLVRO_AUTH_CLIENT_SECRET=your-client-secret
```

## Konfiguracja

Pakiet automatycznie aktualizuje następujące pliki:

### `config/ally.ts`

```typescript
import { SolvroAuthService } from "@solvro/auth";

import { defineConfig } from "@adonisjs/ally";

export default defineConfig({
  solvroAuth: SolvroAuthService({
    clientId: env.get("SOLVRO_AUTH_CLIENT_ID"),
    clientSecret: env.get("SOLVRO_AUTH_CLIENT_SECRET"),
    callbackUrl: "",
  }),
});
```

### `start/routes.ts`

```typescript
router.get("/auth/login", [AuthController, "login"]).use(middleware.guest());
router
  .get("/auth/callback", [AuthController, "callback"])
  .use(middleware.guest());
router.post("/auth/logout", [AuthController, "logout"]).use(middleware.auth());
```

### `app/controllers/auth_controller.ts`

```typescript
export default class AuthController {
  async login({ ally }: HttpContext) {
    return ally.use("solvroAuth").redirect();
  }

  async callback({ ally, auth, response }: HttpContext) {
    const solvroUser = await ally.use("solvroAuth").user();
    // Logika tworzenia/logowania użytkownika
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use("web").logout();
    return response.redirect("/");
  }
}
```

## Rozwój

### Struktura kodu

```
src/
├── driver.ts           # Implementacja Ally driver
└── user_schema.ts      # Schema użytkownika
```

### Driver implementation

Driver implementuje standardowy interfejs AdonisJS Ally z następującymi właściwościami:

- `authorizeUrl`: URL autoryzacji Keycloak
- `accessTokenUrl`: URL wymiany kodu na token
- `userInfoUrl`: URL pobierania informacji o użytkowniku
- `codeParamName`: 'code'
- `errorParamName`: 'error'
- `stateCookieName`: 'solvro_oauth_state'
- `stateParamName`: 'state'
- `scopeParamName`: 'scope'
- `scopesSeparator`: ' '

## Testowanie

### Lokalne testowanie

1. Zbuduj pakiet:

   ```bash
   npm run build
   ```

2. W swojej aplikacji AdonisJS zainstaluj pakiet lokalnie:

   ```bash
   npm install path/to/solvro-auth/package
   ```

3. Skonfiguruj pakiet:
   ```bash
   node ace configure @solvro/auth
   ```

### Przykład aplikacji

W folderze `examples/adonisjs` znajdziesz przykład pełnej aplikacji AdonisJS z skonfigurowanym Solvro Auth.

## Wsparcie

W razie problemów:

1. Sprawdź dokumentację w głównym [README](../../README.md)
2. Zapytaj na kanale #main i zpinguj @Bartosz Gotowski 😍

## Licencja

MIT License

---

_Stworzony z ❤️ przez Koło Naukowe Solvro_
