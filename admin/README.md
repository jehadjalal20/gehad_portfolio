# لوحة إدارة الموقع — Gehad Adam

لوحة تحكم كاملة تعرض أياً محتويات الموقع من `data.js` وتحريرها وحفظها في **Firestore**،
مع رفع الصور والملفات إلى **Cloudinary** تلقائياً. كل شيء ديناميكي:

- تعديل كل النصوص: الشخصية، الهيرو، عني، الإحصائيات، المهارات، الخبرة، التعليم، الدورات، التواصل، الفوتر.
- **أنواع المشاريع**: إضافة / إعادة تسمية / ترتيب / حذف — تظهر فوراً في الموقع.
- **صور المشاريع**: رفع بالجمّل (اختيار متعدد)، استبدال، إخفاء/إظهار، إعادة ترتيب، حذف، وتحويل الصور المحلية القديمة إلى Cloudinary.
- صورة الملف الشخصي وملف السيرة الذاتية (PDF) تُرفع مباشرة إلى Cloudinary.

---

## 1) إعداد Firestore

في [Firebase Console](https://console.firebase.google.com) لنفس المشروع الموجود في `firebase-config.js`:

1. **Firestore Database** → إنشاء قاعدة بيانات (وضع الإنتاج).
2. **Authentication → Sign-in method → Google** → تفعيله، وأضف إيميلاتك في أقسام مطوّر الاختبار إن طُلب.
3. **Authentication → Settings → Authorized domains**:
   - `localhost` موجودة افتراضياً (تعمل محلياً).
   - أضف نطاق الموقع المنشور: `jehadjalal20.github.io`
4. **Firestore → Rules** → ضع القواعد التالية (قراءة للجميع، كتابة للأدمن فقط):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /portfolio/{doc} {
      allow read: if true;
      allow write: if request.auth != null
                    && request.auth.token.email == 'jehadjalal20@gmail.com';
    }
    match /projectCategories/{doc} {
      allow read: if true;
      allow write: if request.auth != null
                    && request.auth.token.email == 'jehadjalal20@gmail.com';
    }
    match /projects/{doc} {
      allow read: if true;
      allow write: if request.auth != null
                    && request.auth.token.email == 'jehadjalal20@gmail.com';
    }
  }
}
```

> لإضافة مزيد من الأدمن، أضفهم في `ADMIN_EMAILS` (في `../firebase-config.js`) مع تعديل القواعد أعلاه.

---

## 2) إعداد Cloudinary (لرفع الصور تلقائياً)

في [cloudinary.com](https://cloudinary.com):

1. Dashboard → انسخ **Cloud Name** وضعه في `CLOUDINARY_CONFIG.cloudName`.
2. **Settings → Upload → Unsigned presets → Add preset**:
   - الاسم: مثلاً `gehad_preset`
   - فعّل **Unsigned** (بدون توقيع حتى يعمل الرفع من المتصفح مباشرة).
   - اترك **Folder** فارغاً أو حدد `gehad_portfolio`.
   - انسخ اسم الـ preset في `CLOUDINARY_CONFIG.uploadPreset`.
3. احفظ الملف وافتح اللوحة من جديد.

> ملحوظة: لا توجد طريقة آمنة لـ "حذف الملف من Cloudinary" عبر الرفع Unsigned —
> حذف الصورة من اللوحة يزيلها من الموقع فقط. لحذف الملف نهائياً من مكتبتك، احذفه من Cloudinary Media Library يدوياً.

---

## 3) الإعداد المحلي

```
npx serve .
```

ثم افتح: `http://localhost:3000/admin/`

> ⚠️ لا تفتح الملف بـ file:// مباشرة لأن تسجيل الدخول بحساب Google قد يفشل.

---

## 4) أين تُفتح اللوحة بعد النشر؟

```
https://jehadjalal20.github.io/gehad_portfolio/admin/
```

**الموقع العام (يقرأ تلقائياً من Firestore):**
```
https://jehadjalal20.github.io/gehad_portfolio/
```

أي حفظ من اللوحة = تحديث فوري للموقع بعد بضعة ثوانٍ (دون الحاجة لرفع ملفات).

---

## 5) كيف يعمل الحفظ؟ (اختياري معرفته)

اللوحة تحفظ على **محركات**:

| الجانب | المكان |
|---|---|
| النصوص/البيانات | مستند `portfolio/main` في Firestore |
| أنواع المشاريع | مجموعة `projectCategories` |
| صور المشاريع | مجموعة `projects` (كل صورة مستند مرتبط بفئة) |
| ملفات الصور | Cloudinary (روابط في Firestore) |

وعند الحفظ تعمل مزامنة كاملة: إنشاء/تحديث في مكانه، وحذف أي فئة أو صورة أردت إزالتها.

## 6) نسخ احتياطي

استخدم زر **"نسخة احتياطية"** (يحفظ JSON كامل)، وزر **"استرجاع"** لإعادته.
الملفات الاحتياطية تنزل على جهازك وهي آمنة للمشاركة.