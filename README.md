<p align="center">
    <i>🚀 <a href="https://keycloakify.dev">Keycloakify</a> v11 starter 🚀</i>
    <br/>
    <br/>
</p>

# Solvro Keycloak Theme with USOS OAuth 1.0a Integration

This project provides a custom Keycloak theme along with a custom OAuth 1.0a identity provider for USOS (University Student Information System) integration, enabling students to login using their university accounts.

## Features

- **Custom Keycloak Theme**: Modern, responsive design built with React and Tailwind CSS
- **USOS OAuth 1.0a Provider**: Complete implementation of OAuth 1.0a protocol for USOS API integration
- **Docker Ready**: Pre-configured Docker build with both theme and provider
- **Multi-language Support**: Built-in internationalization support

## USOS Integration

The custom USOS identity provider enables seamless authentication with university USOS systems using OAuth 1.0a protocol. Students can login directly using their university credentials.

### Key Features:

- Full OAuth 1.0a flow implementation (request token → authorization → access token)
- User profile mapping from USOS API
- Configurable USOS instance endpoints
- Comprehensive error handling and logging
- Security best practices

For detailed setup instructions, see [USOS Setup Guide](./USOS_SETUP_GUIDE.md).

## Quick start

```bash
git clone https://github.com/keycloakify/keycloakify-starter
cd keycloakify-starter
yarn install # Or use an other package manager, just be sure to delete the yarn.lock if you use another package manager.
```

# Testing the theme locally

[Documentation](https://docs.keycloakify.dev/testing-your-theme)

# How to customize the theme

[Documentation](https://docs.keycloakify.dev/customization-strategies)

# Building the theme

You need to have [Maven](https://maven.apache.org/) installed to build the theme (Maven >= 3.1.1, Java >= 7).  
The `mvn` command must be in the $PATH.

- On macOS: `brew install maven`
- On Debian/Ubuntu: `sudo apt-get install maven`
- On Windows: `choco install openjdk` and `choco install maven` (Or download from [here](https://maven.apache.org/download.cgi))

```bash
npm run build-keycloak-theme
```

Note that by default Keycloakify generates multiple .jar files for different versions of Keycloak.  
You can customize this behavior, see documentation [here](https://docs.keycloakify.dev/targeting-specific-keycloak-versions).

# Initializing the account theme

```bash
npx keycloakify initialize-account-theme
```

# Initializing the email theme

```bash
npx keycloakify initialize-email-theme
```

# GitHub Actions

The starter comes with a generic GitHub Actions workflow that builds the theme and publishes
the jars [as GitHub releases artifacts](https://github.com/keycloakify/keycloakify-starter/releases/tag/v10.0.0).  
To release a new version **just update the `package.json` version and push**.

To enable the workflow go to your fork of this repository on GitHub then navigate to:
`Settings` > `Actions` > `Workflow permissions`, select `Read and write permissions`.
