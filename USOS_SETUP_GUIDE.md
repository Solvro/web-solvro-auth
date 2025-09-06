# USOS OAuth 1.0a Provider Setup Guide

This guide explains how to configure the custom USOS OAuth 1.0a identity provider in Keycloak.

## Overview

The USOS provider enables students to login using their university USOS accounts via OAuth 1.0a protocol. This custom provider has been integrated into the Keycloak Docker image and supports the full OAuth 1.0a flow required by USOS API.

## Prerequisites

1. Access to a USOS system (e.g., usosweb.example.edu.pl)
2. USOS OAuth application credentials (consumer key and secret)
3. Running Keycloak instance with the custom provider

## Configuration Steps

### 1. Register USOS OAuth Application

First, you need to register your application in the USOS system:

1. Contact your USOS administrator or go to the USOS developer portal
2. Register a new OAuth application
3. Set the callback URL to: `https://your-keycloak-domain/auth/realms/{realm-name}/broker/usos/endpoint`
4. Note down the Consumer Key and Consumer Secret

### 2. Configure USOS Identity Provider in Keycloak

1. Login to Keycloak Admin Console
2. Select your realm
3. Go to Identity Providers
4. Click "Add provider..." and select "USOS"
5. Configure the following settings:

#### Required Configuration:

- **Alias**: `usos` (or any unique identifier)
- **Display Name**: `USOS` (displayed on login screen)
- **Consumer Key**: Your USOS OAuth Consumer Key
- **Consumer Secret**: Your USOS OAuth Consumer Secret
- **USOS Base URL**: Base URL of your USOS instance (e.g., `https://usosweb.example.edu.pl`)

#### Optional Configuration:

- **First Login Flow**: Choose how new users are handled
- **Sync Mode**: How user data is synchronized
- **Store Token**: Whether to store OAuth tokens
- **Trust Email**: Whether to trust email from USOS

### 3. Advanced Configuration (Optional)

If your USOS installation uses non-standard endpoints, you can override them:

- **Request Token URL**: Custom request token endpoint
- **Authorization URL**: Custom authorization endpoint
- **Access Token URL**: Custom access token endpoint
- **User Info URL**: Custom user info endpoint

### 4. User Attribute Mapping

The provider automatically maps these USOS user attributes:

- `id` → Keycloak username
- `first_name` → First name
- `last_name` → Last name
- `email` → Email address
- `student_number` → Custom attribute
- `student_status` → Custom attribute
- `staff_status` → Custom attribute

You can configure additional attribute mappings in the provider settings.

## Testing the Integration

1. Go to your Keycloak login page
2. You should see a "USOS" button among social providers
3. Click the USOS button
4. You'll be redirected to USOS for authentication
5. After successful login, you'll be redirected back to Keycloak

## Troubleshooting

### Common Issues:

**"Request token not found in session"**

- Check that your callback URL is correctly configured
- Ensure cookies are enabled in the browser

**"Failed to retrieve request token"**

- Verify Consumer Key and Consumer Secret
- Check USOS Base URL is correct
- Ensure USOS system is accessible from Keycloak

**"Authentication failed"**

- Check Keycloak logs for detailed error messages
- Verify USOS user info endpoint is responding correctly

### Debug Configuration:

Enable debug logging in Keycloak by adding this to your configuration:

```
--log-level=DEBUG --log-console-color=true
```

Look for log entries from `pl.edu.solvro.keycloak.usos` package.

## USOS API Endpoints

The provider uses these standard USOS API endpoints:

- Request Token: `/services/oauth/request_token`
- Authorization: `/services/oauth/authorize`
- Access Token: `/services/oauth/access_token`
- User Info: `/services/users/user?format=json`

## Security Considerations

1. Always use HTTPS in production
2. Keep Consumer Secret secure
3. Regularly rotate OAuth credentials
4. Monitor authentication logs
5. Set up proper CORS policies

## Example Docker Compose

```yaml
version: "3.8"
services:
  keycloak:
    build: .
    environment:
      - KC_DB=postgres
      - KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
      - KC_DB_USERNAME=keycloak
      - KC_DB_PASSWORD=password
      - KC_HOSTNAME=localhost
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=keycloak
      - POSTGRES_USER=keycloak
      - POSTGRES_PASSWORD=password
```

## Support

For issues specific to this USOS provider, please check:

1. Keycloak server logs
2. USOS system availability
3. Network connectivity between Keycloak and USOS
4. OAuth credential validity

For USOS-specific questions, consult your USOS administrator or the USOS API documentation at https://apps.usos.edu.pl/developers/api/
