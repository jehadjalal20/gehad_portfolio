# 🌿 بورتفوليو المهندسة جهاد آدم — Landscape Engineer

مرحباً بكِ في ملف البورتفوليو الخاص بكِ! هذا الملف يشرح لكِ بالخطوات كيف تُضيفين، تعدلين، أو تحذفين أي محتوى في البورتفوليو بنفسك، من خلال GitHub فقط، دون الحاجة لبرامج إضافية.

---

## 📁 هيكل المشروع
📁 gehad-portfolio/
├── 📄 index.html (هيكل الصفحة)
├── 📄 style.css (التصميم والألوان)
├── 📄 script.js (الحركات والتفاعلات)
├── 📄 data.js (⚠️ كل المحتوى القابل للتغيير هنا)
├── 📄 README.md (هذا الملف)
└── 📁 assets/
├── 📁 images/
│ └── profile.jpg (صورتك الشخصية)
├── 📁 projects/
│ ├── 📁 landscape-design/ (5 صور)
│ ├── 📁 3d-renders/ (11 صورة)
│ └── 📁 tissue-culture/ (12 صورة)
└── 📁 cv/
└── Gehad_Adam_CV.pdf (سيرتك الذاتية)

text

---

## 🛠️ الأدوات التي ستحتاجينها

| الأداة |用途 |
|--------|-----|
| **GitHub Account** | لتعديل الملفات مباشرة من المتصفح |
| **متصفح (Chrome/Edge)** | لفتح GitHub وتعديل الملفات |
| **صور المشاريع** | بامتداد jpg, png, gif, webp |

---

## 📝 كيف تعدلين المحتوى؟

### 🔹 1. تغيير المعلومات الشخصية (الاسم، البريد، التليفون)

**الخطوات:**
1. اذهبي إلى ملف `data.js` في المستودع
2. اضغطي على علامة **القلم (✏️)** لتعديل الملف
3. ابحثي عن قسم `personal`:

```javascript
personal: {
  name: 'Gehad Adam',              // ← غيري الاسم هنا
  title: 'Landscape Engineer',      // ← غيري المسمى هنا
  email: 'Jehadgalal20@gmail.com',  // ← غيري البريد هنا
  phone: '+201278071170',           // ← غيري رقم الهاتف هنا
  whatsapp: '201278071170',         // ← غيري رقم الواتساب هنا
}
بعد التعديل، اضغطي على Commit changes في الأسفل

اكتبي شرحاً للتعديل (مثل "تحديث رقم الهاتف")

اضغطي Commit changes مرة أخرى

🔹 2. إضافة صورة جديدة لمشروع
الخطوات:

أولاً: رفع الصورة إلى المجلد المناسب

اذهبي إلى مجلد المشروع المناسب:

assets/projects/landscape-design/ (للتصميمات)

assets/projects/3d-renders/ (للرندر)

assets/projects/tissue-culture/ (للأنسجة)

اضغطي على Add file → Upload files

اسحبي الصورة الجديدة (أو اختاريها من جهازك)

اضغطي Commit changes

ثانياً: إضافة الصورة في ملف البيانات

افتحي data.js

ابحثي عن القسم المناسب (مثلاً landscape)

أضيفي مدخلاً جديداً في images:

javascript
{ file: 'project6.jpg', title: 'عنوان المشروع', tags: ['AutoCAD', 'SketchUp', 'Landscape'] }
اضغطي Commit changes

🔹 3. تغيير ترتيب الصور
الخطوات:

افتحي data.js

ابحثي عن الـ images في القسم المناسب

حركي المداخل (كل { file: ... }) لأعلى أو لأسفل حسب الترتيب المطلوب

اضغطي Commit changes

🔹 4. تغيير عنوان أو وصف مشروع
الخطوات:

افتحي data.js

ابحثي عن المشروع المطلوب في الـ images

غيري الـ title أو الـ tags حسب الرغبة:

javascript
{ file: 'project1.jpg', title: 'العنوان الجديد', tags: ['AutoCAD', 'SketchUp'] }
اضغطي Commit changes

🔹 5. حذف مشروع (صورة)
الخطوات:

افتحي data.js

ابحثي عن المدخل المطلوب في الـ images

احذفي السطر بالكامل

اضغطي Commit changes

ملاحظة: الصورة ستظل موجودة في المجلد، يمكنك حذفها لاحقاً من مجلد المشاريع.

🔹 6. تغيير النصوص في الصفحة
النص	مكان التعديل في data.js
النص المتحرك (تحت الاسم)	typingPhrases
وصف الهيرو	personal.description
نصوص About	about.text1 و about.text2
نص الفوتر	footer.text
مثال:

javascript
typingPhrases: [
  'Landscape Engineer',
  '2D/3D Designer',
  'Plant Tissue Culture',
  'Landscape Architecture'
]
🔹 7. تغيير المهارات
الخطوات:

افتحي data.js

ابحثي عن skills

غيري العناوين أو المهارات:

javascript
skills: [
  {
    icon: 'fa-solid fa-pen-ruler',
    title: 'Design Software',     // ← غيري العنوان هنا
    items: [
      'AutoCAD (V.Good)',        // ← غيري المهارة هنا
      'SketchUp (V.Good)',
    ]
  },
]
🔹 8. تغيير الخبرات أو إضافة خبرة جديدة
الخطوات:

افتحي data.js

ابحثي عن experiences

أضيفي مدخلاً جديداً:

javascript
{
  date: 'Jan 2026 — Present',
  title: 'المسمى الوظيفي',
  company: 'اسم الشركة',
  details: ['نقطة 1', 'نقطة 2', 'نقطة 3']
}
اضغطي Commit changes

🔹 9. تغيير صورة الملف الشخصي
الخطوات:

اذهبي إلى assets/images/profile.jpg

اضغطي على Upload files (أو Delete ثم Upload)

ارفعي الصورة الجديدة (يفضل نفس الاسم profile.jpg)

اضغطي Commit changes

🔹 10. تحديث السيرة الذاتية (CV)
الخطوات:

اذهبي إلى assets/cv/Gehad_Adam_CV.pdf

اضغطي على Upload files

ارفعي ملف الـ PDF الجديد (بنفس الاسم)

اضغطي Commit changes

🎨 تغيير الألوان (اختياري)
الخطوات:

افتحي style.css

ابحثي عن :root في بداية الملف

غيري الألوان كما يحلو لكِ:

css
:root {
  --primary: #2D8F5E;      /* ← اللون الرئيسي */
  --primary-glow: rgba(45, 143, 94, 0.3);
  --bg: #0B0F17;           /* ← لون الخلفية */
  --text: #EDEFF4;         /* ← لون النص */
}
❓ الأسئلة الشائعة
س: الصورة مش بتظهر في الموقع؟
تأكدي من أن اسم الملف مطابق لما في data.js

تأكدي من أن الامتداد صحيح (jpg, png, إلخ)

تأكدي من أن الصورة في المجلد الصحيح

س: التغييرات مش ظاهرة على الموقع؟
انتظري دقيقة أو دقيقتين حتى يعيد GitHub نشر الموقع

اضغطي Ctrl + F5 (تحديث قوي) في المتصفح

س: كيف أعرف رابط الموقع؟
اذهبي إلى Settings → Pages في المستودع

ستجدين الرابط: https://<اسم-المستخدم>.github.io/<اسم-المستودع>/

س: عايزة أضيف فئة جديدة من المشاريع؟
أضيفي مجلد جديد في assets/projects/

أضيفي مدخلاً جديداً في projects.categories داخل data.js

📋 ملخص سريع للتعديلات
التغيير المطلوب	الملف	القسم
الاسم، البريد، الهاتف	data.js	personal
إضافة/حذف مشروع	data.js	projects.categories[].images
تغيير المهارات	data.js	skills
تغيير الخبرات	data.js	experiences
تغيير الصورة الشخصية	assets/images/	profile.jpg
تغيير السيرة الذاتية	assets/cv/	Gehad_Adam_CV.pdf
تغيير الألوان	style.css	:root
🚀 رابط الموقع
بعد رفع الملفات، سيكون موقعكِ على الرابط التالي:

text
https://<اسم-المستخدم>.github.io/<اسم-المستودع>/
بالتوفيق! 🌿 إذا احتجتِ مساعدة، يمكنكِ التواصل مع المطور.

text

---

## **ملخص الملفات النهائية:**

| الملف | الوظيفة |
|-------|---------|
| `data.js` | كل المحتوى القابل للتغيير |
| `index.html` | هيكل الصفحة |
| `style.css` | التصميم والألوان |
| `script.js` | الحركات والتفاعلات |
| `README.md` | **دليل المستخدم** (هذا الملف) |

---

**كده المهندسة جهاد تقدر ترسل الملف لأي AI وتطلب منه المساعدة، والـ AI هيقرأ التعليمات ويعرف يشرح لها بالضبط!** 🚀🌿