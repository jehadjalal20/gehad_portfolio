// ================================================================
// 🛰 FIREBASE-SERVICE.JS — طبقة البيانات المشتركة
// موقع العرض (index.html) ولوحة الإدارة (admin/) كلاهما يستخدم هذا الملف.
// يعتمد على Firebase SDK (compat) المحمّل قبل هذا الملف.
// ================================================================

window.PortfolioStore = (() => {
  const CFG = window.FIREBASE_CONFIG || {};
  const configured = window.FIREBASE_CONFIGURED === true || !!(
    CFG.apiKey && !String(CFG.apiKey || '').startsWith('YOUR_')
  );

  let app = null;
  let db = null;
  let auth = null;
  let initializing = null;

  // ---------- التهيئة (مرة واحدة فقط) ----------
  function init() {
    if (!configured || app) return null;
    if (!window.firebase) return null;
    if (initializing) return initializing;
    initializing = Promise.resolve().then(() => {
      app = window.firebase.initializeApp(CFG);
      db = window.firebase.firestore(app);
      auth = window.firebase.auth(app);
      return true;
    }).catch((e) => { console.error('Firebase init failed:', e); return null; });
    return initializing;
  }

  const isConfigured = () => !!configured;
  const getDb = () => db;
  const getAuth = () => auth;

  // ---------- مساعد تنظيف البيانات للحفظ في Firestore ----------
  function toFirestoreSafe(obj) {
    return JSON.parse(JSON.stringify(obj || {}));
  }

  // ================================================================
  // قراءة كل بيانات الموقع (تطابق شكل PORTFOLIO_DATA)
  // ترجع كائن جزئي فقط، أو null إن لم يوجد شيء في Firestore.
  // ================================================================
  async function loadSiteData() {
    try { await init(); } catch (e) { console.error(e); return null; }
    if (!db) return null;

    try {
      const out = {};
      const mainSnap = await db.collection('portfolio').doc('main').get();
      const main = mainSnap.exists ? mainSnap.data() : null;

      if (main) {
        const keys = ['personal', 'typingPhrases', 'about', 'stats', 'badges', 'skills',
          'experiences', 'education', 'courses', 'contactLinks', 'footer', 'paths'];
        keys.forEach(k => { if (main[k] != null) out[k] = main[k]; });
      }

      const catDocs = [];
      const catSnap = await db.collection('projectCategories').orderBy('order', 'asc').get();
      catSnap.forEach(d => catDocs.push({ _id: d.id, ...d.data() }));

      const projDocs = [];
      const projSnap = await db.collection('projects').get();
      projSnap.forEach(d => projDocs.push({ _id: d.id, ...d.data() }));

      const categories = catDocs.map(c => ({
        id: c.id,
        label: c.label || c.id,
        folder: c.folder || '',
        images: projDocs
          .filter(p => p.categoryId === c.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(p => ({
            url: p.url || '',
            file: p.file || '',
            title: p.title || '',
            tags: Array.isArray(p.tags) ? p.tags : [],
            hidden: !!p.hidden
          }))
      }));

      if (categories.length || main) out.projects = { categories };

      return Object.keys(out).length ? out : null;
    } catch (e) {
      console.error('loadSiteData error:', e);
      return null;
    }
  }

  // ---------- حفظ البيانات الرئيسية (كل المحتوى عدا صور المشاريع) ----------
  async function saveMain(obj) {
    await init();
    if (!db) throw new Error('Firebase is not configured.');
    await db.collection('portfolio').doc('main').set(toFirestoreSafe(obj), { merge: true });
  }

  // ================================================================
  // أصناف/فئات المشاريع  (projectCategories)
  // ================================================================
  async function listCategories() {
    await init();
    const snap = await db.collection('projectCategories').orderBy('order', 'asc').get();
    const out = [];
    snap.forEach(d => out.push({ _id: d.id, ...d.data() }));
    return out;
  }

  async function addCategory(label, folder) {
    await init();
    const cats = await listCategories();
    const order = cats.length ? Math.max(...cats.map(c => c.order || 0)) + 1 : 1;
    const base = String(label || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'category';
    let id = base;
    let i = 2;
    while (cats.some(c => c.id === id)) id = `${base}-${i++}`;
    const payload = { id, label, order };
    if (folder) payload.folder = folder;
    await db.collection('projectCategories').doc(id).set(payload);
    return id;
  }

  async function renameCategory(id, label) {
    await init();
    await db.collection('projectCategories').doc(id).update({ label });
  }

  async function moveCategory(id, dir) {
    await init();
    const cats = await listCategories();
    const idx = cats.findIndex(c => c._id === id);
    const other = cats[idx + dir];
    if (idx < 0 || !other) return;
    const a = cats[idx].order || 0;
    const b = other.order || 0;
    await db.collection('projectCategories').doc(id).update({ order: b });
    await db.collection('projectCategories').doc(other._id).update({ order: a });
  }

  async function deleteCategory(id) {
    await init();
    const batch = db.batch();
    batch.delete(db.collection('projectCategories').doc(id));
    const ps = await db.collection('projects').where('categoryId', '==', id).get();
    ps.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }

  // ================================================================
  // صور/مشاريع  (projects)
  // ================================================================
  async function listProjects() {
    await init();
    const snap = await db.collection('projects').orderBy('order', 'asc').get();
    const out = [];
    snap.forEach(d => out.push({ _id: d.id, ...d.data() }));
    return out;
  }

  async function addProject(categoryId, data) {
    await init();
    const ps = await db.collection('projects').where('categoryId', '==', categoryId).get();
    let order = 1;
    if (ps.size) {
      order = ps.docs.map(d => d.data().order || 0).reduce((m, x) => Math.max(m, x), 0) + 1;
    }
    return (await db.collection('projects').add({
      categoryId,
      url: data.url || '',
      file: data.file || '',
      title: data.title || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      hidden: !!data.hidden,
      order
    })).id;
  }

  async function updateProject(id, data) {
    await init();
    const patch = {};
    if (data.url !== undefined) patch.url = data.url;
    if (data.file !== undefined) patch.file = data.file;
    if (data.title !== undefined) patch.title = data.title;
    if (data.tags !== undefined) patch.tags = Array.isArray(data.tags) ? data.tags : [];
    if (data.hidden !== undefined) patch.hidden = !!data.hidden;
    if (data.order !== undefined) patch.order = data.order;
    await db.collection('projects').doc(id).update(patch);
  }

  async function setProjectOrder(id, order) {
    await init();
    await db.collection('projects').doc(id).update({ order });
  }

  async function moveProject(id, dir) {
    await init();
    const projs = await listProjects();
    const cur = projs.find(p => p._id === id);
    if (!cur) return;
    const sibs = projs.filter(p => p.categoryId === cur.categoryId).sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sibs.findIndex(p => p._id === id);
    const other = sibs[idx + dir];
    if (!other) return;
    const a = cur.order || 0;
    const b = other.order || 0;
    await setProjectOrder(id, b);
    await setProjectOrder(other._id, a);
  }

  async function deleteProject(id) {
    await init();
    await db.collection('projects').doc(id).delete();
  }

  // ---------- ميثود رفع الصور إلى Cloudinary (تستخدمها اللوحة فقط) ----------
  const cloudReady = () => {
    const c = window.CLOUDINARY_CONFIG;
    return !!(c
      && String(c.cloudName || '').trim() && !String(c.cloudName).startsWith('YOUR_')
      && String(c.uploadPreset || '').trim() && !String(c.uploadPreset).startsWith('YOUR_'));
  };

  async function uploadImage(file) {
    if (!cloudReady()) throw new Error('Cloudinary NOT configured.');
    const c = window.CLOUDINARY_CONFIG;
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', c.uploadPreset);
    form.append('folder', 'gehad_portfolio');
    const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloudName}/image/upload`, {
      method: 'POST',
      body: form
    });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    const json = await res.json();
    return json.secure_url;
  }

  async function uploadRaw(file) {
    if (!cloudReady()) throw new Error('Cloudinary NOT configured.');
    const c = window.CLOUDINARY_CONFIG;
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', c.uploadPreset);
    form.append('folder', 'gehad_portfolio');
    const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloudName}/raw/upload`, {
      method: 'POST',
      body: form
    });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    const json = await res.json();
    return json.secure_url;
  }

  return {
    isConfigured,
    init,
    getDb,
    getAuth,
    loadSiteData,
    saveMain,
    cloudReady,
    uploadImage,
    uploadRaw,
    listCategories,
    addCategory,
    renameCategory,
    moveCategory,
    deleteCategory,
    listProjects,
    addProject,
    updateProject,
    setProjectOrder,
    moveProject,
    deleteProject,
    toFirestoreSafe
  };
})();