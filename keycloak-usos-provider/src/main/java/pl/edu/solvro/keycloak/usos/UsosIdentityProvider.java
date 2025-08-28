package pl.edu.solvro.keycloak.usos;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import oauth.signpost.OAuthConsumer;
import oauth.signpost.OAuthProvider;
import oauth.signpost.basic.DefaultOAuthConsumer;
import oauth.signpost.basic.DefaultOAuthProvider;
import oauth.signpost.exception.OAuthException;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.jboss.logging.Logger;
import org.keycloak.broker.provider.AbstractIdentityProvider;
import org.keycloak.broker.provider.AuthenticationRequest;
import org.keycloak.broker.provider.BrokeredIdentityContext;
import org.keycloak.broker.provider.IdentityBrokerException;
import org.keycloak.events.EventBuilder;
import org.keycloak.models.FederatedIdentityModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.services.ErrorResponse;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * USOS OAuth 1.0a Identity Provider implementation
 */
public class UsosIdentityProvider extends AbstractIdentityProvider<UsosIdentityProviderConfig> {
    
    private static final Logger logger = Logger.getLogger(UsosIdentityProvider.class);
    private static final String REQUEST_TOKEN_SESSION_KEY = "USOS_REQUEST_TOKEN";
    private static final String REQUEST_TOKEN_SECRET_SESSION_KEY = "USOS_REQUEST_TOKEN_SECRET";
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    public UsosIdentityProvider(KeycloakSession session, UsosIdentityProviderConfig config) {
        super(session, config);
    }
    
    @Override
    public Object callback(RealmModel realm, AuthenticationCallback callback, EventBuilder event) {
        return new Endpoint(callback, realm, event);
    }
    
    @Override
    public Response performLogin(AuthenticationRequest request) {
        try {
            // Step 1: Get request token
            OAuthConsumer consumer = new DefaultOAuthConsumer(
                getConfig().getConsumerKey(), 
                getConfig().getConsumerSecret()
            );
            
            OAuthProvider provider = new DefaultOAuthProvider(
                getConfig().getRequestTokenUrl(),
                getConfig().getAccessTokenUrl(),
                getConfig().getAuthorizationUrl()
            );
            
            String callbackUrl = request.getRedirectUri() + "?state=" + request.getState().getEncoded();
            String authUrl = provider.retrieveRequestToken(consumer, callbackUrl);
            
            // Store request token in session
            request.getAuthenticationSession().setClientNote(REQUEST_TOKEN_SESSION_KEY, consumer.getToken());
            request.getAuthenticationSession().setClientNote(REQUEST_TOKEN_SECRET_SESSION_KEY, consumer.getTokenSecret());
            
            return Response.seeOther(URI.create(authUrl)).build();
            
        } catch (OAuthException e) {
            throw new IdentityBrokerException("Failed to retrieve request token from USOS", e);
        }
    }
    
    @Override
    public Response retrieveToken(KeycloakSession session, FederatedIdentityModel identity) {
        return Response.ok(identity.getToken()).build();
    }
    
    @Override
    public void preprocessFederatedIdentity(KeycloakSession session, RealmModel realm, BrokeredIdentityContext context) {
        // Implementation for pre-processing if needed
    }
    
    protected class Endpoint {
        protected AuthenticationCallback callback;
        protected RealmModel realm;
        protected EventBuilder event;

        @Context
        protected KeycloakSession session;

        @Context
        protected HttpHeaders headers;

        @Context
        protected UriInfo uriInfo;
        
        public Endpoint(AuthenticationCallback callback, RealmModel realm, EventBuilder event) {
            this.callback = callback;
            this.realm = realm;
            this.event = event;
        }
        
        @GET
        public Response authResponse(@QueryParam("oauth_token") String oauthToken,
                                   @QueryParam("oauth_verifier") String oauthVerifier,
                                   @QueryParam("state") String state) {
            try {
                if (oauthVerifier == null || oauthToken == null) {
                    logger.error("Missing oauth_verifier or oauth_token parameters");
                    return callback.error("Missing OAuth parameters");
                }
                
                // Retrieve request token from session
                String requestToken = session.getContext().getAuthenticationSession()
                    .getClientNote(REQUEST_TOKEN_SESSION_KEY);
                String requestTokenSecret = session.getContext().getAuthenticationSession()
                    .getClientNote(REQUEST_TOKEN_SECRET_SESSION_KEY);
                
                if (requestToken == null || requestTokenSecret == null) {
                    logger.error("Request token not found in session");
                    return callback.error("Request token not found in session");
                }
                
                // Step 2: Exchange request token for access token
                OAuthConsumer consumer = new DefaultOAuthConsumer(
                    getConfig().getConsumerKey(), 
                    getConfig().getConsumerSecret()
                );
                consumer.setTokenWithSecret(requestToken, requestTokenSecret);
                
                OAuthProvider provider = new DefaultOAuthProvider(
                    getConfig().getRequestTokenUrl(),
                    getConfig().getAccessTokenUrl(),
                    getConfig().getAuthorizationUrl()
                );
                
                provider.retrieveAccessToken(consumer, oauthVerifier);
                
                // Step 3: Get user info
                String userInfoUrl = getConfig().getUserInfoUrl() + "?format=json";
                String userInfo = makeAuthenticatedRequest(userInfoUrl, consumer);
                
                // Parse user info and create identity context
                BrokeredIdentityContext identity = parseUserInfo(userInfo, consumer.getToken());
                identity.setIdp(UsosIdentityProvider.this);
                
                return callback.authenticated(identity);
                
            } catch (Exception e) {
                logger.error("Error processing OAuth callback", e);
                return callback.error("Authentication failed: " + e.getMessage());
            }
        }
    }
    
    private String makeAuthenticatedRequest(String url, OAuthConsumer consumer) throws IOException, OAuthException {
        HttpGet request = new HttpGet(url);
        consumer.sign(request);
        
        try (CloseableHttpClient httpClient = HttpClients.createDefault();
             CloseableHttpResponse response = httpClient.execute(request)) {
            
            HttpEntity entity = response.getEntity();
            if (entity != null) {
                return EntityUtils.toString(entity, "UTF-8");
            }
            throw new IOException("Empty response from USOS API");
        }
    }
    
    private BrokeredIdentityContext parseUserInfo(String userInfoJson, String accessToken) {
        try {
            JsonNode userNode = objectMapper.readTree(userInfoJson);
            
            BrokeredIdentityContext identity = new BrokeredIdentityContext(userNode.get("id").asText(), getConfig().getModel());
            identity.setUsername(userNode.get("id").asText());
            identity.setEmail(userNode.path("email").asText());
            identity.setFirstName(userNode.path("first_name").asText());
            identity.setLastName(userNode.path("last_name").asText());
            identity.setToken(accessToken);
            
            // Set additional user attributes
            Map<String, Object> attributes = new HashMap<>();
            if (userNode.has("student_number")) {
                attributes.put("student_number", userNode.get("student_number").asText());
            }
            if (userNode.has("staff_status")) {
                attributes.put("staff_status", userNode.get("staff_status").asText());
            }
            if (userNode.has("student_status")) {
                attributes.put("student_status", userNode.get("student_status").asText());
            }
            
            identity.setContextData(attributes);
            return identity;
            
        } catch (Exception e) {
            throw new IdentityBrokerException("Failed to parse user info from USOS", e);
        }
    }
}