/* LOOK Vila Prudente · interacoes da LP
   Agencia RPK · 2026 */
(function () {
  'use strict';

  /* header muda de estado ao sair do hero */
  var header = document.getElementById('header');
  var hero = document.querySelector('.hero');
  function estadoHeader() {
    var limite = hero ? hero.offsetHeight - 90 : 90;
    header.classList.toggle('solido', window.scrollY > limite);
  }
  window.addEventListener('scroll', estadoHeader, { passive: true });
  estadoHeader();

  /* reveal on scroll */
  var alvos = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    alvos.forEach(function (a) { obs.observe(a); });
  } else {
    alvos.forEach(function (a) { a.classList.add('vis'); });
  }

  /* lightbox da galeria, implantacao e aerea */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  function abrir(src, legenda) {
    lbImg.src = src; lbImg.alt = legenda || '';
    lbCap.textContent = legenda || '';
    lb.classList.add('aberto');
    document.body.style.overflow = 'hidden';
  }
  function fechar() {
    lb.classList.remove('aberto');
    document.body.style.overflow = '';
    lbImg.src = '';
  }
  document.querySelectorAll('[data-full]').forEach(function (img) {
    img.addEventListener('click', function () {
      var fig = img.closest('figure');
      var cap = fig ? fig.querySelector('figcaption') : null;
      abrir(img.getAttribute('data-full'), cap ? cap.textContent.trim() : img.alt);
    });
  });
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) fechar(); });
  document.getElementById('lbFechar').addEventListener('click', fechar);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });

  /* mascara de telefone */
  var tel = document.getElementById('telefone');
  tel.addEventListener('input', function () {
    var v = tel.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = '(' + v.slice(0, 2) + ') ' + v.slice(2, v.length - 4) + '-' + v.slice(-4);
    else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    else if (v.length > 0) v = '(' + v;
    tel.value = v;
  });

  /* formulario */
  var form = document.getElementById('leadForm');
  var status = document.getElementById('formStatus');
  var botao = document.getElementById('btnEnviar');
  var erroConsent = document.getElementById('erro-consent');
  erroConsent.style.display = 'none';

  function marcar(el, ruim) {
    var campo = el.closest('.campo');
    if (campo) campo.classList.toggle('erro', ruim);
    return !ruim;
  }
  function validar() {
    var ok = true;
    var nome = document.getElementById('nome');
    var email = document.getElementById('email');
    var interesse = document.getElementById('interesse');
    var consent = document.getElementById('consent');

    ok = marcar(nome, nome.value.trim().length < 3) && ok;
    ok = marcar(tel, tel.value.replace(/\D/g, '').length < 10) && ok;
    ok = marcar(email, !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) && ok;
    ok = marcar(interesse, !interesse.value) && ok;
    erroConsent.style.display = consent.checked ? 'none' : 'block';
    if (!consent.checked) ok = false;
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    if (!validar()) {
      status.className = 'form-status falha';
      status.textContent = 'Confira os campos destacados.';
      return;
    }

    botao.disabled = true;
    var textoOriginal = botao.textContent;
    botao.textContent = 'Enviando...';

    var dados = {
      nome: document.getElementById('nome').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefone: tel.value.trim(),
      interesse: document.getElementById('interesse').value,
      mensagem: document.getElementById('mensagem').value.trim(),
      origem: location.href
    };

    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.error || 'falha');
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Cadastro recebido. Em breve entramos em contato.';
        if (window.dataLayer) window.dataLayer.push({ event: 'lead_enviado', empreendimento: 'look_vila_prudente' });
      })
      .catch(function () {
        status.className = 'form-status falha';
        status.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
      })
      .finally(function () {
        botao.disabled = false;
        botao.textContent = textoOriginal;
      });
  });

  /* limpa o erro ao corrigir */
  form.querySelectorAll('input,select,textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      var campo = el.closest('.campo');
      if (campo) campo.classList.remove('erro');
      if (el.id === 'consent' && el.checked) erroConsent.style.display = 'none';
    });
  });
})();
