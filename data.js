// ================================================================
// 📁 DATA.JS — كل البيانات القابلة للتغيير
// ================================================================
// ملاحظة: var وليس const حتى تظهر البيانات في window.PORTFOLIO_DATA
// وتصل إليها لوحة الإدارة (admin) وملف البيانات الاحتياطي.
var PORTFOLIO_DATA = {
  
  // ---------- المعلومات الشخصية ----------
  personal: {
    name: 'Gehad Adam',
    title: 'Landscape Engineer',
    tagline: '🌿 Landscape Engineer',
    description: 'Landscape Engineer specializing in 2D/3D design, plant tissue culture, and landscape architecture. Turning green spaces into living art.',
    email: 'Jehadgalal20@gmail.com',
    phone: '+201278071170',
    whatsapp: '201278071170',
    location: 'Qalyubia, Egypt',
  },

  // ---------- النصوص المتحركة (تأثير الكتابة) ----------
  typingPhrases: [
    'Landscape Engineer',
    '2D/3D Designer',
    'Plant Tissue Culture',
    'Landscape Architecture'
  ],

  // ---------- النصوص في About ----------
  about: {
    text1: "I'm Gehad Adam, a Landscape Engineer with a passion for transforming outdoor spaces into sustainable, beautiful environments. With a background in plant production and tissue culture, I bring a unique botanical perspective to every project.",
    text2: 'Currently working as a Designer and Technical Office Engineer at MS Landscape Company, I specialize in 2D/3D design, technical plant specification, and project documentation.'
  },

  // ---------- الإحصائيات ----------
  stats: [
    { count: 4, label: 'Years Experience' },
    { count: 20, label: 'Projects' },
    { count: 5, label: 'Software Skills' }
  ],

  // ---------- البادجات (الشارات في الهيرو) ----------
  badges: [
    { icon: 'fa-solid fa-pen-ruler', label: '2D/3D Design' },
    { icon: 'fa-solid fa-seedling', label: 'Tissue Culture' },
    { icon: 'fa-solid fa-tree', label: 'Landscape Architecture' }
  ],

  // ---------- المهارات ----------
  skills: [
    {
      icon: 'fa-solid fa-pen-ruler',
      title: 'Design Software',
      items: ['AutoCAD (V.Good)', 'SketchUp (V.Good)', 'Lumion 8 (V.Good)', 'Photoshop (V.Good)']
    },
    {
      icon: 'fa-solid fa-file-lines',
      title: 'Technical Office',
      items: ['Shop Drawings', 'As-Builts', 'Submittals', 'Document Control']
    },
    {
      icon: 'fa-solid fa-microscope',
      title: 'Tissue Culture',
      items: ['Micropropagation', 'Sterilization Techniques', 'Acclimatization', 'Plant Laboratory Work']
    },
    {
      icon: 'fa-solid fa-plant-wilt',
      title: 'Landscape Design',
      items: ['Plant Specifications', 'Hardscape Design', 'Softscape Design', 'Irrigation Planning']
    },
    {
      icon: 'fa-regular fa-file-excel',
      title: 'Microsoft Office',
      items: ['Excel (V.Good)', 'Word (V.Good)', 'PowerPoint (V.Good)', 'Presentation Management']
    },
    {
      icon: 'fa-solid fa-language',
      title: 'Languages',
      items: ['Arabic: Native', 'English: Intermediate']
    }
  ],

  // ---------- الخبرات ----------
  experiences: [
    {
      date: 'Nov 2025 — Present',
      title: 'Designer & Technical Office Engineer',
      company: 'MS Landscape Company',
      details: ['2D/3D landscape design and technical plant specification', 'Shop drawings, submittals, and as-built documentation']
    },
    {
      date: 'May 2025 — Sep 2025',
      title: 'Lab Engineer',
      company: 'Egyptian Holland Tissue Culture Lab',
      details: ['Plant tissue culture practices for palm trees', 'Micropropagation techniques and lab protocols']
    },
    {
      date: 'Aug 2024 — Feb 2025',
      title: 'Tele Sales & Call Center',
      company: 'Phyto Bio Chem Company',
      details: ['Tele sales and customer service training']
    },
    {
      date: 'Feb 2024 — Mar 2024',
      title: 'Lab Engineer (Training)',
      company: 'GreenTissue Lab',
      details: ['Trained in plant tissue culture techniques']
    }
  ],

  // ---------- التعليم ----------
  education: [
    {
      date: '2019 — 2023',
      title: 'Bachelor of Agricultural Sciences',
      company: 'Banha University — Horticulture',
      details: ['Grade: Very Good', 'Graduation Project: Plant Tissue Culture — Excellent']
    }
  ],

  // ---------- الدورات ----------
  courses: [
    {
      date: 'May 2024 — Sep 2024',
      title: 'Engineer Technical Office Course',
      company: 'Aghakhan Training Center',
      details: ['AutoCAD, Submittal, Shop Drawing, As-Builts, Document Control']
    },
    {
      date: 'Sep 2022 — Nov 2022',
      title: 'Landscape Architecture Course',
      company: 'Arvil Group Construction & Training Company',
      details: []
    }
  ],

  // ---------- المشاريع (الصور) ----------
  projects: {
    categories: [
      // ---------- الفئة الأولى: 5 صور ----------
      {
        id: 'landscape',
        label: '🌳 Landscape Design',
        folder: 'landscape-design',
        images: [
          { file: 'project1.jpeg', title: 'Residential Garden Design', tags: ['AutoCAD', 'SketchUp', 'Landscape'] },
          { file: 'project2.jpeg', title: 'Public Park Design', tags: ['AutoCAD', 'Lumion', 'Public Space'] },
          { file: 'project3.jpeg', title: 'Commercial Landscape', tags: ['AutoCAD', 'SketchUp', 'Commercial'] },
          { file: 'project4.jpeg', title: 'Rooftop Garden Design', tags: ['AutoCAD', 'SketchUp', 'Urban'] },
          { file: 'project5.jpeg', title: 'Botanical Garden Layout', tags: ['AutoCAD', 'Lumion', 'Botanical'] }
        ]
      },

      // ---------- الفئة الثانية: 11 صورة ----------
      {
        id: '3d',
        label: '🎨 3D Renders',
        folder: '3d-renders',
        images: [
          { file: 'project1.jpeg', title: 'Villa Landscape 3D Render', tags: ['SketchUp', 'Lumion', '3D Render'] },
          { file: 'project2.jpeg', title: 'Urban Garden Visualization', tags: ['Lumion', 'Photoshop', 'Urban Design'] },
          { file: 'project3.jpeg', title: 'Pool & Outdoor Living Area', tags: ['SketchUp', 'Lumion', 'Resort'] },
          { file: 'project4.jpeg', title: 'Night View Garden Render', tags: ['Lumion', 'Lighting', 'Night'] },
          { file: 'project5.jpeg', title: 'Water Feature Visualization', tags: ['SketchUp', 'Lumion', 'Water'] },
          { file: 'project6.jpeg', title: 'Commercial Plaza 3D', tags: ['Lumion', 'Commercial', 'Urban'] },
          { file: 'project7.jpeg', title: 'Villa Entrance Design', tags: ['SketchUp', 'Lumion', 'Villa'] },
          { file: 'project8.jpeg', title: 'Parking Lot Landscape', tags: ['AutoCAD', 'Lumion', 'Parking'] },
          { file: 'project9.jpeg', title: 'Courtyard Visualization', tags: ['Lumion', 'Courtyard', 'Seating'] },
          { file: 'project10.jpeg', title: 'Street Landscape Render', tags: ['Lumion', 'Street', 'Urban'] },
          { file: 'project11.jpeg', title: 'Resort Pool Area', tags: ['SketchUp', 'Lumion', 'Resort'] }
        ]
      },

      // ---------- الفئة الثالثة: 12 صورة ----------
      {
        id: 'tissue',
        label: '🧪 Tissue Culture',
        folder: 'tissue-culture',
        images: [
          { file: 'project1.jpeg', title: 'Palm Tree Micropropagation', tags: ['Tissue Culture', 'Micropropagation', 'Palm Trees'] },
          { file: 'project2.jpeg', title: 'GreenTissue Lab Training', tags: ['Tissue Culture', 'Lab Training'] },
          { file: 'project3.jpeg', title: 'Sterilization Techniques', tags: ['Tissue Culture', 'Sterilization'] },
          { file: 'project4.jpeg', title: 'Subculturing Process', tags: ['Tissue Culture', 'Subculturing'] },
          { file: 'project5.jpeg', title: 'Acclimatization Phase', tags: ['Tissue Culture', 'Acclimatization'] },
          { file: 'project6.jpeg', title: 'Lab Equipment Setup', tags: ['Tissue Culture', 'Lab Equipment'] },
          { file: 'project7.jpeg', title: 'Culture Media Preparation', tags: ['Tissue Culture', 'Media Preparation'] },
          { file: 'project8.jpeg', title: 'Plant Growth Monitoring', tags: ['Tissue Culture', 'Growth Monitoring'] },
          { file: 'project9.jpeg', title: 'Root Induction Process', tags: ['Tissue Culture', 'Root Induction'] },
          { file: 'project10.jpeg', title: 'Shoot Multiplication', tags: ['Tissue Culture', 'Shoot Multiplication'] },
          { file: 'project11.jpeg', title: 'Hardening Process', tags: ['Tissue Culture', 'Hardening'] },
          { file: 'project12.jpeg', title: 'Tissue Culture Research', tags: ['Tissue Culture', 'Research'] }
        ]
      }
    ]
  },

  // ---------- مسارات الملفات ----------
  paths: {
    profileImage: 'assets/images/profile.jpeg',
    cvFile: 'assets/cv/Gehad_Adam_CV.pdf',
    projectsBase: 'assets/projects/'
  },

  // ---------- روابط التواصل (للضغط) ----------
  contactLinks: [
    {
      type: 'whatsapp',
      icon: 'fa-brands fa-whatsapp',
      label: 'WhatsApp',
      value: '+20 127 807 1170',
      url: 'https://wa.me/201278071170?',
      action: 'Chat now →'
    },
    {
      type: 'email',
      icon: 'fa-solid fa-envelope',
      label: 'Email',
      value: 'Jehadgalal20@gmail.com',
      url: 'mailto:Jehadgalal20@gmail.com',
      action: 'Send email →'
    },
    {
      type: 'phone',
      icon: 'fa-solid fa-phone',
      label: 'Phone',
      value: '+20 127 807 1170',
      url: 'tel:+201278071170',
      action: 'Call now →'
    }
  ],

  // ---------- معلومات الفوتر ----------
  footer: {
    text: 'Gehad Adam — Landscape Engineer'
  }
};