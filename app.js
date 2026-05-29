function fmt(v) {
  if (isNaN(v)) v = 0;
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}
function get(id) {return parseFloat(document.getElementById(id).value) || 0;}

function calcular() {
  const precoRolo = get('precoRolo'), pesoRolo = get('pesoRolo') || 1;
  const pesoPeca = get('pesoPeca'), pesoAMS = get('pesoAMS');
  const custoFilamento = (pesoPeca + pesoAMS) * (precoRolo / pesoRolo);

  const tempoHoras = get('tempoImpressao'), consumoWatts = get('consumoWatts'), precoKwh = get('precoKwh');
  const custoEnergia = (consumoWatts / 1000) * tempoHoras * precoKwh;

  const valorImpressora = get('valorImpressora'), vidaUtil = get('vidaUtil') || 1;
  const custoDepreciacao = (valorImpressora / vidaUtil) * tempoHoras;

  const custoMaoDeObra = (get('tempoMaoDeObra') / 60) * get('valorHora');

  const custoBase = custoFilamento + custoEnergia + custoDepreciacao + custoMaoDeObra;
  const taxaFalha = get('taxaFalha');
  const subtotal = custoBase * (1 + taxaFalha / 100);

  const margemLucro = get('margemLucro');
  const divisor = 1 - (margemLucro / 100);
  const precoFinal = divisor > 0 ? subtotal / divisor : subtotal * (1 + margemLucro / 100);



document.getElementById('r-filamento').textContent  = fmt(custoFilamento);
document.getElementById('r-energia').textContent     = fmt(custoEnergia);
document.getElementById('r-depreciacao').textContent = fmt(custoDepreciacao);
document.getElementById('r-maodeobra').textContent   = fmt(custoMaoDeObra);
document.getElementById('r-custobase').textContent   = fmt(custoBase);
document.getElementById('r-subtotal').textContent    = fmt(subtotal);
document.getElementById('r-preco-final').textContent = fmt(precoFinal);

document.getElementById('r-lucro-info').textContent =
  `Lucro de ${margemLucro.toFixed(0)}% aplicado`;
}

function limparCampos(){

  const campos =
    document.querySelectorAll('input[type="number"]');

  campos.forEach(campo => {
    campo.value = '';
  });

  const descricao =
    document.getElementById('descricaoPeca');

  if(descricao){
    descricao.value = '';
  }

  document.getElementById('r-filamento').textContent  = 'R$ 0,00';
  document.getElementById('r-energia').textContent     = 'R$ 0,00';
  document.getElementById('r-depreciacao').textContent = 'R$ 0,00';
  document.getElementById('r-maodeobra').textContent   = 'R$ 0,00';
  document.getElementById('r-custobase').textContent   = 'R$ 0,00';
  document.getElementById('r-subtotal').textContent    = 'R$ 0,00';
  document.getElementById('r-preco-final').textContent = 'R$ 0,00';

  document.getElementById('r-lucro-info').textContent =
    'Lucro de 0% aplicado';
}

function salvarHistorico(precoFinal, custoBase, tempoMinutos){

  const lista =
    document.getElementById('historico-lista');

  if(!lista){
    return;
  }

  const descricaoInput =
    document.getElementById('descricaoPeca');

  const descricao =
    descricaoInput?.value || 'Peça sem descrição';

  const vazio =
    lista.querySelector('p');

  if(vazio){
    vazio.remove();
  }

  const item =
    document.createElement('div');

  item.className = 'historico-item';

  item.innerHTML = `
    <h3>${descricao}</h3>

    <div class="historico-grid">

      <div class="historico-box">
        <span>Tempo de impressão</span>
        <strong>${tempoMinutos.toFixed(0)} min</strong>
      </div>

      <div class="historico-box">
        <span>Custo base</span>
        <strong>${fmt(custoBase)}</strong>
      </div>

      <div class="historico-box">
        <span>Preço sugerido</span>
        <strong>${fmt(precoFinal)}</strong>
      </div>

    </div>
  `;

  lista.prepend(item);

  const itens =
    lista.querySelectorAll('.historico-item');

  if(itens.length > 5){
    itens[itens.length - 1].remove();
  }
}

function adicionarAoHistorico() {
  const precoFinalTexto = document.getElementById('r-preco-final').textContent;
  const custoBaseTexto = document.getElementById('r-custobase').textContent;
  const tempoMinutos = get('tempoImpressao');
  const tempoHoras = tempoMinutos / 60;

  const precoFinal = Number(
    precoFinalTexto.replace('R$', '').replace('.', '').replace(',', '.')
  );

  const custoBase = Number(
    custoBaseTexto.replace('R$', '').replace('.', '').replace(',', '.')
  );

  salvarHistorico(precoFinal, custoBase, tempoMinutos);
}

function abrirConfiguracoes(){

  const dados =
    localStorage.getItem('studio14_config');

  if(dados){

    const config =
      JSON.parse(dados);

    document.getElementById('cfgConsumoWatts').value =
      config.consumoWatts || '';

    document.getElementById('cfgPrecoKwh').value =
      config.precoKwh || '';

    document.getElementById('cfgValorImpressora').value =
      config.valorImpressora || '';

    document.getElementById('cfgVidaUtil').value =
      config.vidaUtil || '';

    document.getElementById('cfgValorHora').value =
      config.valorHora || '';

    document.getElementById('cfgTaxaFalha').value =
      config.taxaFalha || '';
  }

  document.getElementById('modalConfig').style.display =
    'flex';
}

function fecharConfiguracoes(){
  document.getElementById('modalConfig').style.display = 'none';
}

function salvarConfiguracoes(){

  const configuracoes = {

    consumoWatts:
      document.getElementById('cfgConsumoWatts').value,

    precoKwh:
      document.getElementById('cfgPrecoKwh').value,

    valorImpressora:
      document.getElementById('cfgValorImpressora').value,

    vidaUtil:
      document.getElementById('cfgVidaUtil').value,

    valorHora:
      document.getElementById('cfgValorHora').value,

    taxaFalha:
      document.getElementById('cfgTaxaFalha').value

  };

  localStorage.setItem(
    'studio14_config',
    JSON.stringify(configuracoes)
  );

  aplicarConfiguracoes();

  fecharConfiguracoes();
}

function toggleHistorico() {
  const content = document.getElementById('historico-content');
  const seta = document.getElementById('historico-seta');

  content.classList.toggle('open');

  seta.textContent = content.classList.contains('open') ? '▴' : '▾';
}

function aplicarConfiguracoes(){

  const dados =
    localStorage.getItem('studio14_config');

  if(!dados){
    abrirConfiguracoes();
    return;
  }

  const config =
    JSON.parse(dados);

  document.getElementById('consumoWatts').value =
    config.consumoWatts || '';

  document.getElementById('precoKwh').value =
    config.precoKwh || '';

  document.getElementById('valorImpressora').value =
    config.valorImpressora || '';

  document.getElementById('vidaUtil').value =
    config.vidaUtil || '';

  document.getElementById('valorHora').value =
    config.valorHora || '';

  document.getElementById('taxaFalha').value =
    config.taxaFalha || '';
}


window.onload = () => {
  aplicarConfiguracoes();
};