// backend/config/firebaseAdmin.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// ✅ Ambil private key dari .env, dengan guard kalau undefined
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!privateKey) {
  console.error("❌ FIREBASE_PRIVATE_KEY is missing! Check your .env or Railway variables.");
} else {
  // ✅ Parsing agar \n terbaca dengan benar
  privateKey = privateKey.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });

    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("❌ Firebase Admin initialization error:", err.message);
  }
}

export default admin;
