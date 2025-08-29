package pl.edu.solvro.keycloak.usos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.Config;
import org.keycloak.models.IdentityProviderModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Comprehensive tests for UsosIdentityProviderFactory.
 */
@ExtendWith(MockitoExtension.class)
class UsosIdentityProviderFactoryTest {

    private UsosIdentityProviderFactory factory;

    @Mock
    private KeycloakSession session;

    @Mock
    private IdentityProviderModel model;

    @Mock
    private Config.Scope config;

    @Mock
    private KeycloakSessionFactory sessionFactory;

    @BeforeEach
    void setUp() {
        factory = new UsosIdentityProviderFactory();
    }

    @Test
    void getName_shouldReturnUsos() {
        // When
        String name = factory.getName();

        // Then
        assertThat(name).isEqualTo("USOS");
    }

    @Test
    void getId_shouldReturnUsosProviderId() {
        // When
        String id = factory.getId();

        // Then
        assertThat(id).isEqualTo("usos");
        assertThat(id).isEqualTo(UsosIdentityProviderFactory.PROVIDER_ID);
    }

    @Test
    void create_withSessionAndModel_shouldReturnUsosIdentityProvider() {
        // Given
        when(model.getConfig()).thenReturn(Map.of());

        // When
        UsosIdentityProvider provider = factory.create(session, model);

        // Then
        assertThat(provider).isNotNull();
        assertThat(provider).isInstanceOf(UsosIdentityProvider.class);
    }

    @Test
    void create_withSessionOnly_shouldThrowIllegalStateException() {
        // When & Then
        assertThatThrownBy(() -> factory.create(session))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Provider must be created with IdentityProviderModel");
    }

    @Test
    void createConfig_shouldReturnUsosIdentityProviderConfig() {
        // When
        UsosIdentityProviderConfig config = factory.createConfig();

        // Then
        assertThat(config).isNotNull();
        assertThat(config).isInstanceOf(UsosIdentityProviderConfig.class);
    }

    @Test
    void parseConfig_shouldReturnEmptyMap() {
        // Given
        String configData = "some-config-data";

        // When
        Map<String, String> result = factory.parseConfig(session, configData);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void parseConfig_withNullConfigData_shouldReturnEmptyMap() {
        // When
        Map<String, String> result = factory.parseConfig(session, null);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void parseConfig_withEmptyConfigData_shouldReturnEmptyMap() {
        // When
        Map<String, String> result = factory.parseConfig(session, "");

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void init_shouldNotThrowException() {
        // When & Then - should not throw
        factory.init(config);
    }

    @Test
    void init_withNullConfig_shouldNotThrowException() {
        // When & Then - should not throw
        factory.init(null);
    }

    @Test
    void postInit_shouldNotThrowException() {
        // When & Then - should not throw
        factory.postInit(sessionFactory);
    }

    @Test
    void postInit_withNullSessionFactory_shouldNotThrowException() {
        // When & Then - should not throw
        factory.postInit(null);
    }

    @Test
    void close_shouldNotThrowException() {
        // When & Then - should not throw
        factory.close();
    }

    @Test
    void providerIdConstant_shouldBeUsos() {
        // Then
        assertThat(UsosIdentityProviderFactory.PROVIDER_ID).isEqualTo("usos");
    }

    @Test
    void factory_shouldImplementIdentityProviderFactory() {
        // Then
        assertThat(factory).isInstanceOf(org.keycloak.broker.provider.IdentityProviderFactory.class);
    }
}