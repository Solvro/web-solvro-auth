package pl.edu.solvro.keycloak.usos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.models.FederatedIdentityModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Simplified tests for UsosIdentityProvider focusing on core functionality.
 */
@ExtendWith(MockitoExtension.class)
class UsosIdentityProviderTest {

    private static final String TEST_CONSUMER_KEY = "test-consumer-key";
    private static final String TEST_CONSUMER_SECRET = "test-consumer-secret";
    private static final String TEST_BASE_URL = "https://usosweb.university.edu.pl";

    @Mock
    private KeycloakSession session;

    @Mock
    private RealmModel realm;

    @Mock
    private FederatedIdentityModel federatedIdentity;

    private UsosIdentityProviderConfig config;
    private UsosIdentityProvider provider;
    private Map<String, String> configMap;

    @BeforeEach
    void setUp() {
        configMap = new HashMap<>();
        configMap.put("usosBaseUrl", TEST_BASE_URL);
        configMap.put("clientId", TEST_CONSUMER_KEY);
        configMap.put("clientSecret", TEST_CONSUMER_SECRET);

        org.keycloak.models.IdentityProviderModel model = mock(org.keycloak.models.IdentityProviderModel.class);
        when(model.getConfig()).thenReturn(configMap);

        config = new UsosIdentityProviderConfig(model);
        provider = new UsosIdentityProvider(session, config);
    }

    @Test
    void constructor_withSessionAndConfig_shouldCreateProvider() {
        // When
        UsosIdentityProvider newProvider = new UsosIdentityProvider(session, config);

        // Then
        assertThat(newProvider).isNotNull();
        assertThat(newProvider).isInstanceOf(UsosIdentityProvider.class);
    }

    @Test
    void config_shouldBeAccessible() {
        // When
        UsosIdentityProviderConfig retrievedConfig = provider.getConfig();

        // Then
        assertThat(retrievedConfig).isEqualTo(config);
        assertThat(retrievedConfig.getUsosBaseUrl()).isEqualTo(TEST_BASE_URL);
        assertThat(retrievedConfig.getConsumerKey()).isEqualTo(TEST_CONSUMER_KEY);
        assertThat(retrievedConfig.getConsumerSecret()).isEqualTo(TEST_CONSUMER_SECRET);
    }

    @Test
    void urlGeneration_shouldUseConfiguredUrls() {
        // Then
        assertThat(config.getRequestTokenUrl()).isEqualTo(TEST_BASE_URL + "/services/oauth/request_token");
        assertThat(config.getAuthorizationUrl()).isEqualTo(TEST_BASE_URL + "/services/oauth/authorize");
        assertThat(config.getAccessTokenUrl()).isEqualTo(TEST_BASE_URL + "/services/oauth/access_token");
        assertThat(config.getUserInfoUrl()).isEqualTo(TEST_BASE_URL + "/services/users/user");
    }

    @Test
    void provider_shouldExtendAbstractIdentityProvider() {
        // Then
        assertThat(provider).isInstanceOf(org.keycloak.broker.provider.AbstractIdentityProvider.class);
    }

    @Test
    void provider_shouldHaveCorrectConfiguration() {
        // Test that provider is correctly configured
        assertThat(provider).isNotNull();
        assertThat(provider.getConfig()).isNotNull();
        assertThat(provider.getConfig().getUsosBaseUrl()).isEqualTo(TEST_BASE_URL);
    }
}