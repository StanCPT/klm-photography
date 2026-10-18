(function () {
  'use strict';
  var gallery = document.getElementById('gallery');
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('p');
  var items = [];
  var lastFocus = null;

  document.getElementById('year').textContent = new Date().getFullYear();

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function () {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  function render(filter) {
    gallery.textContent = '';
    items.forEach(function (it) {
      if (filter !== 'all' && it.category !== filter) return;
      var fig = document.createElement('figure');
      fig.tabIndex = 0;
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', 'View ' + it.title);
      var img = document.createElement('img');
      img.src = it.src;
      img.alt = it.title;
      img.loading = 'lazy';
      img.addEventListener('error', function () { img.src = 'images/placeholder.svg'; }, { once: true });
      fig.appendChild(img);
      var open = function () { openLightbox(it, fig); };
      fig.addEventListener('click', open);
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
      gallery.appendChild(fig);
    });
    if (!gallery.children.length) gallery.textContent = 'No photos in this category yet.';
  }

  function openLightbox(it, from) {
    lastFocus = from;
    lbImg.src = it.src;
    lbImg.alt = it.title;
    lbCap.textContent = it.title;
    lb.hidden = false;
    lb.querySelector('.lb-close').focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLightbox(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLightbox(); });

  document.querySelector('.filters').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    document.querySelectorAll('.filters button').forEach(function (x) {
      x.classList.toggle('active', x === b);
      x.setAttribute('aria-pressed', x === b);
    });
    render(b.dataset.filter);
  });

  fetch('gallery.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { items = d.images || []; render('all'); })
    .catch(function () { gallery.textContent = 'Gallery could not be loaded.'; });

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'email', 'message'].forEach(function (id) {
      var f = form.elements[id];
      var valid = f.value.trim() !== '' && (id !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.classList.toggle('invalid', !valid);
      f.setAttribute('aria-invalid', !valid);
      if (!valid) ok = false;
    });
    status.className = ok ? 'ok' : 'error';
    if (!ok) { status.textContent = 'Please complete all fields with valid details.'; return; }
    var body = 'Name: ' + form.elements.name.value + '\nEmail: ' + form.elements.email.value +
      '\nSession: ' + form.elements.type.value + '\n\n' + form.elements.message.value;
    window.location.href = 'mailto:info@klmphotography.co.za?subject=' +
      encodeURIComponent('Photography inquiry') + '&body=' + encodeURIComponent(body);
    status.textContent = 'Thanks! Your email app should open to send the inquiry.';
  });
})();
