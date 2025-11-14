# Solvro Auth - Keycloak Theme & AdonisJS Ally Integration

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.**

## Project Overview

This is a multi-project repository containing:

- **Keycloak theme** (root directory) - React/TypeScript theme built with Keycloakify v11
- **AdonisJS Ally driver** (`packages/ally-solvro-auth`) - Custom OAuth2 driver for AdonisJS
- **Example AdonisJS app** (`examples/adonisjs`) - Demonstrates how to use the ally driver

## Prerequisites and Setup

**NEVER CANCEL BUILDS OR LONG-RUNNING COMMANDS** - All commands below have been validated to work correctly.

### Required Tools

- Node.js 18+ or 20+ (prefer 22.14.0 via Volta)
- npm 10+
- Maven 3.1.1+ (required for Keycloak theme building)
- Java 7+ (required for Maven)
- Docker (for Keycloak testing)

### Initial Setup Commands

Run these commands in order:

```bash
# 1. Install main dependencies - NEVER CANCEL: Takes 10 seconds. Set timeout to 60+ minutes.
npm ci

# 2. Build Keycloak theme - NEVER CANCEL: Takes 35 seconds. Set timeout to 90+ minutes.
npm run build-keycloak-theme

# 3. Build ally package
cd packages/ally-solvro-auth
npm ci  # Takes ~7 seconds
npm run build  # Takes ~2 seconds

# 4. Setup AdonisJS example
cd ../../examples/adonisjs
npm ci  # Takes ~5 seconds
cp .env.example .env
# Edit .env to add: APP_KEY=test-key-for-development-only, APP_DOMAIN=http://localhost:3333, SOLVRO_AUTH_CLIENT_ID=test-client-id, SOLVRO_AUTH_CLIENT_SECRET=test-client-secret
```

## Build and Development Commands

### Main Keycloak Theme (Root Directory)

```bash
# Build theme - NEVER CANCEL: Takes 45 seconds. Set timeout to 90+ minutes.
npm run build-keycloak-theme

# Development server
npm run dev  # Starts Vite dev server on http://localhost:5173/

# Test theme in Keycloak - NEVER CANCEL: Takes 45-60 seconds for startup
npm run start  # Interactive: select Keycloak version (default 26.3.3) OR
npx keycloakify start-keycloak --keycloak-version 26  # Non-interactive
# Access: http://localhost:8080 (admin/admin), test user: testuser/password123

# Storybook for component development
npm run storybook  # Runs on http://localhost:6006/

# Format code
npm run format  # Uses Prettier via @solvro/config
```

### AdonisJS Ally Package (`packages/ally-solvro-auth/`)

```bash
# Build package
npm run build  # Takes ~2 seconds

# Development (watch mode)
npm run dev

# Format and type checking
npm run format
npm run typecheck

# Linting - NOTE: Currently has dependency issues, skip for now
# npm run lint  # Fails due to missing @adonisjs/eslint-config
```

### AdonisJS Example (`examples/adonisjs/`)

```bash
# Run tests - NEVER CANCEL: Takes 5 seconds. Set timeout to 30+ minutes.
npm run test

# Development server
npm run dev  # Runs on http://localhost:3333

# Build application
npm run build

# Format, lint, type checking
npm run format
npm run lint  # Has TypeScript warnings about unsafe assignments
npm run typecheck
```

## Validation Scenarios

**ALWAYS run these validation steps after making changes:**

### 1. Main Theme Validation

```bash
# Build and test theme
npm run build-keycloak-theme
npm run start  # Test in Keycloak container
# Navigate to http://localhost:8080, verify login page loads with custom theme
```

### 2. Ally Package Validation

```bash
cd packages/ally-solvro-auth
npm run build
# Verify build/index.js and build/index.d.ts are created
```

### 3. AdonisJS Integration Validation

```bash
cd examples/adonisjs
# Ensure .env is configured with required variables
npm run test  # Should show "NO TESTS EXECUTED"
npm run dev   # Should start server successfully
# Navigate to http://localhost:3333, verify server responds
```

## Critical Build Information

### Timing Expectations

- **Main dependency install**: 10 seconds - NEVER CANCEL, set timeout to 60+ minutes
- **Main theme build**: 35 seconds - NEVER CANCEL, set timeout to 90+ minutes
- **Ally package build**: 2 seconds
- **Keycloak start**: 45-60 seconds (includes Docker image pull on first run)
- **AdonisJS tests**: 3 seconds - NEVER CANCEL, set timeout to 30+ minutes
- **Vite dev server**: 1 second startup
- **Storybook**: 2 seconds startup

### Known Issues

- **Linting**: Root project has no lint script, ally package lint fails due to missing deps
- **AdonisJS example**: Has TypeScript warnings about unsafe assignments (acceptable for example)
- **Tests**: AdonisJS example has no actual tests (shows "NO TESTS EXECUTED")

## Important File Locations

### Configuration Files

- `vite.config.ts` - Vite and Keycloakify configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Main project dependencies and scripts
- `packages/ally-solvro-auth/package.json` - Ally package configuration
- `examples/adonisjs/adonisrc.ts` - AdonisJS application configuration

### Key Directories

- `src/` - Main Keycloak theme source code
- `src/login/pages/` - Login page components
- `packages/ally-solvro-auth/src/` - Ally driver source
- `examples/adonisjs/app/controllers/` - AdonisJS controllers
- `dist_keycloak/` - Built Keycloak theme output
- `build/` (in ally package) - Built ally package output

### CI/CD

- `.github/workflows/ci.yaml` - Runs `npm run build-keycloak-theme`
- `.github/workflows/cd.yaml` - Builds Docker image and pushes to registry
- `Dockerfile` - Multi-stage build for Keycloak with theme

## Common Development Workflows

### Making Theme Changes

1. Edit files in `src/login/pages/`
2. Test with `npm run dev` (instant feedback)
3. Validate with `npm run build-keycloak-theme`
4. Test in Keycloak with `npm run start`
5. Always run `npm run format` before committing

### Making Ally Driver Changes

1. Edit files in `packages/ally-solvro-auth/src/`
2. Build with `npm run build`
3. Test in AdonisJS example: `cd examples/adonisjs && npm run dev`
4. Always run `npm run format` before committing

### Environment Variables for AdonisJS Example

Required in `examples/adonisjs/.env`:

```env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=test-key-for-development-only
NODE_ENV=development
SESSION_DRIVER=cookie
APP_DOMAIN=http://localhost:3333
SOLVRO_AUTH_CLIENT_ID=test-client-id
SOLVRO_AUTH_CLIENT_SECRET=test-client-secret
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

**To create this file:**

```bash
cd examples/adonisjs
cp .env.example .env
# Edit .env and add the missing APP_KEY, APP_DOMAIN, SOLVRO_AUTH_CLIENT_ID, and SOLVRO_AUTH_CLIENT_SECRET values above
```

## Docker and Deployment

### Local Docker Testing

```bash
# Build and run with docker-compose
docker-compose up  # Uses built theme in container

# Or build Docker image manually
docker build -t solvro-auth .
```

### Production Deployment

- CI builds and pushes to `ghcr.io/solvro/solvro-auth:latest`
- Theme is bundled into Keycloak container
- Uses PostgreSQL database in production (configured via docker-compose.yml)
