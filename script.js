// ===================================================================
// PORTFOLIO — Gehad Adam (Dynamic from data.js)
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- تحميل البيانات ----------
  const data = PORTFOLIO_DATA;
  const D = data;

  // ================================================================
  // 1. HERO
  // ================================================================
  document.getElementById('heroTag').textContent = D.personal.tagline;
  document.getElementById('heroName').textContent = D.personal.name;
  document.getElementById('heroDesc').textContent = D.personal.description;

  // ---------- BADGES ----------
  const badgeContainer = document.getElementById('heroBadge');
  D.badges.forEach(b => {
    const div = document.createElement('div');
    div.className = 'badge';
    div.innerHTML = `<i class="${b.icon}"></i> ${b.label}`;
    badgeContainer.appendChild(div);
  });

  // ---------- TYPING ----------
  const phrases = D.typingPhrases;
  let i = 0, j = 0, deleting = false;
  const target = document.getElementById('typeTarget');
  function type() {
    const current = phrases[i];
    target.textContent = deleting ? current.substring(0, j--) : current.substring(0, j++);
    let speed = deleting ? 40 : 70;
    if (!deleting && j === current.length + 1) { speed = 1500; deleting = true; }
    else if (deleting && j === 0) { deleting = false; i = (i + 1) % phrases.length; speed = 400; }
    setTimeout(type, speed);
  }
  type();

  // ================================================================
  // 2. ABOUT + STATS
  // ================================================================
  document.getElementById('aboutText1').textContent = D.about.text1;
  document.getElementById('aboutText2').textContent = D.about.text2;

  const statsContainer = document.getElementById('statsContainer');
  D.stats.forEach(stat => {
    const div = document.createElement('div');
    div.className = 'stat';
    div.innerHTML = `
      <span class="stat__number" data-count="${stat.count}">0</span>
      <span class="stat__label">${stat.label}</span>
    `;
    statsContainer.appendChild(div);
  });

  // ================================================================
  // 3. SKILLS
  // ================================================================
  const skillsGrid = document.getElementById('skillsGrid');
  D.skills.forEach(skill => {
    const div = document.createElement('div');
    div.className = 'skill-card';
    div.innerHTML = `
      <div class="skill-card__icon"><i class="${skill.icon}"></i></div>
      <h3>${skill.title}</h3>
      <ul>${skill.items.map(item => `<li>${item}</li>`).join('')}</ul>
    `;
    skillsGrid.appendChild(div);
  });

  // ================================================================
  // 4. TIMELINES (Experience, Education, Courses)
  // ================================================================
  function renderTimeline(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'timeline__item';
      div.innerHTML = `
        <div class="timeline__dot"></div>
        <div class="timeline__content">
          <span class="timeline__date">${item.date}</span>
          <h3>${item.title}</h3>
          ${item.company ? `<p class="timeline__meta">${item.company}</p>` : ''}
          ${item.details && item.details.length ? `<ul>${item.details.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
        </div>
      `;
      container.appendChild(div);
    });
  }

  renderTimeline('timelineContainer', D.experiences);
  renderTimeline('educationContainer', D.education);
  renderTimeline('coursesContainer', D.courses);

  // ================================================================
  // 5. PROJECTS
  // ================================================================
  const categoriesContainer = document.getElementById('categories');
  const projectsGrid = document.getElementById('projectsGrid');

  // ---------- أزرار الفلاتر ----------
  const allCategories = ['all', ...D.projects.categories.map(c => c.id)];
  allCategories.forEach(catId => {
    const btn = document.createElement('button');
    btn.className = `category-btn${catId === 'all' ? ' active' : ''}`;
    btn.dataset.category = catId;
    if (catId === 'all') {
      btn.textContent = 'All Projects';
    } else {
      const cat = D.projects.categories.find(c => c.id === catId);
      btn.textContent = cat ? cat.label : catId;
    }
    categoriesContainer.appendChild(btn);
  });

  // ---------- عرض المشاريع ----------
  function renderProjects(categoryFilter = 'all') {
    projectsGrid.innerHTML = '';
    D.projects.categories.forEach(cat => {
      if (categoryFilter !== 'all' && cat.id !== categoryFilter) return;
      cat.images.forEach(img => {
        const card = document.createElement('article');
        card.className = 'project-card';
        card.dataset.category = cat.id;
        const imagePath = `${D.paths.projectsBase}${cat.folder}/${img.file}`;
        card.innerHTML = `
          <div class="project-card__media">
            <img src="${imagePath}" alt="${img.title}" onerror="this.parentElement.classList.add('no-image')">
            <div class="project-card__fallback"><i class="fa-solid fa-image"></i></div>
          </div>
          <div class="project-card__body">
            <h3>${img.title}</h3>
            <p>${cat.label.replace(/[^\w\s]/g, '').trim()} — ${img.title}</p>
            <div class="tags">${img.tags.map(t => `<span>${t}</span>`).join('')}</div>
          </div>
        `;
        projectsGrid.appendChild(card);
      });
    });
  }

  renderProjects('all');

  // ---------- فلترة المشاريع ----------
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.dataset.category);
    });
  });

  // ================================================================
  // 6. CONTACT (روابط فقط)
  // ================================================================
  const contactMethods = document.getElementById('contactMethods');
  D.contactLinks.forEach(c => {
    const a = document.createElement('a');
    a.className = `contact__card contact__card--${c.type}`;
    a.href = c.url;
    a.target = c.type === 'whatsapp' ? '_blank' : '';
    a.rel = c.type === 'whatsapp' ? 'noopener' : '';
    a.innerHTML = `
      <div class="contact__card-icon"><i class="${c.icon}"></i></div>
      <div class="contact__card-content">
        <span class="contact__card-label">${c.label}</span>
        <span class="contact__card-value">${c.value}</span>
        <span class="contact__card-action">${c.action}</span>
      </div>
    `;
    contactMethods.appendChild(a);
  });

  // ================================================================
  // 7. FOOTER
  // ================================================================
  document.getElementById('footerText').textContent = D.footer.text;
  document.getElementById('year').textContent = new Date().getFullYear();

  // ================================================================
  // 8. باقي الوظائف (Preloader, Nav, Theme, Scroll, Stats Animation)
  // ================================================================

  // ---------- PRELOADER ----------
  const preloader = document.getElementById('preloader');
  setTimeout(() => preloader?.classList.add('hide'), 600);

  // ---------- NAV ----------
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));

  // ---------- MOBILE MENU ----------
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // ---------- THEME ----------
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const saved = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    localStorage.setItem('theme', theme);
  }
  setTheme(saved);
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ---------- STATS ANIMATION ----------
  function animateStats() {
    document.querySelectorAll('.stat__number').forEach(el => {
      const target = parseInt(el.dataset.count);
      let current = 0;
      const step = Math.ceil(target / 30);
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        el.textContent = current;
      }, 30);
    });
  }

  // ---------- SCROLL REVEAL ----------
  const observer = new IntersectionObserver((entries) => {
    let statsAnimated = false;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        if (!statsAnimated && entry.target.closest('#about')) {
          statsAnimated = true;
          setTimeout(animateStats, 300);
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.skill-card, .project-card, .timeline__item, .about__grid')
    .forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

  // ---------- NAV ACTIVE ----------
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__link');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => sectionObserver.observe(s));

  // ---------- SCROLL TOP ----------
  const scrollTop = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => scrollTop.classList.toggle('show', window.scrollY > 500));
  scrollTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

});