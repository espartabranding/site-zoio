// Vistas do perfil (Clubes, Marcas, Internacional), cada uma com link próprio: #clubes, #marcas, #internacional.
// Sem JS, as três vistas aparecem uma abaixo da outra.
(function () {
  const abas = Array.from(document.querySelectorAll('.ptabs a'));
  const vistas = Array.from(document.querySelectorAll('.vista'));

  function mostrar(id) {
    if (!vistas.some(v => v.id === id)) id = vistas[0].id;
    vistas.forEach(v => v.classList.toggle('ativa', v.id === id));
    abas.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + id)));
  }

  abas.forEach(aba => aba.addEventListener('click', e => {
    e.preventDefault();
    history.replaceState(null, '', aba.hash);
    mostrar(aba.hash.slice(1));
  }));
  const eVista = id => vistas.some(v => v.id === id);

  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    mostrar(id);
    // Âncora de uma seção (por exemplo, #carreira): volta à primeira vista e rola até ela.
    const alvo = !eVista(id) && document.getElementById(id);
    if (alvo) alvo.scrollIntoView();
  });
  mostrar(location.hash.slice(1));
  // O link de uma vista abre o perfil pelo topo, com o nome e a foto, e não rolado até a tabela.
  if (eVista(location.hash.slice(1))) window.addEventListener('load', () => window.scrollTo(0, 0));

  // Movimento: seções que entram ao rolar, contadores e paralaxe do palco. Com "reduzir movimento"
  // ligado no sistema, nada disso roda e o conteúdo aparece direto.
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revelaveis = Array.from(document.querySelectorAll('[data-revela]'));

  function contar(el) {
    const alvo = Number(el.dataset.conta);
    if (calmo || !Number.isFinite(alvo)) return;
    const inicio = performance.now();
    const passo = agora => {
      const t = Math.min(1, (agora - inicio) / 1100);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  function revelar(el) {
    if (el.classList.contains('visivel')) return;
    el.classList.add('visivel');
    el.querySelectorAll('[data-conta]').forEach(contar);
  }

  if (calmo || !('IntersectionObserver' in window)) {
    revelaveis.forEach(revelar);
  } else {
    const observador = new IntersectionObserver(entradas => entradas.forEach(e => {
      if (e.isIntersecting) { revelar(e.target); observador.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    revelaveis.forEach(el => observador.observe(el));
  }

  // Fotos de fundo das seções de dados: deslizam mais devagar que a página.
  const fundos = Array.from(document.querySelectorAll('[data-paralaxe]'));
  if (fundos.length && !calmo) {
    let pendente = false;
    const deslizar = () => {
      pendente = false;
      const meio = window.innerHeight / 2;
      fundos.forEach(img => {
        const caixa = img.parentElement.getBoundingClientRect();
        if (caixa.bottom < -200 || caixa.top > window.innerHeight + 200) return;
        const desvio = (caixa.top + caixa.height / 2 - meio) / window.innerHeight;
        img.style.transform = 'translate3d(0,' + (desvio * -70).toFixed(1) + 'px,0) scale(1.04)';
      });
    };
    window.addEventListener('scroll', () => { if (!pendente) { pendente = true; requestAnimationFrame(deslizar); } }, { passive: true });
    deslizar();
  }

  // Barra de progresso, palavras gigantes e texturas de fundo que se movem conforme a rolagem.
  const barra = document.querySelector('.progresso');
  const palavras = Array.from(document.querySelectorAll('[data-desliza]'));
  const texturas = Array.from(document.querySelectorAll('[data-textura]'));
  if ((barra || palavras.length || texturas.length) && !calmo) {
    let agendado = false;
    const rolar = () => {
      agendado = false;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (barra) barra.style.setProperty('--lido', total > 0 ? (window.scrollY / total).toFixed(4) : '0');
      palavras.forEach(palavra => {
        const caixa = palavra.parentElement.getBoundingClientRect();
        if (caixa.bottom < 0 || caixa.top > window.innerHeight) return;
        const avanco = 1 - (caixa.top + caixa.height) / (window.innerHeight + caixa.height);
        palavra.style.setProperty('--dx', (8 - avanco * 34).toFixed(2) + '%');
      });
      texturas.forEach(secao => {
        const caixa = secao.getBoundingClientRect();
        if (caixa.bottom < 0 || caixa.top > window.innerHeight) return;
        secao.style.setProperty('--ty', (((caixa.top + caixa.height / 2) / window.innerHeight - .5) * -60).toFixed(1) + 'px');
      });
    };
    window.addEventListener('scroll', () => { if (!agendado) { agendado = true; requestAnimationFrame(rolar); } }, { passive: true });
    rolar();
  }

  // Cartões que inclinam na direção do mouse.
  if (!calmo && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-inclina]').forEach(cartao => {
      cartao.addEventListener('pointermove', e => {
        const caixa = cartao.getBoundingClientRect();
        cartao.style.setProperty('--ry', (((e.clientX - caixa.left) / caixa.width - .5) * 12).toFixed(2) + 'deg');
        cartao.style.setProperty('--rx', ((.5 - (e.clientY - caixa.top) / caixa.height) * 10).toFixed(2) + 'deg');
      });
      cartao.addEventListener('pointerleave', () => { cartao.style.setProperty('--rx', '0deg'); cartao.style.setProperty('--ry', '0deg'); });
    });
  }

  const palco = document.querySelector('.palco');
  if (palco && !calmo) {
    let quadro = 0;
    const mover = (px, py) => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        if (px !== null) { palco.style.setProperty('--px', px.toFixed(3)); palco.style.setProperty('--py', py.toFixed(3)); }
        palco.style.setProperty('--sy', Math.min(window.scrollY, 900).toFixed(0));
      });
    };
    palco.parentElement.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const caixa = palco.getBoundingClientRect();
      mover((e.clientX - caixa.left) / caixa.width * 2 - 1, (e.clientY - caixa.top) / caixa.height * 2 - 1);
    });
    window.addEventListener('scroll', () => mover(null, null), { passive: true });
  }

  // A idade sai da data de nascimento, para não ficar errada entre uma geração do site e outra.
  document.querySelectorAll('[data-nascimento]').forEach(el => {
    const [ano, mes, dia] = el.dataset.nascimento.split('-').map(Number);
    const hoje = new Date();
    let idade = hoje.getFullYear() - ano;
    if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) idade--;
    el.textContent = idade + (el.dataset.sufixo || '');
  });
})();
