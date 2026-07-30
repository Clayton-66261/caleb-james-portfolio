(function(){
  "use strict";

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  /* ---------------- Sticky header shrink ---------------- */
  var header = document.getElementById('site-header');
  function onScrollHeader(){
    if(window.scrollY > 8){ header.classList.add('is-scrolled'); }
    else{ header.classList.remove('is-scrolled'); }
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, {passive:true});

  /* ---------------- Mobile menu ---------------- */
  var menuToggle = document.getElementById('menu-toggle');
  var menuClose = document.getElementById('menu-close');
  var mobileMenu = document.getElementById('mobile-menu');

  function openMenu(){
    mobileMenu.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    mobileMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  if(menuToggle){ menuToggle.addEventListener('click', openMenu); }
  if(menuClose){ menuClose.addEventListener('click', closeMenu); }
  mobileMenu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });

  /* ---------------- Dark mode toggle ---------------- */
  var themeToggle = document.getElementById('theme-toggle');
  function currentTheme(){
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    try{ localStorage.setItem('cj-theme', theme); }catch(e){}
    themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
  themeToggle.setAttribute('aria-pressed', currentTheme() === 'dark' ? 'true' : 'false');
  themeToggle.addEventListener('click', function(){
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });

  /* ---------------- Scrollspy nav ---------------- */
  var navLinks = document.querySelectorAll('[data-nav]');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  function setActiveNav(id){
    navLinks.forEach(function(a){
      var match = a.getAttribute('href') === ('#' + id);
      a.classList.toggle('is-active', match);
    });
  }
  if('IntersectionObserver' in window && sections.length){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ setActiveNav(entry.target.id); }
      });
    }, {rootMargin:'-45% 0px -50% 0px', threshold:0});
    sections.forEach(function(s){ spy.observe(s); });
  }

  /* ---------------- Back to top ---------------- */
  var backToTop = document.getElementById('back-to-top');
  function onScrollTop(){
    backToTop.classList.toggle('is-visible', window.scrollY > 480);
  }
  onScrollTop();
  window.addEventListener('scroll', onScrollTop, {passive:true});
  backToTop.addEventListener('click', function(){
    window.scrollTo({top:0, behavior:'smooth'});
  });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var reveal = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:.12});
    revealEls.forEach(function(el){ reveal.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------------- Portfolio: render, filter, search ---------------- */
  var grid = document.getElementById('portfolio-grid');
  var emptyState = document.getElementById('portfolio-empty');
  var searchInput = document.getElementById('portfolio-search');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var activeCategory = 'all';

  var CATEGORY_LABEL = {journalism:'Journalism', advertising:'Advertising', broadcast:'Broadcast'};
  var CATEGORY_ICON = {
    journalism:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5V6a2 2 0 0 1 2-2h9l5 5v10.5"/><path d="M8 8h6M8 12h8M8 16h5"/></svg>',
    advertising:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z"/><path d="M15 9a3 3 0 0 1 0 6M18 6a6 6 0 0 1 0 12"/></svg>',
    broadcast:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="14" height="11" rx="1.5"/><path d="M17 10.5 21 8v9l-4-2.5"/></svg>'
  };

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function cardHtml(item, index){
    var catClass = 'thumb-' + item.category;
    var soon = !!item.comingSoon || !item.link;
    var linkHtml;
    if(soon){
      linkHtml = '<span class="view-link is-soon">Coming soon</span>';
    } else {
      var label = item.linkLabel || 'View project';
      var external = /^https?:\/\//.test(item.link);
      linkHtml = '<a class="view-link" href="' + escapeHtml(item.link) + '"' +
        (external ? ' target="_blank" rel="noopener"' : ' target="_blank" rel="noopener"') +
        '>' + escapeHtml(label) +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>';
    }

    var tags = (item.tags || []).map(function(t){ return '<span class="tag-pill">' + escapeHtml(t) + '</span>'; }).join('');
    var searchBlob = [item.title, item.desc, (item.tags||[]).join(' '), item.category].join(' ').toLowerCase();

    return '' +
    '<article class="card" data-category="' + item.category + '" data-search="' + escapeHtml(searchBlob) + '" style="--i:' + index + '">' +
      '<div class="card-thumb ' + catClass + '">' +
        CATEGORY_ICON[item.category] +
        (soon ? '<span class="card-badge">Coming soon</span>' : '') +
        '<span class="thumb-cat">' + CATEGORY_LABEL[item.category] + '</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p class="card-desc">' + escapeHtml(item.desc) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '<div class="card-foot">' +
          linkHtml +
          (item.meta ? '<span class="card-meta">' + escapeHtml(item.meta) + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderPortfolio(){
    if(!grid || !window.PORTFOLIO_ITEMS) return;
    grid.innerHTML = PORTFOLIO_ITEMS.map(cardHtml).join('');

    var usedCategories = {};
    PORTFOLIO_ITEMS.forEach(function(item){ usedCategories[item.category] = true; });
    filterBtns.forEach(function(btn){
      var cat = btn.getAttribute('data-filter');
      if(cat === 'all') return;
      var hasItems = !!usedCategories[cat];
      btn.style.display = hasItems ? '' : 'none';
      if(!hasItems && btn.classList.contains('is-active')){
        btn.classList.remove('is-active');
        activeCategory = 'all';
        filterBtns[0].classList.add('is-active');
      }
    });

    applyFilters();
  }

  function applyFilters(){
    var query = (searchInput && searchInput.value || '').trim().toLowerCase();
    var cards = grid.querySelectorAll('.card');
    var visibleCount = 0;
    cards.forEach(function(card){
      var matchesCategory = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
      var matchesSearch = !query || card.getAttribute('data-search').indexOf(query) !== -1;
      var show = matchesCategory && matchesSearch;
      card.style.display = show ? '' : 'none';
      if(show) visibleCount++;
    });
    emptyState.classList.toggle('is-visible', visibleCount === 0);
  }

  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      activeCategory = btn.getAttribute('data-filter');
      applyFilters();
    });
  });

  if(searchInput){
    searchInput.addEventListener('input', applyFilters);
  }

  document.querySelectorAll('[data-filter-link]').forEach(function(link){
    link.addEventListener('click', function(e){
      var target = link.getAttribute('data-filter-link');
      var btn = document.querySelector('.filter-btn[data-filter="' + target + '"]');
      if(btn){ btn.click(); }
    });
  });

  renderPortfolio();

  /* ---------------- Contact form (mailto fallback) ---------------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      if(!name || !email || !message){
        status.setAttribute('data-state','error');
        status.textContent = 'Please fill in every field before sending.';
        return;
      }
      var subject = encodeURIComponent('Portfolio inquiry from ' + name);
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:cjame646@students.bju.edu?subject=' + subject + '&body=' + body;
      status.setAttribute('data-state','success');
      status.textContent = 'Opening your email app…';
    });
  }

})();
