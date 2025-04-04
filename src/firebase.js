import admin from "firebase-admin";

const serviceAccountBase64 = process.env.FIREBASE_CREDENTIALS_BASE64;


const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, "base64").toString("utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };
