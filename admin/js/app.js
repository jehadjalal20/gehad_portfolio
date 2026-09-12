// ================================================================
// لوحة إدارة الموقع — Gehad Adam
// التحكم الكامل في كل بيانات PORTFOLIO_DATA + الصور + أنواع المشاريع
// Firestore للبيانات + Cloudinary للصور
// ================================================================

(() => {
  'use strict';

  // ---------- أدوات ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CURRENT_TAB_KEY = 'admin_tab';
  let S = null;            // { main, categories }
  let db = null;
  let auth = null;
  let currentTab = 'personal';
  let cloudReady = false;
  let signedInUser = null;   // المستخدم المسجل حالياً (يمنع إغلاق اللوحة بإشارات خروج عابرة)
  let entering = null;       // يمنع تحميل البيانات مرتين متزامنتين

  function getByPath(obj, path) {
    return String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  function setByPath(obj, path, value) {
    const keys = String(path).split('.');
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (o[keys[i]] == null) o[keys[i]] = {};
      o = o[keys[i]];
    }
    o[keys[keys.length - 1]] = value;
  }
  const clone = (o) => JSON.parse(JSON.stringify(o || null));

  // ---------- إشعارات ----------
  let toastTimer = null;
  function toast(msg, type = '') {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show' + (type ? ' toast--' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'toast'; }, 3200);
  }
  function setStatus(msg, type = '') {
    const b = $('#statusBar');
    if (msg) {
      b.textContent = msg;
      b.classList.add('show');
      b.style.color = type === 'err' ? 'var(--danger)' : (type === 'ok' ? 'var(--primary-strong)' : '');
    } else b.classList.remove('show');
  }
  function setProgress(pct, show) {
    const p = $('#uploadProgress');
    p.style.width = Math.max(0, Math.min(100, pct)) + '%';
    p.classList.toggle('hidden', !show);
  }

  // ---------- نافذة اختيار ملف ----------
  function pickFiles(accept, multiple, cb) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = !!multiple;
    input.onchange = () => { cb(Array.from(input.files || [])); input.value = ''; };
    input.click();
  }

  // ---------- Firebase ----------
  async function initFirebase() {
    if (!window.firebase) return false;
    if (!window.PortfolioStore) return false;
    try {
      await window.PortfolioStore.init();
      db = window.PortfolioStore.getDb();
      if (!db) return false;
      auth = window.PortfolioStore.getAuth() || window.firebase.auth();
      const c = window.CLOUDINARY_CONFIG || {};
      cloudReady = !!(c.cloudName && String(c.cloudName) !== 'YOUR_CLOUD_NAME' && c.uploadPreset);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function showLogin(msg) {
    $('#appScreen').classList.add('hidden');
    $('#loginScreen').classList.remove('hidden');
    if (msg) $('#loginMsg').textContent = msg;
  }

  async function enterDashboard(user) {
    signedInUser = user;
    $('#loginScreen').classList.add('hidden');
    $('#appScreen').classList.remove('hidden');
    $('#loginMsg').textContent = 'مرحباً ' + (user.displayName || user.email);
    if (entering) return entering;
    entering = loadAll().catch(err => {
      console.error('loadAll error:', err);
      toast('حدث خطأ أثناء تحميل البيانات: ' + (err && err.message), 'err');
    }).finally(() => { entering = null; });
    return entering;
  }

  // ---------- تجميع البيانات ----------
  function staticBase() {
    const d = window.PORTFOLIO_DATA || {};
    const j = clone(d) || {};
    return {
      personal: j.personal || {},
      typingPhrases: Array.isArray(j.typingPhrases) ? j.typingPhrases : [],
      about: j.about || {},
      stats: Array.isArray(j.stats) ? j.stats : [],
      badges: Array.isArray(j.badges) ? j.badges : [],
      skills: Array.isArray(j.skills) ? j.skills : [],
      experiences: Array.isArray(j.experiences) ? j.experiences : [],
      education: Array.isArray(j.education) ? j.education : [],
      courses: Array.isArray(j.courses) ? j.courses : [],
      contactLinks: Array.isArray(j.contactLinks) ? j.contactLinks : [],
      footer: j.footer || {},
      paths: j.paths || {},
      staticCategories: Array.isArray(j.projects && j.projects.categories)
        ? clone(j.projects.categories)
        : []
    };
  }

  function mergeMain(base, partial) {
    const out = {};
    ['personal', 'typingPhrases', 'about', 'stats', 'badges', 'skills',
      'experiences', 'education', 'courses', 'contactLinks', 'footer', 'paths'
    ].forEach(k => {
      out[k] = (partial && partial[k] !== undefined) ? partial[k] : base[k];
    });
    return out;
  }

  async function loadAll() {
    setStatus('جاري تحميل البيانات من Firestore...');
    const base = staticBase();

    let mainPartial = null, cats = [], projs = [];
    try { mainPartial = await window.PortfolioStore.loadSiteData(); } catch (e) { console.error(e); }
    try { cats = await window.PortfolioStore.listCategories(); } catch (e) { console.error(e); }
    try { projs = await window.PortfolioStore.listProjects(); } catch (e) { console.error(e); }

    S = {
      main: mergeMain(base, mainPartial),
      categories: []
    };

    if (cats.length) {
      S.categories = cats.map(c => ({
        _id: c._id,
        id: c.id || c._id,
        label: c.label || c.id,
        folder: c.folder || '',
        images: projs
          .filter(p => p.categoryId === (c.id || c._id))
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(p => ({
            _id: p._id,
            url: p.url || '',
            file: p.file || '',
            title: p.title || '',
            tags: Array.isArray(p.tags) ? p.tags : [],
            hidden: !!p.hidden
          }))
      }));
    } else {
      S.categories = (base.staticCategories || []).map(c => ({
        _id: null,
        id: c.id,
        label: c.label,
        folder: c.folder || '',
        images: (c.images || []).map(i => ({
          _id: null,
          url: i.url || '',
          file: i.file || '',
          title: i.title || '',
          tags: Array.isArray(i.tags) ? i.tags : [],
          hidden: !!i.hidden
        }))
      }));
    }

    renderAll();
    setStatus('تم التحميل ✔', 'ok');
  }

  // ================================================================
  // عرض الأقسام
  // ================================================================
  const TAB_TITLES = {
    personal: 'البيانات الشخصية',
    hero: 'الهيرو والبادجات',
    about: 'عني والإحصائيات',
    skills: 'المهارات',
    timelines: 'الخبرة والتعليم والدورات',
    projects: 'المشاريع وأنواعها والصور',
    media: 'صورة الملف الشخصي والملفات',
    contact: 'التواصل والفوتر'
  };

  function renderAll() {
    // أزرار التبويبات
    $$('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === currentTab);
    });
    // اللوحات
    $$('.tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === 'panel-' + currentTab);
    });
    $('#tabTitle').textContent = TAB_TITLES[currentTab] || currentTab;
    renderPanel(currentTab);
  }

  function renderPanel(tab) {
    const el = $('#panel-' + tab);
    if (!el || !S) return;
    const H = { personal: renderPersonal, hero: renderHero, about: renderAbout, skills: renderSkills, timelines: renderTimelines, projects: renderProjects, media: renderMedia, contact: renderContact };
    (H[tab] || (() => ''))(el);
  }

  const toolBtns = (action, path, idx, opts = {}) => {
    const d = [];
    if (opts.up !== false) d.push(`<button class="tool-btn" data-action="${action}" data-path="${path}" data-idx="${idx}" data-dir="-1" ${opts.disableUp ? 'disabled' : ''} title="تحريك لأعلى"><i class="fa-solid fa-chevron-up"></i></button>`);
    if (opts.down !== false) d.push(`<button class="tool-btn" data-action="${action}" data-path="${path}" data-idx="${idx}" data-dir="1" ${opts.disableDown ? 'disabled' : ''} title="تحريك لأسفل"><i class="fa-solid fa-chevron-down"></i></button>`);
    if (opts.del !== false) d.push(`<button class="tool-btn tool-btn--danger" data-action="${action}" data-path="${path}" data-idx="${idx}" title="حذف"><i class="fa-solid fa-trash"></i></button>`);
    return d.join('');
  };

  // ---------- البيانات الشخصية ----------
  function renderPersonal(el) {
    const p = S.main.personal;
    el.innerHTML = `
      <div class="card">
        <div class="card__title"><i class="fa-solid fa-user"></i> المعلومات الأساسية</div>
        <div class="grid2">
          ${field('personal.name', 'الاسم', p.name)}
          ${field('personal.title', 'المنصب (Title)', p.title)}
          ${field('personal.tagline', 'الوصف أعلى الصفحة (Tagline)', p.tagline)}
          ${field('personal.location', 'الموقع', p.location)}
        </div>
        ${fieldArea('personal.description', 'الوصف الكامل (يظهر في أعلى الصفحة)', p.description)}
      </div>
      <div class="card">
        <div class="card__title"><i class="fa-solid fa-address-book"></i> معلومات التواصل الداخلية</div>
        <div class="grid3">
          ${field('personal.email', 'الإيميل', p.email, true)}
          ${field('personal.phone', 'رقم الهاتف', p.phone, true)}
          ${field('personal.whatsapp', 'رقم الواتساب (بدون +)', p.whatsapp, true)}
        </div>
      </div>`;
  }

  // ---------- الهيرو ----------
  function renderHero(el) {
    el.innerHTML = `
      <div class="card">
        <div class="card__title"><i class="fa-solid fa-keyboard"></i> النصوص المتحركة (تأثير الكتابة)</div>
        ${S.main.typingPhrases.map((t, i) => `
          <div class="list-item">
            <div class="list-item__grid">
              <input type="text" data-bind-text="main.typingPhrases.${i}" value="${esc(t)}" placeholder="اكتب عبارة...">
            </div>
            <div class="list-item__tools">${toolBtns('mv-list', 'main.typingPhrases', i, { del: false })}</div>
          </div>`).join('')}
        <button class="btn btn--add" data-action="add-list" data-path="main.typingPhrases"><i class="fa-solid fa-plus"></i> إضافة عبارة جديدة</button>
      </div>

      <div class="card">
        <div class="card__title"><i class="fa-solid fa-star"></i> البادجات في الـ Hero</div>
        ${S.main.badges.map((b, i) => `
          <div class="list-item">
            <div class="list-item__grid grid2">
              <div class="field"><label>الأيقونة (Font Awesome)</label><input class="ltr" list="faIcons" type="text" data-bind-text="main.badges.${i}.icon" value="${esc(b.icon)}"></div>
              <div class="field"><label>النص</label><input type="text" data-bind-text="main.badges.${i}.label" value="${esc(b.label)}"></div>
            </div>
            <div class="list-item__tools">${toolBtns('mv-list', 'main.badges', i)}</div>
          </div>`).join('')}
        <button class="btn btn--add" data-action="add-badge"><i class="fa-solid fa-plus"></i> إضافة بادج</button>
      </div>`;
  }

  // ---------- عني والإحصائيات ----------
  function renderAbout(el) {
    el.innerHTML = `
      <div class="card">
        <div class="card__title"><i class="fa-solid fa-circle-info"></i> فقرة "عني"</div>
        ${fieldArea('about.text1', 'الفقرة الأولى', S.main.about.text1)}
        ${fieldArea('about.text2', 'الفقرة الثانية', S.main.about.text2)}
      </div>

      <div class="card">
        <div class="card__title"><i class="fa-solid fa-chart-simple"></i> الإحصائيات (تظهر بعد الفقرات)</div>
        <div class="grid3">
        ${S.main.stats.map((st, i) => `
          <div class="list-item">
            <div class="field"><label>الرقم</label><input type="number" min="0" data-bind-num="main.stats.${i}.count" value="${st.count}"></div>
            <div class="field"><label>التسمية</label><input type="text" data-bind-text="main.stats.${i}.label" value="${esc(st.label)}"></div>
            <div class="list-item__tools" style="margin-top:4px">${toolBtns('mv-list', 'main.stats', i)}</div>
          </div>`).join('') || '<p class="hint">لا توجد إحصائيات بعد.</p>'}
        </div>
        <button class="btn btn--add" data-action="add-stat"><i class="fa-solid fa-plus"></i> إضافة إحصائية</button>
      </div>`;
  }

  // ---------- المهارات ----------
  function renderSkills(el) {
    el.innerHTML = `
      <div class="card">
        <div class="card__title"><i class="fa-solid fa-layer-group"></i> المهارات (كل بطاقة: أيقونة + عنوان + عناصر)</div>
        ${S.main.skills.map((sk, i) => `
          <div class="list-item">
            <div class="list-item__grid grid3">
              <div class="field"><label>الأيقونة</label><input class="ltr" list="faIcons" type="text" data-bind-text="main.skills.${i}.icon" value="${esc(sk.icon)}"></div>
              <div class="field" style="grid-column: span 2"><label>عنوان البطاقة</label><input type="text" data-bind-text="main.skills.${i}.title" value="${esc(sk.title)}"></div>
            </div>
            <div class="field"><label>العناصر (سطر لكل عنصر)</label>
              <textarea data-bind-list="main.skills.${i}.items" rows="4">${esc(Array.isArray(sk.items) ? sk.items.join('\n') : '')}</textarea>
            </div>
            <div class="list-item__tools">${toolBtns('mv-list', 'main.skills', i)}</div>
          </div>`).join('')}
        <button class="btn btn--add" data-action="add-skill"><i class="fa-solid fa-plus"></i> إضافة مهارة</button>
      </div>`;
  }

  // ---------- الخبرة والتعليم والدورات ----------
  function timelineBlock(el, path, label, icon) {
    const arr = getByPath(S.main, path) || [];
    el.innerHTML += `
      <div class="section-label"><i class="${icon}"></i> ${label}</div>
      ${arr.map((it, i) => `
        <div class="list-item">
          <div class="list-item__grid grid2">
            <div class="field"><label>الفترة/التاريخ</label><input type="text" data-bind-text="main.${path}.${i}.date" value="${esc(it.date)}"></div>
            <div class="field"><label>العنوان</label><input type="text" data-bind-text="main.${path}.${i}.title" value="${esc(it.title)}"></div>
            <div class="field"><label>الجهة / الشركة</label><input type="text" data-bind-text="main.${path}.${i}.company" value="${esc(it.company)}"></div>
            <div class="field"><label>التفاصيل (سطر لكل نقطة)</label>
              <textarea data-bind-list="main.${path}.${i}.details" rows="3">${esc((it.details || []).join('\n'))}</textarea>
            </div>
          </div>
          <div class="list-item__tools">${toolBtns('mv-list', 'main.' + path, i)}</div>
        </div>`).join('')}
      <button class="btn btn--add" data-action="add-tl" data-path="main.${path}"><i class="fa-solid fa-plus"></i> إضافة ${label}</button>`;
  }

  function renderTimelines(el) {
    el.innerHTML = '';
    timelineBlock(el, 'experiences', 'الخبرات العملية', 'fa-solid fa-briefcase');
    timelineBlock(el, 'education', 'التعليم', 'fa-solid fa-graduation-cap');
    timelineBlock(el, 'courses', 'الدورات التدريبية', 'fa-solid fa-certificate');
  }

  // ---------- المشاريع والصور ----------
  const thumbOf = (url) => url && /\/(upload)\//.test(url) ? url.replace('/upload/', '/upload/w_500,q_auto,f_auto/') : url;

  function renderProjects(el) {
    el.innerHTML = `
      <div class="card">
        <div class="card__title"><i class="fa-solid fa-cloud-arrow-up"></i> المشاريع وأنواعها (كل شيء ديناميكي)</div>
        <p class="hint">أضف نوعاً جديداً للمشاريع من زر "+ إضافة نوع". ارفع صوراً بأي عدد — تُرفع تلقائياً إلى Cloudinary وتظهر في الموقع فوراً. يمكنك إخفاء أي صورة أو إعادة ترتيبها أو استبدالها أو حذفها.</p>
        <p class="hint">ملاحظة: الصور القديمة المحلية (Local) يُفضّل تحويلها لـ Cloudinary بزر ↑Cloud حتى لا تختفي عند تغيير روابط الموقع.</p>
        <div id="catList"></div>
        <button class="btn btn--add" data-action="add-category"><i class="fa-solid fa-plus"></i> إضافة نوع مشروع جديد</button>
      </div>`;

    const wrap = $('#catList', el);
    if (!S.categories.length) { wrap.innerHTML = '<p class="hint">لا توجد أنواع مشاريع. ابدأ بإضافة نوع.</p>'; return; }

    wrap.innerHTML = S.categories.map((cat, ci) => {
      const localPrev = (ci === 0);
      const localNext = (ci === S.categories.length - 1);
      return `
        <div class="card cat-card">
          <div class="cat-card__head">
            <span class="cat-card__badge">${esc(cat.id || cat._id || 'جديد')}</span>
            <input type="text" data-bind-text="categories.${ci}.label" value="${esc(cat.label)}" placeholder="اسم النوع (يظهر في أزرار التصفية)">
            ${localPrev ? '' : `<button class="tool-btn" data-action="cat-move" data-idx="${ci}" data-dir="-1" title="تحريك لأعلى"><i class="fa-solid fa-chevron-up"></i></button>`}
            ${localNext ? '' : `<button class="tool-btn" data-action="cat-move" data-idx="${ci}" data-dir="1" title="تحريك لأسفل"><i class="fa-solid fa-chevron-down"></i></button>`}
            <button class="tool-btn tool-btn--danger" data-action="cat-del" data-idx="${ci}" title="حذف النوع بالكامل"><i class="fa-solid fa-trash"></i></button>
          </div>

          <div class="upload-zone" data-action="cat-upload" data-idx="${ci}"><i class="fa-solid fa-cloud-arrow-up"></i> رفع صور جديدة لهذا النوع (اختيار متعدد)</div>

          <div class="img-grid">
          ${cat.images.map((im, ii) => {
            const src = im.url ? thumbOf(im.url) : (im.file && cat.folder ? `../${window.PORTFOLIO_DATA.paths.projectsBase}${cat.folder}/${im.file}` : '');
            const isCloud = !!im.url;
            return `
            <div class="img-card ${im.hidden ? 'is-hidden' : ''}">
              <div class="img-card__thumb">
                ${src ? `<img src="${esc(src)}" onerror="this.style.display='none';this.parentElement.classList.add('img-card__thumb--empty');">` : '<i class="fa-solid fa-image" style="font-size:32px;color:var(--text-dim)"></i>'}
                ${im.hidden ? '<span class="img-card__tag hidden">مخفية</span>' : ''}
                <span class="img-card__tag ${isCloud ? 'cloudinary' : 'local'}">${isCloud ? 'Cloudinary' : 'Local'}</span>
              </div>
              <div class="img-card__body">
                <input type="text" data-bind-text="categories.${ci}.images.${ii}.title" value="${esc(im.title)}" placeholder="عنوان الصورة">
                <input class="ltr" type="text" data-bind-commas="categories.${ci}.images.${ii}.tags" value="${esc((im.tags || []).join(', '))}" placeholder="وسوم (مفصولة بفاصلة)">
                <div class="img-card__tools">
                  ${ii > 0 ? `<button class="tool-btn" data-action="img-move" data-idx="${ci}" data-img="${ii}" data-dir="-1" title="تقديم"><i class="fa-solid fa-chevron-up"></i></button>` : ''}
                  ${ii < cat.images.length - 1 ? `<button class="tool-btn" data-action="img-move" data-idx="${ci}" data-img="${ii}" data-dir="1" title="تأخير"><i class="fa-solid fa-chevron-down"></i></button>` : ''}
                  <button class="tool-btn tool-btn--ok" data-action="img-toggle" data-idx="${ci}" data-img="${ii}" title="${im.hidden ? 'إظهار' : 'إخفاء'}"><i class="fa-solid ${im.hidden ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
                  ${!isCloud ? `<button class="tool-btn" data-action="img-cloud" data-idx="${ci}" data-img="${ii}" title="تحويل الصورة المحلية إلى Cloudinary"><i class="fa-solid fa-cloud-arrow-up"></i></button>` : ''}
                  <button class="tool-btn" data-action="img-replace" data-idx="${ci}" data-img="${ii}" title="استبدال الصورة"><i class="fa-solid fa-arrows-rotate"></i></button>
                  <button class="tool-btn tool-btn--danger" data-action="img-del" data-idx="${ci}" data-img="${ii}" title="حذف"><i class="fa-solid fa-trash"></i></button>
                </div>
              </div>
            </div>`;
          }).join('') || '<p class="hint">لا توجد صور في هذا النوع بعد.</p>'}
          </div>
        </div>`;
    }).join('');
  }

  // ---------- الوسائط ----------
  function renderMedia(el) {
    const P = S.main.paths || {};
    const isCloud = (v) => /^https?:\/\//.test(v || '');
    el.innerHTML = `
      <div class="card">
        <div class="card__title"><i class="fa-solid fa-user-image"></i> صورة الملف الشخصي</div>
        <div class="media-preview">${isCloud(P.profileImage) ? `<img src="${esc(P.profileImage)}">` : `<i class="fa-solid fa-user"></i>`}</div>
        <div class="grid2">
          ${field('paths.profileImage', 'رابط الصورة (يُملأ تلقائياً عند الرفع)', P.profileImage, true)}
          <div class="field"><label>&nbsp;</label><button class="btn btn--primary btn--block" data-action="up-profile"><i class="fa-solid fa-cloud-arrow-up"></i> رفع صورة جديدة</button></div>
        </div>
      </div>

      <div class="card">
        <div class="card__title"><i class="fa-solid fa-file-pdf"></i> ملف السيرة الذاتية (PDF)</div>
        <div class="grid2">
          ${field('paths.cvFile', 'رابط الملف (يُملأ تلقائياً عند الرفع)', P.cvFile, true)}
          <div class="field"><label>&nbsp;</label><button class="btn btn--primary btn--block" data-action="up-cv"><i class="fa-solid fa-cloud-arrow-up"></i> رفع ملف PDF</button></div>
        </div>
      </div>

      <div class="card">
        <div class="card__title"><i class="fa-solid fa-folder"></i> مسار الصور المحلية (اختياري ومهم فقط للصور المحلية القديمة)</div>
        ${field('paths.projectsBase', 'المسار الأساسي لصور المشاريع المحلية', P.projectsBase, true)}
        <p class="hint">عند رفع صور من اللوحة تُحفظ على Cloudinary وتُعرض مباشرة، فلا تحتاج هذا المسار إلا للصور القديمة الموجودة داخل مجلد assets.</p>
      </div>`;
  }

  // ---------- التواصل والفوتر ----------
  function renderContact(el) {
    const TYPES = [['email', 'email'], ['phone', 'phone'], ['whatsapp', 'whatsapp']];
    el.innerHTML = `
      <div class="card">
        <div class="card__title"><i class="fa-solid fa-envelope"></i> قنوات التواصل (تظهر في قسم Contact)</div>
        ${S.main.contactLinks.map((c, i) => `
          <div class="list-item">
            <div class="contact-row">
              <div class="field"><label>النوع</label>
                <select data-bind-text="main.contactLinks.${i}.type">${TYPES.map(t => `<option value="${t[0]}" ${String(c.type) === t[0] ? 'selected' : ''}>${t[1]}</option>`).join('')}</select>
              </div>
              <div class="field"><label>الأيقونة</label><input class="ltr" list="faIcons" type="text" data-bind-text="main.contactLinks.${i}.icon" value="${esc(c.icon)}"></div>
              <div class="field"><label>التسمية</label><input type="text" data-bind-text="main.contactLinks.${i}.label" value="${esc(c.label)}"></div>
            </div>
            <div class="contact-row" style="margin-top:10px">
              <div class="field"><label>القيمة المعروضة</label><input class="ltr" type="text" data-bind-text="main.contactLinks.${i}.value" value="${esc(c.value)}"></div>
              <div class="field"><label>الرابط</label><input class="ltr" type="text" data-bind-text="main.contactLinks.${i}.url" value="${esc(c.url)}"></div>
              <div class="field"><label>نص الزر (action)</label><input type="text" data-bind-text="main.contactLinks.${i}.action" value="${esc(c.action)}"></div>
            </div>
            <div class="list-item__tools">${toolBtns('mv-list', 'main.contactLinks', i)}</div>
          </div>`).join('')}
        <button class="btn btn--add" data-action="add-contact"><i class="fa-solid fa-plus"></i> إضافة قناة تواصل</button>
      </div>

      <div class="card">
        <div class="card__title"><i class="fa-solid fa-shoe-prints"></i> الفوتر</div>
        ${field('footer.text', 'نص الفوتر', S.main.footer.text)}
      </div>`;
  }

  // ---------- حقول ----------
  function field(path, label, value, ltr) {
    return `<div class="field"><label>${esc(label)}</label><input class="${ltr ? 'ltr ' : ''}" type="text" data-bind-text="${path}" value="${esc(value)}"></div>`;
  }
  function fieldArea(path, label, value) {
    return `<div class="field"><label>${esc(label)}</label><textarea data-bind-text="${path}" rows="4">${esc(value)}</textarea></div>`;
  }

  // ================================================================
  // الأحداث
  // ================================================================
  function bindEvents() {
    // التبويبات
    $$('.tab-btn').forEach(b => {
      b.addEventListener('click', () => {
        currentTab = b.dataset.tab;
        localStorage.setItem(CURRENT_TAB_KEY, currentTab);
        renderAll();
      });
    });

    // ربط الإدخالات (input / change)
    document.addEventListener('input', (e) => {
      const el = e.target;
      if (el.type === 'checkbox' || !el.dataset.bindText && !el.dataset.bindNum && !el.dataset.bindList && !el.dataset.bindCommas) return;
      if (el.dataset.bindText) setByPath(S, el.dataset.bindText, el.value);
      else if (el.dataset.bindNum) setByPath(S, el.dataset.bindNum, parseFloat(el.value) || 0);
      else if (el.dataset.bindList) setByPath(S, el.dataset.bindList, el.value.split('\n').map(x => x.trim()).filter(Boolean));
      else if (el.dataset.bindCommas) setByPath(S, el.dataset.bindCommas, el.value.split(/[,\n]+/).map(x => x.trim()).filter(Boolean));
    });

    // أزرار الأكشن (تنازلي)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action], [data-tab]');
      if (!btn) return;
      if (btn.dataset.tab) return;
      const action = btn.dataset.action;
      const idx = parseInt(btn.dataset.idx, 10);
      const img = parseInt(btn.dataset.img, 10);
      const dir = parseInt(btn.dataset.dir, 10);

      switch (action) {
        case 'add-list': addToList(btn.dataset.path, emptyFor(btn.dataset.path)); renderPanel(currentTab); break;
        case 'mv-list': moveList(btn.dataset.path, idx, dir); renderPanel(currentTab); break;
        case 'del-list': delList(btn.dataset.path, idx); renderPanel(currentTab); break;

        case 'add-badge': S.main.badges.push({ icon: 'fa-solid fa-star', label: 'بادج جديد' }); renderPanel(currentTab); break;
        case 'add-stat': S.main.stats.push({ count: 0, label: 'إحصائية جديدة' }); renderPanel(currentTab); break;
        case 'add-skill': S.main.skills.push({ icon: 'fa-solid fa-star', title: 'مهارة جديدة', items: [] }); renderPanel(currentTab); break;
        case 'add-tl': (getByPath(S, btn.dataset.path) || []).push({ date: '', title: '', company: '', details: [] }); renderPanel(currentTab); break;
        case 'add-contact': S.main.contactLinks.push({ type: 'email', icon: 'fa-solid fa-envelope', label: '', value: '', url: '', action: 'تواصل ←' }); renderPanel(currentTab); break;

        case 'add-category': {
          const label = prompt('اسم النوع الجديد (مثال: 🌿 حدائق عامة)')?.trim();
          if (!label) return;
          const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category';
          S.categories.push({ _id: null, id, label, folder: id, images: [] });
          renderPanel(currentTab);
          break;
        }
        case 'cat-move': moveArray(S.categories, idx, dir); renderPanel(currentTab); break;
        case 'cat-del': {
          if (!confirm(`حذف النوع "${(S.categories[idx] || {}).label}" وكل صوره؟`)) return;
          S.categories.splice(idx, 1);
          renderPanel(currentTab);
          break;
        }
        case 'cat-upload': uploadCategoryImages(idx); break;

        case 'img-move': {
          const imgs = S.categories[idx].images;
          moveArray(imgs, img, dir);
          renderPanel(currentTab);
          break;
        }
        case 'img-toggle': {
          const im = S.categories[idx].images[img];
          im.hidden = !im.hidden;
          renderPanel(currentTab);
          break;
        }
        case 'img-del': {
          if (!confirm('حذف هذه الصورة من الموقع؟')) return;
          S.categories[idx].images.splice(img, 1);
          renderPanel(currentTab);
          break;
        }
        case 'img-replace': replaceImage(idx, img); break;
        case 'img-cloud': convertToCloud(idx, img); break;

        case 'up-profile': uploadSingle('image/*', (url) => { S.main.paths.profileImage = url; renderPanel(currentTab); }); break;
        case 'up-cv': uploadSingle('.pdf,application/pdf', (url) => { S.main.paths.cvFile = url; renderPanel(currentTab); }, true); break;
      }
    });

    // الحفظ والنشر
    $('#saveBtn').addEventListener('click', saveAll);
    $('#syncBtn').addEventListener('click', async () => {
      if (!confirm('إعادة التحميل من Firestore؟ (سيتم تجاهل أي تعديل لم يُحفظ)')) return;
      await loadAll();
    });
    $('#logoutBtn').addEventListener('click', async () => { signedInUser = null; await window.firebase.auth().signOut(); showLogin(); });
    $('#loginBtn').addEventListener('click', doGoogleLogin);

    // نسخ احتياطي
    $('#downloadBtn').addEventListener('click', downloadBackup);
    $('#restoreBtn').addEventListener('click', () => $('#jsonInput').click());
    $('#jsonInput').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => restoreBackup(r.result);
      r.readAsText(f);
    });
  }

  function emptyFor(path) {
    if (/typingPhrases$/.test(path)) return '';
    return {};
  }

  function addToList(path, empty) {
    const arr = getByPath(S, path);
    if (Array.isArray(arr)) arr.push(Array.isArray(empty) ? [] : empty);
  }
  function moveList(path, idx, dir) {
    const arr = getByPath(S, path);
    moveArray(arr, idx, dir);
  }
  function delList(path, idx) {
    const arr = getByPath(S, path);
    if (Array.isArray(arr)) arr.splice(idx, 1);
  }
  function moveArray(arr, idx, dir) {
    if (!Array.isArray(arr) || idx == null) return;
    const j = idx + (dir === -1 ? -1 : 1);
    if (idx < 0 || j < 0 || j >= arr.length) return;
    const tmp = arr[idx];
    arr[idx] = arr[j];
    arr[j] = tmp;
  }

  // ---------- تسجيل الدخول ----------
  async function doGoogleLogin() {
    $('#loginMsg').textContent = 'جاري فتح نافذة تسجيل الدخول...';
    try {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      const res = await auth.signInWithPopup(provider);
      if (!res.user) return;
      await enterDashboard(res.user);
    } catch (err) {
      const code = err && err.code || '';
      let msg = 'تعذّر تسجيل الدخول: ' + (err.message || err);
      if (code === 'auth/operation-not-allowed') msg = 'فعّل Google Authentication من Firebase Console أولاً.';
      else if (code === 'auth/popup-blocked') msg = 'اسمح بالنوافذ المنبثقة للمتصفح ثم أعد المحاولة.';
      else if (code === 'auth/invalid-api-key') msg = 'مفتاح Firebase غير صحيح — راجع firebase-config.js.';
      $('#loginMsg').textContent = msg;
    }
  }

  // ---------- رفع الصور ----------
  function uploadCategoryImages(ci) {
    pickFiles('image/*', true, async (files) => {
      if (!files.length) return;
      if (!cloudReady) { toast('حالة Cloudinary غير مكتملة — راجع إعدادات Cloudinary أولاً', 'err'); return; }
      setProgress(5, true);
      let ok = 0, fail = 0;
      for (let i = 0; i < files.length; i++) {
        setStatus(`جاري رفع الصورة ${i + 1} من ${files.length}...`);
        try {
          const url = await window.PortfolioStore.uploadImage(files[i]);
          const title = files[i].name.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ');
          S.categories[ci].images.push({ _id: null, url, file: '', title, tags: [], hidden: false });
          ok++;
        } catch (err) { console.error(err); fail++; }
        setProgress(8 + Math.round(((i + 1) / files.length) * 90), true);
      }
      setProgress(0, false);
      renderPanel(currentTab);
      if (fail) { setStatus(`تم رفع ${ok} صورة وفشل ${fail} ❌`, 'err'); toast(`رفع ${ok} صورة، فشل ${fail} — تأكد أن preset يسمح بالرفع بدون توقيع (Unsigned)`, 'err'); }
      else { setStatus(`تم رفع ${ok} صورة إلى Cloudinary ✔`, 'ok'); toast(`تم رفع ${ok} صورة بنجاح ✔`, 'ok'); }
    });
  }

  function uploadSingle(accept, cb, raw = false) {
    pickFiles(accept, false, async (files) => {
      if (!files.length) return;
      if (!cloudReady) { toast('إعدادات Cloudinary غير مكتملة — راجع admin/README.md', 'err'); return; }
      setProgress(20, true);
      setStatus('جاري الرفع إلى Cloudinary...');
      try {
        const url = raw ? await window.PortfolioStore.uploadRaw(files[0]) : await window.PortfolioStore.uploadImage(files[0]);
        setProgress(100, true);
        cb(url);
        setStatus('تم الرفع ✔', 'ok');
        toast('تم الرفع بنجاح ✔', 'ok');
      } catch (err) {
        console.error(err);
        setStatus('فشل الرفع — راجع إعدادات Cloudinary', 'err');
        toast('فشل الرفع: ' + (err.message || err), 'err');
      } finally {
        setProgress(0, false);
      }
    });
  }

  function replaceImage(ci, ii) {
    pickFiles('image/*', false, async (files) => {
      if (!files.length) return;
      if (!cloudReady) { toast('إعدادات Cloudinary غير مكتملة', 'err'); return; }
      setProgress(20, true);
      setStatus('جاري استبدال الصورة...');
      try {
        const url = await window.PortfolioStore.uploadImage(files[0]);
        const im = S.categories[ci].images[ii];
        im.url = url;
        im.file = '';
        im.title = im.title || files[0].name.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ');
        setProgress(0, false);
        renderPanel(currentTab);
        setStatus('تم الاستبدال — لا تنسَ الحفظ والنشر ✔', 'ok');
        toast('تم استبدال الصورة ✔ (اضغط حفظ ونشر)', 'ok');
      } catch (err) { console.error(err); setProgress(0, false); toast('فشل الرفع: ' + (err.message || err), 'err'); }
    });
  }

  async function convertToCloud(ci, ii) {
    const cat = S.categories[ci];
    const im = cat.images[ii];
    if (!im.file || !cat.folder) { toast('لا توجد صورة محلية قابلة للتحويل', 'err'); return; }
    const localUrl = `../${window.PORTFOLIO_DATA.paths.projectsBase}${cat.folder}/${im.file}`;
    if (!confirm('تحويل هذه الصورة المحلية إلى Cloudinary (ستظهر في الموقع من السحابة)؟')) return;
    setProgress(15, true);
    setStatus('جاري تحويل الصورة المحلية...');
    try {
      const blob = await (await fetch(localUrl)).blob();
      const file = new File([blob], im.file, { type: blob.type || 'image/jpeg' });
      const url = await window.PortfolioStore.uploadImage(file);
      im.url = url;
      im.file = '';
      setProgress(0, false);
      renderPanel(currentTab);
      setStatus('تم التحويل ✔ (احفظ ونشر)', 'ok');
      toast('تم تحويل الصورة إلى Cloudinary', 'ok');
    } catch (err) {
      console.error(err);
      setProgress(0, false);
      toast('تعذّر تحويل الصورة (تأكد أن الموقع يعمل عبر خادم وليس file:// مباشرة)', 'err');
    }
  }

  // ================================================================
  // الحفظ والنشر
  // ================================================================
  async function saveAll() {
    const saveBtn = $('#saveBtn');
    if (!S) return;
    if (!db) { toast('Firebase غير متصل أو غير مهيأ', 'err'); return; }
    saveBtn.disabled = true;
    setStatus('جاري الحفظ والنشر...');

    try {
      // 1) البيانات الأساسية
      await window.PortfolioStore.saveMain(S.main);

      // 2) المزامنة الكاملة للفئات والصور
      const remoteCats = await window.PortfolioStore.listCategories();
      const remoteProjs = await window.PortfolioStore.listProjects();

      for (let i = 0; i < S.categories.length; i++) {
        const cat = S.categories[i];
        if (!cat._id) {
          cat._id = await window.PortfolioStore.addCategory(cat.label || cat.id || 'category', cat.folder || '');
          cat.id = cat._id;
        }
        const docId = cat._id;
        await db.collection('projectCategories').doc(docId).set({
          id: docId,
          label: cat.label || cat.id || docId,
          folder: cat.folder || '',
          order: i + 1
        }, { merge: true });

        for (let k = 0; k < (cat.images || []).length; k++) {
          const im = cat.images[k];
          const payload = {
            categoryId: docId,
            url: im.url || '',
            file: im.file || '',
            title: im.title || '',
            tags: Array.isArray(im.tags) ? im.tags : [],
            hidden: !!im.hidden,
            order: k + 1
          };
          if (im._id) await window.PortfolioStore.updateProject(im._id, payload);
          else im._id = await window.PortfolioStore.addProject(docId, payload);
        }
      }

      // 3) حذف الفئات المُزالة
      const localCatIds = new Set(S.categories.map(c => c._id).filter(Boolean));
      const deletedCats = new Set();
      for (const rc of remoteCats) {
        if (!localCatIds.has(rc._id)) {
          await window.PortfolioStore.deleteCategory(rc._id);
          deletedCats.add(rc._id);
        }
      }

      // 4) حذف الصور المُزالة أو اليتيمة
      const keepIds = new Set();
      S.categories.forEach(c => (c.images || []).forEach(im => { if (im._id) keepIds.add(im._id); }));
      for (const rp of remoteProjs) {
        if (!keepIds.has(rp._id) && !deletedCats.has(rp.categoryId)) {
          await window.PortfolioStore.deleteProject(rp._id);
        }
      }

      saveBtn.disabled = false;
      setStatus('تم الحفظ والنشر بنجاح ✔ الموقع يُحدّث تلقائياً', 'ok');
      toast('تم حفظ كل البيانات ونشرها ✔', 'ok');
    } catch (err) {
      console.error(err);
      saveBtn.disabled = false;
      let msg = err.message || String(err);
      if (/permission-denied|PERMISSION_DENIED/.test(msg)) msg = 'حدث خطأ في الصلاحيات: تأكد أنك حذّرت Firestore Rules فعلّمه بالكتابة (انظر admin/README.md)';
      setStatus('فشل الحفظ ❌', 'err');
      toast('فشل الحفظ: ' + msg, 'err');
    }
  }

  // ---------- نسخ احتياطي ----------
  function downloadBackup() {
    if (!S) return;
    const data = JSON.stringify({ main: S.main, categories: S.categories }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'portfolio-backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast('تم تنزيل النسخة الاحتياطية ✔');
  }

  function restoreBackup(text) {
    try {
      const data = JSON.parse(text);
      if (!data || !data.main) throw new Error('ملف غير صالح');
      S.main = mergeMain(staticBase(), data.main);
      S.categories = Array.isArray(data.categories)
        ? data.categories.map(c => ({
            _id: null,
            id: c.id || c._id || 'category',
            label: c.label || c.id || 'category',
            folder: c.folder || '',
            images: Array.isArray(c.images) ? c.images.map(i => ({ _id: null, url: i.url || '', file: i.file || '', title: i.title || '', tags: Array.isArray(i.tags) ? i.tags : [], hidden: !!i.hidden })) : []
          }))
        : [];
      renderPanel(currentTab);
      toast('تم استرجاع البيانات من الملف — اضغط حفظ ونشر لنشرها', 'ok');
    } catch (err) {
      toast('ملف غير صالح: ' + err.message, 'err');
    }
  }

  // ================================================================
  // التشغيل
  // ================================================================
  document.addEventListener('DOMContentLoaded', async () => {
    const ok = await initFirebase();
    if (!ok) {
      showLogin('⚠️ Firebase غير مهيأ — افتح admin/README.md واتبع خطوات الإعداد.');
      return;
    }
    if (!cloudReady) console.warn('Cloudinary غير مكتمل الإعداد.');

    const saved = localStorage.getItem(CURRENT_TAB_KEY);
    if (saved && TAB_TITLES[saved]) currentTab = saved;

    bindEvents();

    // التحقق من حالة تسجيل الدخول
    window.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const allowed = (window.ADMIN_EMAILS || []).map(x => String(x).toLowerCase().trim());
        if (allowed.length && !allowed.includes(String(user.email).toLowerCase())) {
          signedInUser = null;
          showLogin('هذا الحساب غير مصرّح له بلوحة الإدارة: ' + user.email);
          await window.firebase.auth().signOut();
          return;
        }
        await enterDashboard(user);
      } else {
        // تجاهل إشارات الخروج العابرة التي قد تأتي مباشرة بعد تسجيل الدخول
        if (!signedInUser) showLogin();
      }
    });
  });
})();