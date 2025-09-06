package pl.edu.solvro.keycloak.usos;

import org.keycloak.broker.oidc.OIDCIdentityProviderConfig;
import org.keycloak.models.IdentityProviderModel;

/**
 * Configuration for USOS Identity Provider
 */
public class UsosIdentityProviderConfig extends OIDCIdentityProviderConfig {
    
    private IdentityProviderModel internalModel;
    
    public UsosIdentityProviderConfig(IdentityProviderModel model) {
        super(model);
        this.internalModel = model;
    }
    
    public UsosIdentityProviderConfig() {
        super();
    }
    
    public IdentityProviderModel getModel() {
        return internalModel;
    }
    
    public String getUsosBaseUrl() {
        return getConfig().get("usosBaseUrl");
    }
    
    public void setUsosBaseUrl(String usosBaseUrl) {
        getConfig().put("usosBaseUrl", usosBaseUrl);
    }
    
    public String getConsumerKey() {
        return getClientId();
    }
    
    public void setConsumerKey(String consumerKey) {
        setClientId(consumerKey);
    }
    
    public String getConsumerSecret() {
        return getClientSecret();
    }
    
    public void setConsumerSecret(String consumerSecret) {
        setClientSecret(consumerSecret);
    }
    
    public String getRequestTokenUrl() {
        String baseUrl = getUsosBaseUrl();
        if (baseUrl != null && !baseUrl.isEmpty()) {
            return baseUrl + "/services/oauth/request_token";
        }
        return getConfig().get("requestTokenUrl");
    }
    
    public String getAuthorizationUrl() {
        String baseUrl = getUsosBaseUrl();
        if (baseUrl != null && !baseUrl.isEmpty()) {
            return baseUrl + "/services/oauth/authorize";
        }
        return getConfig().get("authorizationUrl");
    }
    
    public String getAccessTokenUrl() {
        String baseUrl = getUsosBaseUrl();
        if (baseUrl != null && !baseUrl.isEmpty()) {
            return baseUrl + "/services/oauth/access_token";
        }
        return getConfig().get("accessTokenUrl");
    }
    
    public String getUserInfoUrl() {
        String baseUrl = getUsosBaseUrl();
        if (baseUrl != null && !baseUrl.isEmpty()) {
            return baseUrl + "/services/users/user";
        }
        return getConfig().get("userInfoUrl");
    }
}