/**
 * HotelBooking - Sistema de Reservas
 * Lógica principal da aplicação
 * Autor: Danilo Silva
 */

/**
 * Namespace principal da aplicação
 */
const SistemaHotelBooking = {
  // Configurações da aplicação
  configuracoes: {
    duracaoAnimacao: 2000,
    duracaoToast: 3000,
    delayRedirecionamento: 1500,
  },

  // Estado da aplicação
  estado: {
    estatisticasAnimadas: false,
    usuarioAtual: null,
  },

  // Seletores DOM
  seletores: {
    botaoEntrar: '#btnEntrar',
    botaoSair: '#btnSair',
    secaoEstatisticas: '.secao-estatisticas',
    numerosEstatisticas: '.item-estatistica__numero',
    linksHero: 'a[href^="#"]',
    botoesAutenticacao: '#btnEntrar, #btnSair',
  },

  /**
   * Inicializa a aplicação
   */
  inicializar() {
    this.configurarEventListeners();
    this.inicializarAutenticacao();
    this.configurarScrollSuave();
    this.configurarAnimacoesScroll();
  },

  /**
   * Configura todos os event listeners
   */
  configurarEventListeners() {
    // Event listeners para botões de autenticação
    $(this.seletores.botaoEntrar).on('click', this.tratarCliqueBotaoEntrar.bind(this));
    $(this.seletores.botaoSair).on('click', this.tratarCliqueBotaoSair.bind(this));

    // Event listener para scroll
    $(window).on('scroll', this.tratarScroll.bind(this));

    // Event listeners para botões de autenticação (loading state)
    $(this.seletores.botoesAutenticacao).on('click', this.mostrarCarregamentoBotao.bind(this));
  },

  /**
   * Inicializa sistema de autenticação
   */
  inicializarAutenticacao() {
    try {
      // Verifica se cognitoApp e suas dependências estão disponíveis
      if (typeof cognitoApp !== 'undefined' && typeof AmazonCognitoIdentity !== 'undefined') {
        cognitoApp.inicializar();

        // Processa resposta do Cognito na URL (do curso)
        cognitoApp.processarResposta();

        // Verifica usuário atual
        const usuarioAtual = cognitoApp.obterUsuarioAtual();
        console.log('Usuário atual:', usuarioAtual);
      } else {
        console.warn('⚠️ Dependências do AWS Cognito não encontradas');
      }

      this.atualizarBotoesAutenticacao();
      this.tratarNavegacaoUsuario();
    } catch (erro) {
      console.error('Erro ao inicializar sistema de autenticação:', erro.message);
      // Fallback: continua sem autenticação
      this.atualizarBotoesAutenticacao();
    }
  },

  /**
   * Atualiza visibilidade dos botões de autenticação
   */
  atualizarBotoesAutenticacao() {
    const botaoEntrar = $(this.seletores.botaoEntrar);
    const botaoSair = $(this.seletores.botaoSair);

    try {
      const usuarioLogado = this.verificarUsuarioAutenticado();

      if (usuarioLogado) {
        botaoEntrar.hide();
        botaoSair.show();
      } else {
        botaoEntrar.show();
        botaoSair.hide();
      }
    } catch (erro) {
      console.warn('Erro ao atualizar botões de autenticação:', erro.message);
      // Fallback: mostrar apenas botão de login
      botaoEntrar.show();
      botaoSair.hide();
    }
  },

  /**
   * Verifica se usuário está autenticado
   * @returns {boolean}
   */
  verificarUsuarioAutenticado() {
    return (
      typeof tokenUsuarioAtual !== 'undefined' &&
      tokenUsuarioAtual &&
      tokenUsuarioAtual.currentUserId !== ''
    );
  },

  /**
   * Obtém papel do usuário atual
   * @returns {string}
   */
  obterPerfilUsuarioAtual() {
    if (!this.verificarUsuarioAutenticado()) return '';
    return tokenUsuarioAtual.role || '';
  },

  /**
   * Manipula navegação baseada no papel do usuário
   */
  tratarNavegacaoUsuario() {
    if (!this.verificarUsuarioAutenticado()) return;

    const perfilUsuario = this.obterPerfilUsuarioAtual();

    const mapaNavegacao = {
      Admin: {
        url: 'admin.html',
        mensagem: 'Bem-vindo, Administrador! Redirecionando...',
      },
      HotelManager: {
        url: 'review-bookings.html',
        mensagem: 'Bem-vindo, Gerente! Redirecionando...',
      },
      default: {
        url: 'search.html',
        mensagem: 'Bem-vindo! Redirecionando para busca...',
      },
    };

    const navegacao = mapaNavegacao[perfilUsuario] || mapaNavegacao.default;

    this.exibirMensagemBoasVindas(navegacao.mensagem);
    this.redirecionarParaPagina(navegacao.url);
  },

  /**
   * Redireciona para página específica
   * @param {string} url - URL de destino
   */
  redirecionarParaPagina(url) {
    setTimeout(() => {
      window.location.href = url;
    }, this.configuracoes.delayRedirecionamento);
  },

  /**
   * Exibe mensagem de boas-vindas
   * @param {string} mensagem - Mensagem a ser exibida
   */
  exibirMensagemBoasVindas(mensagem) {
    const htmlToast = this.criarHtmlToast(mensagem);
    const $toast = $(htmlToast);

    $('body').append($toast);

    // Remove automaticamente após duração configurada
    setTimeout(() => {
      $toast.fadeOut(500, function () {
        $(this).remove();
      });
    }, this.configuracoes.duracaoToast);
  },

  /**
   * Cria HTML do toast de notificação
   * @param {string} mensagem - Mensagem do toast
   * @returns {string} HTML do toast
   */
  criarHtmlToast(mensagem) {
    return `
      <div class="notificacao-toast">
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <i class="fas fa-check-circle me-2" aria-hidden="true"></i>
            <strong class="me-auto">HotelBooking</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Fechar"></button>
          </div>
          <div class="toast-body">
            ${this.escaparHtml(mensagem)}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Escapa HTML para prevenir ataques XSS
   * @param {string} texto - Texto a ser escapado
   * @returns {string} Texto escapado
   */
  escaparHtml(texto) {
    const mapa = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return texto.replace(/[&<>"']/g, m => mapa[m]);
  },

  /**
   * Configura scroll suave para links âncora
   */
  configurarScrollSuave() {
    $(this.seletores.linksHero).on('click', evento => {
      const idDestino = evento.currentTarget.getAttribute('href');
      const $destino = $(idDestino);

      if ($destino.length) {
        evento.preventDefault();
        this.executarScrollSuave($destino);
      }
    });
  },

  /**
   * Executa scroll suave para elemento
   * @param {jQuery} $destino - Elemento de destino
   */
  executarScrollSuave($destino) {
    $('html, body')
      .stop()
      .animate(
        {
          scrollTop: $destino.offset().top - 20,
        },
        1000
      );
  },

  /**
   * Configura animações baseadas em scroll
   */
  configurarAnimacoesScroll() {
    $(window).on('scroll', this.tratarScroll.bind(this));
  },

  /**
   * Manipula evento de scroll
   */
  tratarScroll() {
    this.verificarAnimacaoEstatisticas();
  },

  /**
   * Verifica se deve animar estatísticas
   */
  verificarAnimacaoEstatisticas() {
    if (this.estado.estatisticasAnimadas) return;

    const $secaoEstatisticas = $(this.seletores.secaoEstatisticas);
    if (!$secaoEstatisticas.length) return;

    const scrollTop = $(window).scrollTop();
    const alturaJanela = $(window).height();
    const topoEstatisticas = $secaoEstatisticas.offset().top;

    if (scrollTop + alturaJanela > topoEstatisticas + 100) {
      this.estado.estatisticasAnimadas = true;
      this.animarEstatisticas();
    }
  },

  /**
   * Anima números das estatísticas
   */
  animarEstatisticas() {
    $(this.seletores.numerosEstatisticas).each((indice, elemento) => {
      const $elemento = $(elemento);
      const textoAlvo = $elemento.text();
      const numeroAlvo = parseInt(textoAlvo.replace(/[^0-9]/g, ''));
      const sufixo = textoAlvo.replace(/[0-9]/g, '');

      if (numeroAlvo) {
        this.animarNumero($elemento, numeroAlvo, sufixo);
      }
    });
  },

  /**
   * Anima um número específico
   * @param {jQuery} $elemento - Elemento a ser animado
   * @param {number} numeroAlvo - Número alvo
   * @param {string} sufixo - Sufixo do número
   */
  animarNumero($elemento, numeroAlvo, sufixo) {
    $elemento.text('0' + sufixo);

    $({ contador: 0 }).animate(
      { contador: numeroAlvo },
      {
        duration: this.configuracoes.duracaoAnimacao,
        step: function () {
          $elemento.text(Math.floor(this.contador) + sufixo);
        },
        complete: function () {
          $elemento.text(numeroAlvo + sufixo);
        },
      }
    );
  },

  /**
   * Mostra estado de carregamento no botão
   * @param {Event} evento - Evento do clique
   */
  mostrarCarregamentoBotao(evento) {
    const $botao = $(evento.currentTarget);
    const htmlOriginal = $botao.html();

    $botao
      .prop('disabled', true)
      .html('<i class="fas fa-spinner animacao-girar me-2" aria-hidden="true"></i>Processando...');

    // Reset do botão após timeout (fallback)
    setTimeout(() => {
      $botao.prop('disabled', false).html(htmlOriginal);
    }, this.configuracoes.duracaoToast);
  },

  /**
   * Manipula clique no botão de entrar
   * @param {Event} evento - Evento do clique
   */
  tratarCliqueBotaoEntrar(evento) {
    evento.preventDefault();

    // Usa função do curso para fazer login
    if (typeof cognitoApp !== 'undefined') {
      cognitoApp.fazerLogin();
    }
  },

  /**
   * Manipula clique no botão de sair
   * @param {Event} evento - Evento do clique
   */
  tratarCliqueBotaoSair(evento) {
    evento.preventDefault();

    // Usa função do curso para fazer logout
    if (typeof cognitoApp !== 'undefined') {
      cognitoApp.fazerLogout();
    }
  },
};

/**
 * Inicialização da aplicação quando DOM estiver pronto
 */
$(document).ready(() => {
  SistemaHotelBooking.inicializar();
});
