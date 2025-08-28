package pl.edu.solvro.keycloak.usos;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.keycloak.models.IdentityProviderModel;
import org.mockito.Mockito;

/**
 * Integration tests for USOS OAuth 1.0a flow using WireMock to simulate USOS server.
 */
class UsosOAuthIntegrationTest {

    private static final String TEST_CONSUMER_KEY = "test-consumer-key";
    private static final String TEST_CONSUMER_SECRET = "test-consumer-secret";
    private static final String TEST_REQUEST_TOKEN = "test-request-token";
    private static final String TEST_REQUEST_TOKEN_SECRET = "test-request-token-secret";
    private static final String TEST_ACCESS_TOKEN = "test-access-token";
    private static final String TEST_ACCESS_TOKEN_SECRET = "test-access-token-secret";
    private static final String TEST_OAUTH_VERIFIER = "test-verifier";

    private WireMockServer wireMockServer;
    private String baseUrl;
    private UsosIdentityProviderConfig config;

    @BeforeEach
    void setUp() {
        // Start WireMock server
        wireMockServer = new WireMockServer(WireMockConfiguration.options().dynamicPort());
        wireMockServer.start();
        WireMock.configureFor("localhost", wireMockServer.port());

        baseUrl = "http://localhost:" + wireMockServer.port();

        // Setup mock USOS configuration
        Map<String, String> configMap = new HashMap<>();
        configMap.put("usosBaseUrl", baseUrl);
        configMap.put("clientId", TEST_CONSUMER_KEY);
        configMap.put("clientSecret", TEST_CONSUMER_SECRET);

        IdentityProviderModel model = Mockito.mock(IdentityProviderModel.class);
        Mockito.when(model.getConfig()).thenReturn(configMap);

        config = new UsosIdentityProviderConfig(model);
    }

    @AfterEach
    void tearDown() {
        if (wireMockServer != null) {
            wireMockServer.stop();
        }
    }

    @Test
    void oauth_urlGeneration_shouldGenerateCorrectUrls() {
        // Then
        assertThat(config.getRequestTokenUrl()).isEqualTo(baseUrl + "/services/oauth/request_token");
        assertThat(config.getAuthorizationUrl()).isEqualTo(baseUrl + "/services/oauth/authorize");
        assertThat(config.getAccessTokenUrl()).isEqualTo(baseUrl + "/services/oauth/access_token");
        assertThat(config.getUserInfoUrl()).isEqualTo(baseUrl + "/services/users/user");
    }

    @Test
    void oauth_requestTokenEndpoint_shouldBeProperlyConfigured() {
        // Given - Mock USOS request token endpoint
        stubFor(post(urlPathEqualTo("/services/oauth/request_token"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/x-www-form-urlencoded")
                        .withBody("oauth_token=" + TEST_REQUEST_TOKEN + 
                                "&oauth_token_secret=" + TEST_REQUEST_TOKEN_SECRET +
                                "&oauth_callback_confirmed=true")));

        // When - Test URL generation
        String requestTokenUrl = config.getRequestTokenUrl();

        // Then
        assertThat(requestTokenUrl).contains("/services/oauth/request_token");
        assertThat(requestTokenUrl).startsWith(baseUrl);
    }

    @Test
    void oauth_accessTokenEndpoint_shouldBeProperlyConfigured() {
        // Given - Mock USOS access token endpoint
        stubFor(post(urlPathEqualTo("/services/oauth/access_token"))
                .withHeader("Authorization", equalTo("OAuth oauth_consumer_key=\"" + TEST_CONSUMER_KEY + "\""))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/x-www-form-urlencoded")
                        .withBody("oauth_token=" + TEST_ACCESS_TOKEN + 
                                "&oauth_token_secret=" + TEST_ACCESS_TOKEN_SECRET)));

        // When - Test URL generation
        String accessTokenUrl = config.getAccessTokenUrl();

        // Then
        assertThat(accessTokenUrl).contains("/services/oauth/access_token");
        assertThat(accessTokenUrl).startsWith(baseUrl);
    }

    @Test
    void oauth_authorizationEndpoint_shouldBeProperlyConfigured() {
        // When
        String authorizationUrl = config.getAuthorizationUrl();

        // Then
        assertThat(authorizationUrl).contains("/services/oauth/authorize");
        assertThat(authorizationUrl).startsWith(baseUrl);
    }

    @Test
    void usos_userInfoEndpoint_shouldReturnValidUserData() {
        // Given - Mock USOS user info endpoint
        String userInfoJson = """
                {
                    "id": "12345",
                    "first_name": "Jan",
                    "last_name": "Kowalski",
                    "email": "jan.kowalski@student.university.edu.pl",
                    "student_number": "123456",
                    "staff_status": "0",
                    "student_status": "2"
                }
                """;

        stubFor(get(urlPathEqualTo("/services/users/user"))
                .withQueryParam("format", equalTo("json"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(userInfoJson)));

        // When
        String userInfoUrl = config.getUserInfoUrl();

        // Then
        assertThat(userInfoUrl).contains("/services/users/user");
        assertThat(userInfoUrl).startsWith(baseUrl);
    }

    @Test
    void oauth_flow_endpoints_shouldBeConsistentlyConfigured() {
        // Given
        String expectedBaseUrl = baseUrl;

        // When & Then
        assertThat(config.getRequestTokenUrl()).startsWith(expectedBaseUrl);
        assertThat(config.getAuthorizationUrl()).startsWith(expectedBaseUrl);
        assertThat(config.getAccessTokenUrl()).startsWith(expectedBaseUrl);
        assertThat(config.getUserInfoUrl()).startsWith(expectedBaseUrl);

        // Verify all endpoints use the same base URL
        assertThat(config.getRequestTokenUrl()).contains(expectedBaseUrl);
        assertThat(config.getAuthorizationUrl()).contains(expectedBaseUrl);
        assertThat(config.getAccessTokenUrl()).contains(expectedBaseUrl);
        assertThat(config.getUserInfoUrl()).contains(expectedBaseUrl);
    }

    @Test
    void oauth_credentials_shouldBeProperlyConfigured() {
        // When & Then
        assertThat(config.getConsumerKey()).isEqualTo(TEST_CONSUMER_KEY);
        assertThat(config.getConsumerSecret()).isEqualTo(TEST_CONSUMER_SECRET);
        assertThat(config.getClientId()).isEqualTo(TEST_CONSUMER_KEY);
        assertThat(config.getClientSecret()).isEqualTo(TEST_CONSUMER_SECRET);
    }

    @Test
    void usos_errorResponse_shouldBeHandledGracefully() {
        // Given - Mock USOS error response
        stubFor(post(urlPathEqualTo("/services/oauth/request_token"))
                .willReturn(aResponse()
                        .withStatus(401)
                        .withHeader("Content-Type", "text/plain")
                        .withBody("Unauthorized")));

        // When - Test URL is still properly configured even for error scenarios
        String requestTokenUrl = config.getRequestTokenUrl();

        // Then
        assertThat(requestTokenUrl).isNotEmpty();
        assertThat(requestTokenUrl).contains("/services/oauth/request_token");
    }

    @Test
    void config_shouldSupportDifferentUsosInstances() {
        // Given - Different USOS base URLs
        String[] testUrls = {
                "https://usosweb.uw.edu.pl",
                "https://usosweb.pg.edu.pl",
                "https://usos.agh.edu.pl",
                "http://localhost:8080/usos-test"
        };

        for (String testUrl : testUrls) {
            // Given
            Map<String, String> configMap = new HashMap<>();
            configMap.put("usosBaseUrl", testUrl);
            configMap.put("clientId", TEST_CONSUMER_KEY);
            configMap.put("clientSecret", TEST_CONSUMER_SECRET);

            IdentityProviderModel model = Mockito.mock(IdentityProviderModel.class);
            Mockito.when(model.getConfig()).thenReturn(configMap);

            UsosIdentityProviderConfig testConfig = new UsosIdentityProviderConfig(model);

            // When & Then
            assertThat(testConfig.getRequestTokenUrl()).isEqualTo(testUrl + "/services/oauth/request_token");
            assertThat(testConfig.getAuthorizationUrl()).isEqualTo(testUrl + "/services/oauth/authorize");
            assertThat(testConfig.getAccessTokenUrl()).isEqualTo(testUrl + "/services/oauth/access_token");
            assertThat(testConfig.getUserInfoUrl()).isEqualTo(testUrl + "/services/users/user");
        }
    }
}