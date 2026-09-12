// ================================================================
// 🔐 FIREBASE-CONFIG.JS — إعدادات الحماية والصور
// ================================================================
// ⚠️ استبدلي النصوص "YOUR_..." بإعداداتك الحقيقية.
//
// الخطوات لملء هذه الإعدادات:
//  1) Firebase Console  →  https://console.firebase.google.com
//     أنشئي مشروعاً ثم أضيفي تطبيق Web (رمز </>).
//     انسخي كائن firebaseConfig كاملاً وضعيه أدناه.
//  2) فعّلي Authentication → Email/Password (وأي طريقة أخرى تحبينها).
//  3) فعّلي Firestore Database (وضع production).
//  4) Cloudinary  →  https://cloudinary.com
//     أنشئي حساباً (مجاني) ثم من Settings → Upload:
//       - add unsigned Upload Preset (بدون كلمة سر)
//       - انسخي قيمته في uploadPreset
//       - cloudName تجدينه أعلى صفحة Dashboard
// ================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCVTktjy3BrDTHBLzT903wVEGqCnvBkx1w",
  authDomain: "inventory-ee790.firebaseapp.com",
  projectId: "inventory-ee790",
  storageBucket: "inventory-ee790.appspot.com",
  messagingSenderId: "616495171701",
  appId: "1:616495171701:web:64f1910775a5db714bd03c",
  measurementId: "G-QC1T70LWPZ"
};

const CLOUDINARY_CONFIG = {
  cloudName: "nhxfnicc",
  uploadPreset: "ml_default"
};

// فلاغات تلقائية: هل تم وضع إعدادات حقيقية؟ (لا تعدلي هذا السطر)
const FIREBASE_CONFIGURED = !!(firebaseConfig.apiKey && !String(firebaseConfig.apiKey).startsWith('YOUR_'));
const CLOUDINARY_CONFIGURED = !!(CLOUDINARY_CONFIG.cloudName && !String(CLOUDINARY_CONFIG.cloudName).startsWith('YOUR_'));