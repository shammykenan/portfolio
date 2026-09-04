(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var lock = function (on) { document.body.style.overflow = on ? 'hidden' : ''; };

  /* ── theme ── */
  var root = document.documentElement;

  $('#theme').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ── fullscreen sheet ── */
  var burger = $('#burger'), sheet = $('#sheet'), bIcon = $('#burgerIcon');
  var ICON_MENU = '<path d="M4 7h16M4 12h16M4 17h16"/>';
  var ICON_X = '<path d="M18 6L6 18M6 6l12 12"/>';

  function setMenu(open) {
    sheet.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    bIcon.innerHTML = open ? ICON_X : ICON_MENU;
    lock(open);
  }

  burger.addEventListener('click', function () { setMenu(!sheet.classList.contains('open')); });
  $$('#sheet a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ── custom cursor + cursor-following "tap to..." tooltip ──
     triggers on project rows (text derived from the title) and on
     clickable credential cards (text from their own data-tip) */
  var cur = $('#cur');
  var tip = $('#hoverTip');
  var tipText = $('#hoverTipText');
  var tipSource = null;

  function tipTextFor(el) {
    if (el.hasAttribute('data-tip')) return el.getAttribute('data-tip');
    var name = $('.prow-t', el);
    return 'Tap to view ' + (name ? name.textContent : '') + ' case study';
  }

  if (window.matchMedia('(hover: hover)').matches && window.innerWidth > 640) {
    window.addEventListener('mousemove', function (e) {
      cur.classList.add('on');
      cur.style.left = e.clientX + 'px';
      cur.style.top = e.clientY + 'px';
      cur.classList.toggle('big', !!(e.target.closest && e.target.closest('a, button, .car-slide, .row, .skill, .cert')));

      if (tip) {
        var src = e.target.closest && e.target.closest('.row[data-case], .cert[data-tip]');
        tip.classList.toggle('on', !!src);
        if (src) {
          if (src !== tipSource) {
            tipSource = src;
            tipText.textContent = tipTextFor(src);
          }
          tip.style.left = e.clientX + 'px';
          tip.style.top = e.clientY + 'px';
        } else {
          tipSource = null;
        }
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      cur.classList.remove('on');
      if (tip) tip.classList.remove('on');
    });
  }

  /* ── missing-image placeholders ── */
  $$('[data-shot]').forEach(function (box) {
    var img = $('img', box);
    if (!img) { box.classList.add('empty'); return; }
    var fail = function () { box.classList.add('empty'); };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* ── lightbox: works on any list of {src, alt, cap} ── */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var items = [], idx = 0;

  function show(i) {
    if (!items.length) return;
    idx = (i + items.length) % items.length;
    var it = items[idx];
    lbImg.src = it.src;
    lbImg.alt = it.alt || '';
    lbCap.textContent = it.cap || it.alt || '';
    var multi = items.length > 1;
    $('#lbPrev').style.display = multi ? '' : 'none';
    $('#lbNext').style.display = multi ? '' : 'none';
  }

  function openLb(list, i) {
    items = list || [];
    if (!items.length) return;
    show(i || 0);
    lb.classList.add('open');
    lock(true);
  }

  /* keep scroll locked if a modal is still open underneath the lightbox */
  function closeLb() {
    lb.classList.remove('open');
    lock(!!$('.ov.open'));
  }

  /* read a set of image-bearing elements into lightbox items */
  function itemsFrom(els) {
    return els.filter(function (el) { return !el.classList.contains('empty'); })
      .map(function (el) {
        var img = $('img', el);
        return {
          el: el,
          src: img.currentSrc || img.src,
          alt: img.alt || '',
          cap: el.getAttribute('data-cap') || img.alt || ''
        };
      });
  }

  /* ── gallery marquee: loops, pauses on hover, arrows nudge, click opens full ── */
  (function () {
    var group = $('#carGroup'), track = $('#carTrack'), car = $('#car');
    if (!group || !track) return;

    var originals = $$('.car-slide', group);
    if (!originals.length) return;

    var SPEED = 95;               /* px per second */
    var GAP = 10;

    /* the lightbox always works off the original slides, never the clones */
    function openAt(slide) {
      if (slide.classList.contains('empty')) return;
      var i = parseInt(slide.getAttribute('data-i'), 10) || 0;
      var l = itemsFrom(originals);
      var at = 0;
      l.forEach(function (it, j) {
        if (parseInt(it.el.getAttribute('data-i'), 10) === i) at = j;
      });
      openLb(l, at);
    }

    /* duplicate the group so the loop is seamless */
    var clone = group.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('aria-hidden', 'true');
    $$('.car-slide', clone).forEach(function (s) { s.tabIndex = -1; });
    track.appendChild(clone);

    track.addEventListener('click', function (e) {
      var slide = e.target.closest && e.target.closest('.car-slide');
      if (slide) openAt(slide);
    });

    var offset = 0, groupW = 0, hover = false, target = null, last = 0;
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function measure() {
      groupW = group.getBoundingClientRect().width + GAP;
      if (groupW > 0) offset = ((offset % groupW) + groupW) % groupW;
    }

    function step(dir) {
      var s = originals[0].getBoundingClientRect().width + GAP;
      target = (target === null ? offset : target) + dir * s;
    }

    $('#carPrev').addEventListener('click', function () { step(-1); });
    $('#carNext').addEventListener('click', function () { step(1); });

    car.addEventListener('mouseenter', function () { hover = true; });
    car.addEventListener('mouseleave', function () { hover = false; });
    car.addEventListener('focusin', function () { hover = true; });
    car.addEventListener('focusout', function () { hover = false; });

    function frame(t) {
      var dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;

      if (target !== null) {
        offset += (target - offset) * Math.min(1, dt * 9);
        if (Math.abs(target - offset) < 0.5) { offset = target; target = null; }
      } else if (!hover && !still && !lb.classList.contains('open')) {
        offset += SPEED * dt;
      }

      if (groupW > 0) {
        while (offset >= groupW) { offset -= groupW; if (target !== null) target -= groupW; }
        while (offset < 0) { offset += groupW; if (target !== null) target += groupW; }
      }

      track.style.transform = 'translate3d(' + (-offset).toFixed(2) + 'px,0,0)';
      requestAnimationFrame(frame);
    }

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    $$('img', group).forEach(function (im) { im.addEventListener('load', measure); });
    requestAnimationFrame(frame);
  })();

  $('#lbPrev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  $('#lbNext').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });

  lb.addEventListener('click', function (e) { if (e.target === lb || e.target === lbImg) closeLb(); });

  /* single image, no prev/next (avatar, certificate) */
  function openSingle(src, alt, cap) {
    if (!src) return;
    openLb([{ src: src, alt: alt || '', cap: cap || alt || '' }], 0);
  }

  var ava = $('#ava');

  if (ava) {
    ava.addEventListener('click', function () {
      var img = $('img', ava);
      if (img) openSingle(img.currentSrc || img.src, img.alt, img.getAttribute('data-cap'));
    });
  }

  /* ── generic modal helper ── */
  function bindModal(ovSel, closeSels) {
    var ov = $(ovSel);
    function close() { ov.classList.remove('open'); lock(false); }
    (closeSels || []).forEach(function (s) { var el = $(s); if (el) el.addEventListener('click', close); });
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    return { el: ov, open: function () { ov.classList.add('open'); lock(true); }, close: close };
  }

  var mail = bindModal('#mailOv', ['#mailClose', '#fCancel']);
  var cv   = bindModal('#cvOv', ['#cvClose', '#cvBack']);
  var cs   = bindModal('#caseOv', ['#caseClose']);
  var coc  = bindModal('#cocOv', ['#cocClose', '#cocBack']);

  ['#ctaEmail'].forEach(function (s) { var el = $(s); if (el) el.addEventListener('click', mail.open); });

  /* CV: load the PDF only on first open, so it never blocks page load */
  var cvFrame = $('#cvFrame'), cvLoaded = false;

  function openCV() {
    if (!cvLoaded) {
      cvFrame.src = 'Shammy_Kenan_Din_Resume.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH';
      cvLoaded = true;
    }
    cv.open();
  }

  ['#cvBtn', '#cvPill', '#cvPill2', '#cvCert'].forEach(function (s) {
    var el = $(s);
    if (el) el.addEventListener('click', openCV);
  });

  /* Certificate of Completion */
  var cocBtn = $('#cocCert'), cocView = $('#cocView');

  if (cocBtn) cocBtn.addEventListener('click', coc.open);

  if (cocView) {
    var cocImg = $('img', cocView);
    var cocFail = function () { cocView.classList.add('empty'); };
    cocImg.addEventListener('error', cocFail);
    if (cocImg.complete && cocImg.naturalWidth === 0) cocFail();

    cocView.addEventListener('click', function () {
      if (cocView.classList.contains('empty')) return;
      openSingle(cocImg.currentSrc || cocImg.src, cocImg.alt, cocView.getAttribute('data-cap'));
    });
  }

  $('#fSend').addEventListener('click', function () {
    var name = $('#fName').value.trim(),
        addr = $('#fEmail').value.trim(),
        subj = $('#fSubject').value.trim(),
        body = $('#fBody').value.trim();

    if (!name || !addr || !body) { alert('Please fill in your name, email and message.'); return; }

    window.location.href = 'mailto:dinshammykenan012@gmail.com'
      + '?subject=' + encodeURIComponent(subj || 'Website inquiry')
      + '&body=' + encodeURIComponent('From: ' + name + ' <' + addr + '>\n\n' + body);

    ['#fName', '#fEmail', '#fSubject', '#fBody'].forEach(function (s) { $(s).value = ''; });
    mail.close();
  });

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  /* ── project case studies ── */
  var CASES = {
    eod: {
      title: 'Upturn EOD Reporting System',
      meta: 'Sole developer · Upturn Business Solutions · May – Aug 2026 · Live in production',
      shots: [
        { src: 'images/eod-system/eod-login.png',      cap: 'Sign-in — built to read as trustworthy for a financial firm' },
        { src: 'images/eod-system/eod-dashboard.png',  cap: 'Admin dashboard — 60+ users, live compliance rate, and a filing calendar showing who is missing' },
        { src: 'images/eod-system/eod-compliance.png', cap: 'Compliance engine — department and supervisor rankings' },
        { src: 'images/eod-system/eod-analytics.png',  cap: 'Analytics — hours attributed by department, client and category' },
        { src: 'images/eod-system/eod-reports.png',    cap: 'Report submission — every entry tied to a client and project' },
        { src: 'images/eod-system/eod-help.png',       cap: 'Help & Guides — 16 in-app articles written at handover' }
      ],
      problem: 'The firm ran daily reporting on a <strong>Google Form</strong>. Hours arrived as free text, so partners couldn’t tell which client an hour belonged to — and supervisors chased late reports by hand.',
      built: 'A Laravel/PostgreSQL platform where every entry is attributed to a <strong>client, project and department</strong>, with a compliance engine that classifies reports on-time, late or missing on its own.',
      result: '<strong><span class="n">300+</span> reports a week</strong> from <span class="n">60+</span> users across all <span class="n">6</span> departments, running at <span class="n">91.7%</span> compliance. Handed over with in-app documentation — and <strong>still running today</strong>.',
      link: { url: 'https://eod.upturnbusinesssolutionsph.com', label: 'eod.upturnbusinesssolutionsph.com' },
      detail: [
        '<strong>Attribution from day one.</strong> Consolidated <span class="n">4</span> separate admin screens into one System Configuration area and loaded the firm’s full catalogue — <span class="n">100+</span> clients and <span class="n">1,000+</span> projects — before go-live, so hours accumulated per engagement rather than leaving the backfill to someone else.',
        '<strong>Compliance that holds up.</strong> <strong>ComplianceService</strong> classifies every report automatically, honouring approved leave, holidays and weekend deadlines. I later closed a gap where any submission counted as compliant regardless of supervisor approval — which would have made the whole measure meaningless.',
        '<strong>Reconcilable numbers.</strong> Built Excel and PDF export for the accounting side, then switched PDF rendered-time from decimal hours to exact minutes so reports could be matched line-by-line against physical time records.',
        '<strong>The record survives turnover.</strong> A reporting-line transfer reassigns a departing employee’s open reports to a named successor with a full audit trail, backed by a lifecycle workflow covering all <span class="n">5</span> employment types.',
        '<strong>Two ways to clear a backlog.</strong> Approval used to mean working through Gmail. I kept that route — rebuilt over Brevo SMTP with proper action pages — and added in-system approval beside it, plus bulk approve.',
        '<strong>Built for how people actually work.</strong> Shipped as an installable PWA because most staff file from their phone at the end of a shift, and wrote <span class="n">16</span> in-app guides so the firm wasn’t dependent on me being reachable.',
        '<strong>Treated as production, not coursework.</strong> PR-reviewed Git workflow with staging and production deploys on Railway, regression tests via Laravel Boost. When an intermittent <strong>419 error</strong> appeared, I traced it to how the framework refreshes CSRF tokens instead of blindly extending token lifetime.'
      ]
    },
    pos: {
      title: 'SKD Point of Sale',
      meta: 'Personal project · Completed May 2026 · Demo offline',
      shots: [
        { src: 'images/skd-pos/pos-landingpage.png', cap: 'Landing page' },
        { src: 'images/skd-pos/pos-login.png',       cap: 'Sign-in' },
        { src: 'images/skd-pos/pos-pos.png',         cap: 'Point of sale — order lifecycle with variants, modifiers and kitchen dispatch' },
        { src: 'images/skd-pos/pos-bir.png',         cap: 'BIR-compliant invoicing — OR numbering and VAT computation' },
        { src: 'images/skd-pos/pos-reports.png',     cap: 'Sales reporting and daily Z-reading' },
        { src: 'images/skd-pos/pos-menu.png',        cap: 'Customer-facing menu page with QR WiFi modal' }
      ],
      problem: 'Small food businesses need BIR-compliant receipts, but off-the-shelf POS software is priced for chains and rarely handles local invoicing rules.',
      built: 'A three-role PHP/MySQL system — admin, cashier, kitchen — covering the full order lifecycle with item variants, modifiers and kitchen dispatch.',
      result: 'BIR-compliant invoicing with OR numbering, VAT computation and daily Z-reading reports, deployed on shared hosting with a customer-facing menu page and QR WiFi modal.',
      detail: [
        '<strong>ESC/POS thermal printing</strong> driving receipt hardware directly, with a browser-based fallback when the printer is unavailable.',
        '<strong>Role separation</strong> so the kitchen display only sees dispatch-relevant state, and cashiers cannot alter completed transactions.',
        '<strong>Daily Z-reading</strong> reports that close the register and produce the running totals accounting needs.'
      ]
    },
    gm: {
      title: 'Grease Monkey — Inventory Management',
      meta: 'Personal project · Completed Mar 2026 · Source available',
      shots: [
        { src: 'images/grease-monkey/gm-landingpage.png', cap: 'Landing page' },
        { src: 'images/grease-monkey/gm-login.png',       cap: 'Sign-in with auth rate limiting' },
        { src: 'images/grease-monkey/gm-dashboard.png',   cap: 'Inventory dashboard — stock levels at a glance' },
        { src: 'images/grease-monkey/gm-parts.png',       cap: 'Parts catalogue with SKU tracking' },
        { src: 'images/grease-monkey/gm-movement.png',    cap: 'Stock movement log' },
        { src: 'images/grease-monkey/gm-audit.png',       cap: 'Audit trail — every action attributed to a user' }
      ],
      problem: 'An automotive-parts shop tracking stock on paper has no way to answer what moved, when, or who touched it.',
      built: 'A PHP/MySQL inventory system with SKU tracking, stock movement logs and a complete audit trail on every action.',
      result: 'Public GitHub repository with full setup documentation, plus one-click database backup and restore for production reliability.',
      link: { url: 'https://github.com/shammykenan/greasemonkeyinventory', label: 'github.com/shammykenan/greasemonkeyinventory' },
      detail: [
        '<strong>Per-action activity logging</strong> so every stock change is attributable to a user and a timestamp.',
        '<strong>Auth rate limiting</strong> on login to blunt credential-stuffing attempts.',
        '<strong>Email notifications</strong> over Brevo SMTP for low-stock and account events.'
      ]
    },
    ecom: {
      title: 'PHP E-Commerce Platform',
      meta: 'Coursework · Completed Jan 2026',
      shots: [],
      problem: 'A course brief to build a working storefront end to end, without a framework doing the structural work.',
      built: 'A product catalog with admin management and a session-based shopping cart, on a hand-rolled MVC structure.',
      result: 'A full order-processing pipeline from frontend through to the data layer, with distinct layers for routing, business logic and data access.',
      detail: [
        '<strong>Hand-rolled MVC</strong> — writing the router and controller layer myself is where the framework conventions I use in Laravel started making sense.'
      ]
    }
  };

  function openCase(key) {
    var c = CASES[key];
    if (!c) return;

    $('#caseTitle').textContent = c.title;
    $('#caseMeta').textContent = c.meta;

    var html = '';

    if (c.shots && c.shots.length) {
      html += '<div class="cs-grid">';
      c.shots.forEach(function (s, i) {
        html += '<button class="cs-thumb" data-i="' + i + '" data-cap="' + esc(s.cap) + '">'
          + '<img src="' + s.src + '" alt="' + esc(c.title + ' — ' + s.cap) + '" loading="lazy">'
          + '<span class="cs-thumb-n">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>'
          + '<span class="cs-thumb-ph">' + esc(s.src.replace('images/', '')) + '</span>'
          + '</button>';
      });
      html += '</div><div class="cs-grid-cap">Click any screen to view it full size</div>';
    } else {
      html += '<div class="cs-none">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">'
        + '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/>'
        + '<circle cx="8.5" cy="8.5" r="1.4"/><path d="M3 3l18 18"/></svg>'
        + '<b>Images unavailable</b>No screenshots were captured for this project.'
        + '</div>';
    }

    html += '<div class="cs-pbr">'
      + '<div><span class="cs-k">The problem</span><p>' + c.problem + '</p></div>'
      + '<div><span class="cs-k">What I built</span><p>' + c.built + '</p></div>'
      + '<div><span class="cs-k">The result</span><p>' + c.result + '</p></div>'
      + '</div>';

    if (c.detail && c.detail.length) {
      html += '<span class="cs-k">Engineering detail</span><ul class="cs-list">';
      c.detail.forEach(function (d) { html += '<li>' + d + '</li>'; });
      html += '</ul>';
    }

    if (c.link) {
      html += '<div class="fa"><a class="pill pill-solid" href="' + c.link.url + '" target="_blank" rel="noopener noreferrer">'
        + '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>'
        + c.link.label + '</a></div>';
    }

    var body = $('#caseBody');
    body.innerHTML = html;
    body.scrollTop = 0;

    /* placeholder fallback + click-to-enlarge on each thumbnail */
    var thumbs = $$('.cs-thumb', body);

    thumbs.forEach(function (t) {
      var img = $('img', t);
      var fail = function () { t.classList.add('empty'); };
      img.addEventListener('error', fail);
      if (img.complete && img.naturalWidth === 0) fail();

      t.addEventListener('click', function () {
        if (t.classList.contains('empty')) return;
        var list = itemsFrom(thumbs);
        var at = 0;
        list.forEach(function (it, i) { if (it.el === t) at = i; });
        openLb(list, at);
      });
    });

    cs.open();
  }

  $$('[data-case]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      openCase(btn.getAttribute('data-case'));
    });
  });

  /* ── escape closes topmost layer ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (lb.classList.contains('open')) return closeLb();
      if (cs.el.classList.contains('open')) return cs.close();
      if (coc.el.classList.contains('open')) return coc.close();
      if (cv.el.classList.contains('open')) return cv.close();
      if (mail.el.classList.contains('open')) return mail.close();
      if (sheet.classList.contains('open')) return setMenu(false);
    }
    if (!lb.classList.contains('open') || items.length < 2) return;
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* ── reveal ── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (x) {
      if (!x.isIntersecting) return;
      x.target.classList.add('on');
      io.unobserve(x.target);
    });
  }, { threshold: 0.04, rootMargin: '0px 0px -40px 0px' });

  $$('.rv').forEach(function (el) { io.observe(el); });

  /* ── scroll state ── */
  var secs = $$('section[id]');
  var jumps = $$('#navLinks a');
  var toTop = $('#toTop');
  var prog = $('#prog');
  var pending = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    var active = '';
    secs.forEach(function (s) { if (y >= s.offsetTop - 140) active = s.id; });

    /* the last section's offsetTop threshold can be unreachable if it's
       short and there isn't enough page left below it to scroll that
       far - once at (or essentially at) the bottom of the page, just
       force the last section active instead of leaving the previous
       one stuck highlighted */
    if (max > 0 && y >= max - 4 && secs.length) active = secs[secs.length - 1].id;

    jumps.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + active); });

    toTop.classList.toggle('on', y > 500);
    pending = false;
  }

  window.addEventListener('scroll', function () {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });

  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
