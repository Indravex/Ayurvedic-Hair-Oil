(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Loader + hero sequence
  $$('[data-hero]').forEach(function (el, i) { el.style.setProperty('--d', i); });
  function start() {
    var l = $('#loader');
    if (l) l.classList.add('done');
    document.body.classList.add('ready');
  }
  window.addEventListener('load', function () { setTimeout(start, reduce ? 0 : 600); });
  setTimeout(start, 2500); // never block the page

  // Floating botanical leaves
  var box = $('.leaves');
  if (box && !reduce) {
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('span');
      s.className = 'leaf';
      s.style.cssText = '--s:' + (14 + Math.random() * 26) + 'px;--x:' + Math.random() * 100 + '%;--t:' + (14 + Math.random() * 12) + 's;--dl:-' + Math.random() * 20 + 's';
      box.appendChild(s);
    }
  }

  // Scroll reveal (once, when in view)
  var els = $$('[data-anim]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  // Sticky nav, parallax, steps line (one rAF-throttled scroll handler)
  var nav = $('#nav'), par = $$('[data-parallax]'), steps = $('.steps'), ticking = false;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('solid', y > 40);
    if (!reduce && y < window.innerHeight * 1.2) {
      par.forEach(function (p) { p.style.transform = 'translateY(' + (y * p.dataset.parallax * -1) + 'px)'; });
    }
    if (steps) {
      var r = steps.getBoundingClientRect(), h = window.innerHeight;
      var p = Math.min(1, Math.max(0, (h * 0.85 - r.top) / (r.height + h * 0.2)));
      steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Mobile menu
  var burger = $('.burger'), menu = $('nav');
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
  });
  $$('nav a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }); });

  // Ingredients: tap to reveal (touch devices)
  $$('.ings button').forEach(function (b) {
    b.addEventListener('click', function () {
      var was = b.classList.contains('open');
      $$('.ings button.open').forEach(function (x) { x.classList.remove('open'); });
      if (!was) b.classList.add('open');
    });
  });

  // Product CTA: preselect product, scroll to form
  $$('[data-product]').forEach(function (b) {
    b.addEventListener('click', function () {
      $('#product').value = b.dataset.product;
      $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(function () { $('#lead [name=name]').focus({ preventScroll: true }); }, reduce ? 0 : 700);
    });
  });

  // Lead form: validates, then opens WhatsApp with the details prefilled.
  // To store leads in Google Sheets or email, set ENDPOINT to your Apps Script / Formspree URL.
  var ENDPOINT = '';
  var form = $('#lead'), msg = $('#msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, ok = true;
    if (f.website.value) return; // honeypot
    ['name', 'phone'].forEach(function (n) {
      var bad = !f[n].value.trim() || (n === 'phone' && !/^[0-9+ ]{10,14}$/.test(f[n].value.trim()));
      f[n].classList.toggle('bad', bad);
      if (bad) ok = false;
    });
    if (!ok) { msg.textContent = 'Please enter your name and a valid phone number.'; return; }
    var data = { name: f.name.value, phone: f.phone.value, email: f.email.value, city: f.city.value, product: f.product.value, message: f.message.value };
    if (ENDPOINT) {
      fetch(ENDPOINT, { method: 'POST', body: JSON.stringify(data) }).catch(function () {});
    }
    var text = 'New enquiry for Dhara Ayurvedic Hair Oil\nName: ' + data.name + '\nPhone: ' + data.phone +
      (data.email ? '\nEmail: ' + data.email : '') + (data.city ? '\nCity: ' + data.city : '') +
      '\nProduct: ' + data.product + (data.message ? '\nMessage: ' + data.message : '');
    msg.textContent = 'Thank you! We\'ll contact you shortly. Opening WhatsApp to confirm…';
    window.open('https://wa.me/917709237510?text=' + encodeURIComponent(text), '_blank', 'noopener');
    form.reset();
  });

  $('#yr').textContent = new Date().getFullYear();
})();
