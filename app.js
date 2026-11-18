const API = 'https://script.google.com/macros/s/AKfycbxwXJmcqUF6yO8ZEnpWhiAS1hhg4JPBUS6tiyruofvDpnrLz1DTERft_IW06WZ_3Ru6/exec';

const TIMEOUT_MS = 30000;
const REVOGAR_URL_MS = 60000;
const ESTADOS_VALIDOS = ['autentico', 'cancelado', 'bloqueado', 'nao_encontrado'];
const SVG_NS = 'http://www.w3.org/2000/svg';

const TEXTOS = {
  pt: {
    tituloPagina: 'Validação de VTO',
    logoAria: 'Logotipo VTQ',
    marcaTitulo: 'Validação de VTO',
    marcaSubtitulo: 'Verificação de Transparência de Origem',
    situacaoAria: 'Situação do documento',
    carregando: 'Consultando o documento…',
    semCodigoTitulo: 'Leia o QR Code do documento',
    semCodigoAviso: 'Escaneie o QR Code presente no documento para verificar sua autenticidade.',
    erroConsultaTitulo: 'Não foi possível consultar agora',
    erroConsultaAviso: 'Verifique sua conexão com a internet e tente novamente.',
    btnTentarNovamente: 'Tentar novamente',
    abrirDiretamente: 'Abra esta página diretamente',
    autenticoTitulo: 'Documento autêntico',
    autenticoDetalhePrefixo: 'Período de análise: ',
    autenticoDetalheSufixo: '. Confira se o seu documento é idêntico ao PDF original abaixo.',
    canceladoTitulo: 'Cancelado',
    motivoPrefixo: 'Motivo: ',
    bloqueadoTitulo: 'Acesso limitado',
    bloqueadoAviso: 'Favor solicitar acesso à STA.',
    naoEncontradoTitulo: 'Documento não encontrado',
    naoEncontradoAviso: 'Não foi possível localizar um VTO com este código. Confira se o QR Code foi lido corretamente ou fale com a STA – Soluções Técnicas Ambientais.',
    dadosAria: 'Dados do VTO',
    dadosTitulo: 'Dados do documento',
    rotuloNumero: 'Número / Identificação',
    rotuloTipo: 'Tipo',
    rotuloEmpresas: 'Empresas',
    rotuloPeriodo: 'Período de análise',
    rotuloCodigo: 'Código de verificação',
    docsAria: 'Documentos para download',
    docsTitulo: 'Documentos do VTO',
    anexos: 'Anexos',
    rotuloPrincipal: 'VTO original (PDF selado)',
    btnBaixar: 'Baixar',
    notaAutenticidade: 'A autenticidade vale para o conteúdo do PDF original disponível nesta página. Cópias editadas não são válidas.',
    semDocumentos: 'Nenhum documento disponível para download.',
    apenasAutenticos: 'Os documentos deste VTO ficam disponíveis para download apenas para registros autênticos.',
    rodapeEmissor: 'Emitido por STA – Soluções Técnicas Ambientais',
    baixando: 'Baixando...',
    falha: 'Não foi possível baixar o arquivo.',
    muitasSolicitacoes: 'Muitas solicitações. Aguarde alguns minutos e tente novamente.'
  },
  en: {
    tituloPagina: 'VTO Validation',
    logoAria: 'VTQ Logo',
    marcaTitulo: 'VTO Validation',
    marcaSubtitulo: 'Origin Transparency Verification',
    situacaoAria: 'Document status',
    carregando: 'Checking the document…',
    semCodigoTitulo: "Scan the document's QR Code",
    semCodigoAviso: 'Scan the QR Code on the document to verify its authenticity.',
    erroConsultaTitulo: 'Could not check right now',
    erroConsultaAviso: 'Check your internet connection and try again.',
    btnTentarNovamente: 'Try again',
    abrirDiretamente: 'Open this page directly',
    autenticoTitulo: 'Authentic document',
    autenticoDetalhePrefixo: 'Analysis period: ',
    autenticoDetalheSufixo: '. Check that your document is identical to the original PDF below.',
    canceladoTitulo: 'Cancelled',
    motivoPrefixo: 'Reason: ',
    bloqueadoTitulo: 'Limited access',
    bloqueadoAviso: 'Please request access from STA.',
    naoEncontradoTitulo: 'Document not found',
    naoEncontradoAviso: 'Could not locate a VTO with this code. Check that the QR Code was scanned correctly or contact STA – Soluções Técnicas Ambientais.',
    dadosAria: 'VTO data',
    dadosTitulo: 'Document details',
    rotuloNumero: 'Number / Identification',
    rotuloTipo: 'Type',
    rotuloEmpresas: 'Companies',
    rotuloPeriodo: 'Analysis period',
    rotuloCodigo: 'Verification code',
    docsAria: 'Documents for download',
    docsTitulo: 'VTO documents',
    anexos: 'Attachments',
    rotuloPrincipal: 'Original VTO (sealed PDF)',
    btnBaixar: 'Download',
    notaAutenticidade: 'Authenticity applies to the content of the original PDF available on this page. Edited copies are not valid.',
    semDocumentos: 'No documents available for download.',
    apenasAutenticos: 'The documents for this VTO are available for download only for authentic records.',
    rodapeEmissor: 'Issued by STA – Soluções Técnicas Ambientais',
    baixando: 'Downloading...',
    falha: 'Could not download the file.',
    muitasSolicitacoes: 'Too many requests. Please wait a few minutes and try again.'
  }
};

function obterIdioma(valor) {
  return typeof valor === 'string' && valor.toLowerCase() === 'en' ? 'en' : 'pt';
}

function lerParametrosUrl(search) {
  const params = new URLSearchParams(search || '');
  const codigos = params.getAll('v');
  return {
    codigo: codigos.length === 1 ? codigos[0] : '',
    idioma: obterIdioma(params.get('l'))
  };
}

function validarCodigo(codigo) {
  return typeof codigo === 'string' && /^[A-Za-z0-9]{22}$/.test(codigo);
}

function montarUrlConsulta(codigo) {
  return API + '?f=json&v=' + encodeURIComponent(String(codigo || ''));
}

function montarUrlArquivo(codigo, indice) {
  return (
    API +
    '?f=arquivo&v=' +
    encodeURIComponent(String(codigo || '')) +
    '&i=' +
    encodeURIComponent(String(indice))
  );
}

function ehObjetoSimples(valor) {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function validarDados(dados, obrigatorio) {
  if (dados === undefined || dados === null) {
    return !obrigatorio;
  }
  if (!ehObjetoSimples(dados)) {
    return false;
  }
  const chaves = Object.keys(dados);
  for (let i = 0; i < chaves.length; i++) {
    const val = dados[chaves[i]];
    if (val !== undefined && val !== null && typeof val !== 'string') {
      return false;
    }
  }
  return true;
}

function validarItemArquivo(arq) {
  if (!ehObjetoSimples(arq)) {
    return false;
  }
  if (!Number.isSafeInteger(arq.indice) || arq.indice < 0 || Object.is(arq.indice, -0)) {
    return false;
  }
  if (typeof arq.nome !== 'string') {
    return false;
  }
  if (arq.tamanho !== undefined && arq.tamanho !== null) {
    if (typeof arq.tamanho !== 'number' || !Number.isFinite(arq.tamanho) || arq.tamanho < 0) {
      return false;
    }
  }
  if (arq.principal !== undefined && typeof arq.principal !== 'boolean') {
    return false;
  }
  return true;
}

function validarResposta(res) {
  if (!ehObjetoSimples(res) || typeof res.ok !== 'boolean') {
    return false;
  }
  if (!res.ok) {
    return typeof res.erro === 'string' && res.erro.length > 0;
  }
  if (!ESTADOS_VALIDOS.includes(res.estado)) {
    return false;
  }
  const dadosObrigatorio = res.estado === 'autentico' || res.estado === 'cancelado';
  if (!validarDados(res.dados, dadosObrigatorio)) {
    return false;
  }
  if (res.estado === 'autentico') {
    if (!Array.isArray(res.arquivos)) {
      return false;
    }
  } else if (res.arquivos !== undefined && res.arquivos !== null && !Array.isArray(res.arquivos)) {
    return false;
  }
  if (Array.isArray(res.arquivos)) {
    for (let i = 0; i < res.arquivos.length; i++) {
      if (!validarItemArquivo(res.arquivos[i])) {
        return false;
      }
    }
  }
  return true;
}

function formatarTamanho(bytes, idioma) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) {
    return '';
  }
  if (bytes < 1024) {
    return bytes + ' B';
  }
  const en = idioma === 'en';
  if (bytes < 1024 * 1024) {
    const kb = (bytes / 1024).toFixed(1);
    return (en ? kb : kb.replace('.', ',')) + ' KB';
  }
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return (en ? mb : mb.replace('.', ',')) + ' MB';
}

function formatarTipo(tipo, idioma) {
  if (!tipo) {
    return '-';
  }
  const en = idioma === 'en';
  const t = String(tipo).toLowerCase();
  if (t === 'geoespacial') {
    return en ? 'Geospatial' : 'Geoespacial';
  }
  if (t === 'campo') {
    return en ? 'On-site' : 'De campo';
  }
  return String(tipo);
}

function formatarPeriodo(dados, idioma) {
  if (!dados) {
    return '-';
  }
  if (idioma === 'en') {
    const iniEn = dados.inicioEn || dados.inicio;
    const fimEn = dados.fimEn || dados.fim;
    if (iniEn && fimEn) {
      return iniEn + ' to ' + fimEn;
    }
    return iniEn || fimEn || '-';
  }
  if (dados.inicio && dados.fim) {
    return dados.inicio + ' a ' + dados.fim;
  }
  return dados.inicio || dados.fim || '-';
}

function ordenarArquivos(arquivos) {
  if (!Array.isArray(arquivos)) {
    return [];
  }
  const principais = [];
  const anexos = [];
  for (let i = 0; i < arquivos.length; i++) {
    const arq = arquivos[i];
    if (arq && arq.principal) {
      principais.push(arq);
    } else if (arq) {
      anexos.push(arq);
    }
  }
  return principais.concat(anexos);
}

function sanearNomeArquivo(nome) {
  if (typeof nome !== 'string') {
    return 'documento.pdf';
  }
  let limpo = nome.replace(/[/\\:*?"<>|\x00-\x1f\x7f-\x9f‎‏‪-‮⁦-⁩]/g, '')
    .trim().replace(/[. ]+$/, '');
  if (!limpo) {
    return 'documento.pdf';
  }
  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(limpo.split('.')[0].trimEnd())) {
    limpo = '_' + limpo;
  }
  if (limpo.length <= 180) {
    return limpo;
  }
  const ponto = limpo.lastIndexOf('.');
  const extensao = ponto > 0 && limpo.length - ponto < 180 ? limpo.slice(ponto) : '';
  const base = limpo.slice(0, 180 - extensao.length).replace(/[\uD800-\uDBFF]$/, '').replace(/[. ]+$/, '');
  return (base || '_') + extensao;
}

function decodificarBase64(b64) {
  const limpo = String(b64 || '').replace(/\s+/g, '');
  const binario = atob(limpo);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

function estaEmIframe() {
  try {
    return window.top !== window.self;
  } catch (e) {
    return true;
  }
}

function criarElemento(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) {
    el.className = classe;
  }
  if (texto !== undefined && texto !== null) {
    el.textContent = texto;
  }
  return el;
}

function criarSvg(className, formas) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < formas.length; i++) {
    const forma = formas[i];
    const no = document.createElementNS(SVG_NS, forma.tag);
    const attrs = forma.attrs;
    const chaves = Object.keys(attrs);
    for (let j = 0; j < chaves.length; j++) {
      no.setAttribute(chaves[j], attrs[chaves[j]]);
    }
    svg.appendChild(no);
  }
  return svg;
}

function criarIconeFaixa(tipo) {
  if (tipo === 'autentico') {
    return criarSvg('faixa-icone', [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '10', stroke: 'currentColor', 'stroke-width': '2' } },
      { tag: 'path', attrs: { d: 'M8 12.5l2.7 2.7L16.5 9.5', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } }
    ]);
  }
  if (tipo === 'cancelado') {
    return criarSvg('faixa-icone', [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '10', stroke: 'currentColor', 'stroke-width': '2' } },
      { tag: 'path', attrs: { d: 'M5.5 5.5l13 13', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round' } }
    ]);
  }
  if (tipo === 'bloqueado') {
    return criarSvg('faixa-icone', [
      { tag: 'rect', attrs: { x: '5', y: '11', width: '14', height: '10', rx: '2', stroke: 'currentColor', 'stroke-width': '2' } },
      { tag: 'path', attrs: { d: 'M8 11V7a4 4 0 0 1 8 0v4', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' } },
      { tag: 'circle', attrs: { cx: '12', cy: '16', r: '1.2', fill: 'currentColor' } }
    ]);
  }
  if (tipo === 'sem_codigo') {
    return criarSvg('faixa-icone', [
      { tag: 'rect', attrs: { x: '4', y: '4', width: '6', height: '6', rx: '1', stroke: 'currentColor', 'stroke-width': '2' } },
      { tag: 'rect', attrs: { x: '14', y: '4', width: '6', height: '6', rx: '1', stroke: 'currentColor', 'stroke-width': '2' } },
      { tag: 'rect', attrs: { x: '4', y: '14', width: '6', height: '6', rx: '1', stroke: 'currentColor', 'stroke-width': '2' } },
      { tag: 'path', attrs: { d: 'M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z', fill: 'currentColor' } }
    ]);
  }
  if (tipo === 'erro') {
    return criarSvg('faixa-icone', [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '10', stroke: 'currentColor', 'stroke-width': '2' } },
      { tag: 'path', attrs: { d: 'M12 7.5v5.5', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round' } },
      { tag: 'circle', attrs: { cx: '12', cy: '16.5', r: '1.2', fill: 'currentColor' } }
    ]);
  }
  return criarSvg('faixa-icone', [
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '10', stroke: 'currentColor', 'stroke-width': '2' } },
    { tag: 'path', attrs: { d: 'M9.5 9.2a2.6 2.6 0 0 1 5 .8c0 1.8-2.5 2.2-2.5 3.8', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' } },
    { tag: 'circle', attrs: { cx: '12', cy: '17.2', r: '1.2', fill: 'currentColor' } }
  ]);
}

function criarIconeArquivo() {
  return criarSvg('arquivo-icone', [
    { tag: 'path', attrs: { d: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linejoin': 'round' } },
    { tag: 'path', attrs: { d: 'M14 3v5h5', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linejoin': 'round' } }
  ]);
}

function criarFaixa(classeVariante, tipoIcone, titulo, detalhe, txt) {
  const secao = criarElemento('section', 'faixa ' + classeVariante);
  secao.setAttribute('aria-label', txt.situacaoAria);
  secao.appendChild(criarIconeFaixa(tipoIcone));

  const corpo = criarElemento('div', 'faixa-corpo');
  corpo.appendChild(criarElemento('h1', 'faixa-titulo', titulo));
  if (detalhe) {
    corpo.appendChild(criarElemento('p', 'faixa-detalhe', detalhe));
  }
  secao.appendChild(corpo);
  return secao;
}

function criarItemDado(rotulo, valor, largo, codigo) {
  const item = criarElemento('div', largo ? 'dado-item dado-item--largo' : 'dado-item');
  item.appendChild(criarElemento('dt', 'dado-rotulo', rotulo));
  const dd = criarElemento('dd', 'dado-valor');
  if (codigo) {
    dd.appendChild(criarElemento('span', 'codigo-valor', valor));
  } else {
    dd.textContent = valor;
  }
  item.appendChild(dd);
  return item;
}

function criarSecaoDados(dados, codigo, idioma, txt) {
  const secao = criarElemento('section', 'secao');
  secao.setAttribute('aria-label', txt.dadosAria);
  secao.appendChild(criarElemento('h2', 'secao-titulo', txt.dadosTitulo));

  const dl = criarElemento('dl', 'dados-lista');
  dl.appendChild(criarItemDado(txt.rotuloNumero, dados.numero || '-', false, false));
  dl.appendChild(criarItemDado(txt.rotuloTipo, formatarTipo(dados.tipo, idioma), false, false));
  dl.appendChild(criarItemDado(txt.rotuloEmpresas, dados.empresas || '-', true, false));
  dl.appendChild(criarItemDado(txt.rotuloPeriodo, formatarPeriodo(dados, idioma), true, false));
  if (codigo) {
    dl.appendChild(criarItemDado(txt.rotuloCodigo, codigo, true, true));
  }
  secao.appendChild(dl);
  return secao;
}

async function fetchJsonComTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timerId = setTimeout(function () {
    controller.abort();
  }, timeoutMs);

  try {
    const resp = await fetch(url, {
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      redirect: 'follow',
      signal: controller.signal
    });
    if (!resp.ok) {
      throw new Error('HTTP ' + resp.status);
    }
    return await resp.json();
  } finally {
    clearTimeout(timerId);
  }
}

function iniciarDownload(res) {
  const bytes = decodificarBase64(res.base64);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanearNomeArquivo(res.nome);
  link.className = 'oculto';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, REVOGAR_URL_MS);
}

async function baixarArquivo(codigo, indice, botao, erroEl, txt) {
  erroEl.textContent = '';
  botao.disabled = true;
  botao.textContent = txt.baixando;

  let res;
  try {
    res = await fetchJsonComTimeout(montarUrlArquivo(codigo, indice), TIMEOUT_MS);
  } catch (e) {
    botao.disabled = false;
    botao.textContent = txt.btnBaixar;
    erroEl.textContent = txt.falha;
    return;
  }

  botao.disabled = false;
  botao.textContent = txt.btnBaixar;

  if (!ehObjetoSimples(res) || res.erro) {
    erroEl.textContent = res?.erro === 'muitas_solicitacoes' ? txt.muitasSolicitacoes : txt.falha;
    return;
  }

  if (typeof res.base64 !== 'string' || !res.base64) {
    erroEl.textContent = txt.falha;
    return;
  }

  try {
    iniciarDownload(res);
  } catch (e) {
    erroEl.textContent = txt.falha;
  }
}

function criarListaArquivos(lista, codigo, idioma, txt) {
  const ul = criarElemento('ul', 'arquivos-lista');
  for (let i = 0; i < lista.length; i++) {
    const arq = lista[i];
    const li = criarElemento('li', arq.principal ? 'arquivo-item arquivo-item--principal' : 'arquivo-item');

    const info = criarElemento('div', 'arquivo-info');
    info.appendChild(criarIconeArquivo());

    const texto = criarElemento('div', 'arquivo-texto');
    if (arq.principal) {
      texto.appendChild(criarElemento('span', 'arquivo-rotulo', txt.rotuloPrincipal));
    }
    texto.appendChild(criarElemento('span', 'arquivo-nome', arq.nome));
    const tamTexto = formatarTamanho(arq.tamanho, idioma);
    if (tamTexto) {
      texto.appendChild(criarElemento('span', 'arquivo-tamanho', tamTexto));
    }
    info.appendChild(texto);
    li.appendChild(info);

    const acao = criarElemento('div', 'arquivo-acao');
    const botao = criarElemento('button', 'btn-baixar', txt.btnBaixar);
    botao.type = 'button';

    const erroEl = criarElemento('span', 'erro-download');
    erroEl.setAttribute('role', 'status');
    erroEl.setAttribute('aria-live', 'polite');

    botao.addEventListener('click', function () {
      baixarArquivo(codigo, arq.indice, botao, erroEl, txt);
    });

    acao.appendChild(botao);
    acao.appendChild(erroEl);
    li.appendChild(acao);
    ul.appendChild(li);
  }
  return ul;
}

function criarSecaoDocumentos(arquivos, codigo, idioma, txt) {
  const secao = criarElemento('section', 'secao');
  secao.setAttribute('aria-label', txt.docsAria);
  secao.appendChild(criarElemento('h2', 'secao-titulo', txt.docsTitulo));

  const ordenados = ordenarArquivos(arquivos);
  if (ordenados.length === 0) {
    secao.appendChild(criarElemento('p', 'aviso-bloqueio', txt.semDocumentos));
    return secao;
  }

  const principais = ordenados.filter(function (a) {
    return Boolean(a.principal);
  });
  const anexos = ordenados.filter(function (a) {
    return !a.principal;
  });

  if (principais.length > 0) {
    secao.appendChild(criarListaArquivos(principais, codigo, idioma, txt));
  }
  if (anexos.length > 0) {
    secao.appendChild(criarElemento('h3', 'arquivos-subtitulo', txt.anexos));
    secao.appendChild(criarListaArquivos(anexos, codigo, idioma, txt));
  }

  secao.appendChild(criarElemento('p', 'arquivos-nota', txt.notaAutenticidade));
  return secao;
}

function aplicarTextosFixos(idioma, txt) {
  document.documentElement.lang = idioma === 'en' ? 'en' : 'pt-BR';
  document.title = txt.tituloPagina;

  const logo = document.getElementById('logo-vt');
  if (logo) {
    logo.setAttribute('aria-label', txt.logoAria);
  }
  const marcaTitulo = document.getElementById('marca-titulo');
  if (marcaTitulo) {
    marcaTitulo.textContent = txt.marcaTitulo;
  }
  const marcaSubtitulo = document.getElementById('marca-subtitulo');
  if (marcaSubtitulo) {
    marcaSubtitulo.textContent = txt.marcaSubtitulo;
  }
  const rodape = document.getElementById('rodape-emissor');
  if (rodape) {
    rodape.textContent = txt.rodapeEmissor;
  }
}

function renderizarCarregando(area, txt) {
  const secao = criarElemento('section', 'secao');
  const box = criarElemento('div', 'carregando-box');
  const spinner = criarElemento('span', 'carregando-spinner');
  spinner.setAttribute('aria-hidden', 'true');
  box.appendChild(spinner);
  box.appendChild(criarElemento('p', 'carregando-texto', txt.carregando));
  secao.appendChild(box);
  area.replaceChildren(secao);
}

function renderizarSemCodigo(area, txt) {
  const faixa = criarFaixa('faixa--nao-encontrado', 'sem_codigo', txt.semCodigoTitulo, '', txt);
  const secao = criarElemento('section', 'secao');
  secao.appendChild(criarElemento('p', 'aviso-nao-encontrado', txt.semCodigoAviso));
  area.replaceChildren(faixa, secao);
}

function renderizarErroConsulta(area, txt, aoTentarNovamente) {
  const faixa = criarFaixa('faixa--nao-encontrado', 'erro', txt.erroConsultaTitulo, '', txt);
  const secao = criarElemento('section', 'secao');
  secao.appendChild(criarElemento('p', 'aviso-nao-encontrado', txt.erroConsultaAviso));
  const acoes = criarElemento('div', 'erro-acoes');
  const botao = criarElemento('button', 'btn-tentar', txt.btnTentarNovamente);
  botao.type = 'button';
  botao.addEventListener('click', aoTentarNovamente);
  acoes.appendChild(botao);
  secao.appendChild(acoes);
  area.replaceChildren(faixa, secao);
}

function renderizarResultado(area, res, codigo, idioma, txt) {
  const fragmentos = [];
  const estado = res.estado;
  const dados = res.dados || null;

  if (estado === 'autentico') {
    const detalhe = txt.autenticoDetalhePrefixo + formatarPeriodo(dados, idioma) + txt.autenticoDetalheSufixo;
    fragmentos.push(criarFaixa('faixa--autentico', 'autentico', txt.autenticoTitulo, detalhe, txt));
  } else if (estado === 'cancelado') {
    const motivo = dados && dados.motivo ? txt.motivoPrefixo + dados.motivo : '';
    fragmentos.push(criarFaixa('faixa--cancelado', 'cancelado', txt.canceladoTitulo, motivo, txt));
  } else if (estado === 'bloqueado') {
    fragmentos.push(criarFaixa('faixa--bloqueado', 'bloqueado', txt.bloqueadoTitulo, '', txt));
    const secaoBloqueio = criarElemento('section', 'secao');
    secaoBloqueio.appendChild(criarElemento('p', 'aviso-bloqueio', txt.bloqueadoAviso));
    fragmentos.push(secaoBloqueio);
  } else {
    fragmentos.push(criarFaixa('faixa--nao-encontrado', 'nao_encontrado', txt.naoEncontradoTitulo, '', txt));
    const secaoNaoEncontrado = criarElemento('section', 'secao');
    secaoNaoEncontrado.appendChild(criarElemento('p', 'aviso-nao-encontrado', txt.naoEncontradoAviso));
    fragmentos.push(secaoNaoEncontrado);
  }

  if (estado !== 'nao_encontrado' && estado !== 'bloqueado' && dados) {
    fragmentos.push(criarSecaoDados(dados, codigo, idioma, txt));
    if (estado === 'autentico') {
      fragmentos.push(criarSecaoDocumentos(res.arquivos, codigo, idioma, txt));
    } else {
      const secaoAviso = criarElemento('section', 'secao');
      secaoAviso.appendChild(criarElemento('p', 'aviso-bloqueio', txt.apenasAutenticos));
      fragmentos.push(secaoAviso);
    }
  }

  area.replaceChildren.apply(area, fragmentos);
}

async function consultarDocumento(area, codigo, idioma, txt) {
  renderizarCarregando(area, txt);
  try {
    const res = await fetchJsonComTimeout(montarUrlConsulta(codigo), TIMEOUT_MS);
    if (!validarResposta(res) || !res.ok) {
      renderizarErroConsulta(area, txt, function () {
        consultarDocumento(area, codigo, idioma, txt);
      });
      return;
    }
    renderizarResultado(area, res, codigo, idioma, txt);
  } catch (e) {
    renderizarErroConsulta(area, txt, function () {
      consultarDocumento(area, codigo, idioma, txt);
    });
  }
}

function inicializar() {
  const search = window.location.search;
  const { codigo, idioma } = lerParametrosUrl(search);
  const txt = TEXTOS[idioma];

  if (estaEmIframe()) {
    document.documentElement.lang = idioma === 'en' ? 'en' : 'pt-BR';
    document.title = txt.tituloPagina;
    const aviso = criarElemento('p', 'aviso-direto', txt.abrirDiretamente);
    document.body.replaceChildren(aviso);
    return;
  }

  document.getElementById('pagina')?.classList.remove('oculto');
  aplicarTextosFixos(idioma, txt);

  const area = document.getElementById('area-estado');
  if (!area) {
    return;
  }

  if (!codigo && new URLSearchParams(search).getAll('v').length < 2) {
    renderizarSemCodigo(area, txt);
    return;
  }

  if (!validarCodigo(codigo)) {
    renderizarResultado(area, { ok: true, estado: 'nao_encontrado' }, codigo, idioma, txt);
    return;
  }

  consultarDocumento(area, codigo, idioma, txt);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    API,
    TEXTOS,
    obterIdioma,
    lerParametrosUrl,
    validarCodigo,
    montarUrlConsulta,
    montarUrlArquivo,
    validarResposta,
    formatarTamanho,
    formatarTipo,
    formatarPeriodo,
    ordenarArquivos,
    sanearNomeArquivo,
    decodificarBase64
  };
}
