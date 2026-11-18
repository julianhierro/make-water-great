(function () {
  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Lead forms: POST to the configured endpoint, else fall back to email, else say it wasn't sent.
  document.querySelectorAll('form[data-lead]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (fd.get('company')) return;
      var data = {};
      fd.forEach(function (v, k) { if (k !== 'company') data[k] = data[k] ? data[k] + ', ' + v : v; });
      data.page = location.pathname;
      var parts = String(data.name || '').trim().split(/\s+/);
      data.first_name = parts.shift() || '';
      data.last_name = parts.join(' ');
      data.source = 'Website';
      data.tags = ['website-lead', 'water-test-request'];
      var endpoint = form.dataset.endpoint, email = form.dataset.email, btn = form.querySelector('button');

      if (endpoint) {
        btn.disabled = true;
        status.textContent = 'Sending…';
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); location.href = form.dataset.thanks; })
          .catch(function () { btn.disabled = false; status.textContent = 'That didn’t send. Please try again or give us a call.'; });
      } else if (email) {
        var body = ['name', 'phone', 'email', 'zip', 'water_source', 'issues', 'message'].filter(function (k) { return data[k]; }).map(function (k) { return k + ': ' + data[k]; }).join('\n');
        location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Free water test request') + '&body=' + encodeURIComponent(body);
      } else {
        status.textContent = 'This form isn’t connected yet, so your details were not sent.';
      }
    });
  });

  // System finder
  document.querySelectorAll('[data-finder]').forEach(function (box) {
    var form = box.querySelector('form');
    var items = JSON.parse(box.querySelector('[data-products]').dataset.products);
    var base = box.querySelector('[data-r-link]').getAttribute('href');
    function pick(v) {
      if (v.goal === 'drink') return v.room === 'no' ? 'tankless-ro' : 'tank-ro';
      if (v.source === 'well') return 'well-dual-tank';
      if (v.goal === 'nosalt') return 'salt-free-conditioner';
      return v.size === 'big' ? 'xl-softener-carbon' : 'softener-carbon-combo';
    }
    function update() {
      var fd = new FormData(form);
      var s = pick({ source: fd.get('source'), goal: fd.get('goal'), room: fd.get('room'), size: fd.get('size') });
      box.querySelector('[data-r-name]').textContent = items[s].name;
      box.querySelector('[data-r-line]').textContent = items[s].line;
      box.querySelector('[data-r-link]').setAttribute('href', base + s + '/');
    }
    form.addEventListener('change', update);
    update();
  });

  // Softener sizing rule of thumb
  document.querySelectorAll('[data-calc]').forEach(function (form) {
    function update() {
      var fd = new FormData(form);
      var grains = (Number(fd.get('people')) || 0) * 75 * (Number(fd.get('gpg')) || 0) * 7;
      form.querySelector('[data-calc-out]').textContent = grains.toLocaleString('en-US');
    }
    form.addEventListener('input', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    update();
  });
})();
