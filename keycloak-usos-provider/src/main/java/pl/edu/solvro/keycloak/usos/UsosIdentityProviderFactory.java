package pl.edu.solvro.keycloak.usos;

import org.keycloak.Config;
import org.keycloak.broker.provider.IdentityProviderFactory;
import org.keycloak.models.IdentityProviderModel;
import org.keycloak.models.KeycloakSession;
import java.util.HashMap;
import java.util.Map;

/**
 * Factory for creating USOS Identity Provider instances
 */
public class UsosIdentityProviderFactory implements IdentityProviderFactory<UsosIdentityProvider> {
    
    public static final String PROVIDER_ID = "usos";
    
    @Override
    public String getName() {
        return "USOS";
    }
    
    @Override
    public String getId() {
        return PROVIDER_ID;
    }
    
    @Override
    public UsosIdentityProvider create(KeycloakSession session, IdentityProviderModel model) {
        return new UsosIdentityProvider(session, new UsosIdentityProviderConfig(model));
    }
    
    @Override
    public UsosIdentityProvider create(KeycloakSession session) {
        throw new IllegalStateException("Provider must be created with IdentityProviderModel");
    }
    
    @Override
    public UsosIdentityProviderConfig createConfig() {
        return new UsosIdentityProviderConfig();
    }
    
    @Override
    public Map<String, String> parseConfig(KeycloakSession session, String configData) {
        return new HashMap<>(); // Basic implementation
    }
    
    @Override
    public void init(Config.Scope config) {
        // Nothing to initialize
    }
    
    @Override
    public void postInit(org.keycloak.models.KeycloakSessionFactory factory) {
        // Nothing to initialize
    }
    
    @Override
    public void close() {
        // Nothing to close
    }
}