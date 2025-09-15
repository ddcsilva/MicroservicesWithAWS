/**
 * HotelBooking - Sistema de Reservas
 * Configuração e gerenciamento do AWS Cognito
 * Autor: Danilo Silva
 */

/**
 * Configuração do AWS Cognito
 * Sistema de autenticação para HotelBooking
 */
const cognitoConfig = {
  cognito: {
    identityPoolId: 'sa-east-1_VTvzh0kMi',
    cognitoDomain: 'sa-east-1vtvzh0kmi.auth.sa-east-1.amazoncognito.com',
    appId: '4vl0ig1qmu834scjpt0ctjp41m',
  },

  // Configurações da aplicação
  aplicacao: {
    tokenScopes: ['email', 'openid', 'profile'],
    redirectUriSignIn: 'http://localhost:8080/hotel/',
    redirectUriSignOut: 'http://localhost:8080/hotel/',
    advancedSecurity: false,
    storage: null,
  },
};

/**
 * Aplicação Cognito para gerenciamento de autenticação
 */
const cognitoApp = {
  autenticacao: {},

  /**
   * Inicializa o sistema de autenticação AWS Cognito
   */
  inicializar: function () {
    try {
      const dadosAutenticacao = {
        ClientId: cognitoConfig.cognito.appId,
        AppWebDomain: cognitoConfig.cognito.cognitoDomain,
        TokenScopesArray: cognitoConfig.aplicacao.tokenScopes,
        RedirectUriSignIn: cognitoConfig.aplicacao.redirectUriSignIn,
        RedirectUriSignOut: cognitoConfig.aplicacao.redirectUriSignOut,
        UserPoolId: cognitoConfig.cognito.identityPoolId,
        AdvancedSecurityDataCollectionFlag: cognitoConfig.aplicacao.advancedSecurity,
        Storage: cognitoConfig.aplicacao.storage,
      };

      cognitoApp.autenticacao = new AmazonCognitoIdentity.CognitoAuth(dadosAutenticacao);
      cognitoApp.autenticacao.userhandler = {
        onSuccess: function (resultado) {
          console.log('Autenticação bem-sucedida:', resultado);
        },
        onFailure: function (erro) {
          console.error('Falha na autenticação:', erro);
        },
      };
    } catch (erro) {
      console.error('Erro ao inicializar Cognito:', erro.message);
      throw erro;
    }
  },

  /**
   * Processa resposta do Cognito na URL
   */
  processarResposta: function () {
    cognitoApp.autenticacao.parseCognitoWebResponse(window.location.href);
  },

  /**
   * Obtém usuário atual
   */
  obterUsuarioAtual: function () {
    return cognitoApp.autenticacao.getCurrentUser();
  },

  /**
   * Faz login
   */
  fazerLogin: function () {
    cognitoApp.autenticacao.getSession();
  },

  /**
   * Faz logout
   */
  fazerLogout: function () {
    cognitoApp.autenticacao.signOut();
  },
};
