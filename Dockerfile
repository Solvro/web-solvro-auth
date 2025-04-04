FROM node:20-alpine AS build
RUN apk update && apk add --no-cache openjdk17 maven
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build-keycloak-theme

FROM quay.io/keycloak/keycloak:26.1.2
WORKDIR /opt/keycloak
COPY --from=build /app/dist_keycloak/keycloak-theme-for-kc-all-other-versions.jar /opt/keycloak/providers/

RUN /opt/keycloak/bin/kc.sh build --db=postgres --health-enabled=true --features=docker

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", "--optimized"]
