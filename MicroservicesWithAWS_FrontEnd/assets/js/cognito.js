/**
 * HotelBooking - Sistema de Reservas
 * Configuração e gerenciamento do AWS Cognito
 * Autor: Danilo Silva
 */

/**
 * Função para decodificar JWT
 */
function decodificarJWT(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// Token do usuário atual
let tokenUsuarioAtual = null;

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

  /**
   * Processa página após carregamento (do curso)
   */
  processarPaginaCarregada: function () {
    cognitoApp.autenticacao.parseCognitoWebResponse(window.location.href);
    const usuarioAtual = cognitoApp.autenticacao.getCurrentUser();

    if (usuarioAtual) {
      cognitoApp.autenticacao.getSession();
      const sessaoAtual = cognitoApp.autenticacao.signInUserSession;

      if (sessaoAtual) {
        const detalhesToken = decodificarJWT(sessaoAtual.idToken.jwtToken);
        const grupos = detalhesToken['cognito:groups'] ? detalhesToken['cognito:groups'][0] : '';

        // Cria objeto de token
        tokenUsuarioAtual = {
          currentUserId: detalhesToken.sub || '',
          role: grupos || '',
        };

        console.log('Token do usuário:', tokenUsuarioAtual);
      }
    }
  },
};
