package pl.edu.solvro.keycloak.usos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.models.IdentityProviderModel;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Comprehensive tests for UsosIdentityProviderConfig.
 */
@ExtendWith(MockitoExtension.class)
class UsosIdentityProviderConfigTest {

    private static final String TEST_BASE_URL = "https://usosweb.university.edu.pl";
    private static final String TEST_CONSUMER_KEY = "test-consumer-key";
    private static final String TEST_CONSUMER_SECRET = "test-consumer-secret";

    @Mock
    private IdentityProviderModel model;

    private Map<String, String> configMap;
    private UsosIdentityProviderConfig config;

    @BeforeEach
    void setUp() {
        configMap = new HashMap<>();
    }

    @Test
    void constructor_withModel_shouldSetInternalModel() {
        // Given
        when(model.getConfig()).thenReturn(configMap);
        
        // When
        config = new UsosIdentityProviderConfig(model);

        // Then
        assertThat(config.getModel()).isEqualTo(model);
    }

    @Test
    void constructor_withoutModel_shouldCreateConfigWithoutModel() {
        // When
        config = new UsosIdentityProviderConfig();

        // Then
        assertThat(config.getModel()).isNull();
    }

    @Test
    void getUsosBaseUrl_whenSet_shouldReturnBaseUrl() {
        // Given
        configMap.put("usosBaseUrl", TEST_BASE_URL);
        when(model.getConfig()).thenReturn(configMap);
        config = new UsosIdentityProviderConfig(model);

        // When
        String baseUrl = config.getUsosBaseUrl();

        // Then
        assertThat(baseUrl).isEqualTo(TEST_BASE_URL);
    }

    @Test
    void getUsosBaseUrl_whenNotSet_shouldReturnNull() {
        // Given
        when(model.getConfig()).thenReturn(configMap);
        config = new UsosIdentityProviderConfig(model);

        // When
        String baseUrl = config.getUsosBaseUrl();

        // Then
        assertThat(baseUrl).isNull();
    }

    @Test
    void getRequestTokenUrl_withBaseUrl_shouldReturnConstructedUrl() {
        // Given
        configMap.put("usosBaseUrl", TEST_BASE_URL);
        when(model.getConfig()).thenReturn(configMap);
        config = new UsosIdentityProviderConfig(model);

        // When
        String requestTokenUrl = config.getRequestTokenUrl();

        // Then
        assertThat(requestTokenUrl).isEqualTo(TEST_BASE_URL + "/services/oauth/request_token");
    }

    @Test
    void getAuthorizationUrl_withBaseUrl_shouldReturnConstructedUrl() {
        // Given
        configMap.put("usosBaseUrl", TEST_BASE_URL);
        when(model.getConfig()).thenReturn(configMap);
        config = new UsosIdentityProviderConfig(model);

        // When
        String authorizationUrl = config.getAuthorizationUrl();

        // Then
        assertThat(authorizationUrl).isEqualTo(TEST_BASE_URL + "/services/oauth/authorize");
    }

    @Test
    void getAccessTokenUrl_withBaseUrl_shouldReturnConstructedUrl() {
        // Given
        configMap.put("usosBaseUrl", TEST_BASE_URL);
        when(model.getConfig()).thenReturn(configMap);
        config = new UsosIdentityProviderConfig(model);

        // When
        String accessTokenUrl = config.getAccessTokenUrl();

        // Then
        assertThat(accessTokenUrl).isEqualTo(TEST_BASE_URL + "/services/oauth/access_token");
    }

    @Test
    void getUserInfoUrl_withBaseUrl_shouldReturnConstructedUrl() {
        // Given
        configMap.put("usosBaseUrl", TEST_BASE_URL);
        when(model.getConfig()).thenReturn(configMap);
        config = new UsosIdentityProviderConfig(model);

        // When
        String userInfoUrl = config.getUserInfoUrl();

        // Then
        assertThat(userInfoUrl).isEqualTo(TEST_BASE_URL + "/services/users/user");
    }

    @Test
    void consumerCredentials_shouldMapToClientCredentials() {
        // Given
        configMap.put("clientId", TEST_CONSUMER_KEY);
        configMap.put("clientSecret", TEST_CONSUMER_SECRET);
        when(model.getConfig()).thenReturn(configMap);
        config = new UsosIdentityProviderConfig(model);

        // When & Then
        assertThat(config.getConsumerKey()).isEqualTo(TEST_CONSUMER_KEY);
        assertThat(config.getConsumerSecret()).isEqualTo(TEST_CONSUMER_SECRET);
        assertThat(config.getClientId()).isEqualTo(TEST_CONSUMER_KEY);
        assertThat(config.getClientSecret()).isEqualTo(TEST_CONSUMER_SECRET);
    }

    @Test
    void config_shouldExtendOidcIdentityProviderConfig() {
        // Given
        when(model.getConfig()).thenReturn(configMap);
        config = new UsosIdentityProviderConfig(model);

        // Then
        assertThat(config).isInstanceOf(org.keycloak.broker.oidc.OIDCIdentityProviderConfig.class);
    }

    @Test
    void urlConstruction_withDifferentBaseUrls_shouldWorkCorrectly() {
        String[] testUrls = {
                "https://usosweb.university1.edu.pl",
                "https://usosweb.university2.edu.pl",
                "http://localhost:8080/usos"
        };

        for (String baseUrl : testUrls) {
            // Given
            Map<String, String> testConfigMap = new HashMap<>();
            testConfigMap.put("usosBaseUrl", baseUrl);
            when(model.getConfig()).thenReturn(testConfigMap);
            config = new UsosIdentityProviderConfig(model);

            // When & Then
            assertThat(config.getRequestTokenUrl()).isEqualTo(baseUrl + "/services/oauth/request_token");
            assertThat(config.getAuthorizationUrl()).isEqualTo(baseUrl + "/services/oauth/authorize");
            assertThat(config.getAccessTokenUrl()).isEqualTo(baseUrl + "/services/oauth/access_token");
            assertThat(config.getUserInfoUrl()).isEqualTo(baseUrl + "/services/users/user");
        }
    }
}